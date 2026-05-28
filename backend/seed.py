"""
Run once to populate the DB with demo users, events, and placeholder media.
Usage: cd backend && source venv/bin/activate && python seed.py
"""
import sys, os, uuid, json
sys.path.insert(0, os.path.dirname(__file__))

from app.db.database import SessionLocal, engine
from app.db.init_db import init
from app.models.user   import User, UserRole
from app.models.event  import Event, EventCategory
from app.models.album  import Album
from app.models.media  import Media, MediaType
from app.core.security import get_password_hash
from PIL import Image, ImageDraw, ImageFont
import random

init()
db = SessionLocal()

# ── helpers ──────────────────────────────────────────────────────────────────

def make_placeholder(path: str, w: int, h: int, label: str, color: tuple):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img  = Image.new("RGB", (w, h), color=color)
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 28)
    except Exception:
        font = ImageFont.load_default()
    bbox = draw.textbbox((0, 0), label, font=font)
    tw, th = bbox[2]-bbox[0], bbox[3]-bbox[1]
    draw.text(((w-tw)//2, (h-th)//2), label, fill=(255,255,255), font=font)
    img.save(path, "JPEG", quality=85)

PALETTES = [
    (42, 82, 152),  (152, 42, 82),  (42, 152, 82),
    (120, 60, 180), (180, 120, 30), (30, 140, 180),
    (200, 80, 40),  (40, 160, 120), (100, 40, 160),
]

TAG_POOL = [
    ["nature","outdoor","landscape","greenery","sky"],
    ["crowd","people","group","event","gathering"],
    ["sports","action","competition","athlete","energy"],
    ["portrait","face","smile","candid","person"],
    ["culture","traditional","festival","heritage","dance"],
    ["night","lights","party","vivid","urban"],
    ["travel","architecture","city","landmark","exploration"],
    ["food","feast","cuisine","celebration","dining"],
]

# ── users ────────────────────────────────────────────────────────────────────

USERS = [
    dict(email="admin@demo.com",        username="admin",      full_name="Alex Admin",       role=UserRole.admin,        password="demo1234"),
    dict(email="photo@demo.com",        username="shooter",    full_name="Sam Shooter",      role=UserRole.photographer, password="demo1234"),
    dict(email="member@demo.com",       username="clubmember", full_name="Maya Member",      role=UserRole.club_member,  password="demo1234"),
    dict(email="viewer@demo.com",       username="viewer",     full_name="Vijay Viewer",     role=UserRole.viewer,       password="demo1234"),
]

created_users = {}
for u in USERS:
    existing = db.query(User).filter(User.email == u["email"]).first()
    if existing:
        created_users[u["username"]] = existing
        print(f"  ↳ user {u['email']} already exists, skipping")
        continue
    obj = User(
        email=u["email"], username=u["username"],
        full_name=u["full_name"], role=u["role"],
        hashed_password=get_password_hash(u["password"]),
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    created_users[u["username"]] = obj
    print(f"  ✅ created user {u['email']}")

admin_user = created_users["admin"]
photo_user = created_users["shooter"]

# ── events ───────────────────────────────────────────────────────────────────

from datetime import datetime, timedelta

EVENTS_DATA = [
    dict(title="Summer Cultural Fest 2025", description="Annual cultural extravaganza with performances, food stalls, and photography.", category=EventCategory.cultural,   is_public=True,  days_ago=5),
    dict(title="Tech Workshop — AI & Robotics", description="Hands-on workshop on emerging technologies hosted by the CS club.", category=EventCategory.workshop,   is_public=True,  days_ago=12),
    dict(title="Himalayan Trek Expedition",    description="7-day trek through breathtaking Himalayan trails.", category=EventCategory.trip,      is_public=True,  days_ago=30),
    dict(title="Annual Photography Competition", description="Club's flagship photography contest — open to all genres.", category=EventCategory.competition, is_public=True,  days_ago=8),
    dict(title="Members-Only Rooftop Party",   description="Exclusive end-of-semester party for club members.", category=EventCategory.party,     is_public=False, days_ago=2),
    dict(title="Sports Day Photoshoot",        description="Official photoshoot for all inter-college sports events.", category=EventCategory.photoshoot, is_public=True,  days_ago=15),
]

created_events = []
for ed in EVENTS_DATA:
    existing = db.query(Event).filter(Event.title == ed["title"]).first()
    if existing:
        created_events.append(existing)
        print(f"  ↳ event '{ed['title']}' already exists, skipping")
        continue
    ev = Event(
        title=ed["title"], description=ed["description"],
        category=ed["category"], is_public=ed["is_public"],
        creator_id=photo_user.id,
        event_date=datetime.utcnow() - timedelta(days=ed["days_ago"]),
        location=random.choice(["Main Campus", "Auditorium Hall", "Sports Ground", "Rooftop Terrace", "Conference Room"]),
    )
    db.add(ev)
    db.commit()
    db.refresh(ev)
    created_events.append(ev)
    print(f"  ✅ created event '{ed['title']}'")

# ── albums ───────────────────────────────────────────────────────────────────

for ev in created_events:
    existing_album = db.query(Album).filter(Album.event_id == ev.id).first()
    if existing_album:
        continue
    album = Album(
        title=f"{ev.title} — Main Album",
        description="Auto-generated album",
        is_public=ev.is_public,
        event_id=ev.id,
        creator_id=photo_user.id,
    )
    db.add(album)
db.commit()

# ── media (placeholder images) ───────────────────────────────────────────────

PHOTO_DIR = "uploads/photos"
THUMB_DIR = "uploads/thumbnails"
os.makedirs(PHOTO_DIR, exist_ok=True)
os.makedirs(THUMB_DIR, exist_ok=True)

PHOTOS_PER_EVENT = 12
total_media = 0

for ev_idx, ev in enumerate(created_events):
    existing_count = db.query(Media).filter(Media.event_id == ev.id).count()
    if existing_count >= PHOTOS_PER_EVENT:
        print(f"  ↳ event '{ev.title}' already has media, skipping")
        continue

    album = db.query(Album).filter(Album.event_id == ev.id).first()
    tags_set = random.sample(TAG_POOL, 3)
    base_color = PALETTES[ev_idx % len(PALETTES)]

    for i in range(PHOTOS_PER_EVENT):
        uid      = str(uuid.uuid4())[:8]
        filename = f"{uid}.jpg"
        fpath    = os.path.join(PHOTO_DIR, filename)
        tpath    = os.path.join(THUMB_DIR, f"thumb_{filename}")

        # vary hue slightly per photo
        r = min(255, base_color[0] + random.randint(-30, 30))
        g = min(255, base_color[1] + random.randint(-30, 30))
        b = min(255, base_color[2] + random.randint(-30, 30))
        label = f"{ev.title[:18]}\n#{i+1}"

        make_placeholder(fpath,  800, 800, label, (r, g, b))
        make_placeholder(tpath,  400, 400, label, (r, g, b))

        ai_tags = list({tag for pool in random.sample(tags_set, 2) for tag in random.sample(pool, 2)})

        uploader = random.choice([admin_user, photo_user])
        media = Media(
            filename=filename,
            original_name=f"photo_{i+1}.jpg",
            file_path=fpath,
            thumbnail_path=tpath,
            media_type=MediaType.photo,
            file_size=random.randint(200_000, 800_000),
            width=800, height=800,
            caption=random.choice([
                "Captured the perfect moment ✨",
                "Golden hour vibes 🌅",
                "Behind the scenes 📸",
                "Squad goals 🎉",
                None, None,
            ]),
            ai_tags=ai_tags,
            is_public=ev.is_public,
            event_id=ev.id,
            album_id=album.id if album else None,
            uploader_id=uploader.id,
        )
        db.add(media)
        total_media += 1

    db.commit()
    print(f"  ✅ seeded {PHOTOS_PER_EVENT} photos for '{ev.title}'")

# ── social interactions ───────────────────────────────────────────────────────

from app.models.social import Like, Comment, Notification

all_media = db.query(Media).all()
all_users = list(created_users.values())

COMMENTS_POOL = [
    "Absolutely stunning shot! 🔥",
    "Love the composition here",
    "This captures the vibe perfectly",
    "Incredible lighting work",
    "One of the best from the event!",
    "Can't believe I missed this moment",
    "The colors are amazing 😍",
    "Frame-worthy for sure!",
]

likes_added = 0
comments_added = 0

for media in all_media:
    # random likes
    likers = random.sample(all_users, random.randint(0, min(3, len(all_users))))
    for u in likers:
        exists = db.query(Like).filter(Like.user_id == u.id, Like.media_id == media.id).first()
        if not exists:
            db.add(Like(user_id=u.id, media_id=media.id))
            likes_added += 1

    # random comment
    if random.random() > 0.5:
        commenter = random.choice(all_users)
        db.add(Comment(
            body=random.choice(COMMENTS_POOL),
            user_id=commenter.id,
            media_id=media.id,
        ))
        comments_added += 1

db.commit()

# ── summary ───────────────────────────────────────────────────────────────────

print("\n" + "═"*52)
print("  🎉  SEED COMPLETE")
print("═"*52)
print(f"  Users    : {len(created_users)}")
print(f"  Events   : {len(created_events)}")
print(f"  Photos   : {total_media}")
print(f"  Likes    : {likes_added}")
print(f"  Comments : {comments_added}")
print("═"*52)
print("\n  Demo credentials (all passwords: demo1234)")
print("  ┌─────────────────────────────────────────┐")
for u in USERS:
    print(f"  │  {u['role'].value:<15}  {u['email']:<25}│")
print("  └─────────────────────────────────────────┘\n")

db.close()