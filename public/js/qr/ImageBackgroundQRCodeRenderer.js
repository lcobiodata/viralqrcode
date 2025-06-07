// ImageBackgroundQRCodeRenderer.js
import { QRCodeRenderer } from './QRCodeRenderer.js';

export class ImageBackgroundQRCodeRenderer extends QRCodeRenderer {
  constructor(canvas, data, imageUrl, options = {}) {
    super(canvas, data, options);
    this.imageUrl = imageUrl;
  }

  render(callback) {
    const ctx = this.canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = this.imageUrl;

    img.onload = () => {
      const maxCanvasSize = 1024; // 256px max size
      const imgAspect = img.width / img.height;
      let width, height;
      if (imgAspect >= 1) {
        width = maxCanvasSize;
        height = maxCanvasSize / imgAspect;
      } else {
        height = maxCanvasSize;
        width = maxCanvasSize * imgAspect;
      }

      this.canvas.width = width;
      this.canvas.height = height;
      this.canvas.style.width = `${width}px`;
      this.canvas.style.height = `${height}px`;

      ctx.fillStyle = "#121212";
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1.0;
      ctx.drawImage(img, 0, 0, width, height);

      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = width;
      tempCanvas.height = height;

      QRCode.toCanvas(tempCanvas, this.data, {
        ...this.options,
        width: width,
        color: {
          dark: "#000000bb",
          light: "#00000000"
        }
      }, (err) => {
        if (err) {
          console.warn("QR code too large or error occurred, falling back to rendering a QR code for the current URL instead.");
          new QRCodeRenderer(this.canvas, window.location.origin, {
            margin: 2,
            color: { dark: "#00FF00", light: "#121212" }
          }).render(callback);
          return;
        }
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.shadowColor = "#000";
        ctx.shadowBlur = 16;
        ctx.drawImage(tempCanvas, 0, 0);
        ctx.restore();
        if (callback) callback();
      });
    };

    img.onerror = () => {
      new QRCodeRenderer(this.canvas, this.data, {
        margin: 2,
        color: { dark: "#00FF00", light: "#121212" }
      }).render(() => {
        this.canvas.onclick = () => this.preview();
        if (callback) callback();
      });
    };
  }

  async preview() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
  
    QRCode.toCanvas(tempCanvas, this.data, {
      ...this.options,
      width: width,
      color: { dark: "#00FF00", light: "#121212" }
    }, async (err) => {
      if (err) {
        console.error(err);
        return;
      }
      tempCanvas.toBlob(async (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const win = window.open("", "_blank");
          if (!win) {
            alert("Popup blocked. Please allow popups for this site.");
            return;
          }
          win.document.write(`
            <html>
              <head>
                <title>QR Code Preview</title>
                <style>
                  :root {
                    --accent: #00FF00;
                    --bg: #121212;
                  }
                  body {
                    background: var(--bg, #121212);
                    color: var(--accent, #00FF00);
                    text-align: center;
                    font-family: monospace;
                  }
                  img {
                    max-width: 90vw;
                    max-height: 80vh;
                    margin: 2em auto;
                    display: block;
                  }
                  .icon-btn {
                    margin: 1em;
                    font-size: 1.5em;
                    color: var(--accent, #00FF00);
                    background: var(--bg, #121212);
                    border: 1px solid var(--accent, #00FF00);
                    border-radius: 50%;
                    padding: 0.7em;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s, color 0.2s;
                  }
                  .icon-btn:hover {
                    background: var(--accent, #00FF00);
                    color: var(--bg, #121212);
                  }
                  .icon-btn svg {
                    width: 1.2em;
                    height: 1.2em;
                    fill: currentColor;
                    vertical-align: middle;
                  }
                  a#download {
                    text-decoration: none;
                  }
                </style>
              </head>
              <body>
                <img id="qr-img" src="${url}" alt="QR Code"/>
                <div>
                  <button class="icon-btn" onclick="window.print()" title="Print">
                    <svg viewBox="0 0 24 24"><path d="M6 9V4h12v5h2V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v5h2zm12 2a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h12zm0 2H6v7h12v-7zm-6 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>
                  </button>
                  <a id="download" href="${url}" download="viralqrcode.png" title="Download">
                    <button class="icon-btn">
                      <svg viewBox="0 0 24 24"><path d="M5 20h14v-2H5v2zm7-18v12.17l3.59-3.58L17 13l-5 5-5-5 1.41-1.41L11 14.17V2h2z"/></svg>
                    </button>
                  </a>
                </div>
                <script>
                  window.onafterprint = () => window.close();
                </script>
              </body>
            </html>
          `);
          setTimeout(() => {
            win.focus();
          }, 500);
          setTimeout(() => URL.revokeObjectURL(url), 60000);
        }
      }, "image/png");
    });
  }
}
