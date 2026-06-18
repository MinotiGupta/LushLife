"""
Fetches REAL salon data from Google Places API and seeds MongoDB.
Requires: GOOGLE_PLACES_API_KEY in .env

What it pulls (live from Google Maps):
  - Name, address, locality, lat/lng
  - Rating, review count, actual review text
  - Photos (real Google-hosted URLs)
  - Phone number, opening hours
  - Business status (open/closed)

Services & stylists are not available from Google, so we generate
reasonable defaults based on the salon's price level.
"""

import asyncio
import os
import requests
import uuid
from database import db, client
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GOOGLE_PLACES_API_KEY")
if not API_KEY:
    print("ERROR: Set GOOGLE_PLACES_API_KEY in your .env file")
    print("Get one at: https://console.cloud.google.com/apis/credentials")
    print("Enable: Places API (New) or Places API")
    exit(1)

# ── Config ──────────────────────────────────────────────
SEARCH_QUERIES = [
    "beauty salon in Banjara Hills Hyderabad",
    "beauty salon in Jubilee Hills Hyderabad",
    "beauty salon in Gachibowli Hyderabad",
    "beauty salon in Kondapur Hyderabad",
    "beauty salon in Madhapur Hyderabad",
    "beauty salon in Ameerpet Hyderabad",
    "beauty salon in Kukatpally Hyderabad",
    "bridal makeup salon Hyderabad",
]

HYDERABAD_LOCALITIES = [
    "Banjara Hills", "Jubilee Hills", "Gachibowli", "Kondapur",
    "Madhapur", "Ameerpet", "Kukatpally", "Himayatnagar",
    "Secunderabad", "Begumpet", "Somajiguda", "Miyapur",
    "Manikonda", "Tolichowki", "Attapur", "Dilsukhnagar",
    "LB Nagar", "Uppal", "KPHB", "Financial District",
]

# ── Google Places helpers ───────────────────────────────
def text_search(query, max_results=5):
    """Search for places using Text Search (legacy)."""
    url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    params = {"query": query, "key": API_KEY, "type": "beauty_salon"}
    resp = requests.get(url, params=params)
    data = resp.json()
    if data.get("status") != "OK":
        print(f"  Search failed: {data.get('status')} — {data.get('error_message','')}")
        return []
    return data.get("results", [])[:max_results]


def get_place_details(place_id):
    """Get detailed info for a single place."""
    url = "https://maps.googleapis.com/maps/api/place/details/json"
    params = {
        "place_id": place_id,
        "key": API_KEY,
        "fields": "name,formatted_address,formatted_phone_number,geometry,rating,"
                  "user_ratings_total,reviews,photos,opening_hours,price_level,"
                  "business_status,types,editorial_summary",
    }
    resp = requests.get(url, params=params)
    data = resp.json()
    if data.get("status") != "OK":
        return None
    return data.get("result")


def get_photo_url(photo_ref, max_width=800):
    """Build a Google Places photo URL."""
    return (
        f"https://maps.googleapis.com/maps/api/place/photo"
        f"?maxwidth={max_width}&photo_reference={photo_ref}&key={API_KEY}"
    )


# ── Transform Google data → our schema ──────────────────
def detect_locality(address):
    """Try to match a known Hyderabad locality from the address string."""
    for loc in HYDERABAD_LOCALITIES:
        if loc.lower() in address.lower():
            return loc
    return "Hyderabad"


def derive_price_band(price_level, rating):
    """Map Google's price_level (0-4) to our bands."""
    if price_level is not None:
        if price_level >= 3: return "premium"
        if price_level >= 2: return "mid"
        return "budget"
    # Fallback: higher-rated salons tend to be pricier
    if rating and rating >= 4.5: return "premium"
    if rating and rating >= 4.0: return "mid"
    return "budget"


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


