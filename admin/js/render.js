import { state, saveHiddenCards } from './state.js';
import { SVGS } from './constants.js';
import { formatDate, isUrl, escapeHtml as esc } from './utils.js';

export function renderTable() {
  const head = document.getElementById("grid-head");
  const body = document.getElementById("grid-body");
  const countEl = document.getElementById("response-count");
  
  if (!head || !body) return;

  const data = state.filteredSubmissions;
  if (countEl) countEl.textContent = data.length;

  // A column is shown only when it has at least one entry (not auto-hidden)
  // AND it is not manually hidden. The two hide reasons are independent flags.
  const visibleCols = state.columns.filter(c => c.visible && !c.systemHidden);

  // Render Header
  let headHtml = `<tr>`;
  headHtml += `<th class="sticky-col"><input type="checkbox"></th>`;
  headHtml += `<th class="sticky-col email-col">
                <div class="th-content">
                  <span class="icon-box" style="background:var(--danger-light); color:var(--danger)">${SVGS.email}</span>
                  Email
                </div>
               </th>`;
  
  visibleCols.forEach(col => {
    let svgIcon = SVGS.text;
    let bg = '#f3effc'; // Purple for list/text
    let color = '#7c3aed';

    if (col.type === 'time')   { svgIcon = SVGS.time;   bg = '#e7f6ee'; color = '#12805c'; } // Green calendar
    if (col.type === 'phone')  { svgIcon = SVGS.phone;  bg = 'transparent'; color = '#6b7280'; } // Grey phone (or default text muted)
    if (col.type === 'file')   { svgIcon = SVGS.file;   bg = '#fffbeb'; color = '#f59e0b'; } // Yellow upload
    if (col.type === 'url')    { svgIcon = SVGS.url;    bg = '#e0f2fe'; color = '#0369a1'; }
    if (col.type === 'number') { svgIcon = SVGS.number; bg = '#fef9c3'; color = '#854d0e'; }
    if (col.type === 'email')  { svgIcon = SVGS.email;  bg = '#fde2e4'; color = '#d1495b'; } // Red envelope
    if (col.type === 'boolean') { svgIcon = SVGS.boolean; bg = '#f3f4f6'; color = '#9ca3af'; } // Grey crossed circle
    if (col.type === 'status') { svgIcon = SVGS.check; bg = '#e7f6ee'; color = '#12805c'; }

    headHtml += `<th>
                  <div class="th-content">
                    <span class="icon-box" style="background:${bg}; color:${color}">${svgIcon}</span>
                    ${col.label}
                  </div>
                 </th>`;
  });
  headHtml += `</tr>`;
  head.innerHTML = headHtml;

  // Render Body
  let bodyHtml = ``;
  data.forEach((row, rowIndex) => {
    bodyHtml += `<tr>`;
    bodyHtml += `<td class="sticky-col"><input type="checkbox"></td>`;
    
    // Email Column (Fixed — always visible, sticky)
    const email = row['talent-contact_email'] || row['rep-contact_rep_email'] || row['talent-info-for-rep_email'] || '–';
    bodyHtml += `<td class="sticky-col email-col">
                  <div class="cell-content">
                    <span style="word-break:break-word;">${email}</span>
                    <button class="open-row-btn" data-index="${rowIndex}" title="Open response">
                      <svg width="14" height="14" viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                    </button>
                  </div>
                 </td>`;

    visibleCols.forEach(col => {
      let val = row[col.id];
      if (val === undefined || val === null || val === '') val = '–';

      let cellHtml = `<span>${val}</span>`;
      
      if (col.id === 'response_type') {
        cellHtml = `<span class="status-badge"><span class="dot"></span>Completed</span>`;
      } else if (col.type === 'time') {
        cellHtml = `<span>${formatDate(val)}</span>`;

      } else if (col.id === 'tactical-positions' || col.id === 'special-abilities') {
        if (val !== '–') {
          const chips = val.split(',').map(s => s.trim());
          cellHtml = `<div class="chip-container">` + chips.map(c => `<span class="chip">${c}</span>`).join('') + `</div>`;
        }

      } else if (col.type === 'file') {
        if (isUrl(val)) {
          const filename = decodeURIComponent(val.split('/').pop() || 'Attachment');
          const shown = filename.length > 18 ? `${filename.substring(0, 18)}…` : filename;
          cellHtml = `<button class="file-btn" data-url="${esc(val)}" title="${esc(filename)}">
                        ${SVGS.file} <span>${esc(shown)}</span>
                      </button>`;
        }

      } else if (col.type === 'url') {
        if (val !== '–') {
          cellHtml = `<a href="${val}" target="_blank" class="file-btn" style="text-decoration:none;">
                        ${SVGS.url} <span>View</span>
                      </a>`;
        }

      } else if (col.id === 'role') {
        const roleColor = val === 'Talent' ? 'color:#065f46;background:#d1fae5;' : 'color:#1e40af;background:#dbeafe;';
        cellHtml = `<span class="chip" style="${roleColor}border:none;">${val}</span>`;

      } else if (col.id === 'minor-check' || col.id === 'passport-check' || col.id === 'academy-experience' || col.id === 'signed-pro' || col.id === 'medical-condition' || col.id === 'surgery-check' || col.id === 'criminal-record' || col.id === 'dual-nationality-check' || col.id === 'travel-experience') {
        if (val !== '–') {
          const isYes = val === 'Yes';
          const style = isYes ? 'color:#991b1b;background:#fee2e2;border:none;' : 'color:#374151;background:#f3f4f6;border:none;';
          cellHtml = `<span class="chip" style="${style}">${val}</span>`;
        }
      }

      bodyHtml += `<td>${cellHtml}</td>`;
    });
    bodyHtml += `</tr>`;
  });
  body.innerHTML = bodyHtml;
}

