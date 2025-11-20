"""
Application management service
"""

from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
import secrets

from app.models import Application, Developer
from app.schemas import ApplicationCreate
from app.utils import encrypt_secret


class ApplicationService:
    """Application management service"""

    def _generate_app_id(self) -> str:
        """Generate a unique application ID"""
        return secrets.token_urlsafe(32)[:32]  # 32 character app_id

    def _generate_app_secret(self) -> str:
        """Generate a secure application secret"""
        return secrets.token_urlsafe(48)  # 48 character secret

    async def create_application(
        self, db: AsyncSession, developer_id: UUID, app_data: ApplicationCreate
    ) -> tuple[Application, str]:
        """
        Create a new application

        Args:
            db: Database session
            developer_id: Developer ID
            app_data: Application creation data

        Returns:
            Tuple of (application, plaintext_app_secret)
        """
        # Verify developer exists
        stmt = select(Developer).where(Developer.id == developer_id)
        result = await db.execute(stmt)
        developer = result.scalar_one_or_none()

        if not developer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "code": "DEVELOPER_NOT_FOUND",
                    "message": "Developer not found",
                },
            )

        # Generate app_id and secret
        app_id = self._generate_app_id()
        app_secret_plaintext = self._generate_app_secret()
        app_secret_encrypted = encrypt_secret(app_secret_plaintext)

        # Create application
        application = Application(
            developer_id=developer_id,
            name=app_data.name,
            environment=app_data.environment,
            app_id=app_id,
            app_secret_encrypted=app_secret_encrypted,
        )
        db.add(application)
        await db.commit()
        await db.refresh(application)

        return application, app_secret_plaintext

    async def list_applications(
        self, db: AsyncSession, developer_id: UUID
    ) -> list[Application]:
        """
        List all applications for a developer

        Args:
            db: Database session
            developer_id: Developer ID

        Returns:
            List of applications
        """
        stmt = select(Application).where(Application.developer_id == developer_id)
        result = await db.execute(stmt)
        applications = result.scalars().all()
        return list(applications)

    async def get_application(
        self, db: AsyncSession, developer_id: UUID, app_id: str
    ) -> Application:
        """
        Get application by ID (with ownership check)

        Args:
            db: Database session
            developer_id: Developer ID
            app_id: Application ID

        Returns:
            Application object

        Raises:
            HTTPException: If application not found or not owned by developer
        """
        stmt = select(Application).where(
            Application.app_id == app_id, Application.developer_id == developer_id
        )
        result = await db.execute(stmt)
        application = result.scalar_one_or_none()

        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "code": "APPLICATION_NOT_FOUND",
                    "message": "Application not found",
                },
            )

        return application

    async def delete_application(
        self, db: AsyncSession, developer_id: UUID, app_id: str
    ) -> bool:
        """
        Delete an application owned by the developer.

        Args:
            db: Database session
            developer_id: Developer ID
            app_id: Application ID

        Returns:
            True if deleted successfully
        """
        application = await self.get_application(
            db=db, developer_id=developer_id, app_id=app_id
        )
        await db.delete(application)
        await db.commit()
        return True


# Global service instance
application_service = ApplicationService()
