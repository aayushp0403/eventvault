from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.user import UserRole

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    password: str
    role: UserRole = UserRole.viewer

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    email: str
    username: str
    full_name: str
    role: UserRole
    avatar_url: Optional[str]
    bio: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    full_name: Optional[str]
    bio: Optional[str]

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut