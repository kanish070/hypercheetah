import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Message } from "@shared/schema";
import { Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatProps {
  rideId: number;
  userId: number;
}

export function Chat({ rideId, userId }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch existing messages
  const { data: initialMessages = [] } = useQuery({
    queryKey: ['/api/messages', rideId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/messages/${rideId}`);
      return response.json();
    }
  });

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'init', userId }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'chat') {
        setMessages(prev => [...prev, data.message]);
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [userId]);

  const sendMessage = () => {
    if (!inputValue.trim() || !wsRef.current) return;

    wsRef.current.send(JSON.stringify({
      type: 'chat',
      rideId,
      senderId: userId,
      content: inputValue.trim()
    }));

    setInputValue("");
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1 p-4">
        <CardTitle className="text-xl">Chat</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <ScrollArea className="h-[300px] pr-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex mb-4 ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.senderId === userId
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs opacity-70">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </motion.div>
            ))}
            <div ref={scrollRef} />
          </AnimatePresence>
        </ScrollArea>
        <div className="flex gap-2 mt-4">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
