import { fetchIPInfo } from './utils/fetch.js';

export function buildNFTMetadata(callback) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const location = {
          lat: +pos.coords.latitude.toFixed(4),
          lon: +pos.coords.longitude.toFixed(4),
          acc: Math.round(pos.coords.accuracy)
        };
        const ipInfo = await fetchIPInfo(); // always include IP info
        callback(createMetadata(location, ipInfo));
      },
      async () => {
        // If user denies location, fallback to IP-based location
        const ipInfo = await fetchIPInfo();
        callback(createMetadata({}, ipInfo));
      },
      { maximumAge: 30000, timeout: 5000 }
    );
  } else {
    // Geolocation not supported
    fetchIPInfo().then(ipInfo => callback(createMetadata({}, ipInfo)));
  }

  function createMetadata(location, ipInfo = {}) {
    const attributes = [
      { trait_type: "Kiosk ID", value: getKioskId() },
      { trait_type: "User Agent", value: navigator.userAgent },
      { trait_type: "Platform", value: navigator.platform },
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

    if (ipInfo?.ip) attributes.push({ trait_type: "IP Address", value: ipInfo.ip });

    return {
      name: "Anonymous browser fingerprint",
      description: "A unique, ephemeral browser fingerprint generated for this session.",
      external_url: window.location.origin,
      attributes
    };
  }
}

function getKioskId() {
  let id = localStorage.getItem('kioskId');
  if (!id) {
    id = Math.random().toString(36).substring(2, 6).toUpperCase();
    localStorage.setItem('kioskId', id);
  }
  return 'kiosk-' + id;
}
