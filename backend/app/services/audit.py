"""
Audit logging service
"""
from datetime import datetime
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Dict, Any
from app.models import AuditLog


class AuditService:
    """Audit logging service"""
    
    # Authentication events
    ACTION_SIGNUP = "signup"
    ACTION_LOGIN = "login"
    ACTION_LOGIN_FAILED = "login_failed"
    ACTION_LOGOUT = "logout"
    ACTION_PASSWORD_RESET_REQUEST = "password_reset_request"
    ACTION_PASSWORD_RESET_CONFIRM = "password_reset_confirm"
    ACTION_EMAIL_VERIFIED = "email_verified"
    
    # Administrative actions
    ACTION_API_KEY_CREATED = "api_key_created"
    ACTION_API_KEY_REVOKED = "api_key_revoked"
    ACTION_APPLICATION_CREATED = "application_created"
    
    async def log_event(
        self,
        db: AsyncSession,
        action: str,
        user_id: Optional[UUID] = None,
        app_id: Optional[str] = None,
        developer_id: Optional[UUID] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        request_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """
        Log an audit event
        
        Args:
            db: Database session
            action: Action name
            user_id: User ID (if applicable)
            app_id: Application ID (if applicable)
            developer_id: Developer ID (if applicable)
            ip_address: Client IP address
            user_agent: Client user agent
            request_id: Request ID for tracing
            metadata: Additional event metadata
        """
        audit_log = AuditLog(
            user_id=user_id,
            app_id=app_id,
            developer_id=developer_id,
            action=action,
            ip_address=ip_address,
            user_agent=user_agent,
            request_id=request_id,
            metadata=metadata or {}
        )
        db.add(audit_log)
        await db.commit()


# Global audit service instance
audit_service = AuditService()

