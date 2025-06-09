import { generateKeyFromTraits } from './oneTimeKey.js';

/**
 * Prompts the user for a decryption key or to recover it from traits.
 * @param {boolean} retrial - If true, show an error message for invalid key.
 * @param {boolean} cancelled - If true, show a message for cancelled decryption.
 * @returns {Promise<string|null>} Resolves with the key or null if cancelled.
 */
export function promptForDecryptionKey(retrial = false, cancelled = false) {
  return new Promise((resolve) => {
    // Create overlay and popup using class names for CSS styling
    const overlay = document.createElement('div');
    overlay.className = 'decryption-overlay';

    const popup = document.createElement('div');
    popup.className = 'decryption-popup';

    // Main input UI
    popup.innerHTML = `
      <div style="font-size:1.1em;margin-bottom:14px;">
        <b>Enter Decryption Key</b>
      </div>
      ${cancelled ? `<div class="key-cancel-msg">Decryption skipped, resetting QR code...</div>` : ''}
      ${retrial && !cancelled ? `<div class="key-error-msg">Invalid key or traits. Please try again.</div>` : ''}
      <input id="decrypt-key-input" type="password"
        class="decryption-input"
        autocomplete="off" autofocus />
      <div>
        <button id="decrypt-confirm-btn" title="Decrypt" class="decryption-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" style="vertical-align:middle;" fill="none" viewBox="0 0 24 24" stroke="#00FF00"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        </button>
        <button id="decrypt-cancel-btn" title="Cancel" class="decryption-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" style="vertical-align:middle;" fill="none" viewBox="0 0 24 24" stroke="#00FF00"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div>
        <button id="recover-from-traits-btn" class="decryption-btn recover">
          Recover from Traits
        </button>
      </div>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    const input = popup.querySelector('#decrypt-key-input');
    input.focus();

    // Confirm (Decrypt) button
    popup.querySelector('#decrypt-confirm-btn').onclick = () => {
      if (!input.value.trim()) {
        // Show error if not already shown
        if (!popup.querySelector('.key-error-msg')) {
          const errorMsg = document.createElement('div');
          errorMsg.className = 'key-error-msg';
          errorMsg.textContent = 'Key cannot be empty. Please enter a key.';
          popup.insertBefore(errorMsg, input);
        }
        input.focus();
        return;
      }
      resolve(input.value);
      document.body.removeChild(overlay);
    };

    // Cancel button
    popup.querySelector('#decrypt-cancel-btn').onclick = () => {
      // Show cancelled message and close after a short delay, then redirect
      popup.querySelector('.key-error-msg')?.remove();
      if (!popup.querySelector('.key-cancel-msg')) {
        const cancelMsg = document.createElement('div');
        cancelMsg.className = 'key-cancel-msg';
        cancelMsg.textContent = 'Decryption skipped, resetting QR code...';
        popup.insertBefore(cancelMsg, input);
      }
      setTimeout(() => {
        resolve(null);
        document.body.removeChild(overlay);
        window.location.href = window.location.origin;
      }, 2000);
    };

    // Enter key submits, Escape cancels
    input.onkeydown = (e) => {
      if (e.key === 'Enter') popup.querySelector('#decrypt-confirm-btn').click();
      if (e.key === 'Escape') popup.querySelector('#decrypt-cancel-btn').click();
    };

    // Recovery from traits
    popup.querySelector('#recover-from-traits-btn').onclick = () => {
      // Replace popup content with trait form
      const traitNames = [
        "Timestamp", "Timezone", "Timezone Offset",
        "Latitude", "Longitude", "Accuracy (m)", "IP Address"
      ];
      popup.innerHTML = `
        <div style="font-size:1.1em;margin-bottom:14px;">
          <b>Recover Key from Traits</b>
        </div>
        <form id="traits-form" class="traits-form">
          ${traitNames.map(name => `
            <div class="traits-form-row">
              <label class="traits-form-label">${name}:</label>
              <input name="${name}" type="text" class="traits-form-input" />
            </div>
          `).join('')}
        </form>
        <div style="display:flex;justify-content:center;">
          <button id="traits-confirm-btn" title="Recover" class="decryption-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" style="vertical-align:middle;" fill="none" viewBox="0 0 24 24" stroke="#00FF00"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          </button>
          <button id="traits-cancel-btn" title="Back" class="decryption-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" style="vertical-align:middle;" fill="none" viewBox="0 0 24 24" stroke="#00FF00"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      `;

      // Confirm recovery
      popup.querySelector('#traits-confirm-btn').onclick = async () => {
        const form = popup.querySelector('#traits-form');
        const traits = {};
        for (const name of traitNames) {
          traits[name] = form.elements[name].value || "";
        }
        const key = await generateKeyFromTraits(traits);
        resolve(key);
        document.body.removeChild(overlay);
      };

      // Cancel recovery (go back to main input)
      popup.querySelector('#traits-cancel-btn').onclick = () => {
        document.body.removeChild(overlay);
        // Re-open the original modal
        promptForDecryptionKey().then(resolve);
      };
    };
  });
}