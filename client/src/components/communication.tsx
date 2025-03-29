import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  MessageSquare,
  Users,
  Paperclip,
  Image,
  MapPin,
  Send,
  Globe,
  MoreHorizontal,
  Settings,
  VolumeX,
  Volume2,
  X,
  Plus,
  Star,
  Camera,
  Upload,
  File,
  Link2,
  MoveRight,
  Filter,
  Flag,
  BookOpen,
  Share2,
  Smile,
  ThumbsUp,
  Calendar,
  Clock,
  Info,
  Gift,
  Heart,
  Trash2,
  Languages
} from "lucide-react";
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from "framer-motion";
import { RouteMap } from './route-map';
import { Location, Route } from "@shared/schema";

// Types for communication features
interface ChatMessage {
  id: number;
  senderId: number;
  senderName: string;
  senderAvatar: string;
  text: string;
  originalText?: string; // Only present if translated
  translatedFrom?: string; // The original language code
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  isTranslated?: boolean;
  attachments?: ChatAttachment[];
}

interface ChatParticipant {
  id: number;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastActive?: string;
  isSelf?: boolean;
  isDriver?: boolean;
  isTyping?: boolean;
  language?: string;
}

interface ChatAttachment {
  id: number;
  type: 'image' | 'document' | 'audio' | 'location' | 'route' | 'contact' | 'poll' | 'event';
  url?: string;
  name?: string;
  size?: string;
  thumbnailUrl?: string;
  location?: Location;
  route?: Route;
  eventDetails?: {
    title: string;
    date: string;
    location: string;
  };
  pollDetails?: {
    question: string;
    options: string[];
    votes: Record<string, number>;
  };
}

interface GroupChat {
  id: number;
  name: string;
  participants: ChatParticipant[];
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  isRideGroup: boolean;
  rideDetails?: {
    origin: string;
    destination: string;
    departureTime: string;
  };
}

interface CallHistory {
  id: number;
  participantName: string;
  participantAvatar: string;
  type: 'audio' | 'video';
  status: 'missed' | 'incoming' | 'outgoing';
  duration?: string; // Only for connected calls
  timestamp: string;
}

interface VoiceCallState {
  isActive: boolean;
  isMuted: boolean;
  participantId: number | null;
  participantName: string;
  participantAvatar: string;
  duration: number; // in seconds
}

interface VideoCallState {
  isActive: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
  participantId: number | null;
  participantName: string;
  participantAvatar: string;
  duration: number; // in seconds
}

// Mock language translator
const translateText = (text: string, targetLanguage: string): string => {
  // In a real app, this would make an API call to a translation service
  // For demo purposes, we'll just modify the text to simulate translation
  const simulatedTranslations: Record<string, Record<string, string>> = {
    "Hello, how are you?": {
      "es": "Hola, ¿cómo estás?",
      "fr": "Bonjour, comment allez-vous?",
      "de": "Hallo, wie geht es dir?"
    },
    "Where should we meet?": {
      "es": "¿Dónde nos encontramos?",
      "fr": "Où devrions-nous nous rencontrer?",
      "de": "Wo sollen wir uns treffen?"
    },
    "I'll be there in 5 minutes": {
      "es": "Estaré allí en 5 minutos",
      "fr": "Je serai là dans 5 minutes",
      "de": "Ich bin in 5 Minuten da"
    },
    "Can we change the pickup location?": {
      "es": "¿Podemos cambiar el lugar de recogida?",
      "fr": "Pouvons-nous changer le lieu de prise en charge?",
      "de": "Können wir den Abholort ändern?"
    }
  };
  
  // Check if we have a predefined translation
  if (simulatedTranslations[text] && simulatedTranslations[text][targetLanguage]) {
    return simulatedTranslations[text][targetLanguage];
  }
  
  // For other text, add a prefix to simulate translation
  const prefixes: Record<string, string> = {
    "es": "[ES] ",
    "fr": "[FR] ",
    "de": "[DE] ",
    "it": "[IT] ",
    "zh": "[ZH] ",
    "ja": "[JA] ",
    "ko": "[KO] ",
    "ru": "[RU] ",
    "ar": "[AR] ",
    "hi": "[HI] "
  };
  
  return prefixes[targetLanguage] + text;
};

// Helper function to format language name
const getLanguageName = (code: string): string => {
  const languages: Record<string, string> = {
    "en": "English",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "it": "Italian",
    "zh": "Chinese",
    "ja": "Japanese",
    "ko": "Korean",
    "ru": "Russian",
    "ar": "Arabic",
    "hi": "Hindi"
  };
  
  return languages[code] || code;
};

// Helper function to get time elapsed
const getTimeElapsed = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

interface CommunicationProps {
  userId: number;
  currentUserName?: string;
  currentUserAvatar?: string;
  initialChatId?: number;
  initialGroupId?: number;
  onClose?: () => void;
}

