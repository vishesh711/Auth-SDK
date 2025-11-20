"""
Pydantic schemas for password reset
"""
from pydantic import BaseModel, EmailStr, Field


class PasswordResetRequest(BaseModel):
    """Schema for password reset request"""
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Schema for password reset confirmation"""
    token: str
    new_password: str = Field(..., min_length=8, description="Password must be at least 8 characters")


class PasswordResetResponse(BaseModel):
    """Schema for password reset response"""
    success: bool = True

