from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.db.database import get_db
from app.models.user import User, UserRole
from app.models.album import Album
from app.api.v1.deps import get_current_user, admin_or_photo

router = APIRouter()

class AlbumCreate(BaseModel):
    title: str
    description: str | None = None
    is_public: bool = True
    event_id: str

class AlbumOut(BaseModel):
    id: str
    title: str
    description: str | None
    is_public: bool
    event_id: str
    creator_id: str
    class Config:
        from_attributes = True

@router.post("", response_model=AlbumOut, status_code=201)
def create_album(payload: AlbumCreate, db: Session = Depends(get_db), current_user: User = Depends(admin_or_photo)):
    album = Album(**payload.dict(), creator_id=current_user.id)
    db.add(album)
    db.commit()
    db.refresh(album)
    return album

@router.get("/event/{event_id}", response_model=List[AlbumOut])
def list_albums(event_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    q = db.query(Album).filter(Album.event_id == event_id)
    if current_user.role == UserRole.viewer:
        q = q.filter(Album.is_public == True)
    return q.all()

@router.delete("/{album_id}", status_code=204)
def delete_album(album_id: str, db: Session = Depends(get_db), current_user: User = Depends(admin_or_photo)):
    album = db.query(Album).filter(Album.id == album_id).first()
    if not album:
        raise HTTPException(404, "Album not found")
    db.delete(album)
    db.commit()