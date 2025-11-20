"""
Pydantic schemas for Application models
"""
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from uuid import UUID


class ApplicationBase(BaseModel):
    """Base application schema"""
    name: str = Field(..., min_length=1, max_length=255)
    environment: str = Field(..., pattern="^(dev|prod)$")


class ApplicationCreate(ApplicationBase):
    """Schema for application creation"""
    pass


class ApplicationResponse(ApplicationBase):
    """Schema for application response"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    developer_id: UUID
    app_id: str
    created_at: datetime
    updated_at: datetime


class ApplicationWithSecret(ApplicationResponse):
    """Schema for application with secret (only returned once)"""
    app_secret: str

