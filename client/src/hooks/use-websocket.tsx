import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { useAuth } from "./use-auth";

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

type WebSocketContextType = {
  connected: boolean;
  sendMessage: (message: WebSocketMessage) => void;
  addMessageListener: (callback: (message: WebSocketMessage) => void) => () => void;
};

// Create a context with default values
const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const messageListenersRef = useRef<((message: WebSocketMessage) => void)[]>([]);
  const { user } = useAuth();
  
  // Initialize WebSocket connection
  useEffect(() => {
    // Don't connect if not authenticated
    if (!user) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }
    
    // Create WebSocket connection
    // Determine the protocol based on the current window location
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    // Build the WebSocket URL
    // For deployed apps, use the same host; for local development, use the same port
    let wsUrl = `${protocol}//${window.location.host}/ws-chat`;
    
    // If we're on a deployed replit.app domain, ensure we're using that fully
    if (window.location.hostname.includes('.replit.app')) {
      wsUrl = `${protocol}//${window.location.hostname}/ws-chat`;
    }
    
    console.log('Connecting to WebSocket at:', wsUrl);
    
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;
    
    socket.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
      
      // Initialize the connection with user ID
      if (user) {
        socket.send(JSON.stringify({
          type: 'init',
          userId: user.id
        }));
      }
    };
    
    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        
        // Notify all listeners
        messageListenersRef.current.forEach(listener => {
          try {
            listener(message);
          } catch (error) {
            console.error('Error in message listener:', error);
          }
        });
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    socket.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };
    
    // Clean up on unmount
    return () => {
      socket.close();
    };
  }, [user]);
  
  // Reconnect logic
  useEffect(() => {
    if (!connected && user) {
      const reconnectInterval = setInterval(() => {
        if (!connected && socketRef.current?.readyState !== WebSocket.CONNECTING) {
          console.log('Attempting to reconnect WebSocket...');
          
          // Create new WebSocket connection
          const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          
          // Build the WebSocket URL
          // For deployed apps, use the same host; for local development, use the same port
          let wsUrl = `${protocol}//${window.location.host}/ws-chat`;
          
          // If we're on a deployed replit.app domain, ensure we're using that fully
          if (window.location.hostname.includes('.replit.app')) {
            wsUrl = `${protocol}//${window.location.hostname}/ws-chat`;
          }
          
          console.log('Reconnecting to WebSocket at:', wsUrl);
          
          const socket = new WebSocket(wsUrl);
          socketRef.current = socket;
          
          socket.onopen = () => {
            console.log('WebSocket reconnected');
            setConnected(true);
            clearInterval(reconnectInterval);
            
            // Initialize the connection with user ID
            if (user) {
              socket.send(JSON.stringify({
                type: 'init',
                userId: user.id
              }));
            }
          };
          
          socket.onmessage = (event) => {
            try {
              const message = JSON.parse(event.data) as WebSocketMessage;
              
              // Notify all listeners
              messageListenersRef.current.forEach(listener => {
                try {
                  listener(message);
                } catch (error) {
                  console.error('Error in message listener:', error);
                }
              });
            } catch (error) {
              console.error('Error parsing WebSocket message:', error);
            }
          };
          
          socket.onclose = () => {
            console.log('WebSocket disconnected');
            setConnected(false);
          };
          
          socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            setConnected(false);
          };
        }
      }, 5000); // Try to reconnect every 5 seconds
      
      return () => {
        clearInterval(reconnectInterval);
      };
    }
  }, [connected, user]);
  
  // Send message function
  const sendMessage = (message: WebSocketMessage) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return;
    }
    
    socketRef.current.send(JSON.stringify(message));
  };
  
  // Add message listener function
  const addMessageListener = (callback: (message: WebSocketMessage) => void) => {
    messageListenersRef.current.push(callback);
    
    // Return a function to remove the listener
    return () => {
      messageListenersRef.current = messageListenersRef.current.filter(
        listener => listener !== callback
      );
    };
  };
  
  return (
    <WebSocketContext.Provider value={{ connected, sendMessage, addMessageListener }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  
  return context;
}