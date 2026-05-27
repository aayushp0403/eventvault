from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid, os, shutil

from app.db.database import get_db
from app.models.user import User, UserRole
from app.models.media import Media, MediaType
from app.models.event import Event
from app.models.social import Like, Comment, Notification
from app.schemas.media import MediaOut, CommentCreate, CommentOut
from app.api.v1.deps import get_current_user, admin_or_photo
from app.core.config import settings
from app.services.thumbnail import generate_thumbnail
from app.services.ai_tagging import generate_tags
from app.services.watermark import apply_watermark

router = APIRouter()

UPLOAD_PHOTO_DIR = f"{settings.UPLOAD_DIR}/photos"
UPLOAD_THUMB_DIR = f"{settings.UPLOAD_DIR}/thumbnails"
WATERMARK_DIR    = f"{settings.UPLOAD_DIR}/watermarked"

def _save_file(upload: UploadFile, dest_dir: str) -> tuple[str, str]:
    ext      = os.path.splitext(upload.filename)[1].lower()
    filename = f"{uuid.uuid4()}{ext}"
    path     = os.path.join(dest_dir, filename)
    os.makedirs(dest_dir, exist_ok=True)
    with open(path, "wb") as f:
        shutil.copyfileobj(upload.file, f)
    return filename, path

def _notify(db: Session, user_id: str, actor_id: str, notif_type: str, message: str, media_id: str):
    if user_id == actor_id:
        return
    n = Notification(user_id=user_id, actor_id=actor_id, notif_type=notif_type, message=message, media_id=media_id)
    db.add(n)
    db.commit()

# ── Upload single or bulk ──────────────────────────────────────────────────────
@router.post("/upload", status_code=201)
async def upload_media(
    event_id: str = Form(...),
    album_id: Optional[str] = Form(None),
    caption: Optional[str] = Form(None),
    is_public: bool = Form(True),
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_photo),
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(404, "Event not found")

    results = []
    for upload in files:
        content_type = upload.content_type or ""
        if content_type in settings.allowed_image_list:
            media_type = MediaType.photo
            dest_dir   = UPLOAD_PHOTO_DIR
        elif content_type in settings.allowed_video_list:
            media_type = MediaType.video
            dest_dir   = f"{settings.UPLOAD_DIR}/videos"
        else:
            continue

        filename, file_path = _save_file(upload, dest_dir)
        file_size = os.path.getsize(file_path)

        # thumbnail + AI tags for photos only
        thumb_path = None
        ai_tags    = []
        width = height = None
        if media_type == MediaType.photo:
            thumb_name = f"thumb_{filename}"
            thumb_path = os.path.join(UPLOAD_THUMB_DIR, thumb_name)
            try:
                generate_thumbnail(file_path, thumb_path)
                ai_tags = generate_tags(file_path)
                from PIL import Image
                with Image.open(file_path) as img:
                    width, height = img.size
            except Exception:
                pass

        media = Media(
            filename=filename,
            original_name=upload.filename,
            file_path=file_path,
            thumbnail_path=thumb_path,
            media_type=media_type,
            file_size=file_size,
            width=width,
            height=height,
            caption=caption,
            ai_tags=ai_tags,
            is_public=is_public,
            event_id=event_id,
            album_id=album_id,
            uploader_id=current_user.id,
        )
        db.add(media)
        db.commit()
        db.refresh(media)
        results.append({"id": media.id, "filename": media.filename, "ai_tags": ai_tags})

    return {"uploaded": len(results), "files": results}


# ── List media for an event ────────────────────────────────────────────────────
@router.get("/event/{event_id}", response_model=List[MediaOut])
def list_event_media(
    event_id: str,
    tag: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Media).filter(Media.event_id == event_id)
    if current_user.role == UserRole.viewer:
        q = q.filter(Media.is_public == True)
    results = q.order_by(Media.created_at.desc()).all()

    if tag:
        results = [m for m in results if tag in (m.ai_tags or [])]
    if search:
        results = [m for m in results if search.lower() in (m.caption or "").lower()]

    out = []
    for m in results:
        like_count    = db.query(Like).filter(Like.media_id == m.id).count()
        comment_count = db.query(Comment).filter(Comment.media_id == m.id).count()
        o = MediaOut.from_orm(m)
        o.like_count    = like_count
        o.comment_count = comment_count
        out.append(o)
    return out


