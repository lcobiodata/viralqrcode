// oneTimeKey.js

/**
 * Deterministically generates a key from selected traits using PBKDF2.
 * Handles missing traits by using empty strings for unavailable values.
 * @param {Object} traits - Object with the 7 traits.
 * @returns {Promise<string>} - Base64 key.
 */
export async function generateKeyFromTraits(traits) {
  // Use empty string if any trait is missing or undefined
  const passphrase = [
    traits["Timestamp"] ?? "",
    traits["Timezone"] ?? "",
    traits["Timezone Offset"] ?? "",
    traits["Latitude"] ?? "",
    traits["Longitude"] ?? "",
    traits["Accuracy (m)"] ?? "",
    traits["IP Address"] ?? ""
  ].join("|");

  const salt = "ViralQRCodeSalt";
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw", enc.encode(passphrase), { name: "PBKDF2" }, false, ["deriveBits", "deriveKey"]
  );
  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: enc.encode(salt),
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    256
  );
  return btoa(String.fromCharCode(...new Uint8Array(derivedBits)));
}

// Show popup with key, copy button, and warning, and show passphrase traits as a table
export function showOneTimeKeyPopup(key, traits) {
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

  // Build table rows for traits
  const traitRows = Object.entries(traits)
    .map(([type, value]) =>
      `<tr>
        <td style="padding:2px 8px 2px 0;color:#0ff;">${type}</td>
        <td style="padding:2px 0 2px 8px;background:#111;border-radius:4px;">${value || "<i style='color:#888'>(empty)</i>"}</td>
      </tr>`
    ).join("");

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
    <div style="color:#0ff;font-size:0.95em;margin-bottom:12px;">
      <b>Pass Phrase Traits:</b>
      <table style="margin:8px auto 0 auto;text-align:left;font-size:0.98em;">
        ${traitRows}
      </table>
    </div>
    <div style="color:#ff0;font-size:0.95em;margin-bottom:16px;">
      <b>Warning:</b> This key will <b>not</b> be shown again.<br>
      Please <b>copy the key</b> now, or make sure you <b>memorize or securely save all the traits above</b>.<br>
      You will need <b>either the key or the exact same traits</b> to decrypt your data later.
    </div>
    <button id="close-popup-btn" title="Close"
      style="background:#111;border:none;color:#00FF00;padding:8px 14px;border-radius:6px;cursor:pointer;">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" style="vertical-align:middle;" fill="none" viewBox="0 0 24 24" stroke="#00FF00"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
    </button>
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