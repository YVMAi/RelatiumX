
import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaperclipIcon, Send, Smile, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchLeadMessages, sendMessage, markMessageAsRead as supabaseMarkMessageAsRead } from '@/services/chatService';
import { LeadMessage } from '@/types/supabase';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from 'date-fns';

interface ChatPanelProps {
  leadId: number;
  leadName: string;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ leadId, leadName }) => {
  const [messages, setMessages] = useState<LeadMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('reply');
  const { user } = useAuth();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const messages = await fetchLeadMessages(leadId);
        setMessages(messages as unknown as LeadMessage[]);
        
        // Mark all messages as read
        if (messages.length > 0) {
          messages.forEach(msg => {
            if (msg.user_id !== user?.id) {
              markMessageAsRead(msg.id);
            }
          });
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        setError('Failed to load messages. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (leadId) {
      fetchMessages();
    }
  }, [leadId, user?.id]);

  useEffect(() => {
    // Scroll to the bottom of the chat when messages are updated
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      try {
        setIsLoading(true);
        // Create a new message
        const messageData = {
          lead_id: leadId,
          user_id: user?.id,
          message: newMessage,
        };
        
        const newMessageData = await sendMessage(messageData);

        setMessages(prevMessages => [...prevMessages, newMessageData as unknown as LeadMessage]);
        setNewMessage('');
        
        toast({
          title: "Message sent",
          description: "Your message has been sent successfully."
        });
      } catch (error) {
        console.error('Error sending message:', error);
        setError('Failed to send message. Please try again.');
        toast({
          title: "Error sending message",
          description: "There was an error sending your message. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      await supabaseMarkMessageAsRead(messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const formatMessageTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: false });
    } catch (e) {
      return 'Unknown time';
    }
  };

  if (isLoading && messages.length === 0) {
    return <div className="text-center py-10">Loading messages...</div>;
  }

  if (error && messages.length === 0) {
    return <div className="text-center text-red-500 py-10">Error: {error}</div>;
  }

  // Group messages by date and sender
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.created_at).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    
    const lastGroup = groups[date][groups[date].length - 1];
    
    // Check if we should add to the last group or create a new one
    if (lastGroup && lastGroup.user_id === message.user_id) {
      lastGroup.messages.push(message);
    } else {
      groups[date].push({
        user_id: message.user_id,
        profile: message.profiles,
        messages: [message]
      });
    }
    
    return groups;
  }, {} as Record<string, Array<{user_id: string, profile: any, messages: LeadMessage[]}>>) ;

  return (
    <div className="flex flex-col h-[650px] rounded-lg border bg-background">
      {/* Chat Header */}
      <div className="bg-muted/30 px-4 py-3 border-b">
        <h3 className="text-lg font-semibold">Chat - {leadName}</h3>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-grow py-4" viewportRef={chatContainerRef}>
        <div className="px-4 space-y-6">
          {Object.entries(groupedMessages).map(([date, groups], dateIndex) => (
            <div key={dateIndex} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t"></span>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-background px-2 text-muted-foreground">
                    {date}
                  </span>
                </div>
              </div>
              
              {groups.map((group, groupIndex) => {
                const isCurrentUser = group.user_id === user?.id;
                return (
                  <div 
                    key={`${date}-${groupIndex}`} 
                    className={`flex flex-col gap-2 ${isCurrentUser ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {!isCurrentUser && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback>
                            {group.profile?.name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <span className="text-sm font-medium">
                        {isCurrentUser ? 'You' : group.profile?.name || 'Unknown'}
                      </span>
                    </div>
                    
                    {group.messages.map((message, msgIndex) => (
                      <div 
                        key={message.id}
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          isCurrentUser 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs opacity-70">
                            {formatMessageTimestamp(message.created_at)}
                          </span>
                          {isCurrentUser && (
                            <span className="text-xs opacity-70">
                              <Check className="h-3 w-3 inline-block" />
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Chat Input */}
      <div className="p-4 border-t">
        <Tabs defaultValue="reply" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="reply">Reply</TabsTrigger>
            <TabsTrigger value="note">Private Note</TabsTrigger>
          </TabsList>
          
          <TabsContent value="reply" className="space-y-4">
            <div className="relative">
              <Input
                className="pr-32 py-6 resize-none"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <Button variant="ghost" size="icon" type="button">
                  <Smile className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" type="button">
                  <PaperclipIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleSendMessage} disabled={isLoading}>
                <Send className="mr-2 h-4 w-4" />
                Send
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="note" className="space-y-4">
            <div className="relative">
              <Input
                className="pr-32 py-6 resize-none"
                placeholder="Add a private note (only visible to team members)..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <Button variant="ghost" size="icon" type="button">
                  <Smile className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" type="button">
                  <PaperclipIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleSendMessage} disabled={isLoading}>
                <Send className="mr-2 h-4 w-4" />
                Save Note
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export { ChatPanel };
