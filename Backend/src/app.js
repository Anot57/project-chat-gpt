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

// ✅ CORS fix — allows cookies from frontend
app.use(cors({
  origin: [
    "http://localhost:5174",
    "https://project-chat-gpt.onrender.com",
  ],
  credentials: true
}));

// ✅ API routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// ✅ Static files (optional)
app.use(express.static(path.join(__dirname, "../public")));

module.exports = app;
