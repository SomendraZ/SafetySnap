// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const imageRoutes = require("./routes/images");
const analyticsRoutes = require("./routes/analytics");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Global request logger
app.use((req, res, next) => {
  const userId = req.user ? req.user._id : "Guest";
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${
      req.originalUrl
    } - User: ${userId}`
  );
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/analytics", analyticsRoutes);

// Connect DB & Start server
connectDB();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
