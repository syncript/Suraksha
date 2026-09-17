
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { io } from "socket.io-client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

function Dashboard() {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [device, setDevice] = useState(null)
  const [reading, setReading] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const savedUser = localStorage.getItem("surakshaUser")

    if (!savedUser) {
      navigate("/", { replace: true })
      return
    }

    const parsedUser = JSON.parse(savedUser)
    setUser(parsedUser)

    const fetchSensorData = async () => {
      try {
        const token = parsedUser.token

        const headers = {
          Authorization: `Bearer ${token}`,
        }

        const deviceResponse = await fetch(
          "http://localhost:5000/api/devices",
          {
            headers,
          }
        )

        const deviceData = await deviceResponse.json()

        if (!deviceResponse.ok) {
          throw new Error(
            deviceData.message || "Failed to fetch devices"
          )
        }

        if (!deviceData.devices || deviceData.devices.length === 0) {
          setLoading(false)
          return
        }

        const selectedDevice = deviceData.devices[0]

        setDevice(selectedDevice)

        const sensorResponse = await fetch(
          `http://localhost:5000/api/sensors/${selectedDevice.id}`,
          {
            headers,
          }
        )

        const sensorData = await sensorResponse.json()

        if (!sensorResponse.ok) {
          throw new Error(
            sensorData.message || "Failed to fetch sensor data"
          )
        }

        if (sensorData.readings && sensorData.readings.length > 0) {
          setReading(sensorData.readings[0])

          const chartData = [...sensorData.readings]
            .reverse()
            .map((item) => ({
              time: new Date(item.recorded_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              lpg: Number(item.lpg_level),
              temperature: Number(item.temperature),
              humidity: Number(item.humidity),
            }))

          setHistory(chartData)
        }
      } catch (err) {
        console.error("DASHBOARD ERROR:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSensorData()

    const socket = io("http://localhost:5000")

    socket.on("connect", () => {
      console.log("Connected to Suraksha real-time server")
    })

    socket.on("sensor-update", (newReading) => {
      console.log("REAL-TIME SENSOR UPDATE:", newReading)

      setReading(newReading)

      setDevice((currentDevice) => {
        if (!currentDevice) {
          return currentDevice
        }

        if (currentDevice.id === newReading.device_id) {
          return {
            ...currentDevice,
            status: "online",
            last_seen: newReading.recorded_at,
          }
        }

        return currentDevice
      })

      const newChartPoint = {
        time: new Date(newReading.recorded_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        lpg: Number(newReading.lpg_level),
        temperature: Number(newReading.temperature),
        humidity: Number(newReading.humidity),
      }

      setHistory((currentHistory) => [
        ...currentHistory,
        newChartPoint,
      ])
    })

    socket.on("disconnect", () => {
      console.log("Disconnected from Suraksha real-time server")
    })

    return () => {
      socket.disconnect()
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem("surakshaUser")
    navigate("/", { replace: true })
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-100">

      <header className="bg-white shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Suraksha
            </h1>

            <p className="text-sm text-slate-500">
              LPG Gas Safety & Monitoring System
            </p>
          </div>

          <div className="flex items-center gap-6">

            <div className="flex items-center gap-3">
              <div
                className={`h-3 w-3 rounded-full ${
                  device?.status === "online"
                    ? "bg-green-500"
                    : "bg-slate-400"
                }`}
              />

              <span className="text-sm font-medium text-slate-700">
                {device?.status === "online"
                  ? "System Online"
                  : "System Offline"}
              </span>
            </div>

            <div className="flex items-center gap-3">

              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-800">
                  {user.name}
                </p>

                <p className="text-xs text-slate-500">
                  {user.email}
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition"
              >
                Logout
              </button>

            </div>

          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800">
            Welcome, {user.name}
          </h2>

          <p className="mt-2 text-slate-500">
            Monitor your LPG safety system in real time.
          </p>
        </div>

        {loading && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <p className="text-slate-500">
              Loading sensor data...
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-8">
            <p className="text-red-700">
              {error}
            </p>
          </div>
        )}

        {!loading && !error && !device && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 mb-8">
            <h3 className="font-semibold text-yellow-800">
              No device connected
            </h3>

            <p className="text-sm text-yellow-700 mt-1">
              Add a Suraksha sensor device to start monitoring.
            </p>
          </div>
        )}

        {!loading && device && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-8">
            <div className="flex items-center gap-3">

              <div className="text-2xl">
                🟢
              </div>

              <div>
                <h3 className="font-semibold text-green-800">
                  System Normal
                </h3>

                <p className="text-sm text-green-700">
                  No active safety alerts detected.
                </p>
              </div>

            </div>
          </div>
        )}

        {device && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between">

                <h3 className="font-semibold text-slate-700">
                  LPG Level
                </h3>

                <span className="text-2xl">
                  🔥
                </span>

              </div>

              <div className="mt-6">
                <p className="text-4xl font-bold text-slate-800">
                  {reading ? `${reading.lpg_level}%` : "--"}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Current gas level
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between">

                <h3 className="font-semibold text-slate-700">
                  Temperature
                </h3>

                <span className="text-2xl">
                  🌡️
                </span>

              </div>

              <div className="mt-6">
                <p className="text-4xl font-bold text-slate-800">
                  {reading ? `${reading.temperature}°C` : "--"}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Current temperature
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between">

                <h3 className="font-semibold text-slate-700">
                  Humidity
                </h3>

                <span className="text-2xl">
                  💧
                </span>

              </div>

              <div className="mt-6">
                <p className="text-4xl font-bold text-slate-800">
                  {reading ? `${reading.humidity}%` : "--"}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Current humidity
                </p>
              </div>
            </div>

          </div>
        )}

        {device && history.length > 0 && (
          <div className="mt-8 space-y-8">

            <div className="bg-white rounded-2xl shadow-sm p-6">

              <h3 className="text-xl font-semibold text-slate-800">
                LPG Level History
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                LPG readings over time
              </p>

              <div className="w-full h-80 mt-6">

                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="time" />

                    <YAxis />

                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="lpg"
                      stroke="#ef4444"
                      strokeWidth={3}
                      dot={false}
                    />

                  </LineChart>
                </ResponsiveContainer>

              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">

              <h3 className="text-xl font-semibold text-slate-800">
                Temperature History
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Temperature readings over time
              </p>

              <div className="w-full h-80 mt-6">

                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="time" />

                    <YAxis />

                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      dot={false}
                    />

                  </LineChart>
                </ResponsiveContainer>

              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">

              <h3 className="text-xl font-semibold text-slate-800">
                Humidity History
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Humidity readings over time
              </p>

              <div className="w-full h-80 mt-6">

                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="time" />

                    <YAxis />

                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="humidity"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={false}
                    />

                  </LineChart>
                </ResponsiveContainer>

              </div>
            </div>

          </div>
        )}

        {device && (
          <div className="mt-8 bg-white rounded-2xl shadow-sm p-6">

            <h3 className="text-xl font-semibold text-slate-800">
              Device Status
            </h3>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">

              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-500">
                  Device
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {device.name}
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-500">
                  Connection
                </p>

                <p
                  className={`mt-1 font-semibold ${
                    device.status === "online"
                      ? "text-green-600"
                      : "text-slate-500"
                  }`}
                >
                  {device.status}
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-500">
                  Last Updated
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {reading?.recorded_at
                    ? new Date(reading.recorded_at).toLocaleString()
                    : "No data"}
                </p>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  )
}

export default Dashboard
