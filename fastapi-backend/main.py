from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from dependencies import get_current_user
from routes.devices import router as devices_router
from routes.sensors import router as sensors_router
from routes.alerts import router as alerts_router
from database import Base, engine
from models import User, Device, SensorReading, Alert
from routes.auth import router as auth_router


Base.metadata.create_all(bind=engine)


app = FastAPI(title="Suraksha API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(devices_router)
app.include_router(sensors_router)
app.include_router(alerts_router)
@app.get("/")
def root():
    return {
        "message": "Suraksha FastAPI backend is running!"
    }


@app.get("/api/health")
def health():
    return {
        "status": "OK",
        "message": "Suraksha FastAPI is healthy"
    }
@app.get("/api/protected-test")
def protected_test(current_user = Depends(get_current_user)):
    return {
        "message": "JWT authentication working",
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email
        }
    }