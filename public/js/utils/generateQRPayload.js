// generateQRPayload.js

/**
 * Deflates and base58-encodes metadata for QR encoding.
 *
 * @param {Object} metadata - Final metadata object.
 * @returns {string} - Base58-encoded, deflated metadata string.
 */
export function generateQRPayload(metadata) {
  const jsonString = JSON.stringify(metadata, null, 2);
  console.log("Data To Be Encoded:", jsonString);

  // Use global pako and Base58 from CDN
  const deflated = window.pako.deflate(jsonString);
  const encoded = window.Base58.encode(deflated);
  payload = `${window.location.origin}?data=${encoded}`
  console.log("QR Code Data:", payload);

  return payload;

  // --- Upload logic (commented out) ---
  // import { uploadMetadataToIPFS } from './upload.js';
  // const cid = await uploadMetadataToIPFS(metadata);
  // if (!cid) {
  //   console.error("Failed to upload metadata to IPFS");
  //   return null;
  // }
  // const url = `${window.location.origin}?cid=${cid}`;
  // console.log("QR Code Data:", url);
  // return url;
}