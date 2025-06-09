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
          alert(
            "The data is too large to fit in a QR code with background image. " +
            "A fallback QR code with just the site link was generated instead."
          );
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
        alert(
          "The data is too large to fit in a QR code with background image. " +
          "A fallback QR code with just the site link was generated instead."
        );
        console.error(err);
        // fallback to plain QR code for the current domain
        new QRCodeRenderer(this.canvas, window.location.origin, {
          margin: 2,
          color: { dark: "#00FF00", light: "#121212" }
        }).render();
        return;
      }
      tempCanvas.toBlob(async (blob) => {
        if (blob) {
          // --- SHA-256 hash for filename ---
          const encoder = new TextEncoder();
          const dataBuffer = encoder.encode(this.data);
          const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          // ----------------------------------

          const url = URL.createObjectURL(blob);
          const win = window.open("", "_blank");
          if (!win) {
            alert("Popup blocked. Please allow popups for this site.");
            return;
          }

          // Reuse the template from index.html
          const template = document.getElementById('qr-preview-template');
          if (!template) {
            win.document.write("<p>Template not found.</p>");
            return;
          }
          const html = template.innerHTML
            .replace('src=""', `src="${url}"`)
            .replace('href=""', `href="${url}"`)
            .replace('download=""', `download="${hashHex}.png"`);

          win.document.write(html);

          setTimeout(() => {
            win.focus();
          }, 500);
          setTimeout(() => URL.revokeObjectURL(url), 60000);
        }
      }, "image/png");
    });
  }
}