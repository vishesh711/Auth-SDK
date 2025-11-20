"""
API authentication and rate limiting middleware
"""

from fastapi import Request, HTTPException, status, Header, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models import APIKey, Application
from app.utils import hash_api_key, verify_token
from app.services.rate_limiter import rate_limiter


async def get_api_key_context(
    request: Request,
    x_app_id: str = Header(..., alias="x-app-id"),
    x_api_key: str = Header(..., alias="x-api-key"),
    db: AsyncSession = Depends(get_db),
) -> Application:
    """
    Validate API key and return application context

    Args:
        request: FastAPI request
        x_app_id: Application ID header
        x_api_key: API key header
        db: Database session

    Returns:
        Application object

    Raises:
        HTTPException: If API key is invalid or revoked
    """

    # Hash API key
    api_key_hash = hash_api_key(x_api_key)

    # Find API key
    stmt = (
        select(APIKey)
        .join(Application)
        .where(
            APIKey.key_hash == api_key_hash,
            APIKey.app_id == x_app_id,
            APIKey.revoked.is_(False),
        )
    )
    result = await db.execute(stmt)
    api_key = result.scalar_one_or_none()

    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_API_KEY", "message": "Invalid or revoked API key"},
        )

    # Update last used timestamp
    from datetime import datetime

    api_key.last_used_at = datetime.utcnow()
    await db.commit()

    # Get application
    app_stmt = select(Application).where(Application.app_id == x_app_id)
    app_result = await db.execute(app_stmt)
    application = app_result.scalar_one()

    return application


async def get_current_user(
    request: Request,
    authorization: str = Header(..., alias="Authorization"),
    x_app_id: str = Header(..., alias="x-app-id"),
    db: AsyncSession = Depends(get_db),
):
    """
    Validate access token and return user context

    Args:
        request: FastAPI request
        authorization: Authorization header with Bearer token
        x_app_id: Application ID header
        db: Database session

    Returns:
        User object from token

    Raises:
        HTTPException: If token is invalid or expired
    """
    if db is None:
        async for session in get_db():
            db = session
            break

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

    # Verify token
    payload = verify_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_TOKEN", "message": "Invalid or expired token"},
        )

    # Verify app_id matches
    if payload.get("app_id") != x_app_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "INVALID_TOKEN",
                "message": "Token does not belong to this application",
            },
        )

    # Get user from database
    from app.models import User
    from uuid import UUID

    user_id = UUID(payload.get("sub"))
    stmt = select(User).where(User.id == user_id, User.app_id == x_app_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "USER_NOT_FOUND", "message": "User not found"},
        )

    return user


async def rate_limit_middleware(request: Request, call_next):
    """
    Rate limiting middleware

    Args:
        request: FastAPI request
        call_next: Next middleware/route handler

    Returns:
        Response with rate limit headers

    Raises:
        HTTPException: If rate limit exceeded
    """
    # Get API key from headers
    api_key = request.headers.get("x-api-key")

    if api_key:
        # Rate limit by API key
        from app.utils import hash_api_key

        identifier = hash_api_key(api_key)
    else:
        # Rate limit by IP address
        identifier = request.client.host if request.client else "unknown"

    # Check rate limit
    is_allowed, remaining = await rate_limiter.check_rate_limit(identifier)

    # Add rate limit headers
    response = await call_next(request)
    response.headers["X-RateLimit-Limit"] = str(rate_limiter.requests_per_minute)
    response.headers["X-RateLimit-Remaining"] = str(remaining)

    if not is_allowed:
        retry_after = 60  # 1 minute
        response.headers["Retry-After"] = str(retry_after)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "code": "RATE_LIMIT_EXCEEDED",
                "message": f"Rate limit exceeded. Maximum {rate_limiter.requests_per_minute} requests per minute.",
            },
        )

    return response
