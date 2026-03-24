const formatter = new Intl.DateTimeFormat(undefined, {
  year: '2-digit',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'UTC',
});

/**
 * Formats a YYYY-MM-DD date string using the user's locale (e.g. MM/DD/YY or DD/MM/YY).
 * Returns the original value if it can't be parsed.
 */
export function formatDate(dateStr) {
  if (!dateStr) return dateStr;
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return dateStr;
  // Parse as UTC to avoid timezone-shifting the date
  return formatter.format(new Date(Date.UTC(+year, +month - 1, +day)));
}
