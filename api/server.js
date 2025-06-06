export default async function handler(req, res) {
  try {
    const { endpoint, timestamp } = req.query;

    if (endpoint === "oracle") {
      if (!timestamp) {
        return res.status(400).json({ error: "Missing timestamp" });
      }

      const idsUrl = process.env.ANCHOR_IDS_URL;               // e.g., https://blockstream.info/api/blocks
      const fallbackBaseUrl = process.env.ANCHOR_FALLBACK_URL; // e.g., https://blockstream.info/block/

      const anchorRes = await fetch(idsUrl);
      if (!anchorRes.ok) {
        return res.status(502).json({ error: "Failed to fetch anchor source" });
      }

      const blocks = await anchorRes.json();
      for (const block of blocks) {
        const blockId = block.id || block.hash;
        const blockTime = block.timestamp || block.time;

        if (blockTime <= Number(timestamp)) {
          return res.status(200).json({
            title: `Bitcoin Block ${block.height}`,
            url: `${fallbackBaseUrl}/${blockId}`,
            id: blockId
          });
        }
      }

      return res.status(404).json({ error: "No anchor found" });
    }

    if (endpoint === "ipinfo") {
      const ipinfoUrl = process.env.IPINFO_URL;           // e.g., https://ipinfo.io/json
      const ipinfoToken = process.env.IPINFO_TOKEN;       // Your IPinfo token
      const url = ipinfoToken ? `${ipinfoUrl}?token=${ipinfoToken}` : ipinfoUrl;

      const ipRes = await fetch(url);
      if (!ipRes.ok) {
        return res.status(502).json({ error: "Failed to fetch IP info" });
      }

      const ipData = await ipRes.json();
      return res.status(200).json(ipData);
    }

    res.status(404).json({ error: "Unknown endpoint" });
  } catch (err) {
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}
