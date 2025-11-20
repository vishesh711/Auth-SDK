"""
Pydantic schemas for User models
"""
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime
from uuid import UUID
from typing import Optional, Dict, Any


class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    metadata: Optional[Dict[str, Any]] = None


class UserCreate(UserBase):
    """Schema for user creation"""
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")


class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr
    password: str


class UserResponse(UserBase):
    """Schema for user response"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    app_id: str
    email_verified: bool
    created_at: datetime
    updated_at: datetime
    last_login_at: Optional[datetime] = None


class UserUpdate(BaseModel):
    """Schema for user update"""
    metadata: Optional[Dict[str, Any]] = None

