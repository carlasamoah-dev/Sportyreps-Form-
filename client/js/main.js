import { FORMS } from "./config.js";
import { setState, getState, resetState } from "./state.js";
import { initRender, renderStep } from "./render.js";
import { setupGlobalListeners } from "./events.js";

function init() {
  const urlParams = new URLSearchParams(window.location.search);
  const paramFormId = urlParams.get("form");
  
  let activeFormId = "football-talent";
  if (paramFormId && FORMS[paramFormId]) {
    activeFormId = paramFormId;
  }

  const formConfig = FORMS[activeFormId];
  const formContainer = document.getElementById("form-container");

  if (!formConfig) {
    if (formContainer) {
      formContainer.innerHTML = `<div class="error-msg">Form not found. Please verify the URL.</div>`;
    }
    return;
  }

  setState({
    activeFormId,
    formConfig
  });

  resetState();
  initRender();
  renderStep();
  setupGlobalListeners();
}

window.addEventListener("DOMContentLoaded", init);
