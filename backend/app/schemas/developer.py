"""
Pydantic schemas for Developer models
"""

from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime
from uuid import UUID
from typing import Optional


class DeveloperBase(BaseModel):
    """Base developer schema"""

    email: EmailStr
    name: Optional[str] = None


class DeveloperSignup(DeveloperBase):
    """Schema for developer signup"""

    password: str = Field(
        ..., min_length=8, description="Password must be at least 8 characters"
    )


class DeveloperLogin(BaseModel):
    """Schema for developer login"""

    email: EmailStr
    password: str


class DeveloperResponse(DeveloperBase):
    """Schema for developer response"""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime


class DeveloperTokenResponse(BaseModel):
    """Schema for developer login response"""

    access_token: str
    developer: DeveloperResponse
