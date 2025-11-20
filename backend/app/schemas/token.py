"""
Pydantic schemas for Token models
"""

from pydantic import BaseModel
from uuid import UUID
from typing import Optional


class TokenPair(BaseModel):
    """Schema for access and refresh token pair"""

    access_token: str
    refresh_token: str
    expires_in: int
    token_type: str = "Bearer"


class TokenRefresh(BaseModel):
    """Schema for token refresh request"""

    refresh_token: str


class TokenIntrospectionUser(BaseModel):
    """Schema for user info in token introspection"""

    id: UUID
    email: str
    app_id: str


class TokenIntrospection(BaseModel):
    """Schema for token introspection response"""

    active: bool
    user: Optional[TokenIntrospectionUser] = None
