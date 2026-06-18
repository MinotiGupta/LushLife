from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from models import Booking
from database import db
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/bookings", tags=["bookings"])

class BookingCreate(BaseModel):
    salon_id: str
    service_id: str
    stylist_id: Optional[str] = None
    slot_start: datetime
    customer_name: str
    customer_phone: str

@router.post("/", response_model=Booking)
async def create_booking(booking_in: BookingCreate):
    if not ObjectId.is_valid(booking_in.salon_id):
        raise HTTPException(status_code=400, detail="Invalid salon ID")
        
    salon = await db.salons.find_one({"_id": ObjectId(booking_in.salon_id)})
    if not salon:
        raise HTTPException(status_code=404, detail="Salon not found")
        
    # Calculate end time based on service
    duration_min = 60
    for service in salon.get("services", []):
        if service["service_id"] == booking_in.service_id:
            duration_min = service.get("duration_min", 60)
            break
            
    import uuid
    from datetime import timedelta
    
    slot_end = booking_in.slot_start + timedelta(minutes=duration_min)
    
    new_booking = Booking(
        confirmation_id=f"GLW-HYD-{uuid.uuid4().hex[:6].upper()}",
        customer_name=booking_in.customer_name,
        customer_phone=booking_in.customer_phone,
        salon_id=ObjectId(booking_in.salon_id),
        service_id=booking_in.service_id,
        stylist_id=booking_in.stylist_id,
        slot_start=booking_in.slot_start,
        slot_end=slot_end,
        status="confirmed"
    )
    
    result = await db.bookings.insert_one(new_booking.model_dump(by_alias=True, exclude={"id"}))
    created_booking = await db.bookings.find_one({"_id": result.inserted_id})
    return created_booking

@router.get("/{booking_id}", response_model=Booking)
async def get_booking(booking_id: str):
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="Invalid booking ID")
    booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking

@router.patch("/{booking_id}/cancel")
async def cancel_booking(booking_id: str):
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="Invalid booking ID")
    
    result = await db.bookings.update_one(
        {"_id": ObjectId(booking_id)},
        {"$set": {"status": "cancelled"}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found or already cancelled")
        
    return {"message": "Booking cancelled successfully"}
