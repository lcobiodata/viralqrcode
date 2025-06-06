// encrypt.js

export async function encryptWithStringKey(password, plaintextBytes) {
  const encoder = new TextEncoder();
  const keyMaterial = encoder.encode(password);

  const passwordKey = await crypto.subtle.importKey(
    "raw", keyMaterial, "PBKDF2", false, ["deriveKey"]
  );

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derivedKey = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    derivedKey,
    plaintextBytes
  );

  return {
    iv: Array.from(iv),
    salt: Array.from(salt),
    ciphertext: Array.from(new Uint8Array(ciphertext))
  };
}
