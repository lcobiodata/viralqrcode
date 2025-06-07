/**
 * Uploads metadata to IPFS using the backend upload endpoint,
 * and returns a gateway-accessible URL suitable for QR encoding.
 *
 * @param {Object} metadata - Final metadata object.
 * @returns {Promise<string|null>} - IPFS gateway URL or null on failure.
 */
import { uploadMetadataToIPFS } from './upload.js';

export async function encodeMetadata(metadata) {
  const jsonString = JSON.stringify(metadata, null, 2);
  console.log("Data To Be Encoded:", jsonString);

  const cid = await uploadMetadataToIPFS(metadata);
  if (!cid) {
    console.error("Failed to upload metadata to IPFS");
    return null;
  }

  const url = `${window.location.origin}?cid=${cid}`;
  console.log("QR Code Data:", url);

  return url;
}
