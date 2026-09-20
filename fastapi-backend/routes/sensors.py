from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from websocket_manager import broadcast_sensor_data

from dependencies import get_db, get_current_user
from models.device import Device
from models.sensor_reading import SensorReading
from models.alert import Alert
from models.user import User


class SensorData(BaseModel):
    device_id: int
    lpg_ppm: float
    temperature: float
    humidity: float


router = APIRouter(
    prefix="/api/sensors",
    tags=["Sensors"]
)


@router.get("/{device_id}")
def get_sensor_readings(
    device_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    device = db.query(Device).filter(
        Device.id == device_id,
        Device.user_id == current_user.id
    ).first()

    if device is None:
        raise HTTPException(
            status_code=404,
            detail="Device not found"
        )

    readings = db.query(SensorReading).filter(
        SensorReading.device_id == device_id
    ).order_by(
        SensorReading.recorded_at.desc()
    ).all()

    return readings


@router.post("")
async def create_sensor_reading(
    data: SensorData,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from datetime import datetime

    device = db.query(Device).filter(
        Device.id == data.device_id,
        Device.user_id == current_user.id
    ).first()

    if device is None:
        raise HTTPException(
            status_code=404,
            detail="Device not found"
        )

    # Save sensor reading
    reading = SensorReading(
        device_id=data.device_id,
        lpg_ppm=data.lpg_ppm,
        temperature=data.temperature,
        humidity=data.humidity
    )

    db.add(reading)

    # Update device status
    device.status = "online"
    device.last_seen = datetime.now()

    # Project alert thresholds
    alert_created = None
    exhaust_fan_on = False

    if data.lpg_ppm >= 800:
        exhaust_fan_on = True

        alert = Alert(
            device_id=data.device_id,
            type="LPG",
            severity="critical",
            message=f"Critical LPG level detected: {data.lpg_ppm} PPM"
        )

        db.add(alert)
        alert_created = "critical"

    elif data.lpg_ppm >= 600:
        alert = Alert(
            device_id=data.device_id,
            type="LPG",
            severity="warning",
            message=f"High LPG level detected: {data.lpg_ppm} PPM"
        )

        db.add(alert)
        alert_created = "warning"

    db.commit()
    db.refresh(reading)

    # Send the new reading to connected WebSocket clients
    await broadcast_sensor_data({
        "device_id": reading.device_id,
        "lpg_ppm": reading.lpg_ppm,
        "temperature": reading.temperature,
        "humidity": reading.humidity,
        "recorded_at": reading.recorded_at.isoformat(),
        "device_status": device.status,
        "exhaust_fan_on": exhaust_fan_on,
        "alert_created": alert_created
    })

    return {
        "message": "Sensor reading saved",
        "reading": reading,
        "device_status": device.status,
        "exhaust_fan_on": exhaust_fan_on,
        "alert_created": alert_created
    }