export function renderColumnList() {
  const list = document.getElementById("column-list");
  if (!list) return;

  let html = ``;
  // Every question is always listed here, including those with zero entries.
  state.columns.forEach((col, index) => {
    // Auto-hidden columns (zero entries) get a distinct amber eye-with-slash
    // badge next to the label, kept visually separate from the grey manual
    // hide toggle on the right so the two hide reasons are separable at a
    // glance. The badge reflects `systemHidden`; the toggle reflects `visible`.
    const autoHideBadge = col.systemHidden
      ? `<span class="auto-hide-badge" title="Auto-hidden — no entries yet"><svg width="16" height="16" viewBox="0 0 24 24"><path d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.8 2.8M9.4 5.2A9.4 9.4 0 0 1 12 5c5 0 9 4.5 9 7 0 1-1 2.6-2.6 4M6.3 6.8C4 8.2 3 10 3 12c0 2 4 7 9 7 1.2 0 2.3-.2 3.3-.6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path></svg></span>`
      : ``;

    html += `
      <div class="column-item" draggable="true" data-index="${index}">
        <svg width="16" height="16" viewBox="0 0 24 24" style="color:var(--text-disabled);flex-shrink:0;"><circle cx="9" cy="6" r="1.5" fill="currentColor"></circle><circle cx="15" cy="6" r="1.5" fill="currentColor"></circle><circle cx="9" cy="12" r="1.5" fill="currentColor"></circle><circle cx="15" cy="12" r="1.5" fill="currentColor"></circle><circle cx="9" cy="18" r="1.5" fill="currentColor"></circle><circle cx="15" cy="18" r="1.5" fill="currentColor"></circle></svg>
        <span style="flex:1;font-size:13.5px;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-left:8px;">${col.label}</span>
        ${autoHideBadge}
        <button class="btn-text toggle-col-btn" data-id="${col.id}" style="width:30px;height:30px;padding:0;color:var(--text-muted);">
          ${col.visible ?
            `<svg width="17" height="17" viewBox="0 0 24 24"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"></path><circle cx="12" cy="12" r="2.6" fill="none" stroke="currentColor" stroke-width="1.7"></circle></svg>` :
            `<svg width="17" height="17" viewBox="0 0 24 24"><path d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.8 2.8M9.4 5.2A9.4 9.4 0 0 1 12 5c5 0 9 4.5 9 7 0 1-1 2.6-2.6 4M6.3 6.8C4 8.2 3 10 3 12c0 2 4 7 9 7 1.2 0 2.3-.2 3.3-.6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path></svg>`
          }
        </button>
      </div>
    `;
  });
  list.innerHTML = html;
}

export function renderDrawer(rowIndex) {
  const row = state.filteredSubmissions[rowIndex];
  if (!row) return;

  const drawerBody = document.getElementById("drawer-body");
  const drawerTimestamp = document.getElementById("drawer-timestamp");
  
  if (drawerTimestamp) {
    drawerTimestamp.textContent = formatDate(row.created_at);
  }

  // The archive control acts on whatever the drawer is currently showing, so the
  // drawer is where the identity lives rather than in a variable that can drift
  // out of step with what is on screen.
  const drawer = document.getElementById("detail-drawer");
  if (drawer) drawer.setAttribute("data-row-id", row.id ?? "");

  const archiveBtn = document.getElementById("archive-btn");
  if (archiveBtn) {
    const archived = Boolean(row.deleted_at);
    archiveBtn.textContent = archived ? "Restore" : "Archive";
    archiveBtn.className = archived ? "btn-text drawer-restore" : "btn-text drawer-archive";
    archiveBtn.disabled = !row.id;
    archiveBtn.title = row.id
      ? (archived ? "Put this response back in the list" : "Remove this response from the list, keeping the record and its files")
      : "This response has no id, so it cannot be archived";
  }

  let html = ``;
  
  // Render fields dynamically
  state.columns.forEach(col => {
    let val = row[col.id];
    if (val === undefined || val === null || val === '') val = '–';
    
    if (col.type === 'time') {
      val = formatDate(val);
    } else if (col.type === 'file' && isUrl(val)) {
      val = `<a href="${val}" target="_blank" class="file-btn" style="text-decoration:none;">${SVGS.file} <span>Open Attachment</span></a>`;
    }

    html += `
      <div class="detail-card">
        <div class="detail-card-title">${col.label}</div>
        <div class="detail-card-value">${val}</div>
      </div>
    `;
  });

  drawerBody.innerHTML = html;
}

// ── Summary View Rendering ──────────────────────────────────────────

function timeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} days ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} months ago`;
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} years ago`;
}

function renderChoiceSummary(col, data, values, answeredCount) {
  const counts = {};
  values.forEach(v => {
    String(v).split(',').forEach(val => {
      const trimmed = val.trim();
      if (trimmed) {
         counts[trimmed] = (counts[trimmed] || 0) + 1;
      }
    });
  });

  const labels = col.choices || Object.keys(counts);
  
  let tableHtml = `<table class="choice-table">
    <thead><tr><th>Choices</th><th>Responses</th><th>Percentages</th></tr></thead><tbody>`;
  
  labels.forEach(label => {
    const count = counts[label] || 0;
    const perc = answeredCount > 0 ? ((count / answeredCount) * 100).toFixed(1) : 0;
    tableHtml += `<tr>
      <td>${label}</td>
      <td>${count}</td>
      <td>${perc}%</td>
    </tr>`;
  });
  tableHtml += `</tbody></table>`;

  const chartDataStr = encodeURIComponent(JSON.stringify({
    labels,
    data: labels.map(l => counts[l] || 0)
  }));

  // Trend Aggregation
  const dailyCounts = {};
  data.forEach(row => {
    if (!row.created_at) return;
    const dateStr = row.created_at.split('T')[0];
    if (!dailyCounts[dateStr]) dailyCounts[dateStr] = {};
    
    let val = row[col.id];
    if (val !== undefined && val !== null && val !== '') {
      String(val).split(',').forEach(v => {
        const trimmed = v.trim();
        if (trimmed && labels.includes(trimmed)) {
          dailyCounts[dateStr][trimmed] = (dailyCounts[dateStr][trimmed] || 0) + 1;
        }
      });
    }
  });

  const dates = Object.keys(dailyCounts).sort();
  const trendDatasets = labels.map(label => {
    return {
      label: label,
      data: dates.map(d => dailyCounts[d][label] || 0)
    };
  });
  
  const trendDataStr = encodeURIComponent(JSON.stringify({
    type: 'choice',
    dates: dates,
    datasets: trendDatasets
  }));

  return `
    <div class="card-controls">
      <div class="summary-tabs">
        <button class="summary-tab active" data-tab="overview">Overview</button>
        <button class="summary-tab" data-tab="trends"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l10 10-10 10L2 12z"/></svg> Trends</button>
      </div>
      <div class="view-toggles" data-chart-data="${chartDataStr}">
        <button class="view-toggle-btn active" data-view="table"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg></button>
        <button class="view-toggle-btn" data-view="hbar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h12M4 12h8M4 18h16"/></svg></button>
        <button class="view-toggle-btn" data-view="vbar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 20V4M12 20v-8M18 20v-12"/></svg></button>
      </div>
    </div>
    <div class="summary-body-container">
      <div class="choice-view-container overview-container">
        <div class="choice-table-wrap">
          ${tableHtml}
        </div>
        <div class="chart-container" style="display:none;">
          <canvas></canvas>
        </div>
      </div>
      <div class="trends-container chart-container" style="display:none;" data-trend-data="${trendDataStr}">
        <canvas></canvas>
      </div>
    </div>
  `;
}

function renderNumberSummary(col, data, values) {
  const nums = values.map(v => parseFloat(v)).filter(n => !isNaN(n));
  if (nums.length === 0) return `<div style="padding:20px;color:#6b7280;">No numeric data available.</div>`;
  
  const sum = nums.reduce((a,b) => a + b, 0);
  const mean = (sum / nums.length).toFixed(2);
  
  nums.sort((a,b) => a - b);
  const mid = Math.floor(nums.length / 2);
  const median = nums.length % 2 !== 0 ? nums[mid] : ((nums[mid - 1] + nums[mid]) / 2).toFixed(2);
  
  const min = nums[0];
  const max = nums[nums.length - 1];
  
  const meanNum = parseFloat(mean);
  const variance = nums.reduce((acc, val) => acc + Math.pow(val - meanNum, 2), 0) / nums.length;
  const stdDev = Math.sqrt(variance).toFixed(2);

  const infoSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>`;

  const statsHtml = `
    <div class="numeric-stats-grid">
      <div class="stat-box">
        <div class="stat-value">${mean}</div>
        <div class="stat-label">Mean ${infoSvg}</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${median}</div>
        <div class="stat-label">Median ${infoSvg}</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${min} - ${max}</div>
        <div class="stat-label">Min-Max ${infoSvg}</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${stdDev}</div>
        <div class="stat-label">Standard deviation ${infoSvg}</div>
      </div>
    </div>
  `;

  const textHtml = renderTextSummary(col, data);

  // Trend Aggregation
  const dailySums = {};
  data.forEach(row => {
    if (!row.created_at) return;
    const dateStr = row.created_at.split('T')[0];
    let val = row[col.id];
    const n = parseFloat(val);
    if (!isNaN(n)) {
       if (!dailySums[dateStr]) dailySums[dateStr] = { sum: 0, count: 0 };
       dailySums[dateStr].sum += n;
       dailySums[dateStr].count += 1;
    }
  });

  const dates = Object.keys(dailySums).sort();
  const trendData = dates.map(d => {
    return parseFloat((dailySums[d].sum / dailySums[d].count).toFixed(2));
  });

  const trendDataStr = encodeURIComponent(JSON.stringify({
    type: 'number',
    dates: dates,
    data: trendData
  }));

  return `
    <div class="card-controls">
      <div class="summary-tabs">
        <button class="summary-tab active" data-tab="overview">Overview</button>
        <button class="summary-tab" data-tab="trends"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l10 10-10 10L2 12z"/></svg> Trends</button>
      </div>
      <div class="view-toggles">
        <button class="view-toggle-btn active" data-view="stats"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg></button>
        <button class="view-toggle-btn" data-view="list"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg></button>
      </div>
    </div>
    <div class="summary-body-container">
      <div class="number-view-container overview-container">
        <div class="stats-wrap">
          ${statsHtml}
        </div>
        <div class="list-wrap" style="display:none;">
          ${textHtml}
        </div>
      </div>
      <div class="trends-container chart-container" style="display:none;" data-trend-data="${trendDataStr}">
        <canvas></canvas>
      </div>
    </div>
  `;
}

