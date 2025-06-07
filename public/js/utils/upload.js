// utils/upload.js

/**
 * Uploads metadata to IPFS via your serverless /api/server endpoint using nft.storage.
 * This avoids exposing the API key to the client and keeps the frontend payload small.
 *
 * @param {Object} metadata - The JSON object to upload.
 * @returns {Promise<string|null>} - The resulting IPFS URL or null on failure.
 */
export async function uploadMetadataToIPFS(metadata) {
  try {
    const res = await fetch('/api/server?endpoint=upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metadata)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Upload to IPFS failed:", errText);
      return null;
    }

    const { cid } = await res.json();
    const gateway = "https://ipfs.io/ipfs"; // public gateway, hardcoded
    return `${gateway}/${cid}`;
  } catch (e) {
    console.error("Failed to upload metadata to IPFS:", e);
    return null;
  }
}
