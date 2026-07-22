import { state } from '../state.js';
import { renderTable } from './table.js';

export function initColumnSettings() {
  const btn = document.getElementById("column-settings-btn");
  const popover = document.getElementById("column-popover");
  const closeBtn = document.getElementById("close-popover");
  const applyBtn = document.getElementById("save-columns-btn");
  const listContainer = document.getElementById("column-list");

  const renderList = () => {
    listContainer.innerHTML = state.columns.map((col, index) => {
      if (col.locked) return ""; // Hide locked columns from toggle list
      return `
        <label class="column-toggle">
          <input type="checkbox" data-index="${index}" ${col.visible ? "checked" : ""}>
          <span>${col.label}</span>
        </label>
      `;
    }).join("");
  };

  btn.addEventListener("click", () => {
    renderList();
    popover.classList.remove("hidden");
  });

  closeBtn.addEventListener("click", () => popover.classList.add("hidden"));

  applyBtn.addEventListener("click", () => {
    const checkboxes = listContainer.querySelectorAll("input[type='checkbox']");
    checkboxes.forEach(cb => {
      const idx = parseInt(cb.getAttribute("data-index"));
      state.columns[idx].visible = cb.checked;
    });
    
    popover.classList.add("hidden");
    renderTable(); // Re-render the grid with new visible columns
  });
}
