// src/useWebSocket.js
import { useCallback, useEffect, useState } from "react";

function useWebSocket(url, setData) {
  const [websocket, setWebsocket] = useState(null);

  const connect = useCallback(() => {
    let reconnectAttempts = 0;
    console.log("Connecting to websocket", url);
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log("Connected to websocket");
      setWebsocket(ws);
      reconnectAttempts = 0;
    };

    ws.onclose = () => {
      console.log("Disconnected from websocket");
      setWebsocket(null);
      if (reconnectAttempts < 10) {
        reconnectAttempts += 1;
        const delay = Math.min(1000 * 2 ** reconnectAttempts, 60000);
        console.log(
          `Reconnecting in ${
            delay / 1000
          } seconds... (Attempt ${reconnectAttempts})`
        );
        setTimeout(connect, delay);
      } else {
        console.log(
          "Max reconnect attempts reached. Stopping further attempts."
        );
      }
    };

    ws.onmessage = (event) => {
      console.log("Message received from websocket", event);
      if (typeof event.data === "string") {
        const json = JSON.parse(event.data);
        setData((data) => [...data, json]);
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          const dataString = reader.result;
          const json = JSON.parse(dataString);
          setData((prev) => [...prev, json]);
        };
        reader.readAsText(event.data);
      }
    };
  }, [setData, url]);

  useEffect(() => {
    connect();
  }, [connect]);

  return { websocket, reconnect: connect };
}

export default useWebSocket;
