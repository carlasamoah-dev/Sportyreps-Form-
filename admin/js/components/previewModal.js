export function initPreviewModal() {
  const modal = document.getElementById("preview-modal");
  const closeBtn = document.getElementById("close-modal");

  closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
    document.getElementById("modal-body").innerHTML = ""; // Clear content
  });
}

export function openPreview(url, type) {
  const modal = document.getElementById("preview-modal");
  const modalBody = document.getElementById("modal-body");

  if (type === "image") {
    modalBody.innerHTML = `<img src="${url}" alt="Attachment preview" />`;
  } else if (type === "pdf") {
    modalBody.innerHTML = `<iframe src="${url}"></iframe>`;
  } else {
    modalBody.innerHTML = `<p>Cannot preview this file type.</p>`;
  }

  modal.classList.remove("hidden");
}
