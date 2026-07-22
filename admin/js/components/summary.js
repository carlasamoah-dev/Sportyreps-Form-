import { state } from '../state.js';

export function renderSummary() {
  const container = document.getElementById("summary-container");
  
  if (state.submissions.length === 0) {
    container.innerHTML = "<p>No submissions to analyze yet.</p>";
    return;
  }

  const total = state.submissions.length;
  
  // Define questions to summarize based on the screenshots provided
  const questionsToSummarize = [
    { id: "source", title: "How did you find this link?" },
    { id: "role", title: "Are you a Talent or Representative?" },
    { id: "position", title: "What position do you play?" },
    { id: "education", title: "Highest level of formal education?" }
  ];

  let html = "";

  questionsToSummarize.forEach(q => {
    const counts = {};
    state.submissions.forEach(sub => {
      const val = sub[q.id] || "N/A";
      counts[val] = (counts[val] || 0) + 1;
    });

    html += `
      <div class="summary-card">
        <h3>${q.title}</h3>
        <p>${total} out of ${total} people answered this question.</p>
        <table class="summary-table">
          <thead>
            <tr>
              <th>Choices</th>
              <th>Responses</th>
              <th>Percentages</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(counts).map(([choice, count]) => {
              const pct = ((count / total) * 100).toFixed(1);
              return `
                <tr>
                  <td>${choice}</td>
                  <td>${count}</td>
                  <td>${pct}%</td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    `;
  });

  container.innerHTML = html;
}
