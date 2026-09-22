import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function HistoricalData() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [device, setDevice] = useState(null);
  const [readings, setReadings] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("surakshaUser");

    if (!savedUser) {
      navigate("/");
      return;
    }

    const parsedUser = JSON.parse(savedUser);
    setUser(parsedUser);

    const fetchHistoricalData = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${parsedUser.token}`,
        };

        // Get user's devices
        const devicesResponse = await fetch(
          "http://localhost:8000/api/devices",
          { headers },
        );

        if (!devicesResponse.ok) {
          throw new Error("Failed to load devices");
        }

        const devices = await devicesResponse.json();

        if (!devices.length) {
          setError("No device found for this account.");
          setLoading(false);
          return;
        }

        const selectedDevice = devices[0];
        setDevice(selectedDevice);

        // Get sensor history
        const readingsResponse = await fetch(
          `http://localhost:8000/api/sensors/${selectedDevice.id}`,
          { headers },
        );

        if (!readingsResponse.ok) {
          throw new Error("Failed to load sensor history");
        }

        const readingsData = await readingsResponse.json();
        setReadings(readingsData);

        // Get alert history
        const alertsResponse = await fetch("http://localhost:8000/api/alerts", {
          headers,
        });

        if (alertsResponse.ok) {
          const alertsData = await alertsResponse.json();
          setAlerts(alertsData);
        }
      } catch (err) {
        console.error("HISTORICAL DATA ERROR:", err);
        setError("Unable to load historical data.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [navigate]);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-slate-600 text-lg">Loading historical data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Historical Data
              </h1>

              <p className="text-slate-500 mt-1">
                {device?.name || "LPG Monitoring Device"}
              </p>
            </div>

            <button
              onClick={() => navigate("/dashboard")}
              className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-lg transition"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6">
            {error}
          </div>
        )}

        {/* Sensor History */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            Sensor History
          </h2>

          {readings.length === 0 ? (
            <p className="text-slate-500">No sensor readings available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 px-4 text-slate-600">Time</th>
                    <th className="py-3 px-4 text-slate-600">LPG</th>
                    <th className="py-3 px-4 text-slate-600">Temperature</th>
                    <th className="py-3 px-4 text-slate-600">Humidity</th>
                  </tr>
                </thead>

                <tbody>
                  {readings.map((reading) => (
                    <tr
                      key={reading.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-3 px-4 text-slate-700">
                        {formatDate(reading.recorded_at)}
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {reading.lpg_ppm} PPM
                      </td>

                      <td className="py-3 px-4 text-slate-700">
                        {reading.temperature} °C
                      </td>

                      <td className="py-3 px-4 text-slate-700">
                        {reading.humidity} %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Alert History */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            Alert History
          </h2>

          {alerts.length === 0 ? (
            <p className="text-slate-500">No alerts recorded.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 px-4 text-slate-600">Time</th>
                    <th className="py-3 px-4 text-slate-600">Type</th>
                    <th className="py-3 px-4 text-slate-600">Severity</th>
                    <th className="py-3 px-4 text-slate-600">Message</th>
                    <th className="py-3 px-4 text-slate-600">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {alerts.map((alert) => (
                    <tr
                      key={alert.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-3 px-4 text-slate-700">
                        {formatDate(alert.created_at)}
                      </td>

                      <td className="py-3 px-4 text-slate-700">{alert.type}</td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            alert.severity === "critical"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {alert.severity}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-700">
                        {alert.message}
                      </td>

                      <td className="py-3 px-4">
                        {alert.acknowledged_at ? (
                          <span className="text-green-600 font-medium">
                            Acknowledged
                          </span>
                        ) : (
                          <span className="text-orange-600 font-medium">
                            Active
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HistoricalData;
