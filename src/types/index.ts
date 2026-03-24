// ============================================================
// Global TypeScript types and interfaces for the TodoApp
// ============================================================

/** Priority levels for tasks */
export type Priority = 'low' | 'medium' | 'high';

/** A single task item */
export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;       // ISO date string
  createdAt: string;      // ISO date string
  priority: Priority;
  category: string;
  isCompleted: boolean;
  isPasswordRecord?: boolean; // New flag for the vault
}

/** Authenticated user model */
export interface User {
  id: string;
  email: string;
  name: string;
}

/** Auth credentials for login/register */
export interface AuthCredentials {
  email: string;
  password: string;
  name?: string;
}

/** React Navigation param lists */
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainStackParamList = {
  Home: undefined;
  Vault: undefined;
  AddTask: { task?: Task, isPassword?: boolean } | undefined;
  TaskDetail: { task: Task };
};
