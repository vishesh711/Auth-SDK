"""
Pydantic schemas for API Key models
"""
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from uuid import UUID
from typing import Optional


class APIKeyBase(BaseModel):
    """Base API key schema"""
    label: Optional[str] = Field(None, max_length=255)


class APIKeyCreate(APIKeyBase):
    """Schema for API key creation"""
    pass


class APIKeyResponse(APIKeyBase):
    """Schema for API key response"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    app_id: str
    created_at: datetime
    last_used_at: Optional[datetime] = None
    revoked: bool


class APIKeyWithPlaintext(APIKeyResponse):
    """Schema for API key with plaintext (only returned once)"""
    key: str

