"""
API key management service
"""
from datetime import datetime
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from app.models import APIKey, Application
from app.schemas import APIKeyCreate
from app.utils import generate_api_key


class APIKeyService:
    """API key management service"""
    
    async def create_api_key(
        self,
        db: AsyncSession,
        app_id: str,
        developer_id: UUID,
        key_data: APIKeyCreate
    ) -> tuple[APIKey, str]:
        """
        Create a new API key
        
        Args:
            db: Database session
            app_id: Application ID
            developer_id: Developer ID
            key_data: API key creation data
            
        Returns:
            Tuple of (api_key, plaintext_key)
        """
        # Verify application ownership
        app_stmt = select(Application).where(
            Application.app_id == app_id,
            Application.developer_id == developer_id
        )
        app_result = await db.execute(app_stmt)
        application = app_result.scalar_one_or_none()
        
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"code": "APPLICATION_NOT_FOUND", "message": "Application not found"}
            )
        
        # Generate API key
        plaintext_key, key_hash = generate_api_key()
        
        # Create API key record
        api_key = APIKey(
            app_id=app_id,
            label=key_data.label,
            key_hash=key_hash
        )
        db.add(api_key)
        await db.commit()
        await db.refresh(api_key)
        
        return api_key, plaintext_key
    
    async def list_api_keys(
        self,
        db: AsyncSession,
        app_id: str,
        developer_id: UUID
    ) -> list[APIKey]:
        """
        List all API keys for an application
        
        Args:
            db: Database session
            app_id: Application ID
            developer_id: Developer ID
            
        Returns:
            List of API keys
        """
        # Verify application ownership
        app_stmt = select(Application).where(
            Application.app_id == app_id,
            Application.developer_id == developer_id
        )
        app_result = await db.execute(app_stmt)
        application = app_result.scalar_one_or_none()
        
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"code": "APPLICATION_NOT_FOUND", "message": "Application not found"}
            )
        
        # Get API keys
        stmt = select(APIKey).where(APIKey.app_id == app_id)
        result = await db.execute(stmt)
        api_keys = result.scalars().all()
        return list(api_keys)
    
    async def revoke_api_key(
        self,
        db: AsyncSession,
        app_id: str,
        key_id: UUID,
        developer_id: UUID
    ) -> bool:
        """
        Revoke an API key
        
        Args:
            db: Database session
            app_id: Application ID
            key_id: API key ID
            developer_id: Developer ID
            
        Returns:
            True if revoked successfully
        """
        # Verify application ownership
        app_stmt = select(Application).where(
            Application.app_id == app_id,
            Application.developer_id == developer_id
        )
        app_result = await db.execute(app_stmt)
        application = app_result.scalar_one_or_none()
        
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"code": "APPLICATION_NOT_FOUND", "message": "Application not found"}
            )
        
        # Find API key
        stmt = select(APIKey).where(
            APIKey.id == key_id,
            APIKey.app_id == app_id
        )
        result = await db.execute(stmt)
        api_key = result.scalar_one_or_none()
        
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"code": "API_KEY_NOT_FOUND", "message": "API key not found"}
            )
        
        if api_key.revoked:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"code": "ALREADY_REVOKED", "message": "API key already revoked"}
            )
        
        # Revoke key
        api_key.revoked = True
        api_key.revoked_at = datetime.utcnow()
        await db.commit()
        
        return True


# Global service instance
api_key_service = APIKeyService()

