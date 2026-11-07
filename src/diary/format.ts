import type { DStrings } from './i18n';
import { addDays, parseYmd } from './model';

/** "Today", "Yesterday", or "3 Nov" (with the year when it isn't this year). */
export function dayLabel(date: string, today: string, s: DStrings): string {
  if (date === today) return s.today;
  if (date === addDays(today, -1)) return s.yesterday;
  const d = parseYmd(date);
  const base = `${d.getDate()} ${s.months[d.getMonth()]}`;
  return d.getFullYear() === parseYmd(today).getFullYear() ? base : `${base} ${d.getFullYear()}`;
}
