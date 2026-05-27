from sqlalchemy import Column, String, Text, Boolean, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid, enum
from app.db.database import Base

class EventCategory(str, enum.Enum):
    photoshoot   = "photoshoot"
    workshop     = "workshop"
    trip         = "trip"
    competition  = "competition"
    cultural     = "cultural"
    party        = "party"
    other        = "other"

class Event(Base):
    __tablename__ = "events"

    id          = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title       = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    category    = Column(Enum(EventCategory), default=EventCategory.other)
    location    = Column(String, nullable=True)
    event_date  = Column(DateTime(timezone=True), nullable=True)
    is_public   = Column(Boolean, default=True)
    cover_url   = Column(String, nullable=True)
    creator_id  = Column(String, ForeignKey("users.id"), nullable=False)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), onupdate=func.now())

    creator     = relationship("User", back_populates="events")
    albums      = relationship("Album", back_populates="event", cascade="all, delete-orphan")
    media       = relationship("Media", back_populates="event", cascade="all, delete-orphan")