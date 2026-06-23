from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import List, Optional
from models import Booking, Service, Stylist
from database import db
from bson import ObjectId

class PhoneUpdate(BaseModel):
    phone: str

router = APIRouter(prefix="/api/owner", tags=["owner"])

# Very basic mock auth for the demo: 
# We'll just assume the Authorization header has "Bearer {owner_id}"
async def get_owner_id(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    return authorization.split(" ")[1]

@router.get("/bookings", response_model=List[Booking])
async def get_owner_bookings(owner_id: str = Depends(get_owner_id)):
    # Find the salon(s) for this owner
    salons_cursor = db.salons.find({"owner_id": owner_id})
    salons = await salons_cursor.to_list(length=10)
    
    if not salons:
        return []
        
    salon_ids = [s["_id"] for s in salons]
    
    # Get bookings for those salons
    bookings_cursor = db.bookings.find({"salon_id": {"$in": salon_ids}})
    bookings = await bookings_cursor.to_list(length=100)
    return bookings

@router.post("/services")
async def add_service(service: Service, owner_id: str = Depends(get_owner_id)):
    salon = await db.salons.find_one({"owner_id": owner_id})
    if not salon:
        raise HTTPException(status_code=404, detail="Salon not found for this owner")
        
    result = await db.salons.update_one(
        {"_id": salon["_id"]},
        {"$push": {"services": service.model_dump()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Failed to add service")
        
    return {"message": "Service added successfully"}

@router.patch("/slots")
async def update_slots(owner_id: str = Depends(get_owner_id)):
    # Mock endpoint for updating slots
    return {"message": "Slots updated successfully"}

@router.patch("/phone")
async def update_phone(payload: PhoneUpdate, owner_id: str = Depends(get_owner_id)):
    salon = await db.salons.find_one({"owner_id": owner_id})
    if not salon:
        raise HTTPException(status_code=404, detail="Salon not found for this owner")
        
    result = await db.salons.update_one(
        {"_id": salon["_id"]},
        {"$set": {"phone": payload.phone}}
    )
    
    if result.modified_count == 0 and payload.phone != salon.get("phone"):
        raise HTTPException(status_code=500, detail="Failed to update phone number")
        
    return {"message": "Phone number updated successfully", "phone": payload.phone}

@router.post("/stylists")
async def add_stylist(stylist: Stylist, owner_id: str = Depends(get_owner_id)):
    salon = await db.salons.find_one({"owner_id": owner_id})
    if not salon:
        raise HTTPException(status_code=404, detail="Salon not found for this owner")
        
    result = await db.salons.update_one(
        {"_id": salon["_id"]},
        {"$push": {"stylists": stylist.model_dump()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Failed to add stylist")
        
    return {"message": "Stylist added successfully", "stylist": stylist.model_dump()}

@router.delete("/stylists/{stylist_id}")
async def remove_stylist(stylist_id: str, owner_id: str = Depends(get_owner_id)):
    salon = await db.salons.find_one({"owner_id": owner_id})
    if not salon:
        raise HTTPException(status_code=404, detail="Salon not found for this owner")
        
    result = await db.salons.update_one(
        {"_id": salon["_id"]},
        {"$pull": {"stylists": {"stylist_id": stylist_id}}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Stylist not found or already removed")
        
    return {"message": "Stylist removed successfully"}
