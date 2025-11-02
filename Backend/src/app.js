const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const chatRoutes = require("./routes/chat.routes");

const app = express();

// ✅ Body parser
app.use(express.json());
app.use(cookieParser());

// ✅ Dynamic CORS — allow Render + localhost
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://project-chat-gpt.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.warn("❌ Blocked by CORS:", origin);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ✅ API routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// ✅ Serve frontend (optional for fullstack deployment)
app.use(express.static(path.join(__dirname, "../public")));

// ✅ Health check route (useful for Render)
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server running fine 🚀" });
});

module.exports = app;
