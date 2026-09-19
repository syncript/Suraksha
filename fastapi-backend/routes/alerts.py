from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from dependencies import get_db, get_current_user
from models.device import Device
from models.alert import Alert
from models.user import User


router = APIRouter(
    prefix="/api/alerts",
    tags=["Alerts"]
)


@router.get("")
def get_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alerts = (
        db.query(Alert)
        .join(Device, Alert.device_id == Device.id)
        .filter(Device.user_id == current_user.id)
        .order_by(Alert.created_at.desc())
        .all()
    )

    return alerts


@router.patch("/{alert_id}/acknowledge")
def acknowledge_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alert = (
        db.query(Alert)
        .join(Device, Alert.device_id == Device.id)
        .filter(
            Alert.id == alert_id,
            Device.user_id == current_user.id
        )
        .first()
    )

    if alert is None:
        raise HTTPException(
            status_code=404,
            detail="Alert not found"
        )

    from datetime import datetime

    alert.acknowledged_at = datetime.now()

    db.commit()
    db.refresh(alert)

    return {
        "message": "Alert acknowledged",
        "alert": alert
    }