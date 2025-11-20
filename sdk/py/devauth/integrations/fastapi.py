"""
FastAPI integration for DevAuth
"""
from typing import Optional
from fastapi import Depends, HTTPException, status, Header
from devauth.client import DevAuthClient, User
from devauth.exceptions import AuthenticationError


# Global client instance (should be initialized in app startup)
_client: Optional[DevAuthClient] = None


def init_devauth(
    app_id: str,
    api_key: str,
    base_url: str = "https://api.devauth.dev/v1"
):
    """Initialize DevAuth client"""
    global _client
    _client = DevAuthClient(app_id=app_id, api_key=api_key, base_url=base_url)


async def get_current_user(
    authorization: str = Header(..., alias="Authorization"),
    x_app_id: str = Header(..., alias="x-app-id"),
) -> User:
    """
    FastAPI dependency to get current authenticated user
    
    Usage:
        @app.get("/protected")
        async def protected_route(user: User = Depends(get_current_user)):
            return {"user_id": user.id}
    """
    if _client is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="DevAuth client not initialized"
        )
    
    # Extract token
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format"
        )
    
    token = authorization[7:]  # Remove "Bearer " prefix
    
    try:
        user = await _client.verify_token(token)
        # Verify app_id matches
        if user.app_id != x_app_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token does not belong to this application"
            )
        return user
    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
