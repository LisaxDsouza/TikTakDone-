// ============================================================
// App-wide constants: colors, theme tokens, categories
// ============================================================

const SHARED_COLORS = {
  primary: '#7C3AED',
  primaryLight: '#A78BFA',
  primaryDark: '#5B21B6',
  secondary: '#06B6D4',
  secondaryLight: '#67E8F9',
  priorityHigh: '#EF4444',
  priorityMedium: '#F59E0B',
  priorityLow: '#10B981',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#06B6D4',
  white: '#FFFFFF',
  transparent: 'transparent',
};

export const THEMES = {
  dark: {
    ...SHARED_COLORS,
    bgDark: '#0F0E17',
    bgCard: '#1A1A2E',
    bgInput: '#16213E',
    bgCardAlt: '#1F1D36',
    textPrimary: '#F8F7FF',
    textSecondary: '#A0AEC0',
    textMuted: '#718096',
    border: '#2D3748',
    overlay: 'rgba(0,0,0,0.8)',
  },
  light: {
    ...SHARED_COLORS,
    bgDark: '#F4F7FF',
    bgCard: '#FFFFFF',
    bgInput: '#E2E8F0',
    bgCardAlt: '#EDF2F7',
    textPrimary: '#1A202C',
    textSecondary: '#4A5568',
    textMuted: '#718096',
    border: '#CBD5E0',
    overlay: 'rgba(0,0,0,0.4)',
  },
};

// Legacy support for initially built components (defaults to dark)
export const COLORS = THEMES.dark;

export const TASK_CATEGORIES = [
  'Personal',
  'Work',
  'Shopping',
  'Health',
  'Finance',
  'Study',
  'Other',
] as const;

export const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
} as const;
