const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server: server });
const messages = [];

let clients = [];

wss.on("connection", (ws) => {
  console.log("Client connected");

  clients.push(ws);

  ws.once("open", () => {
    console.log("Connected to websocket");
    ws.send(JSON.stringify({ type: "join", data: messages }));
  });
  ws.on("message", (messageString) => {
    console.log("Message received", messageString);
    const json = JSON.parse(messageString);
    const { message } = json;
    if (json.type === "MSG") {
      messages.push({ message });

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ message }));
        }
      });
    }
  });

  ws.on("message", (messageString) => {
    const data = JSON.parse(messageString);
    if (data.type === "DRAW") {
      clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "join", data: messages }));
      }
    });
  });

  ws.send(JSON.stringify({ message: "Hello from server" }));
});

server.listen(8080, () => {
  console.log("Server started on http://localhost:8080");
});
