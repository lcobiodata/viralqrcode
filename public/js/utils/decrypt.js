/**
 * Decrypts AES-GCM encrypted and compressed metadata using a password.
 *
 * @param {string} password - The string key used to derive the AES key.
 * @param {Object} encryptedData - Object with ciphertext, iv, and salt arrays.
 * @returns {Array<Object>} - Decrypted and decompressed metadata attributes.
 */
export async function decryptWithStringKey(password, encryptedData) {
  const { ciphertext, iv, salt } = encryptedData;

  const encoder = new TextEncoder();
  const keyMaterial = encoder.encode(password);

  const passwordKey = await crypto.subtle.importKey(
    "raw", keyMaterial, "PBKDF2", false, ["deriveKey"]
  );

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: new Uint8Array(salt),
      iterations: 100000,
      hash: "SHA-256"
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["decrypt"]
  );

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: new Uint8Array(iv)
    },
    derivedKey,
    new Uint8Array(ciphertext)
  );

  const decompressed = window.pako.inflate(new Uint8Array(decrypted), { to: 'string' });
  return JSON.parse(decompressed); // should return an array of metadata attributes
}
