// QRCodeRenderer.js

export class QRCodeRenderer {
  constructor(canvas, data, options = {}) {
    this.canvas = canvas;
    this.data = data;
    this.options = options;
  }

  render(callback) {
    QRCode.toCanvas(this.canvas, this.data, this.options, (err) => {
      if (err) console.error(err);
      else if (callback) callback();
    });
  }

  async download() {
    this.canvas.toBlob(async (blob) => {
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
  }
}
