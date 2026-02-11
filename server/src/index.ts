import { app } from "./setup";
import { addWebSocket, removeWebSocket, broadcastMessage } from "./lib/ws-store";
import {jwt} from "./lib/jwt"; // Import the verify function from jwt.ts

const PORT = 4000;

export interface CustomWebSocket extends WebSocket {
  data: {
    headers: {
      cookie?: string;
    };
  };
  close(code?: number, reason?: string): void;
}

broadcastMessage({
  title: "Test Notification",
  body: "This is a test message",
  timestamp: new Date().toISOString()
});

app.ws("/api/admin/ws", {
  open: async (ws) => {
    try {
      // Get cookies from the upgrade request
      const cookieHeader = ws.data.headers.cookie;
      console.log("Received cookie header:", cookieHeader); // Debug log

      if (!cookieHeader) {
        console.log("No cookies found");
        ws.send(JSON.stringify({ type: "unauthorized", message: "No authentication cookie found" }));
        ws.close(4001);
        return;
      }

      // Parse cookies with improved logging
      const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key.trim()] = decodeURIComponent(value);
        return acc;
      }, {});

      console.log("Parsed cookies:", cookies); // Debug log
      const token = cookies.admin;

      if (!token) {
        console.log("No admin token found in cookies");
        ws.send(JSON.stringify({ type: "unauthorized", message: "No admin token found" }));
        ws.close(4001);
        return;
      }

      try {
        // Log the token being verified
        console.log("Verifying token:", token);
        
        const payload = jwt.verify(token);  // Use the verifyToken function
        console.log("Token verified successfully:", payload); // Debug log
        
        if (!payload) {
          ws.send(JSON.stringify({ type: "unauthorized", message: "Invalid token" }));
          ws.close(4003);
          return;
        }

        // Add socket to connections pool
        addWebSocket(ws);
        console.log("Admin connected successfully with ID:", (payload as any).id);
        
        // Send success message with user info
        ws.send(JSON.stringify({ 
          type: "authorized", 
          message: "Connected successfully",
          userId: (payload as any).id
        }));

      } catch (jwtError:any) {
        console.error("JWT verification failed:", jwtError);
        ws.send(JSON.stringify({ 
          type: "unauthorized", 
          message: jwtError?.message
        }));
        ws.close(4002);
      }
    } catch (error:any) {
      console.error("WebSocket connection error:", error);
      ws.send(JSON.stringify({ type: "error", message: "Server error" }));
      ws.close(4000);
    }
  },

  close: (ws) => {
    removeWebSocket(ws);
    console.log("Admin disconnected");
  },
});

app.listen({ port: PORT }, () => {
  console.log(`Listening on port ${PORT}`);
});
console.log("WebSocket server initialized.");
