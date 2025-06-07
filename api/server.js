import FormData from 'form-data';

export default async function handler(req, res) {
  try {
    const { endpoint, timestamp } = req.query;

    if (endpoint === "oracle") {
      if (!timestamp) return res.status(400).json({ error: "Missing timestamp" });

      const idsUrl = process.env.ANCHOR_IDS_URL;
      const fallbackBaseUrl = process.env.ANCHOR_FALLBACK_URL;

      const anchorRes = await fetch(idsUrl);
      if (!anchorRes.ok) return res.status(502).json({ error: "Failed to fetch anchor source" });

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
      const ipinfoUrl = process.env.IPINFO_URL;
      const ipinfoToken = process.env.IPINFO_TOKEN;
      const url = ipinfoToken ? `${ipinfoUrl}?token=${ipinfoToken}` : ipinfoUrl;

      const ipRes = await fetch(url);
      if (!ipRes.ok) return res.status(502).json({ error: "Failed to fetch IP info" });

      const ipData = await ipRes.json();
      return res.status(200).json(ipData);
    }

    if (endpoint === "upload") {
      const metadata = req.body;

      const token = process.env.LIGHTHOUSE_API_KEY;
      if (!token) {
        return res.status(500).json({ error: "Missing API key" });
      }

      // Convert metadata to blob and FormData
      const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
      const formData = new FormData();
      formData.append("file", blob, "metadata.json");

      // Upload to Lighthouse
      const uploadRes = await fetch("https://node.lighthouse.storage/api/v0/add", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.text();
        return res.status(502).json({ error: "Upload failed", detail: err });
      }

      const result = await uploadRes.json();
      const cid = result.Hash;

      return res.status(200).json({ cid });
    }


    res.status(404).json({ error: "Unknown endpoint" });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}
