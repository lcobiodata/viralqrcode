// Suggestion for passKey.js or similar

/**
 * Prompts the user for a decryption key in a styled modal with icon buttons.
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
  });
}