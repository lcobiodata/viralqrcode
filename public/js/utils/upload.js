// utils/upload.js

/**
 * Uploads metadata to IPFS using Lighthouse Storage via browser SDK (CDN).
 * Lighthouse API key is injected via environment variable at build time.
 *
 * @param {Object} metadata - The JSON object to upload.
 * @returns {Promise<string|null>} - The resulting IPFS gateway URL or null on failure.
 */
export async function uploadMetadataToIPFS(metadata) {
  try {
    if (!window.lighthouse) {
      throw new Error("Lighthouse SDK not found. Make sure it's loaded via CDN.");
    }

    const apiKey = import.meta.env.VITE_LIGHTHOUSE_API_KEY || process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;

    if (!apiKey) {
      console.error("Missing Lighthouse API key. Define it as VITE_LIGHTHOUSE_API_KEY or NEXT_PUBLIC_LIGHTHOUSE_API_KEY.");
      return null;
    }

    const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
    const file = new File([blob], 'metadata.json');

    const response = await window.lighthouse.uploadBuffer(file, apiKey);

    const cid = response?.data?.Hash;
    if (!cid) {
      console.error("Lighthouse upload failed:", response);
      return null;
    }

    return `https://gateway.lighthouse.storage/ipfs/${cid}`;
  } catch (e) {
    console.error("Failed to upload metadata to IPFS via Lighthouse:", e);
    return null;
  }
}
