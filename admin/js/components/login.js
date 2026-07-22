export function initLogin() {
  const overlay = document.getElementById("login-overlay");
  const dashboard = document.getElementById("dashboard");
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const passwordInput = document.getElementById("admin-password");
  const errorText = document.getElementById("login-error");

  // Simple hardcoded auth as requested
  const verifyLogin = () => {
    if (passwordInput.value === "admin123") {
      overlay.classList.remove("active");
      dashboard.classList.remove("hidden");
      errorText.textContent = "";
      passwordInput.value = "";
    } else {
      errorText.textContent = "Incorrect password.";
    }
  };

  loginBtn.addEventListener("click", verifyLogin);
  passwordInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") verifyLogin();
  });

  logoutBtn.addEventListener("click", () => {
    dashboard.classList.add("hidden");
    overlay.classList.add("active");
  });
}
