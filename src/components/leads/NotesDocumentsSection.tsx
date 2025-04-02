
import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Upload, FileUp, Trash2, Calendar, File } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface NotesDocumentsSectionProps {
  leadId: number;
}

type NoteType = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
};

type DocumentType = {
  id: string;
  name: string;
  size: string;
  type: string;
  createdAt: Date;
};

export function NotesDocumentsSection({ leadId }: NotesDocumentsSectionProps) {
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { toast } = useToast();
  
  const addNote = () => {
    if (!newNote.title || !newNote.content) {
      toast({
        title: "Missing information",
        description: "Please provide both title and content for the note",
        variant: "destructive"
      });
      return;
    }
    
    const note: NoteType = {
      id: `note-${Date.now()}`,
      title: newNote.title,
      content: newNote.content,
      createdAt: new Date()
    };
    
    setNotes([...notes, note]);
    setNewNote({ title: '', content: '' });
    
    toast({
      title: "Note added",
      description: "The note has been added successfully"
    });
  };
  
  const removeNote = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
    toast({
      title: "Note removed",
      description: "The note has been removed successfully"
    });
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "File size should be less than 10MB",
        variant: "destructive"
      });
      return;
    }
    
    // Format size
    const formatFileSize = (size: number) => {
      if (size < 1024) return `${size} B`;
      if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    };
    
    const document: DocumentType = {
      id: `doc-${Date.now()}`,
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type,
      createdAt: new Date()
    };
    
    setDocuments([...documents, document]);
    setIsUploadOpen(false);
    
    toast({
      title: "Document uploaded",
      description: "The document has been uploaded successfully"
    });
  };
  
  const removeDocument = (docId: string) => {
    setDocuments(documents.filter(doc => doc.id !== docId));
    toast({
      title: "Document removed",
      description: "The document has been removed successfully"
    });
  };
  
  const getFileIcon = (type: string) => {
    if (type.includes('image')) return '🖼️';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('sheet')) return '📊';
    if (type.includes('zip') || type.includes('compressed')) return '🗜️';
    return '📁';
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Notes & Documents</CardTitle>
          <CardDescription>
            Keep track of important notes and documents
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Note</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title" 
                    value={newNote.title}
                    onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                    placeholder="Note title" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea 
                    id="content" 
                    value={newNote.content}
                    onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                    placeholder="Note content" 
                    rows={5} 
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={addNote}>Save Note</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="border-2 border-dashed rounded-md p-6 text-center">
                  <FileUp className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag and drop your file here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supported formats: PDF, Word, Excel, Images (max 10MB)
                  </p>
                  <Input
                    type="file"
                    className="hidden"
                    id="file-upload"
                    onChange={handleFileUpload}
                  />
                  <Button variant="outline" className="mt-4" onClick={() => document.getElementById('file-upload')?.click()}>
                    Browse Files
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Notes section */}
          <div>
            <h3 className="text-sm font-medium mb-3">Notes</h3>
            {notes.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground border rounded-md">
                No notes yet. Add a note to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map(note => (
                  <div key={note.id} className="border rounded-md p-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{note.title}</h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeNote(note.id)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                    <p className="text-sm mt-2 whitespace-pre-line">{note.content}</p>
                    <div className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(note.createdAt, 'PP')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Documents section */}
          <div>
            <h3 className="text-sm font-medium mb-3">Documents</h3>
            {documents.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground border rounded-md">
                No documents yet. Upload a document to get started.
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map(doc => (
                  <div key={doc.id} className="border rounded-md p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-lg">
                        {getFileIcon(doc.type)}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{doc.name}</div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>{doc.size}</span>
                          <span>•</span>
                          <span>{format(doc.createdAt, 'PP')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <File className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeDocument(doc.id)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
