import { isBefore, isAfter, parseISO } from 'date-fns';
import israeliHolidays from '../data/israeliHolidays';

/**
 * Return holidays whose date range overlaps with [rangeStart, rangeEnd].
 */
export function getHolidaysInRange(rangeStart, rangeEnd) {
  return israeliHolidays.filter(h => {
    const hStart = parseISO(h.startDate);
    const hEnd = parseISO(h.endDate);
    // overlaps if holiday starts before range ends AND holiday ends after range starts
    return !isAfter(hStart, rangeEnd) && !isBefore(hEnd, rangeStart);
  });
}

/**
 * Return inline style + Tailwind-friendly color tokens per category.
 *
 *  major    → violet   (Rosh Hashana, Yom Kippur, Pesach …)
 *  memorial → gray     (Yom HaShoah, Yom HaZikaron …)
 *  minor    → light purple (Hanukkah, Purim, Tu BiShvat …)
 */
export function getHolidayStyle(category) {
  switch (category) {
    case 'major':
      return {
        bg: 'rgba(139, 92, 246, 0.18)',   // violet-500 @ 18%
        border: 'rgba(139, 92, 246, 0.35)',
        text: 'text-violet-700',
        dot: 'bg-violet-500',
      };
    case 'memorial':
      return {
        bg: 'rgba(107, 114, 128, 0.18)',   // gray-500 @ 18%
        border: 'rgba(107, 114, 128, 0.35)',
        text: 'text-gray-600',
        dot: 'bg-gray-500',
      };
    case 'minor':
    default:
      return {
        bg: 'rgba(168, 85, 247, 0.12)',    // purple-500 @ 12%
        border: 'rgba(168, 85, 247, 0.25)',
        text: 'text-purple-600',
        dot: 'bg-purple-400',
      };
  }
}
