from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.db.database import Base

class Album(Base):
    __tablename__ = "albums"

    id          = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title       = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    is_public   = Column(Boolean, default=True)
    event_id    = Column(String, ForeignKey("events.id"), nullable=False)
    creator_id  = Column(String, ForeignKey("users.id"), nullable=False)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    event       = relationship("Event", back_populates="albums")
    media       = relationship("Media", back_populates="album")