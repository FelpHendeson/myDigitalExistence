'use strict';
// Minimal lossless image IO for the art pipeline: PNG (RGBA8), APNG previews and
// OpenRaster (.ora) layered masters. No third-party dependencies (Node >= 18).
const zlib = require('zlib');
const fs = require('fs');

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function u32(v) { const b = Buffer.alloc(4); b.writeUInt32BE(v >>> 0); return b; }
function chunk(type, data) {
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  return Buffer.concat([u32(data.length), td, u32(crc32(td))]);
}
const SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function blank(w, h) { return { w, h, d: Buffer.alloc(w * h * 4) }; }
function clone(img) { return { w: img.w, h: img.h, d: Buffer.from(img.d) }; }

function rawScanlines(img) {
  const stride = img.w * 4;
  const raw = Buffer.alloc((stride + 1) * img.h);
  for (let y = 0; y < img.h; y++) img.d.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  return raw;
}
function ihdr(w, h) {
  const b = Buffer.alloc(13);
  b.writeUInt32BE(w, 0); b.writeUInt32BE(h, 4); b[8] = 8; b[9] = 6; // RGBA8, no interlace
  return b;
}
function encode(img) {
  return Buffer.concat([SIG, chunk('IHDR', ihdr(img.w, img.h)),
    chunk('IDAT', zlib.deflateSync(rawScanlines(img), { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

function decode(buf) {
  let p = 8, w, h, bd, ct, pal = null, trns = null; const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p), type = buf.toString('ascii', p + 4, p + 8), data = buf.slice(p + 8, p + 8 + len);
    p += 12 + len;
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); bd = data[8]; ct = data[9]; if (data[12]) throw new Error('interlaced PNG not supported'); }
    else if (type === 'PLTE') pal = data; else if (type === 'tRNS') trns = data; else if (type === 'IDAT') idat.push(data);
  }
  if (bd !== 8) throw new Error('bit depth ' + bd + ' not supported');
  const bpp = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[ct];
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * bpp, out = Buffer.alloc(w * h * 4);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)];
    const line = Buffer.from(raw.slice(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? line[x - bpp] : 0, b = prev[x], c = x >= bpp ? prev[x - bpp] : 0;
      let v = line[x];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      line[x] = v & 255;
    }
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4, i = x * bpp;
      if (ct === 6) line.copy(out, o, i, i + 4);
      else if (ct === 2) { out[o] = line[i]; out[o + 1] = line[i + 1]; out[o + 2] = line[i + 2]; out[o + 3] = 255; }
      else if (ct === 3) { const k = line[i]; out[o] = pal[k * 3]; out[o + 1] = pal[k * 3 + 1]; out[o + 2] = pal[k * 3 + 2]; out[o + 3] = trns && k < trns.length ? trns[k] : 255; }
      else if (ct === 0) { out[o] = out[o + 1] = out[o + 2] = line[i]; out[o + 3] = 255; }
      else { out[o] = out[o + 1] = out[o + 2] = line[i]; out[o + 3] = line[i + 1]; }
    }
    prev = line;
  }
  return { w, h, d: out };
}

// Animated PNG (all frames share size). delaysMs per frame.
function encodeApng(frames, delaysMs) {
  const { w, h } = frames[0];
  const parts = [SIG, chunk('IHDR', ihdr(w, h))];
  const actl = Buffer.alloc(8); actl.writeUInt32BE(frames.length, 0); actl.writeUInt32BE(0, 4);
  parts.push(chunk('acTL', actl));
  let seq = 0;
  frames.forEach((img, i) => {
    const fc = Buffer.alloc(26);
    fc.writeUInt32BE(seq++, 0); fc.writeUInt32BE(w, 4); fc.writeUInt32BE(h, 8);
    fc.writeUInt32BE(0, 12); fc.writeUInt32BE(0, 16);
    fc.writeUInt16BE(delaysMs[i], 20); fc.writeUInt16BE(1000, 22); fc[24] = 0; fc[25] = 0;
    parts.push(chunk('fcTL', fc));
    const z = zlib.deflateSync(rawScanlines(img), { level: 9 });
    if (i === 0) parts.push(chunk('IDAT', z));
    else parts.push(chunk('fdAT', Buffer.concat([u32(seq++), z])));
  });
  parts.push(chunk('IEND', Buffer.alloc(0)));
  return Buffer.concat(parts);
}

// Store-only ZIP writer (enough for OpenRaster).
function zipStore(entries) {
  const locals = [], centrals = []; let offset = 0;
  for (const { name, data } of entries) {
    const nb = Buffer.from(name, 'utf8'), crc = crc32(data);
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0x0800, 6); lh.writeUInt16LE(0, 8);
    lh.writeUInt16LE(0, 10); lh.writeUInt16LE(0x5d6b, 12); lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(data.length, 18); lh.writeUInt32LE(data.length, 22); lh.writeUInt16LE(nb.length, 26); lh.writeUInt16LE(0, 28);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(0x0800, 8); ch.writeUInt16LE(0, 10);
    ch.writeUInt16LE(0, 12); ch.writeUInt16LE(0x5d6b, 14); ch.writeUInt32LE(crc, 16); ch.writeUInt32LE(data.length, 20);
    ch.writeUInt32LE(data.length, 24); ch.writeUInt16LE(nb.length, 28); ch.writeUInt32LE(offset, 42);
    locals.push(lh, nb, data); centrals.push(ch, nb);
    offset += 30 + nb.length + data.length;
  }
  const cd = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, cd, end]);
}

// OpenRaster: layers listed top-first. Opens in Krita, GIMP, Pinta and MyPaint.
function encodeOra(w, h, layers, merged) {
  const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const xml = ['<?xml version="1.0" encoding="UTF-8"?>', `<image w="${w}" h="${h}" version="0.0.5">`, '<stack>'];
  const entries = [{ name: 'mimetype', data: Buffer.from('image/openraster') }];
  const files = [];
  layers.forEach((l, i) => {
    const src = `data/${String(i).padStart(2, '0')}_${l.name.replace(/[^a-z0-9_]+/gi, '_')}.png`;
    xml.push(`<layer name="${esc(l.name)}" src="${src}" x="0" y="0" opacity="1.0" visibility="${l.hidden ? 'hidden' : 'visible'}"/>`);
    files.push({ name: src, data: encode(l.img) });
  });
  xml.push('</stack>', '</image>');
  entries.push({ name: 'stack.xml', data: Buffer.from(xml.join('\n')) }, ...files);
  entries.push({ name: 'mergedimage.png', data: encode(merged) });
  const tw = Math.min(256, w), th = Math.max(1, Math.round(h * tw / w));
  entries.push({ name: 'Thumbnails/thumbnail.png', data: encode(nearest(merged, tw, th)) });
  return zipStore(entries);
}

function nearest(img, w, h) {
  const o = blank(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const sx = Math.floor(x * img.w / w), sy = Math.floor(y * img.h / h);
    img.d.copy(o.d, (y * w + x) * 4, (sy * img.w + sx) * 4, (sy * img.w + sx) * 4 + 4);
  }
  return o;
}
function scale(img, s) { return nearest(img, img.w * s, img.h * s); }

const read = f => decode(fs.readFileSync(f));
const write = (f, img) => fs.writeFileSync(f, encode(img));
module.exports = { crc32, blank, clone, encode, decode, encodeApng, encodeOra, nearest, scale, read, write };
