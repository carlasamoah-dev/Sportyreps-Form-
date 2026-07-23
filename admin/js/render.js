import { state } from './state.js';
import { SVGS } from './constants.js';
import { formatDate, isUrl } from './utils.js';

export function renderTable() {
  const head = document.getElementById("grid-head");
  const body = document.getElementById("grid-body");
  const countEl = document.getElementById("response-count");
  
  if (!head || !body) return;

  const data = state.filteredSubmissions;
  if (countEl) countEl.textContent = data.length;

  const visibleCols = state.columns.filter(c => c.visible);

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
    let bg = 'var(--bg-subtle)';
    let color = 'var(--text-muted)';

    if (col.type === 'time')   { svgIcon = SVGS.time;   bg = '#fde2e4'; color = '#d1495b'; }
    if (col.type === 'phone')  { svgIcon = SVGS.phone;  bg = '#fde2e4'; color = '#d1495b'; }
    if (col.type === 'file')   { svgIcon = SVGS.file;   bg = '#f3effc'; color = '#7c3aed'; }
    if (col.type === 'url')    { svgIcon = SVGS.url;    bg = '#e0f2fe'; color = '#0369a1'; }
    if (col.type === 'number') { svgIcon = SVGS.number; bg = '#fef9c3'; color = '#854d0e'; }
    if (col.type === 'email')  { svgIcon = SVGS.email;  bg = '#fde2e4'; color = '#d1495b'; }

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
      
      if (col.type === 'time') {
        cellHtml = `<span>${formatDate(val)}</span>`;

      } else if (col.id === 'tactical-positions' || col.id === 'special-abilities') {
        if (val !== '–') {
          const chips = val.split(',').map(s => s.trim());
          cellHtml = `<div class="chip-container">` + chips.map(c => `<span class="chip">${c}</span>`).join('') + `</div>`;
        }

      } else if (col.type === 'file') {
        if (isUrl(val)) {
          const filename = decodeURIComponent(val.split('/').pop() || 'Attachment');
          cellHtml = `<button class="file-btn" data-url="${val}">
                        ${SVGS.file} <span>${filename.substring(0, 18)}…</span>
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
  state.columns.forEach((col, index) => {
    html += `
      <div class="column-item" draggable="true" data-index="${index}">
        <svg width="16" height="16" viewBox="0 0 24 24" style="color:var(--text-disabled);flex-shrink:0;"><circle cx="9" cy="6" r="1.5" fill="currentColor"></circle><circle cx="15" cy="6" r="1.5" fill="currentColor"></circle><circle cx="9" cy="12" r="1.5" fill="currentColor"></circle><circle cx="15" cy="12" r="1.5" fill="currentColor"></circle><circle cx="9" cy="18" r="1.5" fill="currentColor"></circle><circle cx="15" cy="18" r="1.5" fill="currentColor"></circle></svg>
        <span style="flex:1;font-size:13.5px;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-left:8px;">${col.label}</span>
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

