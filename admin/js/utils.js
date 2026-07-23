/**
 * Format date string into readable format (e.g., 11 Mar 2024 23:47)
 */
export function formatDate(dateString) {
  if (!dateString) return '–';
  const d = new Date(dateString);
  if (isNaN(d)) return dateString;
  const opts = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  return d.toLocaleDateString('en-GB', opts).replace(',', '');
}

/**
 * Helper to determine if a string is a URL (to render as file link)
 */
export function isUrl(str) {
  return typeof str === 'string' && (str.startsWith('http://') || str.startsWith('https://'));
}
