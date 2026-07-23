import { getAnswer, getState } from "./state.js";
import { COUNTRIES } from "./constants.js";
import { formatDescription, updateProgressBar, focusPrimaryElement } from "./utils.js";
import { bindEvents } from "./events.js";

// --- Cache DOM Elements ---
let formContainer = null;
let progressBar = null;
let prevBtn = null;

export function initRender() {
  formContainer = document.getElementById("form-container");
  progressBar = document.getElementById("progress-bar");
  prevBtn = document.getElementById("prev-btn");
}

export function renderStep() {
  const state = getState();
  const step = state.formConfig.steps[state.currentStepIndex];
  if (!step) return;

  if (prevBtn) {
    prevBtn.disabled = state.historyStack.length === 0;
  }

  const slide = document.createElement("div");
  slide.className = "step-slide";
  
  let groupHeaderHtml = "";
  if (step.parentGroupTitle && step.parentGroupNumber) {
    groupHeaderHtml = `
      <div class="group-header-banner">
        <span class="group-badge">${step.parentGroupNumber}</span>
        <span class="group-title">${step.parentGroupTitle}</span>
      </div>
    `;
  }

  let questionHeaderHtml = "";
  if (step.question) {
    const asterisk = step.required ? `<span class="required-asterisk">*</span>` : "";
    questionHeaderHtml = `
      <div class="question-header-row">
        ${step.number ? `<span class="question-badge">${step.number}</span>` : ""}
        <h2 class="question-label">${step.question}${asterisk}</h2>
      </div>
      ${step.description ? `<p class="question-desc">${step.description}</p>` : ""}
    `;
  }

  let contentHtml = "";
  switch (step.type) {
    case "welcome":
      contentHtml = renderWelcome(step);
      break;
    case "multiple-choice":
      contentHtml = renderMultipleChoice(step);
      break;
    case "contact-info":
      contentHtml = renderContactInfo(step);
      break;
    case "file-upload":
      contentHtml = renderFileUpload(step);
      break;
    case "country":
      contentHtml = renderCountrySelect(step);
      break;
    case "text":
    case "number":
    case "date":
    case "url":
      contentHtml = renderInput(step);
      break;
    default:
      contentHtml = `<div class="error-msg">Unsupported type: ${step.type}</div>`;
  }

  if (step.showSplitLayout) {
    slide.innerHTML = `
      ${groupHeaderHtml}
      <div class="split-layout-container">
        <div class="split-image-panel">
          <img src="${step.image}" class="showcase-image" alt="Talent showcase">
        </div>
        <div class="split-content-panel">
          ${questionHeaderHtml}
          ${contentHtml}
        </div>
      </div>
    `;
  } else if (step.type === "welcome") {
    slide.innerHTML = contentHtml;
  } else {
    slide.innerHTML = `
      ${groupHeaderHtml}
      <div class="question-container">
        ${questionHeaderHtml}
        ${contentHtml}
      </div>
    `;
  }

  formContainer.innerHTML = "";
  formContainer.appendChild(slide);

  bindEvents(slide, step);
  focusPrimaryElement(slide);
  updateProgressBar(state.formConfig, state.currentStepIndex, progressBar);
}

function renderWelcome(step) {
  return `
    <div class="welcome-layout">
      <div class="welcome-heading-wrapper">
        <span class="welcome-quote-glyph">&ldquo;</span>
        <h1 class="welcome-title">${step.title}</h1>
      </div>
      <p class="welcome-desc">${formatDescription(step.description)}</p>
      <button class="btn-primary start-form-btn" id="start-btn">
        ${step.buttonText || "Continue"}
      </button>
    </div>
  `;
}

function renderMultipleChoice(step) {
  const savedVal = getAnswer(step.id) || "";
  let choicesHtml = "";
  
  step.choices.forEach((choice, idx) => {
    const keyLetter = String.fromCharCode(65 + idx);
    const isSelected = savedVal === choice ? "selected" : "";
    choicesHtml += `
      <button class="choice-btn ${isSelected}" data-value="${choice}" data-index="${idx}">
        <span class="choice-key">${keyLetter}</span>
        <span class="choice-text">${choice}</span>
      </button>
    `;
  });

  return `
    <div class="choices-list">
      ${choicesHtml}
    </div>
    <div id="error-container"></div>
  `;
}

