import lighthouse from '@lighthouse-web3/sdk';
import crypto from 'crypto';

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
      const metadata = typeof req.body === "object" ? req.body : JSON.parse(req.body);

      const apiKey = process.env.LIGHTHOUSE_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Missing API key" });
      }

      // Compute SHA-256 hash of the content for the filename
      const jsonString = JSON.stringify(metadata);
      const hash = crypto.createHash('sha256').update(jsonString).digest('hex');
      const fileName = `${hash}.json`;

      // Upload using the SDK
      const response = await lighthouse.uploadBuffer(
        Buffer.from(jsonString),
        fileName,
        apiKey
      );

      const cid = response?.data?.Hash;
      if (!cid) {
        return res.status(502).json({ error: "Upload failed", detail: response });
      }

      return res.status(200).json({ cid, fileName });
    }

    res.status(404).json({ error: "Unknown endpoint" });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}