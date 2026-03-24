// ============================================================
// Auth Service – simulated authentication using AsyncStorage.
// Replace these functions with real Firebase / API calls.
// ============================================================
import AsyncStorage from '@react-native-async-storage/async-storage';
import {User, AuthCredentials} from '../types';
import {v4 as uuidv4} from 'uuid';

const USERS_KEY = '@todo_users';
const SESSION_KEY = '@todo_session';

interface StoredUser extends User {
  password: string;
}

/** Retrieve all stored users */
const getUsers = async (): Promise<StoredUser[]> => {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
};

/** Persist the updated user list */
const saveUsers = async (users: StoredUser[]): Promise<void> => {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
};

/** Register a new user – throws if email already exists */
export const registerUser = async (
  credentials: AuthCredentials,
): Promise<User> => {
  const users = await getUsers();
  const exists = users.find(
    u => u.email.toLowerCase() === credentials.email.toLowerCase(),
  );
  if (exists) throw new Error('An account with this email already exists.');

  const newUser: StoredUser = {
    id: uuidv4(),
    email: credentials.email,
    name: credentials.name ?? credentials.email.split('@')[0],
    password: credentials.password, // NOTE: hash in a real app
  };

  await saveUsers([...users, newUser]);
  const {password: _, ...publicUser} = newUser;
  return publicUser;
};

/** Log in – throws on invalid credentials */
export const loginUser = async (
  credentials: AuthCredentials,
): Promise<User> => {
  const users = await getUsers();
  const match = users.find(
    u =>
      u.email.toLowerCase() === credentials.email.toLowerCase() &&
      u.password === credentials.password,
  );
  if (!match) throw new Error('Invalid email or password.');
  const {password: _, ...publicUser} = match;
  return publicUser;
};

/** Persist the logged-in user to AsyncStorage */
export const saveSession = async (user: User): Promise<void> => {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
};

/** Retrieve a persisted session */
export const getSession = async (): Promise<User | null> => {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
};

/** Clear the persisted session (logout) */
export const clearSession = async (): Promise<void> => {
  await AsyncStorage.removeItem(SESSION_KEY);
};
