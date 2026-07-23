import { getState, setAnswer, removeAnswer, setState } from "./state.js";
import { validateStep } from "./validation.js";
import { findStepIndexById, showError } from "./utils.js";
import { renderStep, renderEnding } from "./render.js";
import { submitForm } from "./api.js";

export function bindEvents(slide, step) {
  const startBtn = slide.querySelector("#start-btn");
  if (startBtn) {
    startBtn.addEventListener("click", () => goNext());
  }

  const choiceButtons = slide.querySelectorAll(".choice-btn");
  choiceButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      choiceButtons.forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      
      const val = btn.getAttribute("data-value");
      setAnswer(step.id, val);
      
      setTimeout(() => goNext(), 300);
    });
  });

  const okBtn = slide.querySelector(".ok-btn");
  if (okBtn) {
    okBtn.addEventListener("click", () => {
      if (validateStep(step)) {
        goNext();
      }
    });
  }

  // Initialize intl-tel-input for any phone fields in this slide
  const phoneInputs = slide.querySelectorAll(".iti-phone-input");
  phoneInputs.forEach(input => {
    // Check if intlTelInput is loaded globally
    if (window.intlTelInput) {
      input.iti = window.intlTelInput(input, {
        initialCountry: "auto",
        geoIpLookup: function(callback) {
          fetch("https://ipapi.co/json")
            .then(res => res.json())
            .then(data => callback(data.country_code))
            .catch(() => callback("gb"));
        },
        utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@23.0.1/build/js/utils.js",
        separateDialCode: true,
      });
    }
  });

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
      setAnswer(step.id, e.target.value);
    });

    if (step.type === "country") {
      inputField.addEventListener("change", (e) => {
        setAnswer(step.id, e.target.value);
        setTimeout(() => {
          if (validateStep(step)) {
            goNext();
          }
        }, 300);
      });
    }
  }

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
      removeAnswer(step.id);
      renderStep();
    });
  }
}

function handleFileSelect(file, step, container) {
  const errorContainer = document.getElementById("error-container");
  if (errorContainer) errorContainer.innerHTML = "";

  if (file.size > 10 * 1024 * 1024) {
    showError(errorContainer, "File is too large. Maximum size limit is 10MB.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    setAnswer(step.id, {
      name: file.name,
      size: file.size,
      type: file.type,
      dataUrl: e.target.result
    });
    renderStep();
  };
  reader.readAsDataURL(file);
}

export function goNext() {
  const state = getState();
  const currentStep = state.formConfig.steps[state.currentStepIndex];
  
  if (state.currentStepIndex === state.formConfig.steps.length - 1) {
    submitForm();
    return;
  }

  let nextIndex = state.currentStepIndex + 1;
  
  if (currentStep.logic) {
    const choice = state.answers[currentStep.id];
    const targetStepId = currentStep.logic[choice];
    if (targetStepId) {
      nextIndex = findStepIndexById(state.formConfig, state.currentStepIndex, targetStepId);
    }
  } else if (currentStep.nextStep) {
    nextIndex = findStepIndexById(state.formConfig, state.currentStepIndex, currentStep.nextStep);
  }

  if (typeof nextIndex === "string" && nextIndex.startsWith("ending-")) {
    renderEnding(nextIndex);
    return;
  }

  const newHistory = [...state.historyStack, state.currentStepIndex];
  setState({ historyStack: newHistory });
  
  const currentSlide = document.querySelector(".step-slide");
  if (currentSlide) {
    currentSlide.classList.add("slide-out-left");
    setTimeout(() => {
      setState({ currentStepIndex: nextIndex });
      renderStep();
    }, 250);
  } else {
    setState({ currentStepIndex: nextIndex });
    renderStep();
  }
}

export function goBack() {
  const state = getState();
  if (state.historyStack.length === 0) return;

  const currentSlide = document.querySelector(".step-slide");
  const newHistory = [...state.historyStack];
  const nextIndex = newHistory.pop();

  if (currentSlide) {
    currentSlide.classList.add("slide-out-right");
    setTimeout(() => {
      setState({ historyStack: newHistory, currentStepIndex: nextIndex });
      renderStep();
    }, 250);
  } else {
    setState({ historyStack: newHistory, currentStepIndex: nextIndex });
    renderStep();
  }
}

export function setupGlobalListeners() {
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");

  if (prevBtn) {
    prevBtn.addEventListener("click", () => goBack());
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      const state = getState();
      const step = state.formConfig.steps[state.currentStepIndex];
      if (validateStep(step)) {
        goNext();
      }
    });
  }

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
