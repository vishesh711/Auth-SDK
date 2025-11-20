"""
Pydantic schemas for email verification
"""

from pydantic import BaseModel, EmailStr


class EmailVerificationRequest(BaseModel):
    """Schema for email verification request"""

    email: EmailStr


class EmailVerificationConfirm(BaseModel):
    """Schema for email verification confirmation"""

    token: str


class EmailVerificationResponse(BaseModel):
    """Schema for email verification response"""

    success: bool = True
