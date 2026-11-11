'use strict';
// Shared master rig for the humanoid_front archetype (body_balanced reference).
// Every layer is drawn from the same neutral master pose and the same anchors, then
// posed per frame by one transform (row stretch + head offset) so parts never drift.
//
// Coordinates: cell 96 x 128, origin top-left, x right, y down.
// Pivot (48, 11) bottom-left == geometric line between x 47|48 and y 116|117.
// Mirror across the pivot axis: x' = 95 - x.
const IO = require('./imageio.js');

const CELL_W = 96, CELL_H = 128, GROUND_Y = 116, PIVOT = { x: 48, y: 11 };
const SEAM_Y = 66; // rows above the seam follow the shoulders (sh); rows below stay planted.
const M = x => 95 - x;

// --- color helpers -------------------------------------------------------
const cache = new Map();
function rgba(hex) {
  if (!hex) return null;
  let c = cache.get(hex);
  if (!c) {
    const h = hex.replace('#', '');
    c = [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), h.length >= 8 ? parseInt(h.slice(6, 8), 16) : 255];
    cache.set(hex, c);
  }
  return c;
}
function put(img, x, y, hex) {
  if (!hex || x < 0 || y < 0 || x >= img.w || y >= img.h) return;
  const c = rgba(hex), o = (y * img.w + x) * 4;
  img.d[o] = c[0]; img.d[o + 1] = c[1]; img.d[o + 2] = c[2]; img.d[o + 3] = c[3];
}
function alpha(img, x, y) { return x < 0 || y < 0 || x >= img.w || y >= img.h ? 0 : img.d[(y * img.w + x) * 4 + 3]; }
function span(img, y, x0, x1, hex) { for (let x = x0; x <= x1; x++) put(img, x, y, hex); }
function rect(img, x0, y0, x1, y1, hex) { for (let y = y0; y <= y1; y++) span(img, y, x0, x1, hex); }
function sym(img, y, hw, hex) { span(img, y, 48 - hw, 47 + hw, hex); }
// Recolor already-opaque pixels only (used for shading inside a filled shape).
function tint(img, x, y, hex) { if (alpha(img, x, y)) put(img, x, y, hex); }
function tintSpan(img, y, x0, x1, hex) { for (let x = x0; x <= x1; x++) tint(img, x, y, hex); }

// Draws src onto dst (alpha 0/255 sprites, plus straight alpha blend for soft pixels).
function blit(dst, src, dx = 0, dy = 0, rowFilter = null) {
  for (let y = 0; y < src.h; y++) {
    if (rowFilter && !rowFilter(y)) continue;
    const ty = y + dy; if (ty < 0 || ty >= dst.h) continue;
    for (let x = 0; x < src.w; x++) {
      const tx = x + dx; if (tx < 0 || tx >= dst.w) continue;
      const so = (y * src.w + x) * 4, a = src.d[so + 3]; if (!a) continue;
      const to = (ty * dst.w + tx) * 4;
      if (a === 255 || dst.d[to + 3] === 0) { src.d.copy(dst.d, to, so, so + 4); continue; }
      const ta = dst.d[to + 3] / 255, sa = a / 255, oa = sa + ta * (1 - sa);
      for (let c = 0; c < 3; c++) dst.d[to + c] = Math.round((src.d[so + c] * sa + dst.d[to + c] * ta * (1 - sa)) / oa);
      dst.d[to + 3] = Math.round(oa * 255);
    }
  }
}
// 4-neighbour outline on transparent pixels. forbid(x,y) blocks outline pixels.
function outline(img, hex, forbid = null) {
  const add = [];
  for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) {
    if (alpha(img, x, y)) continue;
    if (alpha(img, x - 1, y) || alpha(img, x + 1, y) || alpha(img, x, y - 1) || alpha(img, x, y + 1)) {
      if (!forbid || !forbid(x, y)) add.push([x, y]);
    }
  }
  for (const [x, y] of add) put(img, x, y, hex);
  return img;
}
function maskOf(img) { return (x, y) => alpha(img, x, y) > 0; }
function erase(img, mask) {
  for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) if (mask(x, y)) img.d[(y * img.w + x) * 4 + 3] = 0;
  for (let i = 0; i < img.w * img.h; i++) if (!img.d[i * 4 + 3]) img.d.fill(0, i * 4, i * 4 + 3);
  return img;
}

