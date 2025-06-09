// QRCodeRenderer.js

export class QRCodeRenderer {
  constructor(canvas, data, options = {}) {
    this.canvas = canvas;
    this.data = data;
    this.options = options;
  }

  render(callback) {
    // Set a large canvas size for high-res output (e.g., 1024x1024)
    const size = this.options.width || 1024;
    this.canvas.width = size;
    this.canvas.height = size;
    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;
  
    QRCode.toCanvas(this.canvas, this.data, { ...this.options, width: size }, (err) => {
      if (err) {
        console.error(err);
        // Fallback: try rendering just the current domain (or a minimal link)
        const fallbackUrl = window.location.origin;
        QRCode.toCanvas(this.canvas, fallbackUrl, { ...this.options, width: size }, (fallbackErr) => {
          if (fallbackErr) {
            console.error('Fallback QR code also failed:', fallbackErr);
            if (callback) callback(fallbackErr);
          } else {
            alert(
              "The data is too large to fit in a QR code. " +
              "A fallback QR code with just the site link was generated instead."
            );
            if (callback) callback(null, true); // true = fallback used
          }
        });
      } else if (callback) {
        callback();
      }
    });
  }

  async preview() {
    this.canvas.toBlob(async (blob) => {
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

        // Get the template from the main window
        const template = document.getElementById('qr-preview-template');
        if (!template) {
          win.document.write("<p>Template not found.</p>");
          return;
        }
        // Clone the template content
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
  }
}