// utils/encodeMetadata.js

/**
 * Compresses and Base58-encodes metadata into a self-referring URL payload.
 *
 * @param {Object} metadata - Final metadata object.
 * @returns {string} - Encoded URL payload with compressed metadata.
 */
export function encodeMetadata(metadata) {
  const jsonString = JSON.stringify(metadata, null, 2);
  const compressed = pako.deflate(jsonString);
  const base58 = Base58.encode(compressed);
  const url = `${window.location.origin}?data=${encodeURIComponent(base58)}`;

  console.log("Data To Be Encoded:", jsonString);
  console.log("QR Code Data:", url);

  return url;
}