function renderTextSummary(col, data) {
  let listHtml = `<div class="text-list" id="text-list-${col.id}">`;
  let count = 0;
  
  data.forEach(row => {
    const raw = row[col.id];
    if (raw === undefined || raw === null || raw === '' || raw === '–') return;

    // What is shown and what is searched are different things. Previously the
    // rendered markup was reused as the search key, so for a file link the
    // anchor's own quote closed the data-val attribute and the rest of the tag
    // spilled onto the page.
    let display;
    let searchText;

    if (col.type === 'file' && isUrl(raw)) {
      const firstName = row['talent-contact_firstname'] || row['rep-contact_rep_firstname'] || row['talent-info-for-rep_firstname'] || 'View Attachment';
      display = `<a href="${esc(raw)}" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:none;">${esc(firstName)}</a>`;
      searchText = firstName;
    } else {
      display = esc(raw);
      searchText = String(raw);
    }

    listHtml += `
      <div class="text-list-item" data-val="${esc(searchText.toLowerCase())}">
        <div class="text-list-quote">“</div>
        <div class="text-list-val">${display}</div>
        <div class="text-list-date">${timeAgo(row.created_at)}</div>
      </div>
    `;
    count++;
  });
  listHtml += `</div>`;

  return `
    <div class="text-search-row">
      <div class="text-search-wrapper">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input type="text" class="text-search-input" data-target="text-list-${col.id}" placeholder="Search responses">
      </div>
      <div class="text-results-count">${count} results</div>
      <button class="text-sort-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 15l5 5 5-5M7 9l5-5 5 5"/></svg>
      </button>
    </div>
    ${listHtml}
  `;
}

