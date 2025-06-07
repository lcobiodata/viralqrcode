// utils/resolveImageUrl.js

/**
 * Converts an IPFS image URI to a public HTTP gateway URL.
 *
 * @param {string} image - Possibly IPFS-based image URI.
 * @returns {string|null} - Gateway URL or null if not IPFS.
 */
export function resolveImageUrl(image) {
  return image?.startsWith("ipfs://") ? image.replace("ipfs://", "https://ipfs.io/ipfs/") : null;
}
