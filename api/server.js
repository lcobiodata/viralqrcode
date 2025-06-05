import fetch from 'node-fetch';
export default async function handler(req, res) {
  const { endpoint, timestamp } = req.query;

  if (endpoint === "oracle") {
    if (!timestamp) {
      return res.status(400).json({ error: "Missing timestamp" });
    }
    // Secret: fetch from Reddit, but don't mention Reddit in the response
    const url = "https://www.reddit.com/r/news/new.json?limit=100";
    const redditRes = await fetch(url);
    const data = await redditRes.json();
    const targetDate = new Date(Number(timestamp) * 1000).toISOString().slice(0, 10);
    let best = null;
    for (const post of data.data.children) {
      const postTime = post.data.created_utc;
      const postDate = new Date(postTime * 1000).toISOString().slice(0, 10);
      if (postDate !== targetDate) continue;
      if (postTime <= timestamp) {
        if (!best || postTime > best.data.created_utc) best = post;
      }
    }
    if (best) {
      res.status(200).json({
        title: best.data.title,
        url: "https://reddit.com" + best.data.permalink,
        id: best.data.id
      });
    } else {
      res.status(404).json({ error: "No anchor found" });
    }
    return;
  }

  // Add more endpoints here as needed

  res.status(404).json({ error: "Unknown endpoint" });
}