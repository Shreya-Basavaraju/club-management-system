const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const clubRoutes = require("./routes/clubRoutes");
const eventRoutes = require("./routes/eventRoutes");
const authRoutes = require("./routes/authRoutes");
const clubMemberRoutes = require("./routes/clubMemberRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const eventImageRoutes = require("./routes/eventImageRoutes");

const app = express();

// CORS configuration - allow all origins for now
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// ✅ Static folder for uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" });
});

// Routes
app.use("/api/clubs", clubRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/club-members", clubMemberRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/event-images", eventImageRoutes);

app.get("/", (req, res) => {
  res.send("Club Management Backend Running");
});

// 404 handler - must be after all routes
app.use((req, res) => {
  console.log("404 - Route not found:", req.method, req.url);
  res.status(404).json({ 
    error: "Route not found",
    method: req.method,
    url: req.url,
    message: "The requested endpoint does not exist"
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ 
    error: "Internal server error",
    message: err.message 
  });
});

const PORT = process.env.PORT || 5000;

// MongoDB connection with retry logic
const connectDB = async () => {
  const options = {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4
  };

  try {
    await mongoose.connect(process.env.MONGO_URI, options);
    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("\n🔧 Troubleshooting steps:");
    console.error("1. Check if your IP is whitelisted in MongoDB Atlas");
    console.error("2. Go to: MongoDB Atlas → Network Access → Add IP Address");
    console.error("3. Add 0.0.0.0/0 to allow all IPs (for development)");
    console.error("4. Verify your username and password are correct");
    console.error("\nRetrying connection in 5 seconds...\n");
    
    setTimeout(connectDB, 5000);
  }
};

connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("📡 Available routes:");
  console.log("  - /api/clubs");
  console.log("  - /api/events");
  console.log("  - /api/auth");
  console.log("  - /api/club-members");
  console.log("  - /api/attendance");
  console.log("  - /api/certificates");
  console.log("  - /api/registrations");
  console.log("  - /api/event-images");
});