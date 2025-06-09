import { generateKeyFromTraits } from './oneTimeKey.js';

/**
 * Prompts the user for a decryption key or to recover it from traits.
 * @param {boolean} retrial - If true, show an error message for invalid key.
 * @param {boolean} cancelled - If true, show a message for cancelled decryption.
 * @returns {Promise<string|null>} Resolves with the key or null if cancelled.
 */
export function promptForDecryptionKey(retrial = false, cancelled = false) {
  return new Promise((resolve) => {
    // Use template from index.html
    const template = document.getElementById('decryption-modal-template');
    if (!template) {
      alert('Decryption modal template not found!');
      resolve(null);
      return;
    }

    // Create overlay and clone modal
    const overlay = document.createElement('div');
    overlay.className = 'decryption-overlay';
    const popup = template.content.firstElementChild.cloneNode(true);

    // Set title
    const titleDiv = popup.querySelector('.decryption-modal-title');
    if (titleDiv) titleDiv.innerHTML = '<b>Enter Decryption Key</b>';

    // Show/hide error/cancel messages
    const errorDiv = popup.querySelector('.key-error-msg');
    const cancelDiv = popup.querySelector('.key-cancel-msg');
    if (cancelled && cancelDiv) {
      cancelDiv.textContent = 'Decryption skipped, resetting QR code...';
      cancelDiv.style.display = '';
    } else if (cancelDiv) {
      cancelDiv.style.display = 'none';
    }
    if (retrial && !cancelled && errorDiv) {
      errorDiv.textContent = 'Invalid key or traits. Please try again.';
      errorDiv.style.display = '';
    } else if (errorDiv) {
      errorDiv.style.display = 'none';
    }

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    const input = popup.querySelector('#decrypt-key-input');
    if (input) input.focus();

    // Confirm (Decrypt) button
    popup.querySelector('#decrypt-confirm-btn').onclick = () => {
      if (!input.value.trim()) {
        // Show error if not already shown
        if (errorDiv && errorDiv.style.display === 'none') {
          errorDiv.textContent = 'Key cannot be empty. Please enter a key.';
          errorDiv.style.display = '';
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
      if (errorDiv) errorDiv.style.display = 'none';
      if (cancelDiv && cancelDiv.style.display === 'none') {
        cancelDiv.textContent = 'Decryption skipped, resetting QR code...';
        cancelDiv.style.display = '';
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
      // Use traits recovery template
      const traitsTemplate = document.getElementById('traits-recovery-template');
      if (!traitsTemplate) {
        alert('Traits recovery modal template not found!');
        resolve(null);
        document.body.removeChild(overlay);
        return;
      }
      const traitsPopup = traitsTemplate.content.firstElementChild.cloneNode(true);

      // Replace popup content
      overlay.replaceChild(traitsPopup, popup);

      // Confirm recovery
      traitsPopup.querySelector('#traits-confirm-btn').onclick = async () => {
        const form = traitsPopup.querySelector('#traits-form');
        const traitNames = [
          "Timestamp", "Timezone", "Timezone Offset",
          "Latitude", "Longitude", "Accuracy (m)", "IP Address"
        ];
        const traits = {};
        for (const name of traitNames) {
          traits[name] = form.elements[name].value || "";
        }
        const key = await generateKeyFromTraits(traits);
        resolve(key);
        document.body.removeChild(overlay);
      };

      // Cancel recovery (go back to main input)
      traitsPopup.querySelector('#traits-cancel-btn').onclick = () => {
        document.body.removeChild(overlay);
        // Re-open the original modal
        promptForDecryptionKey().then(resolve);
      };
    };
  });
}