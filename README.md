# viralqrcode 🦠

A self-replicating QR code that spreads like a digital pandemic. Scan one code, and it spawns another—forever. Use responsibly… or don’t. Chaos is just a scan away.

![image](https://github.com/user-attachments/assets/e68c96c1-9b5c-4f22-b4a8-9cf294cfdd9b)


# 🧬 Viral QR NFT System — From Zero to Hero

> A beginner-friendly system that turns your visitors into NFT miners.
> Powered by QR codes, GitHub, IPFS, and OpenSea. No gas fees.

---

## 📦 What You'll Build

* 🖼️ A self-replicating NFT minting system
* 🔁 QR codes that mint and evolve
* 💾 Fully decentralized storage (IPFS)
* 🧠 Metadata-rich NFTs pointing to their ancestry
* 🚀 A web app you can deploy today — for free

---

## ✅ Requirements

| Tool/Account | Used For                         | Link                                |
| ------------ | -------------------------------- | ----------------------------------- |
| GitHub       | Hosting code + automation        | [GitHub](https://github.com/signup) |
| Vercel       | Serverless backend (free tier)   | [Vercel](https://vercel.com/signup) |
| nft.storage  | IPFS hosting (images + metadata) | [nft.storage](https://nft.storage)  |
| MetaMask     | Wallet for NFT ownership         | [MetaMask](https://metamask.io/)    |

---

## 🧰 One-Time Setup

### 🔧 Install Git + Node.js

### macOS

To install Git and Node.js on macOS, run the following command:

```bash
brew install git node
```

### Linux (Debian/Ubuntu)

To install Git and Node.js on Linux, run the following command:

```bash
sudo apt update && sudo apt install git nodejs npm
```

### Windows

To install Git and Node.js on Windows:

1. Install [Git for Windows](https://git-scm.com/download/win).
2. Install [Node.js](https://nodejs.org/).
3. Use “Git Bash” or “Command Prompt”.

</details>

---

## 🧱 Step-by-Step Build

---

### 🔁 1. Fork this repo

Click here: [🔁 Fork Repo](https://github.com/lcobiodata/viralqrcode/fork)

---

### 🧑‍💻 1.1. Clone (Optional)

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

---

### 🗃️ 2. The Project Structure

```plaintext

.
├── api/
│   └── trigger.js           # Vercel proxy to GitHub Action
├── index.html               # Your frontend (QR generator)
├── .github/
│   └── workflows/
│       └── upload.yml       # GitHub Action (IPFS + metadata)
├── metadata/                # Auto-created: stores full JSON per fork
├── cids/                    # Auto-created: maps fork ID → CID
└── README.md                # This file

```

---

### 🛰️ 3. Deploy to Vercel

1. Go to [https://vercel.com/import](https://vercel.com/import)
2. Connect your GitHub repo
3. Set one **Environment Variable**:

| Key            | Value                                          |
| -------------- | ---------------------------------------------- |
| `GITHUB_TOKEN` | GitHub Personal Access Token with `repo` scope |

> Get it at [https://github.com/settings/tokens](https://github.com/settings/tokens)

### 📸 3.1. Test It Live

#### 3.1.1. Visit your deployed Vercel app, e.g. `https://your-vercel-app.vercel.app`

#### 3.1.2. The page will

* Render a QR code

* Upload it to IPFS

* Trigger GitHub Action

* Mint NFT metadata

* Render the next-generation QR containing that metadata

#### 3.1.3. Open `https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/metadata/` to see all minted forks

---

### 🔐 4. Add GitHub Secrets

Go to your GitHub repo → **Settings → Secrets → Actions** → New secret:

| Secret Name         | Value                                                           |
| ------------------- | --------------------------------------------------------------- |
| `NFT_STORAGE_TOKEN` | From [https://nft.storage/account](https://nft.storage/account) |
| `CREATOR_ADDRESS`   | Your MetaMask wallet (0x...)                                    |
| `COLLECTION_NAME`   | Optional, like `Viral QR Series`                                |
| `LICENSE_TEXT`      | e.g. `CC0`, `MIT`, or custom copyright                          |

---

### 🌐 5. Upload Trigger (Vercel Proxy)

Create `/api/trigger.js`:

```js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Only POST allowed');

  const { png_base64, fork_id } = req.body;
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
  const timestamp = new Date().toISOString();

  const body = {
    event_type: "upload_qr_png",
    client_payload: { png_base64, fork_id, client_ip: ip, timestamp }
  };

  await fetch("https://api.github.com/repos/YOUR_USER/YOUR_REPO/dispatches", {
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
```

> ✅ Replace `YOUR_USER/YOUR_REPO` with your actual GitHub repo

---

### ⚙️ 6. GitHub Action

Create `.github/workflows/upload.yml`:

```yaml
name: Upload QR NFT

on:
  repository_dispatch:
    types: [upload_qr_png]

jobs:
  upload:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Decode PNG
        run: |
          mkdir -p metadata cids
          echo "${{ github.event.client_payload.png_base64 }}" | base64 --decode > viralqrcode.png

      - name: Upload Image to IPFS
        run: |
          curl -X POST https://api.nft.storage/upload \
            -H "Authorization: Bearer ${{ secrets.NFT_STORAGE_TOKEN }}" \
            -H "Content-Type: image/png" \
            --data-binary @viralqrcode.png \
            -o image.json
          IMAGE_CID=$(jq -r '.value.cid' image.json)
          echo "IMAGE_CID=$IMAGE_CID" >> $GITHUB_ENV

      - name: Generate Metadata
        run: |
          cat <<EOF > metadata.json
          {
            "name": "Viral QR NFT",
            "description": "Minted by ${{ github.event.client_payload.client_ip }} on ${{ github.event.client_payload.timestamp }}",
            "image": "ipfs://$IMAGE_CID",
            "creator": "${{ secrets.CREATOR_ADDRESS }}",
            "collection": "${{ secrets.COLLECTION_NAME }}",
            "license": "${{ secrets.LICENSE_TEXT }}",
            "attributes": [
              { "trait_type": "Client IP", "value": "${{ github.event.client_payload.client_ip }}" },
              { "trait_type": "Timestamp", "value": "${{ github.event.client_payload.timestamp }}" }
            ]
          }
EOF

      - name: Upload Metadata to IPFS
        run: |
          curl -X POST https://api.nft.storage/upload \
            -H "Authorization: Bearer ${{ secrets.NFT_STORAGE_TOKEN }}" \
            -H "Content-Type: application/json" \
            --data-binary @metadata.json \
            -o meta.json
          META_CID=$(jq -r '.value.cid' meta.json)
          echo "META_CID=$META_CID" >> $GITHUB_ENV

      - name: Save Files
        run: |
          cp metadata.json metadata/fork-${{ github.event.client_payload.fork_id }}.json
          echo "{ \"cid\": \"$META_CID\" }" > cids/fork-${{ github.event.client_payload.fork_id }}.json

      - name: Commit
        run: |
          git config user.name "QR Bot"
          git config user.email "qr@bot.com"
          git add metadata/ cids/
          git commit -m "Fork ${{ github.event.client_payload.fork_id }}"
          git push
```

---

### 🖼️ 7. Create Frontend

In `index.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Viral QR Code</title>
  <style>
    body {
      background: #121212;
      color: white;
      margin: 0;
      font-family: sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
    }
    canvas {
      image-rendering: pixelated;
      margin-top: 1rem;
      border: 2px solid #00FF00;
    }
    img {
      width: 256px;
      margin-top: 1rem;
    }
  </style>
</head>
<body>
  <canvas id="bitmap"></canvas>
  <div id="preview"></div>

  <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js"></script>
  <script>
    const canvas = document.getElementById("bitmap");

    function renderQRCode(text) {
      return new Promise((resolve, reject) => {
        QRCode.toCanvas(canvas, text, {
          margin: 2,
          color: { dark: "#00FF00", light: "#121212" }
        }, err => err ? reject(err) : resolve());
      });
    }

    function downloadCanvas(filename = "viralqrcode") {
      const link = document.createElement("a");
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }

    async function toBase64(canvas) {
      const blob = await new Promise(r => canvas.toBlob(r, "image/png"));
      const ab = await blob.arrayBuffer();
      return btoa(String.fromCharCode(...new Uint8Array(ab)));
    }

    async function sendToProxy(base64, forkId) {
      await fetch("/api/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ png_base64: base64, fork_id: forkId })
      });
    }

    async function pollForMetadata(forkId, tries = 30, delay = 3000) {
      const url = `https://raw.githubusercontent.com/YOUR_USER/YOUR_REPO/main/metadata/fork-${forkId}.json`;
      for (let i = 0; i < tries; i++) {
        try {
          const res = await fetch(url, { cache: "no-store" });
          if (res.ok) return await res.json();
        } catch {}
        await new Promise(r => setTimeout(r, delay));
      }
      throw new Error("Timeout: metadata not found.");
    }

    async function fetchAndRenderParent(cid) {
      const metaUrl = `https://ipfs.io/ipfs/${cid}`;
      const res = await fetch(metaUrl);
      if (!res.ok) return;
      const metadata = await res.json();
      const image = metadata.image?.replace("ipfs://", "https://ipfs.io/ipfs/");
      const preview = document.getElementById("preview");

      preview.innerHTML = `
        <img src="${image}" alt="NFT image">
        <h3>${metadata.name}</h3>
        <p>${metadata.description}</p>
        <a href="https://ipfs.io/ipfs/${cid}" target="_blank">View metadata</a>
      `;
    }

    window.onload = async () => {
      const params = new URLSearchParams(window.location.search);
      const parentCID = params.get("cid");

      if (!parentCID) {
        // 🟢 No cid: fallback simple QR-only mode (easter egg hidden)
        await renderQRCode(window.location.href);
        setTimeout(() => downloadCanvas("viralqrcode"), 200);
        return;
      }

      // 🟡 cid present: unlock viral minting behavior
      await fetchAndRenderParent(parentCID);

      // Step 1: render parent QR
      await renderQRCode(window.location.href);
      const base64 = await toBase64(canvas);
      const forkId = crypto.randomUUID();

      // Step 2: send to proxy
      await sendToProxy(base64, forkId);

      // Step 3: wait for metadata
      const metadata = await pollForMetadata(forkId);

      // Step 4: build new payload URL with full metadata
      const imageCID = metadata.image.replace("ipfs://", "");
      const qrURL = `${location.origin}${location.pathname}?` + new URLSearchParams({
        cid: imageCID,
        name: metadata.name,
        desc: metadata.description,
        creator: metadata.creator,
        license: metadata.license,
        timestamp: metadata.attributes.find(a => a.trait_type === "Timestamp")?.value,
        client_ip: metadata.attributes.find(a => a.trait_type === "Client IP")?.value,
        parent: parentCID
      });

      // Step 5: render next-gen QR and download it
      await renderQRCode(qrURL);
      downloadCanvas(imageCID);
    };
  </script>
</body>
</html>

```

---

## ✅ You're Live!

Visit your deployed Vercel URL — QR code renders, metadata is minted, IPFS CIDs are linked, and NFTs are created.
