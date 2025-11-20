"""
User model for end-user authentication
"""

from sqlalchemy import (
    Column,
    String,
    DateTime,
    Boolean,
    ForeignKey,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base
from app.models.types import GUID, JSONBCompat


class User(Base):
    """User model for end-user accounts"""

    __tablename__ = "users"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    app_id = Column(
        String(64),
        ForeignKey("applications.app_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    email = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    email_verified = Column(Boolean, default=False, nullable=False)
    user_metadata = Column("metadata", JSONBCompat())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    last_login_at = Column(DateTime(timezone=True))

    # Relationships
    application = relationship("Application", back_populates="users")
    sessions = relationship(
        "Session", back_populates="user", cascade="all, delete-orphan"
    )
    email_verification_tokens = relationship(
        "EmailVerificationToken", back_populates="user", cascade="all, delete-orphan"
    )
    password_reset_tokens = relationship(
        "PasswordResetToken", back_populates="user", cascade="all, delete-orphan"
    )

    __table_args__ = (UniqueConstraint("app_id", "email", name="uq_users_app_email"),)
