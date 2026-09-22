# Suraksha — LPG Gas Safety & Monitoring System

Suraksha is a web-based LPG gas safety and monitoring system designed to monitor LPG concentration and environmental conditions in real time.

The system provides real-time sensor monitoring, automatic LPG alerts, exhaust fan control status, historical data, device monitoring, and a user authentication system.

---

## Features

* User registration and login
* JWT-based authentication
* Real-time LPG concentration monitoring
* Real-time temperature monitoring
* Real-time humidity monitoring
* Automatic LPG warning and critical alerts
* Automatic exhaust fan status
* Real-time dashboard updates using WebSockets
* Historical sensor data
* Device status monitoring
* Responsive dashboard
* Safety status banner
* Live sensor trend charts
* Emergency LPG helpline information
* MySQL database storage
* Automatic sensor data simulator for testing

---

## Technology Stack

### Frontend

* React
* Vite
* React Router
* Tailwind CSS
* Recharts

### Backend

* Python
* FastAPI
* SQLAlchemy
* PyMySQL
* JWT Authentication
* WebSockets

### Database

* MySQL 8

---

## Project Architecture

```text
                    ┌─────────────────────┐
                    │    React Frontend   │
                    │       Vite          │
                    └──────────┬──────────┘
                               │
                               │ HTTP / WebSocket
                               ▼
                    ┌─────────────────────┐
                    │    FastAPI Backend  │
                    │       Python        │
                    └──────────┬──────────┘
                               │
                               │ SQLAlchemy
                               ▼
                    ┌─────────────────────┐
                    │       MySQL         │
                    │      Database       │
                    └─────────────────────┘
```

Real-time sensor flow:

```text
Sensor Simulator
       │
       ▼
FastAPI
       │
       ├──────────► MySQL
       │
       └──────────► WebSocket
                       │
                       ▼
                 React Dashboard
```

---

## Project Structure

```text
suraksha/
│
├── fastapi-backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── auth_utils.py
│   ├── dependencies.py
│   ├── websocket_manager.py
│   ├── sensor_simulator.py
│   │
│   ├── routes/
│   │   ├── auth.py
│   │   ├── devices.py
│   │   ├── sensors.py
│   │   └── alerts.py
│   │
│   ├── .env
│   └── venv/
│
├── frontend/
│   ├── public/
│   │   ├── safety_banner.png
│   │   └── exhaust-fan.png
│   │
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── HistoricalData.jsx
│   │   │
│   │   ├── App.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## Requirements

Before running the project, install:

* Python 3.x
* Node.js
* npm
* MySQL 8.x
* Git

---

# Backend Setup

Open PowerShell and navigate to the backend:

```powershell
cd "C:\Users\diash\OneDrive\Desktop\SUBHAM CLG\suraksha\fastapi-backend"
```

Create the virtual environment if it does not already exist:

```powershell
python -m venv venv
```

Install the required packages:

```powershell
.\venv\Scripts\python.exe -m pip install fastapi "uvicorn[standard]" sqlalchemy pymysql python-dotenv bcrypt PyJWT email-validator requests websockets
```

---

## Environment Variables

Create a `.env` file inside:

```text
fastapi-backend/.env
```

Example:

```env
DATABASE_URL=mysql+pymysql://USERNAME:PASSWORD@localhost:3306/suraksha
JWT_SECRET=YOUR_SECRET_KEY
```



# MySQL Database

Create the database in MySQL:

```sql
CREATE DATABASE suraksha;
```

The FastAPI backend connects to the `suraksha` database using SQLAlchemy.

The project uses tables for:

* Users
* Devices
* Sensor readings
* Alerts

---

# Running the Backend

From the `fastapi-backend` directory:

```powershell
.\venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```

The backend will run at:

```text
http://localhost:8000
```

FastAPI documentation:

```text
http://localhost:8000/docs
```

---

# Running the Frontend

Open another PowerShell window.

Navigate to:

```powershell
cd "C:\Users\diash\OneDrive\Desktop\SUBHAM CLG\suraksha\frontend"
```

Install dependencies:

```powershell
npm install
```

Start the Vite development server:

```powershell
npm run dev
```

The frontend normally runs at:

```text
http://localhost:5173
```

---

# Sensor Simulator

The project includes a sensor simulator for testing the real-time monitoring system without physical hardware.

From the backend directory:

```powershell
cd "C:\Users\diash\OneDrive\Desktop\SUBHAM CLG\suraksha\fastapi-backend"
```

Run:

```powershell
.\venv\Scripts\python.exe sensor_simulator.py
```

The simulator periodically sends:

* LPG concentration
* Temperature
* Humidity
* Device ID

to the FastAPI backend.

The data is then stored in MySQL and broadcast to the React dashboard through WebSockets.

---

# Real-Time Data Flow

The system works as follows:

```text
Sensor Simulator
       │
       ▼
