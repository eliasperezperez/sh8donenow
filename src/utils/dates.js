import { format, isToday, isYesterday, startOfDay, differenceInCalendarDays } from 'date-fns';
import { es } from 'date-fns/locale';

export function todayKey() {
  return format(new Date(), 'yyyy-MM-dd');
}

export function formatDateLabel(dateStr) {
  const d = new Date(dateStr);
  if (isToday(d))     return 'HOY';
  if (isYesterday(d)) return 'AYER';
  return format(d, "d 'DE' MMMM", { locale: es }).toUpperCase();
}

export function formatWeekDay(dateStr) {
  return format(new Date(dateStr), 'EEEE', { locale: es }).toUpperCase();
}

export function getDayOfWeek() {
  return new Date().getDay(); // 0=Sun, 1=Mon...
}

export function daysBetween(dateStrA, dateStrB) {
  return differenceInCalendarDays(startOfDay(new Date(dateStrB)), startOfDay(new Date(dateStrA)));
}

export function shouldRecurToday(mission) {
  if (!mission.recurrent) return false;
  const dow = getDayOfWeek();
  return mission.days?.includes(dow) ?? false;
}

export function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(format(d, 'yyyy-MM-dd'));
  }
  return days;
}
