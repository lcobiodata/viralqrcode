// utils/applyTimeAnchor.js
import { fetchTimeAnchor } from './fetch.js';

/**
 * Fetches and attaches the corresponding Bitcoin block as "Time Anchor"
 * for the timestamp in metadata.
 *
 * @param {Object} metadata - NFT metadata containing timestamp attribute.
 */
export async function applyTimeAnchor(metadata) {
  const tsAttr = metadata.attributes.find(attr => attr.trait_type === "Timestamp");
  if (!tsAttr?.value) return;

  const ts = Math.floor(new Date(tsAttr.value).getTime() / 1000);
  const anchor = await fetchTimeAnchor(ts);
  if (anchor) {
    // Split "Bitcoin Block 900648" into ["Bitcoin", "Block", "900648"]
    const parts = anchor.title.split(" ");
    if (parts.length >= 3) {
      const traitType = parts.slice(0, -1).join(" "); // "Bitcoin Block"
      const traitValue = parts[parts.length - 1];     // "900648"
      metadata.attributes.push({ trait_type: traitType, value: traitValue });
    }
  }
}
