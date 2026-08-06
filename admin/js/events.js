import { state, recomputeAutoHide, saveHiddenCards } from './state.js';
import { renderTable, renderColumnList, renderDrawer, renderSummary } from './render.js';
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
        
        if (tab.getAttribute("data-target") === "summary-view") {
          renderSummary();
        }
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
    state.columns = COLUMNS.map(c => ({ ...c, visible: c.defaultVisible, systemHidden: false }));
    // Rebuilding the column list drops the derived auto-hide flags, so restore
    // them from the current data (this touches only `systemHidden`).
    recomputeAutoHide();
    renderColumnList();
  });

  saveColBtn?.addEventListener("click", () => {
    closeColDrawer();
    renderTable();
  });

  // Export CSV Logic
  const exportBtn = document.getElementById("export-btn");
  exportBtn?.addEventListener("click", () => {
    if (!state.filteredSubmissions || state.filteredSubmissions.length === 0) {
      alert("No data to export");
      return;
    }

    const cols = state.columns.filter(c => c.visible);
    
    // Header row
    let csv = "Email,";
    csv += cols.map(c => `"${c.label.replace(/"/g, '""')}"`).join(',') + '\n';

    // Data rows
    state.filteredSubmissions.forEach(row => {
      const email = row['talent-contact_email'] || row['rep-contact_rep_email'] || row['talent-info-for-rep_email'] || '';
      let line = `"${email.replace(/"/g, '""')}",`;
      
      line += cols.map(c => {
        let val = row[c.id];
        if (val === undefined || val === null) val = '';
        if (c.id === 'response_type') val = 'Completed';
        val = String(val).replace(/"/g, '""');
        // Handle newlines inside csv fields
        val = val.replace(/\n/g, ' '); 
        return `"${val}"`;
      }).join(',');
      
      csv += line + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sportyreps_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  // Summary View Logic
  const summaryContainer = document.getElementById("summary-container");
  
  summaryContainer?.addEventListener("click", (e) => {
    // Hiding a summary card, and putting it back. Delegated because the summary
    // is re-rendered wholesale on every change.
    const hideBtn = e.target.closest(".card-hide-btn");
    if (hideBtn) {
      state.hiddenSummaryCards.add(hideBtn.getAttribute("data-card-key"));
      saveHiddenCards();
      renderSummary();
      return;
    }

    const restoreBtn = e.target.closest(".summary-restore-btn");
    if (restoreBtn) {
      state.hiddenSummaryCards.delete(restoreBtn.getAttribute("data-card-key"));
      saveHiddenCards();
      renderSummary();
      return;
    }

    if (e.target.closest(".summary-restore-all")) {
      state.hiddenSummaryCards.clear();
      saveHiddenCards();
      renderSummary();
      return;
    }

    const summaryTab = e.target.closest(".summary-tab");
    if (summaryTab) {
      const controls = summaryTab.closest(".card-controls");
      const summaryTabs = controls.querySelector(".summary-tabs");
      
      summaryTabs.querySelectorAll(".summary-tab").forEach(btn => btn.classList.remove("active"));
      summaryTab.classList.add("active");
      
      const tabType = summaryTab.getAttribute("data-tab");
      const bodyContainer = controls.nextElementSibling;
      
      const overviewContainer = bodyContainer.querySelector(".overview-container");
      const trendsContainer = bodyContainer.querySelector(".trends-container");
      const viewToggles = controls.querySelector(".view-toggles");
      
      if (tabType === 'overview') {
        overviewContainer.style.display = "block";
        trendsContainer.style.display = "none";
        if (viewToggles) viewToggles.style.display = "flex";
      } else if (tabType === 'trends') {
        overviewContainer.style.display = "none";
        trendsContainer.style.display = "block";
        if (viewToggles) viewToggles.style.display = "none";
        
        const canvas = trendsContainer.querySelector("canvas");
        if (canvas) {
          const trendDataStr = trendsContainer.getAttribute("data-trend-data");
          if (trendDataStr) {
            const trendData = JSON.parse(decodeURIComponent(trendDataStr));
            
            if (canvas.chartInstance) {
               canvas.chartInstance.destroy();
               canvas.chartInstance = null;
            }

            // Need at least 2 date points to render a meaningful trend
            if (!trendData.dates || trendData.dates.length < 2) {
              canvas.style.display = 'none';
              const emptyMsg = document.createElement('div');
              emptyMsg.className = 'trends-empty';
              emptyMsg.textContent = 'Not enough data to show trends yet. More submissions over multiple days are needed.';
              trendsContainer.appendChild(emptyMsg);
              return;
            }
            canvas.style.display = '';
            
            const isChoice = trendData.type === 'choice';
            const chartDatasets = isChoice 
               ? trendData.datasets.map((ds, i) => ({
                   label: ds.label,
                   data: ds.data,
                   borderColor: `hsl(${i * 65}, 70%, 60%)`,
                   backgroundColor: `hsla(${i * 65}, 70%, 60%, 0.1)`,
                   fill: false,
                   tension: 0.3
                 }))
               : [{
                   label: 'Average',
                   data: trendData.data,
                   borderColor: '#7c3aed',
                   backgroundColor: 'rgba(124, 58, 237, 0.1)',
                   fill: true,
                   tension: 0.4
                 }];

            canvas.chartInstance = new Chart(canvas, {
              type: 'line',
              data: {
                labels: trendData.dates.map(d => new Date(d).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})),
                datasets: chartDatasets
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: isChoice, position: 'top' },
                  tooltip: { enabled: true, mode: 'index', intersect: false }
                },
                scales: {
                  x: { grid: { display: false } },
                  y: { beginAtZero: true }
                },
                interaction: {
                  mode: 'nearest',
                  axis: 'x',
                  intersect: false
                }
              }
            });
          }
        }
      }
    }

    const toggleBtn = e.target.closest(".view-toggle-btn");
    if (toggleBtn) {
      const controls = toggleBtn.closest(".card-controls");
      const togglesContainer = toggleBtn.closest(".view-toggles");
      
      togglesContainer.querySelectorAll(".view-toggle-btn").forEach(btn => btn.classList.remove("active"));
      toggleBtn.classList.add("active");
      
      const viewType = toggleBtn.getAttribute("data-view"); 
      const bodyContainer = controls.nextElementSibling;
      const viewContainer = bodyContainer.querySelector(".overview-container");
      
      if (viewContainer.classList.contains("choice-view-container")) {
        const tableWrap = viewContainer.querySelector(".choice-table-wrap");
        const chartWrap = viewContainer.querySelector(".chart-container");
        const canvas = chartWrap.querySelector("canvas");
        
        if (viewType === 'table') {
          tableWrap.style.display = "block";
          chartWrap.style.display = "none";
        } else {
          tableWrap.style.display = "none";
          chartWrap.style.display = "block";
          
          const chartDataStr = togglesContainer.getAttribute("data-chart-data");
          const chartData = JSON.parse(decodeURIComponent(chartDataStr));
          
          if (canvas.chartInstance) {
            canvas.chartInstance.destroy();
          }
          
          const isHorizontal = viewType === 'hbar';
          
          canvas.chartInstance = new Chart(canvas, {
            type: 'bar',
            data: {
              labels: chartData.labels,
              datasets: [{
                label: 'Responses',
                data: chartData.data,
                backgroundColor: '#d8b4fe',
                hoverBackgroundColor: '#c084fc',
                borderRadius: 4
              }]
            },
            options: {
              indexAxis: isHorizontal ? 'y' : 'x',
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
              },
              scales: {
                x: { grid: { display: false }, border: { display: false }, ticks: { display: !isHorizontal } },
                y: { grid: { display: false }, border: { display: false }, ticks: { display: isHorizontal } }
              },
              animation: {
                onComplete: function() {
                  const ctx = this.ctx;
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'bottom';
                  ctx.fillStyle = '#7c3aed';
                  ctx.font = 'bold 13px Inter, sans-serif';

                  this.data.datasets.forEach(function (dataset, i) {
                    const meta = canvas.chartInstance.getDatasetMeta(i);
                    meta.data.forEach(function (bar, index) {
                      const data = dataset.data[index];
                      if (data > 0) {
                        if (isHorizontal) {
                          ctx.textAlign = 'left';
                          ctx.textBaseline = 'middle';
                          ctx.fillText(data, bar.x + 8, bar.y);
                        } else {
                          ctx.textAlign = 'center';
                          ctx.textBaseline = 'bottom';
                          ctx.fillText(data, bar.x, bar.y - 6);
                        }
                      }
                    });
                  });
                }
              }
            }
          });
        }
      } else if (viewContainer.classList.contains("number-view-container")) {
        const statsWrap = viewContainer.querySelector(".stats-wrap");
        const listWrap = viewContainer.querySelector(".list-wrap");
        
        if (viewType === 'stats') {
          statsWrap.style.display = "block";
          listWrap.style.display = "none";
        } else if (viewType === 'list') {
          statsWrap.style.display = "none";
          listWrap.style.display = "block";
        }
      }
    }
  });

  summaryContainer?.addEventListener("input", (e) => {
    if (e.target.classList.contains("text-search-input")) {
      const targetId = e.target.getAttribute("data-target");
      const listContainer = document.getElementById(targetId);
      const q = e.target.value.toLowerCase();
      
      if (listContainer) {
        let count = 0;
        const items = listContainer.querySelectorAll(".text-list-item");
        items.forEach(item => {
          const val = item.getAttribute("data-val") || "";
          if (val.includes(q)) {
            item.style.display = "flex";
            count++;
          } else {
            item.style.display = "none";
          }
        });
        
        const countDisplay = e.target.closest(".text-search-row").querySelector(".text-results-count");
        if (countDisplay) {
          countDisplay.textContent = count + " results";
        }
      }
    }
  });
}
