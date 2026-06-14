import { format, parseISO, isToday, isTomorrow, isYesterday, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, addDays, subDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const formatDate = (date: string | Date, pattern: string = 'yyyy-MM-dd'): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern, { locale: zhCN });
};

export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM-dd HH:mm', { locale: zhCN });
};

export const formatTime = (time: string): string => {
  return time;
};

export const getToday = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

export const getNowTime = (): string => {
  return format(new Date(), 'HH:mm');
};

export const getRelativeDateLabel = (dateStr: string): string => {
  const date = parseISO(dateStr);
  if (isToday(date)) return '今天';
  if (isTomorrow(date)) return '明天';
  if (isYesterday(date)) return '昨天';
  return formatDate(date, 'MM月dd日');
};

export const getDaysFromNow = (dateStr: string): number => {
  return differenceInDays(parseISO(dateStr), new Date());
};

export const getMonthDays = (date: Date): Date[] => {
  return eachDayOfInterval({
    start: startOfMonth(date),
    end: endOfMonth(date),
  });
};

export const getWeekDays = (date: Date): Date[] => {
  return eachDayOfInterval({
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  });
};

export const isTimeOverlap = (
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean => {
  return start1 < end2 && end1 > start2;
};

export const addDaysStr = (dateStr: string, days: number): string => {
  return format(addDays(parseISO(dateStr), days), 'yyyy-MM-dd');
};

export const subDaysStr = (dateStr: string, days: number): string => {
  return format(subDays(parseISO(dateStr), days), 'yyyy-MM-dd');
};

export const getWeekdayName = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'EEEE', { locale: zhCN });
};

export const getShortWeekdayName = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'EEE', { locale: zhCN });
};