export function renderSummary() {
  const container = document.getElementById("summary-container");
  if (!container) return;

  const data = state.submissions;
  if (!data || data.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:40px;color:#6b7280;">No data available yet.</div>`;
    return;
  }

  let html = '';
  const totalPeople = data.length;

  // Cards the admin has dismissed. Keyed by column id, which is stable: renaming
  // a question's label or reordering the columns will not quietly unhide one
  // card and hide a different one.
  const hiddenLabels = new Map();

  state.columns.forEach((col, index) => {
    if (col.id === 'created_at' || col.id === 'id') return;
    if (state.hiddenSummaryCards.has(col.id)) {
      hiddenLabels.set(col.id, col.label);
      return;
    }

    let answeredCount = 0;
    const values = [];
    data.forEach(row => {
      const val = row[col.id];
      if (val !== undefined && val !== null && val !== '' && val !== '–') {
        answeredCount++;
        values.push(val);
      }
    });

    const badgeClass = col.filterType === 'number' ? 'number-badge' : (col.filterType === 'text' || col.filterType === 'date' || col.type === 'file' ? 'text-badge' : '');
    const badgeIcon = col.filterType === 'number' ? '#' : `<svg width="14" height="14" viewBox="0 0 24 24" style="margin-top:2px"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" fill="none"/></svg>`;

    html += `
      <div class="summary-card" id="summary-card-${col.id}" data-card-key="${esc(col.id)}">
        <div class="summary-card-header">
          <div class="q-title-row">
            <span class="q-badge ${badgeClass}">${badgeIcon} ${index}</span>
            <span class="q-title">${esc(col.label)}</span>
            <button class="card-hide-btn" type="button" data-card-key="${esc(col.id)}"
                    title="Hide this card" aria-label="Hide ${esc(col.label)}">&times;</button>
          </div>
          <span class="q-meta">${answeredCount} out of ${totalPeople} people answered this question.</span>
        </div>
    `;

    if (col.filterType === 'choice') {
      html += renderChoiceSummary(col, data, values, answeredCount);
    } else if (col.filterType === 'number') {
      html += renderNumberSummary(col, data, values);
    } else {
      html += renderTextSummary(col, data);
    }

    html += `</div>`;
  });

  // A hidden card leaves nothing behind, so without a way back the only remedy
  // is clearing browser storage. This names what is hidden and restores it.
  let restoreHtml = '';
  if (hiddenLabels.size) {
    const chips = [...hiddenLabels.entries()].map(([id, label]) => `
      <button class="summary-restore-btn" type="button" data-card-key="${esc(id)}"
              title="Show this card again">${esc(label)} &plus;</button>
    `).join('');
    restoreHtml = `
      <div class="summary-hidden-bar">
        <span class="summary-hidden-count">${hiddenLabels.size} card${hiddenLabels.size === 1 ? '' : 's'} hidden:</span>
        ${chips}
        <button class="summary-restore-all" type="button">Show all</button>
      </div>
    `;
  }

  container.innerHTML = restoreHtml + html;
}


