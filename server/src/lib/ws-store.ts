import { WebSocket } from 'ws'; // Make sure to import the correct WebSocket type

interface CustomWebSocket extends WebSocket {
  data: {
    headers: {
      cookie?: string;
    };
  };
  close(code?: number, reason?: string): void;
}

const wsConnections = new Set<CustomWebSocket>();

export const addWebSocket = (ws: CustomWebSocket) => {
  wsConnections.add(ws);
  console.log("WebSocket added. Total connections:", wsConnections.size);
};

export const removeWebSocket = (ws: CustomWebSocket) => {
  wsConnections.delete(ws);
  console.log("WebSocket removed. Total connections:", wsConnections.size);
};

export const broadcastMessage = (message: any) => {
  wsConnections.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify({ type: "order", message }));
        console.log("Sent message:", message);
      } catch (error) {
        console.error("Error sending message:", error);
        removeWebSocket(ws);
      }
    } else {
      removeWebSocket(ws);
    }
  });
};

export default wsConnections;