"""
fetch_salons.py (Enhanced)
──────────────────────────
Fetches REAL salon data from Google Places API and upserts into MongoDB.

Requires: GOOGLE_PLACES_API_KEY in .env

Improvements over original:
  - Uses upsert on google_place_id (no more dropping the collection)
  - Stores opening_hours as a proper per-day dict
  - Stores phone_number, address_full, thumbnail_url, is_verified, scraped_at
  - Covers more Hyderabad localities (16 search queries)
  - Prints a summary at the end (inserted / updated / failed)
"""

import asyncio
import os
import time
import requests
import uuid
from datetime import datetime, timezone
from database import db, client
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GOOGLE_PLACES_API_KEY")
if not API_KEY:
    print("ERROR: Set GOOGLE_PLACES_API_KEY in your .env file")
    print("Get one at: https://console.cloud.google.com/apis/credentials")
    print("Enable: Places API (or Places API (New))")
    exit(1)

# ── Config ──────────────────────────────────────────────────────────────────
SEARCH_QUERIES = [
    "beauty salon in Banjara Hills Hyderabad",
    "beauty salon in Jubilee Hills Hyderabad",
    "beauty salon in Gachibowli Hyderabad",
    "beauty salon in Kondapur Hyderabad",
    "beauty salon in Madhapur Hyderabad",
    "beauty salon in Ameerpet Hyderabad",
    "beauty salon in Kukatpally Hyderabad",
    "beauty salon in Himayatnagar Hyderabad",
    "beauty salon in Secunderabad Hyderabad",
    "beauty salon in Begumpet Hyderabad",
    "beauty salon in Somajiguda Hyderabad",
    "beauty salon in Miyapur Hyderabad",
    "beauty salon in Manikonda Hyderabad",
    "beauty salon in Tolichowki Hyderabad",
    "beauty salon in Financial District Hyderabad",
    "bridal makeup salon Hyderabad",
]

HYDERABAD_LOCALITIES = [
    "Banjara Hills", "Jubilee Hills", "Gachibowli", "Kondapur",
    "Madhapur", "Ameerpet", "Kukatpally", "Himayatnagar",
    "Secunderabad", "Begumpet", "Somajiguda", "Miyapur",
    "Manikonda", "Tolichowki", "Attapur", "Dilsukhnagar",
    "LB Nagar", "Uppal", "KPHB", "Financial District",
]

# Day name → index map (Google returns weekday_text with English day names)
DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]


# ── Google Places API helpers ────────────────────────────────────────────────

def text_search(query, max_results=5):
    """Search for places using Text Search."""
    url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    params = {"query": query, "key": API_KEY, "type": "beauty_salon"}
    try:
        resp = requests.get(url, params=params, timeout=10)
        data = resp.json()
        if data.get("status") != "OK":
            print(f"  Search failed: {data.get('status')} — {data.get('error_message', '')}")
            return []
        return data.get("results", [])[:max_results]
    except Exception as e:
        print(f"  Network error during text_search: {e}")
        return []


def get_place_details(place_id):
    """Get detailed info for a single place including phone, opening hours."""
    url = "https://maps.googleapis.com/maps/api/place/details/json"
    params = {
        "place_id": place_id,
        "key": API_KEY,
        "fields": (
            "name,formatted_address,formatted_phone_number,geometry,rating,"
            "user_ratings_total,reviews,photos,opening_hours,price_level,"
            "business_status,types,editorial_summary,website,place_id"
        ),
    }
    try:
        resp = requests.get(url, params=params, timeout=10)
        data = resp.json()
        if data.get("status") != "OK":
            print(f"  Details failed: {data.get('status')}")
            return None
        return data.get("result")
    except Exception as e:
        print(f"  Network error during get_place_details: {e}")
        return None


def get_photo_url(photo_ref, max_width=800):
    """Build a Google Places photo URL."""
    return (
        f"https://maps.googleapis.com/maps/api/place/photo"
        f"?maxwidth={max_width}&photo_reference={photo_ref}&key={API_KEY}"
    )


# ── Data transformation helpers ──────────────────────────────────────────────

def detect_locality(address: str) -> str:
    """Try to match a known Hyderabad locality from the address string."""
    if not address:
        return "Hyderabad"
    for loc in HYDERABAD_LOCALITIES:
        if loc.lower() in address.lower():
            return loc
    return "Hyderabad"


def derive_price_band(price_level, rating) -> str:
    """Map Google's price_level (0–4) to our bands."""
    if price_level is not None:
        if price_level >= 3:
            return "premium"
        if price_level >= 2:
            return "mid"
        return "budget"
    # Fallback: higher-rated salons tend to be pricier
    if rating and rating >= 4.5:
        return "premium"
    if rating and rating >= 4.0:
        return "mid"
    return "budget"


