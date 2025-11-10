import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TaskCard } from './TaskCard';
import type { Category, Task } from '@shared/types';
import { cn } from '@/lib/utils';
interface CategoryColumnProps {
  category: Category;
  tasks: Task[];
}
export function CategoryColumn({ category, tasks }: CategoryColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: category.id,
    data: {
      type: 'Category',
      category,
    },
  });
  return (
    <div ref={setNodeRef} className="w-80 flex-shrink-0">
      <Card className={cn(
        "h-full bg-muted/50 transition-colors duration-200",
        isOver ? "bg-muted" : ""
      )}>
        <CardHeader className="p-4">
          <CardTitle className="text-lg font-semibold">{category.name}</CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </SortableContext>
        </CardContent>
      </Card>
    </div>
  );
}