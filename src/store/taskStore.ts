import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { api } from '@/lib/api-client';
import type { Task, Category } from '@shared/types';
import { toast } from 'sonner';
type TaskState = {
  tasks: Task[];
  categories: Category[];
  isLoading: boolean;
};
type TaskActions = {
  fetchData: () => Promise<void>;
  addTask: (content: string, categoryId: string) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  setTasks: (tasks: Task[]) => void;
  reorderTasks: (tasks: Task[]) => Promise<void>;
};
export const useTaskStore = create<TaskState & TaskActions>()(
  immer((set, get) => ({
    tasks: [],
    categories: [],
    isLoading: true,
    fetchData: async () => {
      try {
        set({ isLoading: true });
        const [categories, tasks] = await Promise.all([
          api<Category[]>('/api/categories'),
          api<Task[]>('/api/tasks'),
        ]);
        set({ categories, tasks, isLoading: false });
      } catch (error) {
        toast.error('Failed to load data.');
        console.error(error);
        set({ isLoading: false });
      }
    },
    addTask: async (content, categoryId) => {
      const optimisticId = crypto.randomUUID();
      const tasksInCategory = get().tasks.filter(t => t.categoryId === categoryId);
      const newTask: Task = {
        id: optimisticId,
        content,
        categoryId,
        completed: false,
        order: tasksInCategory.length,
      };
      set((state) => {
        state.tasks.push(newTask);
      });
      try {
        const createdTask = await api<Task>('/api/tasks', {
          method: 'POST',
          body: JSON.stringify({ content, categoryId, order: newTask.order }),
        });
        set((state) => {
          const taskIndex = state.tasks.findIndex((t) => t.id === optimisticId);
          if (taskIndex !== -1) {
            state.tasks[taskIndex] = createdTask;
          }
        });
      } catch (error) {
        toast.error('Failed to add task.');
        set((state) => {
          state.tasks = state.tasks.filter((t) => t.id !== optimisticId);
        });
      }
    },
    updateTask: async (taskId, updates) => {
      const originalTasks = get().tasks;
      const taskIndex = originalTasks.findIndex((t) => t.id === taskId);
      if (taskIndex === -1) return;
      const updatedTask = { ...originalTasks[taskIndex], ...updates };
      set((state) => {
        state.tasks[taskIndex] = updatedTask;
      });
      try {
        await api<Task>(`/api/tasks/${taskId}`, {
          method: 'PUT',
          body: JSON.stringify(updates),
        });
      } catch (error) {
        toast.error('Failed to update task.');
        set({ tasks: originalTasks });
      }
    },
    deleteTask: async (taskId) => {
      const originalTasks = get().tasks;
      set((state) => {
        state.tasks = state.tasks.filter((t) => t.id !== taskId);
      });
      try {
        await api(`/api/tasks/${taskId}`, { method: 'DELETE' });
      } catch (error) {
        toast.error('Failed to delete task.');
        set({ tasks: originalTasks });
      }
    },
    addCategory: async (name) => {
      const optimisticId = crypto.randomUUID();
      const newCategory: Category = { id: optimisticId, name };
      set((state) => {
        state.categories.push(newCategory);
      });
      try {
        const createdCategory = await api<Category>('/api/categories', {
          method: 'POST',
          body: JSON.stringify({ name }),
        });
        set((state) => {
          const catIndex = state.categories.findIndex((c) => c.id === optimisticId);
          if (catIndex !== -1) {
            state.categories[catIndex] = createdCategory;
          }
        });
      } catch (error) {
        toast.error('Failed to add category.');
        set((state) => {
          state.categories = state.categories.filter((c) => c.id !== optimisticId);
        });
      }
    },
    setTasks: (tasks) => {
      set({ tasks });
    },
    reorderTasks: async (tasksToUpdate) => {
        const originalTasks = get().tasks;
        const updatedTaskMap = new Map(tasksToUpdate.map(t => [t.id, t]));
        set(state => {
            state.tasks = state.tasks.map(t => updatedTaskMap.get(t.id) || t);
        });
        try {
            await api('/api/tasks/reorder', {
                method: 'POST',
                body: JSON.stringify({ tasks: tasksToUpdate.map(t => ({ id: t.id, order: t.order, categoryId: t.categoryId })) }),
            });
        } catch (error) {
            toast.error('Failed to save new order.');
            set({ tasks: originalTasks });
        }
    },
  })),
);