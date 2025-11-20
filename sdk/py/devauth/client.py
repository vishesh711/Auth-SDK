"""
DevAuth Client
Main client class for token validation
"""

from typing import Optional
import httpx
from pydantic import BaseModel


class User(BaseModel):
    """User model"""
    id: str
    email: str
    app_id: str


class TokenIntrospection(BaseModel):
    """Token introspection response"""
    active: bool
    user: Optional[User] = None


class DevAuthClient:
    """DevAuth client for token validation"""
    
    def __init__(
        self,
        app_id: str,
        api_key: str,
        base_url: str = "https://api.devauth.dev/v1"
    ):
        self.app_id = app_id
        self.api_key = api_key
        self.base_url = base_url
        self.client = httpx.AsyncClient()
    
    async def verify_token(self, token: str) -> User:
        """Verify access token and return user info"""
        introspection = await self.introspect_token(token)
        if not introspection.active or not introspection.user:
            from devauth.exceptions import AuthenticationError
            raise AuthenticationError("Invalid or expired token")
        return introspection.user
    
    async def introspect_token(self, token: str) -> TokenIntrospection:
        """Call introspection endpoint"""
        try:
            response = await self.client.post(
                f"{self.base_url}/auth/introspect",
                json={"token": token},
                headers={
                    "x-app-id": self.app_id,
                    "x-api-key": self.api_key,
                },
                timeout=10.0
            )
            response.raise_for_status()
            data = response.json()
            return TokenIntrospection(**data)
        except httpx.HTTPStatusError as e:
            from devauth.exceptions import AuthenticationError
            raise AuthenticationError(f"Token validation failed: {e.response.text}")
        except Exception as e:
            from devauth.exceptions import DevAuthError
            raise DevAuthError(f"Token validation error: {str(e)}")
    
    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()
