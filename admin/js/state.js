import { COLUMNS } from './constants.js';

export const state = {
  submissions: [],
  filteredSubmissions: [],
  columns: COLUMNS.map(c => ({ ...c, visible: c.defaultVisible })),
  isLoginActive: true,
  activeFilters: [] // Array of { id: string, column: string, condition: string, value: string }
};
