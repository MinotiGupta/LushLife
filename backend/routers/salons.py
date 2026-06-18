from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from models import Salon
from database import db
from bson import ObjectId
from datetime import datetime
from zoneinfo import ZoneInfo
import re

def calculate_is_open(opening_hours_str: Optional[str]) -> Optional[bool]:
    if not opening_hours_str:
        return None
    try:
        ist = ZoneInfo('Asia/Kolkata')
        now = datetime.now(ist)
        current_time_str = now.strftime('%H:%M')
        
        time_match = re.search(r'(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})', opening_hours_str)
        if time_match:
            open_time, close_time = time_match.groups()
            return open_time <= current_time_str <= close_time
            
        return None
    except Exception:
        return None

class ReviewSubmit(BaseModel):
    author: str
    rating: int
    text: str

router = APIRouter(prefix="/api/salons", tags=["salons"])

@router.get("/", response_model=List[Salon])
async def get_salons(
    locality: Optional[List[str]] = Query(None),
    service: Optional[str] = None,
    price_band: Optional[List[str]] = Query(None),
    rating_min: Optional[float] = None
):
    query = {"is_active": True}
    if locality:
        query["locality"] = {"$in": locality}
    if price_band:
        query["price_band"] = {"$in": price_band}
    if rating_min is not None:
        query["rating_avg"] = {"$gte": rating_min}
    if service:
        query["services.name"] = {"$regex": service, "$options": "i"}
        
    salons_cursor = db.salons.find(query).limit(100)
    salons = await salons_cursor.to_list(length=100)
    for salon in salons:
        salon["is_open_now"] = calculate_is_open(salon.get("opening_hours"))
    return salons

@router.get("/localities", response_model=List[str])
async def get_localities():
    """Return a sorted list of distinct localities from active salons in the DB."""
    localities = await db.salons.distinct("locality", {"is_active": True})
    return sorted([l for l in localities if l])

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
async def get_salon_slots(salon_id: str, date: Optional[str] = None, service_id: Optional[str] = None):
    # Dummy implementation for MVP / 48-hr build
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
        "profile_photo": ""
    }
    
    result = await db.salons.update_one(
        {"_id": ObjectId(salon_id)},
        {"$push": {"google_reviews": {"$each": [new_review], "$position": 0}}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Salon not found")
        
    return {"message": "Review added successfully", "review": new_review}
