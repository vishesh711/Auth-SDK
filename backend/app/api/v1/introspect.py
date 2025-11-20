"""
Token introspection API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.core.database import get_db
from app.core.middleware import get_api_key_context, Application
from app.schemas import TokenIntrospection, TokenIntrospectionUser
from app.utils import verify_token
from app.models import User

router = APIRouter()


@router.post("/introspect", response_model=TokenIntrospection)
async def introspect_token(
    token: str,
    application: Application = Depends(get_api_key_context),
    db: AsyncSession = Depends(get_db)
):
    """Introspect access token"""
    # Verify token
    payload = verify_token(token)
    
    if not payload or payload.get("type") != "access":
        return TokenIntrospection(active=False)
    
    # Verify app_id matches
    if payload.get("app_id") != application.app_id:
        return TokenIntrospection(active=False)
    
    # Get user
    user_id = UUID(payload.get("sub"))
    from sqlalchemy import select
    
    stmt = select(User).where(User.id == user_id, User.app_id == application.app_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        return TokenIntrospection(active=False)
    
    return TokenIntrospection(
        active=True,
        user=TokenIntrospectionUser(
            id=user.id,
            email=user.email,
            app_id=user.app_id
        )
    )
