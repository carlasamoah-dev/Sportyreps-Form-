(function() {
  // --- Standard Alphabetical Countries List ---
  const COUNTRIES = [
    "United Kingdom", "United States", "Nigeria", "Ghana", "Cameroon", "Canada",
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
    "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas",
    "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize",
    "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil",
    "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
    "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros",
    "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus",
    "Czechia (Czech Republic)", "Denmark", "Djibouti", "Dominica", "Dominican Republic",
    "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia",
    "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia",
    "Georgia", "Germany", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
    "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia",
    "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan",
    "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia",
    "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania",
    "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali",
    "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia",
    "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique",
    "Myanmar (Burma)", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand",
    "Nicaragua", "Niger", "North Korea", "North Macedonia", "Norway", "Oman",
    "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea",
    "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania",
    "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Samoa",
    "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia",
    "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia",
    "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan",
    "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
    "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga",
    "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
    "Uganda", "Ukraine", "United Arab Emirates", "Uruguay", "Uzbekistan",
    "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
  ];

  // --- Configure your Backend Submissions Endpoint ---
  // If you use a service like Formspree, paste your form endpoint URL here (e.g. "https://formspree.io/f/your_id")
  const BACKEND_URL = ""; 

  // --- Form State Variables ---
  let activeFormId = "football-talent";
  let formConfig = null;
  let currentStepIndex = 0;
  let answers = {};
  let historyStack = []; // Remembers the exact path taken (important for logic jumps)

  // --- Cache DOM Elements ---
  const formContainer = document.getElementById("form-container");
  const progressBar = document.getElementById("progress-bar");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");

  // --- Initialize App ---
  function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const paramFormId = urlParams.get("form");
    if (paramFormId && FORMS[paramFormId]) {
      activeFormId = paramFormId;
    }

    formConfig = FORMS[activeFormId];
    if (!formConfig) {
      formContainer.innerHTML = `<div class="error-msg">Form not found. Please verify the URL.</div>`;
      return;
    }



    // Reset state
    currentStepIndex = 0;
    historyStack = [];
    answers = {};
    
    renderStep();
    setupGlobalListeners();
  }

  // --- Render Active Slide ---
  function renderStep() {
    const step = formConfig.steps[currentStepIndex];
    if (!step) return;

    // Toggle navigation button states
    prevBtn.disabled = historyStack.length === 0;

    const slide = document.createElement("div");
    slide.className = "step-slide";
    
    // Check if group header banner is required
    let groupHeaderHtml = "";
    if (step.parentGroupTitle && step.parentGroupNumber) {
      groupHeaderHtml = `
        <div class="group-header-banner">
          <span class="group-badge">${step.parentGroupNumber}</span>
          <span class="group-title">${step.parentGroupTitle}</span>
        </div>
      `;
    }

    // Question label header row HTML
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

    // Determine type-specific content HTML
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

    // If split layout is required, wrap content
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
      // Welcome screen renders its own layout — no question-container wrapper
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

    // Clear and mount the new slide
    formContainer.innerHTML = "";
    formContainer.appendChild(slide);

    // Bind event handlers inside the slide
    bindEvents(slide, step);
    
    // Auto-focus the primary field
    focusPrimaryElement(slide);

    // Update progress bar
    updateProgressBar();
  }

  // --- Render Templates ---

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
    const savedVal = answers[step.id] || "";
    let choicesHtml = "";
    
    step.choices.forEach((choice, idx) => {
      const keyLetter = String.fromCharCode(65 + idx); // A, B, C...
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
    const savedData = answers[step.id] || {};
    let fieldsHtml = "";

    step.fields.forEach(f => {
      const val = savedData[f.name] || "";
      const isFullWidth = f.name === 'fullname' || f.name === 'rep_fullname' || f.name === 'firstname' || f.name === 'lastname' || f.name === 'rep_firstname' || f.name === 'rep_lastname';
      
      let inputMarkup = "";
      if (f.isPhone) {
        // Renders flag dropdown selector markup matching Screenshot 2
        inputMarkup = `
          <div class="phone-input-wrapper">
            <div class="phone-flag-selector" id="flag-select">
              <span>🇬🇧</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="6" fill="none" viewBox="0 0 10 6">
                <path stroke="#5e6472" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M1 1l4 4 4-4"/>
              </svg>
            </div>
            <input type="tel" id="${f.name}" name="${f.name}" class="contact-input" value="${val}" placeholder="07400 123456" ${f.required ? 'required' : ''}>
          </div>
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
    const savedFile = answers[step.id];
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

    // Cloud upload SVG contour matches Screenshot 4
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
    const savedVal = answers[step.id] || "";
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
    const savedVal = answers[step.id] || "";
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

  // --- Bind Interactive Events ---
  function bindEvents(slide, step) {
    // 1. Welcome Screen Continue Button
    const startBtn = slide.querySelector("#start-btn");
    if (startBtn) {
      startBtn.addEventListener("click", () => goNext());
    }

    // 2. Multiple Choice Click
    const choiceButtons = slide.querySelectorAll(".choice-btn");
    choiceButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        choiceButtons.forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        
        const val = btn.getAttribute("data-value");
        answers[step.id] = val;
        
        setTimeout(() => goNext(), 300);
      });
    });

    // 3. Contact Info/Text Input OK Button
    const okBtn = slide.querySelector(".ok-btn");
    if (okBtn) {
      okBtn.addEventListener("click", () => {
        if (validateStep(step)) {
          goNext();
        }
      });
    }

    // 4. Text Field / Select Dropdown Enter & Input handling
    const inputField = slide.querySelector("#input-field");
    if (inputField) {
      inputField.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (validateStep(step)) {
            goNext();
          }
        }
      });
      inputField.addEventListener("input", (e) => {
        answers[step.id] = e.target.value;
      });

      // Special handler for Country Dropdown choice auto-advance
      if (step.type === "country") {
        inputField.addEventListener("change", (e) => {
          answers[step.id] = e.target.value;
          setTimeout(() => {
            if (validateStep(step)) {
              goNext();
            }
          }, 300);
        });
      }
    }

    // 5. File Upload Dropzone
    const dropzone = slide.querySelector("#dropzone");
    const fileInput = slide.querySelector("#file-input");
    const previewContainer = slide.querySelector("#preview-container");
    const removeBtn = slide.querySelector(".preview-remove-btn");

    if (dropzone && fileInput) {
      dropzone.addEventListener("click", () => fileInput.click());
      
      dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.classList.add("dragover");
      });
      dropzone.addEventListener("dragleave", () => {
        dropzone.classList.remove("dragover");
      });
      dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.classList.remove("dragover");
        if (e.dataTransfer.files.length > 0) {
          handleFileSelect(e.dataTransfer.files[0], step, previewContainer);
        }
      });

      fileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
          handleFileSelect(e.target.files[0], step, previewContainer);
        }
      });
    }

    if (removeBtn) {
      removeBtn.addEventListener("click", () => {
        delete answers[step.id];
        renderStep();
      });
    }
  }

  // --- Process File Upload ---
  function handleFileSelect(file, step, container) {
    const errorContainer = document.getElementById("error-container");
    if (errorContainer) errorContainer.innerHTML = "";

    if (file.size > 10 * 1024 * 1024) {
      showError(errorContainer, "File is too large. Maximum size limit is 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      answers[step.id] = {
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: e.target.result
      };
      renderStep();
    };
    reader.readAsDataURL(file);
  }

  // --- Validate step inputs ---
  function validateStep(step) {
    const errorContainer = document.getElementById("error-container");
    if (!errorContainer) return true;
    errorContainer.innerHTML = "";

    if (step.type === "contact-info") {
      const contactData = {};
      let isValid = true;
      
      step.fields.forEach(f => {
        const inputEl = document.getElementById(f.name);
        const val = inputEl ? inputEl.value.trim() : "";
        
        if (f.required && !val) {
          isValid = false;
          if (inputEl) {
            if (f.isPhone) {
              inputEl.closest(".phone-input-wrapper").style.borderBottomColor = "var(--error-color)";
            } else {
              inputEl.style.borderBottomColor = "var(--error-color)";
            }
          }
        } else {
          if (inputEl) {
            if (f.isPhone) {
              inputEl.closest(".phone-input-wrapper").style.borderBottomColor = "var(--border-color)";
            } else {
              inputEl.style.borderBottomColor = "var(--border-color)";
            }
          }
          contactData[f.name] = val;
        }

        if (f.type === "email" && val && !validateEmail(val)) {
          isValid = false;
          if (inputEl) inputEl.style.borderBottomColor = "var(--error-color)";
          showError(errorContainer, "Please enter a valid email address.");
        }
      });

      if (!isValid) {
        if (errorContainer.innerHTML === "") {
          showError(errorContainer, "Please fill out all required fields.");
        }
        shakeContainer();
        return false;
      }
      
      answers[step.id] = contactData;
      return true;
    }

    if (step.type === "file-upload") {
      if (step.required && !answers[step.id]) {
        showError(errorContainer, "Please upload the required file to continue.");
        shakeContainer();
        return false;
      }
      return true;
    }

    const val = (answers[step.id] || "").toString().trim();
    
    if (step.required && !val) {
      showError(errorContainer, "Please fill in this field to continue.");
      shakeContainer();
      return false;
    }

    if (step.type === "url" && val && !validateUrl(val)) {
      showError(errorContainer, "Please enter a valid URL.");
      shakeContainer();
      return false;
    }

    if (step.type === "number" && val) {
      const num = parseFloat(val);
      if (isNaN(num)) {
        showError(errorContainer, "Please enter a valid number.");
        shakeContainer();
        return false;
      }
      if (step.min !== undefined && num < step.min) {
        showError(errorContainer, `Value must be greater than or equal to ${step.min}.`);
        shakeContainer();
        return false;
      }
      if (step.max !== undefined && num > step.max) {
        showError(errorContainer, `Value must be less than or equal to ${step.max}.`);
        shakeContainer();
        return false;
      }
    }

    return true;
  }

  // --- logical Jumps & Navigation ---
  function goNext() {
    const currentStep = formConfig.steps[currentStepIndex];
    
    if (currentStepIndex === formConfig.steps.length - 1) {
      submitForm();
      return;
    }

    let nextIndex = currentStepIndex + 1;
    
    if (currentStep.logic) {
      const choice = answers[currentStep.id];
      const targetStepId = currentStep.logic[choice];
      if (targetStepId) {
        nextIndex = findStepIndexById(targetStepId);
      }
    } else if (currentStep.nextStep) {
      nextIndex = findStepIndexById(currentStep.nextStep);
    }

    if (typeof nextIndex === "string" && nextIndex.startsWith("ending-")) {
      renderEnding(nextIndex);
      return;
    }

    historyStack.push(currentStepIndex);
    
    const currentSlide = document.querySelector(".step-slide");
    if (currentSlide) {
      currentSlide.classList.add("slide-out-left");
      setTimeout(() => {
        currentStepIndex = nextIndex;
        renderStep();
      }, 250);
    } else {
      currentStepIndex = nextIndex;
      renderStep();
    }
  }

  function goBack() {
    if (historyStack.length === 0) return;

    const currentSlide = document.querySelector(".step-slide");
    if (currentSlide) {
      currentSlide.classList.add("slide-out-right");
      setTimeout(() => {
        currentStepIndex = historyStack.pop();
        renderStep();
      }, 250);
    } else {
      currentStepIndex = historyStack.pop();
      renderStep();
    }
  }

  // --- Render Endings screen ---
  function renderEnding(endingId) {
    const ending = formConfig.endings[endingId];
    if (!ending) return;

    prevBtn.disabled = true;
    nextBtn.disabled = true;

    progressBar.style.width = "100%";

    const slide = document.createElement("div");
    slide.className = "step-slide welcome-layout";
    slide.innerHTML = `
      <h1 class="welcome-title">${ending.title}</h1>
      <p class="welcome-desc">${formatDescription(ending.description)}</p>
    `;

    formContainer.innerHTML = "";
    formContainer.appendChild(slide);

    if (endingId === "ending-success") {
      console.log("FINAL SUBMISSION DATA:", answers);
    }
  }

  function submitForm() {
    const finalPayload = {
      formId: activeFormId,
      timestamp: new Date().toISOString(),
      entries: answers
    };

    // Prepare files and entries for backend transmission
    const formData = new FormData();
    formData.append("formId", activeFormId);
    
    // Flatten answers object to FormData keys
    for (const key in answers) {
      const val = answers[key];
      if (val && typeof val === "object" && val.dataUrl) {
        // It's an uploaded file (PDF/Image)
        // Convert base64 dataUrl back to a Blob object to transmit it as a real binary file
        const blob = dataURItoBlob(val.dataUrl);
        formData.append(key, blob, val.name);
      } else if (val && typeof val === "object") {
        // Contact info field group
        for (const subKey in val) {
          formData.append(`${key}_${subKey}`, val[subKey]);
        }
      } else {
        formData.append(key, val);
      }
    }

    // Transition UI to success screen immediately
    const currentSlide = document.querySelector(".step-slide");
    const showSuccess = () => renderEnding("ending-success");
    if (currentSlide) {
      currentSlide.classList.add("slide-out-left");
      setTimeout(showSuccess, 250);
    } else {
      showSuccess();
    }

    console.log("SUBMITTING DATA:", finalPayload);

    // If BACKEND_URL is set, send data using POST request
    if (BACKEND_URL) {
      fetch(BACKEND_URL, {
        method: "POST",
        body: formData,
        headers: {
          "Accept": "application/json"
        }
      })
      .then(response => {
        if (!response.ok) {
          console.error("Backend response error:", response.statusText);
        }
      })
      .catch(error => {
        console.error("Network submission error:", error);
      });
    } else {
      alert("Form submitted successfully! Check console logs for form data. (Paste a BACKEND_URL in app.js to send submissions to an email/database dashboard)");
    }
  }

  // Helper to convert base64 dataURI to binary Blob for backend file uploads
  function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], {type: mimeString});
  }

  // --- Helpers ---
  function findStepIndexById(id) {
    const stepIdx = formConfig.steps.findIndex(s => s.id === id);
    if (stepIdx !== -1) return stepIdx;
    
    if (formConfig.endings && formConfig.endings[id]) {
      return id;
    }
    return currentStepIndex + 1;
  }

  function updateProgressBar() {
    const totalSteps = formConfig.steps.length;
    const percentage = Math.min(100, Math.round((currentStepIndex / (totalSteps - 1)) * 100));
    progressBar.style.width = `${percentage}%`;
  }

  function focusPrimaryElement(container) {
    const input = container.querySelector("input, select, button.choice-btn, button#start-btn");
    if (input) {
      input.focus();
    }
  }

  // Global Key listeners
  function setupGlobalListeners() {
    prevBtn.addEventListener("click", () => goBack());
    nextBtn.addEventListener("click", () => {
      const step = formConfig.steps[currentStepIndex];
      if (validateStep(step)) {
        goNext();
      }
    });

    document.addEventListener("keydown", (e) => {
      const activeEl = document.activeElement;
      const isTyping = activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA" || activeEl.tagName === "SELECT";

      if (!isTyping && e.key >= "1" && e.key <= "9") {
        const choiceIdx = parseInt(e.key) - 1;
        const choiceBtns = document.querySelectorAll(".choice-btn");
        if (choiceBtns[choiceIdx]) {
          choiceBtns[choiceIdx].click();
        }
      }

      if (!isTyping && e.key.length === 1 && e.key.toLowerCase() >= "a" && e.key.toLowerCase() <= "z") {
        const charCode = e.key.toLowerCase().charCodeAt(0);
        const choiceIdx = charCode - 97;
        const choiceBtns = document.querySelectorAll(".choice-btn");
        if (choiceBtns[choiceIdx]) {
          choiceBtns[choiceIdx].click();
        }
      }
    });
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // simple url validation
  function validateUrl(url) {
    try {
      new URL(url);
      return url.startsWith("http://") || url.startsWith("https://");
    } catch (_) {
      return false;
    }
  }

  function showError(container, text) {
    container.innerHTML = `
      <div class="error-msg">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zM8 4v5m0 2h.01"/>
        </svg>
        <span>${text}</span>
      </div>
    `;
  }

  function shakeContainer() {
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

  function formatDescription(text) {
    return text.replace(/(https?:\/\/[^\s\)]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  }

  window.addEventListener("DOMContentLoaded", init);
})();
