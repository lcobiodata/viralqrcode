// metadata.js

export function buildNFTMetadata(callback) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const location = {
          lat: +pos.coords.latitude.toFixed(4),
          lon: +pos.coords.longitude.toFixed(4),
          acc: Math.round(pos.coords.accuracy)
        };
        callback(createMetadata(location));
      },
      () => callback(createMetadata({})),
      { maximumAge: 30000, timeout: 5000 }
    );
  } else {
    callback(createMetadata({}));
  }

  function createMetadata(location) {
    return {
      name: "Anonymous browser fingerprint",
      description: "A unique, ephemeral browser fingerprint generated for this session.",
      external_url: window.location.origin,
      attributes: [
        { trait_type: "Kiosk ID", value: getKioskId() },
        { trait_type: "User Agent", value: navigator.userAgent },
        { trait_type: "Platform", value: navigator.platform },
        { trait_type: "Timestamp", value: new Date().toISOString() },
        { trait_type: "Timezone", value: Intl.DateTimeFormat().resolvedOptions().timeZone },
        { trait_type: "Timezone Offset", value: (new Date().getTimezoneOffset() / -60) + " hours" },
        ...(location.lat !== undefined ? [
          { trait_type: "Latitude", value: location.lat },
          { trait_type: "Longitude", value: location.lon },
          { trait_type: "Accuracy (m)", value: location.acc }
        ] : [])
      ]
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
