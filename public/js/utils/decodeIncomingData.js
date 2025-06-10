import { recursiveDecodeData } from './decode.js';
import { promptForDecryptionKey } from './passKey.js';
import { decryptWithStringKey } from './decrypt.js';
import { revealDecryptedAttributes } from './reveal.js';

/**
 * Extracts and decodes the `data` parameter from the URL, updates metadata with
 * previous image and generation info if applicable.
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
      console.log("Current Decoded Data:", json);

      // Check for encrypted attributes in the decoded JSON, not metadata
      const hasEncrypted =
        ["Cyphertext", "IV", "Salt"].every(type =>
          (json.attributes || []).some(attr => attr.trait_type === type)
        );
      console.log("Has Encrypted Attributes:", hasEncrypted);

      if (hasEncrypted) {
        let decryptedAttributes = null;
        let retrial = false;
        while (true) {
          const password = await promptForDecryptionKey(retrial);
          if (password === null) {
            // User clicked cancel
            window.location.href = window.location.origin;
            return null;
          }
          if (!password) {
            // Empty password, prompt again
            retrial = true;
            continue;
          }
          const encryptedData = {
            ciphertext: JSON.parse(json.attributes.find(attr => attr.trait_type === "Cyphertext").value),
            iv: JSON.parse(json.attributes.find(attr => attr.trait_type === "IV").value),
            salt: JSON.parse(json.attributes.find(attr => attr.trait_type === "Salt").value)
          };
          try {
            decryptedAttributes = await decryptWithStringKey(password, encryptedData);
            break; // success!
          } catch (e) {
            retrial = true;
          }
        }
        console.log("Decrypted Attributes:", decryptedAttributes);
        await revealDecryptedAttributes(decryptedAttributes);

        metadata.attributes = metadata.attributes.filter(attr =>
          attr.trait_type !== "Cyphertext" &&
          attr.trait_type !== "IV" &&
          attr.trait_type !== "Salt"
        );
      }

      if (json.image?.startsWith("ipfs://")) {
        metadata.image = json.image;
      }

      metadata.generation = genTracker.nextGeneration;
    } catch (e) {
      console.error("Invalid JSON in decoded data:", e);
    }
  } else {
    if (metadata.generation == null) {
      metadata.generation = 1;
    }
  }

  return decodedData;
}
