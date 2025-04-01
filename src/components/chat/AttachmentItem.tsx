
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  FileIcon, 
  ImageIcon, 
  FileTextIcon, 
  FileSpreadsheetIcon, 
  PresentationIcon,
  Download,
  ExternalLink
} from 'lucide-react';
import { downloadAttachment } from '@/services/chatService';
import { useToast } from '@/hooks/use-toast';

interface AttachmentProps {
  id: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

export const AttachmentItem = ({
  id,
  filePath,
  fileName,
  fileSize,
  fileType
}: AttachmentProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();
  
  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const url = await downloadAttachment(filePath);
      
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Download started',
        description: `Downloading ${fileName}`,
      });
    } catch (error) {
      console.error('Error downloading attachment:', error);
      toast({
        title: 'Download failed',
        description: 'Could not download the file',
        variant: 'destructive'
      });
    } finally {
      setIsDownloading(false);
    }
  };
  
  // Format file size in KB, MB, etc.
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  // Determine icon based on file type
  const getFileIcon = () => {
    if (fileType.startsWith('image/')) return <ImageIcon className="h-5 w-5" />;
    else if (fileType.includes('pdf')) return <FileTextIcon className="h-5 w-5" />;
    else if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType.includes('csv')) 
      return <FileSpreadsheetIcon className="h-5 w-5" />;
    else if (fileType.includes('presentation') || fileType.includes('powerpoint')) 
      return <PresentationIcon className="h-5 w-5" />;
    else return <FileIcon className="h-5 w-5" />;
  };
  
  // Check if it's an image that can be previewed
  const isPreviewableImage = fileType.startsWith('image/') && 
    (fileType.includes('jpeg') || fileType.includes('jpg') || 
     fileType.includes('png') || fileType.includes('gif') || 
     fileType.includes('webp'));
  
  return (
    <div className="flex items-center gap-3 p-2 rounded-md border bg-muted/30">
      <div className="flex-shrink-0 w-10 h-10 rounded flex items-center justify-center bg-muted">
        {getFileIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{fileName}</div>
        <div className="text-xs text-muted-foreground">{formatFileSize(fileSize)}</div>
      </div>
      
      <div className="flex-shrink-0">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <div className="h-4 w-4 border-2 border-t-transparent border-primary-foreground rounded-full animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </Button>
        
        {isPreviewableImage && (
          <Button
            variant="ghost"
            size="icon"
            onClick={async () => {
              const url = await downloadAttachment(filePath);
              window.open(url, '_blank');
            }}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
