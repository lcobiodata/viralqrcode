// utils/renderQRCode.js
import { hideSpinner } from './spinner.js';
import { QRCodeRenderer } from '../qr/QRCodeRenderer.js';
import { ImageBackgroundQRCodeRenderer } from '../qr/ImageBackgroundQRCodeRenderer.js';

/**
 * Renders a QR code with or without background image and sets up preview interaction.
 *
 * @param {HTMLCanvasElement} canvas - Target canvas element.
 * @param {string} payload - URL-encoded payload.
 * @param {string|null} imageUrl - Optional background image.
 * @param {string|null} decodedData - Optional decoded ancestry.
 */
export async function renderQRCode(canvas, payload, imageUrl, decodedData) {
  let qr;

  if (imageUrl) {
    qr = new ImageBackgroundQRCodeRenderer(canvas, payload, imageUrl, {
      margin: 2,
      color: { dark: "#00FF0077", light: "#00000000" }
    });
  } else {
    qr = new QRCodeRenderer(canvas, payload, {
      margin: 2,
      color: { dark: "#00FF00", light: "#121212" },
      errorCorrectionLevel: 'H' // ensure QRCodeRenderer always gets a valid options object
    });
  }

  qr.render(() => {
    canvas.onclick = () => qr.preview();
    hideSpinner();
  });
} 
