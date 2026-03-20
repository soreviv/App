import { format, parseISO, differenceInDays, addWeeks, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd MMM yyyy', { locale: es });
};

export const formatDateShort = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd/MM', { locale: es });
};

export const getTodayString = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

export const getWeekNumber = (startDate: string | Date): number => {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const today = new Date();
  const daysDiff = differenceInDays(today, start);
  return Math.floor(daysDiff / 7) + 1;
};

export const getProgressPercentage = (completedChapters: number[], totalChapters: number = 12): number => {
  return Math.round((completedChapters.length / totalChapters) * 100);
};

export const isChapterUnlocked = (chapterId: number, completedChapters: number[]): boolean => {
  if (chapterId === 1) return true;
  return completedChapters.includes(chapterId - 1);
};

export const getDistressLevel = (score: number): { label: string; color: string } => {
  if (score <= 7) return { label: 'Leve', color: '#4CAF50' };
  if (score <= 14) return { label: 'Moderado', color: '#FFC107' };
  if (score <= 21) return { label: 'Severo', color: '#FF9800' };
  return { label: 'Muy Severo', color: '#F44336' };
};

export const calculateProgressReduction = (initial: number, current: number): number => {
  if (initial === 0) return 0;
  return Math.round(((initial - current) / initial) * 100);
};

export const COLORS = {
  primary: '#2E7D9B',
  primaryLight: '#4A9CB8',
  primaryDark: '#1A5F7A',
  secondary: '#5BA590',
  secondaryLight: '#7CBAA8',
  background: '#F5F8FA',
  surface: '#FFFFFF',
  text: '#2C3E50',
  textSecondary: '#607D8B',
  textLight: '#90A4AE',
  border: '#E0E7EC',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  accent: '#6B8FA3',
};
