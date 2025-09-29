import { formatInTimeZone, utcToZonedTime } from 'date-fns-tz';
import es from 'date-fns/locale/es';

const timeZone = 'America/Lima';

/**
 * Formats a date in the application's standard timezone (America/Lima).
 * @param date The date to format (Date object, timestamp, or ISO string).
 * @param formatString The desired output format string (e.g., 'dd/MM/yyyy HH:mm').
 * @returns The formatted date string.
 */
export const formatInPeru = (date: Date | number | string, formatString: string): string => {
  return formatInTimeZone(date, timeZone, formatString, { locale: es });
};

/**
 * Returns a Date object representing the current time in the America/Lima timezone.
 * The underlying UTC value is the same as `new Date()`, but the local date parts
 * are adjusted for the Peru timezone, making it suitable for date-fns functions.
 * @returns A Date object representing the current time in Peru.
 */
export const getPeruTime = (): Date => {
  return utcToZonedTime(new Date(), timeZone);
};