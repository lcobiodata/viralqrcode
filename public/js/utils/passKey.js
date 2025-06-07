/**
 * Prompts the user to enter a decryption key using the same styling
 * as the one-time key popup.
 *
 * @returns {Promise<string|null>} - Resolves with the key or null if cancelled.
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
    popup.style.padding = '28px 20px 20px 20px';
    popup.style.borderRadius = '12px';
    popup.style.fontFamily = 'monospace';
    popup.style.textAlign = 'center';
    popup.style.maxWidth = '90vw';
    popup.style.boxShadow = '0 0 24px #000';

    popup.innerHTML = `
      <div style="font-size:1.2em;margin-bottom:12px;">
        <b>Enter Decryption Key</b>
      </div>
      <input type="text" id="decrypt-key-input" placeholder="Paste key here" style="width:90%;padding:8px;font-family:monospace;font-size:1em;border-radius:6px;border:none;margin-bottom:16px;">
      <div>
        <button id="submit-decrypt-key" style="margin-right:10px;background:#111;border:none;color:#00FF00;padding:8px 16px;border-radius:4px;cursor:pointer;font-size:1em;">Decrypt</button>
        <button id="cancel-decrypt-key" style="background:#111;border:none;color:#f33;padding:8px 16px;border-radius:4px;cursor:pointer;font-size:1em;">Cancel</button>
      </div>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    popup.querySelector('#submit-decrypt-key').onclick = () => {
      const key = popup.querySelector('#decrypt-key-input').value.trim();
      document.body.removeChild(overlay);
      resolve(key || null);
    };

    popup.querySelector('#cancel-decrypt-key').onclick = () => {
      document.body.removeChild(overlay);
      resolve(null);
    };
  });
}
