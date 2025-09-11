const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { testDbConnection, sqlize } = require("./config/supabase");
const ExpressError = require("./utils/expressError");
const { sub } = require("./config/redis");
const path = require("path");
const { fileURLToPath } = require("url")

require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;


// Middleware
app.use(express.json());

// Allow CORS for frontend (update origin in production!)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*", // e.g. "http://localhost:5173"
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const server = http.createServer(app);

// Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

module.exports = { io };

// Socket connections
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// DB connection + sync
testDbConnection();
sqlize.sync({ alter: true }).then(() => console.log("✅ Models synced"));

app.use(express.static(path.join(__dirname, "../../public")));

// Routes
const organiserRoutes = require("./routes/organiser.routes");
app.use("/organiser", organiserRoutes);

const userRoutes = require("./routes/user.routes");
app.use("/user", userRoutes);

const tripRoutes = require("./routes/trip.routes");
app.use("/trips", tripRoutes);

app.get("/ping", (req, res) => {
  res.status(200).json("Server running!!");
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public", "index.html"));
});

// Error handlers
app.use((req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).json({ message });
});

// Redis key expiry handling
const redisExpiredChannel = "__keyevent@0__:expired"; // DB 0; change if needed
sub.subscribe(redisExpiredChannel, (err) => {
  if (err) {
    console.error("❌ Failed to subscribe to Redis expired channel:", err);
    return;
  }
  console.log("📡 Subscribed to Redis expired events");
});

sub.on("message", async (channel, message) => {
  try {
    if (!message.startsWith("hold:")) return;
    const [, tripId, ...seatParts] = message.split(":");
    const seatNo = seatParts.join(":");
    io.emit("seatReleased", { tripId, seatNo, reason: "hold_expired" });
  } catch (err) {
    console.error("Error handling expired key message:", err);
  }
});

// Start server
server.listen(port, () => console.log(`🚀 Listening on port ${port}`));
