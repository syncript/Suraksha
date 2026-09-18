const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const pool = require("./db");

const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/authMiddleware");
const deviceRoutes = require("./routes/devices");
const sensorRoutes = require("./routes/sensors");
const alertRoutes = require("./routes/alerts");

const app = express();
const PORT = 5000;

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Make Socket.IO available to routes
app.set("io", io);

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/sensors", sensorRoutes);
app.use("/api/alerts", alertRoutes);

// Basic route
app.get("/", (req, res) => {
  res.json({
    message: "Suraksha backend is running!",
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Suraksha API is healthy",
  });
});

// Database test
app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      status: "OK",
      message: "Database connection successful",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error("DATABASE ERROR:", error);

    res.status(500).json({
      status: "ERROR",
      message: error.message,
    });
  }
});

// Protected test
app.get("/api/protected-test", authMiddleware, (req, res) => {
  res.json({
    message: "JWT authentication is working!",
    user: req.user,
  });
});

// Socket.IO connection
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    socket.userId = decoded.userId;

    next();
  } catch (error) {
    console.error("SOCKET AUTH ERROR:", error.message);
    next(new Error("Invalid authentication token"));
  }
});

io.on("connection", (socket) => {
  const roomName = `user_${socket.userId}`;

  socket.join(roomName);

  console.log(`Socket connected: ${socket.id} → ${roomName}`);

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Suraksha backend running on http://localhost:${PORT}`);
});
