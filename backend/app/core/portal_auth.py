"""
Portal-specific authentication middleware
"""

from fastapi import Header, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from app.core.database import get_db
from app.models import Developer
from app.utils import verify_token


async def get_portal_developer(
    authorization: str = Header(..., alias="Authorization"),
    db: AsyncSession = Depends(get_db),
) -> Developer:
    """
    Get authenticated developer for portal endpoints

    Args:
        authorization: Authorization header with Bearer token
        db: Database session

    Returns:
        Developer object

    Raises:
        HTTPException: If token is invalid
    """
    # Extract token
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "INVALID_TOKEN",
                "message": "Invalid authorization header format",
            },
        )

    token = authorization[7:]  # Remove "Bearer " prefix

    # Verify token (portal uses app_id="portal")
    payload = verify_token(token)
    if not payload or payload.get("app_id") != "portal":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_TOKEN", "message": "Invalid or expired token"},
        )

    # Get developer from database
    developer_id = UUID(payload.get("sub"))
    stmt = select(Developer).where(Developer.id == developer_id)
    result = await db.execute(stmt)
    developer = result.scalar_one_or_none()

    if not developer:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "DEVELOPER_NOT_FOUND", "message": "Developer not found"},
        )

    return developer
