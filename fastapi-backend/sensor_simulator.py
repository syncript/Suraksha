import time
import random
import requests


API_URL = "http://127.0.0.1:8000/api/sensors"

DEVICE_ID = 1

TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozLCJleHAiOjE3ODk4OTE3Mzh9.4YnwMfWA4tUJl6LllllbdmHE1uvy2Wwm-m7nLIhGCtg"


while True:
    lpg_ppm = random.randint(300, 850)
    temperature = round(random.uniform(25, 32), 1)
    humidity = random.randint(50, 75)

    data = {
        "device_id": DEVICE_ID,
        "lpg_ppm": lpg_ppm,
        "temperature": temperature,
        "humidity": humidity
    }

    response = requests.post(
        API_URL,
        json=data,
        headers={
            "Authorization": f"Bearer {TOKEN}"
        }
    )

    print(
        f"LPG: {lpg_ppm} PPM | "
        f"Temp: {temperature}°C | "
        f"Humidity: {humidity}% | "
        f"Status: {response.status_code}"
    )

    time.sleep(5)