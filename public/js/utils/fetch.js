// fetch.js

export async function fetchTimeAnchor(timestamp) {
  try {
    const res = await fetch(`/api/server?endpoint=oracle&timestamp=${timestamp}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error("Failed to fetch time anchor:", e);
    return null;
  }
}

export async function fetchIPInfo() {
  try {
    const res = await fetch(`/api/server?endpoint=ipinfo`);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error("Failed to fetch IP info:", e);
    return null;
  }
}
