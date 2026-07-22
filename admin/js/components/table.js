import { state } from '../state.js';
import { openPreview } from './previewModal.js';

export function initTable() {
  const searchInput = document.getElementById("search-input");
  
  searchInput.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    state.filteredSubmissions = state.submissions.filter(sub => {
      const email = sub["talent-contact_email"] || "";
      const name = (sub["talent-contact_firstname"] || "") + " " + (sub["talent-contact_lastname"] || "");
      return email.toLowerCase().includes(term) || name.toLowerCase().includes(term);
    });
    renderTable();
  });

  // Attach global event listener for file links (event delegation)
  document.getElementById("grid-body").addEventListener("click", (e) => {
    if (e.target.classList.contains("file-link")) {
      const url = e.target.getAttribute("data-url");
      const type = e.target.getAttribute("data-type");
      openPreview(url, type);
    }
  });
}

export function renderTable() {
  const thead = document.getElementById("grid-head");
  const tbody = document.getElementById("grid-body");
  document.getElementById("response-count").textContent = state.filteredSubmissions.length;

  const visibleCols = state.columns.filter(c => c.visible);

  // Render Header
  thead.innerHTML = `<tr>${visibleCols.map(c => `<th>${c.label}</th>`).join("")}</tr>`;

  // Render Body
  tbody.innerHTML = state.filteredSubmissions.map(sub => {
    return `<tr>
      ${visibleCols.map(col => `<td>${getCellContent(col.id, sub)}</td>`).join("")}
    </tr>`;
  }).join("");
}

function getCellContent(colId, sub) {
  switch (colId) {
    case "email":
      return sub["talent-contact_email"] || sub["rep-contact_rep_email"] || "N/A";
    case "cv":
      if (!sub["cv-upload_url"]) return "No CV";
      return `<span class="file-link" data-url="${sub["cv-upload_url"]}" data-type="pdf">View CV</span>`;
    case "photos":
      if (!sub["photo-portrait_url"]) return "No Photos";
      return `<span class="file-link" data-url="${sub["photo-portrait_url"]}" data-type="image">Portrait</span>, 
              <span class="file-link" data-url="${sub["photo-front_url"]}" data-type="image">Front</span>, 
              <span class="file-link" data-url="${sub["photo-rear_url"]}" data-type="image">Rear</span>`;
    default:
      return sub[colId] || "N/A";
  }
}
