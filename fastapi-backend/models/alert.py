from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)

    device_id = Column(
        Integer,
        ForeignKey("devices.id", ondelete="CASCADE"),
        nullable=False
    )

    type = Column(String(50), nullable=False)
    severity = Column(String(20), nullable=False)
    message = Column(String(255), nullable=False)

    created_at = Column(
        DateTime,
        server_default=func.now()
    )

    acknowledged_at = Column(DateTime, nullable=True)