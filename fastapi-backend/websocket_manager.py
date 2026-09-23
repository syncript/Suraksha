from typing import List, Tuple

from fastapi import WebSocket


# Stores:
# (websocket connection, user_id)
connected_clients: List[Tuple[WebSocket, int]] = []


async def broadcast_sensor_data(data, user_id: int):
    for websocket, connected_user_id in connected_clients.copy():

        # Only send the sensor data to the owner of the device
        if connected_user_id != user_id:
            continue

        try:
            await websocket.send_json(data)

        except Exception:
            connection = (websocket, connected_user_id)

            if connection in connected_clients:
                connected_clients.remove(connection)