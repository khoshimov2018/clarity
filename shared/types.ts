export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
// Clarity Todo App Types
export interface Task {
  id: string;
  content: string;
  categoryId: string;
  completed: boolean;
  order: number;
}
export interface Category {
  id: string;
  name: string;
}