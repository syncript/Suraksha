from fastapi import FastAPI

from database import Base, engine
from models import User, Device, SensorReading, Alert

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Suraksha API")


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