def parse_opening_hours(hours_obj: dict) -> dict | None:
    """
    Convert Google's opening_hours.weekday_text into a clean dict:
    {
        "Monday": "9:00 AM – 9:00 PM",
        "Tuesday": "9:00 AM – 9:00 PM",
        ...
    }
    """
    if not hours_obj:
        return None
    weekday_text = hours_obj.get("weekday_text", [])
    result = {}
    for entry in weekday_text:
        # Google format: "Monday: 9:00 AM – 9:00 PM" or "Monday: Closed"
        if ":" in entry:
            day, _, hours = entry.partition(":")
            result[day.strip()] = hours.strip()
    return result if result else None


def build_sentiment(reviews: list) -> str:
    """Simple keyword-based sentiment summary from top reviews."""
    sentiments = []
    keywords = {
        "clean": "clean", "friendly": "friendly", "staff": "friendly",
        "professional": "professional", "expensive": "pricey",
        "pricey": "pricey", "quick": "quick", "fast": "quick",
        "luxury": "luxurious", "premium": "luxurious", "hygien": "hygienic",
        "bridal": "bridal specialist", "makeup": "makeup expert",
    }
    for review in reviews[:5]:
        text = (review.get("text") or "").lower()
        for kw, label in keywords.items():
            if kw in text and label not in sentiments:
                sentiments.append(label)
    return ", ".join(sentiments[:4]) or "professional, reliable, clean"


DEFAULT_SERVICES = {
    "budget": [
        {"name": "Women's Haircut", "category": "hair", "duration_min": 30, "price": 400},
        {"name": "Men's Haircut", "category": "grooming", "duration_min": 25, "price": 250},
        {"name": "Basic Facial", "category": "skin", "duration_min": 45, "price": 700},
        {"name": "Threading (Full Face)", "category": "grooming", "duration_min": 15, "price": 100},
        {"name": "Full Arms Waxing", "category": "skin", "duration_min": 30, "price": 400},
    ],
    "mid": [
        {"name": "Women's Haircut & Blow Dry", "category": "hair", "duration_min": 45, "price": 800},
        {"name": "Hair Spa Treatment", "category": "hair", "duration_min": 60, "price": 1500},
        {"name": "Classic Facial", "category": "skin", "duration_min": 60, "price": 1200},
        {"name": "Hair Colour (Global)", "category": "hair", "duration_min": 90, "price": 3000},
        {"name": "Manicure + Pedicure", "category": "nails", "duration_min": 75, "price": 1200},
        {"name": "Pre-Bridal Package", "category": "bridal", "duration_min": 180, "price": 8000},
    ],
    "premium": [
        {"name": "Signature Haircut & Styling", "category": "hair", "duration_min": 60, "price": 1500},
        {"name": "Balayage / Ombré Colour", "category": "hair", "duration_min": 150, "price": 7000},
        {"name": "Keratin Smoothening", "category": "hair", "duration_min": 150, "price": 6000},
        {"name": "HydraFacial / Luxury Facial", "category": "skin", "duration_min": 75, "price": 3000},
        {"name": "Bridal Makeup Package", "category": "bridal", "duration_min": 180, "price": 20000},
        {"name": "Gel Manicure + Pedicure", "category": "nails", "duration_min": 90, "price": 2500},
        {"name": "Full Body Spa", "category": "skin", "duration_min": 120, "price": 5000},
    ],
}


