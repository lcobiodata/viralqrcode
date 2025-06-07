// main.js
import { buildNFTMetadata } from './metadata.js';
import { showSpinner, hideSpinner } from './utils/spinner.js';
import { decodeIncomingData } from './utils/decodeIncomingData.js';
import { applyTimeAnchor } from './utils/applyTimeAnchor.js';
import { encryptFingerprint } from './utils/encryptFingerprint.js';
import { generateQRPayload } from './utils/generateQRPayload.js';
import { resolveImageUrl } from './utils/resolveImageUrl.js';
import { renderQRCode } from './utils/renderQRCode.js';

// Start QR code generation on window load
window.onload = () => generateQRCode();

async function generateQRCode() {
  showSpinner("Generating QR Code...");
  const canvas = document.getElementById("bitmap");
  canvas.onclick = null;

  buildNFTMetadata(async (metadata) => {
    const decodedData = await decodeIncomingData(metadata);
    await applyTimeAnchor(metadata);
    const encryptedAttrs = await encryptFingerprint(metadata);

    metadata.attributes.push(...encryptedAttrs);
    const payload = await generateQRPayload(metadata);
    if (!payload) {
      alert("Failed to upload metadata.");
      hideSpinner();
      return;
    }

    const imageUrl = resolveImageUrl(metadata.image);

    await renderQRCode(canvas, payload, imageUrl, decodedData);
  });
}