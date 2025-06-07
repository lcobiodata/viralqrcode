// utils/encryptFingerprint.js
import { generateOneTimeKey, showOneTimeKeyPopup } from './oneTimeKey.js';
import { encryptWithStringKey } from './encrypt.js';

/**
 * Encrypts sensitive fingerprint traits from metadata, removes them, and returns
 * ciphertext, IV, and salt as new traits.
 *
 * @param {Object} metadata - NFT metadata object.
 * @returns {Array<Object>} - Encrypted trait objects.
 */
export async function encryptFingerprint(metadata) {
  const traitsToEncrypt = [
    "Kiosk ID", "Platform", "User Agent", "Timezone", "Timezone Offset",
    "IP Address", "Latitude", "Longitude", "Accuracy (m)",
    "Timestamp", "Time Anchor"
  ];

  const attrsToEncrypt = metadata.attributes.filter(a => traitsToEncrypt.includes(a.trait_type));
  console.log("Data To Be Encrypted:", JSON.stringify({ "...": "...", attributes: attrsToEncrypt }, null, 2));

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
