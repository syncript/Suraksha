from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from dependencies import get_db, get_current_user
from models.device import Device
from models.user import User


router = APIRouter(
    prefix="/api/devices",
    tags=["Devices"]
)


class DeviceCreate(BaseModel):
    device_uid: str
    name: str


@router.get("")
def get_devices(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    devices = db.query(Device).filter(
        Device.user_id == current_user.id
    ).all()

    return devices


@router.post("")
def create_device(
    data: DeviceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing_device = db.query(Device).filter(
        Device.device_uid == data.device_uid
    ).first()

    if existing_device:
        raise HTTPException(
            status_code=400,
            detail="Device UID already exists"
        )

    device = Device(
        device_uid=data.device_uid,
        name=data.name,
        user_id=current_user.id,
        status="offline"
    )

    db.add(device)
    db.commit()
    db.refresh(device)

    return {
        "message": "Device created",
        "device": device
    }