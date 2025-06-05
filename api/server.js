export default async function handler(req, res) {
  try {
    const { endpoint, timestamp } = req.query;

    if (endpoint === "oracle") {
      if (!timestamp) {
        return res.status(400).json({ error: "Missing timestamp" });
      }
      // Use Hacker News as anchor
      const url = "https://hacker-news.firebaseio.com/v0/newstories.json";
      const hnRes = await fetch(url);
      if (!hnRes.ok) {
        return res.status(502).json({ error: "Failed to fetch anchor source" });
      }
      const ids = await hnRes.json();
      for (const id of ids) {
        const itemRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        if (!itemRes.ok) continue;
        const item = await itemRes.json();
        if (item && item.time && item.time <= Number(timestamp)) {
          return res.status(200).json({
            title: item.title,
            url: item.url || `https://news.ycombinator.com/item?id=${id}`,
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