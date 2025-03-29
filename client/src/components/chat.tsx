import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "@shared/schema";
import { Send } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

interface ChatProps {
  rideId: number;
  userId: number;
}

export function Chat({ rideId, userId }: ChatProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Fetch existing messages
  const { data: initialMessages, isLoading } = useQuery({
    queryKey: ['/api/messages', rideId],
    queryFn: async () => {
      return apiRequest<Message[]>(`/api/messages/${rideId}`);
    },
    enabled: !!rideId
  });

  // Initialize messages from API data
  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // Initialize WebSocket connection
  useEffect(() => {
    // Create WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsConnection = new WebSocket(`${protocol}//${host}/ws-chat`);
    
    wsConnection.onopen = () => {
      console.log('WebSocket connection established');
      // Initialize the connection with user ID
      wsConnection.send(JSON.stringify({ 
        type: 'init', 
        userId 
      }));
    };
    
    wsConnection.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'chat' && data.message) {
          setMessages(prevMessages => [...prevMessages, data.message]);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    wsConnection.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    wsConnection.onclose = () => {
      console.log('WebSocket connection closed');
    };
    
    setSocket(wsConnection);
    
    // Clean up function
    return () => {
      wsConnection.close();
    };
  }, [userId, rideId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim() || !socket) return;
    
    // Send the message through WebSocket
    socket.send(JSON.stringify({
      type: 'chat',
      rideId,
      senderId: userId,
      content: message.trim()
    }));
    
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>Chat</CardTitle>
      </CardHeader>
      
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-muted-foreground">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-muted-foreground">No messages yet</p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex ${msg.senderId === userId ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] px-4 py-2 rounded-lg ${
                    msg.senderId === userId 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}
                >
                  <p>{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
      
      <CardFooter className="pt-2">
        <div className="flex w-full gap-2">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button onClick={handleSendMessage} disabled={!message.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}