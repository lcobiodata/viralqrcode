// decode.js

export async function recursiveDecodeData(dataParam, genTracker = { nextGeneration: 0 }) {
  let decodedData = null;
  let currentData = dataParam;
  let depth = 0;

  while (currentData && depth < 10) {
    try {
      const decoded = Base58.decode(currentData);
      const inflated = pako.inflate(decoded, { to: 'string' });
      decodedData = inflated;

      const json = JSON.parse(inflated);
      if (json && typeof json === "object") {
        const generationAttr = json.attributes?.find(attr => attr.trait_type === "Generation");
        if (generationAttr) {
          const gen = parseInt(generationAttr.value, 10);
          if (!isNaN(gen) && gen + 1 > genTracker.nextGeneration) {
            genTracker.nextGeneration = gen + 1;
          }
        } else if (genTracker.nextGeneration < 1) {
          genTracker.nextGeneration = 1;
        }

        const nextData = new URL(json.external_url, window.location.origin).searchParams.get('data');
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

  return decodedData;
}
