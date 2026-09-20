from typing import List
from fastapi import WebSocket


connected_clients: List[WebSocket] = []


async def broadcast_sensor_data(data):
    for websocket in connected_clients.copy():
        try:
            await websocket.send_json(data)
        except Exception:
            if websocket in connected_clients:
                connected_clients.remove(websocket)