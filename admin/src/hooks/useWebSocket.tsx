import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";

interface NotificationMessage {
  title: string;
  body: string;
  timestamp: string;
}

const useWebSocket = (url: string) => {
  const [messages, setMessages] = useState<NotificationMessage[]>([]);
  const [status, setStatus] = useState<string>("disconnected");
  const [isAuthorized, setIsAuthorized] = useState(false); // New state to track authorization
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;



  
  const connect = useCallback(() => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.log("Max reconnection attempts reached");
      return;
    }

    try {
      const websocket = new WebSocket(url);
      wsRef.current = websocket;

      websocket.onopen = () => {
        console.log("WebSocket connected");
        setStatus("connected");
        reconnectAttempts.current = 0; // Reset attempts on successful connection
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Received message:", data);

          if (data.type === "order") {
            setMessages((prev) => [...prev, data.message]);
            toast(data.message.title, {
              description: data.message.body,
              duration: 2000,
            });
          } else if (data.type === "authorized") {
            console.log("Authorization successful:", data.message);
            setIsAuthorized(true); 
            toast(data.message, {
              description: "You are  authorized!",
              duration: 2000,
            });
          } else if (data.type === "unauthorized") {
            console.error("Unauthorized connection");
            websocket.close();
            setStatus("unauthorized");
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      websocket.onclose = (event) => {
        console.log("WebSocket connection closed", event);
        setStatus("disconnected");
        
        if (event.code !== 1000) { // Not a normal closure
          reconnectAttempts.current += 1;
          if (reconnectAttempts.current < maxReconnectAttempts) {
            // Exponential backoff
            const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
            setTimeout(() => connect(), timeout);
          }
        }
      };

      websocket.onerror = (error) => {
        console.error("WebSocket error:", error);
        setStatus("error");
      };

    } catch (error) {
      console.error("Error creating WebSocket:", error);
      setStatus("error");
    }

    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close(1000); // Normal closure
      }
    };
  }, [url]);

  useEffect(() => {
    const cleanup = connect();
    return () => {
      cleanup?.();
      reconnectAttempts.current = maxReconnectAttempts; // Prevent reconnection on unmount
    };
  }, [connect]);

  return { messages, status, isAuthorized }; // Return isAuthorized to handle in the component
};

export default useWebSocket;
