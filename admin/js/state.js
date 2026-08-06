import { COLUMNS } from './constants.js';

/**
 * Meta columns are always-present derived values (response time, response
 * type), not branched questions. They are never subject to emptiness-based
 * auto-hide — e.g. "response_type" has no backing data field (it is rendered
 * statically as "Completed"), so a literal emptiness check would hide it
 * forever.
 */
const META_COLUMN_IDS = ['created_at', 'response_type'];

/**
 * Cards the admin has hidden on the summary page.
 *
 * Keyed by a slug of the question title rather than its position, so inserting
 * a new question later does not silently unhide one card and hide another.
 *
 * Unlike column visibility, which is session-only, this is written to
 * localStorage: hiding a card is a statement about what you never want to see,
 * not about this sitting.
 */
const HIDDEN_CARDS_KEY = 'sr.admin.hiddenSummaryCards';

export const cardKey = (title) => String(title)
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const loadHiddenCards = () => {
  try {
    const raw = localStorage.getItem(HIDDEN_CARDS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch (_) {
    return new Set();   // corrupt or unavailable storage should not break the page
  }
};

export function saveHiddenCards() {
  try {
    localStorage.setItem(HIDDEN_CARDS_KEY, JSON.stringify([...state.hiddenSummaryCards]));
  } catch (_) {
    /* private browsing, quota, or storage disabled: the hide still works for this session */
  }
}

export const state = {
  // key -> hidden. Titles are kept alongside so the restore control can name
  // what it is bringing back without re-rendering every card first.
  hiddenSummaryCards: loadHiddenCards(),
  hiddenSummaryTitles: new Map(),
  submissions: [],
  filteredSubmissions: [],
  // `visible`     → manual hide flag (admin choice, persisted across the session)
  // `systemHidden` → auto-hide flag (driven by emptiness, recomputed each load)
  columns: COLUMNS.map(c => ({ ...c, visible: c.defaultVisible, systemHidden: false })),
  isLoginActive: true,
  // Archived submissions are a separate view, never mixed into the active list:
  // seeing them interleaved would make archiving look like it had not worked.
  viewingArchived: false,
  activeFilters: [] // Array of { id: string, column: string, condition: string, value: string }
};

/**
 * Recompute the system auto-hide flag for every column from the current
 * dataset. A question column is auto-hidden when NO record holds a value for
 * it (its branching-logic path has not been reached yet). Runs against the
 * entire data store, so a column with answers on a later page is never wrongly
 * hidden.
 *
 * Display-only: reads state.submissions and writes ONLY the `systemHidden`
 * flag. It never reads or modifies the manual `visible` flag, and it is
 * derived fresh (never persisted) so it self-corrects the moment the first
 * entry for a column arrives.
 */
export function recomputeAutoHide() {
  state.columns.forEach(col => {
    if (META_COLUMN_IDS.includes(col.id)) {
      col.systemHidden = false;
      return;
    }
    const hasEntry = state.submissions.some(row => {
      const val = row[col.id];
      return val !== undefined && val !== null && val !== '' && val !== '–';
    });
    col.systemHidden = !hasEntry;
  });
}
