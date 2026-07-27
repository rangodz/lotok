/**
 * Karto icon generator
 * Requires: npm install canvas
 * Run:      node scripts/generate-icon.js
 *
 * Outputs:
 *   assets/icon.png          (1024×1024 — iOS icon, app.json "icon")
 *   assets/adaptive-icon.png (1024×1024 — Android foreground)
 *   assets/splash.png        (2048×2048 — splash screen)
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const BRAND = '#1E3A8A';
const ORANGE = '#F97316';
const WHITE = '#FFFFFF';

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const s = size / 1024; // scale factor

  // Background
  ctx.fillStyle = BRAND;
  ctx.fillRect(0, 0, size, size);

  // "k" stem
  ctx.fillStyle = WHITE;
  ctx.beginPath();
  ctx.roundRect(310 * s, 220 * s, 90 * s, 584 * s, 10 * s);
  ctx.fill();

  // Upper arm
  ctx.beginPath();
  ctx.moveTo(400 * s, 512 * s);
  ctx.lineTo(650 * s, 220 * s);
  ctx.lineTo(760 * s, 220 * s);
  ctx.lineTo(510 * s, 512 * s);
  ctx.closePath();
  ctx.fill();

  // Lower leg
  ctx.beginPath();
  ctx.moveTo(400 * s, 512 * s);
  ctx.lineTo(510 * s, 512 * s);
  ctx.lineTo(760 * s, 804 * s);
  ctx.lineTo(650 * s, 804 * s);
  ctx.closePath();
  ctx.fill();

  // Orange dot
  ctx.fillStyle = ORANGE;
  ctx.beginPath();
  ctx.arc(690 * s, 778 * s, 62 * s, 0, Math.PI * 2);
  ctx.fill();

  return canvas;
}

function drawSplash(width, height) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = BRAND;
  ctx.fillRect(0, 0, width, height);

  // Center the icon at 400×400
  const iconSize = 400;
  const s = iconSize / 1024;
  const ox = (width - iconSize) / 2;
  const oy = (height - iconSize) / 2 - 40;

  ctx.fillStyle = WHITE;
  ctx.beginPath();
  ctx.roundRect(ox + 310 * s, oy + 220 * s, 90 * s, 584 * s, 10 * s);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(ox + 400 * s, oy + 512 * s);
  ctx.lineTo(ox + 650 * s, oy + 220 * s);
  ctx.lineTo(ox + 760 * s, oy + 220 * s);
  ctx.lineTo(ox + 510 * s, oy + 512 * s);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(ox + 400 * s, oy + 512 * s);
  ctx.lineTo(ox + 510 * s, oy + 512 * s);
  ctx.lineTo(ox + 760 * s, oy + 804 * s);
  ctx.lineTo(ox + 650 * s, oy + 804 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = ORANGE;
  ctx.beginPath();
  ctx.arc(ox + 690 * s, oy + 778 * s, 62 * s, 0, Math.PI * 2);
  ctx.fill();

  // "karto" wordmark below
  ctx.fillStyle = WHITE;
  ctx.font = 'bold 80px sans-serif';
  ctx.textAlign = 'center';
  ctx.globalAlpha = 0.9;
  ctx.fillText('lotok', width / 2, oy + iconSize + 80);
  ctx.globalAlpha = 1;

  return canvas;
}

const assetsDir = path.join(__dirname, '..', 'assets');

const icon = drawIcon(1024);
fs.writeFileSync(path.join(assetsDir, 'icon.png'), icon.toBuffer('image/png'));
console.log('✓ assets/icon.png');

const adaptive = drawIcon(1024);
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), adaptive.toBuffer('image/png'));
console.log('✓ assets/adaptive-icon.png');

const splash = drawSplash(2048, 2048);
fs.writeFileSync(path.join(assetsDir, 'splash.png'), splash.toBuffer('image/png'));
console.log('✓ assets/splash.png');

console.log('\nDone. Run: npx expo start --clear');
