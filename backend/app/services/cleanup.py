"""
Background job service for cleaning up expired tokens and old sessions
"""
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, and_
from app.core.database import AsyncSessionLocal
from app.models import EmailVerificationToken, PasswordResetToken, Session
import logging

logger = logging.getLogger(__name__)


class CleanupService:
    """Service for cleaning up expired data"""
    
    async def cleanup_expired_verification_tokens(self):
        """Delete expired email verification tokens (> 48 hours old)"""
        async with AsyncSessionLocal() as db:
            try:
                cutoff_time = datetime.utcnow() - timedelta(hours=48)
                
                stmt = delete(EmailVerificationToken).where(
                    EmailVerificationToken.expires_at < cutoff_time
                )
                result = await db.execute(stmt)
                deleted_count = result.rowcount
                
                await db.commit()
                logger.info(f"Cleaned up {deleted_count} expired email verification tokens")
            except Exception as e:
                logger.error(f"Error cleaning up verification tokens: {str(e)}")
                await db.rollback()
    
    async def cleanup_expired_reset_tokens(self):
        """Delete expired password reset tokens (> 24 hours old)"""
        async with AsyncSessionLocal() as db:
            try:
                cutoff_time = datetime.utcnow() - timedelta(hours=24)
                
                stmt = delete(PasswordResetToken).where(
                    PasswordResetToken.expires_at < cutoff_time
                )
                result = await db.execute(stmt)
                deleted_count = result.rowcount
                
                await db.commit()
                logger.info(f"Cleaned up {deleted_count} expired password reset tokens")
            except Exception as e:
                logger.error(f"Error cleaning up reset tokens: {str(e)}")
                await db.rollback()
    
    async def cleanup_old_revoked_sessions(self):
        """Delete revoked sessions older than 90 days"""
        async with AsyncSessionLocal() as db:
            try:
                cutoff_time = datetime.utcnow() - timedelta(days=90)
                
                stmt = delete(Session).where(
                    and_(
                        Session.revoked == True,
                        Session.revoked_at < cutoff_time
                    )
                )
                result = await db.execute(stmt)
                deleted_count = result.rowcount
                
                await db.commit()
                logger.info(f"Cleaned up {deleted_count} old revoked sessions")
            except Exception as e:
                logger.error(f"Error cleaning up revoked sessions: {str(e)}")
                await db.rollback()
    
    async def run_all_cleanups(self):
        """Run all cleanup tasks"""
        await self.cleanup_expired_verification_tokens()
        await self.cleanup_expired_reset_tokens()
        await self.cleanup_old_revoked_sessions()


# Global cleanup service instance
cleanup_service = CleanupService()

