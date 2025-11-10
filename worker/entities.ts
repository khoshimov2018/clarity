import { IndexedEntity } from "./core-utils";
import type { Task, Category } from "@shared/types";
// TASK ENTITY
export class TaskEntity extends IndexedEntity<Task> {
  static readonly entityName = "task";
  static readonly indexName = "tasks";
  static readonly initialState: Task = { id: "", content: "", categoryId: "", completed: false, order: 0 };
}
// CATEGORY ENTITY
const SEED_CATEGORIES: Category[] = [
    { id: "todo", name: "To Do" },
    { id: "in-progress", name: "In Progress" },
    { id: "done", name: "Done" },
];
export class CategoryEntity extends IndexedEntity<Category> {
  static readonly entityName = "category";
  static readonly indexName = "categories";
  static readonly initialState: Category = { id: "", name: "" };
  static seedData = SEED_CATEGORIES;
}