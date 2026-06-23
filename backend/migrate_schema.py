"""
migrate_schema.py
─────────────────
MongoDB "migration" for the LushLife salons collection.

Runs idempotently — safe to run multiple times.

Changes applied:
  1. 2dsphere geo index on `location` (for future geo queries)
  2. Unique sparse index on `google_place_id`
  3. Backfill `is_verified = True` for all Google-sourced records
  4. Backfill `is_trusted = False` default for all records
  5. Backfill `phone_number` from existing `phone` field
  6. Backfill `address_full` from existing `address` field
  7. Backfill `thumbnail_url` from first photo URL
  8. Backfill `scraped_at` (set to `created_at` if missing)
  9. Ensure `opening_hours_dict` JSONB-like subdoc exists
"""

import asyncio
from datetime import datetime
from database import db, client


async def run_migration():
    salons = db.salons

    print("=" * 60)
    print("LushLife — MongoDB Schema Migration")
    print("=" * 60)

    # ── 1. Indexes ───────────────────────────────────────────────
    print("\n[1/4] Creating indexes...")

    # 2dsphere index on location (needed for geo queries)
    await salons.create_index([("location", "2dsphere")], background=True)
    print("  ✓ 2dsphere index on `location`")

    # Unique sparse index on google_place_id
    await salons.create_index(
        "google_place_id",
        unique=True,
        sparse=True,  # sparse = ignores docs where field is null/missing
        background=True
    )
    print("  ✓ Unique sparse index on `google_place_id`")

    # Index on locality for fast filter queries
    await salons.create_index("locality", background=True)
    print("  ✓ Index on `locality`")

    # Compound index for the most common filter pattern
    await salons.create_index(
        [("is_active", 1), ("rating_avg", -1)],
        background=True
    )
    print("  ✓ Compound index on `is_active` + `rating_avg`")

    # ── 2. Backfill is_verified for Google records ───────────────
    print("\n[2/4] Backfilling `is_verified` / `is_trusted`...")
    result = await salons.update_many(
        {"google_place_id": {"$exists": True}, "is_verified": {"$exists": False}},
        {"$set": {"is_verified": True}}
    )
    print(f"  ✓ Set is_verified=True on {result.modified_count} Google-sourced records")

    result = await salons.update_many(
        {"is_trusted": {"$exists": False}},
        {"$set": {"is_trusted": False}}
    )
    print(f"  ✓ Set is_trusted=False default on {result.modified_count} records")

    # ── 3. Backfill phone_number from `phone` ───────────────────
    print("\n[3/4] Backfilling new contact/media fields...")
    result = await salons.update_many(
        {"phone": {"$exists": True}, "phone_number": {"$exists": False}},
        [{"$set": {"phone_number": "$phone"}}]
    )
    print(f"  ✓ Copied `phone` → `phone_number` on {result.modified_count} records")

    # Backfill address_full from `address`
    result = await salons.update_many(
        {"address": {"$exists": True}, "address_full": {"$exists": False}},
        [{"$set": {"address_full": "$address"}}]
    )
    print(f"  ✓ Copied `address` → `address_full` on {result.modified_count} records")

    # Backfill thumbnail_url from first photos[] entry
    async for doc in salons.find(
        {"photos": {"$exists": True, "$ne": []}, "thumbnail_url": {"$exists": False}},
        {"_id": 1, "photos": {"$slice": 1}}
    ):
        first_photo = doc.get("photos", [{}])[0]
        thumb_url = first_photo.get("url") if first_photo else None
        if thumb_url:
            await salons.update_one(
                {"_id": doc["_id"]},
                {"$set": {"thumbnail_url": thumb_url}}
            )
    print("  ✓ Backfilled `thumbnail_url` from first photo")

    # Backfill scraped_at from created_at
    result = await salons.update_many(
        {"scraped_at": {"$exists": False}},
        [{"$set": {"scraped_at": {"$ifNull": ["$created_at", datetime.utcnow()]}}}]
    )
    print(f"  ✓ Backfilled `scraped_at` on {result.modified_count} records")

    # ── 4. Ensure opening_hours_dict exists ─────────────────────
    print("\n[4/4] Normalizing opening_hours to dict format...")
    DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    async for doc in salons.find(
        {"opening_hours_dict": {"$exists": False}},
        {"_id": 1, "opening_hours": 1}
    ):
        raw = doc.get("opening_hours")
        if isinstance(raw, dict):
            # Already a dict — just rename
            await salons.update_one(
                {"_id": doc["_id"]},
                {"$set": {"opening_hours_dict": raw},
                 "$unset": {"opening_hours": ""}}
            )
        elif isinstance(raw, str) and raw:
            # Simple string like "09:00 - 21:00" — apply to all days
            hours_dict = {day: raw for day in DAYS}
            await salons.update_one(
                {"_id": doc["_id"]},
                {"$set": {
                    "opening_hours_dict": hours_dict,
                    "opening_hours": raw  # keep original too
                }}
            )
        else:
            # No hours known
            await salons.update_one(
                {"_id": doc["_id"]},
                {"$set": {"opening_hours_dict": None}}
            )
    print("  ✓ opening_hours_dict populated")

    # Done
    total = await salons.count_documents({})
    print(f"\n{'=' * 60}")
    print(f"Migration complete. Total documents in salons: {total}")
    print(f"{'=' * 60}")
    client.close()


if __name__ == "__main__":
    asyncio.run(run_migration())
