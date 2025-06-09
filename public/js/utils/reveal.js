/**
 * Displays a popup with a table of decrypted NFT attributes.
 * Each row shows a trait_type and its value.
 *
 * @param {Array<Object>} attributes - Array of decrypted traits.
 * @returns {Promise<void>} Resolves when the user closes the popup.
 */
export function revealDecryptedAttributes(attributes) {
  return new Promise((resolve) => {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'decrypted-overlay';

    // Clone template
    const template = document.getElementById('decrypted-metadata-popup-template');
    const popupFragment = template.content.cloneNode(true);
    const popup = popupFragment.querySelector('.decrypted-popup-inner');

    // Fill table rows
    const tbody = popup.querySelector('tbody');
    tbody.innerHTML = attributes.map(attr => `
      <tr>
        <td class="decrypted-metadata-cell">${attr.trait_type}</td>
        <td class="decrypted-metadata-cell">${attr.value}</td>
      </tr>
    `).join('');

    overlay.appendChild(popupFragment);
    document.body.appendChild(overlay);

    // Copy button logic
    const copyBtn = overlay.querySelector('#copy-reveal-popup');
    copyBtn.onclick = async () => {
      try {
        await navigator.clipboard.writeText(JSON.stringify(attributes, null, 2));
        copyBtn.disabled = true;
        copyBtn.style.opacity = '0.5';
        copyBtn.style.cursor = 'not-allowed';
        const feedback = overlay.querySelector('#copy-feedback');
        feedback.style.display = 'inline';
        setTimeout(() => { feedback.style.display = 'none'; }, 1200);
      } catch (e) {
        alert('Copy failed');
      }
    };

    // Close button logic
    overlay.querySelector('#close-reveal-popup').onclick = () => {
      document.body.removeChild(overlay);
      resolve();
    };
  });
}