import { fetchSubmissions } from './api.js';
import { state } from './state.js';
import { initLogin } from './components/login.js';
import { initTable, renderTable } from './components/table.js';
import { initColumnSettings } from './components/columnSettings.js';
import { renderSummary } from './components/summary.js';
import { initPreviewModal } from './components/previewModal.js';

async function bootstrap() {
  initLogin();
  initColumnSettings();
  initTable();
  initPreviewModal();

  // Handle Tab Switching
  const tabs = document.querySelectorAll(".tab-btn");
  const views = document.querySelectorAll(".view-panel");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      // Deactivate all
      tabs.forEach(t => t.classList.remove("active"));
      views.forEach(v => v.classList.remove("active", "hidden")); // remove active, will add hidden
      views.forEach(v => v.classList.add("hidden"));

      // Activate clicked
      tab.classList.add("active");
      document.getElementById(tab.getAttribute("data-target")).classList.remove("hidden");
      document.getElementById(tab.getAttribute("data-target")).classList.add("active");
    });
  });

  // Fetch data
  try {
    const data = await fetchSubmissions();
    state.submissions = data;
    state.filteredSubmissions = data;
    
    // Initial renders
    renderTable();
    renderSummary();
  } catch (error) {
    console.error("Failed to load submissions:", error);
  }
}

document.addEventListener("DOMContentLoaded", bootstrap);