// --- animation contract (G1) ----------------------------------------------
// sh: shoulder offset, hd: head offset, lag: follow-through offset for loose hair tips.
const FRAMES = [
  { anim: 'idle', index: 0, ms: 240, sh: 0, hd: 0, lag: -1, expr: 'neutral', note: 'neutro' },
  { anim: 'idle', index: 1, ms: 240, sh: -1, hd: 0, lag: 0, expr: 'neutral', note: 'sobe ombros' },
  { anim: 'idle', index: 2, ms: 240, sh: -1, hd: -1, lag: 0, expr: 'soft', note: 'apice, olhar suave' },
  { anim: 'idle', index: 3, ms: 240, sh: 0, hd: -1, lag: -1, expr: 'neutral', note: 'retorna' },
  { anim: 'react', index: 0, ms: 120, sh: -1, hd: -2, lag: -1, expr: 'wide', note: 'atencao' },
  { anim: 'react', index: 1, ms: 120, sh: -1, hd: -1, lag: -2, expr: 'happy', note: 'sorriso no apice' },
  { anim: 'react', index: 2, ms: 120, sh: 0, hd: 0, lag: -1, expr: 'smile', note: 'volta ao repouso' },
];

// --- default pose and limb geometry ----------------------------------------
const DEFAULT_POSE = { armOut: 0, stance: 0 };
// Left (screen-left) arm spans per row; the right arm mirrors these.
function armSpanLeft(y, pose = DEFAULT_POSE) {
  let s;
  if (y === 53) s = [33, 35]; else if (y === 54) s = [32, 35];
  else if (y <= 60) s = [31, 35]; else if (y <= 66) s = [30, 34];
  else if (y <= 74) s = [29, 33]; else if (y <= 83) s = [28, 32];
  else if (y === 84) s = [28, 32]; else if (y <= 89) s = [27, 32]; else if (y === 90) s = [28, 31];
  else return null;
  const off = Math.round((pose.armOut || 0) * Math.max(0, Math.min(1, (y - 55) / 28)));
  return [s[0] - off, s[1] - off];
}
function armSpanRight(y, pose) { const s = armSpanLeft(y, pose); return s && [M(s[1]), M(s[0])]; }
// Grip anchor of the held (screen-right) hand, in cell pixels (centre of fist).
function gripAnchor(pose = DEFAULT_POSE) { return { x: 65.5 + (pose.armOut || 0), y: 87 }; }

const TRUNK_HW = y => (y === 51 ? 8 : y === 52 ? 11 : y === 53 ? 13 : y <= 62 ? 14 : y <= 66 ? 13 : y <= 72 ? 12 : y <= 77 ? 11 : 0);
const HEAD_HW = { 20: 7, 21: 9, 22: 10, 23: 11, 24: 12, 40: 12, 41: 12, 42: 11, 43: 10, 44: 9, 45: 8, 46: 6 };
const headHw = y => (y < 20 || y > 46 ? 0 : HEAD_HW[y] || 13);

// Anchors recorded in the manifest (neutral frame, before per-frame offsets).
const ANCHORS = {
  ground: { x: 48, y: 116, follows: 'fixed' },
  headCenter: { x: 47.5, y: 33, follows: 'hd' },
  eyeLeft: { x: 40, y: 34, follows: 'hd' }, eyeRight: { x: 55, y: 34, follows: 'hd' },
  earLeft: { x: 33, y: 34, follows: 'hd' }, earRight: { x: 62, y: 34, follows: 'hd' },
  shoulderLeft: { x: 34, y: 54, follows: 'sh' }, shoulderRight: { x: 61, y: 54, follows: 'sh' },
  wristLeft: { x: 30, y: 83, follows: 'fixed' }, wristRight: { x: 65, y: 83, follows: 'fixed' },
  gripMain: { x: 65.5, y: 87, follows: 'fixed' },
  waist: { x: 47.5, y: 77, follows: 'fixed' },
  ankleLeft: { x: 41, y: 110, follows: 'fixed' }, ankleRight: { x: 54, y: 110, follows: 'fixed' },
  tailRoot: { x: 47.5, y: 80, follows: 'fixed' },
};

// --- frame transform -------------------------------------------------------
// parts: { body?, head?, lag?, back? } neutral images. Returns posed image (no outline).
function poseGroups(parts, f) {
  const out = IO.blank(CELL_W, CELL_H);
  if (parts.back) {
    blit(out, parts.back, 0, f.hd);
    if (parts.backLag) { blit(out, parts.backLag, 0, f.hd); blit(out, parts.backLag, 0, f.lag); }
  }
  if (parts.body) {
    blit(out, parts.body, 0, 0, y => y >= SEAM_Y);
    if (f.sh < 0) blit(out, parts.body, 0, 0, y => y === SEAM_Y - 1);
    blit(out, parts.body, 0, f.sh, y => y < SEAM_Y);
  }
  if (parts.lag) { blit(out, parts.lag, 0, f.hd); blit(out, parts.lag, 0, f.lag); }
  if (parts.head) blit(out, parts.head, 0, f.hd);
  return out;
}

module.exports = {
  CELL_W, CELL_H, GROUND_Y, PIVOT, SEAM_Y, M, FRAMES, DEFAULT_POSE, ANCHORS,
  rgba, put, alpha, span, rect, sym, tint, tintSpan, blit, outline, maskOf, erase,
  armSpanLeft, armSpanRight, gripAnchor, TRUNK_HW, headHw, poseGroups,
};