# ── Single media ───────────────────────────────────────────────────────────────
@router.get("/{media_id}", response_model=MediaOut)
def get_media(media_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    m = db.query(Media).filter(Media.id == media_id).first()
    if not m:
        raise HTTPException(404, "Media not found")
    o = MediaOut.from_orm(m)
    o.like_count    = db.query(Like).filter(Like.media_id == m.id).count()
    o.comment_count = db.query(Comment).filter(Comment.media_id == m.id).count()
    return o


# ── Download with watermark ────────────────────────────────────────────────────
@router.get("/{media_id}/download")
def download_media(
    media_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    m = db.query(Media).filter(Media.id == media_id).first()
    if not m:
        raise HTTPException(404, "Media not found")
    if m.media_type != MediaType.photo:
        return FileResponse(m.file_path, filename=m.original_name)

    event       = db.query(Event).filter(Event.id == m.event_id).first()
    out_path    = os.path.join(WATERMARK_DIR, f"wm_{m.filename}")
    os.makedirs(WATERMARK_DIR, exist_ok=True)
    apply_watermark(
        m.file_path, out_path,
        club_name  = settings.WATERMARK_TEXT,
        event_name = event.title if event else "Event",
        user_role  = current_user.role.value,
    )
    return FileResponse(out_path, filename=f"watermarked_{m.original_name}", media_type="image/jpeg")


# ── Delete ─────────────────────────────────────────────────────────────────────
@router.delete("/{media_id}", status_code=204)
def delete_media(media_id: str, db: Session = Depends(get_db), current_user: User = Depends(admin_or_photo)):
    m = db.query(Media).filter(Media.id == media_id).first()
    if not m:
        raise HTTPException(404, "Not found")
    if m.uploader_id != current_user.id and current_user.role != UserRole.admin:
        raise HTTPException(403, "Not authorized")
    for path in [m.file_path, m.thumbnail_path]:
        if path and os.path.exists(path):
            os.remove(path)
    db.delete(m)
    db.commit()


# ── Like ───────────────────────────────────────────────────────────────────────
@router.post("/{media_id}/like", status_code=200)
def toggle_like(media_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    m = db.query(Media).filter(Media.id == media_id).first()
    if not m:
        raise HTTPException(404, "Media not found")
    existing = db.query(Like).filter(Like.user_id == current_user.id, Like.media_id == media_id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"liked": False, "count": db.query(Like).filter(Like.media_id == media_id).count()}
    like = Like(user_id=current_user.id, media_id=media_id)
    db.add(like)
    db.commit()
    _notify(db, m.uploader_id, current_user.id, "like",
            f"{current_user.username} liked your photo", media_id)
    return {"liked": True, "count": db.query(Like).filter(Like.media_id == media_id).count()}


# ── Comment ────────────────────────────────────────────────────────────────────
@router.post("/{media_id}/comment", response_model=CommentOut, status_code=201)
def add_comment(
    media_id: str,
    payload: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    m = db.query(Media).filter(Media.id == media_id).first()
    if not m:
        raise HTTPException(404, "Media not found")
    comment = Comment(body=payload.body, user_id=current_user.id, media_id=media_id)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    _notify(db, m.uploader_id, current_user.id, "comment",
            f"{current_user.username} commented: {payload.body[:40]}", media_id)
    return comment

@router.get("/{media_id}/comments", response_model=List[CommentOut])
def get_comments(media_id: str, db: Session = Depends(get_db)):
    return db.query(Comment).filter(Comment.media_id == media_id).order_by(Comment.created_at.asc()).all()