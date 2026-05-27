from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.db.database import Base, engine
import os

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded media as static files
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# ── Routers (imported as they are built in future steps) ──────────────────────
# from app.api.v1.endpoints import auth, users, events, media, social, ai
# app.include_router(auth.router,   prefix="/api/v1/auth",   tags=["Auth"])
# app.include_router(users.router,  prefix="/api/v1/users",  tags=["Users"])
# app.include_router(events.router, prefix="/api/v1/events", tags=["Events"])
# app.include_router(media.router,  prefix="/api/v1/media",  tags=["Media"])
# app.include_router(social.router, prefix="/api/v1/social", tags=["Social"])
# app.include_router(ai.router,     prefix="/api/v1/ai",     tags=["AI"])

@app.get("/", tags=["Health"])
def root():
    return {"status": "online", "app": settings.APP_NAME, "version": settings.APP_VERSION}

@app.get("/api/health", tags=["Health"])
def health():
    return {"status": "healthy"}