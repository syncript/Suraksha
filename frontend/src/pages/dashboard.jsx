import React, { useEffect, useRef, useState } from "react";
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

/* =========================================================
   SIMPLE SVG ICONS
   ========================================================= */

function DashboardIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function HistoryIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function SettingsIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.7 1.7-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.1h-2.4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.7-1.7.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H4.7v-2.4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L6 7.5l1.7-1.7.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.1h2.4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.7 1.7-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v2.4H20a1.7 1.7 0 0 0-.6 2.1Z" />
    </svg>
  );
}

function LogoutIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function ShieldIcon({ size = 26 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3 20 6v5c0 5.2-3.4 8.9-8 10-4.6-1.1-8-4.8-8-10V6l8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function GasIcon({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21h6" />
      <path d="M10 21v-3.5a5 5 0 0 1-3-4.5c0-3.5 3-5.5 5-9 2 3.5 5 5.5 5 9a5 5 0 0 1-3 4.5V21" />
      <path d="M12 13c-.9-1.1-.8-2.1 0-3.2.9 1.1 1.8 2.2 0 3.2Z" />
    </svg>
  );
}

function TemperatureIcon({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0Z" />
      <path d="M12 12V6" />
    </svg>
  );
}

function HumidityIcon({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3s6 6.1 6 11a6 6 0 0 1-12 0c0-4.9 6-11 6-11Z" />
    </svg>
  );
}

function FanIcon({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="2" />
      <path d="M12 10c-1-4 .5-6 3-6 2.5 0 2.5 4-1 6" />
      <path d="M14 12c4-1 6 .5 6 3s-4 2.5-6-1" />
      <path d="M12 14c1 4-.5 6-3 6-2.5 0-2.5-4 1-6" />
      <path d="M10 12c-4 1-6-.5-6-3s4-2.5 6 1" />
    </svg>
  );
}

function WifiIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12.5a10 10 0 0 1 14 0" />
      <path d="M8 15.5a6 6 0 0 1 8 0" />
      <path d="M11 18.5a2 2 0 0 1 2 0" />
    </svg>
  );
}

/* =========================================================
   DASHBOARD
   ========================================================= */

