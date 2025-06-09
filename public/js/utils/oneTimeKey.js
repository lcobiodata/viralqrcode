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

/**
 * Show popup with key, copy button, and warning, and show passphrase traits as a table.
 * Uses HTML template if available.
 * @param {string} key
 * @param {Object} traits
 */
export function showOneTimeKeyPopup(key, traits) {
  const overlay = document.createElement('div');
  overlay.className = 'decryption-overlay';

  // Try to use a template if present
  const template = document.getElementById('one-time-key-template');
  let popup;
  if (template) {
    popup = template.content.firstElementChild.cloneNode(true);
    // Fill in key
    popup.querySelector('#popup-key').textContent = key;
    // Fill in traits table
    const traitRows = Object.entries(traits)
      .map(([type, value]) =>
        `<tr>
          <td class="traits-form-label">${type}</td>
          <td class="traits-form-input" style="background:#111;">${value ? value : "<i style='color:#888'>(empty)</i>"}</td>
        </tr>`
      ).join("");
    popup.querySelector('#traits-table').innerHTML = traitRows;
  } else {
    // Fallback: show alert if template is missing
    alert('One-time key modal template not found!');
    return;
  }

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  // Copy button logic
  const copyBtn = popup.querySelector('#copy-key-btn');
  if (copyBtn) {
    copyBtn.onclick = () => {
      const keyText = popup.querySelector('#popup-key').textContent;
      navigator.clipboard.writeText(keyText);
      copyBtn.disabled = true;
      copyBtn.style.opacity = '0.5';
      copyBtn.style.cursor = 'not-allowed';
    };
  }

  // Close button logic
  popup.querySelector('#close-popup-btn').onclick = () => {
    document.body.removeChild(overlay);
  };
}