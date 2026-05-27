from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.event import EventCategory

class EventCreate(BaseModel):
    title: str
    description: Optional[str]
    category: EventCategory = EventCategory.other
    location: Optional[str]
    event_date: Optional[datetime]
    is_public: bool = True

class EventOut(BaseModel):
    id: str
    title: str
    description: Optional[str]
    category: EventCategory
    location: Optional[str]
    event_date: Optional[datetime]
    is_public: bool
    cover_url: Optional[str]
    creator_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class EventUpdate(BaseModel):
    title: Optional[str]
    description: Optional[str]
    category: Optional[EventCategory]
    location: Optional[str]
    event_date: Optional[datetime]
    is_public: Optional[bool]