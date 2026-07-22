import { getAnswer, setAnswer } from "./state.js";
import { showError, shakeContainer } from "./utils.js";

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validateUrl(url) {
  try {
    new URL(url);
    return url.startsWith("http://") || url.startsWith("https://");
  } catch (_) {
    return false;
  }
}

export function validateStep(step) {
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
            const wrapper = inputEl.closest(".phone-input-wrapper");
            if (wrapper) wrapper.style.borderBottomColor = "var(--error-color)";
          } else {
            inputEl.style.borderBottomColor = "var(--error-color)";
          }
        }
      } else {
        if (inputEl) {
          if (f.isPhone) {
            const wrapper = inputEl.closest(".phone-input-wrapper");
            if (wrapper) wrapper.style.borderBottomColor = "var(--border-color)";
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
    
    setAnswer(step.id, contactData);
    return true;
  }

  if (step.type === "file-upload") {
    const ans = getAnswer(step.id);
    if (step.required && !ans) {
      showError(errorContainer, "Please upload the required file to continue.");
      shakeContainer();
      return false;
    }
    return true;
  }

  const ans = getAnswer(step.id);
  const val = (ans || "").toString().trim();
  
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
