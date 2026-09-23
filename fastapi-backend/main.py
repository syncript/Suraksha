from fastapi import FastAPI, Depends, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from dependencies import get_current_user
from routes.devices import router as devices_router
from routes.sensors import router as sensors_router
from routes.alerts import router as alerts_router
from database import Base, engine
from models import User, Device, SensorReading, Alert
from routes.auth import router as auth_router
from websocket_manager import connected_clients
from auth_utils import decode_access_token


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
def protected_test(current_user=Depends(get_current_user)):
    return {
        "message": "JWT authentication working",
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email
        }
    }




@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    token = websocket.query_params.get("token")

    if not token:
        await websocket.close(code=1008)
        return

    user_id = decode_access_token(token)

    if user_id is None:
        await websocket.close(code=1008)
        return

    await websocket.accept()

    client = (websocket, user_id)
    connected_clients.append(client)

    try:
        while True:
            await websocket.receive_text()

    except Exception:
        if client in connected_clients:
            connected_clients.remove(client)