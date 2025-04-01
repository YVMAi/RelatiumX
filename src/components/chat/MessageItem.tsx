
import { useState } from 'react';
import { formatDate } from '@/utils/format';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Edit, Trash2, Check, X, Clock, CheckCheck } from 'lucide-react';
import { MentionInput } from './MentionInput';
import { AttachmentItem } from './AttachmentItem';
import { Profile } from '@/types/supabase';

type MessageItemProps = {
  id: string;
  message: string;
  user: any;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  messageStatus: string;
  attachments: any[];
  onEdit: (id: string, newMessage: string) => void;
  onDelete: (id: string) => void;
  mentionableUsers: Profile[];
};

export const MessageItem = ({
  id,
  message,
  user,
  createdAt,
  updatedAt,
  isEdited,
  messageStatus,
  attachments = [],
  onEdit,
  onDelete,
  mentionableUsers,
}: MessageItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState(message);
  const { user: currentUser } = useAuth();
  const isOwnMessage = currentUser?.id === user?.id;

  // Function to highlight mentions
  const highlightMentions = (text: string) => {
    // Replace @username with styled span
    return text.replace(/@(\w+)/g, (match, username) => {
      const isValidUser = mentionableUsers.some(
        user => user.name.toLowerCase() === username.toLowerCase()
      );
      return isValidUser 
        ? `<span class="font-semibold text-blue-500">${match}</span>` 
        : match;
    });
  };

  const handleSaveEdit = () => {
    if (editedMessage.trim().length === 0) return;
    onEdit(id, editedMessage);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedMessage(message);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  // Render message status icon
  const renderMessageStatus = () => {
    if (isOwnMessage) {
      switch (messageStatus) {
        case 'sent':
          return <Clock className="h-3 w-3 text-muted-foreground" />;
        case 'delivered':
          return <Check className="h-3 w-3 text-muted-foreground" />;
        case 'read':
          return <CheckCheck className="h-3 w-3 text-blue-500" />;
        default:
          return null;
      }
    }
    return null;
  };

  return (
    <div className={`flex gap-3 p-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
          {user?.name?.charAt(0) || '?'}
        </div>
      </div>
      
      <div className={`flex-1 max-w-[80%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{user?.name || 'Unknown'}</span>
            <span className="text-xs text-muted-foreground">
              {formatDate(createdAt)}
              {isEdited && <span className="ml-1">(edited)</span>}
            </span>
          </div>
          
          <div className={`rounded-lg p-3 ${
            isOwnMessage 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted'
          }`}>
            {isEditing ? (
              <div className="space-y-2">
                <MentionInput
                  value={editedMessage}
                  onChange={setEditedMessage}
                  onSubmit={handleSaveEdit}
                  users={mentionableUsers}
                  placeholder="Edit your message..."
                  className="bg-card"
                />
                
                <div className="flex justify-end gap-2 mt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleCancelEdit}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={handleSaveEdit}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div 
                  className="whitespace-pre-wrap break-words"
                  dangerouslySetInnerHTML={{ 
                    __html: highlightMentions(message)
                  }}
                />
                
                {/* Attachments */}
                {attachments && attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {attachments.map(attachment => (
                      <AttachmentItem
                        key={attachment.id}
                        id={attachment.id}
                        filePath={attachment.file_path}
                        fileName={attachment.file_name}
                        fileSize={attachment.file_size}
                        fileType={attachment.file_type}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="mt-1 flex items-center gap-2">
            {renderMessageStatus()}
            
            {isOwnMessage && !isEditing && (
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2" 
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-destructive hover:text-destructive" 
                  onClick={() => onDelete(id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
