"""
User management service for developer portal
"""
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from fastapi import HTTPException, status
from typing import Optional

from app.models import User, Application


class UserManagementService:
    """User management service"""
    
    async def list_users(
        self,
        db: AsyncSession,
        app_id: str,
        developer_id: UUID,
        page: int = 1,
        limit: int = 20,
        search: Optional[str] = None
    ) -> dict:
        """
        List users for an application with pagination and search
        
        Args:
            db: Database session
            app_id: Application ID
            developer_id: Developer ID
            page: Page number (1-indexed)
            limit: Items per page
            search: Optional email search query
            
        Returns:
            Dict with users, total, page, limit
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
        
        # Build query
        stmt = select(User).where(User.app_id == app_id)
        
        if search:
            stmt = stmt.where(User.email.ilike(f"%{search}%"))
        
        # Get total count
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_result = await db.execute(count_stmt)
        total = total_result.scalar_one()
        
        # Apply pagination
        offset = (page - 1) * limit
        stmt = stmt.order_by(User.created_at.desc()).offset(offset).limit(limit)
        
        # Execute query
        result = await db.execute(stmt)
        users = result.scalars().all()
        
        return {
            "users": list(users),
            "total": total,
            "page": page,
            "limit": limit
        }


# Global service instance
user_management_service = UserManagementService()

