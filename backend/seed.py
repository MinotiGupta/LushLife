import asyncio
from database import db, client

SALONS = [
  {
    "name": "Mirrors Luxury Salon — Jubilee Hills",
    "owner_id": "owner_mirrors", "locality": "Jubilee Hills",
    "location": {"type":"Point","coordinates":[78.4074,17.4319]},
    "description": "Hyderabad's premier luxury salon chain known for celebrity clientele, advanced hair colour techniques, and world-class bridal makeover packages.",
    "price_band": "premium", "rating_avg": 4.8, "review_count": 312, "is_active": True,
    "sentiment_summary": "luxurious, expert colourists, pricey",
    "services": [
      {"service_id":"m1","name":"Women's Haircut & Blow Dry","category":"hair","duration_min":60,"price":1500,"stylist_ids":["ms1","ms2"]},
      {"service_id":"m2","name":"Balayage / Ombré Colour","category":"hair","duration_min":180,"price":8000,"stylist_ids":["ms1"]},
      {"service_id":"m3","name":"Keratin Smoothening","category":"hair","duration_min":150,"price":6500,"stylist_ids":["ms1","ms2"]},
      {"service_id":"m4","name":"Bridal Makeup Package","category":"bridal","duration_min":180,"price":25000,"stylist_ids":["ms3"]},
      {"service_id":"m5","name":"Luxury Gold Facial","category":"skin","duration_min":75,"price":3500,"stylist_ids":["ms4"]},
      {"service_id":"m6","name":"Gel Manicure + Pedicure","category":"nails","duration_min":90,"price":2500,"stylist_ids":["ms4"]},
    ],
    "stylists": [
      {"stylist_id":"ms1","name":"Arjun Reddy","bio":"Senior Hair Colourist — 12 yrs experience, L'Oréal certified"},
      {"stylist_id":"ms2","name":"Simran Kaur","bio":"Creative Director — specialises in precision cuts & texture"},
      {"stylist_id":"ms3","name":"Kavya Sharma","bio":"Bridal Makeup Artist — 500+ weddings styled"},
      {"stylist_id":"ms4","name":"Neha Gupta","bio":"Skin & Nail Expert — Dermalogica trained"},
    ],
    "photos": [
      {"url":"https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80","ai_tags":["luxury","interior","premium"]},
      {"url":"https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80","ai_tags":["hair colour","balayage","women"]},
      {"url":"https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80","ai_tags":["bridal","makeup","glamour"]},
    ],
  },
  {
    "name": "Naturals Salon — Banjara Hills",
    "owner_id": "owner_naturals_bh", "locality": "Banjara Hills",
    "location": {"type":"Point","coordinates":[78.4411,17.4156]},
    "description": "India's largest unisex salon chain. Trusted for consistent quality haircuts, facials, waxing and affordable bridal packages across 700+ outlets.",
    "price_band": "mid", "rating_avg": 4.3, "review_count": 189, "is_active": True,
    "sentiment_summary": "reliable, affordable, friendly",
    "services": [
      {"service_id":"n1","name":"Women's Haircut","category":"hair","duration_min":45,"price":450,"stylist_ids":["ns1","ns2"]},
      {"service_id":"n2","name":"Hair Spa Treatment","category":"hair","duration_min":60,"price":1200,"stylist_ids":["ns1"]},
      {"service_id":"n3","name":"Classic Facial","category":"skin","duration_min":60,"price":900,"stylist_ids":["ns3"]},
      {"service_id":"n4","name":"Full Arms Waxing","category":"skin","duration_min":30,"price":400,"stylist_ids":["ns3"]},
      {"service_id":"n5","name":"Pre-Bridal Package (3 sessions)","category":"bridal","duration_min":240,"price":8500,"stylist_ids":["ns2","ns3"]},
      {"service_id":"n6","name":"Men's Haircut","category":"grooming","duration_min":30,"price":350,"stylist_ids":["ns1"]},
    ],
    "stylists": [
      {"stylist_id":"ns1","name":"Kiran Kumar","bio":"Senior Stylist — 8 yrs, quick precision cuts"},
      {"stylist_id":"ns2","name":"Pooja Reddy","bio":"Hair & Bridal Specialist — L'Oréal trained"},
      {"stylist_id":"ns3","name":"Lakshmi Devi","bio":"Skin Care Expert — facials & waxing specialist"},
    ],
    "photos": [
      {"url":"https://images.unsplash.com/photo-1521590832167-7bfc17484d20?w=800&q=80","ai_tags":["salon","haircut","clean"]},
      {"url":"https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&q=80","ai_tags":["hair spa","treatment","women"]},
    ],
  },
  {
    "name": "Lakmé Salon — Kondapur",
    "owner_id": "owner_lakme_kp", "locality": "Kondapur",
    "location": {"type":"Point","coordinates":[78.3548,17.4576]},
    "description": "India's iconic beauty brand salon offering HydraFacials, Dermalogica skin treatments, trending hair colours, and signature bridal transformation journeys.",
    "price_band": "premium", "rating_avg": 4.5, "review_count": 245, "is_active": True,
    "sentiment_summary": "branded, hygienic, professional",
    "services": [
      {"service_id":"l1","name":"Designer Haircut","category":"hair","duration_min":45,"price":800,"stylist_ids":["ls1"]},
      {"service_id":"l2","name":"Global Hair Colour","category":"hair","duration_min":120,"price":5500,"stylist_ids":["ls1","ls2"]},
      {"service_id":"l3","name":"HydraFacial Glow","category":"skin","duration_min":60,"price":3000,"stylist_ids":["ls3"]},
      {"service_id":"l4","name":"Dermalogica Deep Cleanse Facial","category":"skin","duration_min":75,"price":2500,"stylist_ids":["ls3"]},
      {"service_id":"l5","name":"Bridal Makeup — Classic","category":"bridal","duration_min":150,"price":15000,"stylist_ids":["ls2"]},
      {"service_id":"l6","name":"Nail Art Extensions","category":"nails","duration_min":90,"price":2000,"stylist_ids":["ls3"]},
    ],
    "stylists": [
      {"stylist_id":"ls1","name":"Raghav Menon","bio":"Top Stylist — colour correction specialist"},
      {"stylist_id":"ls2","name":"Ananya Krishnan","bio":"Senior Bridal Artist — Lakmé Fashion Week trained"},
      {"stylist_id":"ls3","name":"Divya Patel","bio":"Skin Therapist — HydraFacial & Dermalogica certified"},
    ],
    "photos": [
      {"url":"https://images.unsplash.com/photo-1516975080661-460d3dcefb54?w=800&q=80","ai_tags":["facial","skincare","clean"]},
      {"url":"https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800&q=80","ai_tags":["hair colour","premium","women"]},
    ],
  },
  {
    "name": "Bounce Salon & Spa — Banjara Hills",
    "owner_id": "owner_bounce", "locality": "Banjara Hills",
    "location": {"type":"Point","coordinates":[78.4485,17.4230]},
    "description": "Celebrity-favourite salon in Banjara Hills known for runway-ready styling, premium hair treatments, and a luxurious spa experience.",
    "price_band": "premium", "rating_avg": 4.7, "review_count": 198, "is_active": True,
    "sentiment_summary": "celeb-worthy, trendy, upscale",
    "services": [
      {"service_id":"b1","name":"Signature Haircut","category":"hair","duration_min":60,"price":2000,"stylist_ids":["bs1"]},
      {"service_id":"b2","name":"Hair Botox Treatment","category":"hair","duration_min":120,"price":7000,"stylist_ids":["bs1"]},
      {"service_id":"b3","name":"Full Body Spa","category":"skin","duration_min":120,"price":5000,"stylist_ids":["bs2"]},
      {"service_id":"b4","name":"De-Tan Facial","category":"skin","duration_min":60,"price":2500,"stylist_ids":["bs2"]},
      {"service_id":"b5","name":"Bridal Glam Package","category":"bridal","duration_min":210,"price":30000,"stylist_ids":["bs1","bs2"]},
    ],
    "stylists": [
      {"stylist_id":"bs1","name":"Vikram Shetty","bio":"Celebrity Stylist — Tollywood clientele"},
      {"stylist_id":"bs2","name":"Priya Iyer","bio":"Spa & Wellness Expert — aromatherapy specialist"},
    ],
    "photos": [
      {"url":"https://images.unsplash.com/photo-1633681122956-4127f5765614?w=800&q=80","ai_tags":["luxury","spa","premium"]},
      {"url":"https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&q=80","ai_tags":["haircut","styling","modern"]},
    ],
  },
  {
    "name": "Envi Salon & Spa — Banjara Hills",
    "owner_id": "owner_envi", "locality": "Banjara Hills",
    "location": {"type":"Point","coordinates":[78.4390,17.4180]},
    "description": "Well-rated for impeccable hygiene and ambience. Offers professional hair, skin, and nail services with a calm, rejuvenating vibe.",
    "price_band": "mid", "rating_avg": 4.4, "review_count": 134, "is_active": True,
    "sentiment_summary": "hygienic, calm, value-for-money",
    "services": [
      {"service_id":"e1","name":"Women's Trim & Style","category":"hair","duration_min":45,"price":700,"stylist_ids":["es1"]},
      {"service_id":"e2","name":"Smoothening Treatment","category":"hair","duration_min":120,"price":4500,"stylist_ids":["es1"]},
      {"service_id":"e3","name":"Anti-Ageing Facial","category":"skin","duration_min":75,"price":2200,"stylist_ids":["es2"]},
      {"service_id":"e4","name":"Manicure + Pedicure Combo","category":"nails","duration_min":75,"price":1500,"stylist_ids":["es2"]},
      {"service_id":"e5","name":"Threading (Full Face)","category":"grooming","duration_min":20,"price":200,"stylist_ids":["es2"]},
    ],
    "stylists": [
      {"stylist_id":"es1","name":"Sneha Rao","bio":"Hair Stylist — smoothening & rebonding expert"},
      {"stylist_id":"es2","name":"Fatima Khan","bio":"Beauty Therapist — facials, nails & grooming"},
    ],
    "photos": [
      {"url":"https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=800&q=80","ai_tags":["clean","spa","relaxing"]},
      {"url":"https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80","ai_tags":["nails","manicure","grooming"]},
    ],
  },
  {
    "name": "Vurve Salon — Jubilee Hills",
    "owner_id": "owner_vurve", "locality": "Jubilee Hills",
    "location": {"type":"Point","coordinates":[78.4102,17.4345]},
    "description": "Premium unisex salon with modern interiors. Known for personalised haircuts, trending colours, and advanced skin services.",
    "price_band": "premium", "rating_avg": 4.6, "review_count": 156, "is_active": True,
    "sentiment_summary": "trendy, personalised, modern",
    "services": [
      {"service_id":"v1","name":"Personalised Haircut","category":"hair","duration_min":60,"price":1200,"stylist_ids":["vs1"]},
      {"service_id":"v2","name":"Balayage Colour","category":"hair","duration_min":150,"price":7500,"stylist_ids":["vs1"]},
      {"service_id":"v3","name":"Skin Brightening Facial","category":"skin","duration_min":60,"price":2800,"stylist_ids":["vs2"]},
      {"service_id":"v4","name":"Men's Grooming Package","category":"grooming","duration_min":75,"price":1800,"stylist_ids":["vs1"]},
    ],
    "stylists": [
      {"stylist_id":"vs1","name":"Ravi Teja","bio":"Creative Director — award-winning colourist"},
      {"stylist_id":"vs2","name":"Meghana Reddy","bio":"Skin Specialist — brightening & anti-pigmentation"},
    ],
    "photos": [
      {"url":"https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800&q=80","ai_tags":["modern","interior","unisex"]},
      {"url":"https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800&q=80","ai_tags":["hair colour","trendy","style"]},
    ],
  },
  {
    "name": "Page 3 Luxury Salon — Gachibowli",
    "owner_id": "owner_page3", "locality": "Gachibowli",
    "location": {"type":"Point","coordinates":[78.3460,17.4401]},
    "description": "Premium salon offering customised styling and luxurious bridal makeover experiences. Popular among IT professionals and brides-to-be in the Gachibowli–Financial District corridor.",
    "price_band": "premium", "rating_avg": 4.5, "review_count": 167, "is_active": True,
    "sentiment_summary": "stylish, bridal-expert, convenient",
    "services": [
      {"service_id":"p1","name":"Luxury Haircut & Finish","category":"hair","duration_min":60,"price":1800,"stylist_ids":["ps1"]},
      {"service_id":"p2","name":"Hair Highlights","category":"hair","duration_min":120,"price":5000,"stylist_ids":["ps1"]},
      {"service_id":"p3","name":"Complete Bridal Package","category":"bridal","duration_min":240,"price":20000,"stylist_ids":["ps2"]},
      {"service_id":"p4","name":"Party Makeup","category":"bridal","duration_min":90,"price":5000,"stylist_ids":["ps2"]},
      {"service_id":"p5","name":"O3+ Whitening Facial","category":"skin","duration_min":60,"price":2000,"stylist_ids":["ps3"]},
    ],
    "stylists": [
      {"stylist_id":"ps1","name":"Aditya Verma","bio":"Lead Stylist — international training"},
      {"stylist_id":"ps2","name":"Swathi Naidu","bio":"Bridal Makeup Artist — HD & airbrush techniques"},
      {"stylist_id":"ps3","name":"Ritika Jain","bio":"Skincare Therapist — O3+ & VLCC certified"},
    ],
    "photos": [
      {"url":"https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=800&q=80","ai_tags":["bridal","glamour","premium"]},
      {"url":"https://images.unsplash.com/photo-1470259078422-826894b933aa?w=800&q=80","ai_tags":["hair","highlights","style"]},
    ],
  },
  {
    "name": "STUDIO11 Salon & Spa — Kondapur",
    "owner_id": "owner_studio11", "locality": "Kondapur",
    "location": {"type":"Point","coordinates":[78.3625,17.4590]},
    "description": "Affordable yet comprehensive salon offering hair, skin, and bridal services. Great value packages for everyday grooming.",
    "price_band": "budget", "rating_avg": 4.1, "review_count": 98, "is_active": True,
    "sentiment_summary": "affordable, quick, no-frills",
    "services": [
      {"service_id":"s1","name":"Basic Haircut","category":"hair","duration_min":30,"price":300,"stylist_ids":["ss1"]},
      {"service_id":"s2","name":"Hair Colour (Global)","category":"hair","duration_min":90,"price":2500,"stylist_ids":["ss1"]},
      {"service_id":"s3","name":"Clean-Up Facial","category":"skin","duration_min":45,"price":600,"stylist_ids":["ss2"]},
      {"service_id":"s4","name":"Full Body Waxing","category":"skin","duration_min":90,"price":1500,"stylist_ids":["ss2"]},
      {"service_id":"s5","name":"Basic Bridal Makeup","category":"bridal","duration_min":120,"price":5000,"stylist_ids":["ss1","ss2"]},
    ],
    "stylists": [
      {"stylist_id":"ss1","name":"Ramesh Babu","bio":"Stylist — 6 yrs experience, quick service"},
      {"stylist_id":"ss2","name":"Sunita Devi","bio":"Beauty Expert — waxing & facials"},
    ],
    "photos": [
      {"url":"https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80","ai_tags":["salon","budget","clean"]},
    ],
  },
  {
    "name": "Toni & Guy — Financial District",
    "owner_id": "owner_tng", "locality": "Gachibowli",
    "location": {"type":"Point","coordinates":[78.3652,17.4255]},
    "description": "Globally renowned British salon brand. High-end runway-ready styling, advanced colour techniques, and premium bridal services in the heart of Financial District.",
    "price_band": "premium", "rating_avg": 4.6, "review_count": 210, "is_active": True,
    "sentiment_summary": "world-class, runway-ready, premium",
    "services": [
      {"service_id":"t1","name":"Precision Cut & Style","category":"hair","duration_min":60,"price":2500,"stylist_ids":["ts1"]},
      {"service_id":"t2","name":"Fashion Colour","category":"hair","duration_min":150,"price":9000,"stylist_ids":["ts1"]},
      {"service_id":"t3","name":"Keratin Treatment","category":"hair","duration_min":150,"price":8000,"stylist_ids":["ts1","ts2"]},
      {"service_id":"t4","name":"Bridal Couture Package","category":"bridal","duration_min":240,"price":35000,"stylist_ids":["ts2"]},
      {"service_id":"t5","name":"Luxury Facial","category":"skin","duration_min":75,"price":3500,"stylist_ids":["ts3"]},
    ],
    "stylists": [
      {"stylist_id":"ts1","name":"Daniel Joseph","bio":"Technical Director — London-trained colourist"},
      {"stylist_id":"ts2","name":"Nisha Kapoor","bio":"Bridal Specialist — featured in Vogue India"},
      {"stylist_id":"ts3","name":"Sana Ahmed","bio":"Senior Therapist — anti-ageing & glow treatments"},
    ],
    "photos": [
      {"url":"https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&q=80","ai_tags":["premium","styling","modern"]},
      {"url":"https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=800&q=80","ai_tags":["fashion","colour","runway"]},
    ],
  },
  {
    "name": "Naturals Salon — Madhapur",
    "owner_id": "owner_naturals_mp", "locality": "Madhapur",
    "location": {"type":"Point","coordinates":[78.3873,17.4483]},
    "description": "Popular Naturals outlet in the IT corridor. Walk-ins welcome, consistent quality across haircuts, facials, and grooming. Customer First membership discounts available.",
    "price_band": "budget", "rating_avg": 4.2, "review_count": 156, "is_active": True,
    "sentiment_summary": "convenient, walk-in friendly, consistent",
    "services": [
      {"service_id":"nm1","name":"Women's Haircut","category":"hair","duration_min":40,"price":450,"stylist_ids":["nms1"]},
      {"service_id":"nm2","name":"Men's Haircut","category":"grooming","duration_min":30,"price":300,"stylist_ids":["nms1"]},
      {"service_id":"nm3","name":"Gold Facial","category":"skin","duration_min":60,"price":1100,"stylist_ids":["nms2"]},
      {"service_id":"nm4","name":"Threading","category":"grooming","duration_min":15,"price":100,"stylist_ids":["nms2"]},
      {"service_id":"nm5","name":"Hair Straightening","category":"hair","duration_min":120,"price":3500,"stylist_ids":["nms1"]},
    ],
    "stylists": [
      {"stylist_id":"nms1","name":"Venkat Rao","bio":"Senior Stylist — fast, reliable cuts"},
      {"stylist_id":"nms2","name":"Anusha Reddy","bio":"Beauty Expert — facials & threading"},
    ],
    "photos": [
      {"url":"https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?w=800&q=80","ai_tags":["salon","everyday","clean"]},
    ],
  },
  {
    "name": "Lakmé Salon — Ameerpet",
    "owner_id": "owner_lakme_ap", "locality": "Ameerpet",
    "location": {"type":"Point","coordinates":[78.4483,17.4372]},
    "description": "Centrally located Lakmé branch near metro station. Popular for quick lunch-hour facials, professional makeup, and trusted Lakmé product treatments.",
    "price_band": "mid", "rating_avg": 4.3, "review_count": 178, "is_active": True,
    "sentiment_summary": "accessible, metro-nearby, trusted-brand",
    "services": [
      {"service_id":"la1","name":"Haircut — Senior Stylist","category":"hair","duration_min":45,"price":700,"stylist_ids":["las1"]},
      {"service_id":"la2","name":"Lakmé Absolute Facial","category":"skin","duration_min":60,"price":1800,"stylist_ids":["las2"]},
      {"service_id":"la3","name":"Hair Colour Touch-Up","category":"hair","duration_min":60,"price":2000,"stylist_ids":["las1"]},
      {"service_id":"la4","name":"Cleanup + Threading","category":"grooming","duration_min":30,"price":500,"stylist_ids":["las2"]},
      {"service_id":"la5","name":"Party Makeup","category":"bridal","duration_min":90,"price":4000,"stylist_ids":["las2"]},
    ],
    "stylists": [
      {"stylist_id":"las1","name":"Mohammed Salman","bio":"Senior Stylist — colour & cuts specialist"},
      {"stylist_id":"las2","name":"Bhavana Sri","bio":"Makeup & Skincare — Lakmé certified"},
    ],
    "photos": [
      {"url":"https://images.unsplash.com/photo-1457972729786-0411a3b2b626?w=800&q=80","ai_tags":["makeup","professional","branded"]},
      {"url":"https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&q=80","ai_tags":["facial","skincare","women"]},
    ],
  },
  {
    "name": "Jawed Habib Hair & Beauty — Kukatpally",
    "owner_id": "owner_jh", "locality": "Kukatpally",
    "location": {"type":"Point","coordinates":[78.3991,17.4948]},
    "description": "India's most recognised salon chain by celebrity hairstylist Jawed Habib. Affordable haircuts, reliable colour, and express grooming services for the whole family.",
    "price_band": "budget", "rating_avg": 4.0, "review_count": 220, "is_active": True,
    "sentiment_summary": "famous-brand, family-friendly, quick",
    "services": [
      {"service_id":"jh1","name":"Women's Haircut","category":"hair","duration_min":30,"price":350,"stylist_ids":["jhs1"]},
      {"service_id":"jh2","name":"Men's Cut + Beard Trim","category":"grooming","duration_min":30,"price":250,"stylist_ids":["jhs1"]},
      {"service_id":"jh3","name":"Hair Colour (Ammonia-Free)","category":"hair","duration_min":90,"price":2000,"stylist_ids":["jhs1"]},
      {"service_id":"jh4","name":"Basic Facial","category":"skin","duration_min":45,"price":700,"stylist_ids":["jhs2"]},
      {"service_id":"jh5","name":"Full Arms + Legs Waxing","category":"skin","duration_min":60,"price":800,"stylist_ids":["jhs2"]},
    ],
    "stylists": [
      {"stylist_id":"jhs1","name":"Ajay Mishra","bio":"Franchise Stylist — trained at JH academy"},
      {"stylist_id":"jhs2","name":"Rekha Joshi","bio":"Beauty Therapist — waxing & facials"},
    ],
    "photos": [
      {"url":"https://images.unsplash.com/photo-1585747860019-f4e64de5a147?w=800&q=80","ai_tags":["haircut","family","affordable"]},
    ],
  },
]

async def seed_db():
    print("Dropping existing salons collection...")
    await db.salons.drop()
    print(f"Seeding {len(SALONS)} real Hyderabad salons...")
    result = await db.salons.insert_many(SALONS)
    print(f"Inserted {len(result.inserted_ids)} salons.")
    client.close()
    print("Done!")

if __name__ == "__main__":
    asyncio.run(seed_db())
