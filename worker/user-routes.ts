import { Hono } from "hono";
import type { Env } from './core-utils';
import { TaskEntity, CategoryEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { Task, Category } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // CATEGORIES
  app.get('/api/categories', async (c) => {
    await CategoryEntity.ensureSeed(c.env);
    const { items } = await CategoryEntity.list(c.env);
    return ok(c, items);
  });
  app.post('/api/categories', async (c) => {
    const { name } = (await c.req.json()) as { name?: string };
    if (!isStr(name)) return bad(c, 'name is required');
    const newCategory: Category = { id: crypto.randomUUID(), name };
    await CategoryEntity.create(c.env, newCategory);
    return ok(c, newCategory);
  });
  // TASKS
  app.get('/api/tasks', async (c) => {
    const { items } = await TaskEntity.list(c.env);
    return ok(c, items);
  });
  app.post('/api/tasks', async (c) => {
    const { content, categoryId, order } = (await c.req.json()) as Partial<Task>;
    if (!isStr(content) || !isStr(categoryId) || typeof order !== 'number') {
      return bad(c, 'content, categoryId, and order are required');
    }
    const newTask: Task = { id: crypto.randomUUID(), content, categoryId, order, completed: false };
    await TaskEntity.create(c.env, newTask);
    return ok(c, newTask);
  });
  app.put('/api/tasks/:id', async (c) => {
    const { id } = c.req.param();
    const taskUpdate = (await c.req.json()) as Partial<Task>;
    const task = new TaskEntity(c.env, id);
    if (!(await task.exists())) return notFound(c, 'Task not found');
    await task.patch(taskUpdate);
    return ok(c, await task.getState());
  });
  app.delete('/api/tasks/:id', async (c) => {
    const { id } = c.req.param();
    const deleted = await TaskEntity.delete(c.env, id);
    if (!deleted) return notFound(c, 'Task not found');
    return ok(c, { id, deleted });
  });
  app.post('/api/tasks/reorder', async (c) => {
    const { tasks } = (await c.req.json()) as { tasks: Pick<Task, 'id' | 'order' | 'categoryId'>[] };
    if (!Array.isArray(tasks)) return bad(c, 'tasks array is required');
    const updatedTasks = await Promise.all(
      tasks.map(async (taskUpdate) => {
        const task = new TaskEntity(c.env, taskUpdate.id);
        if (await task.exists()) {
          await task.patch({ order: taskUpdate.order, categoryId: taskUpdate.categoryId });
          return task.getState();
        }
        return null;
      })
    );
    return ok(c, updatedTasks.filter(Boolean));
  });
}