export function Communication({ 
  userId, 
  currentUserName = "You",
  currentUserAvatar = "https://randomuser.me/api/portraits/men/1.jpg",
  initialChatId,
  initialGroupId,
  onClose 
}: CommunicationProps) {
  // State for active tabs
  const [activeTab, setActiveTab] = useState<string>('chat');
  
  // State for messaging
  const [selectedChatId, setSelectedChatId] = useState<number | null>(initialChatId || null);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(initialGroupId || null);
  const [messageText, setMessageText] = useState<string>("");
  const [userLanguage, setUserLanguage] = useState<string>("en");
  const [autoTranslate, setAutoTranslate] = useState<boolean>(false);
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  
  // State for voice and video calls
  const [voiceCallState, setVoiceCallState] = useState<VoiceCallState>({
    isActive: false,
    isMuted: false,
    participantId: null,
    participantName: "",
    participantAvatar: "",
    duration: 0
  });
  
  const [videoCallState, setVideoCallState] = useState<VideoCallState>({
    isActive: false,
    isMuted: false,
    isVideoEnabled: true,
    participantId: null,
    participantName: "",
    participantAvatar: "",
    duration: 0
  });
  
  const [incomingCall, setIncomingCall] = useState<{
    isRinging: boolean;
    callerId: number;
    callerName: string;
    callerAvatar: string;
    callType: 'audio' | 'video';
  } | null>(null);
  
  // State for rich media
  const [selectedAttachment, setSelectedAttachment] = useState<ChatAttachment | null>(null);
  
  // Chat messages
  const [messages, setMessages] = useState<Record<number, ChatMessage[]>>({
    1: [
      {
        id: 1,
        senderId: 2,
        senderName: "Alex Johnson",
        senderAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
        text: "Hello, how are you?",
        timestamp: "10:30 AM",
        status: 'read'
      },
      {
        id: 2,
        senderId: userId,
        senderName: currentUserName,
        senderAvatar: currentUserAvatar,
        text: "I'm doing well, thanks for asking! How about you?",
        timestamp: "10:32 AM",
        status: 'read'
      },
      {
        id: 3,
        senderId: 2,
        senderName: "Alex Johnson",
        senderAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
        text: "Great! Just getting ready for our ride. Where should we meet?",
        timestamp: "10:35 AM",
        status: 'read'
      },
      {
        id: 4,
        senderId: userId,
        senderName: currentUserName,
        senderAvatar: currentUserAvatar,
        text: "Let's meet at the corner of 5th and Main. There's a coffee shop there.",
        timestamp: "10:38 AM",
        status: 'read'
      },
      {
        id: 5,
        senderId: 2,
        senderName: "Alex Johnson",
        senderAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
        text: "Perfect! I'll be there in 5 minutes.",
        timestamp: "10:40 AM",
        status: 'read',
        attachments: [
          {
            id: 1,
            type: 'location',
            location: { lat: 40.7128, lng: -74.0060 }
          }
        ]
      }
    ],
    2: [
      {
        id: 1,
        senderId: 3,
        senderName: "Emma Lewis",
        senderAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
        text: "Hi! I just saw we're matched for tomorrow's commute.",
        timestamp: "Yesterday",
        status: 'read'
      },
      {
        id: 2,
        senderId: userId,
        senderName: currentUserName,
        senderAvatar: currentUserAvatar,
        text: "Yes, looking forward to it! Do you want to confirm the details?",
        timestamp: "Yesterday",
        status: 'read'
      },
      {
        id: 3,
        senderId: 3,
        senderName: "Emma Lewis",
        senderAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
        text: "Sure! I'll pick you up at 8:15 AM at the location set in the app.",
        timestamp: "Yesterday",
        status: 'read'
      },
      {
        id: 4,
        senderId: 3,
        senderName: "Emma Lewis",
        senderAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
        text: "Here's our route:",
        timestamp: "Yesterday",
        status: 'read',
        attachments: [
          {
            id: 1,
            type: 'route',
            route: {
              start: { lat: 40.7128, lng: -74.0060 },
              end: { lat: 40.7614, lng: -73.9776 },
              waypoints: [{ lat: 40.7340, lng: -73.9900 }]
            }
          }
        ]
      },
      {
        id: 5,
        senderId: userId,
        senderName: currentUserName,
        senderAvatar: currentUserAvatar,
        text: "Looks good! Do you mind if we make a quick stop at the coffee shop on the way?",
        timestamp: "Yesterday",
        status: 'read'
      },
      {
        id: 6,
        senderId: 3,
        senderName: "Emma Lewis",
        senderAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
        text: "Not at all! Happy to do that. See you tomorrow!",
        timestamp: "Yesterday",
        status: 'read'
      }
    ]
  });
  
  // Chat participants
  const [chatParticipants, setParticipants] = useState<Record<number, ChatParticipant[]>>({
    1: [
      {
        id: userId,
        name: currentUserName,
        avatar: currentUserAvatar,
        status: 'online',
        isSelf: true,
        language: 'en'
      },
      {
        id: 2,
        name: "Alex Johnson",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        status: 'online',
        lastActive: "Active now",
        language: 'en'
      }
    ],
    2: [
      {
        id: userId,
        name: currentUserName,
        avatar: currentUserAvatar,
        status: 'online',
        isSelf: true,
        language: 'en'
      },
      {
        id: 3,
        name: "Emma Lewis",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        status: 'away',
        lastActive: "Active 25m ago",
        isDriver: true,
        language: 'fr'
      }
    ]
  });
  
  // Group chats
  const [groupChats, setGroupChats] = useState<GroupChat[]>([
    {
      id: 1,
      name: "Downtown Commuters",
      participants: [
        {
          id: userId,
          name: currentUserName,
          avatar: currentUserAvatar,
          status: 'online',
          isSelf: true
        },
        {
          id: 2,
          name: "Alex Johnson",
          avatar: "https://randomuser.me/api/portraits/men/32.jpg",
          status: 'online'
        },
        {
          id: 3,
          name: "Emma Lewis",
          avatar: "https://randomuser.me/api/portraits/women/44.jpg",
          status: 'away'
        },
        {
          id: 4,
          name: "David Chen",
          avatar: "https://randomuser.me/api/portraits/men/67.jpg",
          status: 'offline'
        }
      ],
      unreadCount: 3,
      lastMessage: "Does anyone want to join tomorrow's carpool?",
      lastMessageTime: "2:15 PM",
      isRideGroup: true,
      rideDetails: {
        origin: "Suburban Heights",
        destination: "Downtown Business District",
        departureTime: "8:00 AM"
      }
    },
    {
      id: 2,
      name: "Weekend Travelers",
      participants: [
        {
          id: userId,
          name: currentUserName,
          avatar: currentUserAvatar,
          status: 'online',
          isSelf: true
        },
        {
          id: 5,
          name: "Sarah Wilson",
          avatar: "https://randomuser.me/api/portraits/women/17.jpg",
          status: 'online'
        },
        {
          id: 6,
          name: "Michael Brown",
          avatar: "https://randomuser.me/api/portraits/men/94.jpg",
          status: 'offline'
        }
      ],
      unreadCount: 0,
      lastMessage: "I'll be heading to the beach this Saturday if anyone wants to join.",
      lastMessageTime: "Yesterday",
      isRideGroup: false
    }
  ]);
  
  // Group chat messages
  const [groupMessages, setGroupMessages] = useState<Record<number, ChatMessage[]>>({
    1: [
      {
        id: 1,
        senderId: 2,
        senderName: "Alex Johnson",
        senderAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
        text: "Good morning everyone! Just a reminder that we're carpooling today.",
        timestamp: "7:30 AM",
        status: 'read'
      },
      {
        id: 2,
        senderId: 3,
        senderName: "Emma Lewis",
        senderAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
        text: "I'll be driving today. Can everyone confirm they're still joining?",
        timestamp: "7:35 AM",
        status: 'read'
      },
      {
        id: 3,
        senderId: userId,
        senderName: currentUserName,
        senderAvatar: currentUserAvatar,
        text: "Yes, I'll be there!",
        timestamp: "7:40 AM",
        status: 'read'
      },
      {
        id: 4,
        senderId: 4,
        senderName: "David Chen",
        senderAvatar: "https://randomuser.me/api/portraits/men/67.jpg",
        text: "I'm in too. Can we make a quick stop at the gas station?",
        timestamp: "7:45 AM",
        status: 'read'
      },
      {
        id: 5,
        senderId: 3,
        senderName: "Emma Lewis",
        senderAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
        text: "No problem! I'll pick everyone up at the usual spots.",
        timestamp: "7:50 AM",
        status: 'read'
      },
      {
        id: 6,
        senderId: 2,
        senderName: "Alex Johnson",
        senderAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
        text: "Does anyone want to join tomorrow's carpool?",
        timestamp: "2:15 PM",
        status: 'read',
        attachments: [
          {
            id: 1,
            type: 'event',
            eventDetails: {
              title: "Morning Carpool",
              date: "Tomorrow, 8:00 AM",
              location: "Suburban Heights → Downtown"
            }
          }
        ]
      }
    ],
    2: [
      {
        id: 1,
        senderId: 5,
        senderName: "Sarah Wilson",
        senderAvatar: "https://randomuser.me/api/portraits/women/17.jpg",
        text: "Hey everyone! Planning a beach trip this weekend. Who's interested?",
        timestamp: "Yesterday",
        status: 'read'
      },
      {
        id: 2,
        senderId: userId,
        senderName: currentUserName,
        senderAvatar: currentUserAvatar,
        text: "Sounds fun! Which beach are you thinking of?",
        timestamp: "Yesterday",
        status: 'read'
      },
      {
        id: 3,
        senderId: 6,
        senderName: "Michael Brown",
        senderAvatar: "https://randomuser.me/api/portraits/men/94.jpg",
        text: "I'm interested too. Are we all sharing one car?",
        timestamp: "Yesterday",
        status: 'read'
      },
      {
        id: 4,
        senderId: 5,
        senderName: "Sarah Wilson",
        senderAvatar: "https://randomuser.me/api/portraits/women/17.jpg",
        text: "I'm thinking Sunset Beach. And yes, we can all fit in my SUV. Let's take a vote on the departure time:",
        timestamp: "Yesterday",
        status: 'read',
        attachments: [
          {
            id: 1,
            type: 'poll',
            pollDetails: {
              question: "What time should we leave on Saturday?",
              options: ["8:00 AM", "9:30 AM", "11:00 AM"],
              votes: { "8:00 AM": 1, "9:30 AM": 2, "11:00 AM": 0 }
            }
          }
        ]
      },
      {
        id: 5,
        senderId: userId,
        senderName: currentUserName,
        senderAvatar: currentUserAvatar,
        text: "I voted for 9:30 AM. That gives us plenty of time to prepare but still arrive early enough.",
        timestamp: "Yesterday",
        status: 'read'
      },
      {
        id: 6,
        senderId: 5,
        senderName: "Sarah Wilson",
        senderAvatar: "https://randomuser.me/api/portraits/women/17.jpg",
        text: "Looks like 9:30 AM is winning. I'll be heading to the beach this Saturday if anyone wants to join.",
        timestamp: "Yesterday",
        status: 'read'
      }
    ]
  });
  
  // Call history
  const [callHistory, setCallHistory] = useState<CallHistory[]>([
    {
      id: 1,
      participantName: "Alex Johnson",
      participantAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
      type: 'audio',
      status: 'outgoing',
      duration: "3:42",
      timestamp: "Today, 11:30 AM"
    },
    {
      id: 2,
      participantName: "Emma Lewis",
      participantAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
      type: 'video',
      status: 'missed',
      timestamp: "Yesterday, 6:15 PM"
    },
    {
      id: 3,
      participantName: "David Chen",
      participantAvatar: "https://randomuser.me/api/portraits/men/67.jpg",
      type: 'audio',
      status: 'incoming',
      duration: "1:15",
      timestamp: "Yesterday, 2:30 PM"
    }
  ]);
  
  // Refs
  const messageEndRef = useRef<HTMLDivElement>(null);
  const callTimerRef = useRef<number | null>(null);
  
  // Effects
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [
    selectedChatId && messages[selectedChatId], 
    selectedGroupId && groupMessages[selectedGroupId]
  ]);
  
  // Simulate incoming message for demo
  useEffect(() => {
    if (selectedChatId === 1) {
      const timer = setTimeout(() => {
        const updatedMessages = {...messages};
        if (updatedMessages[1]) {
          updatedMessages[1] = [
            ...updatedMessages[1],
            {
              id: updatedMessages[1].length + 1,
              senderId: 2,
              senderName: "Alex Johnson",
              senderAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
              text: "Can we change the pickup location?",
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: 'delivered'
            }
          ];
          setMessages(updatedMessages);
          
          // Simulate typing
          const participants = [...chatParticipants[1]];
          const alexIndex = participants.findIndex(p => p.id === 2);
          if (alexIndex !== -1) {
            participants[alexIndex] = {
              ...participants[alexIndex],
              isTyping: true
            };
            setParticipants({
              ...chatParticipants,
              1: participants
            });
            
            // Stop typing after 3 seconds
            setTimeout(() => {
              const updatedParticipants = [...chatParticipants[1]];
              const idx = updatedParticipants.findIndex(p => p.id === 2);
              if (idx !== -1) {
                updatedParticipants[idx] = {
                  ...updatedParticipants[idx],
                  isTyping: false
                };
                setParticipants({
                  ...chatParticipants,
                  1: updatedParticipants
                });
              }
            }, 3000);
          }
        }
      }, 15000);
      
      return () => clearTimeout(timer);
    }
  }, [selectedChatId, messages, chatParticipants]);
  
  // Timer for active calls
  useEffect(() => {
    if (voiceCallState.isActive || videoCallState.isActive) {
      callTimerRef.current = window.setInterval(() => {
        if (voiceCallState.isActive) {
          setVoiceCallState(prev => ({
            ...prev,
            duration: prev.duration + 1
          }));
        }
        
        if (videoCallState.isActive) {
          setVideoCallState(prev => ({
            ...prev,
            duration: prev.duration + 1
          }));
        }
      }, 1000);
    } else if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [voiceCallState.isActive, videoCallState.isActive]);
  
  // Simulate incoming call after 10 seconds for demo
  useEffect(() => {
    if (activeTab === 'call-history' && !incomingCall && !voiceCallState.isActive && !videoCallState.isActive) {
      const timer = setTimeout(() => {
        setIncomingCall({
          isRinging: true,
          callerId: 3,
          callerName: "Emma Lewis",
          callerAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
          callType: 'video'
        });
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [activeTab, incomingCall, voiceCallState.isActive, videoCallState.isActive]);
  
  // Event handlers
  
  // Send a message
  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    const newMessageId = selectedChatId 
      ? (messages[selectedChatId]?.length || 0) + 1 
      : (groupMessages[selectedGroupId!]?.length || 0) + 1;
    
    const newMessage: ChatMessage = {
      id: newMessageId,
      senderId: userId,
      senderName: currentUserName,
      senderAvatar: currentUserAvatar,
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };
    
    if (selectedAttachment) {
      newMessage.attachments = [selectedAttachment];
    }
    
    if (selectedChatId) {
      const updatedMessages = {...messages};
      updatedMessages[selectedChatId] = [
        ...(updatedMessages[selectedChatId] || []),
        newMessage
      ];
      setMessages(updatedMessages);
    } else if (selectedGroupId) {
      const updatedGroupMessages = {...groupMessages};
      updatedGroupMessages[selectedGroupId] = [
        ...(updatedGroupMessages[selectedGroupId] || []),
        newMessage
      ];
      setGroupMessages(updatedGroupMessages);
      
      // Update the group's last message
      const updatedGroups = groupChats.map(group => {
        if (group.id === selectedGroupId) {
          return {
            ...group,
            lastMessage: messageText,
            lastMessageTime: "Just now"
          };
        }
        return group;
      });
      setGroupChats(updatedGroups);
    }
    
    setMessageText("");
    setSelectedAttachment(null);
    setAttachmentMenuOpen(false);
    
    // Simulate message status updates
    setTimeout(() => {
      if (selectedChatId) {
        const updatedMessages = {...messages};
        const messageIndex = updatedMessages[selectedChatId].findIndex(m => m.id === newMessageId);
        
        if (messageIndex !== -1) {
          updatedMessages[selectedChatId][messageIndex] = {
            ...updatedMessages[selectedChatId][messageIndex],
            status: 'delivered'
          };
          setMessages(updatedMessages);
        }
      } else if (selectedGroupId) {
        const updatedGroupMessages = {...groupMessages};
        const messageIndex = updatedGroupMessages[selectedGroupId].findIndex(m => m.id === newMessageId);
        
        if (messageIndex !== -1) {
          updatedGroupMessages[selectedGroupId][messageIndex] = {
            ...updatedGroupMessages[selectedGroupId][messageIndex],
            status: 'delivered'
          };
          setGroupMessages(updatedGroupMessages);
        }
      }
    }, 1000);
    
    setTimeout(() => {
      if (selectedChatId) {
        const updatedMessages = {...messages};
        const messageIndex = updatedMessages[selectedChatId].findIndex(m => m.id === newMessageId);
        
        if (messageIndex !== -1) {
          updatedMessages[selectedChatId][messageIndex] = {
            ...updatedMessages[selectedChatId][messageIndex],
            status: 'read'
          };
          setMessages(updatedMessages);
        }
      } else if (selectedGroupId) {
        const updatedGroupMessages = {...groupMessages};
        const messageIndex = updatedGroupMessages[selectedGroupId].findIndex(m => m.id === newMessageId);
        
        if (messageIndex !== -1) {
          updatedGroupMessages[selectedGroupId][messageIndex] = {
            ...updatedGroupMessages[selectedGroupId][messageIndex],
            status: 'read'
          };
          setGroupMessages(updatedGroupMessages);
        }
      }
    }, 2000);
  };
  
  // Translate a message
  const handleTranslateMessage = (messageId: number) => {
    if (selectedChatId) {
      const updatedMessages = {...messages};
      const messageIndex = updatedMessages[selectedChatId].findIndex(m => m.id === messageId);
      
      if (messageIndex !== -1) {
        const message = updatedMessages[selectedChatId][messageIndex];
        
        // If already translated, switch back to original
        if (message.isTranslated) {
          updatedMessages[selectedChatId][messageIndex] = {
            ...message,
            text: message.originalText!,
            originalText: undefined,
            translatedFrom: undefined,
            isTranslated: false
          };
        } else {
          // Translate the message
          const sender = chatParticipants[selectedChatId].find(p => p.id === message.senderId);
          const fromLanguage = sender?.language || 'en';
          
          // Skip if languages are the same
          if (fromLanguage === userLanguage) {
            toast({
              description: "This message is already in your preferred language."
            });
            return;
          }
          
          const translated = translateText(message.text, userLanguage);
          
          updatedMessages[selectedChatId][messageIndex] = {
            ...message,
            originalText: message.text,
            text: translated,
            translatedFrom: fromLanguage,
            isTranslated: true
          };
          
          toast({
            title: "Message translated",
            description: `Translated from ${getLanguageName(fromLanguage)} to ${getLanguageName(userLanguage)}`
          });
        }
        
        setMessages(updatedMessages);
      }
    } else if (selectedGroupId) {
      const updatedGroupMessages = {...groupMessages};
      const messageIndex = updatedGroupMessages[selectedGroupId].findIndex(m => m.id === messageId);
      
      if (messageIndex !== -1) {
        const message = updatedGroupMessages[selectedGroupId][messageIndex];
        
        // If already translated, switch back to original
        if (message.isTranslated) {
          updatedGroupMessages[selectedGroupId][messageIndex] = {
            ...message,
            text: message.originalText!,
            originalText: undefined,
            translatedFrom: undefined,
            isTranslated: false
          };
        } else {
          // For demo, assume all group messages are in English
          const fromLanguage = 'en';
          
          // Skip if languages are the same
          if (fromLanguage === userLanguage) {
            toast({
              description: "This message is already in your preferred language."
            });
            return;
          }
          
          const translated = translateText(message.text, userLanguage);
          
          updatedGroupMessages[selectedGroupId][messageIndex] = {
            ...message,
            originalText: message.text,
            text: translated,
            translatedFrom: fromLanguage,
            isTranslated: true
          };
          
          toast({
            title: "Message translated",
            description: `Translated from ${getLanguageName(fromLanguage)} to ${getLanguageName(userLanguage)}`
          });
        }
        
        setGroupMessages(updatedGroupMessages);
      }
    }
  };
  
  // Start voice call
  const handleStartVoiceCall = () => {
    if (selectedChatId) {
      const participant = chatParticipants[selectedChatId].find(p => p.id !== userId);
      
      if (participant) {
        setVoiceCallState({
          isActive: true,
          isMuted: false,
          participantId: participant.id,
          participantName: participant.name,
          participantAvatar: participant.avatar,
          duration: 0
        });
        
        toast({
          title: "Voice call started",
          description: `Calling ${participant.name}...`
        });
      }
    } else if (selectedGroupId) {
      toast({
        variant: "destructive",
        title: "Group calling not available",
        description: "Group voice calls are only available in the premium version."
      });
    }
  };
  
  // End voice call
  const handleEndVoiceCall = () => {
    // Add to call history
    if (voiceCallState.isActive && voiceCallState.participantId) {
      const newHistoryItem: CallHistory = {
        id: callHistory.length + 1,
        participantName: voiceCallState.participantName,
        participantAvatar: voiceCallState.participantAvatar,
        type: 'audio',
        status: 'outgoing',
        duration: getTimeElapsed(voiceCallState.duration),
        timestamp: new Date().toLocaleString([], {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      
      setCallHistory([newHistoryItem, ...callHistory]);
    }
    
    setVoiceCallState({
      isActive: false,
      isMuted: false,
      participantId: null,
      participantName: "",
      participantAvatar: "",
      duration: 0
    });
    
    toast({
      title: "Call ended",
      description: "Voice call has ended."
    });
  };
  
  // Toggle mute for voice call
  const handleToggleVoiceMute = () => {
    setVoiceCallState(prev => ({
      ...prev,
      isMuted: !prev.isMuted
    }));
    
    toast({
      description: voiceCallState.isMuted ? "Microphone unmuted" : "Microphone muted"
    });
  };
  
  // Start video call
  const handleStartVideoCall = () => {
    if (selectedChatId) {
      const participant = chatParticipants[selectedChatId].find(p => p.id !== userId);
      
      if (participant) {
        setVideoCallState({
          isActive: true,
          isMuted: false,
          isVideoEnabled: true,
          participantId: participant.id,
          participantName: participant.name,
          participantAvatar: participant.avatar,
          duration: 0
        });
        
        toast({
          title: "Video call started",
          description: `Calling ${participant.name}...`
        });
      }
    } else if (selectedGroupId) {
      toast({
        variant: "destructive",
        title: "Group calling not available",
        description: "Group video calls are only available in the premium version."
      });
    }
  };
  
  // End video call
  const handleEndVideoCall = () => {
    // Add to call history
    if (videoCallState.isActive && videoCallState.participantId) {
      const newHistoryItem: CallHistory = {
        id: callHistory.length + 1,
        participantName: videoCallState.participantName,
        participantAvatar: videoCallState.participantAvatar,
        type: 'video',
        status: 'outgoing',
        duration: getTimeElapsed(videoCallState.duration),
        timestamp: new Date().toLocaleString([], {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      
      setCallHistory([newHistoryItem, ...callHistory]);
    }
    
    setVideoCallState({
      isActive: false,
      isMuted: false,
      isVideoEnabled: true,
      participantId: null,
      participantName: "",
      participantAvatar: "",
      duration: 0
    });
    
    toast({
      title: "Call ended",
      description: "Video call has ended."
    });
  };
  
  // Toggle mute for video call
  const handleToggleVideoMute = () => {
    setVideoCallState(prev => ({
      ...prev,
      isMuted: !prev.isMuted
    }));
    
    toast({
      description: videoCallState.isMuted ? "Microphone unmuted" : "Microphone muted"
    });
  };
  
  // Toggle video on/off
  const handleToggleVideo = () => {
    setVideoCallState(prev => ({
      ...prev,
      isVideoEnabled: !prev.isVideoEnabled
    }));
    
    toast({
      description: videoCallState.isVideoEnabled ? "Camera turned off" : "Camera turned on"
    });
  };
  
  // Handle incoming call
  const handleAcceptCall = () => {
    if (incomingCall) {
      if (incomingCall.callType === 'audio') {
        setVoiceCallState({
          isActive: true,
          isMuted: false,
          participantId: incomingCall.callerId,
          participantName: incomingCall.callerName,
          participantAvatar: incomingCall.callerAvatar,
          duration: 0
        });
      } else {
        setVideoCallState({
          isActive: true,
          isMuted: false,
          isVideoEnabled: true,
          participantId: incomingCall.callerId,
          participantName: incomingCall.callerName,
          participantAvatar: incomingCall.callerAvatar,
          duration: 0
        });
      }
      
      setIncomingCall(null);
      
      toast({
        title: "Call accepted",
        description: `You are now connected with ${incomingCall.callerName}`
      });
    }
  };
  
  // Reject incoming call
  const handleRejectCall = () => {
    if (incomingCall) {
      // Add to call history
      const newHistoryItem: CallHistory = {
        id: callHistory.length + 1,
        participantName: incomingCall.callerName,
        participantAvatar: incomingCall.callerAvatar,
        type: incomingCall.callType,
        status: 'missed',
        timestamp: new Date().toLocaleString([], {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      
      setCallHistory([newHistoryItem, ...callHistory]);
      setIncomingCall(null);
      
      toast({
        title: "Call rejected",
        description: `Call from ${incomingCall.callerName} rejected`
      });
    }
  };
  
  // Handle chat selection
  const handleSelectChat = (chatId: number) => {
    setSelectedChatId(chatId);
    setSelectedGroupId(null);
  };
  
  // Handle group selection
  const handleSelectGroup = (groupId: number) => {
    setSelectedGroupId(groupId);
    setSelectedChatId(null);
    
    // Clear unread count for selected group
    const updatedGroups = groupChats.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          unreadCount: 0
        };
      }
      return group;
    });
    setGroupChats(updatedGroups);
  };
  
  // Handle message input changes with typing indicator
  const handleMessageInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
    
    // Set typing indicator
    if (!isTyping && e.target.value) {
      setIsTyping(true);
      
      // In a real app, would send a typing indicator to other users
      // via WebSocket or similar
      
      // Clear typing indicator after 5 seconds of inactivity
      setTimeout(() => {
        setIsTyping(false);
      }, 5000);
    }
  };
  
  // Handle attachment selection
  const handleAttachmentSelect = (type: ChatAttachment['type']) => {
    let attachment: ChatAttachment;
    
    switch (type) {
      case 'image':
        attachment = {
          id: 1,
          type: 'image',
          url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba',
          name: 'Scenic View',
          thumbnailUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200'
        };
        break;
      case 'document':
        attachment = {
          id: 1,
          type: 'document',
          name: 'Trip_Itinerary.pdf',
          size: '2.4 MB'
        };
        break;
      case 'location':
        attachment = {
          id: 1,
          type: 'location',
          location: { lat: 40.7128, lng: -74.0060 }
        };
        break;
      case 'route':
        attachment = {
          id: 1,
          type: 'route',
          route: {
            start: { lat: 40.7128, lng: -74.0060 },
            end: { lat: 40.7614, lng: -73.9776 },
            waypoints: []
          }
        };
        break;
      case 'poll':
        attachment = {
          id: 1,
          type: 'poll',
          pollDetails: {
            question: "What time should we meet?",
            options: ["8:00 AM", "9:00 AM", "10:00 AM"],
            votes: {}
          }
        };
        break;
      case 'event':
        attachment = {
          id: 1,
          type: 'event',
          eventDetails: {
            title: "Group Ride",
            date: "Tomorrow, 8:00 AM",
            location: "Downtown Coffee Shop"
          }
        };
        break;
      default:
        return;
    }
    
    setSelectedAttachment(attachment);
    setAttachmentMenuOpen(false);
    
    toast({
      title: "Attachment added",
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} attachment ready to send.`
    });
  };
  
  // Helper to check if the current user has sent a message
  const isCurrentUserMessage = (message: ChatMessage) => message.senderId === userId;
  
  // Get messages for the current chat
  const currentMessages = selectedChatId 
    ? messages[selectedChatId] || [] 
    : selectedGroupId 
    ? groupMessages[selectedGroupId] || [] 
    : [];
  
  // Get participants for the current chat
  const currentParticipants = selectedChatId 
    ? chatParticipants[selectedChatId] || [] 
    : selectedGroupId 
    ? groupChats.find(g => g.id === selectedGroupId)?.participants || [] 
    : [];
  
  // Get the current chat/group name
  const currentChatName = selectedChatId 
    ? currentParticipants.find(p => p.id !== userId)?.name || "" 
    : selectedGroupId 
    ? groupChats.find(g => g.id === selectedGroupId)?.name || "" 
    : "";
  
  // Check if someone in the chat is typing
  const someoneIsTyping = currentParticipants.some(p => p.id !== userId && p.isTyping);
  
  // Rendering helpers
  const renderMessageStatus = (status: ChatMessage['status']) => {
    switch (status) {
      case 'sent':
        return <div className="text-[10px] text-muted-foreground">Sent</div>;
      case 'delivered':
        return <div className="text-[10px] text-muted-foreground">Delivered</div>;
      case 'read':
        return <div className="text-[10px] text-blue-500">Read</div>;
      default:
        return null;
    }
  };
  
  // Render chat attachment
  const renderAttachment = (attachment: ChatAttachment) => {
    switch (attachment.type) {
      case 'image':
        return (
          <div className="mt-2 rounded-md overflow-hidden max-w-[240px]">
            <img 
              src={attachment.url} 
              alt={attachment.name || "Image"} 
              className="w-full h-auto object-cover" 
            />
          </div>
        );
      case 'document':
        return (
          <div className="mt-2 flex items-center p-2 border rounded-md bg-muted">
            <File className="h-5 w-5 mr-2 text-primary" />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{attachment.name}</div>
              <div className="text-xs text-muted-foreground">{attachment.size}</div>
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        );
      case 'location':
        return (
          <div className="mt-2 rounded-md overflow-hidden border">
            <div className="h-[160px]">
              <RouteMap
                center={attachment.location!}
                className="h-full"
              />
            </div>
            <div className="p-2 bg-muted flex items-center">
              <MapPin className="h-4 w-4 text-primary mr-1" />
              <span className="text-xs">Shared Location</span>
            </div>
          </div>
        );
      case 'route':
        return (
          <div className="mt-2 rounded-md overflow-hidden border">
            <div className="h-[200px]">
              <RouteMap
                center={attachment.route!.start}
                route={attachment.route}
                className="h-full"
              />
            </div>
            <div className="p-2 bg-muted flex items-center justify-between">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-primary mr-1" />
                <span className="text-xs">Shared Route</span>
              </div>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                Navigate
              </Button>
            </div>
          </div>
        );
      case 'poll':
        return (
          <div className="mt-2 p-3 border rounded-md bg-muted">
            <div className="font-medium mb-2">{attachment.pollDetails!.question}</div>
            <div className="space-y-2">
              {attachment.pollDetails!.options.map((option, index) => {
                const voteCount = attachment.pollDetails!.votes[option] || 0;
                const totalVotes = Object.values(attachment.pollDetails!.votes).reduce((acc, val) => acc + val, 0);
                const percentage = totalVotes === 0 ? 0 : Math.round((voteCount / totalVotes) * 100);
                
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 justify-start text-left font-normal text-sm flex-1 mr-2"
                      >
                        {option}
                      </Button>
                      <span className="text-xs w-10 text-right">{percentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: `${percentage}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 'event':
        return (
          <div className="mt-2 p-3 border rounded-md bg-primary/5">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-primary" />
              <div className="font-medium">{attachment.eventDetails!.title}</div>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary/70" />
                <div>{attachment.eventDetails!.date}</div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary/70" />
                <div>{attachment.eventDetails!.location}</div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="text-xs">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                Add to Calendar
              </Button>
              <Button variant="default" size="sm" className="text-xs">
                <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                I'll Be There
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  
  // Render voice call interface
  const renderVoiceCallInterface = () => (
    <AnimatePresence>
      {voiceCallState.isActive && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        >
          <Card className="w-full max-w-md">
            <CardHeader className="pb-2 pt-6 text-center">
              <CardTitle className="text-lg">Voice Call</CardTitle>
              <CardDescription>
                {getTimeElapsed(voiceCallState.duration)}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={voiceCallState.participantAvatar} />
                <AvatarFallback>{voiceCallState.participantName.charAt(0)}</AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-medium mb-1">{voiceCallState.participantName}</h3>
              <p className="text-sm text-muted-foreground mb-8">Call in progress</p>
              
              <div className="flex justify-center gap-4">
                <Button
                  variant="ghost"
                  size="lg"
                  className={`h-14 w-14 rounded-full ${voiceCallState.isMuted ? 'bg-red-100 text-red-600' : 'bg-muted'}`}
                  onClick={handleToggleVoiceMute}
                >
                  {voiceCallState.isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </Button>
                <Button
                  variant="destructive"
                  size="lg"
                  className="h-14 w-14 rounded-full"
                  onClick={handleEndVoiceCall}
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="h-14 w-14 rounded-full bg-muted"
                >
                  <Volume2 className="h-6 w-6" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
  
  // Render video call interface
  const renderVideoCallInterface = () => (
    <AnimatePresence>
      {videoCallState.isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black"
        >
          <div className="relative h-full w-full">
            {/* Main video (other participant) */}
            <div className="h-full w-full bg-gray-900 flex items-center justify-center">
              {videoCallState.isVideoEnabled ? (
                <img
                  src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&h=800&fit=crop"
                  alt="Video call"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-center text-white">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src={videoCallState.participantAvatar} />
                    <AvatarFallback>{videoCallState.participantName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-xl font-medium">{videoCallState.participantName}</div>
                  <div className="text-sm opacity-70">Camera off</div>
                </div>
              )}
            </div>
            
            {/* Self view (picture-in-picture) */}
            <div className="absolute bottom-4 right-4 h-40 w-60 rounded-md overflow-hidden border-2 border-white">
              <img
                src="https://randomuser.me/api/portraits/men/1.jpg"
                alt="Self view"
                className="h-full w-full object-cover"
              />
            </div>
            
            {/* Call controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
              <Button
                variant="ghost"
                size="lg"
                className={`h-14 w-14 rounded-full ${videoCallState.isMuted ? 'bg-red-600 text-white' : 'bg-gray-800 text-white'}`}
                onClick={handleToggleVideoMute}
              >
                {videoCallState.isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>
              <Button
                variant="destructive"
                size="lg"
                className="h-14 w-14 rounded-full"
                onClick={handleEndVideoCall}
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className={`h-14 w-14 rounded-full ${!videoCallState.isVideoEnabled ? 'bg-red-600 text-white' : 'bg-gray-800 text-white'}`}
                onClick={handleToggleVideo}
              >
                {videoCallState.isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
              </Button>
            </div>
            
            {/* Call duration */}
            <div className="absolute top-4 left-4 bg-black/50 text-white py-1 px-3 rounded-full text-sm">
              {getTimeElapsed(videoCallState.duration)}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
  
  // Render incoming call dialog
  const renderIncomingCallDialog = () => (
    <AnimatePresence>
      {incomingCall && incomingCall.isRinging && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        >
          <Card className="w-full max-w-md">
            <CardHeader className="pb-2 pt-6 text-center">
              <CardTitle className="text-lg">
                {incomingCall.callType === 'audio' ? 'Incoming Voice Call' : 'Incoming Video Call'}
              </CardTitle>
              <CardDescription>
                <span className="flex items-center justify-center mt-1">
                  {incomingCall.callType === 'audio' ? 
                    <Phone className="h-4 w-4 mr-1.5 text-primary animate-pulse" /> : 
                    <Video className="h-4 w-4 mr-1.5 text-primary animate-pulse" />
                  }
                  Ringing...
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={incomingCall.callerAvatar} />
                <AvatarFallback>{incomingCall.callerName.charAt(0)}</AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-medium mb-1">{incomingCall.callerName}</h3>
              <p className="text-sm text-muted-foreground mb-8">is calling you</p>
              
              <div className="flex justify-center gap-8">
                <Button
                  variant="destructive"
                  size="lg"
                  className="h-14 w-14 rounded-full"
                  onClick={handleRejectCall}
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
                <Button
                  variant="default"
                  size="lg"
                  className="h-14 w-14 rounded-full bg-green-600 hover:bg-green-700"
                  onClick={handleAcceptCall}
                >
                  {incomingCall.callType === 'audio' ? 
                    <Phone className="h-6 w-6" /> : 
                    <Video className="h-6 w-6" />
                  }
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
  
  // Main component
  return (
    <Card className="shadow-md h-[700px] flex flex-col">
      <CardHeader className="pb-2 shrink-0">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-xl">
            <MessageSquare className="h-5 w-5 mr-2 text-primary" />
            Communication Hub
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardDescription>
          Chat, call, and share with your ride partners and community
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <div className="px-4 border-b">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="chat" className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="group-chat" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Groups
            </TabsTrigger>
            <TabsTrigger value="call-history" className="flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              Calls
            </TabsTrigger>
          </TabsList>
        </div>
        
        <div className="flex-1 min-h-0 overflow-hidden">
          {/* Private Chat Tab */}
          <TabsContent value="chat" className="h-full flex flex-col m-0">
            <div className="grid grid-cols-12 h-full border-b">
              {/* Chat List */}
              <div className="col-span-12 md:col-span-4 border-r flex flex-col h-full">
                <div className="p-2 border-b">
                  <div className="flex items-center gap-2">
                    <Input 
                      placeholder="Search chats..." 
                      className="flex-1"
                    />
                    <Select value={userLanguage} onValueChange={setUserLanguage}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="it">Italian</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                        <SelectItem value="ko">Korean</SelectItem>
                        <SelectItem value="ru">Russian</SelectItem>
                        <SelectItem value="ar">Arabic</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center mt-2">
                    <Label className="flex items-center text-xs space-x-2 cursor-pointer">
                      <Switch 
                        checked={autoTranslate}
                        onCheckedChange={setAutoTranslate}
                        size="sm"
                      />
                      <span>Auto-translate messages</span>
                    </Label>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-1">
                          <Info className="h-3 w-3" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-3 text-xs">
                        <p>
                          Auto-translate will automatically translate incoming messages 
                          to your selected language. You can also manually translate 
                          individual messages.
                        </p>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {Object.entries(messages).map(([id, chatMessages]) => {
                    const chatId = parseInt(id);
                    const otherParticipant = chatParticipants[chatId]?.find(p => p.id !== userId);
                    const lastMessage = chatMessages[chatMessages.length - 1];
                    
                    return otherParticipant ? (
                      <div 
                        key={chatId}
                        className={`
                          flex items-center p-3 cursor-pointer hover:bg-muted
                          ${selectedChatId === chatId ? 'bg-primary/5' : ''}
                        `}
                        onClick={() => handleSelectChat(chatId)}
                      >
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src={otherParticipant.avatar} />
                          <AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                            <h3 className="font-medium truncate">{otherParticipant.name}</h3>
                            <span className="text-xs text-muted-foreground">{lastMessage?.timestamp}</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-muted-foreground truncate">
                            {lastMessage && (
                              <>
                                {lastMessage.senderId === userId && (
                                  <span className="mr-1">You:</span>
                                )}
                                {lastMessage.text}
                              </>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 mt-1">
                            {otherParticipant.status === 'online' && (
                              <Badge 
                                variant="outline" 
                                className="text-[10px] py-0 px-1 h-4 bg-green-50 text-green-700 border-green-200"
                              >
                                Online
                              </Badge>
                            )}
                            
                            {otherParticipant.language && otherParticipant.language !== 'en' && (
                              <Badge 
                                variant="outline" 
                                className="text-[10px] py-0 px-1 h-4 bg-blue-50 text-blue-700 border-blue-200"
                              >
                                <Globe className="h-2.5 w-2.5 mr-0.5" />
                                {getLanguageName(otherParticipant.language)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
                
                <div className="p-2 border-t">
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    New Chat
                  </Button>
                </div>
              </div>
              
              {/* Chat Area */}
              <div className="col-span-12 md:col-span-8 flex flex-col h-full">
                {selectedChatId ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-3 border-b flex justify-between items-center">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={currentParticipants.find(p => p.id !== userId)?.avatar} />
                          <AvatarFallback>{currentChatName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{currentChatName}</h3>
                          {currentParticipants.find(p => p.id !== userId)?.status === 'online' ? (
                            <div className="text-xs text-green-600 flex items-center">
                              <div className="h-1.5 w-1.5 rounded-full bg-green-600 mr-1" />
                              Online
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground">
                              {currentParticipants.find(p => p.id !== userId)?.lastActive || "Offline"}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground"
                          onClick={handleStartVoiceCall}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground"
                          onClick={handleStartVideoCall}
                        >
                          <Video className="h-4 w-4" />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>Chat Options</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <User className="h-4 w-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Settings className="h-4 w-4 mr-2" />
                              Chat Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="h-4 w-4 mr-2" />
                              Share Contact
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Clear Chat
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {currentMessages.map(message => (
                        <div 
                          key={message.id}
                          className={`flex ${isCurrentUserMessage(message) ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className="flex gap-2 max-w-[80%]">
                            {!isCurrentUserMessage(message) && (
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={message.senderAvatar} />
                                <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
                              </Avatar>
                            )}
                            
                            <div>
                              <div 
                                className={`
                                  rounded-lg px-3 py-2
                                  ${isCurrentUserMessage(message) 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'bg-muted'
                                  }
                                `}
                              >
                                <div className="flex justify-between items-center gap-4 mb-1">
                                  <div className="font-medium text-xs">
                                    {isCurrentUserMessage(message) ? 'You' : message.senderName}
                                  </div>
                                  <div className="text-xs opacity-70">
                                    {message.timestamp}
                                  </div>
                                </div>
                                
                                <div>{message.text}</div>
                                
                                {/* If message was translated, show original */}
                                {message.isTranslated && message.originalText && (
                                  <div className="mt-1 pt-1 border-t border-primary/20 text-xs opacity-70">
                                    <div className="flex items-center">
                                      <Globe className="h-3 w-3 mr-1" />
                                      <span>Original ({getLanguageName(message.translatedFrom || 'unknown')}):</span>
                                    </div>
                                    <div>{message.originalText}</div>
                                  </div>
                                )}
                                
                                {/* Attachments */}
                                {message.attachments?.map(attachment => (
                                  <div key={attachment.id}>
                                    {renderAttachment(attachment)}
                                  </div>
                                ))}
                                
                                {/* Message actions */}
                                <div className="flex justify-end items-center mt-1 gap-1">
                                  {!message.isTranslated && !isCurrentUserMessage(message) && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-5 text-[10px] p-0"
                                      onClick={() => handleTranslateMessage(message.id)}
                                    >
                                      <Globe className="h-3 w-3 mr-1" />
                                      Translate
                                    </Button>
                                  )}
                                  
                                  {message.isTranslated && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-5 text-[10px] p-0"
                                      onClick={() => handleTranslateMessage(message.id)}
                                    >
                                      <Globe className="h-3 w-3 mr-1" />
                                      Show Original
                                    </Button>
                                  )}
                                  
                                  {isCurrentUserMessage(message) && (
                                    <div className="ml-2">
                                      {renderMessageStatus(message.status)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Typing indicator */}
                      {someoneIsTyping && (
                        <div className="flex justify-start">
                          <div className="flex gap-2 max-w-[80%]">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={currentParticipants.find(p => p.id !== userId && p.isTyping)?.avatar} />
                              <AvatarFallback>
                                {currentParticipants.find(p => p.id !== userId && p.isTyping)?.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="bg-muted rounded-lg px-4 py-3">
                              <div className="flex space-x-1">
                                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div ref={messageEndRef} />
                    </div>
                    
                    {/* Message Input */}
                    <div className="p-3 border-t">
                      <div className="relative">
                        <Textarea 
                          placeholder="Type a message..." 
                          className="pr-12 resize-none"
                          value={messageText}
                          onChange={handleMessageInputChange}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          rows={2}
                        />
                        
                        <div className="absolute right-2 bottom-2 flex items-center">
                          <Popover open={attachmentMenuOpen} onOpenChange={setAttachmentMenuOpen}>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground mr-1">
                                <Paperclip className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-56 p-2" align="end">
                              <div className="grid grid-cols-3 gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="flex flex-col h-16 text-xs" 
                                  onClick={() => handleAttachmentSelect('image')}
                                >
                                  <Image className="h-5 w-5 mb-1" />
                                  Image
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="flex flex-col h-16 text-xs"
                                  onClick={() => handleAttachmentSelect('document')}
                                >
                                  <File className="h-5 w-5 mb-1" />
                                  Document
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="flex flex-col h-16 text-xs"
                                  onClick={() => handleAttachmentSelect('location')}
                                >
                                  <MapPin className="h-5 w-5 mb-1" />
                                  Location
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="flex flex-col h-16 text-xs"
                                  onClick={() => handleAttachmentSelect('route')}
                                >
                                  <Map className="h-5 w-5 mb-1" />
                                  Route
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="flex flex-col h-16 text-xs"
                                  onClick={() => handleAttachmentSelect('poll')}
                                >
                                  <BarChart className="h-5 w-5 mb-1" />
                                  Poll
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="flex flex-col h-16 text-xs"
                                  onClick={() => handleAttachmentSelect('event')}
                                >
                                  <Calendar className="h-5 w-5 mb-1" />
                                  Event
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                          
                          <Button 
                            size="sm" 
                            className="h-8 w-8 p-0 rounded-full"
                            onClick={handleSendMessage}
                            disabled={!messageText.trim() && !selectedAttachment}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Selected attachment preview */}
                      {selectedAttachment && (
                        <div className="mt-2 flex items-center p-2 rounded-md bg-muted">
                          <div className="flex-1 overflow-hidden">
                            <div className="font-medium text-sm">
                              {selectedAttachment.type.charAt(0).toUpperCase() + selectedAttachment.type.slice(1)} Attachment
                            </div>
                            {selectedAttachment.type === 'route' && (
                              <div className="text-xs text-muted-foreground">Route shared</div>
                            )}
                            {selectedAttachment.type === 'location' && (
                              <div className="text-xs text-muted-foreground">Current location</div>
                            )}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0 text-muted-foreground"
                            onClick={() => setSelectedAttachment(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      
                      {/* Language translation info */}
                      {selectedChatId && currentParticipants.find(p => p.id !== userId)?.language !== userLanguage && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                          <Languages className="h-3.5 w-3.5" />
                          <span>Messages will be translated from {getLanguageName(userLanguage)} to {
                            getLanguageName(currentParticipants.find(p => p.id !== userId)?.language || 'en')
                          }</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center p-4">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                      <h3 className="text-lg font-medium mb-2">No chat selected</h3>
                      <p className="text-muted-foreground mb-4">
                        Select a chat from the list or start a new conversation
                      </p>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Chat
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Group Chat Tab */}
          <TabsContent value="group-chat" className="h-full flex flex-col m-0">
            <div className="grid grid-cols-12 h-full border-b">
              {/* Group List */}
              <div className="col-span-12 md:col-span-4 border-r flex flex-col h-full">
                <div className="p-2 border-b">
                  <Input placeholder="Search groups..." />
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {groupChats.map(group => (
                    <div 
                      key={group.id}
                      className={`
                        flex items-center p-3 cursor-pointer hover:bg-muted
                        ${selectedGroupId === group.id ? 'bg-primary/5' : ''}
                      `}
                      onClick={() => handleSelectGroup(group.id)}
                    >
                      <div className="relative mr-3">
                        {/* Group icon with participants avatars */}
                        <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-muted-foreground" />
                        </div>
                        
                        {/* Unread count badge */}
                        {group.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                            {group.unreadCount}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <h3 className="font-medium truncate">{group.name}</h3>
                          <span className="text-xs text-muted-foreground">{group.lastMessageTime}</span>
                        </div>
                        
                        <div className="text-sm text-muted-foreground truncate">
                          {group.lastMessage}
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px] py-0 px-1 h-4">
                            {group.participants.length} members
                          </Badge>
                          
                          {group.isRideGroup && (
                            <Badge 
                              variant="outline" 
                              className="text-[10px] py-0 px-1 h-4 bg-primary/10"
                            >
                              <Car className="h-2.5 w-2.5 mr-0.5" />
                              Ride Group
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-2 border-t">
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    New Group
                  </Button>
                </div>
              </div>
              
              {/* Group Chat Area */}
              <div className="col-span-12 md:col-span-8 flex flex-col h-full">
                {selectedGroupId ? (
                  <>
                    {/* Group Header */}
                    <div className="p-3 border-b flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center mr-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-medium">{currentChatName}</h3>
                          <div className="text-xs text-muted-foreground">
                            {currentParticipants.length} members
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground"
                          onClick={() => {
                            toast({
                              title: "Group Call",
                              description: "Group calls are available in the premium version.",
                              variant: "destructive"
                            });
                          }}
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>Group Options</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Users className="h-4 w-4 mr-2" />
                              View Members
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Settings className="h-4 w-4 mr-2" />
                              Group Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Leave Group
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    {/* Group info for ride groups */}
                    {groupChats.find(g => g.id === selectedGroupId)?.isRideGroup && (
                      <div className="p-3 bg-muted/40 flex items-center justify-between">
                        <div className="flex items-center">
                          <Car className="h-5 w-5 text-primary mr-2" />
                          <div>
                            <div className="text-sm font-medium">Ride Group</div>
                            <div className="text-xs text-muted-foreground">
                              {groupChats.find(g => g.id === selectedGroupId)?.rideDetails?.origin} → {groupChats.find(g => g.id === selectedGroupId)?.rideDetails?.destination}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-primary/10">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          {groupChats.find(g => g.id === selectedGroupId)?.rideDetails?.departureTime}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Group Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {currentMessages.map(message => (
                        <div 
                          key={message.id}
                          className={`flex ${isCurrentUserMessage(message) ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className="flex gap-2 max-w-[80%]">
                            {!isCurrentUserMessage(message) && (
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={message.senderAvatar} />
                                <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
                              </Avatar>
                            )}
                            
                            <div>
                              <div 
                                className={`
                                  rounded-lg px-3 py-2
                                  ${isCurrentUserMessage(message) 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'bg-muted'
                                  }
                                `}
                              >
                                <div className="flex justify-between items-center gap-4 mb-1">
                                  <div className="font-medium text-xs">
                                    {isCurrentUserMessage(message) ? 'You' : message.senderName}
                                  </div>
                                  <div className="text-xs opacity-70">
                                    {message.timestamp}
                                  </div>
                                </div>
                                
                                <div>{message.text}</div>
                                
                                {/* If message was translated, show original */}
                                {message.isTranslated && message.originalText && (
                                  <div className="mt-1 pt-1 border-t border-primary/20 text-xs opacity-70">
                                    <div className="flex items-center">
                                      <Globe className="h-3 w-3 mr-1" />
                                      <span>Original ({getLanguageName(message.translatedFrom || 'unknown')}):</span>
                                    </div>
                                    <div>{message.originalText}</div>
                                  </div>
                                )}
                                
                                {/* Attachments */}
                                {message.attachments?.map(attachment => (
                                  <div key={attachment.id}>
                                    {renderAttachment(attachment)}
                                  </div>
                                ))}
                                
                                {/* Message actions */}
                                <div className="flex justify-end items-center mt-1 gap-1">
                                  {!message.isTranslated && !isCurrentUserMessage(message) && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-5 text-[10px] p-0"
                                      onClick={() => handleTranslateMessage(message.id)}
                                    >
                                      <Globe className="h-3 w-3 mr-1" />
                                      Translate
                                    </Button>
                                  )}
                                  
                                  {message.isTranslated && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-5 text-[10px] p-0"
                                      onClick={() => handleTranslateMessage(message.id)}
                                    >
                                      <Globe className="h-3 w-3 mr-1" />
                                      Show Original
                                    </Button>
                                  )}
                                  
                                  {isCurrentUserMessage(message) && (
                                    <div className="ml-2">
                                      {renderMessageStatus(message.status)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <div ref={messageEndRef} />
                    </div>
                    
                    {/* Message Input */}
                    <div className="p-3 border-t">
                      <div className="relative">
                        <Textarea 
                          placeholder="Type a message to the group..." 
                          className="pr-12 resize-none"
                          value={messageText}
                          onChange={handleMessageInputChange}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          rows={2}
                        />
                        
                        <div className="absolute right-2 bottom-2 flex items-center">
                          <Popover open={attachmentMenuOpen} onOpenChange={setAttachmentMenuOpen}>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground mr-1">
                                <Paperclip className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-56 p-2" align="end">
                              <div className="grid grid-cols-3 gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="flex flex-col h-16 text-xs" 
                                  onClick={() => handleAttachmentSelect('image')}
                                >
                                  <Image className="h-5 w-5 mb-1" />
                                  Image
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="flex flex-col h-16 text-xs"
                                  onClick={() => handleAttachmentSelect('document')}
                                >
                                  <File className="h-5 w-5 mb-1" />
                                  Document
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="flex flex-col h-16 text-xs"
                                  onClick={() => handleAttachmentSelect('location')}
                                >
                                  <MapPin className="h-5 w-5 mb-1" />
                                  Location
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="flex flex-col h-16 text-xs"
                                  onClick={() => handleAttachmentSelect('route')}
                                >
                                  <Map className="h-5 w-5 mb-1" />
                                  Route
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="flex flex-col h-16 text-xs"
                                  onClick={() => handleAttachmentSelect('poll')}
                                >
                                  <BarChart className="h-5 w-5 mb-1" />
                                  Poll
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="flex flex-col h-16 text-xs"
                                  onClick={() => handleAttachmentSelect('event')}
                                >
                                  <Calendar className="h-5 w-5 mb-1" />
                                  Event
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                          
                          <Button 
                            size="sm" 
                            className="h-8 w-8 p-0 rounded-full"
                            onClick={handleSendMessage}
                            disabled={!messageText.trim() && !selectedAttachment}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Selected attachment preview */}
                      {selectedAttachment && (
                        <div className="mt-2 flex items-center p-2 rounded-md bg-muted">
                          <div className="flex-1 overflow-hidden">
                            <div className="font-medium text-sm">
                              {selectedAttachment.type.charAt(0).toUpperCase() + selectedAttachment.type.slice(1)} Attachment
                            </div>
                            {selectedAttachment.type === 'route' && (
                              <div className="text-xs text-muted-foreground">Route shared</div>
                            )}
                            {selectedAttachment.type === 'location' && (
                              <div className="text-xs text-muted-foreground">Current location</div>
                            )}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0 text-muted-foreground"
                            onClick={() => setSelectedAttachment(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center p-4">
                      <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                      <h3 className="text-lg font-medium mb-2">No group selected</h3>
                      <p className="text-muted-foreground mb-4">
                        Select a group from the list or create a new group
                      </p>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Group
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Call History Tab */}
          <TabsContent value="call-history" className="h-full flex flex-col m-0">
            <div className="p-3 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Call History</h3>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    New Call
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {callHistory.map(call => (
                  <Card key={call.id}>
                    <CardContent className="p-3 flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={call.participantAvatar} />
                        <AvatarFallback>{call.participantName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="font-medium">{call.participantName}</div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          {call.type === 'audio' ? (
                            <Phone className="h-3.5 w-3.5 mr-1" />
                          ) : (
                            <Video className="h-3.5 w-3.5 mr-1" />
                          )}
                          
                          <div className="flex items-center">
                            {call.status === 'missed' ? (
                              <span className="text-red-600">Missed</span>
                            ) : call.status === 'incoming' ? (
                              <span className="flex items-center">
                                <ArrowLeft className="h-3.5 w-3.5 mr-1 text-green-600" />
                                Incoming
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <ArrowRight className="h-3.5 w-3.5 mr-1 text-blue-600" />
                                Outgoing
                              </span>
                            )}
                            
                            {call.duration && (
                              <span className="ml-2">{call.duration}</span>
                            )}
                            
                            <span className="mx-1">•</span>
                            {call.timestamp}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 text-green-600"
                          onClick={() => {
                            if (call.type === 'audio') {
                              setVoiceCallState({
                                isActive: true,
                                isMuted: false,
                                participantId: 2, // Assuming ID for this example
                                participantName: call.participantName,
                                participantAvatar: call.participantAvatar,
                                duration: 0
                              });
                            } else {
                              setVideoCallState({
                                isActive: true,
                                isMuted: false,
                                isVideoEnabled: true,
                                participantId: 2, // Assuming ID for this example
                                participantName: call.participantName,
                                participantAvatar: call.participantAvatar,
                                duration: 0
                              });
                            }
                          }}
                        >
                          {call.type === 'audio' ? (
                            <Phone className="h-4 w-4" />
                          ) : (
                            <Video className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {callHistory.length === 0 && (
                <div className="text-center py-8">
                  <Phone className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                  <h3 className="font-medium mb-2">No call history</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Your call history will appear here
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
      
      {/* Voice Call UI */}
      {renderVoiceCallInterface()}
      
      {/* Video Call UI */}
      {renderVideoCallInterface()}
      
      {/* Incoming Call Dialog */}
      {renderIncomingCallDialog()}
    </Card>
  );
}