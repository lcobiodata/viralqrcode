// metadata.js
import { fetchIPInfo } from './utils/fetch.js';

export function buildNFTMetadata(callback, userAttributes = []) {
  if (userAttributes.length > 0) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const location = {
            lat: +pos.coords.latitude.toFixed(4),
            lon: +pos.coords.longitude.toFixed(4),
            acc: Math.round(pos.coords.accuracy)
          };
          const ipInfo = await fetchIPInfo();
          callback(createMetadata(location, ipInfo, userAttributes));
        },
        async () => {
          const ipInfo = await fetchIPInfo();
          callback(createMetadata({}, ipInfo, userAttributes));
        },
        { maximumAge: 30000, timeout: 5000 }
      );
    } else {
      fetchIPInfo().then(ipInfo =>
        callback(createMetadata({}, ipInfo, userAttributes))
      );
    }
  } else {
    // If no user attributes, just call back with minimal metadata (no IP/location)
    callback(createMetadata({}, {}, userAttributes));
  }

  function createMetadata(location, ipInfo = {}, userAttributes = []) {
    const attributes = [
      ...userAttributes,
      { trait_type: "Timestamp", value: new Date().toISOString() },
      { trait_type: "Timezone", value: Intl.DateTimeFormat().resolvedOptions().timeZone },
      { trait_type: "Timezone Offset", value: (new Date().getTimezoneOffset() / -60) + " hours" },
    ];

    if (location.lat !== undefined) {
      attributes.push(
        { trait_type: "Latitude", value: location.lat },
        { trait_type: "Longitude", value: location.lon },
        { trait_type: "Accuracy (m)", value: location.acc }
      );
    }

    if (ipInfo?.ip) {
      attributes.push({ trait_type: "IP Address", value: ipInfo.ip });
    }

    return { attributes };
  }
}