import { useEffect, useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import { Plus } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { CategoryColumn } from '@/components/CategoryColumn';
import { TaskCard } from '@/components/TaskCard';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from '@/components/ui/sonner';
import type { Task } from '@shared/types';
export function HomePage() {
  const fetchData = useTaskStore((s) => s.fetchData);
  const tasks = useTaskStore((s) => s.tasks);
  const categories = useTaskStore((s) => s.categories);
  const isLoading = useTaskStore((s) => s.isLoading);
  const addTask = useTaskStore((s) => s.addTask);
  const addCategory = useTaskStore((s) => s.addCategory);
  const setTasks = useTaskStore((s) => s.setTasks);
  const reorderTasks = useTaskStore((s) => s.reorderTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [newTaskContent, setNewTaskContent] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const tasksByCategoryId = useMemo(() => {
    return categories.reduce((acc, category) => {
      acc[category.id] = tasks
        .filter((task) => task.categoryId === category.id)
        .sort((a, b) => a.order - b.order);
      return acc;
    }, {} as Record<string, Task[]>);
  }, [tasks, categories]);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );
  const handleAddTask = () => {
    if (newTaskContent.trim() && categories.length > 0) {
      addTask(newTaskContent.trim(), categories[0].id);
      setNewTaskContent('');
    }
  };
  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim());
      setNewCategoryName('');
    }
  };
  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === 'Task') {
      setActiveTask(event.active.data.current.task);
    }
  }
  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;
    const isActiveATask = active.data.current?.type === 'Task';
    const isOverATask = over.data.current?.type === 'Task';
    if (!isActiveATask) return;
    // This function provides instant visual feedback while dragging.
    // The final reordering logic is in onDragEnd.
    setTasks(currentTasks => {
      const activeIndex = currentTasks.findIndex(t => t.id === activeId);
      const overIndex = currentTasks.findIndex(t => t.id === overId);
      const activeTask = currentTasks[activeIndex];
      if (isOverATask) {
        // Dragging a task over another task
        if (activeTask.categoryId !== currentTasks[overIndex].categoryId) {
          // Change category and move to the position of the task being hovered over
          const newTasks = [...currentTasks];
          newTasks[activeIndex] = { ...activeTask, categoryId: currentTasks[overIndex].categoryId };
          return arrayMove(newTasks, activeIndex, overIndex);
        }
        // Just reorder within the same category
        return arrayMove(currentTasks, activeIndex, overIndex);
      }
      const isOverACategory = over.data.current?.type === 'Category';
      if (isOverACategory) {
        // Dragging a task over a category column
        if (activeTask.categoryId !== overId) {
          const newTasks = [...currentTasks];
          newTasks[activeIndex] = { ...activeTask, categoryId: overId };
          return newTasks;
        }
      }
      return currentTasks;
    });
  }
  function onDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;
    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;
    // Use the current state from the store for final calculation
    const finalTasks = useTaskStore.getState().tasks;
    const tasksToUpdate: Pick<Task, 'id' | 'order' | 'categoryId'>[] = [];
    // Re-index all tasks based on their visual order in the UI
    categories.forEach(category => {
      const tasksInCategory = finalTasks
        .filter(t => t.categoryId === category.id)
        .sort((a, b) => a.order - b.order); // Sort by last known order
      tasksInCategory.forEach((task, index) => {
        if (task.order !== index || task.categoryId !== category.id) {
          tasksToUpdate.push({ id: task.id, order: index, categoryId: category.id });
        }
      });
    });
    if (tasksToUpdate.length > 0) {
      reorderTasks(tasksToUpdate.map(t => ({...tasks.find(original => original.id === t.id)!, ...t})));
    }
  }
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <header className="p-4 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-8">
            <h1 className="text-2xl font-bold text-primary font-display">Clarity</h1>
            <div className="flex-1 flex items-center gap-2 max-w-md">
              <Input
                placeholder="Add a new task..."
                value={newTaskContent}
                onChange={(e) => setNewTaskContent(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              />
              <Button onClick={handleAddTask} disabled={!newTaskContent.trim()}>
                <Plus className="h-4 w-4 mr-2" /> Add Task
              </Button>
            </div>
            <div className="flex items-center gap-2">
               <Input
                placeholder="New category name..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              />
              <Button onClick={handleAddCategory} variant="outline" disabled={!newCategoryName.trim()}>
                <Plus className="h-4 w-4 mr-2" /> Add Category
              </Button>
            </div>
            <ThemeToggle className="relative top-0 right-0" />
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <DndContext
            sensors={sensors}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
            collisionDetection={closestCorners}
          >
            <div className="flex gap-4 h-full pb-4">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="w-80 flex-shrink-0">
                    <Skeleton className="h-12 w-full mb-4" />
                    <div className="space-y-2">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  </div>
                ))
              ) : (
                categories.map((category) => (
                  <CategoryColumn
                    key={category.id}
                    category={category}
                    tasks={tasksByCategoryId[category.id] || []}
                  />
                ))
              )}
            </div>
            {createPortal(
              <DragOverlay>
                {activeTask ? <TaskCard task={activeTask} /> : null}
              </DragOverlay>,
              document.body
            )}
          </DndContext>
        </div>
      </main>
      <Toaster richColors />
    </div>
  );
}