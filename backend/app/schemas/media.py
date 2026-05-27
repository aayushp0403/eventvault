from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.media import MediaType

class MediaOut(BaseModel):
    id: str
    filename: str
    original_name: str
    file_path: str
    thumbnail_path: Optional[str]
    media_type: MediaType
    file_size: Optional[int]
    caption: Optional[str]
    ai_tags: Optional[List[str]]
    is_public: bool
    event_id: str
    album_id: Optional[str]
    uploader_id: str
    created_at: datetime
    like_count: int = 0
    comment_count: int = 0

    class Config:
        from_attributes = True

class CommentCreate(BaseModel):
    body: str

class CommentOut(BaseModel):
    id: str
    body: str
    user_id: str
    media_id: str
    created_at: datetime

    class Config:
        from_attributes = True