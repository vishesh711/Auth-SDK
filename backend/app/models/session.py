"""
Session model for user authentication sessions
"""

from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Text, func
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base
from app.models.types import GUID


class Session(Base):
    """Session model for refresh token management"""

    __tablename__ = "sessions"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        GUID(),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    app_id = Column(String(64), nullable=False)
    refresh_token_hash = Column(String(255), nullable=False, index=True)
    user_agent = Column(Text)
    ip_address = Column(String(45))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked = Column(Boolean, default=False, nullable=False)
    revoked_at = Column(DateTime(timezone=True))

    # Relationships
    user = relationship("User", back_populates="sessions")
