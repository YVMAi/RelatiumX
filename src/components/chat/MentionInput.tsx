
import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Profile } from '@/types/supabase';

type MentionInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  users: Profile[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export function MentionInput({
  value,
  onChange,
  onSubmit,
  users,
  placeholder = 'Type a message...',
  className = '',
  disabled = false,
}: MentionInputProps) {
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Find mentions
  const findMentionAtCursor = (text: string, position: number) => {
    const beforeCursor = text.substring(0, position);
    const atIndex = beforeCursor.lastIndexOf('@');
    
    if (atIndex !== -1 && (atIndex === 0 || beforeCursor[atIndex - 1] === ' ')) {
      const searchText = beforeCursor.substring(atIndex + 1);
      return { atIndex, searchText };
    }
    
    return null;
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const newPosition = e.target.selectionStart || 0;
    onChange(newValue);
    setCursorPosition(newPosition);
    
    // Handle mention search
    const mention = findMentionAtCursor(newValue, newPosition);
    if (mention) {
      setMentionSearch(mention.searchText);
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(mentionSearch.toLowerCase())
  ).slice(0, 5);

  // Insert mention
  const insertMention = (user: Profile) => {
    if (!textareaRef.current) return;
    
    const mention = findMentionAtCursor(value, cursorPosition);
    if (!mention) return;
    
    const beforeMention = value.substring(0, mention.atIndex);
    const afterMention = value.substring(cursorPosition);
    const newValue = `${beforeMention}@${user.name} ${afterMention}`;
    
    onChange(newValue);
    setShowMentions(false);
    
    // Focus and move cursor to the end of the inserted mention
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = mention.atIndex + user.name.length + 2; // +2 for @ and space
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        setCursorPosition(newCursorPos);
      }
    }, 0);
  };

  // Handle key down for navigation and submission
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (showMentions && filteredUsers.length > 0) {
        insertMention(filteredUsers[0]);
      } else {
        onSubmit();
      }
    } else if (e.key === 'Escape') {
      setShowMentions(false);
    }
  };

  // Close mentions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowMentions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`resize-none min-h-[80px] ${className}`}
        disabled={disabled}
      />
      
      {showMentions && filteredUsers.length > 0 && (
        <div 
          ref={popoverRef}
          className="absolute z-50 mt-1 w-64 bg-background rounded-md border shadow-md"
        >
          <div className="p-1">
            <div className="text-xs text-muted-foreground p-2">
              Suggestions
            </div>
            {filteredUsers.map(user => (
              <div
                key={user.id}
                className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                onClick={() => insertMention(user)}
              >
                <div className="flex-1">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
