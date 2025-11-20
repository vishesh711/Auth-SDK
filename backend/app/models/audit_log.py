"""
Audit log model for tracking authentication and administrative events
"""

from sqlalchemy import Column, String, DateTime, Text, func
import uuid
from app.core.database import Base
from app.models.types import GUID, JSONBCompat


class AuditLog(Base):
    """Audit log model for tracking events"""

    __tablename__ = "audit_logs"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), nullable=True, index=True)
    app_id = Column(String(64), nullable=True, index=True)
    developer_id = Column(GUID(), nullable=True, index=True)
    action = Column(String(100), nullable=False, index=True)
    ip_address = Column(String(45))
    user_agent = Column(Text)
    request_id = Column(String(36), index=True)  # UUID string
    event_metadata = Column("metadata", JSONBCompat())  # Additional event data
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
