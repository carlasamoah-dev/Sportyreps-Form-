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
  let currentRoleFilter = "all"; // 'all', 'talent', 'rep'

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

    // 2. Role Filter
    if (currentRoleFilter !== "all") {
      const targetRole = currentRoleFilter === "talent" ? "Talent" : "Representative";
      filtered = filtered.filter(row => row.role === targetRole);
    }

    // 3. Search Query
    if (currentSearch) {
      const q = currentSearch.toLowerCase();
      filtered = filtered.filter(row => {
        return Object.values(row).some(v => String(v).toLowerCase().includes(q));
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

  // Role Filter Button (cycles through options)
  const roleBtn = document.getElementById("role-filter-btn");
  const roleLabel = document.getElementById("role-filter-label");
  roleBtn?.addEventListener("click", () => {
    if (currentRoleFilter === "all") {
      currentRoleFilter = "talent";
      roleLabel.textContent = "Role: Talent";
    } else if (currentRoleFilter === "talent") {
      currentRoleFilter = "rep";
      roleLabel.textContent = "Role: Reps";
    } else {
      currentRoleFilter = "all";
      roleLabel.textContent = "All Roles";
    }
    applyFilters();
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
