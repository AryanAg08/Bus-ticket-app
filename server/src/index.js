const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws")
const { testDbConnection } = require('./config/supabase');
const redisClient = require('./config/redis');

require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({server});

wss.on("connection", (ws) => {
    console.log("A new client connected!!");

    ws.on("message", (msg) => {
        console.log(`New Msg: ${msg}`);
        wss.clients.forEach((client) => {
            if (client.readyState == ws.OPEN) client.send(`Msg: ${msg}`);
        })
    });

    ws.on("close", () => {
        console.log("client disconnected!!");
    })
});

testDbConnection();
// redisClient();


app.get("/ping", (req, res) => {
    res.status(300).json("Server running!!");
})

server.listen(port, () => console.log(`Listening to ${port}`));