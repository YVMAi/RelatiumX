
import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, PlusCircle, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Task } from '@/types';

interface TaskSectionProps {
  leadId: number;
}

export function TaskSection({ leadId }: TaskSectionProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();
  
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    dueDate: new Date(),
    completed: false,
  });
  
  // For demo purposes, let's just use local state without API calls
  // In a real application, you would fetch tasks from the backend
  
  const addTask = () => {
    if (!newTask.title) {
      toast({
        title: "Task title required",
        description: "Please enter a title for this task",
        variant: "destructive"
      });
      return;
    }
    
    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      description: newTask.description || '',
      dueDate: newTask.dueDate || new Date(),
      completed: false,
      assignedTo: undefined
    };
    
    setTasks([...tasks, task]);
    setNewTask({
      title: '',
      description: '',
      dueDate: new Date(),
      completed: false,
    });
    
    toast({
      title: "Task added",
      description: "The task has been added successfully"
    });
    
    setShowAddForm(false);
  };
  
  const removeTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    toast({
      title: "Task removed",
      description: "The task has been removed successfully"
    });
  };
  
  const toggleTaskCompletion = (taskId: string) => {
    setTasks(
      tasks.map(task => 
        task.id === taskId 
          ? { ...task, completed: !task.completed } 
          : task
      )
    );
    
    const task = tasks.find(t => t.id === taskId);
    toast({
      title: task?.completed ? "Task marked as incomplete" : "Task marked as complete",
      description: `"${task?.title}" has been updated`
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Tasks</CardTitle>
          <CardDescription>
            Manage tasks related to this lead
          </CardDescription>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {showAddForm && (
            <div className="border rounded-md p-4 space-y-3">
              <h4 className="font-medium">New Task</h4>
              
              <div className="space-y-2">
                <Input
                  value={newTask.title || ''}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="Task title"
                />
              </div>
              
              <div className="space-y-2">
                <Textarea
                  value={newTask.description || ''}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  placeholder="Task description"
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newTask.dueDate ? (
                        format(new Date(newTask.dueDate), 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newTask.dueDate as Date}
                      onSelect={(date) => setNewTask({...newTask, dueDate: date})}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setNewTask({
                      title: '',
                      description: '',
                      dueDate: new Date(),
                      completed: false,
                    });
                    setShowAddForm(false);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={addTask}>
                  Add Task
                </Button>
              </div>
            </div>
          )}
          
          {tasks.length === 0 && !showAddForm ? (
            <div className="text-center py-8 text-muted-foreground">
              No tasks yet. Add a task to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map(task => (
                <div 
                  key={task.id} 
                  className={`border rounded-md p-3 ${
                    task.completed ? 'bg-muted/50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTaskCompletion(task.id)}
                        className="mt-1"
                      />
                      <div className={task.completed ? 'line-through text-muted-foreground' : ''}>
                        <h4 className="font-medium">{task.title}</h4>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-1 mt-2 text-xs">
                          <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                          {format(new Date(task.dueDate), 'PPP')}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTask(task.id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
