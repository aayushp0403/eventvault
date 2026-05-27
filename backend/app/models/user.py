from sqlalchemy import Column, String, Boolean, Enum, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid, enum
from app.db.database import Base

class UserRole(str, enum.Enum):
    admin = "admin"
    photographer = "photographer"
    club_member = "club_member"
    viewer = "viewer"

class User(Base):
    __tablename__ = "users"

    id            = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email         = Column(String, unique=True, index=True, nullable=False)
    username      = Column(String, unique=True, index=True, nullable=False)
    full_name     = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role          = Column(Enum(UserRole), default=UserRole.viewer)
    avatar_url    = Column(String, nullable=True)
    bio           = Column(Text, nullable=True)
    is_active     = Column(Boolean, default=True)
    selfie_path   = Column(String, nullable=True)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
    updated_at    = Column(DateTime(timezone=True), onupdate=func.now())

    events        = relationship("Event", back_populates="creator")
    media_uploads = relationship("Media", back_populates="uploader")
    likes         = relationship("Like", back_populates="user")
    comments      = relationship("Comment", back_populates="user")
    notifications = relationship("Notification", back_populates="user", foreign_keys="Notification.user_id")