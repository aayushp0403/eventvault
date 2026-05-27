from sqlalchemy import Column, String, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.db.database import Base

class Like(Base):
    __tablename__ = "likes"
    __table_args__ = (UniqueConstraint("user_id", "media_id", name="unique_like"),)

    id         = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id    = Column(String, ForeignKey("users.id"), nullable=False)
    media_id   = Column(String, ForeignKey("media.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user       = relationship("User", back_populates="likes")
    media      = relationship("Media", back_populates="likes")


class Comment(Base):
    __tablename__ = "comments"

    id         = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    body       = Column(Text, nullable=False)
    user_id    = Column(String, ForeignKey("users.id"), nullable=False)
    media_id   = Column(String, ForeignKey("media.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user       = relationship("User", back_populates="comments")
    media      = relationship("Media", back_populates="comments")


class Notification(Base):
    __tablename__ = "notifications"

    id          = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id     = Column(String, ForeignKey("users.id"), nullable=False)
    actor_id    = Column(String, ForeignKey("users.id"), nullable=True)
    notif_type  = Column(String, nullable=False)
    message     = Column(Text, nullable=False)
    is_read     = Column(String, default="false")
    media_id    = Column(String, ForeignKey("media.id"), nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    user        = relationship("User", back_populates="notifications", foreign_keys=[user_id])