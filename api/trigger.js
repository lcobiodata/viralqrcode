export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Only POST allowed');
  
    const { png_base64, fork_id } = req.body;
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
    const timestamp = new Date().toISOString();
  
    const body = {
      event_type: "upload_qr_png",
      client_payload: { png_base64, fork_id, client_ip: ip, timestamp }
    };
  
    await fetch("https://api.github.com/repos/lcobiodata/viralqrcode/dispatches", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
  
    res.status(200).json({ ok: true, fork_id });
  }