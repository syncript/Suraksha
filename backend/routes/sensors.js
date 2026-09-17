const express = require("express")
const pool = require("../db")
const authMiddleware = require("../middleware/authMiddleware")

const router = express.Router()

// ADD SENSOR READING
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      device_id,
      lpg_level,
      temperature,
      humidity,
    } = req.body

    if (
      !device_id ||
      lpg_level === undefined ||
      temperature === undefined ||
      humidity === undefined
    ) {
      return res.status(400).json({
        message:
          "Device ID, LPG level, temperature and humidity are required",
      })
    }

    // Make sure the device belongs to the logged-in user
    const deviceResult = await pool.query(
      `SELECT id
       FROM devices
       WHERE id = $1 AND user_id = $2`,
      [device_id, req.user.userId]
    )

    if (deviceResult.rows.length === 0) {
      return res.status(404).json({
        message: "Device not found",
      })
    }

    // Store sensor reading
    const result = await pool.query(
      `INSERT INTO sensor_readings
       (device_id, lpg_level, temperature, humidity)
       VALUES ($1, $2, $3, $4)
       RETURNING id, device_id, lpg_level, temperature, humidity, recorded_at`,
      [
        device_id,
        lpg_level,
        temperature,
        humidity,
      ]
    )

    // Update device status
    await pool.query(
      `UPDATE devices
       SET status = 'online',
           last_seen = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2`,
      [device_id, req.user.userId]
    )

   const reading = result.rows[0]

        // Send the new reading to all connected dashboards
        const io = req.app.get("io")

        io.emit("sensor-update", {
    device_id: reading.device_id,
    lpg_level: reading.lpg_level,
    temperature: reading.temperature,
    humidity: reading.humidity,
    recorded_at: reading.recorded_at,
    })

res.status(201).json({
  message: "Sensor reading stored successfully",
  reading,
})
  } catch (error) {
    console.error("ADD SENSOR READING ERROR:", error)

    res.status(500).json({
      message: "Failed to store sensor reading",
    })
  }
})

// GET SENSOR HISTORY FOR A DEVICE
router.get("/:device_id", authMiddleware, async (req, res) => {
  try {
    const { device_id } = req.params

    // Make sure the device belongs to the logged-in user
    const deviceResult = await pool.query(
      `SELECT id, device_uid, name, status, last_seen
       FROM devices
       WHERE id = $1 AND user_id = $2`,
      [device_id, req.user.userId]
    )

    if (deviceResult.rows.length === 0) {
      return res.status(404).json({
        message: "Device not found",
      })
    }

    // Get sensor history
    const result = await pool.query(
      `SELECT id, device_id, lpg_level, temperature, humidity, recorded_at
       FROM sensor_readings
       WHERE device_id = $1
       ORDER BY recorded_at DESC`,
      [device_id]
    )

    res.json({
      device: deviceResult.rows[0],
      readings: result.rows,
    })
  } catch (error) {
    console.error("GET SENSOR HISTORY ERROR:", error)

    res.status(500).json({
      message: "Failed to fetch sensor history",
    })
  }
})

module.exports = router