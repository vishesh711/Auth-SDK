"""
Application model for multi-tenant applications
"""
from sqlalchemy import Column, String, DateTime, ForeignKey, CheckConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base


class Application(Base):
    """Application model representing a developer's application"""
    __tablename__ = "applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    developer_id = Column(UUID(as_uuid=True), ForeignKey("developers.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    environment = Column(String(20), nullable=False)
    app_id = Column(String(64), unique=True, nullable=False, index=True)
    app_secret_encrypted = Column(String, nullable=False)  # TEXT in PostgreSQL
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    developer = relationship("Developer", back_populates="applications")
    users = relationship("User", back_populates="application", cascade="all, delete-orphan")
    api_keys = relationship("APIKey", back_populates="application", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("environment IN ('dev', 'prod')", name="check_environment"),
    )

