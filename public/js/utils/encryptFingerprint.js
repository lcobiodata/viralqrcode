// utils/encryptFingerprint.js
import { generateOneTimeKey, showOneTimeKeyPopup } from './oneTimeKey.js';
import { encryptWithStringKey } from './encrypt.js';

/**
 * Encrypts only sensitive fingerprint traits from metadata, removes them, and returns
 * ciphertext, IV, and salt as new traits. Non-sensitive traits remain as plain attributes.
 *
 * @param {Object} metadata - NFT metadata object.
 * @returns {Array<Object>} - Encrypted trait objects.
 */
export async function encryptFingerprint(metadata) {
  // Only sensitive traits to encrypt
  const traitsToEncrypt = [
    "IP Address", "Latitude", "Longitude", "Accuracy (m)"
  ];

  const attrsToEncrypt = metadata.attributes.filter(a => traitsToEncrypt.includes(a.trait_type));
  console.log("Sensitive Data To Be Encrypted:", JSON.stringify({ attributes: attrsToEncrypt }, null, 2));

  // Remove sensitive traits from attributes
  metadata.attributes = metadata.attributes.filter(a => !traitsToEncrypt.includes(a.trait_type));
  const plaintext = new TextEncoder().encode(JSON.stringify(attrsToEncrypt));

  const key = generateOneTimeKey();
  showOneTimeKeyPopup(key);

  const encrypted = await encryptWithStringKey(key, plaintext);

  return [
    { trait_type: "Cyphertext", value: JSON.stringify(encrypted.ciphertext) },
    { trait_type: "IV", value: JSON.stringify(encrypted.iv) },
    { trait_type: "Salt", value: JSON.stringify(encrypted.salt) }
  ];
}