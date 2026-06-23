from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from models import Salon
from database import db
from bson import ObjectId
from datetime import datetime
from zoneinfo import ZoneInfo
import re


# ── Helpers ──────────────────────────────────────────────────────────────────

def calculate_is_open(opening_hours) -> Optional[bool]:
    """
    Determine if a salon is currently open.
    Accepts both the new dict format {"Monday": "9:00 AM – 9:00 PM"}
    and the legacy string format "09:00 - 21:00".
    """
    if not opening_hours:
        return None
    try:
        ist = ZoneInfo("Asia/Kolkata")
        now = datetime.now(ist)
        current_time_24 = now.strftime("%H:%M")
        day_name = now.strftime("%A")  # e.g. "Monday"

        hours_str = None

        # New dict format
        if isinstance(opening_hours, dict):
            hours_str = opening_hours.get(day_name)
        # Legacy string format
        elif isinstance(opening_hours, str):
            hours_str = opening_hours

        if not hours_str or hours_str.lower() == "closed":
            return False

        # Parse "9:00 AM – 9:00 PM" or "09:00 - 21:00"
        # Try 24h first
        match_24 = re.search(r"(\d{2}:\d{2})\s*[-–]\s*(\d{2}:\d{2})", hours_str)
        if match_24:
            open_t, close_t = match_24.groups()
            return open_t <= current_time_24 <= close_t

        # Try 12h format: "9:00 AM – 9:00 PM"
        match_12 = re.search(
            r"(\d{1,2}:\d{2}\s*[AP]M)\s*[-–]\s*(\d{1,2}:\d{2}\s*[AP]M)",
            hours_str, re.IGNORECASE
        )
        if match_12:
            fmt = "%I:%M %p"
            try:
                open_dt = datetime.strptime(match_12.group(1).strip().upper(), fmt)
                close_dt = datetime.strptime(match_12.group(2).strip().upper(), fmt)
                open_t = open_dt.strftime("%H:%M")
                close_t = close_dt.strftime("%H:%M")
                return open_t <= current_time_24 <= close_t
            except ValueError:
                pass

        return None
    except Exception:
        return None


def mongo_to_salon(doc: dict) -> dict:
    """Normalize a raw MongoDB document for the Salon response model."""
    doc["is_open_now"] = calculate_is_open(doc.get("opening_hours"))
    return doc


# ── Router ───────────────────────────────────────────────────────────────────

class ReviewSubmit(BaseModel):
    author: str
    rating: int
    text: str


router = APIRouter(prefix="/api/salons", tags=["salons"])


@router.get("/sync-status")
async def get_sync_status():
    """
    Returns the timestamp of the most recently scraped/fetched salon record.
    Used by the frontend to show "Last synced: X minutes ago".
    """
    pipeline = [
        {"$match": {"scraped_at": {"$exists": True, "$ne": None}}},
        {"$group": {"_id": None, "last_scraped": {"$max": "$scraped_at"}}},
    ]
    cursor = db.salons.aggregate(pipeline)
    result = await cursor.to_list(length=1)
    if result and result[0].get("last_scraped"):
        return {"last_scraped": result[0]["last_scraped"].isoformat()}
    return {"last_scraped": None}


@router.get("/localities", response_model=List[str])
async def get_localities():
    """Return a sorted list of distinct localities from active salons in the DB."""
    localities = await db.salons.distinct("locality", {"is_active": True})
    return sorted([loc for loc in localities if loc])


@router.get("/", response_model=List[Salon])
async def get_salons(
    # Filter params
    locality: Optional[List[str]] = Query(None),
    service: Optional[str] = None,
    price_band: Optional[List[str]] = Query(None),
    rating_min: Optional[float] = Query(None, ge=0, le=5),
    verified_only: Optional[bool] = Query(None),
    open_now: Optional[bool] = Query(None),
    # Search (full text across name, locality, services)
    q: Optional[str] = Query(None),
    # Pagination
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
):
    """
    List salons with rich filtering and pagination.

    Filters:
      - locality[]        Comma or multi-value list of localities
      - service           Search within service names
      - price_band[]      budget | mid | premium
      - rating_min        Minimum rating_avg (0–5)
      - verified_only     If true, only return is_verified=True salons
      - open_now          If true, only return salons currently open
      - q                 Free-text search across name, locality, services

    Pagination:
      - page              Page number (default: 1)
      - page_size         Items per page (default: 25, max: 100)
    """
    query: dict = {"is_active": True}

    # ── Filters ──────────────────────────────────────────────────
    if locality:
        query["locality"] = {"$in": locality}

    if price_band:
        query["price_band"] = {"$in": price_band}

    if rating_min is not None:
        query["rating_avg"] = {"$gte": rating_min}

    if verified_only:
        query["is_verified"] = True

    # ── Text search ──────────────────────────────────────────────
    search_term = q or service
    if search_term:
        regex = {"$regex": search_term, "$options": "i"}
        query["$or"] = [
            {"name": regex},
            {"locality": regex},
            {"services.name": regex},
            {"description": regex},
        ]

    # ── Fetch with pagination ────────────────────────────────────
    skip = (page - 1) * page_size
    salons_cursor = (
        db.salons.find(query)
        .sort("rating_avg", -1)      # Default: highest-rated first
        .skip(skip)
        .limit(page_size)
    )
    salons = await salons_cursor.to_list(length=page_size)

    # ── Compute is_open_now in Python (MongoDB can't know IST time) ──
    result = []
    for s in salons:
        s["is_open_now"] = calculate_is_open(s.get("opening_hours"))
        # Filter open_now AFTER computing (can't do in Mongo without pipeline)
        if open_now is True and s["is_open_now"] is not True:
            continue
        if open_now is False and s["is_open_now"] is not False:
            continue
        result.append(s)

    return result


@router.get("/{salon_id}", response_model=Salon)
async def get_salon(salon_id: str):
    if not ObjectId.is_valid(salon_id):
        raise HTTPException(status_code=400, detail="Invalid salon ID")
    salon = await db.salons.find_one({"_id": ObjectId(salon_id)})
    if not salon:
        raise HTTPException(status_code=404, detail="Salon not found")
    salon["is_open_now"] = calculate_is_open(salon.get("opening_hours"))
    return salon


@router.get("/{salon_id}/slots")
async def get_salon_slots(
    salon_id: str,
    date: Optional[str] = None,
    service_id: Optional[str] = None
):
    if not ObjectId.is_valid(salon_id):
        raise HTTPException(status_code=400, detail="Invalid salon ID")
    return [
        {"start": "2026-06-20T10:00:00Z", "end": "2026-06-20T11:00:00Z", "stylist_id": "s1"},
        {"start": "2026-06-20T11:00:00Z", "end": "2026-06-20T12:00:00Z", "stylist_id": "s2"},
        {"start": "2026-06-20T14:00:00Z", "end": "2026-06-20T15:00:00Z", "stylist_id": "s1"},
    ]


@router.post("/{salon_id}/reviews")
async def add_salon_review(salon_id: str, review: ReviewSubmit):
    if not ObjectId.is_valid(salon_id):
        raise HTTPException(status_code=400, detail="Invalid salon ID")

    new_review = {
        "author": review.author,
        "rating": review.rating,
        "text": review.text,
        "time": "Just now",
        "profile_photo": "",
    }

    result = await db.salons.update_one(
        {"_id": ObjectId(salon_id)},
        {"$push": {"google_reviews": {"$each": [new_review], "$position": 0}}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Salon not found")

    return {"message": "Review added successfully", "review": new_review}
