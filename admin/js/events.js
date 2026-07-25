import { state } from './state.js';
import { renderTable, renderColumnList, renderDrawer } from './render.js';
import { COLUMNS } from './constants.js';
import { isUrl } from './utils.js';
import { signIn, signOut } from './auth.js';
import { loadDataAndRender } from './main.js';

export function setupGlobalListeners() {
  // Login Logic
  const loginBtn = document.getElementById("login-btn");
  const loginOverlay = document.getElementById("login-overlay");
  const dashboard = document.getElementById("dashboard");
  const emailInput = document.getElementById("admin-email");
  const passwordInput = document.getElementById("admin-password");
  const loginError = document.getElementById("login-error");

  loginBtn?.addEventListener("click", async () => {
    loginBtn.textContent = "Logging in...";
    loginBtn.disabled = true;
    
    const { session, error } = await signIn(emailInput.value, passwordInput.value);
    
    loginBtn.textContent = "Login";
    loginBtn.disabled = false;

    if (error) {
      loginError.textContent = error.message;
    } else if (session) {
      state.isLoginActive = false;
      loginOverlay.classList.remove("active");
      dashboard.classList.remove("hidden");
      loginError.textContent = "";
      
      // Fetch and render now that we have a valid session
      await loadDataAndRender();
    }
  });

  // Logout Logic
  document.getElementById("logout-btn")?.addEventListener("click", async () => {
    await signOut();
    
    state.isLoginActive = true;
    loginOverlay.classList.add("active");
    dashboard.classList.add("hidden");
    passwordInput.value = "";
    loginError.textContent = "";
  });

  // Tab Navigation
  const tabs = document.querySelectorAll(".sub-nav .tab-btn");
  const views = document.querySelectorAll(".view-panel");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      views.forEach(v => v.classList.add("hidden"));
      views.forEach(v => v.classList.remove("active"));

      tab.classList.add("active");
      const target = document.getElementById(tab.getAttribute("data-target"));
      if (target) {
        target.classList.remove("hidden");
        target.classList.add("active");
      }
    });
  });

  // Filter State
  let currentSearch = "";
  let currentTimeFilter = "all"; // 'all', '7days', '30days'

  const applyFilters = () => {
    let filtered = state.submissions;

    // 1. Time Filter
    if (currentTimeFilter !== "all") {
      const now = new Date();
      const cutoff = new Date();
      if (currentTimeFilter === "7days") cutoff.setDate(now.getDate() - 7);
      if (currentTimeFilter === "30days") cutoff.setDate(now.getDate() - 30);
      
      filtered = filtered.filter(row => {
        if (!row.created_at) return false;
        const created = new Date(row.created_at);
        return created >= cutoff;
      });
    }

    // 2. Dynamic Column Filters
    if (state.activeFilters && state.activeFilters.length > 0) {
      state.activeFilters.forEach(filter => {
        filtered = filtered.filter(row => {
          let val = row[filter.column];
          if (val === undefined || val === null) val = '';
          val = String(val).trim();
          
          if (filter.condition === 'empty') return val === '' || val === '–';
          if (filter.condition === 'not_empty') return val !== '' && val !== '–';
          
          if (filter.condition === 'any_of' || filter.condition === 'contains') {
            if (!filter.value) return true;
            return val.toLowerCase().includes(filter.value.toLowerCase());
          }
          if (filter.condition === 'none_of' || filter.condition === 'not_contains') {
            if (!filter.value) return true;
            return !val.toLowerCase().includes(filter.value.toLowerCase());
          }
          if (filter.condition === 'is') {
            if (!filter.value) return true;
            return val.toLowerCase() === filter.value.toLowerCase();
          }
          if (filter.condition === 'is_not') {
            if (!filter.value) return true;
            return val.toLowerCase() !== filter.value.toLowerCase();
          }
          return true;
        });
      });
    }

    // 3. Search Query
    if (currentSearch) {
      const q = currentSearch.toLowerCase();
      filtered = filtered.filter(row => {
        return Object.values(row).some(v => String(v) && String(v).toLowerCase().includes(q));
      });
    }

    state.filteredSubmissions = filtered;
    renderTable();
  };

  // Search Logic
  const searchInput = document.getElementById("search-input");
  searchInput?.addEventListener("input", (e) => {
    currentSearch = e.target.value;
    applyFilters();
  });

  // Time Filter Button (cycles through options)
  const timeBtn = document.getElementById("time-filter-btn");
  const timeLabel = document.getElementById("time-filter-label");
  timeBtn?.addEventListener("click", () => {
    if (currentTimeFilter === "all") {
      currentTimeFilter = "7days";
      timeLabel.textContent = "Last 7 days";
    } else if (currentTimeFilter === "7days") {
      currentTimeFilter = "30days";
      timeLabel.textContent = "Last 30 days";
    } else {
      currentTimeFilter = "all";
      timeLabel.textContent = "All time";
    }
    applyFilters();
  });

  // Dynamic Filter Popover Logic
  const filtersBtn = document.getElementById("filters-btn");
  const filterPopover = document.getElementById("filter-popover");
  const closeFilterBtn = document.getElementById("close-filter-btn");
  const filtersContainer = document.getElementById("filters-container");
  const addFilterBtn = document.getElementById("add-filter-btn");
  const applyFilterBtn = document.getElementById("filter-apply-btn");
  const cancelFilterBtn = document.getElementById("filter-cancel-btn");
  const clearFilterBtn = document.getElementById("filter-clear-btn");

  let editingFilters = [];

  const getConds = (type) => {
    if (type === 'choice') {
      return [
        {v: 'any_of', l: 'Is any of'},
        {v: 'none_of', l: 'Is none of'},
        {v: 'not_empty', l: 'Is not empty'},
        {v: 'empty', l: 'Is empty'}
      ];
    } else {
      return [
        {v: 'contains', l: 'Contains'},
        {v: 'not_contains', l: 'Does not contain'},
        {v: 'is', l: 'Is'},
        {v: 'is_not', l: 'Is not'},
        {v: 'not_empty', l: 'Is not empty'},
        {v: 'empty', l: 'Is empty'}
      ];
    }
  };

  const renderFiltersList = () => {
    if (!filtersContainer) return;
    filtersContainer.innerHTML = '';
    
    editingFilters.forEach((filter, index) => {
      let col = state.columns.find(c => c.id === filter.column);
      if (!col) {
        col = state.columns[1];
        filter.column = col.id;
      }
      const isChoice = col.filterType === 'choice';
      
      const rowDiv = document.createElement("div");
      rowDiv.style.display = "flex";
      rowDiv.style.alignItems = "center";
      rowDiv.style.gap = "8px";
      
      // Column Select
      const colSelect = document.createElement("select");
      colSelect.className = "filter-select";
      colSelect.style.width = "30%";
      state.columns.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = c.label;
        colSelect.appendChild(opt);
      });
      colSelect.value = filter.column;
      
      // Condition Select
      const condSelect = document.createElement("select");
      condSelect.className = "filter-select";
      condSelect.style.width = "30%";
      
      const conds = getConds(col.filterType);
      conds.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.v;
        opt.textContent = c.l;
        condSelect.appendChild(opt);
      });
      if (!conds.some(c => c.v === filter.condition)) {
         filter.condition = conds[0].v;
      }
      condSelect.value = filter.condition;
      
      // Value input/select
      let valInput;
      if (filter.condition !== 'empty' && filter.condition !== 'not_empty') {
          if (isChoice) {
            valInput = document.createElement("select");
            valInput.className = "filter-select";
            valInput.style.flex = "1";
            
            const emptyOpt = document.createElement("option");
            emptyOpt.value = "";
            emptyOpt.textContent = "Select a value...";
            valInput.appendChild(emptyOpt);
            
            if (col.choices && col.choices.length > 0) {
              col.choices.forEach(val => {
                const opt = document.createElement("option");
                opt.value = val;
                opt.textContent = val;
                valInput.appendChild(opt);
              });
            } else {
              const uniqueVals = new Set();
              state.submissions.forEach(row => {
                let v = row[col.id];
                if (v !== undefined && v !== null && v !== '') {
                  String(v).split(',').forEach(vv => {
                    if (vv.trim() && vv.trim() !== '–') uniqueVals.add(vv.trim());
                  });
                }
              });
              Array.from(uniqueVals).sort().forEach(val => {
                const opt = document.createElement("option");
                opt.value = val;
                opt.textContent = val;
                valInput.appendChild(opt);
              });
            }
            valInput.value = filter.value || '';
          } else {
            valInput = document.createElement("input");
            valInput.type = "text";
            valInput.className = "filter-select";
            valInput.placeholder = "Enter value...";
            valInput.style.flex = "1";
            valInput.value = filter.value || '';
          }
      } else {
          valInput = document.createElement("div");
          valInput.style.flex = "1"; // placeholder
      }

      // Remove button
      const removeBtn = document.createElement("button");
      removeBtn.className = "btn-text";
      removeBtn.style.padding = "4px";
      removeBtn.style.color = "var(--text-muted)";
      removeBtn.style.fontSize = "16px";
      removeBtn.innerHTML = "×";
      removeBtn.onclick = (e) => {
        e.stopPropagation();
        editingFilters.splice(index, 1);
        renderFiltersList();
      };
      
      // Event Listeners
      colSelect.addEventListener("change", (e) => {
        filter.column = e.target.value;
        const newCol = state.columns.find(c => c.id === filter.column);
        filter.condition = newCol.filterType === 'choice' ? 'any_of' : 'contains';
        filter.value = '';
        renderFiltersList();
      });
      
      condSelect.addEventListener("change", (e) => {
        filter.condition = e.target.value;
        renderFiltersList();
      });
      
      if (valInput.tagName === "SELECT" || valInput.tagName === "INPUT") {
          valInput.addEventListener("input", (e) => {
            filter.value = e.target.value;
          });
      }
      
      rowDiv.appendChild(colSelect);
      rowDiv.appendChild(condSelect);
      rowDiv.appendChild(valInput);
      rowDiv.appendChild(removeBtn);
      
      filtersContainer.appendChild(rowDiv);
    });
  };

  filtersBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    
    // Copy active filters into editing state
    editingFilters = state.activeFilters ? state.activeFilters.map(f => ({...f})) : [];
    if (editingFilters.length === 0) {
      editingFilters.push({ column: state.columns[1].id, condition: 'any_of', value: '' });
    }
    
    renderFiltersList();
    filterPopover.classList.toggle("hidden");
  });

  addFilterBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    editingFilters.push({ column: state.columns[1].id, condition: 'any_of', value: '' });
    renderFiltersList();
  });

  filterPopover?.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  document.addEventListener("click", (e) => {
    if (filterPopover && !filterPopover.classList.contains("hidden") && !filterPopover.contains(e.target) && e.target !== filtersBtn && !filtersBtn.contains(e.target)) {
      filterPopover.classList.add("hidden");
    }
  });

  closeFilterBtn?.addEventListener("click", () => filterPopover.classList.add("hidden"));
  cancelFilterBtn?.addEventListener("click", () => filterPopover.classList.add("hidden"));

  applyFilterBtn?.addEventListener("click", () => {
    // Filter out invalid ones (empty value for condition that requires it)
    state.activeFilters = editingFilters.filter(f => {
      if (f.condition !== 'empty' && f.condition !== 'not_empty' && !f.value) return false;
      return true;
    });

    if (state.activeFilters.length === 0) {
        filtersBtn.style.color = "var(--text-muted)";
        filtersBtn.style.borderColor = "var(--border-dark)";
        filtersBtn.style.background = "white";
    } else {
        filtersBtn.style.color = "var(--primary)";
        filtersBtn.style.borderColor = "var(--primary-border)";
        filtersBtn.style.background = "var(--primary-light)";
    }

    applyFilters();
    filterPopover.classList.add("hidden");
  });

  clearFilterBtn?.addEventListener("click", () => {
    state.activeFilters = [];
    editingFilters = [];
    
    filtersBtn.style.color = "var(--text-muted)";
    filtersBtn.style.borderColor = "var(--border-dark)";
    filtersBtn.style.background = "white";

    applyFilters();
    filterPopover.classList.add("hidden");
  });

  // Column Settings Drawer
  const colBtn = document.getElementById("column-settings-btn");
  const colDrawerOverlay = document.getElementById("column-drawer-overlay");
  const colDrawer = document.getElementById("column-drawer");
  const closeColBtn = document.getElementById("close-columns-btn");
  const resetColBtn = document.getElementById("reset-columns-btn");
  const saveColBtn = document.getElementById("save-columns-btn");

  const openColDrawer = () => {
    renderColumnList();
    colDrawerOverlay.classList.remove("hidden");
    colDrawer.classList.remove("hidden");
  };
  const closeColDrawer = () => {
    colDrawerOverlay.classList.add("hidden");
    colDrawer.classList.add("hidden");
  };

  colBtn?.addEventListener("click", openColDrawer);
  closeColBtn?.addEventListener("click", closeColDrawer);
  colDrawerOverlay?.addEventListener("click", closeColDrawer);

  document.getElementById("column-list")?.addEventListener("click", (e) => {
    const toggleBtn = e.target.closest(".toggle-col-btn");
    if (toggleBtn) {
      const colId = toggleBtn.getAttribute("data-id");
      const col = state.columns.find(c => c.id === colId);
      if (col) {
        col.visible = !col.visible;
        renderColumnList();
      }
    }
  });

  resetColBtn?.addEventListener("click", () => {
    state.columns = COLUMNS.map(c => ({ ...c, visible: c.defaultVisible }));
    renderColumnList();
  });

  saveColBtn?.addEventListener("click", () => {
    closeColDrawer();
    renderTable();
  });

  // Data Grid Row Actions
  document.getElementById("grid-body")?.addEventListener("click", (e) => {
    const openBtn = e.target.closest(".open-row-btn");
    if (openBtn) {
      const idx = openBtn.getAttribute("data-index");
      openDetailDrawer(parseInt(idx));
      return;
    }

    const fileBtn = e.target.closest(".file-btn");
    if (fileBtn) {
      const url = fileBtn.getAttribute("data-url");
      openPreviewModal(url);
    }
  });

  // Detail Drawer Logic
  const detailDrawerOverlay = document.getElementById("detail-drawer-overlay");
  const detailDrawer = document.getElementById("detail-drawer");
  const closeDrawerBtn = document.getElementById("close-drawer-btn");

  const openDetailDrawer = (index) => {
    renderDrawer(index);
    detailDrawerOverlay.classList.remove("hidden");
    detailDrawer.classList.remove("hidden");
  };
  const closeDetailDrawer = () => {
    detailDrawerOverlay.classList.add("hidden");
    detailDrawer.classList.add("hidden");
  };

  closeDrawerBtn?.addEventListener("click", closeDetailDrawer);
  detailDrawerOverlay?.addEventListener("click", closeDetailDrawer);

  // File Preview Modal Logic
  const previewModal = document.getElementById("preview-modal");
  const previewBody = document.getElementById("modal-body");
  const closePreviewBtn = document.getElementById("close-modal-btn");

  const openPreviewModal = (url) => {
    if (url.match(/\.(jpeg|jpg|gif|png)$/) != null) {
      previewBody.innerHTML = `<img src="${url}" alt="Preview" />`;
    } else {
      previewBody.innerHTML = `<iframe src="${url}"></iframe>`;
    }
    previewModal.classList.remove("hidden");
  };
  const closePreviewModal = () => {
    previewModal.classList.add("hidden");
    previewBody.innerHTML = '';
  };

  closePreviewBtn?.addEventListener("click", closePreviewModal);
  previewModal?.addEventListener("click", (e) => {
    if (e.target === previewModal) closePreviewModal();
  });
}
