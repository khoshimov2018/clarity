import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { GripVertical, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTaskStore } from '@/store/taskStore';
import type { Task } from '@shared/types';
import { cn } from '@/lib/utils';
interface TaskCardProps {
  task: Task;
}
export function TaskCard({ task }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  });
  const updateTask = useTaskStore(s => s.updateTask);
  const deleteTask = useTaskStore(s => s.deleteTask);
  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };
  const handleToggleCompleted = () => {
    updateTask(task.id, { completed: !task.completed });
  };
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTask(task.id);
  };
  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      className={cn(
        'relative',
        isDragging && 'opacity-50 z-50'
      )}
    >
      <Card className="group/card bg-card/80 backdrop-blur-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 ease-in-out">
        <CardContent className="p-3 flex items-center gap-3">
          <div {...attributes} {...listeners} className="cursor-grab touch-none p-2 text-muted-foreground hover:text-foreground transition-colors">
            <GripVertical className="h-5 w-5" />
          </div>
          <Checkbox
            id={`task-${task.id}`}
            checked={task.completed}
            onCheckedChange={handleToggleCompleted}
            className="rounded-full"
          />
          <label
            htmlFor={`task-${task.id}`}
            className={cn(
              'flex-1 text-sm font-medium cursor-pointer',
              task.completed && 'line-through text-muted-foreground'
            )}
          >
            {task.content}
          </label>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 text-destructive/80" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}