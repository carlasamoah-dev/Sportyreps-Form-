/**
 * Minimal RFC 4180 CSV reader/writer.
 *
 * The Typeform export contains quoted fields with embedded newlines and commas,
 * so a naive split(',') corrupts rows. This parser handles both.
 */

const parseCsv = (text) => {
  // Strip UTF-8 BOM if present (Typeform exports include one)
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') { inQuotes = true; }
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\r') { /* ignore, handled by \n */ }
    else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else { field += ch; }
  }

  // Trailing field / row with no final newline
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }

  return rows.filter(r => r.length > 1 || (r[0] || '').trim() !== '');
};

const escapeField = (v) => {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const toCsv = (rows) => rows.map(r => r.map(escapeField).join(',')).join('\n') + '\n';

module.exports = { parseCsv, toCsv };
