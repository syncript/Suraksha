const express = require("express")
const pool = require("../db")
const authMiddleware = require("../middleware/authMiddleware")

const router = express.Router()

// GET ALERTS FOR LOGGED-IN USER
router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         alerts.id,
         alerts.device_id,
         devices.name AS device_name,
         alerts.type,
         alerts.severity,
         alerts.message,
         alerts.created_at,
         alerts.acknowledged_at
       FROM alerts
       JOIN devices
         ON alerts.device_id = devices.id
       WHERE devices.user_id = $1
       ORDER BY alerts.created_at DESC`,
      [req.user.userId]
    )

    res.json({
      alerts: result.rows,
    })
  } catch (error) {
    console.error("GET ALERTS ERROR:", error)

    res.status(500).json({
      message: "Failed to fetch alerts",
    })
  }
})
router.patch("/:id/acknowledge", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `UPDATE alerts
       SET acknowledged_at = CURRENT_TIMESTAMP
       WHERE id = $1
         AND acknowledged_at IS NULL
         AND device_id IN (
           SELECT id
           FROM devices
           WHERE user_id = $2
         )
       RETURNING id, device_id, type, severity, message, created_at, acknowledged_at`,
      [id, req.user.userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Alert not found or already acknowledged",
      })
    }

    res.json({
      message: "Alert acknowledged successfully",
      alert: result.rows[0],
    })
  } catch (error) {
    console.error("ACKNOWLEDGE ALERT ERROR:", error)

    res.status(500).json({
      message: "Failed to acknowledge alert",
    })
  }
})

module.exports = router