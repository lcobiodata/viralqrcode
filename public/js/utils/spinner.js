// spinner.js

export function showSpinner(msg = "Loading...") {
  let spinner = document.getElementById("spinner-overlay");
  if (!spinner) {
    spinner = document.createElement("div");
    spinner.id = "spinner-overlay";
    spinner.style.position = "fixed";
    spinner.style.top = 0;
    spinner.style.left = 0;
    spinner.style.width = "100vw";
    spinner.style.height = "100vh";
    spinner.style.background = "rgba(18,18,18,0.92)";
    spinner.style.display = "flex";
    spinner.style.flexDirection = "column";
    spinner.style.justifyContent = "center";
    spinner.style.alignItems = "center";
    spinner.style.zIndex = 9999;
    spinner.innerHTML = `
      <div style="border: 6px solid #222; border-top: 6px solid #00FF00; border-radius: 50%; width: 48px; height: 48px; animation: spin 1s linear infinite;"></div>
      <div style="margin-top: 18px; color: #00FF00; font-family: monospace; font-size: 1.1em;">${msg}</div>
      <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
    `;
    document.body.appendChild(spinner);
  } else {
    spinner.querySelector("div:nth-child(2)").textContent = msg;
    spinner.style.display = "flex";
  }
}

export function hideSpinner() {
  const spinner = document.getElementById("spinner-overlay");
  if (spinner) spinner.style.display = "none";
}
