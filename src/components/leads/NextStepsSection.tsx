
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Task } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Trash2, Plus, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';

type NextStepsSectionProps = {
  tasks: Task[];
  onChange: (tasks: Task[]) => void;
};

export const NextStepsSection = ({ tasks, onChange }: NextStepsSectionProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    dueDate: new Date(),
    completed: false,
  });
  
  const addTask = () => {
    if (!newTask.title) return;
    
    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      description: newTask.description || '',
      dueDate: newTask.dueDate || new Date(),
      completed: false,
    };
    
    onChange([...tasks, task]);
    setNewTask({
      title: '',
      description: '',
      dueDate: new Date(),
      completed: false,
    });
    setShowAddForm(false);
  };
  
  const removeTask = (taskId: string) => {
    onChange(tasks.filter(task => task.id !== taskId));
  };
  
  const toggleTaskCompletion = (taskId: string) => {
    onChange(
      tasks.map(task => 
        task.id === taskId 
          ? { ...task, completed: !task.completed } 
          : task
      )
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>
              Schedule tasks and set reminders for follow-ups
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Task
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddForm && (
          <div className="border rounded-md p-4 space-y-3">
            <h4 className="font-medium">New Task</h4>
            
            <div className="space-y-2">
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                value={newTask.title || ''}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                placeholder="Task title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                value={newTask.description || ''}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                placeholder="Task description"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="task-due-date">Due Date</Label>
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
          <div className="text-center py-4 text-muted-foreground">
            No tasks scheduled yet. Click "Add Task" to schedule one.
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
      </CardContent>
    </Card>
  );
};
