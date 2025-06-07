// main.js
import { buildNFTMetadata } from './metadata.js';
import { showSpinner, hideSpinner } from './utils/spinner.js';
import { recursiveDecodeData } from './utils/decode.js';
import { fetchTimeAnchor } from './utils/fetch.js';
import { generateOneTimeKey, showOneTimeKeyPopup } from './utils/oneTimeKey.js';
import { encryptWithStringKey } from './utils/encrypt.js';
import { QRCodeRenderer } from './qr/QRCodeRenderer.js';
import { ImageBackgroundQRCodeRenderer } from './qr/ImageBackgroundQRCodeRenderer.js';

window.onload = () => {
  generateQRCode();
};

async function generateQRCode() {
  showSpinner("Generating QR Code...");
  const canvas = document.getElementById("bitmap");
  canvas.onclick = null;

  buildNFTMetadata(async (metadata) => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get('data');
    const genTracker = { nextGeneration: 1 };
    const decodedData = await recursiveDecodeData(data, genTracker);

    if (decodedData) {
      try {
        const decodedJson = JSON.parse(decodedData);
        console.log("Current Decoded Data:", decodedData);

        if (decodedJson.image?.startsWith("ipfs://")) {
          metadata.image = decodedJson.image;
        }
        metadata.attributes = metadata.attributes.filter(a => a.trait_type !== "Generation");
        metadata.attributes.push({ trait_type: "Generation", value: genTracker.nextGeneration });
      } catch (e) {
        console.error("Invalid JSON in decoded data:", e);
      }
    } else {
      // Add this block to ensure Generation is set to 1 if missing and no decoded data
      const hasGeneration = metadata.attributes.some(a => a.trait_type === "Generation");
      if (!hasGeneration) {
        metadata.attributes.push({ trait_type: "Generation", value: 1 });
      }
    }

    const tsAttr = metadata.attributes.find(attr => attr.trait_type === "Timestamp");
    let timeAnchor = null;
    if (tsAttr?.value) {
      const ts = Math.floor(new Date(tsAttr.value).getTime() / 1000);
      timeAnchor = await fetchTimeAnchor(ts);
    }

    // Move timeAnchor attribute addition here, before filtering/encrypting
    if (timeAnchor) {
      metadata.attributes.push({ trait_type: "Time Anchor", value: timeAnchor.title });
    }

    const fingerprintTraits = [
      // Identity
      "Kiosk ID",

      // Environment
      "Platform",
      "User Agent",
      "Timezone",
      "Timezone Offset",

      // Network
      "IP Address",

      // Location
      "Latitude",
      "Longitude",
      "Accuracy (m)",

      // Timing
      "Timestamp",
      "Time Anchor"
    ];

    const fingerprintAttrs = metadata.attributes.filter(attr => fingerprintTraits.includes(attr.trait_type));

    // Add intermediate log before encryption (pretty-printed, object style)
    console.log("Data To Be Encrypted:", JSON.stringify({
      // Add "..." to indicate this is a subset of the full metadata
      "...": "...",
      attributes: fingerprintAttrs,
    }, null, 2));
    
    metadata.attributes = metadata.attributes.filter(attr => !fingerprintTraits.includes(attr.trait_type));
    
    const plaintext = JSON.stringify(fingerprintAttrs);
    const plaintextBytes = new TextEncoder().encode(plaintext);

    // Generate one-time key and show popup
    const oneTimeKey = generateOneTimeKey();
    showOneTimeKeyPopup(oneTimeKey);

    // Use the one-time key for encryption
    const encrypted = await encryptWithStringKey(oneTimeKey, plaintextBytes);

    metadata.attributes.push(
      { trait_type: "Cyphertext", value: JSON.stringify(encrypted.ciphertext) },
      { trait_type: "IV", value: JSON.stringify(encrypted.iv) },
      { trait_type: "Salt", value: JSON.stringify(encrypted.salt) }
    );

    console.log("Data To Be Encoded:", JSON.stringify(metadata, null, 2));

    const jsonString = JSON.stringify(metadata, null, 2);
    const compressed = pako.deflate(jsonString);
    const base58 = Base58.encode(compressed);
    const payload = `${window.location.origin}?data=${encodeURIComponent(base58)}`;

    console.log("QR Code Data:", payload);

    let imageUrl = metadata.image?.startsWith("ipfs://")
      ? metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")
      : null;

    console.log("Image URL:", imageUrl);

    const qr = !imageUrl
      ? new QRCodeRenderer(canvas, payload, {
          margin: 2,
          color: { dark: "#00FF00", light: "#121212" }
        })
      : new ImageBackgroundQRCodeRenderer(canvas, payload, imageUrl, {
          margin: 2,
          color: { dark: "#00FF0077", light: "#00000000" }
        });
    
    qr.render(() => {
      canvas.onclick = () => qr.preview();
      hideSpinner();

      let showDecoded = false;
      let showEncoded = false;
      const displayEl = document.getElementById("json-display");

      // document.getElementById("toggle-decoded").onclick = () => {
      //   showDecoded = !showDecoded;
      //   showEncoded = false;
      //   if (showDecoded) {
      //     displayEl.textContent = decodedData || "No decoded data.";
      //     displayEl.style.display = "block";
      //   } else {
      //     displayEl.style.display = "none";
      //   }
      // };

      // document.getElementById("toggle-encoded").onclick = () => {
      //   showEncoded = !showEncoded;
      //   showDecoded = false;
      //   if (showEncoded) {
      //     displayEl.textContent = JSON.stringify(metadata, null, 2);
      //     displayEl.style.display = "block";
      //   } else {
      //     displayEl.style.display = "none";
      //   }
      // };
    });
  });
}
