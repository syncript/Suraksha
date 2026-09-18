from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from database import Base


class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    device_uid = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    status = Column(
        String(20),
        default="offline",
        nullable=False
    )

    last_seen = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())