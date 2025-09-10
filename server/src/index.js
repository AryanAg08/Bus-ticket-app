const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { testDbConnection, sqlize } = require('./config/supabase');
const ExpressError = require("./utils/expressError");
const { sub } = require("./config/redis");

require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

module.exports = { io };

// Socket connections
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});



testDbConnection();
sqlize.sync({ alter: true }).then(() => console.log("✅ Models synced"));

// Routes
const organniserRoutes = require("./routes/organiser.routes");
app.use("/organiser", organniserRoutes);

const userRoutes = require("./routes/user.routes");
app.use("/user", userRoutes);

app.get("/ping", (req, res) => {
    res.status(300).json("Server running!!");
})

app.use((req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).json({ message });
});

const redisExpiredChannel = "__keyevent@0__:expired"; // DB 0; change if you use another DB
sub.subscribe(redisExpiredChannel, (err, count) => {
  if (err) {
    console.error("Failed to subscribe to keyevent expired channel:", err);
    return;
  }
  console.log("Subscribed to Redis expired events");
});

const { holdKey } = require("./utils/holds");

sub.on("message", async (channel, message) => {
  try {
    // message is the key that expired
    // expect keys like hold:{tripId}:{seatNo}
    if (!message.startsWith("hold:")) return;
    // parse tripId and seatNo
    const [, tripId, ...seatParts] = message.split(":");
    const seatNo = seatParts.join(":"); // seatNo might contain ':'
    // Emit seatReleased event to clients
    io.emit("seatReleased", { tripId, seatNo, reason: "hold_expired" });
    // Optionally you may update DB or logs here.
  } catch (err) {
    console.error("Error handling expired key message:", err);
  }
});

server.listen(port, () => console.log(`Listening to ${port}`));