POST /api/sensors
       │
       ▼
FastAPI
       │
       ├── Save reading to MySQL
       │
       ├── Check LPG level
       │
       ├── Update exhaust fan state
       │
       └── Broadcast WebSocket update
                    │
                    ▼
             React Dashboard
```

The dashboard does not require a page refresh to display new sensor readings.

---

# LPG Alert Logic

The current project uses the following configured thresholds:

| LPG Level        | System State | Exhaust Fan |
| ---------------- | ------------ | ----------- |
| Below 600 PPM    | Normal       | OFF         |
| 600–799 PPM      | Warning      | OFF         |
| 800 PPM or above | Critical     | ON          |

These thresholds are **project-configured values** used by the Suraksha application.

When the LPG concentration reaches the critical threshold, the backend activates the exhaust fan state and creates a critical alert.

---

# Dashboard

The Suraksha dashboard provides:

* Current LPG concentration
* Current temperature
* Current humidity
* Exhaust fan state
* Safety status
* Device connection status
* Live sensor trends
* Historical data access
* Emergency helpline information

The dashboard receives real-time updates through a FastAPI WebSocket connection.

---

# Exhaust Fan

The dashboard includes an exhaust fan visualization.

When the backend reports:

```text
exhaust_fan_on = true
```

the fan animation starts running.

When:

```text
exhaust_fan_on = false
```

the fan animation stops.

The fan state is controlled by the backend's sensor-processing logic.

---

# Authentication

Suraksha uses JWT-based authentication.

The authentication flow is:

```text
User
 │
 ▼
Login
 │
 ▼
FastAPI Authentication
 │
 ▼
JWT Token
 │
 ▼
React localStorage
 │
 ▼
Authenticated API Requests
```

Protected API requests use:

```text
Authorization: Bearer <token>
```

---

# Historical Data

The Historical Data page displays previously recorded sensor information.

Historical readings can be used to review:

* LPG concentration
* Temperature
* Humidity
* Recorded time
* Alert information

---

# API Endpoints

## Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

## Devices

```text
GET /api/devices
```

## Sensors

```text
GET /api/sensors/{device_id}
POST /api/sensors
```

## Alerts

```text
GET /api/alerts
PATCH /api/alerts/{id}/acknowledge
```

## System

```text
GET /api/health
GET /api/protected-test
```

## WebSocket

```text
WS /ws
```

---

# Git Workflow

The project uses Git for version control.

Check the current status:

```powershell
git status
```

Stage changes:

```powershell
git add .
```

Commit changes:

```powershell
git commit -m "Describe your changes"
```

Push changes:

```powershell
git push
```

The current development branch is:

```text
fastapi-mysql
```

The stable branch is:

```text
main
```

---

## Important: Do Not Commit `.env`

Before pushing changes, check:

```powershell
git status
```

Make sure `.env` is not included in the files being committed.

The `.env` file should remain local.

---

# Development Branches

Current project branches:

```text
main
fastapi-mysql
```

The `fastapi-mysql` branch is used for the current FastAPI + MySQL development.

The `main` branch contains the stable project version.

---

# Current Development Status

The project currently supports:

* React frontend
* FastAPI backend
* MySQL database
* JWT authentication
* Device management
* Sensor readings
* Alert generation
* WebSocket real-time updates
* Automatic sensor simulator
* Real-time dashboard
* Historical data
* Exhaust fan state visualization

---

# Future Improvements

Possible future improvements include:

* Hardware sensor integration
* Secure authenticated WebSocket connections
* Multiple-device dashboard support
* Improved alert recovery and resolution
* More advanced historical charts
* Temperature and humidity alert rules
* Production deployment
* Mobile-friendly improvements
* Improved backend logging
* Production database configuration
* Dedicated MySQL database user
* Stronger production security configuration

---

# Emergency Helpline

For LPG emergencies in India, the LPG Emergency Helpline is:

```text
1906
```

In a genuine emergency, follow appropriate local emergency and safety procedures.

---

# Project

**Project Name:** Suraksha

**Purpose:** LPG Gas Safety & Monitoring System

**Frontend:** React + Vite

**Backend:** Python + FastAPI

**Database:** MySQL

**Real-Time Communication:** WebSockets

**Development Branch:** `fastapi-mysql`
