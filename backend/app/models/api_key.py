"""
API Key model for application API authentication
"""

from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, func
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base
from app.models.types import GUID


class APIKey(Base):
    """API Key model for application API authentication"""

    __tablename__ = "api_keys"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    app_id = Column(
        String(64),
        ForeignKey("applications.app_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    label = Column(String(255))
    key_hash = Column(String(255), unique=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_used_at = Column(DateTime(timezone=True))
    revoked = Column(Boolean, default=False, nullable=False)
    revoked_at = Column(DateTime(timezone=True))

    # Relationships
    application = relationship("Application", back_populates="api_keys")