function renderContactInfo(step) {
  const savedData = getAnswer(step.id) || {};
  let fieldsHtml = "";

  step.fields.forEach(f => {
    const val = savedData[f.name] || "";
    const isFullWidth = f.name === 'fullname' || f.name === 'rep_fullname' || f.name === 'firstname' || f.name === 'lastname' || f.name === 'rep_firstname' || f.name === 'rep_lastname';
    
    let inputMarkup = "";
    if (f.isPhone) {
      inputMarkup = `
        <input type="tel" id="${f.name}" name="${f.name}" class="contact-input iti-phone-input" value="${val}" ${f.required ? 'required' : ''}>
      `;
    } else {
      inputMarkup = `
        <input type="${f.type}" id="${f.name}" name="${f.name}" class="contact-input" value="${val}" placeholder="Type here..." ${f.required ? 'required' : ''}>
      `;
    }

    fieldsHtml += `
      <div class="contact-field ${isFullWidth ? 'full-width' : ''}">
        <label for="${f.name}">${f.label} ${f.required ? '*' : ''}</label>
        ${inputMarkup}
      </div>
    `;
  });

  return `
    <div class="contact-grid">
      ${fieldsHtml}
    </div>
    <div id="error-container"></div>
    <button class="btn-primary ok-btn" style="margin-top: 32px; margin-left: 36px;">OK</button>
  `;
}

function renderFileUpload(step) {
  const savedFile = getAnswer(step.id);
  let previewHtml = "";
  
  if (savedFile) {
    const isImage = savedFile.type.startsWith("image/");
    const iconOrThumb = isImage 
      ? `<img src="${savedFile.dataUrl}" class="preview-thumbnail" alt="Thumb">` 
      : `<div class="preview-doc-icon">PDF</div>`;
      
    previewHtml = `
      <div class="file-preview">
        <div class="preview-info">
          ${iconOrThumb}
          <span class="preview-name" title="${savedFile.name}">${savedFile.name}</span>
        </div>
        <button class="preview-remove-btn" aria-label="Remove file">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l10 10m0-10L3 13"/>
          </svg>
        </button>
      </div>
    `;
  }

  return `
    <div class="file-dropzone" id="dropzone">
      <input type="file" id="file-input" accept="${step.accept}" style="display: none;">
      <div class="file-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 16V9m0 0l-3 3m3-3l3 3M7.5 16.5A4.5 4.5 0 017 7.6a5.5 5.5 0 0110 1.9 4.5 4.5 0 01-1.5 8.5h-8z"/>
        </svg>
      </div>
      <span class="file-text"><b>Choose file</b> or drag here<br><span class="file-browse" style="font-size: 13px; font-weight: 400; text-decoration: none; opacity: 0.65; margin-top: 8px;">Size limit: 10MB</span></span>
    </div>
    <div id="preview-container">
      ${previewHtml}
    </div>
    <div id="error-container"></div>
    <button class="btn-primary ok-btn" style="margin-top: 24px; margin-left: 36px;">OK</button>
  `;
}

function renderCountrySelect(step) {
  const savedVal = getAnswer(step.id) || "";
  let optionsHtml = `<option value="" disabled ${!savedVal ? 'selected' : ''}>${step.placeholder || 'Select your country...'}</option>`;
  
  COUNTRIES.forEach(c => {
    const isSelected = savedVal === c ? "selected" : "";
    optionsHtml += `<option value="${c}" ${isSelected}>${c}</option>`;
  });

  return `
    <div class="input-text-container">
      <select id="input-field" class="input-field select-field">
        ${optionsHtml}
      </select>
    </div>
    <div id="error-container"></div>
    <button class="btn-primary ok-btn" style="margin-left: 36px;">OK</button>
  `;
}

function renderInput(step) {
  const savedVal = getAnswer(step.id) || "";
  let placeholder = step.placeholder || "Type your answer here...";
  let inputType = step.type;
  let minMaxAttrs = "";

  if (step.type === "number") {
    minMaxAttrs = `min="${step.min || ''}" max="${step.max || ''}"`;
  }

  return `
    <div class="input-text-container">
      <input type="${inputType}" id="input-field" class="input-field" value="${savedVal}" placeholder="${placeholder}" ${minMaxAttrs}>
    </div>
    <div id="error-container"></div>
    <button class="btn-primary ok-btn" style="margin-left: 36px;">OK</button>
  `;
}

export function renderEnding(endingId) {
  const state = getState();
  const ending = state.formConfig.endings[endingId];
  if (!ending) return;

  if (prevBtn) prevBtn.disabled = true;
  const nextBtn = document.getElementById("next-btn");
  if (nextBtn) nextBtn.disabled = true;

  if (progressBar) progressBar.style.width = "100%";

  const slide = document.createElement("div");
  slide.className = "step-slide welcome-layout";
  slide.innerHTML = `
    <h1 class="welcome-title">${ending.title}</h1>
    <p class="welcome-desc">${formatDescription(ending.description)}</p>
  `;

  formContainer.innerHTML = "";
  formContainer.appendChild(slide);

  if (endingId === "ending-success") {
    // Logging removed for production
  }
}
