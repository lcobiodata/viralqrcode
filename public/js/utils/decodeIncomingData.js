// utils/decodeIncomingData.js
import { recursiveDecodeData } from './decode.js';

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
      console.log("Current Decoded Data:", decodedData);

      if (json.image?.startsWith("ipfs://")) {
        metadata.image = json.image;
      }
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
