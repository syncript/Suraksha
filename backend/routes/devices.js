const express = require("express")
const pool = require("../db")
const authMiddleware = require("../middleware/authMiddleware")

const router = express.Router()

// GET all devices belonging to the logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, device_uid, name, status, last_seen, created_at
       FROM devices
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.userId]
    )

    res.json({
      devices: result.rows,
    })
  } catch (error) {
    console.error("GET DEVICES ERROR:", error)

    res.status(500).json({
      message: "Failed to fetch devices",
    })
  }
})

// ADD a device
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { device_uid, name } = req.body

    if (!device_uid || !name) {
      return res.status(400).json({
        message: "Device UID and name are required",
      })
    }

    const existingDevice = await pool.query(
      "SELECT id FROM devices WHERE device_uid = $1",
      [device_uid]
    )

    if (existingDevice.rows.length > 0) {
      return res.status(409).json({
        message: "Device UID already registered",
      })
    }

    const result = await pool.query(
      `INSERT INTO devices
       (device_uid, name, user_id, status)
       VALUES ($1, $2, $3, 'offline')
       RETURNING id, device_uid, name, status, last_seen, created_at`,
      [
        device_uid,
        name,
        req.user.userId,
      ]
    )

    res.status(201).json({
      message: "Device added successfully",
      device: result.rows[0],
    })
  } catch (error) {
    console.error("ADD DEVICE ERROR:", error)

    res.status(500).json({
      message: "Failed to add device",
    })
  }
})

module.exports = router