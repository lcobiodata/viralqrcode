import { generateKeyFromTraits } from './oneTimeKey.js';

/**
 * Prompts the user for a decryption key or to recover it from traits.
 * @returns {Promise<string|null>} Resolves with the key or null if cancelled.
 */
export function promptForDecryptionKey() {
  return new Promise((resolve) => {
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
    popup.style.padding = '28px 24px 20px 24px';
    popup.style.borderRadius = '12px';
    popup.style.fontFamily = 'monospace';
    popup.style.textAlign = 'center';
    popup.style.maxWidth = '90vw';
    popup.style.boxShadow = '0 0 24px #000';

    // Main input UI
    popup.innerHTML = `
      <div style="font-size:1.1em;margin-bottom:14px;">
        <b>Enter Decryption Key</b>
      </div>
      <input id="decrypt-key-input" type="password"
        style="background:#111;color:#00FF00;border:1px solid #00FF00;padding:8px 12px;border-radius:6px;font-family:monospace;font-size:1em;width:80%;margin-bottom:18px;outline:none;"
        autocomplete="off" autofocus />
      <div>
        <button id="decrypt-confirm-btn" title="Decrypt"
          style="background:#111;border:none;color:#00FF00;padding:8px 14px;border-radius:6px;cursor:pointer;margin-right:16px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" style="vertical-align:middle;" fill="none" viewBox="0 0 24 24" stroke="#00FF00"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        </button>
        <button id="decrypt-cancel-btn" title="Cancel"
          style="background:#111;border:none;color:#00FF00;padding:8px 14px;border-radius:6px;cursor:pointer;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" style="vertical-align:middle;" fill="none" viewBox="0 0 24 24" stroke="#00FF00"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div style="margin-top:18px;">
        <button id="recover-from-traits-btn" style="background:#111;border:none;color:#0ff;padding:7px 14px;border-radius:6px;cursor:pointer;">
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
      resolve(input.value);
      document.body.removeChild(overlay);
    };

    // Cancel button
    popup.querySelector('#decrypt-cancel-btn').onclick = () => {
      resolve(null);
      document.body.removeChild(overlay);
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
        <form id="traits-form" style="margin-bottom:16px;display:flex;flex-direction:column;align-items:center;">
          ${traitNames.map(name => `
            <div style="margin-bottom:8px;display:flex;align-items:center;justify-content:center;">
              <label style="color:#0ff;display:inline-block;width:140px;text-align:right;margin-right:8px;">${name}:</label>
              <input name="${name}" type="text" style="background:#111;color:#00FF00;border:1px solid #00FF00;padding:5px 8px;border-radius:5px;font-family:monospace;width:60%;" />
            </div>
          `).join('')}
        </form>
        <div style="display:flex;justify-content:center;">
          <button id="traits-confirm-btn" title="Recover"
            style="background:#111;border:none;color:#00FF00;padding:8px 14px;border-radius:6px;cursor:pointer;margin-right:16px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" style="vertical-align:middle;" fill="none" viewBox="0 0 24 24" stroke="#00FF00"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          </button>
          <button id="traits-cancel-btn" title="Back"
            style="background:#111;border:none;color:#00FF00;padding:8px 14px;border-radius:6px;cursor:pointer;">
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