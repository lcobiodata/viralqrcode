export default async function handler(req, res) {
  try {
    const { endpoint, timestamp } = req.query;

    if (endpoint === "oracle") {
      if (!timestamp) {
        return res.status(400).json({ error: "Missing timestamp" });
      }

      const idsUrl = process.env.ANCHOR_IDS_URL;
      const itemBaseUrl = process.env.ANCHOR_ITEM_URL;
      const fallbackBaseUrl = process.env.ANCHOR_FALLBACK_URL;

      const anchorRes = await fetch(idsUrl);
      if (!anchorRes.ok) {
        return res.status(502).json({ error: "Failed to fetch anchor source" });
      }

      const ids = await anchorRes.json();
      for (const id of ids) {
        const itemRes = await fetch(`${itemBaseUrl}${id}.json`);
        if (!itemRes.ok) continue;

        const item = await itemRes.json();
        if (item?.time <= Number(timestamp)) {
          return res.status(200).json({
            title: item.title,
            url: item.url || `${fallbackBaseUrl}/item?id=${id}`,
            id
          });
        }
      }

      return res.status(404).json({ error: "No anchor found" });
    }

    res.status(404).json({ error: "Unknown endpoint" });
  } catch (err) {
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}
