"""
JWT token generation and validation utilities
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from uuid import UUID
from jose import jwt
from jose.exceptions import JWTError as PyJWTError
import base64
from app.core.config import settings


def decode_key(key_str: str) -> bytes:
    """Decode base64 encoded key string to bytes"""
    return base64.b64decode(key_str)


def create_access_token(
    user_id: UUID, app_id: str, email: str, expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT access token

    Args:
        user_id: User UUID
        app_id: Application ID
        email: User email
        expires_delta: Optional expiration delta (defaults to 15 minutes)

    Returns:
        Encoded JWT token string
    """
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    expire = datetime.utcnow() + expires_delta

    payload = {
        "sub": str(user_id),
        "app_id": app_id,
        "email": email,
        "iat": datetime.utcnow(),
        "exp": expire,
        "type": "access",
    }

    private_key = decode_key(settings.JWT_PRIVATE_KEY)
    token = jwt.encode(payload, private_key, algorithm=settings.JWT_ALGORITHM)
    return token


def create_refresh_token(
    user_id: UUID,
    app_id: str,
    session_id: UUID,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    Create a JWT refresh token

    Args:
        user_id: User UUID
        app_id: Application ID
        session_id: Session UUID
        expires_delta: Optional expiration delta (defaults to 7 days)

    Returns:
        Encoded JWT token string
    """
    if expires_delta is None:
        expires_delta = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    expire = datetime.utcnow() + expires_delta

    payload = {
        "sub": str(user_id),
        "app_id": app_id,
        "session_id": str(session_id),
        "iat": datetime.utcnow(),
        "exp": expire,
        "type": "refresh",
    }

    private_key = decode_key(settings.JWT_PRIVATE_KEY)
    token = jwt.encode(payload, private_key, algorithm=settings.JWT_ALGORITHM)
    return token


def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify and decode a JWT token

    Args:
        token: JWT token string

    Returns:
        Decoded payload dict or None if invalid
    """
    try:
        public_key = decode_key(settings.JWT_PUBLIC_KEY)
        payload = jwt.decode(
            token,
            public_key,
            algorithms=[settings.JWT_ALGORITHM],
            options={"verify_exp": True},
        )
        return payload
    except PyJWTError:
        return None


def decode_token_without_verification(token: str) -> Optional[Dict[str, Any]]:
    """
    Decode a JWT token without verification (for debugging/logging)

    Args:
        token: JWT token string

    Returns:
        Decoded payload dict or None if invalid format
    """
    try:
        return jwt.decode(token, "", options={"verify_signature": False})
    except PyJWTError:
        return None
