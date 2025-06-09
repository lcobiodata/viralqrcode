import { capitalize } from './capitalize.js';

/**
 * Extracts query parameters from the current URL and formats them
 * as an array of objects with trait_type and value properties.
 * Skips the 'data' key since it's reserved for app control.
 * If a key appears multiple times, its values are grouped into an array.
 * 
 * @returns {Array<Object>} - Example: [{ trait_type: "Color", value: ["Blue", "Red"] }, ...]
 */
export function getQueryAttributes() {
  const params = new URLSearchParams(window.location.search);
  const grouped = {};

  for (const [key, value] of params.entries()) {
    if (key.toLowerCase() === 'data') continue; // skip 'data' param
    const capKey = capitalize(key);
    if (grouped[capKey]) {
      // If already an array, push; otherwise, convert to array
      if (Array.isArray(grouped[capKey])) {
        grouped[capKey].push(value);
      } else {
        grouped[capKey] = [grouped[capKey], value];
      }
    } else {
      grouped[capKey] = value;
    }
  }

  return Object.entries(grouped).map(([trait_type, value]) => ({
    trait_type,
    value: Array.isArray(value) ? value : [value]
  }));
}