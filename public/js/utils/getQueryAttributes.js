/**
 * Extracts query parameters from the current URL and formats them
 * as an array of objects with trait_type and value properties.
 * Skips the 'data' key since it's reserved for app control.
 * Each key and value is capitalized for consistency.
 * 
 * @returns {Array<Object>} - Example: [{ trait_type: "Color", value: "Blue" }, ...]
 */

import { capitalize } from './capitalize.js';

export function getQueryAttributes() {
  const params = new URLSearchParams(window.location.search);
  const attrs = [];

  for (const [key, value] of params.entries()) {
    if (key.toLowerCase() === 'data') continue; // skip 'data' param

    attrs.push({
      trait_type: capitalize(key),
      value: capitalize(value)
    });
  }

  return attrs;
}
