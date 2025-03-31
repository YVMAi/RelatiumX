import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Send, ChevronDown, PaperclipIcon } from 'lucide-react';
import { MessageItem } from './MessageItem';
import { MentionInput } from './MentionInput';
import { 
  fetchLeadMessages, 
  sendMessage, 
  updateMessage, 
  deleteMessage, 
  subscribeToLeadMessages,
  fetchMentionableUsers,
  parseMessageForMentions,
  addMentions
} from '@/services/chatService';
import { Profile } from '@/types/supabase';

interface ChatPanelProps {
  leadId: number;
  leadName: string;
}

export const ChatPanel = ({ leadId, leadName }: ChatPanelProps) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [mentionableUsers, setMentionableUsers] = useState<Profile[]>([]);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      setIsLoading(true);
      try {
        const data = await fetchLeadMessages(leadId);
        setMessages(data || []);
      } catch (error) {
        console.error('Error loading messages:', error);
        toast({
          title: 'Error',
          description: 'Failed to load messages',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
        scrollToBottom();
      }
    };

    const loadMentionableUsers = async () => {
      try {
        const users = await fetchMentionableUsers();
        if (users) {
          setMentionableUsers(users);
        }
      } catch (error) {
        console.error('Error loading mentionable users:', error);
      }
    };

    loadMessages();
    loadMentionableUsers();
  }, [leadId, toast]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!leadId) return;

    const handleInsert = (payload: any) => {
      const newMessage = payload.new;
      
      // Add the new message to the messages list
      setMessages(prev => {
        // Check if message already exists to prevent duplicates
        if (prev.some(msg => msg.id === newMessage.id)) {
          return prev;
        }
        
        const updatedMessages = [...prev, newMessage];
        const isAtBottom = isScrolledToBottom();
        
        if (!isAtBottom) {
          setHasNewMessages(true);
        } else {
          setTimeout(scrollToBottom, 100);
        }
        
        return updatedMessages;
      });
    };

    const handleUpdate = (payload: any) => {
      const updatedMessage = payload.new;
      setMessages(prev => 
        prev.map(msg => msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg)
      );
    };

    const handleDelete = (payload: any) => {
      const deletedMessage = payload.old;
      setMessages(prev => prev.filter(msg => msg.id !== deletedMessage.id));
    };

    // Subscribe to changes
    const subscription = subscribeToLeadMessages(
      leadId,
      handleInsert,
      handleUpdate,
      handleDelete
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [leadId]);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setHasNewMessages(false);
    }
  };

  // Check if scrolled to bottom
  const isScrolledToBottom = () => {
    if (!scrollAreaRef.current) return true;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
    const scrollBottom = scrollTop + clientHeight;
    
    // Consider "at bottom" if within 100px of actual bottom
    return scrollBottom >= scrollHeight - 100;
  };

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user?.id || isSending) return;
    
    setIsSending(true);
    
    try {
      // Extract mentions
      const mentionedUserIds = parseMessageForMentions(newMessage, mentionableUsers);
      
      // Send the message
      const sentMessage = await sendMessage({
        lead_id: leadId,
        user_id: user.id,
        message: newMessage.trim(),
        has_attachments: false
      });
      
      // Add mentions if any
      if (mentionedUserIds.length > 0 && sentMessage) {
        await addMentions(sentMessage.id, mentionedUserIds);
      }
      
      // Clear input
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
    }
  };

  // Handle editing a message
  const handleEditMessage = async (id: string, newText: string) => {
    try {
      await updateMessage(id, newText);
    } catch (error) {
      console.error('Error updating message:', error);
      toast({
        title: 'Error',
        description: 'Failed to update message',
        variant: 'destructive'
      });
    }
  };

  // Handle deleting a message
  const handleDeleteMessage = async (id: string) => {
    try {
      await deleteMessage(id);
      toast({
        title: 'Message deleted',
        description: 'The message has been removed',
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-md overflow-hidden">
      <div className="p-3 border-b bg-muted/30">
        <h3 className="text-lg font-semibold">Chat - {leadName}</h3>
        <p className="text-sm text-muted-foreground">
          Discuss this lead with your team
        </p>
      </div>
      
      <div className="relative flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef as any}>
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex items-center justify-center p-4">
              <div className="text-center text-muted-foreground">
                <p>No messages yet</p>
                <p className="text-sm">Be the first to start the conversation</p>
              </div>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {messages.map(msg => (
                <MessageItem
                  key={msg.id}
                  id={msg.id}
                  message={msg.message}
                  user={msg.profiles}
                  createdAt={msg.created_at}
                  updatedAt={msg.updated_at}
                  isEdited={msg.is_edited}
                  onEdit={handleEditMessage}
                  onDelete={handleDeleteMessage}
                  mentionableUsers={mentionableUsers}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
        
        {hasNewMessages && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center shadow-md"
            onClick={scrollToBottom}
          >
            <ChevronDown className="h-4 w-4 mr-1" />
            New messages
          </Button>
        )}
      </div>
      
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <MentionInput
            value={newMessage}
            onChange={setNewMessage}
            onSubmit={handleSendMessage}
            users={mentionableUsers}
            className="flex-1"
            disabled={!user}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending || !user}
          >
            {isSending ? (
              <div className="h-4 w-4 border-2 border-t-transparent border-primary-foreground rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        {!user && (
          <div className="mt-2 text-sm text-muted-foreground">
            You need to be logged in to send messages
          </div>
        )}
      </div>
    </div>
  );
};
