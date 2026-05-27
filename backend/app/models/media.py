from sqlalchemy import Column, String, Text, Boolean, Enum, DateTime, ForeignKey, Integer, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid, enum
from app.db.database import Base

class MediaType(str, enum.Enum):
    photo = "photo"
    video = "video"

class Media(Base):
    __tablename__ = "media"

    id            = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    filename      = Column(String, nullable=False)
    original_name = Column(String, nullable=False)
    file_path     = Column(String, nullable=False)
    thumbnail_path= Column(String, nullable=True)
    media_type    = Column(Enum(MediaType), nullable=False)
    file_size     = Column(Integer, nullable=True)
    width         = Column(Integer, nullable=True)
    height        = Column(Integer, nullable=True)
    caption       = Column(Text, nullable=True)
    ai_tags       = Column(JSON, default=list)
    is_public     = Column(Boolean, default=True)
    event_id      = Column(String, ForeignKey("events.id"), nullable=False)
    album_id      = Column(String, ForeignKey("albums.id"), nullable=True)
    uploader_id   = Column(String, ForeignKey("users.id"), nullable=False)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())

    event         = relationship("Event", back_populates="media")
    album         = relationship("Album", back_populates="media")
    uploader      = relationship("User", back_populates="media_uploads")
    likes         = relationship("Like", back_populates="media", cascade="all, delete-orphan")
    comments      = relationship("Comment", back_populates="media", cascade="all, delete-orphan")