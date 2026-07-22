import { getState } from "./state.js";
import { BACKEND_URL } from "./constants.js";
import { dataURItoBlob } from "./utils.js";
import { renderEnding } from "./render.js";

export function submitForm() {
  const state = getState();
  const activeFormId = state.activeFormId;
  const answers = state.answers;

  const finalPayload = {
    formId: activeFormId,
    timestamp: new Date().toISOString(),
    entries: answers
  };

  const formData = new FormData();
  formData.append("formId", activeFormId);
  
  for (const key in answers) {
    const val = answers[key];
    if (val && typeof val === "object" && val.dataUrl) {
      const blob = dataURItoBlob(val.dataUrl);
      formData.append(key, blob, val.name);
    } else if (val && typeof val === "object") {
      for (const subKey in val) {
        formData.append(`${key}_${subKey}`, val[subKey]);
      }
    } else {
      formData.append(key, val);
    }
  }

  const currentSlide = document.querySelector(".step-slide");
  const showSuccess = () => renderEnding("ending-success");
  if (currentSlide) {
    currentSlide.classList.add("slide-out-left");
    setTimeout(showSuccess, 250);
  } else {
    showSuccess();
  }

  console.log("SUBMITTING DATA:", finalPayload);

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
    alert("Form submitted successfully! Check console logs for form data. (Paste a BACKEND_URL in constants.js to send submissions to an email/database dashboard)");
  }
}