def transform_place(details):
    """Convert Google Place details into our Salon schema."""
    name = details.get("name", "Unknown Salon")
    address = details.get("formatted_address", "Hyderabad")
    locality = detect_locality(address)
    rating = details.get("rating", 0)
    price_band = derive_price_band(details.get("price_level"), rating)
    geo = details.get("geometry", {}).get("location", {})
    
    # Photos
    photos = []
    for p in (details.get("photos") or [])[:4]:
        ref = p.get("photo_reference")
        if ref:
            photos.append({
                "url": get_photo_url(ref),
                "ai_tags": ["salon", locality.lower().replace(" ", "-")]
            })
    if not photos:
        photos = [{"url": "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80", "ai_tags": ["salon"]}]

    # Reviews
    google_reviews = details.get("reviews") or []
    
    # Build sentiment from top reviews
    sentiments = []
    for r in google_reviews[:3]:
        text = r.get("text", "")
        if "clean" in text.lower(): sentiments.append("clean")
        if "friendly" in text.lower() or "staff" in text.lower(): sentiments.append("friendly")
        if "professional" in text.lower(): sentiments.append("professional")
        if "expensive" in text.lower() or "pricey" in text.lower(): sentiments.append("pricey")
        if "quick" in text.lower() or "fast" in text.lower(): sentiments.append("quick")
        if "luxury" in text.lower() or "premium" in text.lower(): sentiments.append("luxurious")
        if "hygien" in text.lower(): sentiments.append("hygienic")
    sentiment = ", ".join(list(dict.fromkeys(sentiments))[:3]) or "professional, reliable, clean"

    # Services (templated by price band)
    services = []
    for svc in DEFAULT_SERVICES.get(price_band, DEFAULT_SERVICES["mid"]):
        services.append({
            "service_id": str(uuid.uuid4())[:8],
            "name": svc["name"],
            "category": svc["category"],
            "duration_min": svc["duration_min"],
            "price": svc["price"],
            "stylist_ids": [],
        })

    # Hours
    hours_obj = details.get("opening_hours", {})
    is_open = hours_obj.get("open_now", True)

    return {
        "name": name,
        "owner_id": f"google_{details.get('place_id', 'unknown')[:12]}",
        "locality": locality,
        "location": {
            "type": "Point",
            "coordinates": [geo.get("lng", 78.47), geo.get("lat", 17.38)]
        },
        "description": details.get("editorial_summary", {}).get("overview", "")
                       or f"{name} — a popular beauty salon in {locality}, Hyderabad.",
        "services": services,
        "stylists": [],  # Not available from Google
        "photos": photos,
        "rating_avg": rating,
        "review_count": details.get("user_ratings_total", 0),
        "sentiment_summary": sentiment,
        "embedding": [],
        "price_band": price_band,
        "is_active": is_open,
        "phone": details.get("formatted_phone_number", ""),
        "address": address,
        "google_place_id": details.get("place_id"),
        "google_reviews": [
            {
                "author": r.get("author_name", "Anonymous"),
                "rating": r.get("rating", 5),
                "text": r.get("text", ""),
                "time": r.get("relative_time_description", ""),
                "profile_photo": r.get("profile_photo_url", ""),
            }
            for r in google_reviews[:5]
        ],
    }


# ── Main ────────────────────────────────────────────────
async def fetch_and_seed():
    seen_ids = set()
    all_salons = []

    for query in SEARCH_QUERIES:
        print(f"Searching: {query}")
        results = text_search(query, max_results=5)
        print(f"  Found {len(results)} results")

        for place in results:
            pid = place.get("place_id")
            if pid in seen_ids:
                continue
            seen_ids.add(pid)

            details = get_place_details(pid)
            if not details:
                continue

            salon = transform_place(details)
            all_salons.append(salon)
            print(f"  ✓ {salon['name']} — {salon['locality']} ({salon['rating_avg']}★, {salon['review_count']} reviews)")

    if not all_salons:
        print("No salons fetched. Check your API key and billing.")
        client.close()
        return

    print(f"\nDropping old salons collection...")
    await db.salons.drop()
    print(f"Inserting {len(all_salons)} real salons...")
    await db.salons.insert_many(all_salons)
    print(f"Done! {len(all_salons)} salons seeded from Google Places.")
    client.close()


if __name__ == "__main__":
    asyncio.run(fetch_and_seed())
