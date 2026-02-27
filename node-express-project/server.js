require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const propertyRoutes = require("./routes/properties");

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded images)
app.use("/public", express.static(path.join(__dirname, "public")));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);

// Root health-check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "RentEasy Bhiwandi API is running",
    version: "1.0.0",
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);

  // Multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ success: false, message: "File too large. Max 5MB per image." });
  }
  if (err.code === "LIMIT_FILE_COUNT") {
    return res.status(400).json({ success: false, message: "Maximum 5 images allowed." });
  }
  if (err.message && err.message.includes("Only JPEG")) {
    return res.status(400).json({ success: false, message: err.message });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error.",
  });
});

// ─── Database & Server Start ──────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/renteasy";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log(`✅ Connected to MongoDB at ${MONGODB_URI}`);
    app.listen(PORT, () => {
      console.log(`🚀 RentEasy Bhiwandi server running on http://localhost:${PORT}`);
      console.log(`📁 Uploads served at http://localhost:${PORT}/public/uploads/`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
