import { generateKeyFromTraits, showOneTimeKeyPopup } from './oneTimeKey.js';
import { encryptWithStringKey } from './encrypt.js';

/**
 * Compresses and encrypts only URI search param traits from metadata.attributes,
 * clears the attribute list, and returns encrypted traits.
 *
 * @param {Object} metadata - NFT metadata object.
 * @returns {Array<Object>} - Encrypted container traits only.
 */
export async function encryptMetadataAttributes(metadata) {
  // Only keep traits from URI search params
  const attrsToEncrypt = metadata.attributes.filter(attr =>
    !["Timestamp", "Timezone", "Timezone Offset", "Latitude", "Longitude", "Accuracy (m)", "IP Address"].includes(attr.trait_type)
  );
  console.log("Traits To Be Encrypted:", JSON.stringify({ attributes: attrsToEncrypt }, null, 2));

  // Extract the 7 traits for key derivation, using empty string if missing
  const traitNames = [
    "Timestamp", "Timezone", "Timezone Offset",
    "Latitude", "Longitude", "Accuracy (m)", "IP Address"
  ];
  const traits = {};
  for (const name of traitNames) {
    const found = metadata.attributes.find(attr => attr.trait_type === name);
    traits[name] = found ? found.value : "";
  }

  // Clear original attributes
  metadata.attributes = [];

  // Deflate and encode the data
  const json = JSON.stringify(attrsToEncrypt);
  const compressed = window.pako.deflate(json);
  const plaintext = new Uint8Array(compressed);

  // Derive key
  const key = await generateKeyFromTraits(traits);
  showOneTimeKeyPopup(key, traits); // Pass the traits object, not the string

  const encrypted = await encryptWithStringKey(key, plaintext);

  return [
    { trait_type: "Cyphertext", value: JSON.stringify(encrypted.ciphertext) },
    { trait_type: "IV", value: JSON.stringify(encrypted.iv) },
    { trait_type: "Salt", value: JSON.stringify(encrypted.salt) }
  ];
}