// utils/decodeIncomingData.js
import { recursiveDecodeData } from './decode.js';
import { decryptWithStringKey } from './decrypt.js';
import { promptForDecryptionKey } from './passKey.js';
import { revealDecryptedAttributes } from './reveal.js';

/**
 * Extracts and decodes the `data` parameter from the URL, updates metadata with
 * previous image and generation info if applicable. Decrypts encrypted attributes if found.
 *
 * @param {Object} metadata - NFT metadata object to be updated.
 * @returns {string|null} - Decoded data string or null.
 */
export async function decodeIncomingData(metadata) {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get("data");
  const genTracker = { nextGeneration: 1 };
  const decodedData = await recursiveDecodeData(encoded, genTracker);

  if (decodedData) {
    try {
      const json = JSON.parse(decodedData);
      console.log("Current Decoded Data:", decodedData);

      if (json.image?.startsWith("ipfs://")) {
        metadata.image = json.image;
      }

      metadata.attributes = json.attributes ?? [];

      // 🔐 Check for encrypted traits
      const hasEncrypted =
        metadata.attributes.some(a => a.trait_type === "Cyphertext") &&
        metadata.attributes.some(a => a.trait_type === "IV") &&
        metadata.attributes.some(a => a.trait_type === "Salt");

      if (hasEncrypted) {
        const ciphertext = JSON.parse(metadata.attributes.find(a => a.trait_type === "Cyphertext").value);
        const iv = JSON.parse(metadata.attributes.find(a => a.trait_type === "IV").value);
        const salt = JSON.parse(metadata.attributes.find(a => a.trait_type === "Salt").value);

        const password = await promptForDecryptionKey();
        if (password) {
          try {
            const decryptedAttrs = await decryptWithStringKey(password, { ciphertext, iv, salt });

            // ✅ Step 2: Show decrypted data in table (block execution)
            await revealDecryptedAttributes(decryptedAttrs);

            // ✅ Step 3: Apply decrypted data to metadata
            metadata.attributes = decryptedAttrs;
          } catch (e) {
            console.error("Decryption failed:", e);
            alert("Decryption failed. Please check your key.");
            return decodedData;
          }
        } else {
          return decodedData; // user cancelled
        }
      }

      // 🎯 Now proceed with normal logic after decryption
      metadata.attributes = metadata.attributes.filter(a => a.trait_type !== "Generation");
      metadata.attributes.push({ trait_type: "Generation", value: genTracker.nextGeneration });

    } catch (e) {
      console.error("Invalid JSON in decoded data:", e);
    }
  } else {
    const hasGen = metadata.attributes.some(a => a.trait_type === "Generation");
    if (!hasGen) {
      metadata.attributes.push({ trait_type: "Generation", value: 1 });
    }
  }

  return decodedData;
}
