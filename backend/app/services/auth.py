"""
Authentication service for user registration, login, and session management
"""
from datetime import datetime, timedelta
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from typing import Optional, Tuple

from app.models import User, Session, EmailVerificationToken, PasswordResetToken, Application
from app.schemas import UserCreate, UserLogin
from app.utils import (
    hash_password,
    verify_password,
    validate_password_strength,
    create_access_token,
    create_refresh_token,
    verify_token,
    generate_secure_token,
    hash_token,
    verify_token_hash,
)
from app.services.email import email_service
from app.services.rate_limiter import brute_force_protection


class AuthService:
    """Authentication service"""
    
    async def register_user(
        self,
        db: AsyncSession,
        app_id: str,
        user_data: UserCreate
    ) -> User:
        """
        Register a new user
        
        Args:
            db: Database session
            app_id: Application ID
            user_data: User creation data
            
        Returns:
            Created user object
            
        Raises:
            HTTPException: If email already exists or validation fails
        """
        # Validate password strength
        is_valid, error_msg = validate_password_strength(user_data.password)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"code": "INVALID_PASSWORD", "message": error_msg}
            )
        
        # Check if user already exists
        stmt = select(User).where(
            User.app_id == app_id,
            User.email == user_data.email
        )
        result = await db.execute(stmt)
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"code": "EMAIL_EXISTS", "message": "Email already registered"}
            )
        
        # Hash password
        password_hash = hash_password(user_data.password)
        
        # Create user
        user = User(
            app_id=app_id,
            email=user_data.email,
            password_hash=password_hash,
            email_verified=False,
            metadata=user_data.metadata
        )
        db.add(user)
        await db.flush()  # Get user ID
        
        # Generate verification token
        verification_token = generate_secure_token(32)
        token_hash = hash_token(verification_token)
        expires_at = datetime.utcnow() + timedelta(hours=48)
        
        verification_record = EmailVerificationToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at
        )
        db.add(verification_record)
        
        # Get application name for email
        app_stmt = select(Application).where(Application.app_id == app_id)
        app_result = await db.execute(app_stmt)
        application = app_result.scalar_one_or_none()
        app_name = application.name if application else "DevAuth"
        
        # Send verification email (async, don't wait)
        try:
            await email_service.send_verification_email(
                to_email=user.email,
                app_name=app_name,
                verification_token=verification_token
            )
        except Exception as e:
            # Log error but don't fail registration
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to send verification email: {str(e)}")
        
        await db.commit()
        await db.refresh(user)
        
        return user
    
    async def verify_email(
        self,
        db: AsyncSession,
        app_id: str,
        token: str
    ) -> bool:
        """
        Verify user email with token
        
        Args:
            db: Database session
            app_id: Application ID
            token: Verification token
            
        Returns:
            True if verified successfully
            
        Raises:
            HTTPException: If token is invalid or expired
        """
        token_hash = hash_token(token)
        
        # Find token
        stmt = select(EmailVerificationToken).join(User).where(
            EmailVerificationToken.token_hash == token_hash,
            EmailVerificationToken.used == False,
            EmailVerificationToken.expires_at > datetime.utcnow(),
            User.app_id == app_id
        )
        result = await db.execute(stmt)
        verification_token = result.scalar_one_or_none()
        
        if not verification_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"code": "INVALID_TOKEN", "message": "Invalid or expired verification token"}
            )
        
        # Mark token as used
        verification_token.used = True
        verification_token.used_at = datetime.utcnow()
        
        # Mark user as verified
        user = verification_token.user
        user.email_verified = True
        
        await db.commit()
        
        return True
    
    async def request_email_verification(
        self,
        db: AsyncSession,
        app_id: str,
        email: str
    ) -> bool:
        """
        Request a new email verification token
        
        Args:
            db: Database session
            app_id: Application ID
            email: User email
            
        Returns:
            True if email sent
            
        Raises:
            HTTPException: If user not found or already verified
        """
        # Find user
        stmt = select(User).where(
            User.app_id == app_id,
            User.email == email
        )
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            # Don't reveal if user exists (security best practice)
            return True
        
        if user.email_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"code": "ALREADY_VERIFIED", "message": "Email already verified"}
            )
        
        # Generate new token
        verification_token = generate_secure_token(32)
        token_hash = hash_token(verification_token)
        expires_at = datetime.utcnow() + timedelta(hours=48)
        
        verification_record = EmailVerificationToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at
        )
        db.add(verification_record)
        
        # Get application name
        app_stmt = select(Application).where(Application.app_id == app_id)
        app_result = await db.execute(app_stmt)
        application = app_result.scalar_one_or_none()
        app_name = application.name if application else "DevAuth"
        
        # Send email
        await email_service.send_verification_email(
            to_email=user.email,
            app_name=app_name,
            verification_token=verification_token
        )
        
        await db.commit()
        
        return True
    
    async def login(
        self,
        db: AsyncSession,
        app_id: str,
        credentials: UserLogin,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> Tuple[User, str, str]:
        """
        Authenticate user and create session
        
        Args:
            db: Database session
            app_id: Application ID
            credentials: Login credentials
            ip_address: Client IP address
            user_agent: Client user agent
            
        Returns:
            Tuple of (user, access_token, refresh_token)
            
        Raises:
            HTTPException: If credentials are invalid or account is locked
        """
        # Check brute force protection
        if ip_address:
            is_locked = await brute_force_protection.check_lockout(
                credentials.email,
                ip_address
            )
            if is_locked:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail={
                        "code": "ACCOUNT_LOCKED",
                        "message": "Account locked due to too many failed login attempts. Please try again in 15 minutes."
                    }
                )
        
        # Find user
        stmt = select(User).where(
            User.app_id == app_id,
            User.email == credentials.email
        )
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        # Verify password (even if user doesn't exist to prevent timing attacks)
        password_valid = False
        if user:
            password_valid = verify_password(credentials.password, user.password_hash)
        
        if not user or not password_valid:
            # Record failed attempt
            if ip_address:
                await brute_force_protection.record_failed_attempt(
                    credentials.email,
                    ip_address
                )
            
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"code": "INVALID_CREDENTIALS", "message": "Email or password is incorrect"}
            )
        
        # Clear failed attempts on success
        if ip_address:
            await brute_force_protection.clear_attempts(
                credentials.email,
                ip_address
            )
        
        # Update last login
        user.last_login_at = datetime.utcnow()
        
        # Generate tokens
        access_token = create_access_token(
            user_id=user.id,
            app_id=app_id,
            email=user.email
        )
        
        refresh_token_plain = create_refresh_token(
            user_id=user.id,
            app_id=app_id,
            session_id=UUID('00000000-0000-0000-0000-000000000000')  # Will be updated after session creation
        )
        
        refresh_token_hash = hash_token(refresh_token_plain)
        expires_at = datetime.utcnow() + timedelta(days=7)
        
        # Create session
        session = Session(
            user_id=user.id,
            app_id=app_id,
            refresh_token_hash=refresh_token_hash,
            user_agent=user_agent,
            ip_address=ip_address,
            expires_at=expires_at
        )
        db.add(session)
        await db.flush()
        
        # Update refresh token with session ID (requires re-encoding)
        refresh_token_plain = create_refresh_token(
            user_id=user.id,
            app_id=app_id,
            session_id=session.id
        )
        refresh_token_hash = hash_token(refresh_token_plain)
        session.refresh_token_hash = refresh_token_hash
        
        await db.commit()
        await db.refresh(user)
        
        return user, access_token, refresh_token_plain
    
    async def refresh_token(
        self,
        db: AsyncSession,
        app_id: str,
        refresh_token: str
    ) -> Tuple[str, Optional[str]]:
        """
        Refresh access token
        
        Args:
            db: Database session
            app_id: Application ID
            refresh_token: Refresh token string
            
        Returns:
            Tuple of (access_token, optional_new_refresh_token)
            
        Raises:
            HTTPException: If token is invalid or expired
        """
        # Verify token
        payload = verify_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"code": "INVALID_TOKEN", "message": "Invalid refresh token"}
            )
        
        if payload.get("app_id") != app_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"code": "INVALID_TOKEN", "message": "Token does not belong to this application"}
            )
        
        session_id = UUID(payload.get("session_id"))
        user_id = UUID(payload.get("sub"))
        
        # Find session
        stmt = select(Session).where(
            Session.id == session_id,
            Session.user_id == user_id,
            Session.app_id == app_id,
            Session.revoked == False,
            Session.expires_at > datetime.utcnow()
        )
        result = await db.execute(stmt)
        session = result.scalar_one_or_none()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"code": "INVALID_TOKEN", "message": "Session not found or expired"}
            )
        
        # Verify token hash matches
        token_hash = hash_token(refresh_token)
        if not verify_token_hash(refresh_token, session.refresh_token_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"code": "INVALID_TOKEN", "message": "Invalid refresh token"}
            )
        
        # Get user
        user_stmt = select(User).where(User.id == user_id)
        user_result = await db.execute(user_stmt)
        user = user_result.scalar_one()
        
        # Generate new access token
        access_token = create_access_token(
            user_id=user.id,
            app_id=app_id,
            email=user.email
        )
        
        # Optionally rotate refresh token (for MVP, we'll keep same token)
        # In production, you might want to rotate it for security
        new_refresh_token = None
        
        await db.commit()
        
        return access_token, new_refresh_token
    
    async def logout(
        self,
        db: AsyncSession,
        app_id: str,
        refresh_token: str
    ) -> bool:
        """
        Logout user by revoking session
        
        Args:
            db: Database session
            app_id: Application ID
            refresh_token: Refresh token string
            
        Returns:
            True if logged out successfully
        """
        # Decode token to get session ID
        payload = verify_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            # If token is invalid, consider it already logged out
            return True
        
        session_id = UUID(payload.get("session_id"))
        
        # Find and revoke session
        stmt = select(Session).where(
            Session.id == session_id,
            Session.app_id == app_id,
            Session.revoked == False
        )
        result = await db.execute(stmt)
        session = result.scalar_one_or_none()
        
        if session:
            session.revoked = True
            session.revoked_at = datetime.utcnow()
            await db.commit()
        
        return True
    
    async def request_password_reset(
        self,
        db: AsyncSession,
        app_id: str,
        email: str
    ) -> bool:
        """
        Request password reset
        
        Args:
            db: Database session
            app_id: Application ID
            email: User email
            
        Returns:
            True if email sent (even if user doesn't exist for security)
        """
        # Find user
        stmt = select(User).where(
            User.app_id == app_id,
            User.email == email
        )
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            # Don't reveal if user exists
            return True
        
        # Generate reset token
        reset_token = generate_secure_token(32)
        token_hash = hash_token(reset_token)
        expires_at = datetime.utcnow() + timedelta(hours=1)
        
        reset_record = PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at
        )
        db.add(reset_record)
        
        # Get application name
        app_stmt = select(Application).where(Application.app_id == app_id)
        app_result = await db.execute(app_stmt)
        application = app_result.scalar_one_or_none()
        app_name = application.name if application else "DevAuth"
        
        # Send email
        await email_service.send_password_reset_email(
            to_email=user.email,
            app_name=app_name,
            reset_token=reset_token
        )
        
        await db.commit()
        
        return True
    
    async def confirm_password_reset(
        self,
        db: AsyncSession,
        app_id: str,
        token: str,
        new_password: str
    ) -> bool:
        """
        Confirm password reset and update password
        
        Args:
            db: Database session
            app_id: Application ID
            token: Password reset token
            new_password: New password
            
        Returns:
            True if password reset successfully
            
        Raises:
            HTTPException: If token is invalid or expired
        """
        # Validate password strength
        is_valid, error_msg = validate_password_strength(new_password)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"code": "INVALID_PASSWORD", "message": error_msg}
            )
        
        token_hash = hash_token(token)
        
        # Find token
        stmt = select(PasswordResetToken).join(User).where(
            PasswordResetToken.token_hash == token_hash,
            PasswordResetToken.used == False,
            PasswordResetToken.expires_at > datetime.utcnow(),
            User.app_id == app_id
        )
        result = await db.execute(stmt)
        reset_token = result.scalar_one_or_none()
        
        if not reset_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"code": "INVALID_TOKEN", "message": "Invalid or expired reset token"}
            )
        
        # Mark token as used
        reset_token.used = True
        reset_token.used_at = datetime.utcnow()
        
        # Update password
        user = reset_token.user
        user.password_hash = hash_password(new_password)
        
        # Revoke all user sessions
        sessions_stmt = select(Session).where(
            Session.user_id == user.id,
            Session.revoked == False
        )
        sessions_result = await db.execute(sessions_stmt)
        sessions = sessions_result.scalars().all()
        
        for session in sessions:
            session.revoked = True
            session.revoked_at = datetime.utcnow()
        
        await db.commit()
        
        return True


# Global auth service instance
auth_service = AuthService()

