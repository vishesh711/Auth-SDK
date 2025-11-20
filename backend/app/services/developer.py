"""
Developer portal authentication service
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from app.models import Developer
from app.schemas import DeveloperSignup, DeveloperLogin
from app.utils import (
    hash_password,
    verify_password,
    validate_password_strength,
    create_access_token,
)


class DeveloperAuthService:
    """Developer authentication service"""

    async def signup(
        self, db: AsyncSession, developer_data: DeveloperSignup
    ) -> Developer:
        """
        Register a new developer

        Args:
            db: Database session
            developer_data: Developer signup data

        Returns:
            Created developer object
        """
        # Validate password
        is_valid, error_msg = validate_password_strength(developer_data.password)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"code": "INVALID_PASSWORD", "message": error_msg},
            )

        # Check if email exists
        stmt = select(Developer).where(Developer.email == developer_data.email)
        result = await db.execute(stmt)
        existing = result.scalar_one_or_none()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"code": "EMAIL_EXISTS", "message": "Email already registered"},
            )

        # Create developer
        developer = Developer(
            email=developer_data.email,
            password_hash=hash_password(developer_data.password),
            name=developer_data.name,
        )
        db.add(developer)
        await db.commit()
        await db.refresh(developer)

        return developer

    async def login(
        self, db: AsyncSession, credentials: DeveloperLogin
    ) -> tuple[Developer, str]:
        """
        Authenticate developer

        Args:
            db: Database session
            credentials: Login credentials

        Returns:
            Tuple of (developer, access_token)
        """
        # Find developer
        stmt = select(Developer).where(Developer.email == credentials.email)
        result = await db.execute(stmt)
        developer = result.scalar_one_or_none()

        if not developer or not verify_password(
            credentials.password, developer.password_hash
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "code": "INVALID_CREDENTIALS",
                    "message": "Email or password is incorrect",
                },
            )

        # Generate access token (simpler token for portal, no app_id)
        access_token = create_access_token(
            user_id=developer.id,
            app_id="portal",  # Special app_id for portal
            email=developer.email,
        )

        return developer, access_token
