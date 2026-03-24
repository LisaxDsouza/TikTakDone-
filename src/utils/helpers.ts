// ============================================================
// Utility helpers: date formatting, task sorting algorithm
// ============================================================
import dayjs from 'dayjs';
import {Task, Priority} from '../types';

/** Format ISO string to a human-readable date & time */
export const formatDate = (iso: string): string =>
  dayjs(iso).format('MMM D, YYYY  h:mm A');

/** Format ISO string to a short date */
export const formatShortDate = (iso: string): string =>
  dayjs(iso).format('MMM D, YYYY');

/** Returns how many days remain until deadline (negative = overdue) */
export const daysUntilDeadline = (deadline: string): number =>
  dayjs(deadline).diff(dayjs(), 'day');

/** Returns a colour string based on deadline proximity */
export const deadlineColor = (deadline: string): string => {
  const days = daysUntilDeadline(deadline);
  if (days < 0) return '#EF4444';   // overdue – red
  if (days < 2) return '#F59E0B';   // urgent   – amber
  return '#10B981';                  // safe     – green
};

// Priority weight map used in sorting
const PRIORITY_WEIGHT: Record<Priority, number> = {high: 3, medium: 2, low: 1};

/**
 * Smart sort: combines deadline urgency + priority weight.
 * Score = (priorityWeight * 100) / max(daysLeft, 1)
 * Higher score → appears first.
 */
export const smartSort = (tasks: Task[]): Task[] =>
  [...tasks].sort((a, b) => {
    const daysA = Math.max(daysUntilDeadline(a.deadline), 0.1);
    const daysB = Math.max(daysUntilDeadline(b.deadline), 0.1);
    const scoreA = (PRIORITY_WEIGHT[a.priority] * 100) / daysA;
    const scoreB = (PRIORITY_WEIGHT[b.priority] * 100) / daysB;
    return scoreB - scoreA;
  });

/** Filter tasks by search query (title / description) */
export const filterTasks = (tasks: Task[], query: string): Task[] => {
  if (!query.trim()) return tasks;
  const q = query.toLowerCase();
  return tasks.filter(
    t =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q),
  );
};
