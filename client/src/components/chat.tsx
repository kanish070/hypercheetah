import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Send, Image, MapPin, Paperclip, Smile } from "lucide-react";
import { toast } from '@/hooks/use-toast';

interface ChatMessage {
  id: number;
  senderId: number;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

interface ChatProps {
  rideId: number;
  userId: number;
}

export function Chat({ rideId, userId }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      senderId: 2, // other user
      text: "Hi! Looking forward to our ride tomorrow.",
      timestamp: "10:30 AM",
      status: 'read'
    },
    {
      id: 2,
      senderId: userId,
      text: "Hello! Yes, I'll be ready on time. Do you want me to meet you at the corner or directly at the building entrance?",
      timestamp: "10:35 AM",
      status: 'read'
    },
    {
      id: 3,
      senderId: 2,
      text: "Let's meet at the building entrance, it's easier to find. I'll be driving a blue Toyota Camry.",
      timestamp: "10:38 AM",
      status: 'read'
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [partnerInfo, setPartnerInfo] = useState({
    id: 2,
    name: "Alex Johnson",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    status: "online",
    lastActive: "Active now"
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Send a new message
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const message: ChatMessage = {
      id: messages.length + 1,
      senderId: userId,
      text: newMessage,
      timestamp: currentTime,
      status: 'sent'
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
    
    // Simulate message status updates
    setTimeout(() => {
      setMessages(prev => prev.map(m => {
        if (m.id === message.id) {
          return { ...m, status: 'delivered' };
        }
        return m;
      }));
    }, 1000);
    
    setTimeout(() => {
      setMessages(prev => prev.map(m => {
        if (m.id === message.id) {
          return { ...m, status: 'read' };
        }
        return m;
      }));
    }, 2000);
    
    // Simulate partner response
    if (Math.random() > 0.5) {
      setTimeout(() => {
        const responses = [
          "Sounds good!",
          "Thanks for letting me know.",
          "I'll see you then!",
          "Great, looking forward to it!",
          "Perfect, thank you!"
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const responseMessage: ChatMessage = {
          id: messages.length + 2,
          senderId: partnerInfo.id,
          text: randomResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'delivered'
        };
        
        setMessages(prev => [...prev, responseMessage]);
      }, 3000);
    }
  };
  
  // Message status indicator
  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'sent':
        return <span className="text-xs text-gray-400">Sent</span>;
      case 'delivered':
        return <span className="text-xs text-gray-400">Delivered</span>;
      case 'read':
        return <span className="text-xs text-blue-500">Read</span>;
      default:
        return null;
    }
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 border-b">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src={partnerInfo.avatar} />
              <AvatarFallback>{partnerInfo.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{partnerInfo.name}</CardTitle>
              <div className="text-xs text-muted-foreground flex items-center">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5"></div>
                {partnerInfo.lastActive}
              </div>
            </div>
          </div>
          
          <div>
            <Badge>Ride Partner</Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}
            >
              {message.senderId !== userId && (
                <Avatar className="h-8 w-8 mr-2 mt-1">
                  <AvatarImage src={partnerInfo.avatar} />
                  <AvatarFallback>{partnerInfo.name.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              
              <div 
                className={`max-w-[75%] rounded-lg px-3 py-2 ${
                  message.senderId === userId 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}
              >
                <div>{message.text}</div>
                <div 
                  className={`text-xs mt-1 flex justify-end ${
                    message.senderId === userId 
                      ? 'text-primary-foreground/70' 
                      : 'text-muted-foreground'
                  }`}
                >
                  <span>{message.timestamp}</span>
                  {message.senderId === userId && (
                    <span className="ml-2">
                      {getStatusIndicator(message.status)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      
      <CardFooter className="border-t p-3">
        <div className="flex w-full items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <Smile className="h-5 w-5 text-muted-foreground" />
          </Button>
          
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <Paperclip className="h-5 w-5 text-muted-foreground" />
          </Button>
          
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1"
          />
          
          <Button 
            size="icon" 
            className={`h-8 w-8 rounded-full ${!newMessage.trim() ? 'opacity-50' : ''}`}
            disabled={!newMessage.trim()}
            onClick={handleSendMessage}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}