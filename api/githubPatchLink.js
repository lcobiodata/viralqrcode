export default function handler(req, res) {
  const fullRepo = process.env.GITHUB_REPO; // e.g. "lucarrijoliveira/viralqrcode"

  if (!fullRepo) {
    return res.status(500).json({ error: "GITHUB_REPO not set" });
  }

  const issueUrl = `https://github.com/${fullRepo}/issues/new?title=Privacy+notice+feedback&body=Please+describe+your+concern+or+suggestion+below:`;

  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
  res.status(200).json({ url: issueUrl });
}
