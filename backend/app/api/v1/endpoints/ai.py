from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.models.media import Media, MediaType
from app.api.v1.deps import get_current_user
from app.services.face_match import find_matching_photos
from app.core.config import settings
import shutil, os, uuid

router = APIRouter()

AVATAR_DIR = f"{settings.UPLOAD_DIR}/avatars"

@router.post("/selfie")
async def upload_selfie(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    os.makedirs(AVATAR_DIR, exist_ok=True)
    ext      = os.path.splitext(file.filename)[1]
    filename = f"selfie_{current_user.id}{ext}"
    path     = os.path.join(AVATAR_DIR, filename)
    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    current_user.selfie_path = path
    db.commit()
    return {"message": "Selfie saved", "path": path}


@router.get("/my-photos")
def find_my_photos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.selfie_path or not os.path.exists(current_user.selfie_path):
        raise HTTPException(400, "Upload a selfie first via POST /api/v1/ai/selfie")

    all_media  = db.query(Media).filter(Media.media_type == MediaType.photo).all()
    photo_paths = [m.file_path for m in all_media if os.path.exists(m.file_path)]
    matches    = find_matching_photos(current_user.selfie_path, photo_paths)

    result = []
    for m in all_media:
        if m.file_path in matches:
            result.append({"id": m.id, "file_path": m.file_path,
                           "thumbnail_path": m.thumbnail_path, "event_id": m.event_id})
    return {"matched": len(result), "photos": result}


@router.get("/search")
def ai_search(
    tag: str | None = None,
    event_name: str | None = None,
    uploader: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models.event import Event
    from app.models.user import User as UserModel
    q = db.query(Media)
    results = q.all()

    if tag:
        results = [m for m in results if tag.lower() in [t.lower() for t in (m.ai_tags or [])]]
    if event_name:
        eids = [e.id for e in db.query(Event).filter(Event.title.ilike(f"%{event_name}%")).all()]
        results = [m for m in results if m.event_id in eids]
    if uploader:
        uids = [u.id for u in db.query(UserModel).filter(UserModel.username.ilike(f"%{uploader}%")).all()]
        results = [m for m in results if m.uploader_id in uids]

    return [{"id": m.id, "thumbnail_path": m.thumbnail_path,
             "ai_tags": m.ai_tags, "event_id": m.event_id} for m in results]