// ============================================================
// Task Service – CRUD operations persisted with AsyncStorage
// ============================================================
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Task} from '../types';

/** Returns the per-user storage key */
const tasksKey = (userId: string) => `@todo_tasks_${userId}`;

/** Fetch all tasks for a user */
export const getTasks = async (userId: string): Promise<Task[]> => {
  const raw = await AsyncStorage.getItem(tasksKey(userId));
  return raw ? JSON.parse(raw) : [];
};

/** Persist the full tasks array for a user */
const saveTasks = async (userId: string, tasks: Task[]): Promise<void> => {
  await AsyncStorage.setItem(tasksKey(userId), JSON.stringify(tasks));
};

/** Add a new task */
export const addTask = async (
  userId: string,
  task: Task,
): Promise<Task[]> => {
  const tasks = await getTasks(userId);
  const updated = [task, ...tasks];
  await saveTasks(userId, updated);
  return updated;
};

/** Update an existing task by ID */
export const updateTask = async (
  userId: string,
  updatedTask: Task,
): Promise<Task[]> => {
  const tasks = await getTasks(userId);
  const updated = tasks.map(t => (t.id === updatedTask.id ? updatedTask : t));
  await saveTasks(userId, updated);
  return updated;
};

/** Delete a task by ID */
export const deleteTask = async (
  userId: string,
  taskId: string,
): Promise<Task[]> => {
  const tasks = await getTasks(userId);
  const updated = tasks.filter(t => t.id !== taskId);
  await saveTasks(userId, updated);
  return updated;
};
