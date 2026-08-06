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

/**
 * Escape a value for interpolation into HTML.
 *
 * Everything rendered in the admin panel is a submitted form answer, so nothing
 * from a record can be trusted as markup. Interpolating raw is how the summary
 * ended up printing fragments of its own HTML: a value containing a quote closed
 * the surrounding attribute early and the remainder rendered as text. The same
 * route would run a script tag in a logged-in admin page.
 */
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
