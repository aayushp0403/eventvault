from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.db.database import Base, engine
from app.models import user, event, album, media, social  # noqa
from app.api.v1.endpoints import auth, users
import os

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

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

app.include_router(auth.router,  prefix="/api/v1/auth",  tags=["Auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])

@app.get("/", tags=["Health"])
def root():
    return {"status": "online", "app": settings.APP_NAME, "version": settings.APP_VERSION}

@app.get("/api/health", tags=["Health"])
def health():
    return {"status": "healthy"}