import time
import random
import requests

API_URL = "http://127.0.0.1:8000/api/sensors"

# Device 1 belongs to the account currently being used
DEVICE_ID = 1

# Put the JWT token from your current login here locally.
# Do NOT send the token to me.
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozLCJleHAiOjE3OTAxNjUyNTF9.uL7rt65PyYKtUE5rmYeRs5YBgHsZCouLdcJqmu1Etlo"


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

    try:
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

    except requests.RequestException as error:
        print("Connection error:", error)

    time.sleep(5)