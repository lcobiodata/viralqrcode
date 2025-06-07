import { generateOneTimeKey, showOneTimeKeyPopup } from './oneTimeKey.js';
import { encryptWithStringKey } from './encrypt.js';

/**
 * Compresses and encrypts all traits from metadata.attributes,
 * clears the attribute list, and returns encrypted traits.
 *
 * @param {Object} metadata - NFT metadata object.
 * @returns {Array<Object>} - Encrypted container traits only.
 */
export async function encryptMetadataAttributes(metadata) {
  const attrsToEncrypt = metadata.attributes;
  console.log("All Traits To Be Encrypted:", JSON.stringify({ attributes: attrsToEncrypt }, null, 2));

  // Clear original attributes
  metadata.attributes = [];

  // Deflate and encode the data
  const json = JSON.stringify(attrsToEncrypt);
  const compressed = window.pako.deflate(json); // binary Uint8Array
  const plaintext = new Uint8Array(compressed);

  // Encrypt
  const key = generateOneTimeKey();
  showOneTimeKeyPopup(key);

  const encrypted = await encryptWithStringKey(key, plaintext);

  return [
    { trait_type: "Cyphertext", value: JSON.stringify(encrypted.ciphertext) },
    { trait_type: "IV", value: JSON.stringify(encrypted.iv) },
    { trait_type: "Salt", value: JSON.stringify(encrypted.salt) }
  ];
}
