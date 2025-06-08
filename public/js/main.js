// main.js
// Early redirect if needed
if (typeof window.ethereum !== "undefined") {
  if (!window.location.search.includes('data=')) {
    fetch('/api/hiddenData')
      .then(res => res.json())
      .then(obj => {
        console.log("Fetched hidden data:", obj.data);
        window.location.href = `${window.location.origin}/?data=${obj.data}`;
      });
  }
}

// ...rest of main.js...
import { buildNFTMetadata } from './metadata.js';
import { showSpinner, hideSpinner } from './utils/spinner.js';
import { decodeIncomingData } from './utils/decodeIncomingData.js';
import { applyTimeAnchor } from './utils/applyTimeAnchor.js';
import { encryptMetadataAttributes } from './utils/encryptMetadataAttributes.js';
import { generateQRPayload } from './utils/generateQRPayload.js';
import { resolveImageUrl } from './utils/resolveImageUrl.js';
import { renderQRCode } from './utils/renderQRCode.js';

// Called only after modal is dismissed
export function startApp() {
  generateQRCode();
}

async function generateQRCode() {
  showSpinner("Generating QR Code...");
  const canvas = document.getElementById("bitmap");
  canvas.onclick = null;

  buildNFTMetadata(async (metadata) => {
    const decodedData = await decodeIncomingData(metadata);
    await applyTimeAnchor(metadata);
    const encryptedAttrs = await encryptMetadataAttributes(metadata);

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
