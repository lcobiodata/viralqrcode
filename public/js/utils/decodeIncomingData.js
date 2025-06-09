// utils/decodeIncomingData.js
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

        // Look for Generation in decryptedAttributes, not metadata.attributes
        const genAttr = Array.isArray(decryptedAttributes)
          ? decryptedAttributes.find(attr => attr.trait_type === "Generation")
          : null;
        if (genAttr) {
          genTracker.nextGeneration = genAttr.value + 1;
        }
        // Remove encrypted attributes from metadata
        metadata.attributes = metadata.attributes.filter(attr =>
          attr.trait_type !== "Cyphertext" &&
          attr.trait_type !== "IV" &&
          attr.trait_type !== "Salt"
        );
      }

      if (json.image?.startsWith("ipfs://")) {
        metadata.image = json.image;
      }
      // Only update Generation trait in metadata
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