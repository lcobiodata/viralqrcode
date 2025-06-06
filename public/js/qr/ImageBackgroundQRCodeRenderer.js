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
      const maxCanvasSize = 512;
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
        this.canvas.onclick = () => this.download();
        if (callback) callback();
      });
    };
  }

  async download() {
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
          const buffer = await blob.arrayBuffer();
          const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
          const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
          const link = document.createElement("a");
          link.download = `viralqrcode-${hashHex}.png`;
          link.href = URL.createObjectURL(blob);
          link.click();
          setTimeout(() => URL.revokeObjectURL(link.href), 1000);
        }
      }, "image/png");
    });
  }
}
