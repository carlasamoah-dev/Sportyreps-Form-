import { fetchSubmissions } from './api.js';
import { state } from './state.js';
import { renderTable } from './render.js';
import { renderSummary } from './summary.js';
import { setupGlobalListeners } from './events.js';
import { getSession } from './auth.js';

export async function loadDataAndRender() {
  try {
    const data = await fetchSubmissions();
    state.submissions = data;
    state.filteredSubmissions = data;
    renderTable();
    renderSummary();
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