export default function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [device, setDevice] = useState(null);
  const [devices, setDevices] = useState([]);
  const [reading, setReading] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exhaustFanOn, setExhaustFanOn] = useState(false);

  const selectedDeviceIdRef = useRef(null);

  const API_BASE = "http://localhost:8000";

  /* =========================================================
     AUTHENTICATION
     ========================================================= */

  useEffect(() => {
    const savedUser = localStorage.getItem("surakshaUser");

    if (!savedUser) {
      navigate("/", { replace: true });
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
    } catch {
      localStorage.removeItem("surakshaUser");
      navigate("/", { replace: true });
    }
  }, [navigate]);

  /* =========================================================
     LOAD USER DEVICES
     ========================================================= */

  useEffect(() => {
    if (!user?.token) return;

    const loadDevices = async () => {
      setLoading(true);
      setError("");

      try {
        const headers = {
          Authorization: `Bearer ${user.token}`,
        };

        const deviceResponse = await fetch(`${API_BASE}/api/devices`, {
          headers,
        });

        if (!deviceResponse.ok) {
          throw new Error("Unable to load devices");
        }

        const deviceData = await deviceResponse.json();

        const loadedDevices = Array.isArray(deviceData)
          ? deviceData
          : deviceData.devices || [];

        setDevices(loadedDevices);

        if (loadedDevices.length === 0) {
          selectedDeviceIdRef.current = null;
          setDevice(null);
          setReading(null);
          setHistory([]);
          setExhaustFanOn(false);
          return;
        }

        const currentDevice = loadedDevices.find(
          (item) => item.id === selectedDeviceIdRef.current,
        );

        const initialDevice = currentDevice || loadedDevices[0];

        selectedDeviceIdRef.current = initialDevice.id;
        setDevice(initialDevice);
      } catch (err) {
        console.error("Device loading error:", err);
        setError("Unable to load dashboard devices.");
      } finally {
        setLoading(false);
      }
    };

    loadDevices();
  }, [user]);

  /* =========================================================
     LOAD SENSOR DATA FOR SELECTED DEVICE
     ========================================================= */

  useEffect(() => {
    if (!user?.token || !device?.id) return;

    const loadSensorData = async () => {
      setError("");

      try {
        const headers = {
          Authorization: `Bearer ${user.token}`,
        };

        const sensorResponse = await fetch(
          `${API_BASE}/api/sensors/${device.id}`,
          { headers },
        );

        if (!sensorResponse.ok) {
          throw new Error("Unable to load sensor data");
        }

        const sensorData = await sensorResponse.json();

        const readings = Array.isArray(sensorData)
          ? sensorData
          : sensorData.readings || [];

        if (readings.length > 0) {
          const latestReading = readings[0];

          setReading(latestReading);

          setHistory(
            [...readings].reverse().map((item) => ({
              time: formatTime(item.recorded_at),
              lpg: Number(item.lpg_ppm || 0),
              temperature: Number(item.temperature || 0),
              humidity: Number(item.humidity || 0),
            })),
          );

          setExhaustFanOn(Boolean(latestReading.exhaust_fan_on));
        } else {
          setReading(null);
          setHistory([]);
          setExhaustFanOn(false);
        }
      } catch (err) {
        console.error("Sensor loading error:", err);
        setError("Unable to load sensor data for the selected device.");
        setReading(null);
        setHistory([]);
        setExhaustFanOn(false);
      }
    };

    loadSensorData();
  }, [user, device?.id]);

  /* =========================================================
     WEBSOCKET REAL-TIME DATA
     ========================================================= */

  useEffect(() => {
    if (!user?.token) return;

    const websocket = new WebSocket(
      `ws://localhost:8000/ws?token=${encodeURIComponent(user.token)}`,
    );

    websocket.onopen = () => {
      console.log("Connected to Suraksha real-time server");
    };

    websocket.onmessage = (event) => {
      try {
        const newReading = JSON.parse(event.data);

        if (newReading.device_id !== selectedDeviceIdRef.current) {
          return;
        }

        console.log("REAL-TIME SENSOR UPDATE:", newReading);

        setReading(newReading);

        setExhaustFanOn(Boolean(newReading.exhaust_fan_on));

        setDevice((previousDevice) => ({
          ...previousDevice,
          status: "online",
          last_seen: newReading.recorded_at,
        }));

        setHistory((previousHistory) => {
          const updatedHistory = [
            ...previousHistory,
            {
              time: formatTime(newReading.recorded_at),
              lpg: Number(newReading.lpg_ppm || 0),
              temperature: Number(newReading.temperature || 0),
              humidity: Number(newReading.humidity || 0),
            },
          ];

          return updatedHistory.slice(-20);
        });
      } catch (err) {
        console.error("WebSocket message error:", err);
      }
    };

    websocket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    websocket.onclose = () => {
      console.log("Disconnected from Suraksha real-time server");
    };

    return () => {
      websocket.close();
    };
  }, [user]);

  /* =========================================================
     LOGOUT
     ========================================================= */

  const handleLogout = () => {
    localStorage.removeItem("surakshaUser");
    navigate("/", { replace: true });
  };

  /* =========================================================
     STATUS LOGIC
     ========================================================= */

  const lpgValue = Number(reading?.lpg_ppm || 0);

  let safetyStatus = "NORMAL";
  let safetyDescription = "Your LPG monitoring system is operating normally.";
  let safetyClass = "normal";

  if (lpgValue >= 800) {
    safetyStatus = "CRITICAL";
    safetyDescription =
      "Critical LPG concentration detected. The exhaust fan is activated automatically.";
    safetyClass = "critical";
  } else if (lpgValue >= 600) {
    safetyStatus = "WARNING";
    safetyDescription =
      "LPG concentration is above the warning threshold. Please remain alert.";
    safetyClass = "warning";
  }

  /* =========================================================
     TIME / DATE
     ========================================================= */

  const currentDate = new Date();

  const formattedDate = currentDate.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  /* =========================================================
     LOADING
     ========================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-slate-600 font-medium">
            Loading Suraksha dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-800">
      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <aside className="fixed left-0 top-0 bottom-0 w-[250px] bg-[#101c36] text-white flex flex-col z-50">
        {/* BRAND */}

        <div className="px-7 py-7 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
              <ShieldIcon size={25} />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-wide">SURAKSHA</h1>

              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                LPG Safety System
              </p>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}

        <nav className="px-4 py-7 space-y-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 text-white font-medium"
          >
            <DashboardIcon />

            <span>Dashboard</span>
          </button>

          <button
            onClick={() => navigate("/historical-data")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition"
          >
            <HistoryIcon />

            <span>Historical Data</span>
          </button>

          <button
            disabled
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 cursor-not-allowed"
          >
            <SettingsIcon />

            <span>Settings</span>
          </button>
        </nav>

        {/* USER AREA */}

        <div className="mt-auto">
          <div className="mx-4 mb-3 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 font-semibold">
                {(user?.name || user?.username || "U").charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">
                <p className="font-medium truncate">
                  {user?.name || user?.username || "User"}
                </p>

                <p className="text-xs text-slate-400 truncate">
                  {user?.email || "Suraksha User"}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full px-7 py-5 border-t border-white/10 flex items-center gap-3 text-slate-400 hover:text-white transition"
          >
            <LogoutIcon />

            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}

      <main className="ml-[250px] min-h-screen">
        {/* ===================================================
            TOP BAR
            =================================================== */}

        <header className="h-[76px] bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div>
            <p className="text-sm text-slate-500">LPG Safety & Monitoring</p>

            <h2 className="text-xl font-semibold text-slate-900">Dashboard</h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-slate-700">
                {formattedDate}
              </p>

              <p className="text-xs text-slate-400">
                Real-time monitoring active
              </p>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-50 border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />

              <span className="text-sm font-medium text-emerald-700">
                System Online
              </span>
            </div>
          </div>
        </header>

        {/* ===================================================
            PAGE CONTENT
            =================================================== */}

        <div className="p-8 max-w-[1600px] mx-auto">
          {/* =================================================
              WELCOME
              ================================================= */}

          <section className="mb-6">
            <p className="text-sm text-slate-500 mb-1">Welcome back</p>

            <h1 className="text-3xl font-bold text-slate-900">
              {user?.name || user?.username || "User"}
            </h1>

            <p className="text-slate-500 mt-1">
              Monitor your LPG safety system in real time.
            </p>
          </section>

          {/* =================================================
              SAFETY BANNER
              ================================================= */}

          <section
            className={`relative overflow-hidden rounded-2xl mb-7 min-h-[230px] shadow-sm border ${
              safetyClass === "normal"
                ? "border-emerald-200"
                : safetyClass === "warning"
                  ? "border-amber-200"
                  : "border-red-200"
            }`}
          >
            {/* IMAGE */}

            <img
              src="/safety_banner.png"
              alt="LPG safety"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* DARK OVERLAY */}

            <div
              className={`absolute inset-0 ${
                safetyClass === "normal"
                  ? "bg-gradient-to-r from-emerald-950/85 via-emerald-900/55 to-transparent"
                  : safetyClass === "warning"
                    ? "bg-gradient-to-r from-amber-950/85 via-amber-900/55 to-transparent"
                    : "bg-gradient-to-r from-red-950/90 via-red-900/60 to-transparent"
              }`}
            />

            {/* CONTENT */}

            <div className="relative z-10 p-8 md:p-10 max-w-2xl text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                  <ShieldIcon size={25} />
                </div>

                <span className="text-sm font-semibold tracking-[0.15em] uppercase">
                  Safety Status
                </span>
              </div>

              <h2 className="text-4xl font-bold mb-3 tracking-tight">
                System {safetyStatus}
              </h2>

              <p className="text-white/85 text-sm md:text-base leading-relaxed max-w-xl">
                {safetyDescription}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-4">
                <div className="px-4 py-2 rounded-lg bg-white/15 backdrop-blur-sm border border-white/20">
                  <span className="text-xs text-white/70 block">
                    Current LPG
                  </span>

                  <span className="text-xl font-bold">{lpgValue} PPM</span>
                </div>

                <p className="text-sm italic text-white/80">
                  "Safety begins with awareness. Stay alert, stay protected."
                </p>
              </div>
            </div>
          </section>

          {/* =================================================
              ERROR
              ================================================= */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* =================================================
              LIVE METRICS
              ================================================= */}

          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-7">
            {/* LPG */}

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">LPG Concentration</p>

                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-bold text-slate-900">
                      {lpgValue}
                    </span>

                    <span className="text-sm text-slate-400">PPM</span>
                  </div>
                </div>

                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    lpgValue >= 800
                      ? "bg-red-50 text-red-600"
                      : lpgValue >= 600
                        ? "bg-amber-50 text-amber-600"
                        : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  <GasIcon />
                </div>
              </div>

              <div className="mt-5">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-400">Safety range</span>

                  <span
                    className={
                      lpgValue >= 800
                        ? "text-red-600 font-medium"
                        : lpgValue >= 600
                          ? "text-amber-600 font-medium"
                          : "text-emerald-600 font-medium"
                    }
                  >
                    {safetyStatus}
                  </span>
                </div>

                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      lpgValue >= 800
                        ? "bg-red-500"
                        : lpgValue >= 600
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                    }`}
                    style={{
                      width: `${Math.min((lpgValue / 1000) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* TEMPERATURE */}

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">Temperature</p>

                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-bold text-slate-900">
                      {reading?.temperature ?? "--"}
                    </span>

                    <span className="text-sm text-slate-400">°C</span>
                  </div>
                </div>

                <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                  <TemperatureIcon />
                </div>
              </div>

              <p className="mt-5 text-xs text-slate-400">
                Live environmental reading
              </p>
            </div>

            {/* HUMIDITY */}

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">Humidity</p>

                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-bold text-slate-900">
                      {reading?.humidity ?? "--"}
                    </span>

                    <span className="text-sm text-slate-400">%</span>
                  </div>
                </div>

                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                  <HumidityIcon />
                </div>
              </div>

              <p className="mt-5 text-xs text-slate-400">
                Current surrounding humidity
              </p>
            </div>

            {/* FAN */}

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Exhaust Fan</p>

                  <p
                    className={`text-2xl font-bold mt-2 ${
                      exhaustFanOn ? "text-blue-600" : "text-slate-800"
                    }`}
                  >
                    {exhaustFanOn ? "RUNNING" : "STOPPED"}
                  </p>
                </div>

                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    exhaustFanOn
                      ? "bg-blue-50 text-blue-600"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <FanIcon />
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    exhaustFanOn ? "bg-blue-500 animate-pulse" : "bg-slate-300"
                  }`}
                />

                <span className="text-xs text-slate-500">
                  {exhaustFanOn
                    ? "Automatic ventilation active"
                    : "Ventilation standby"}
                </span>
              </div>
            </div>
          </section>

          {/* =================================================
              MAIN TWO COLUMN AREA
              ================================================= */}

          <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_330px] gap-6 mb-7">
            {/* =================================================
                COMBINED SENSOR TREND
                ================================================= */}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Live Sensor Trends
                  </h3>

                  <p className="text-sm text-slate-400 mt-1">
                    Real-time LPG, temperature and humidity readings
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="text-slate-500">LPG</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    <span className="text-slate-500">Temperature</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-slate-500">Humidity</span>
                  </div>
                </div>
              </div>

              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={history}
                    margin={{
                      top: 10,
                      right: 15,
                      left: -15,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8edf3" />

                    <XAxis
                      dataKey="time"
                      tick={{
                        fontSize: 11,
                        fill: "#94a3b8",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      tick={{
                        fontSize: 11,
                        fill: "#94a3b8",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 8px 30px rgba(15, 23, 42, 0.08)",
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="lpg"
                      name="LPG PPM"
                      stroke="#3b82f6"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{
                        r: 5,
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="temperature"
                      name="Temperature"
                      stroke="#f97316"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{
                        r: 5,
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="humidity"
                      name="Humidity"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{
                        r: 5,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* =================================================
                FAN PANEL
                ================================================= */}

            <div className="bg-[#101c36] rounded-2xl shadow-sm p-6 text-white overflow-hidden relative">
              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-slate-400">
                      Automatic Ventilation
                    </p>

                    <h3 className="text-xl font-semibold mt-2">Exhaust Fan</h3>
                  </div>

                  <div
                    className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                      exhaustFanOn
                        ? "bg-blue-400/15 text-blue-300 border border-blue-400/20"
                        : "bg-white/5 text-slate-400 border border-white/10"
                    }`}
                  >
                    {exhaustFanOn ? "ACTIVE" : "STANDBY"}
                  </div>
                </div>

                {/* FAN IMAGE */}

                <div className="h-[190px] flex items-center justify-center">
                  <div
                    className={`w-[145px] h-[145px] flex items-center justify-center ${
                      exhaustFanOn ? "fan-running" : ""
                    }`}
                  >
                    <img
                      src="/exhaust-fan.png"
                      alt="Exhaust fan"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                <div className="border-t border-white/10 pt-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-slate-400">Fan state</span>

                    <span
                      className={`text-sm font-semibold ${
                        exhaustFanOn ? "text-blue-300" : "text-slate-300"
                      }`}
                    >
                      {exhaustFanOn ? "Running" : "Stopped"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Control mode</span>

                    <span className="text-sm font-medium text-white">
                      Automatic
                    </span>
                  </div>
                </div>
              </div>

              <div className="absolute -right-20 -bottom-20 w-56 h-56 rounded-full bg-blue-500/10 blur-3xl" />
            </div>
          </section>

          {/* =================================================
              LOWER SECTION
              ================================================= */}

          <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_260px] gap-6">
            {/* =================================================
                DEVICE STATUS
                ================================================= */}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Device Status
                  </h3>

                  <p className="text-sm text-slate-400 mt-1">
                    Connected monitoring device
                  </p>
                  {devices.length > 1 && (
                    <select
                      value={device?.id ?? ""}
                      onChange={(e) => {
                        const selected = devices.find(
                          (item) => item.id === Number(e.target.value),
                        );

                        if (selected) {
                          selectedDeviceIdRef.current = selected.id;
                          setDevice(selected);
                          setReading(null);
                          setHistory([]);
                          setExhaustFanOn(false);
                        }
                      }}
                      className="mt-3 w-full max-w-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-blue-400"
                    >
                      {devices.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name || `Device ${item.id}`}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                    device?.status === "online"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      device?.status === "online"
                        ? "bg-emerald-500 animate-pulse"
                        : "bg-slate-400"
                    }`}
                  />

                  {device?.status === "online" ? "Online" : "Offline"}
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 mb-5">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600">
                  <WifiIcon size={24} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">
                    {device?.name || "Suraksha Monitoring Device"}
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Device ID: {device?.id ?? "--"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-400">Connection</p>

                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {device?.status === "online" ? "Connected" : "Disconnected"}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-400">Last seen</p>

                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {device?.last_seen
                      ? formatTime(device.last_seen)
                      : reading?.recorded_at
                        ? formatTime(reading.recorded_at)
                        : "--"}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-400">Monitoring</p>

                  <p className="text-sm font-semibold text-emerald-600 mt-1">
                    Active
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-400">Fan control</p>

                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    Automatic
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                QUICK ACTIONS / CURRENT READING
                ================================================= */}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="mb-5">
                <h3 className="text-lg font-semibold text-slate-900">
                  Monitoring Overview
                </h3>

                <p className="text-sm text-slate-400 mt-1">
                  Current system activity
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <GasIcon size={19} />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        LPG Monitoring
                      </p>

                      <p className="text-xs text-slate-400">
                        Real-time concentration
                      </p>
                    </div>
                  </div>

                  <span className="text-sm font-semibold text-slate-800">
                    {lpgValue} PPM
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                      <TemperatureIcon size={19} />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Temperature
                      </p>

                      <p className="text-xs text-slate-400">
                        Current environment
                      </p>
                    </div>
                  </div>

                  <span className="text-sm font-semibold text-slate-800">
                    {reading?.temperature ?? "--"} °C
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <FanIcon size={19} />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Exhaust System
                      </p>

                      <p className="text-xs text-slate-400">
                        Automatic response
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-sm font-semibold ${
                      exhaustFanOn ? "text-blue-600" : "text-slate-600"
                    }`}
                  >
                    {exhaustFanOn ? "Running" : "Stopped"}
                  </span>
                </div>

                <button
                  onClick={() => navigate("/historical-data")}
                  className="w-full mt-2 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  View Historical Data
                </button>
              </div>
            </div>

            {/* =================================================
                EMERGENCY CARD
                ================================================= */}

            <div className="bg-[#101c36] rounded-2xl p-6 text-white flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-red-500/15 text-red-300 flex items-center justify-center mb-4">
                  <ShieldIcon size={22} />
                </div>

                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                  Emergency Support
                </p>

                <h3 className="text-lg font-semibold mt-2">LPG Emergency</h3>

                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  If you detect a serious LPG emergency, contact the official
                  emergency helpline.
                </p>
              </div>

              <div className="mt-6">
                <p className="text-xs text-slate-400 mb-1">
                  Emergency Helpline
                </p>

                <p className="text-2xl font-bold tracking-wide">1906</p>
              </div>
            </div>
          </section>

          {/* =================================================
              FOOTER
              ================================================= */}

          <footer className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <p>Suraksha LPG Safety & Monitoring System</p>

            <p>Real-time monitoring enabled</p>
          </footer>
        </div>
      </main>

      {/* =====================================================
          FAN ANIMATION
          ===================================================== */}

      <style>
        {`
          @keyframes surakshaFanSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          .fan-running {
            animation: surakshaFanSpin 0.75s linear infinite;
          }
        `}
      </style>
    </div>
  );
}

/* =========================================================
   HELPERS
   ========================================================= */

function formatTime(dateValue) {
  if (!dateValue) {
    return "--";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
