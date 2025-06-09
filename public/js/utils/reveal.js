/**
 * Displays a popup with a table of decrypted NFT attributes.
 * Each row shows a trait_type and its value.
 *
 * @param {Array<Object>} attributes - Array of decrypted traits.
 * @returns {Promise<void>} Resolves when the user closes the popup.
 */
export function revealDecryptedAttributes(attributes) {
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
    popup.style.padding = '24px';
    popup.style.borderRadius = '12px';
    popup.style.fontFamily = 'monospace';
    popup.style.maxWidth = '90vw';
    popup.style.maxHeight = '80vh';
    popup.style.overflowY = 'auto';
    popup.style.boxShadow = '0 0 24px #000';

    const tableRows = attributes.map(attr => `
      <tr>
        <td style="padding: 6px 12px; border: 1px solid #444;">${attr.trait_type}</td>
        <td style="padding: 6px 12px; border: 1px solid #444;">${attr.value}</td>
      </tr>
    `).join('');

    popup.innerHTML = `
      <div style="font-size:1.2em;margin-bottom:12px;text-align:center;">
        <b>Decrypted Metadata</b>
      </div>
      <table class="decrypted-metadata-table">
        <thead>
          <tr>
            <th>Trait Type</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      <div style="text-align:center;margin-top:16px;">
        <button id="copy-reveal-popup" class="popup-action-btn" title="Copy">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" style="vertical-align:middle;" fill="none" viewBox="0 0 24 24" stroke="#00FF00"><rect x="9" y="9" width="13" height="13" rx="2" stroke-width="2"/><rect x="3" y="3" width="13" height="13" rx="2" stroke-width="2"/></svg>
        </button>
        <button id="close-reveal-popup" class="popup-action-btn" title="Close">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" style="vertical-align:middle;" fill="none" viewBox="0 0 24 24" stroke="#00FF00"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
        <span id="copy-feedback" style="margin-left:16px;color:#00FF00;display:none;">Copied!</span>
      </div>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Copy button logic (icon, greys out after click)
    const copyBtn = popup.querySelector('#copy-reveal-popup');
    copyBtn.onclick = async () => {
      try {
        await navigator.clipboard.writeText(JSON.stringify(attributes, null, 2));
        copyBtn.disabled = true;
        copyBtn.style.opacity = '0.5';
        copyBtn.style.cursor = 'not-allowed';
        const feedback = popup.querySelector('#copy-feedback');
        feedback.style.display = 'inline';
        setTimeout(() => { feedback.style.display = 'none'; }, 1200);
      } catch (e) {
        alert('Copy failed');
      }
    };

    // Close button logic
    popup.querySelector('#close-reveal-popup').onclick = () => {
      document.body.removeChild(overlay);
      resolve();
    };
  });
}