"""
Fetches REAL salon data from OpenStreetMap's Overpass API and seeds MongoDB.
NO API KEY REQUIRED. It's completely free!

What it pulls (live from OpenStreetMap):
  - Real Name
  - Real Coordinates (Lat/Lng)
  - Real Locality (Street / Area / Suburb if tagged)
  - Real Phone / Website / Opening hours (if available on OSM)

Since OSM doesn't have reviews, photos, or prices, we mock those
to keep the UI looking good while using real salon locations.
"""

import asyncio
import requests
import uuid
import random
from database import db, client

# ── Config ──────────────────────────────────────────────
# Overpass API endpoint
OVERPASS_URL = "https://overpass-api.de/api/interpreter"

HEADERS = {
    "User-Agent": "LushLife/1.0 (salon booking app; contact@lushlife.app)",
    "Content-Type": "application/x-www-form-urlencoded",
}

# Overpass Query Language (QL)
# We search for nodes tagged with shop=beauty within the area of Hyderabad.
OVERPASS_QUERY = """
[out:json][timeout:25];
// Fetch the area for Hyderabad
area["name"="Hyderabad"]->.searchArea;
// Fetch beauty shops within that area
(
  node["shop"="beauty"](area.searchArea);
  way["shop"="beauty"](area.searchArea);
);
// Output center coordinates and tags
out center;
"""

# ── Mocks & Defaults ────────────────────────────────────
HYDERABAD_LOCALITIES = [
    "Banjara Hills", "Jubilee Hills", "Gachibowli", "Kondapur",
    "Madhapur", "Ameerpet", "Kukatpally", "Himayatnagar",
    "Secunderabad", "Begumpet", "Somajiguda", "Miyapur"
]

FALLBACK_PHOTOS = [
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80",
    "https://images.unsplash.com/photo-1521590832167-7bfc17484d20?w=800&q=80",
    "https://images.unsplash.com/photo-1516975080661-460d3dcefb54?w=800&q=80",
    "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=800&q=80",
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80"
]

SERVICES = {
    "budget": [
        {"name": "Women's Haircut", "category": "hair", "duration_min": 30, "price": 400},
        {"name": "Men's Haircut", "category": "grooming", "duration_min": 25, "price": 250},
        {"name": "Basic Facial", "category": "skin", "duration_min": 45, "price": 700},
        {"name": "Threading (Full Face)", "category": "grooming", "duration_min": 15, "price": 100},
    ],
    "mid": [
        {"name": "Women's Haircut & Blow Dry", "category": "hair", "duration_min": 45, "price": 800},
        {"name": "Hair Spa Treatment", "category": "hair", "duration_min": 60, "price": 1500},
        {"name": "Classic Facial", "category": "skin", "duration_min": 60, "price": 1200},
        {"name": "Hair Colour (Global)", "category": "hair", "duration_min": 90, "price": 3000},
    ],
    "premium": [
        {"name": "Signature Haircut & Styling", "category": "hair", "duration_min": 60, "price": 1500},
        {"name": "Balayage / Ombré Colour", "category": "hair", "duration_min": 150, "price": 7000},
        {"name": "HydraFacial / Luxury Facial", "category": "skin", "duration_min": 75, "price": 3000},
        {"name": "Bridal Makeup Package", "category": "bridal", "duration_min": 180, "price": 20000},
    ]
}

def transform_osm_node(element):
    """Convert an OSM element (node/way) into our Salon schema."""
    tags = element.get("tags", {})
    
    # We only want places that actually have a name
    name = tags.get("name")
    if not name:
        return None

    # Location / Coordinates
    if element["type"] == "node":
        lat = element.get("lat")
        lon = element.get("lon")
    else:
        lat = element.get("center", {}).get("lat")
        lon = element.get("center", {}).get("lon")
        
    if not lat or not lon:
        return None

    # Try to extract locality from OSM address tags, otherwise pick random
    locality = tags.get("addr:suburb") or tags.get("addr:city")
    if not locality or "hyderabad" in locality.lower():
        locality = random.choice(HYDERABAD_LOCALITIES)

    address = tags.get("addr:full") or f"{tags.get('addr:street', '')}, {locality}".strip(", ")
    if not address:
        address = f"{locality}, Hyderabad"

    # Randomize some plausible stats since OSM lacks reviews
    price_band = random.choice(["budget", "mid", "premium"])
    rating = round(random.uniform(3.8, 4.9), 1)
    review_count = random.randint(10, 300)

    # Build services
    salon_services = []
    for svc in SERVICES[price_band]:
        salon_services.append({
            "service_id": str(uuid.uuid4())[:8],
            "name": svc["name"],
            "category": svc["category"],
            "duration_min": svc["duration_min"],
            "price": svc["price"],
            "stylist_ids": [],
        })

    # Pick a random photo
    photo_url = random.choice(FALLBACK_PHOTOS)

    return {
        "name": name,
        "owner_id": f"osm_{element['id']}",
        "locality": locality,
        "location": {
            "type": "Point",
            "coordinates": [lon, lat]
        },
        "description": tags.get("description", f"{name} is a beauty salon located in {locality}, Hyderabad."),
        "services": salon_services,
        "stylists": [],
        "photos": [{"url": photo_url, "ai_tags": ["salon", price_band]}],
        "rating_avg": rating,
        "review_count": review_count,
        "sentiment_summary": "clean, professional",
        "embedding": [],
        "price_band": price_band,
        "is_active": True,
        "phone": tags.get("phone", tags.get("contact:phone", "")),
        "address": address,
        # Mocking google reviews so the UI doesn't break
        "google_reviews": [
            {
                "author": "Local Guide",
                "rating": 5 if rating > 4.5 else 4,
                "text": "Great place, really liked the service here.",
                "time": "1 month ago",
                "profile_photo": ""
            }
        ],
    }

async def fetch_and_seed():
    print("Fetching real salons from OpenStreetMap (Hyderabad)...")
    print("This might take 5-10 seconds...")
    
    response = requests.post(
        OVERPASS_URL,
        headers=HEADERS,
        data={"data": OVERPASS_QUERY}
    )
    
    if response.status_code != 200:
        print(f"Failed to fetch data. Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        client.close()
        return

    data = response.json()
    elements = data.get("elements", [])
    
    print(f"Found {len(elements)} raw beauty/salon tags in Hyderabad.")
    
    all_salons = []
    for el in elements:
        salon = transform_osm_node(el)
        if salon:
            all_salons.append(salon)
            
    # Limit to top 50 so we don't overwhelm the DB for the demo
    all_salons = all_salons[:50]

    if not all_salons:
        print("No named salons found.")
        client.close()
        return

    print(f"Successfully processed {len(all_salons)} named salons.")
    
    print("\nDropping old salons collection...")
    await db.salons.drop()
    
    print(f"Inserting {len(all_salons)} real OSM salons...")
    await db.salons.insert_many(all_salons)
    
    print(f"Done! Seeded {len(all_salons)} real salons.")
    client.close()

if __name__ == "__main__":
    asyncio.run(fetch_and_seed())
