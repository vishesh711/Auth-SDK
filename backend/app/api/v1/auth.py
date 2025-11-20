"""
Authentication API endpoints
"""

from fastapi import APIRouter, Depends, status, Header, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.middleware import get_api_key_context, get_current_user, Application
from app.schemas import (
    UserCreate,
    UserLogin,
    UserResponse,
    TokenPair,
    TokenRefresh,
    EmailVerificationRequest,
    EmailVerificationConfirm,
    EmailVerificationResponse,
    PasswordResetRequest,
    PasswordResetConfirm,
    PasswordResetResponse,
)
from app.services.auth import auth_service
from app.models import User

router = APIRouter()


@router.post(
    "/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
async def signup(
    user_data: UserCreate,
    application: Application = Depends(get_api_key_context),
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """Register a new user"""
    user = await auth_service.register_user(
        db=db, app_id=application.app_id, user_data=user_data
    )
    return user


@router.post("/login", response_model=TokenPair)
async def login(
    credentials: UserLogin,
    request: Request,
    application: Application = Depends(get_api_key_context),
    db: AsyncSession = Depends(get_db),
):
    """Login user and get access/refresh tokens"""
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    user, access_token, refresh_token = await auth_service.login(
        db=db,
        app_id=application.app_id,
        credentials=credentials,
        ip_address=ip_address,
        user_agent=user_agent,
    )

    return TokenPair(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=900,  # 15 minutes
        token_type="Bearer",
    )


@router.get("/me", response_model=UserResponse)
async def get_me(user: User = Depends(get_current_user)):
    """Get current user information"""
    return user


@router.post("/refresh", response_model=TokenPair)
async def refresh(
    token_data: TokenRefresh,
    x_app_id: str = Header(..., alias="x-app-id"),
    db: AsyncSession = Depends(get_db),
):
    """Refresh access token"""
    access_token, new_refresh_token = await auth_service.refresh_token(
        db=db, app_id=x_app_id, refresh_token=token_data.refresh_token
    )

    return TokenPair(
        access_token=access_token,
        refresh_token=new_refresh_token or token_data.refresh_token,
        expires_in=900,
        token_type="Bearer",
    )


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(
    token_data: TokenRefresh,
    x_app_id: str = Header(..., alias="x-app-id"),
    db: AsyncSession = Depends(get_db),
):
    """Logout user by revoking session"""
    await auth_service.logout(
        db=db, app_id=x_app_id, refresh_token=token_data.refresh_token
    )
    return {"success": True}


@router.post("/email/verify/request", response_model=EmailVerificationResponse)
async def request_email_verification(
    request_data: EmailVerificationRequest,
    application: Application = Depends(get_api_key_context),
    db: AsyncSession = Depends(get_db),
):
    """Request email verification"""
    await auth_service.request_email_verification(
        db=db, app_id=application.app_id, email=request_data.email
    )
    return EmailVerificationResponse(success=True)


@router.post("/email/verify/confirm", response_model=EmailVerificationResponse)
async def confirm_email_verification(
    confirm_data: EmailVerificationConfirm,
    x_app_id: str = Header(..., alias="x-app-id"),
    db: AsyncSession = Depends(get_db),
):
    """Confirm email verification"""
    await auth_service.verify_email(db=db, app_id=x_app_id, token=confirm_data.token)
    return EmailVerificationResponse(success=True)


@router.post("/password/reset/request", response_model=PasswordResetResponse)
async def request_password_reset(
    request_data: PasswordResetRequest,
    application: Application = Depends(get_api_key_context),
    db: AsyncSession = Depends(get_db),
):
    """Request password reset"""
    await auth_service.request_password_reset(
        db=db, app_id=application.app_id, email=request_data.email
    )
    return PasswordResetResponse(success=True)


@router.post("/password/reset/confirm", response_model=PasswordResetResponse)
async def confirm_password_reset(
    confirm_data: PasswordResetConfirm,
    x_app_id: str = Header(..., alias="x-app-id"),
    db: AsyncSession = Depends(get_db),
):
    """Confirm password reset"""
    await auth_service.confirm_password_reset(
        db=db,
        app_id=x_app_id,
        token=confirm_data.token,
        new_password=confirm_data.new_password,
    )
    return PasswordResetResponse(success=True)
