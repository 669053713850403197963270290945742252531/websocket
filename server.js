const express = require("express");
const WebSocket = require("ws");
const http = require("http");

const app = express();

app.get("/", (req, res) => {
    res.send("WebSocket server is online");
});

const server = http.createServer(app);

const wss = new WebSocket.Server({
    server
});

wss.on("connection", (ws, req) => {
    console.log("Client connected");

    ws.send(JSON.stringify({
        type: "welcome",
        message: "Connected to Railway WebSocket server"
    }));

    ws.on("message", (data) => {
        console.log("Received:", data.toString());

        // Echo message back
        ws.send(JSON.stringify({
            type: "echo",
            data: data.toString()
        }));
    });

    ws.on("close", () => {
        console.log("Client disconnected");
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});