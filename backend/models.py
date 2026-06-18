from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Any
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(
            cls, _source_type: Any, _handler: Any
    ) -> Any:
        from pydantic_core import core_schema
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.chain_schema([
                    core_schema.str_schema(),
                    core_schema.no_info_plain_validator_function(cls.validate),
                ])
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda x: str(x)
            ),
        )

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

class Service(BaseModel):
    service_id: str
    name: str
    category: str
    duration_min: int
    price: int
    stylist_ids: List[str] = []

class Stylist(BaseModel):
    stylist_id: str
    name: str
    bio: Optional[str] = None
    photo_url: Optional[str] = None

class Photo(BaseModel):
    url: str
    ai_tags: List[str] = []

class Salon(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: str
    owner_id: str
    locality: str
    location: dict = {"type": "Point", "coordinates": [0, 0]}
    description: str
    services: List[Service] = []
    stylists: List[Stylist] = []
    photos: List[Photo] = []
    rating_avg: float = 0.0
    review_count: int = 0
    sentiment_summary: Optional[str] = None
    embedding: List[float] = []
    price_band: str = "budget" # budget, mid, premium
    is_active: bool = True
    opening_hours: Optional[str] = None
    is_open_now: Optional[bool] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

class Booking(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    confirmation_id: str
    customer_id: Optional[str] = None
    customer_name: str
    customer_phone: str
    salon_id: PyObjectId
    service_id: str
    stylist_id: Optional[str] = None
    slot_start: datetime
    slot_end: datetime
    status: str = "pending" # pending, confirmed, completed, cancelled, no_show
    review_id: Optional[PyObjectId] = None
    
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

class Review(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    booking_id: PyObjectId
    rating: int
    text: str
    photos: List[str] = []

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)
