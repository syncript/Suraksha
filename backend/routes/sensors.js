const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ADD SENSOR READING
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { device_id, lpg_ppm, temperature, humidity } = req.body;

    if (
      !device_id ||
      lpg_ppm === undefined ||
      temperature === undefined ||
      humidity === undefined
    ) {
      return res.status(400).json({
        message: "Device ID, LPG ppm, temperature and humidity are required",
      });
    }

    // Make sure the device belongs to the logged-in user
    const deviceResult = await pool.query(
      `SELECT id
       FROM devices
       WHERE id = $1 AND user_id = $2`,
      [device_id, req.user.userId],
    );

    if (deviceResult.rows.length === 0) {
      return res.status(404).json({
        message: "Device not found",
      });
    }

    // Store sensor reading
    const result = await pool.query(
      `INSERT INTO sensor_readings
       (device_id, lpg_ppm, temperature, humidity)
       VALUES ($1, $2, $3, $4)
       RETURNING id, device_id, lpg_ppm, temperature, humidity, recorded_at`,
      [device_id, lpg_ppm, temperature, humidity],
    );

    // Update device status
    await pool.query(
      `UPDATE devices
       SET status = 'online',
           last_seen = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2`,
      [device_id, req.user.userId],
    );

    // ==========================================
    // LPG SAFETY CONDITIONS
    // ==========================================

    const currentLpgPpm = Number(lpg_ppm);

    // Project-configured thresholds
    const LPG_ALERT_THRESHOLD = 600;
    const LPG_FAN_THRESHOLD = 800;

    // Exhaust fan state
    const exhaustFanOn = currentLpgPpm >= LPG_FAN_THRESHOLD;

    // Create LPG alert when threshold is reached
    if (currentLpgPpm >= LPG_ALERT_THRESHOLD) {
      // Check if ANY active LPG alert already exists
      const existingAlert = await pool.query(
        `SELECT id, type
   FROM alerts
   WHERE device_id = $1
     AND type IN ('LPG_HIGH', 'LPG_CRITICAL')
     AND acknowledged_at IS NULL
   ORDER BY created_at DESC
   LIMIT 1`,
        [device_id],
      );

      if (currentLpgPpm >= LPG_FAN_THRESHOLD) {
        if (existingAlert.rows.length > 0) {
          if (existingAlert.rows[0].type === "LPG_HIGH") {
            await pool.query(
              `UPDATE alerts
         SET type = 'LPG_CRITICAL',
             severity = 'critical',
             message = 'LPG concentration is at the configured exhaust-fan threshold.'
         WHERE id = $1`,
              [existingAlert.rows[0].id],
            );
          }
        } else {
          await pool.query(
            `INSERT INTO alerts
       (device_id, type, severity, message)
       VALUES ($1, 'LPG_CRITICAL', 'critical', $2)`,
            [
              device_id,
              "LPG concentration is at the configured exhaust-fan threshold.",
            ],
          );
        }
      } else if (currentLpgPpm >= LPG_ALERT_THRESHOLD) {
        if (existingAlert.rows.length === 0) {
          await pool.query(
            `INSERT INTO alerts
       (device_id, type, severity, message)
       VALUES ($1, 'LPG_HIGH', 'high', $2)`,
            [
              device_id,
              "LPG concentration has reached the configured warning threshold.",
            ],
          );
        }
      }
    }
    const latestAlertResult = await pool.query(
      `SELECT
     id,
     device_id,
     type,
     severity,
     message,
     created_at,
     acknowledged_at
   FROM alerts
   WHERE device_id = $1
   ORDER BY created_at DESC
   LIMIT 1`,
      [device_id],
    );

    const latestAlert = latestAlertResult.rows[0];

    const io = req.app.get("io");

    if (latestAlert) {
      io.to(`user_${req.user.userId}`).emit("alert-update", latestAlert);
    }
    const reading = result.rows[0];

    // ==========================================
    // REAL-TIME SOCKET UPDATE
    // ==========================================

    io.to(`user_${req.user.userId}`).emit("sensor-update", {
      device_id: reading.device_id,
      lpg_ppm: reading.lpg_ppm,
      temperature: reading.temperature,
      humidity: reading.humidity,
      recorded_at: reading.recorded_at,
      exhaust_fan_on: exhaustFanOn,
    });

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(201).json({
      message: "Sensor reading stored successfully",
      reading,
      exhaust_fan_on: exhaustFanOn,
    });
  } catch (error) {
    console.error("ADD SENSOR READING ERROR:", error);

    res.status(500).json({
      message: "Failed to store sensor reading",
    });
  }
});

// GET SENSOR HISTORY FOR A DEVICE
router.get("/:device_id", authMiddleware, async (req, res) => {
  try {
    const { device_id } = req.params;

    // Make sure the device belongs to the logged-in user
    const deviceResult = await pool.query(
      `SELECT id, device_uid, name, status, last_seen
       FROM devices
       WHERE id = $1 AND user_id = $2`,
      [device_id, req.user.userId],
    );

    if (deviceResult.rows.length === 0) {
      return res.status(404).json({
        message: "Device not found",
      });
    }

    // Get sensor history
    const result = await pool.query(
      `SELECT
         id,
         device_id,
         lpg_ppm,
         temperature,
         humidity,
         recorded_at
       FROM sensor_readings
       WHERE device_id = $1
       ORDER BY recorded_at DESC`,
      [device_id],
    );

    res.json({
      device: deviceResult.rows[0],
      readings: result.rows,
    });
  } catch (error) {
    console.error("GET SENSOR HISTORY ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch sensor history",
    });
  }
});

module.exports = router;
