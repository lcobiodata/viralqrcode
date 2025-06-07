/**
 * Capitalizes the first letter of a string and lowercases the rest.
 * @param {*} str 
 * @returns 
 */

export function capitalize(str) {
  return str.length
    ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
    : '';
}
