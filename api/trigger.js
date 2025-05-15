export default async function handler(req, res) {
  // Set CORS headers for all requests
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Respond to preflight request
  if (req.method === 'OPTIONS') {
    return res.status(204).end(); // No content
  }

  // Only allow POST beyond this point
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Only POST allowed');
  }

  // Extract client info and payload
  const { png_base64, fork_id } = req.body;
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
  const timestamp = new Date().toISOString();

  const body = {
    event_type: "upload_qr_png",
    client_payload: { png_base64, fork_id, client_ip: ip, timestamp }
  };

  // Forward to GitHub Actions via repository_dispatch
  const response = await fetch(process.env.GITHUB_DISPATCH_URL, { // Refer to config.json for the URL
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  // Handle GitHub errors
  if (!response.ok) {
    const errorText = await response.text();
    return res.status(500).json({ ok: false, error: errorText });
  }

  // All good
  res.status(200).json({ ok: true, fork_id });
}
