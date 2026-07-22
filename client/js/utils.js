export function findStepIndexById(formConfig, currentStepIndex, id) {
  const stepIdx = formConfig.steps.findIndex(s => s.id === id);
  if (stepIdx !== -1) return stepIdx;
  
  if (formConfig.endings && formConfig.endings[id]) {
    return id;
  }
  return currentStepIndex + 1;
}

export function updateProgressBar(formConfig, currentStepIndex, progressBar) {
  const totalSteps = formConfig.steps.length;
  const percentage = Math.min(100, Math.round((currentStepIndex / (totalSteps - 1)) * 100));
  if (progressBar) {
    progressBar.style.width = `${percentage}%`;
  }
}

export function focusPrimaryElement(container) {
  if (!container) return;
  const input = container.querySelector("input, select, button.choice-btn, button#start-btn");
  if (input) {
    input.focus();
  }
}

// Helper to convert base64 dataURI to binary Blob for backend file uploads
export function dataURItoBlob(dataURI) {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], {type: mimeString});
}

export function formatDescription(text) {
  if (!text) return "";
  return text.replace(/(https?:\/\/[^\s\)]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
}

export function shakeContainer() {
  const container = document.querySelector(".question-container") || document.querySelector(".split-content-panel");
  if (container) {
    container.classList.remove("shaking");
    void container.offsetWidth;
    container.style.animation = "shake 0.3s ease";
    setTimeout(() => {
      container.style.animation = "";
    }, 300);
  }
}

export function showError(container, text) {
  if (!container) return;
  container.innerHTML = `
    <div class="error-msg">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zM8 4v5m0 2h.01"/>
      </svg>
      <span>${text}</span>
    </div>
  `;
}