def transform_place(details: dict) -> dict:
    """Convert Google Place details into the LushLife Salon schema."""
    name = details.get("name", "Unknown Salon")
    address = details.get("formatted_address", "Hyderabad")
    locality = detect_locality(address)
    rating = details.get("rating", 0) or 0
    price_band = derive_price_band(details.get("price_level"), rating)
    geo = details.get("geometry", {}).get("location", {})
    google_reviews_raw = details.get("reviews") or []

    # ── Photos ────────────────────────────────────────────────────
    photos = []
    for p in (details.get("photos") or [])[:4]:
        ref = p.get("photo_reference")
        if ref:
            photos.append({
                "url": get_photo_url(ref),
                "ai_tags": ["salon", locality.lower().replace(" ", "-")],
            })
    if not photos:
        photos = [{"url": "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80", "ai_tags": ["salon"]}]

    thumbnail_url = photos[0]["url"] if photos else None

    # ── Services ──────────────────────────────────────────────────
    services = []
    for svc in DEFAULT_SERVICES.get(price_band, DEFAULT_SERVICES["mid"]):
        services.append({
            "service_id": str(uuid.uuid4())[:8],
            **svc,
            "stylist_ids": [],
        })

    # ── Opening hours ─────────────────────────────────────────────
    hours_obj = details.get("opening_hours") or {}
    hours_dict = parse_opening_hours(hours_obj)
    is_open = hours_obj.get("open_now", True)

    # ── Reviews ───────────────────────────────────────────────────
    google_reviews = [
        {
            "author": r.get("author_name", "Anonymous"),
            "rating": r.get("rating", 5),
            "text": r.get("text", ""),
            "time": r.get("relative_time_description", ""),
            "profile_photo": r.get("profile_photo_url", ""),
        }
        for r in google_reviews_raw[:5]
    ]

    now_utc = datetime.now(timezone.utc)

    return {
        # Identity
        "google_place_id": details.get("place_id"),
        "name": name,
        "owner_id": f"google_{(details.get('place_id') or 'unknown')[:12]}",
        # Location
        "locality": locality,
        "location": {
            "type": "Point",
            "coordinates": [geo.get("lng", 78.47), geo.get("lat", 17.38)],
        },
        "address_full": address,
        # Contact
        "phone_number": details.get("formatted_phone_number") or "",
        "website": details.get("website") or "",
        # Description
        "description": (
            (details.get("editorial_summary") or {}).get("overview")
            or f"{name} — a popular beauty salon in {locality}, Hyderabad."
        ),
        # Services / Media
        "services": services,
        "stylists": [],
        "photos": photos,
        "thumbnail_url": thumbnail_url,
        # Ratings
        "rating_avg": rating,
        "review_count": details.get("user_ratings_total", 0) or 0,
        "sentiment_summary": build_sentiment(google_reviews_raw),
        # Quality indicators
        "embedding": [],
        "price_band": price_band,
        "is_active": is_open,
        "is_verified": True,   # All Google Places listings treated as verified
        "is_trusted": False,
        # Hours
        "opening_hours": hours_dict,
        "is_open_now": is_open,
        # Reviews
        "google_reviews": google_reviews,
        # Metadata
        "scraped_at": now_utc,
        "last_updated": now_utc,
    }


# ── Main ─────────────────────────────────────────────────────────────────────

async def fetch_and_upsert(dry_run: bool = False, max_queries: int | None = None):
    """
    Fetch salons from Google Places and upsert into MongoDB.

    Args:
        dry_run: If True, fetches data but does not write to DB.
        max_queries: Limit number of search queries (for testing).
    """
    seen_place_ids: set[str] = set()
    stats = {"total": 0, "inserted": 0, "updated": 0, "failed": 0}
    start_time = time.time()

    queries = SEARCH_QUERIES[:max_queries] if max_queries else SEARCH_QUERIES

    for query in queries:
        print(f"\n🔍 Searching: {query}")
        results = text_search(query, max_results=5)
        print(f"   Found {len(results)} candidates")

        for place in results:
            pid = place.get("place_id")
            if not pid or pid in seen_place_ids:
                continue
            seen_place_ids.add(pid)
            stats["total"] += 1

            # Polite delay to avoid rate-limiting (1 req/sec is well within quota)
            time.sleep(0.5)

            details = get_place_details(pid)
            if not details:
                print(f"   ⚠️  Skipping {place.get('name')} — could not fetch details")
                stats["failed"] += 1
                continue

            salon_doc = transform_place(details)
            salon_name = salon_doc["name"]
            salon_locality = salon_doc["locality"]

            if dry_run:
                print(f"   [DRY RUN] Would upsert: {salon_name} ({salon_locality})")
                continue

            try:
                result = await db.salons.update_one(
                    {"google_place_id": pid},
                    {
                        "$set": salon_doc,
                        "$setOnInsert": {"created_at": datetime.now(timezone.utc)},
                    },
                    upsert=True,
                )
                if result.upserted_id:
                    stats["inserted"] += 1
                    print(f"   ✅ INSERTED: {salon_name} — {salon_locality} ({salon_doc['rating_avg']}★)")
                elif result.modified_count > 0:
                    stats["updated"] += 1
                    print(f"   🔄 UPDATED:  {salon_name} — {salon_locality}")
                else:
                    print(f"   ℹ️  NO CHANGE: {salon_name} (already up-to-date)")
            except Exception as e:
                stats["failed"] += 1
                print(f"   ❌ DB ERROR for {salon_name}: {e}")

    elapsed = round((time.time() - start_time) / 60, 2)

    print(f"\n{'=' * 60}")
    print("Fetch complete!")
    print(f"  ✅ Total listings processed : {stats['total']}")
    print(f"  ✅ New records inserted     : {stats['inserted']}")
    print(f"  🔄 Existing records updated : {stats['updated']}")
    print(f"  ⚠️  Failed records           : {stats['failed']}")
    print(f"  ⏱️  Total time               : {elapsed} minutes")
    print(f"{'=' * 60}")

    client.close()


if __name__ == "__main__":
    import sys
    dry = "--dry-run" in sys.argv
    asyncio.run(fetch_and_upsert(dry_run=dry))
