import { fetchSubmissions } from './api.js';
import { state, recomputeAutoHide } from './state.js';
// Both renderers exist; summary.js is the older one and is no longer wired in.
// Importing a different renderSummary here from the one events.js calls meant
// the summary was built by one file on load and rebuilt by another on the first
// tab click, so edits to summary.js appeared to do nothing.
import { renderTable, renderSummary } from './render.js';
import { setupGlobalListeners } from './events.js';
import { supabaseClient, getSession } from './auth.js';

export async function loadDataAndRender() {
  try {
    const data = await fetchSubmissions({ archived: state.viewingArchived });
    state.submissions = data;
    state.filteredSubmissions = data;
    // Derive auto-hide fresh from the full dataset on each admin load.
    recomputeAutoHide();
    renderTable();
    renderSummary();
    setupRealtimeSubscription();
  } catch (error) {
    if (error.message === 'SESSION_EXPIRED') {
      // Show login overlay if session is missing/expired
      state.isLoginActive = true;
      document.getElementById("login-overlay")?.classList.add("active");
      document.getElementById("dashboard")?.classList.add("hidden");
    } else {
      console.error("Failed to load submissions:", error);
    }
  }
}

async function bootstrap() {
  setupGlobalListeners();

  const session = await getSession();
  
  if (session) {
    // If we have a valid session, hide login and fetch data immediately
    state.isLoginActive = false;
    document.getElementById("login-overlay")?.classList.remove("active");
    document.getElementById("dashboard")?.classList.remove("hidden");
    
    await loadDataAndRender();
  } else {
    // Show login overlay by default
    state.isLoginActive = true;
    document.getElementById("login-overlay")?.classList.add("active");
    document.getElementById("dashboard")?.classList.add("hidden");
  }
}

document.addEventListener("DOMContentLoaded", bootstrap);

let realtimeChannel = null;

function setupRealtimeSubscription() {
  if (realtimeChannel) return;

  realtimeChannel = supabaseClient
    .channel('public:submissions')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'submissions' }, payload => {
      // Add the new submission to the top of the lists
      state.submissions.unshift(payload.new);
      state.filteredSubmissions.unshift(payload.new);

      // A new entry may fill a previously-empty column, so recompute auto-hide
      // before re-rendering — the column reappears the moment its first entry
      // exists, with no manual action required.
      recomputeAutoHide();

      // Re-render
      renderTable();
      renderSummary();
    })
    .subscribe();
}
