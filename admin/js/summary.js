import { state } from './state.js';
import { formatDate } from './utils.js';

/**
 * Compute frequency count for a given field key across all submissions.
 * Handles comma-separated multi-value fields (like tactical-positions).
 */
function countField(key, multiValue = false) {
  const counts = {};
  state.submissions.forEach(row => {
    const val = row[key];
    if (!val || val === '–') return;
    if (multiValue) {
      val.split(',').forEach(v => {
        const t = v.trim();
        if (t) counts[t] = (counts[t] || 0) + 1;
      });
    } else {
      counts[val] = (counts[val] || 0) + 1;
    }
  });
  return counts;
}

function countAnswered(key) {
  return state.submissions.filter(r => r[key] && r[key] !== '–' && r[key] !== null).length;
}

function computeNumericStats(key) {
  const vals = state.submissions
    .map(r => parseFloat(r[key]))
    .filter(v => !isNaN(v));
  if (!vals.length) return null;
  const sorted = [...vals].sort((a, b) => a - b);
  const mean = (vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1);
  const median = sorted.length % 2 === 0
    ? ((sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2).toFixed(1)
    : sorted[Math.floor(sorted.length / 2)].toFixed(1);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const stdDev = Math.sqrt(vals.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / vals.length).toFixed(2);
  return { mean, median, min, max, stdDev, count: vals.length };
}




/**
 * Create a question card HTML wrapper
 */
function questionCard(number, iconBg, iconColor, iconLabel, title, answeredCount, bodyHtml) {
  const total = state.submissions.length;
  return `
    <div class="summary-card" id="q-card-${number}">
      <div class="summary-card-header">
        <span class="q-badge" style="background:${iconBg};color:${iconColor};">${iconLabel} ${number}</span>
        <h3 class="q-title">${title}</h3>
      </div>
      <p class="q-meta">${answeredCount} out of ${total} people answered this question.</p>
      ${bodyHtml}
    </div>
  `;
}

/**
 * Build a table + bar chart card for a choice field
 */
function choiceCardHtml(number, iconBg, iconColor, iconLabel, title, key, multiValue = false) {
  const counts = countField(key, multiValue);
  const answered = multiValue
    ? Object.values(counts).reduce((s, v) => s + v, 0)
    : countAnswered(key);
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const total = state.submissions.length;

  const tableRows = entries.map(([label, count]) => {
    const pct = ((count / (multiValue ? Object.values(counts).reduce((s,v)=>s+v,0) : total)) * 100).toFixed(1);
    return `<tr>
      <td>${label}</td>
      <td>${count}</td>
      <td>${pct}%</td>
    </tr>`;
  }).join('');

  const canvasId = `chart-${key}`;
  const isLong = entries.length > 4;
  const chartHeight = isLong ? Math.max(entries.length * 44, 200) : 220;

  const bodyHtml = `
    <div class="choice-card-body">
      <div class="choice-table-wrap">
        <table class="choice-table">
          <thead><tr><th>Choices</th><th>Responses</th><th>Percentages</th></tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
      <div class="choice-chart-wrap" style="height:${chartHeight}px;">
        <canvas id="${canvasId}"></canvas>
      </div>
    </div>
  `;

  return { html: questionCard(number, iconBg, iconColor, iconLabel, title, answered, bodyHtml), canvasId, entries, isLong };
}

/**
 * Build a numeric stats card
 */
function numericCardHtml(number, title, key, unit = '') {
  const stats = computeNumericStats(key);
  const answered = countAnswered(key);
  if (!stats) {
    return { html: questionCard(number, '#fef3c7', '#92400e', '#', title, 0, `<p style="color:var(--text-muted)">No data</p>`), canvasId: null };
  }
  const bodyHtml = `
    <div class="numeric-stats-grid">
      <div class="stat-box"><div class="stat-value">${stats.mean}${unit}</div><div class="stat-label">Mean</div></div>
      <div class="stat-box"><div class="stat-value">${stats.median}${unit}</div><div class="stat-label">Median</div></div>
      <div class="stat-box"><div class="stat-value">${stats.min}${unit} – ${stats.max}${unit}</div><div class="stat-label">Min–Max</div></div>
      <div class="stat-box"><div class="stat-value">${stats.stdDev}</div><div class="stat-label">Standard deviation</div></div>
    </div>
  `;
  return { html: questionCard(number, '#fef3c7', '#92400e', '#', title, answered, bodyHtml), canvasId: null };
}

/**
 * Build a text list card for open-ended or nationality fields
 */
function textListCardHtml(number, title, key) {
  const answered = countAnswered(key);
  const entries = state.submissions
    .filter(r => r[key] && r[key] !== '–' && r[key] !== null)
    .map(r => ({ val: r[key], date: r.created_at }));

  const listHtml = entries.slice(0, 6).map(e => `
    <div class="text-list-item">
      <span class="quote-icon">"</span>
      <span class="text-list-val">${e.val}</span>
      <span class="text-list-date">${formatDate(e.date)}</span>
    </div>
  `).join('');

  const bodyHtml = `<div class="text-list">${listHtml}</div>`;
  return { html: questionCard(number, '#dbeafe', '#1e40af', '≡', title, answered, bodyHtml), canvasId: null };
}

export function renderSummary() {
  const container = document.getElementById("summary-container");
  if (!container) return;
  const total = state.submissions.length;

  if (total === 0) {
    container.innerHTML = `<div style="text-align:center;padding:60px;color:var(--text-muted);font-size:15px;">No responses yet — data will appear here once submissions come in.</div>`;
    return;
  }

  // ── Top KPI strip ──────────────────────────────────────────
  const talents = state.submissions.filter(r => r.role === 'Talent').length;
  const reps = state.submissions.filter(r => r.role === 'Representative').length;
  const minors = state.submissions.filter(r => r['minor-check'] === 'Yes').length;
  const withPassport = state.submissions.filter(r => r['passport-check'] === 'Yes').length;

  const kpiHtml = `
    <div class="kpi-strip">
      <div class="kpi-card">
        <div class="kpi-icon" style="background:#ede9fe;color:#7c3aed;">
          <svg width="20" height="20" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><circle cx="9" cy="7" r="4" fill="none" stroke="currentColor" stroke-width="2"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>
        </div>
        <div class="kpi-number">${total}</div>
        <div class="kpi-label">Total Responses</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon" style="background:#d1fae5;color:#065f46;">
          <svg width="20" height="20" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path></svg>
        </div>
        <div class="kpi-number">${talents}</div>
        <div class="kpi-label">Talents</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon" style="background:#fef3c7;color:#92400e;">
          <svg width="20" height="20" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"></rect><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" fill="none" stroke="currentColor" stroke-width="2"></path><line x1="12" y1="12" x2="12" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line><line x1="10" y1="14" x2="14" y2="14" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line></svg>
        </div>
        <div class="kpi-number">${reps}</div>
        <div class="kpi-label">Representatives</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon" style="background:#fce7f3;color:#9d174d;">
          <svg width="20" height="20" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path><path d="M9 12l2 2 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </div>
        <div class="kpi-number">${withPassport}</div>
        <div class="kpi-label">Have Passport</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon" style="background:#fee2e2;color:#991b1b;">
          <svg width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"></circle><path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>
        </div>
        <div class="kpi-number">${minors}</div>
        <div class="kpi-label">Minors (U18)</div>
      </div>
    </div>
  `;

  // ── Build all question cards ──────────────────────────────
  const cards = [];

  // Q1: How did you find this link? (choice bar chart)
  const q1 = choiceCardHtml(1, '#ede9fe', '#7c3aed', '≡=', 'How did you find this link?', 'source');
  cards.push(q1);

  // Q2: Role (choice bar chart)
  const q2 = choiceCardHtml(2, '#ede9fe', '#7c3aed', '≡=', 'Talent or Representative?', 'role');
  cards.push(q2);

  // Q3: Minor (choice)
  const q3 = choiceCardHtml(3, '#ede9fe', '#7c3aed', '≡=', 'Are you or are you registering a minor (under 18)?', 'minor-check');
  cards.push(q3);

  // Q4: Sex
  const q4 = choiceCardHtml(4, '#ede9fe', '#7c3aed', '≡=', 'What is your sex?', 'sex');
  cards.push(q4);

  // Q5: Residence
  const q5 = textListCardHtml(5, 'What is your country of residence?', 'residence');
  cards.push(q5);

  // Q6: Academy experience
  const q6 = choiceCardHtml(6, '#ede9fe', '#7c3aed', '≡=', 'Do you have academy or professional club experience?', 'academy-experience');
  cards.push(q6);

  // Q7: Signed Pro
  const q7 = choiceCardHtml(7, '#ede9fe', '#7c3aed', '≡=', 'Are you/is the player currently signed to a professional club?', 'signed-pro');
  cards.push(q7);

  // Q8: Position (main)
  const q8 = choiceCardHtml(8, '#ede9fe', '#7c3aed', '≡=', 'What is your main playing position?', 'position');
  cards.push(q8);

  // Q9: Preferred Foot
  const q9 = choiceCardHtml(9, '#ede9fe', '#7c3aed', '≡=', 'What is your preferred foot?', 'foot');
  cards.push(q9);

  // Q10: Tactical Positions (multi-value horizontal bar)
  const q10 = choiceCardHtml(10, '#ede9fe', '#7c3aed', '≡=', 'What is/are your preferred tactical position(s) on the field of play?', 'tactical-positions', true);
  cards.push(q10);

  // Q11: Speed (numeric stats)
  const q11 = numericCardHtml(11, 'What is your top speed (mph)?', 'speed', ' mph');
  cards.push(q11);

  // Q12: Education (choice)
  const q12 = choiceCardHtml(12, '#ede9fe', '#7c3aed', '≡=', 'What is your highest level of education?', 'education');
  cards.push(q12);

  // Q13: Passport (choice)
  const q13 = choiceCardHtml(13, '#ede9fe', '#7c3aed', '≡=', 'Do you have a valid passport?', 'passport-check');
  cards.push(q13);

  // Assemble HTML
  container.innerHTML = kpiHtml + cards.map(c => c.html).join('');

  // ── Render Charts ──────────────────────────────────────────
  // Use Chart.js (loaded via CDN in index.html)
  cards.forEach((card, i) => {
    if (!card.canvasId) return;
    const entries = card.entries;
    const labels = entries.map(([l]) => l);
    const data = entries.map(([, v]) => v);
    const horizontal = card.isLong;
    renderBarChart(card.canvasId, labels, data, horizontal);
  });
}

function renderBarChart(canvasId, labels, data, horizontal = false) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // ── Multi-colour palette ────────────────────────────────────────────────────
  // Each category gets its own distinct colour (solid fill + lighter hover).
  // We cycle through the palette if there are more bars than colours.
  const PALETTE = [
    { fill: '#7c3aed', hover: '#6d28d9' }, // Violet
    { fill: '#0ea5e9', hover: '#0284c7' }, // Sky blue
    { fill: '#10b981', hover: '#059669' }, // Emerald
    { fill: '#f59e0b', hover: '#d97706' }, // Amber
    { fill: '#ef4444', hover: '#dc2626' }, // Red
    { fill: '#ec4899', hover: '#db2777' }, // Pink
    { fill: '#06b6d4', hover: '#0891b2' }, // Cyan
    { fill: '#84cc16', hover: '#65a30d' }, // Lime
    { fill: '#f97316', hover: '#ea580c' }, // Orange
    { fill: '#6366f1', hover: '#4f46e5' }, // Indigo
    { fill: '#14b8a6', hover: '#0d9488' }, // Teal
    { fill: '#a855f7', hover: '#9333ea' }, // Purple
  ];

  const backgroundColors = labels.map((_, i) => PALETTE[i % PALETTE.length].fill);
  const hoverColors      = labels.map((_, i) => PALETTE[i % PALETTE.length].hover);

  const total = data.reduce((s, v) => s + v, 0);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: backgroundColors,
        hoverBackgroundColor: hoverColors,
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      indexAxis: horizontal ? 'y' : 'x',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1f2328',
          titleColor: '#ffffff',
          bodyColor: '#d1d5db',
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            title: ctx => ctx[0].label,
            label: ctx => {
              const val = horizontal ? ctx.parsed.x : ctx.parsed.y;
              const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0.0';
              return `  ${val} response${val !== 1 ? 's' : ''}  (${pct}%)`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: '#f0f0f2', drawBorder: false },
          ticks: {
            color: '#6b7280',
            font: { size: 12, family: "'Inter', sans-serif" },
            maxRotation: horizontal ? 0 : 30
          },
          border: { display: false }
        },
        y: {
          grid: { color: '#f0f0f2', drawBorder: false },
          ticks: { color: '#6b7280', font: { size: 12, family: "'Inter', sans-serif" } },
          border: { display: false }
        }
      }
    }
  });
}
