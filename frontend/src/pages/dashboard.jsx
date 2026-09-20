import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [device, setDevice] = useState(null);
  const [reading, setReading] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [exhaustFanOn, setExhaustFanOn] = useState(false);
  const selectedDeviceIdRef = useRef(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("surakshaUser");

    if (!savedUser) {
      navigate("/", { replace: true });
      return;
    }

    const parsedUser = JSON.parse(savedUser);
    setUser(parsedUser);

    const fetchSensorData = async () => {
      try {
        const token = parsedUser.token;

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        // Fetch devices
        const deviceResponse = await fetch(
          "http://localhost:8000/api/devices",
          {
            headers,
          },
        );

        const deviceData = await deviceResponse.json();

        if (!deviceResponse.ok) {
          throw new Error(deviceData.detail || "Failed to fetch devices");
        }

        const devices = Array.isArray(deviceData)
          ? deviceData
          : deviceData.devices || [];

        if (devices.length === 0) {
          setLoading(false);
          return;
        }

        const selectedDevice = devices[0];

        setDevice(selectedDevice);
        selectedDeviceIdRef.current = selectedDevice.id;

        // Fetch sensor history
        const sensorResponse = await fetch(
          `http://localhost:8000/api/sensors/${selectedDevice.id}`,
          {
            headers,
          },
        );

        const sensorData = await sensorResponse.json();

        if (!sensorResponse.ok) {
          throw new Error(sensorData.detail || "Failed to fetch sensor data");
        }

        const readings = Array.isArray(sensorData)
          ? sensorData
          : sensorData.readings || [];

        if (readings.length > 0) {
          setReading(readings[0]);

          setExhaustFanOn(Number(readings[0].lpg_ppm) >= 800);

          const chartData = [...readings].reverse().map((item) => ({
            time: new Date(item.recorded_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            lpg: Number(item.lpg_ppm),
            temperature: Number(item.temperature),
            humidity: Number(item.humidity),
          }));

          setHistory(chartData);
        }

        // Fetch alerts
        const alertResponse = await fetch("http://localhost:8000/api/alerts", {
          headers,
        });

        const alertData = await alertResponse.json();

        if (!alertResponse.ok) {
          throw new Error(alertData.detail || "Failed to fetch alerts");
        }

        const alertList = Array.isArray(alertData)
          ? alertData
          : alertData.alerts || [];

        setAlerts(alertList);
      } catch (err) {
        console.error("DASHBOARD ERROR:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSensorData();

    // FastAPI WebSocket
    const websocket = new WebSocket("ws://localhost:8000/ws");

    websocket.onopen = () => {
      console.log("Connected to Suraksha real-time server");
    };

    websocket.onmessage = (event) => {
      try {
        const newReading = JSON.parse(event.data);

        console.log("REAL-TIME SENSOR UPDATE:", newReading);

        // Ignore readings from other devices
        if (newReading.device_id !== selectedDeviceIdRef.current) {
          return;
        }

        setDevice((currentDevice) => {
          if (!currentDevice) {
            return currentDevice;
          }

          return {
            ...currentDevice,
            status: "online",
            last_seen: newReading.recorded_at,
          };
        });

        setReading(newReading);

        setExhaustFanOn(Boolean(newReading.exhaust_fan_on));

        const newChartPoint = {
          time: new Date(newReading.recorded_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          lpg: Number(newReading.lpg_ppm),
          temperature: Number(newReading.temperature),
          humidity: Number(newReading.humidity),
        };

        setHistory((currentHistory) => [...currentHistory, newChartPoint]);

        // Refresh alerts when a new alert is created
        if (newReading.alert_created) {
          fetch("http://localhost:8000/api/alerts", {
            headers: {
              Authorization: `Bearer ${parsedUser.token}`,
            },
          })
            .then((response) => response.json())
            .then((data) => {
              const alertList = Array.isArray(data) ? data : data.alerts || [];

              setAlerts(alertList);
            })
            .catch((error) => {
              console.error("ALERT REFRESH ERROR:", error);
            });
        }
      } catch (error) {
        console.error("WEBSOCKET MESSAGE ERROR:", error);
      }
    };

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    websocket.onclose = () => {
      console.log("Disconnected from Suraksha real-time server");
    };

    return () => {
      websocket.close();
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("surakshaUser");
    navigate("/", { replace: true });
  };

  const handleAcknowledge = async (alertId) => {
    try {
      const savedUser = localStorage.getItem("surakshaUser");

      const parsedUser = JSON.parse(savedUser);

      const response = await fetch(
        `http://localhost:8000/api/alerts/${alertId}/acknowledge`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${parsedUser.token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to acknowledge alert");
      }

      setAlerts((currentAlerts) =>
        currentAlerts.map((currentAlert) =>
          currentAlert.id === alertId ? data.alert : currentAlert,
        ),
      );
    } catch (error) {
      console.error("ACKNOWLEDGE ALERT ERROR:", error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Suraksha</h1>

            <p className="text-sm text-slate-500">
              LPG Gas Safety & Monitoring System
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div
                className={`h-3 w-3 rounded-full ${
                  device?.status === "online" ? "bg-green-500" : "bg-slate-400"
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

                <p className="text-xs text-slate-500">{user.email}</p>
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
            <p className="text-slate-500">Loading sensor data...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-8">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!loading && device && (
          <div
            className={`border rounded-2xl p-5 mb-8 ${
              reading && Number(reading.lpg_ppm) >= 800
                ? "bg-red-50 border-red-200"
                : reading && Number(reading.lpg_ppm) >= 600
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-green-50 border-green-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">
                {reading && Number(reading.lpg_ppm) >= 800
                  ? "🔴"
                  : reading && Number(reading.lpg_ppm) >= 600
                    ? "🟡"
                    : "🟢"}
              </div>

              <div>
                <h3
                  className={`font-semibold ${
                    reading && Number(reading.lpg_ppm) >= 800
                      ? "text-red-800"
                      : reading && Number(reading.lpg_ppm) >= 600
                        ? "text-yellow-800"
                        : "text-green-800"
                  }`}
                >
                  {reading && Number(reading.lpg_ppm) >= 800
                    ? "Critical LPG Level"
                    : reading && Number(reading.lpg_ppm) >= 600
                      ? "LPG Warning"
                      : "System Normal"}
                </h3>

                <p
                  className={`text-sm ${
                    reading && Number(reading.lpg_ppm) >= 800
                      ? "text-red-700"
                      : reading && Number(reading.lpg_ppm) >= 600
                        ? "text-yellow-700"
                        : "text-green-700"
                  }`}
                >
                  {reading && Number(reading.lpg_ppm) >= 800
                    ? "LPG level has reached the configured exhaust-fan threshold."
                    : reading && Number(reading.lpg_ppm) >= 600
                      ? "LPG level has reached the configured warning threshold."
                      : "No active safety condition detected."}
                </p>
              </div>
            </div>
          </div>
        )}

        {device && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-700">
                  LPG Concentration
                </h3>

                <span className="text-2xl">🔥</span>
              </div>

              <div className="mt-6">
                <p className="text-4xl font-bold text-slate-800">
                  {reading
                    ? `${Math.round(Number(reading.lpg_ppm))} PPM`
                    : "--"}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Current LPG concentration
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-700">Temperature</h3>

                <span className="text-2xl">🌡️</span>
              </div>

              <div className="mt-6">
                <p className="text-4xl font-bold text-slate-800">
                  {reading
                    ? `${Math.round(Number(reading.temperature))}°C`
                    : "--"}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Current temperature
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-700">Humidity</h3>

                <span className="text-2xl">💧</span>
              </div>

              <div className="mt-6">
                <p className="text-4xl font-bold text-slate-800">
                  {reading ? `${Math.round(Number(reading.humidity))}%` : "--"}
                </p>

                <p className="mt-2 text-sm text-slate-500">Current humidity</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-700">Exhaust Fan</h3>

                <span className="text-2xl">💨</span>
              </div>

              <div className="mt-6">
                <p
                  className={`text-4xl font-bold ${
                    exhaustFanOn ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {exhaustFanOn ? "ON" : "OFF"}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Current exhaust fan status
                </p>
              </div>
            </div>
          </div>
        )}

        {device && history.length > 0 && (
          <div className="mt-8 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-slate-800">
                LPG PPM History
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                LPG concentration readings over time
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
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-800">Alerts</h3>

                <p className="text-sm text-slate-500 mt-1">
                  Recent safety alerts from your LPG monitoring system
                </p>
              </div>

              <span className="text-2xl">🚨</span>
            </div>

            <div className="mt-5 space-y-3">
              {alerts.length === 0 ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-green-700 font-medium">No active alerts</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`rounded-xl border p-4 ${
                      alert.severity === "critical"
                        ? "bg-red-50 border-red-200"
                        : "bg-yellow-50 border-yellow-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-xl">
                        {alert.severity === "critical" ? "🔴" : "🟡"}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-4">
                          <p
                            className={`font-semibold ${
                              alert.severity === "critical"
                                ? "text-red-800"
                                : "text-yellow-800"
                            }`}
                          >
                            {alert.type}
                          </p>

                          <span className="text-xs text-slate-500">
                            {new Date(alert.created_at).toLocaleString()}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-700">
                          {alert.message}
                        </p>

                        {alert.acknowledged_at ? (
                          <p className="mt-2 text-xs text-green-600 font-medium">
                            ✓ Acknowledged
                          </p>
                        ) : (
                          <button
                            onClick={() => handleAcknowledge(alert.id)}
                            className="mt-3 bg-slate-800 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition"
                          >
                            Acknowledge Alert
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {device && (
          <div className="mt-8 bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-slate-800">
              Device Status
            </h3>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-500">Device</p>

                <p className="mt-1 font-semibold text-slate-800">
                  {device.name}
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-500">Exhaust Fan</p>

                <p
                  className={`mt-1 font-semibold ${
                    exhaustFanOn ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {exhaustFanOn ? "ON" : "OFF"}
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-500">Connection</p>

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
                <p className="text-sm text-slate-500">Last Updated</p>

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
  );
}

export default Dashboard;
