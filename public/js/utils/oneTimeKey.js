// oneTimeKey.js

// Generate a truly random, one-time key (32 bytes, base64)
export function generateOneTimeKey() {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

// Show popup with key, copy button, and warning
export function showOneTimeKeyPopup(key) {
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'rgba(0,0,0,0.85)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = 9999;

  const popup = document.createElement('div');
  popup.style.background = '#222';
  popup.style.color = '#00FF00';
  popup.style.padding = '32px 24px 24px 24px';
  popup.style.borderRadius = '12px';
  popup.style.fontFamily = 'monospace';
  popup.style.textAlign = 'center';
  popup.style.maxWidth = '90vw';
  popup.style.boxShadow = '0 0 24px #000';

  popup.innerHTML = `
    <div style="font-size:1.2em;margin-bottom:16px;">
      <b>One-Time Encryption Key</b>
    </div>
    <div style="margin-bottom:12px;">
      <span style="word-break:break-all;user-select:all;" id="popup-key">${key}</span>
      <button id="copy-key-btn" style="margin-left:8px;vertical-align:middle;background:#111;border:none;color:#00FF00;padding:6px 10px;border-radius:4px;cursor:pointer;">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" style="vertical-align:middle;" fill="none" viewBox="0 0 24 24" stroke="#00FF00"><rect x="9" y="9" width="13" height="13" rx="2" stroke-width="2"/><rect x="3" y="3" width="13" height="13" rx="2" stroke-width="2"/></svg>
      </button>
    </div>
    <div style="color:#ff0;font-size:0.95em;margin-bottom:16px;">
      <b>Warning:</b> This key will <b>not</b> be shown again.<br>
      Copy and save it now. Without it, you cannot decrypt your data.
    </div>
    <button id="close-popup-btn" style="background:#111;border:none;color:#00FF00;padding:8px 18px;border-radius:4px;cursor:pointer;font-size:1em;">Close</button>
  `;

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  const copyBtn = popup.querySelector('#copy-key-btn');
  copyBtn.onclick = () => {
    const keyText = popup.querySelector('#popup-key').textContent;
    navigator.clipboard.writeText(keyText);
    copyBtn.disabled = true;
    copyBtn.style.opacity = '0.5';
    copyBtn.style.cursor = 'not-allowed';
  };

  popup.querySelector('#close-popup-btn').onclick = () => {
    document.body.removeChild(overlay);
  };
}