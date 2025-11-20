"""
Pydantic schemas for request/response validation
"""

from app.schemas.user import UserCreate, UserLogin, UserResponse, UserUpdate
from app.schemas.token import (
    TokenPair,
    TokenRefresh,
    TokenIntrospection,
    TokenIntrospectionUser,
)
from app.schemas.application import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationWithSecret,
)
from app.schemas.api_key import APIKeyCreate, APIKeyResponse, APIKeyWithPlaintext
from app.schemas.developer import (
    DeveloperSignup,
    DeveloperLogin,
    DeveloperResponse,
    DeveloperTokenResponse,
)
from app.schemas.email import (
    EmailVerificationRequest,
    EmailVerificationConfirm,
    EmailVerificationResponse,
)
from app.schemas.password import (
    PasswordResetRequest,
    PasswordResetConfirm,
    PasswordResetResponse,
)
from app.schemas.error import ErrorResponse, ErrorDetail

__all__ = [
    # User
    "UserCreate",
    "UserLogin",
    "UserResponse",
    "UserUpdate",
    # Token
    "TokenPair",
    "TokenRefresh",
    "TokenIntrospection",
    "TokenIntrospectionUser",
    # Application
    "ApplicationCreate",
    "ApplicationResponse",
    "ApplicationWithSecret",
    # API Key
    "APIKeyCreate",
    "APIKeyResponse",
    "APIKeyWithPlaintext",
    # Developer
    "DeveloperSignup",
    "DeveloperLogin",
    "DeveloperResponse",
    "DeveloperTokenResponse",
    # Email
    "EmailVerificationRequest",
    "EmailVerificationConfirm",
    "EmailVerificationResponse",
    # Password
    "PasswordResetRequest",
    "PasswordResetConfirm",
    "PasswordResetResponse",
    # Error
    "ErrorResponse",
    "ErrorDetail",
]
