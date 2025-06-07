// utils/upload.js

/**
 * Uploads metadata to IPFS by calling the backend upload endpoint.
 * The backend handles the Lighthouse API key securely.
 *
 * @param {Object} metadata - The JSON object to upload.
 * @returns {Promise<string|null>} - The resulting IPFS CID or null on failure.
 */
export async function uploadMetadataToIPFS(metadata) {
  try {
    const res = await fetch('/api/server?endpoint=upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metadata)
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("Upload failed:", err);
      return null;
    }

    const { cid } = await res.json();
    return cid ? `https://gateway.lighthouse.storage/ipfs/${cid}` : null;
  } catch (e) {
    console.error("Failed to upload metadata to IPFS:", e);
    return null;
  }
}