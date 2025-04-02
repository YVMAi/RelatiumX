import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Paperclip, Send, Smile } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchLeadMessages, createLeadMessage, markMessageAsRead as supabaseMarkMessageAsRead } from '@/services/chatService';
import { LeadMessage } from '@/types/supabase';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from "@/components/ui/scroll-area"

interface ChatPanelProps {
  leadId: number;
  leadName: string;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ leadId, leadName }) => {
  const [messages, setMessages] = useState<LeadMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const messages = await fetchLeadMessages(leadId);
        // Handle the type issue by type casting or other appropriate method
        // since we know the structure might have changed
        setMessages(messages as unknown as LeadMessage[]);
        
        // Mark all messages as read
        if (messages.length > 0) {
          messages.forEach(msg => {
            if (msg.user_id !== currentUser?.id) {
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
  }, [leadId, currentUser?.id]);

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
          user_id: currentUser?.id,
          content: newMessage,
        };
        
        const newMessageData = await createLeadMessage(messageData);

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

  if (isLoading) {
    return <div className="text-center">Loading messages...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="flex flex-col h-[500px] rounded-md border">
      {/* Chat Header */}
      <div className="bg-secondary px-4 py-2 border-b">
        <h3 className="text-lg font-semibold">Team Chat - {leadName}</h3>
      </div>

      {/* Chat Messages */}
      <div className="flex-grow overflow-y-auto p-4" ref={chatContainerRef}>
        <ScrollArea className="h-full w-full">
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2 ${msg.user_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
              >
                {msg.user_id !== currentUser?.id && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{msg.profiles?.name ? msg.profiles.name.charAt(0) : '?'}</AvatarFallback>
                  </Avatar>
                )}
                <div className={`rounded-xl p-2 ${msg.user_id === currentUser?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <div className="text-sm">{msg.content}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {msg.profiles?.name || 'Unknown'} - {new Date(msg.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <Input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
          />
          <Button onClick={handleSendMessage} disabled={isLoading}>
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export { ChatPanel };
