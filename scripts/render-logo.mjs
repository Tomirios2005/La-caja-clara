import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";

const INK = [0x1a, 0x17, 0x14, 255];
const CREAM = [0xf3, 0xef, 0xe6, 255];
const BRASS = [0x9a, 0x62, 0x32, 255];

function create(size) {
  return { size, data: new Uint8Array(size * size * 4) };
}

function fillRoundRect(img, x, y, w, h, r, color) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = Math.ceil(x + w);
  const y1 = Math.ceil(y + h);
  for (let py = y0; py < y1; py++) {
    for (let px = x0; px < x1; px++) {
      const cx = Math.min(Math.max(px + 0.5, x + r), x + w - r);
      const cy = Math.min(Math.max(py + 0.5, y + r), y + h - r);
      const dx = px + 0.5 - cx;
      const dy = py + 0.5 - cy;
      if (dx * dx + dy * dy > r * r) continue;
      if (px < 0 || py < 0 || px >= img.size || py >= img.size) continue;
      const i = (py * img.size + px) * 4;
      img.data[i] = color[0];
      img.data[i + 1] = color[1];
      img.data[i + 2] = color[2];
      img.data[i + 3] = color[3];
    }
  }
}

function draw(img) {
  const s = img.size / 32;
  fillRoundRect(img, 0, 0, 32 * s, 32 * s, 8 * s, INK);
  fillRoundRect(img, 6.5 * s, 8.5 * s, 19 * s, 15.5 * s, 1.8 * s, CREAM);
  fillRoundRect(img, 6.5 * s, 8.5 * s, 19 * s, 5.4 * s, 1.8 * s, BRASS);
  fillRoundRect(img, 6.5 * s, 11.2 * s, 19 * s, 2.7 * s, 0, BRASS);
  fillRoundRect(img, 12.2 * s, 17 * s, 7.6 * s, 2.5 * s, 1.25 * s, BRASS);
}

function downsample(src, factor) {
  const size = src.size / factor;
  const out = create(size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      const n = factor * factor;
      for (let yy = 0; yy < factor; yy++) {
        for (let xx = 0; xx < factor; xx++) {
          const i = ((y * factor + yy) * src.size + (x * factor + xx)) * 4;
          r += src.data[i];
          g += src.data[i + 1];
          b += src.data[i + 2];
          a += src.data[i + 3];
        }
      }
      const o = (y * size + x) * 4;
      out.data[o] = Math.round(r / n);
      out.data[o + 1] = Math.round(g / n);
      out.data[o + 2] = Math.round(b / n);
      out.data[o + 3] = Math.round(a / n);
    }
  }
  return out;
}

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePNG(img) {
  const { size, data } = img;
  const raw = Buffer.alloc(size * (1 + size * 4));
  for (let y = 0; y < size; y++) {
    const row = y * (1 + size * 4);
    raw[row] = 0;
    Buffer.from(data.buffer, data.byteOffset + y * size * 4, size * 4).copy(raw, row + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function make(finalSize) {
  const factor = 4;
  const big = create(finalSize * factor);
  draw(big);
  return downsample(big, factor);
}

const png48 = encodePNG(make(48));
writeFileSync("public/favicon-48.png", png48);
writeFileSync("public/favicon-192.png", encodePNG(make(192)));
writeFileSync("public/apple-touch-icon.png", encodePNG(make(180)));
writeFileSync("public/logo.png", encodePNG(make(512)));

const header = Buffer.alloc(6);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
const entry = Buffer.alloc(16);
entry[0] = 48;
entry[1] = 48;
entry.writeUInt16LE(1, 4);
entry.writeUInt16LE(32, 6);
entry.writeUInt32LE(png48.length, 8);
entry.writeUInt32LE(22, 12);
writeFileSync("public/favicon.ico", Buffer.concat([header, entry, png48]));
