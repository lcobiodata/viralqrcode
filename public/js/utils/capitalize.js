/**
 * Capitalizes the first letter of every word in a string and lowercases the rest.
 * @param {string} str
 * @returns {string}
 */
export function capitalize(str) {
  return String(str)
    .split(' ')
    .map(word =>
      word.length
        ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        : ''
    )
    .join(' ');
}