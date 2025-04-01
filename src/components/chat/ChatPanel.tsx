import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Send, ChevronDown, Paperclip, FileImage, X } from 'lucide-react';
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
  addMentions,
  uploadAttachment,
  addAttachment,
  markMessageAsDelivered,
  markMessageAsRead,
  fetchLeadTeamMembers
} from '@/services/chatService';
import { Profile, LeadMessage } from '@/types/supabase';

interface ChatPanelProps {
  leadId: number;
  leadName: string;
}

export const ChatPanel = ({ leadId, leadName }: ChatPanelProps) => {
  const [messages, setMessages] = useState<LeadMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [mentionableUsers, setMentionableUsers] = useState<Profile[]>([]);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [teamMembers, setTeamMembers] = useState<Profile[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const { toast } = useToast();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadMessages = async () => {
      setIsLoading(true);
      try {
        const data = await fetchLeadMessages(leadId);
        setMessages(data || []);
        
        if (data && data.length > 0 && user) {
          data.forEach(msg => {
            if (msg.message_status === 'sent' && msg.user_id !== user.id) {
              markMessageAsDelivered(msg.id);
            }
          });
        }
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
    
    const loadTeamMembers = async () => {
      try {
        const members = await fetchLeadTeamMembers(leadId);
        setTeamMembers(members);
      } catch (error) {
        console.error('Error loading team members:', error);
      }
    };

    loadMessages();
    loadMentionableUsers();
    loadTeamMembers();
  }, [leadId, toast, user]);

  useEffect(() => {
    if (!leadId) return;

    const handleInsert = (payload: any) => {
      const newMessage = payload.new as LeadMessage;
      
      setMessages(prev => {
        if (prev.some(msg => msg.id === newMessage.id)) {
          return prev;
        }
        
        const updatedMessages = [...prev, newMessage];
        const isAtBottom = isScrolledToBottom();
        
        if (user && newMessage.user_id !== user.id) {
          markMessageAsDelivered(newMessage.id);
        }
        
        if (!isAtBottom) {
          setHasNewMessages(true);
        } else {
          setTimeout(scrollToBottom, 100);
          if (user && newMessage.user_id !== user.id) {
            markMessageAsRead(newMessage.id, user.id);
          }
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

    const subscription = subscribeToLeadMessages(
      leadId,
      handleInsert,
      handleUpdate,
      handleDelete
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [leadId, user]);

  useEffect(() => {
    if (!user || !messages.length) return;
    
    const markVisibleMessagesAsRead = () => {
      const unreadMessages = messages.filter(
        msg => msg.user_id !== user.id && msg.message_status !== 'read'
      );
      
      if (unreadMessages.length > 0 && isScrolledToBottom()) {
        unreadMessages.forEach(msg => {
          markMessageAsRead(msg.id, user.id);
        });
      }
    };
    
    markVisibleMessagesAsRead();
    
    const scrollElement = scrollAreaRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', markVisibleMessagesAsRead);
      return () => {
        scrollElement.removeEventListener('scroll', markVisibleMessagesAsRead);
      };
    }
  }, [messages, user]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setHasNewMessages(false);
    }
  };

  const isScrolledToBottom = () => {
    if (!scrollAreaRef.current) return true;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
    const scrollBottom = scrollTop + clientHeight;
    
    return scrollBottom >= scrollHeight - 100;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setUploadingFiles(prev => [...prev, ...newFiles]);
      
      e.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && uploadingFiles.length === 0) || !user?.id || isSending) return;
    
    setIsSending(true);
    
    try {
      const mentionedUserIds = parseMessageForMentions(newMessage, mentionableUsers);
      
      const sentMessage = await sendMessage({
        lead_id: leadId,
        user_id: user.id,
        message: newMessage.trim(),
        has_attachments: uploadingFiles.length > 0
      });
      
      if (mentionedUserIds.length > 0 && sentMessage) {
        await addMentions(sentMessage.id, mentionedUserIds);
      }
      
      if (uploadingFiles.length > 0 && sentMessage) {
        for (let i = 0; i < uploadingFiles.length; i++) {
          const file = uploadingFiles[i];
          const fileKey = `${file.name}-${i}`;
          
          try {
            setUploadProgress(prev => ({ ...prev, [fileKey]: 0 }));
            
            const uploadedFile = await uploadAttachment(file, leadId);
            
            setUploadProgress(prev => ({ ...prev, [fileKey]: 50 }));
            
            await addAttachment(sentMessage.id, {
              file_path: uploadedFile.path,
              file_name: uploadedFile.name,
              file_size: uploadedFile.size,
              file_type: uploadedFile.type,
            });
            
            setUploadProgress(prev => ({ ...prev, [fileKey]: 100 }));
          } catch (error) {
            console.error(`Error uploading file ${file.name}:`, error);
            toast({
              title: 'Upload Failed',
              description: `Failed to upload ${file.name}`,
              variant: 'destructive'
            });
          }
        }
        
        setUploadingFiles([]);
        setUploadProgress({});
      }
      
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
                  isEdited={msg.is_edited || false}
                  messageStatus={msg.message_status}
                  attachments={msg.attachments || []}
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
      
      {uploadingFiles.length > 0 && (
        <div className="p-2 border-t">
          <div className="text-sm font-medium mb-1">Attachments</div>
          <div className="flex flex-wrap gap-2">
            {uploadingFiles.map((file, index) => (
              <div 
                key={`${file.name}-${index}`} 
                className="flex items-center gap-2 p-2 bg-muted rounded-md"
              >
                {file.type.startsWith('image/') ? (
                  <FileImage className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-xs truncate max-w-[150px]">{file.name}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5" 
                  onClick={() => removeFile(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
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
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            multiple
          />
          <Button 
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending || !user}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button 
            onClick={handleSendMessage}
            disabled={((!newMessage.trim() && uploadingFiles.length === 0) || isSending || !user)}
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
