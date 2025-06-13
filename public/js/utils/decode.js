/**
 * This module provides a function to recursively decode Base58 encoded data,
 * inflate it using pako, and parse it as JSON. It directly updates `metadata.generation`
 * based on the decoded data.
 *
 * @module decode
 */
export async function recursiveDecodeData(dataParam, metadata) {
  let decodedData = null;
  let currentData = dataParam;
  let depth = 0;
  let maxGeneration = 0;

  while (currentData && depth < 10) {
    try {
      const decoded = Base58.decode(currentData);
      const inflated = pako.inflate(decoded, { to: 'string' });
      decodedData = inflated;

      const json = JSON.parse(inflated);
      if (json && typeof json === "object") {
        const gen = parseInt(json.generation, 10);

        if (!isNaN(gen)) {
          maxGeneration = Math.max(maxGeneration, gen);
        }

        const nextData = json.external_url
          ? new URL(json.external_url, window.location.origin).searchParams.get('data')
          : null;

        if (nextData && nextData !== currentData) {
          currentData = nextData;
          depth++;
        } else {
          break;
        }
      } else {
        break;
      }
    } catch (e) {
      console.error("Recursive decode failed:", e);
      break;
    }
  }

  metadata.generation = Math.max(1, maxGeneration + 1);
  return decodedData;
}