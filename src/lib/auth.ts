import { supabase } from './db';
import { User } from '../types';

const USE_LOCAL_DB = import.meta.env.VITE_USE_LOCAL_DB === 'true';
const sessionKey = 'rentalms-session';
const userKey = 'rentalms:users';

export function getSessionUser(): User | null {
  if (!USE_LOCAL_DB) {
    // For Supabase, we'd typically use their auth session
    // For now, we'll still use localStorage for session management
    const data = localStorage.getItem(sessionKey);
    return data ? JSON.parse(data) : null;
  }

  const data = localStorage.getItem(sessionKey);
  return data ? JSON.parse(data) : null;
}

export function saveSessionUser(user: User) {
  localStorage.setItem(sessionKey, JSON.stringify(user));
}

export function clearSessionUser() {
  localStorage.removeItem(sessionKey);
}

export async function findUserByEmail(email: string): Promise<User | null> {
  if (!USE_LOCAL_DB) {
    // For Supabase, query the users table
    const users = await supabase.from<User>('users').eq('email', email.toLowerCase()).get();
    return users.length > 0 ? users[0] : null;
  }

  const stored = localStorage.getItem(userKey);
  if (!stored) return null;
  const users: User[] = JSON.parse(stored);
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function createUser(user: User) {
  if (!USE_LOCAL_DB) {
    // For Supabase, insert into users table
    await supabase.from<User>('users').insert([user]);
    return;
  }

  const stored = localStorage.getItem(userKey);
  const users: User[] = stored ? JSON.parse(stored) : [];
  users.push(user);
  localStorage.setItem(userKey, JSON.stringify(users));
}
