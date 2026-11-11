'use strict';
// Visual direction study (NOT game sheets): the same individual in three moments
// (recem-invocado, treinado, imponente), for a human and for an elf. CANDIDATO_JOGAVEL,
// subject to creative review; no levels, bonuses or unlocks are implied.
// Usage: node art-source/content-v1/tools/study_evolution.js
const fs = require('fs');
const path = require('path');
const IO = require('./imageio.js');
const R = require('./rig.js');
const P = require('./parts.js');
const { put, span, rect, sym, tintSpan } = R;

const OUT = path.resolve(__dirname, '../studies'); fs.mkdirSync(OUT, { recursive: true });

function quiltedVest(pose) {
  const V = { d: '#4a2e1e', b: '#6e4a30', l: '#8e6644', edge: '#cbb894', acc: '#a2503a' };
  const img = IO.blank(96, 128);
  const hw = y => (y <= 52 ? 11 : y <= 62 ? 15 : y <= 72 ? 14 : 13);
  for (let y = 51; y <= 82; y++) {
    const w = hw(y); sym(img, y, w, V.b);
    for (let x = 48 - w; x <= 47 + w; x++) if (((x + y) & 3) === 0 || ((x - y) & 3) === 0) put(img, x, y, V.d);
    put(img, 48 - w, y, V.l); put(img, 47 + w, y, V.d);
    if (y < 66) { put(img, 48 - w + 1, y, V.edge); put(img, 47 + w - 1, y, V.edge); } // light armholes
    span(img, y, 45, 50, null); for (let x = 45; x <= 50; x++) img.d[(y * 96 + x) * 4 + 3] = 0;
    put(img, 44, y, V.l); put(img, 51, y, V.d);
  }
  span(img, 82, 33, 44, V.acc); span(img, 82, 51, 62, V.acc);
  return { body: img };
}

function leatherCoat(pose) {
  const C = { dd: '#3a2216', d: '#563420', b: '#7a4c2e', l: '#9a6a44', scarf: '#a2503a', scarfL: '#c4704f' };
  const img = IO.blank(96, 128);
  const hw = y => (y <= 52 ? 12 : y <= 62 ? 15 : y <= 72 ? 14 : y <= 80 ? 14 : 15);
  for (let y = 50; y <= 92; y++) {
    const w = hw(y); sym(img, y, w, C.b);
    tintSpan(img, y, 47 + w - 2, 47 + w, C.d); put(img, 48 - w, y, C.l);
  }
  // sleeves to the wrist, following the shared arm spans
  for (let y = 53; y <= 82; y++) {
    const A = R.armSpanLeft(y, pose), B = R.armSpanRight(y, pose);
    span(img, y, A[0] - 1, A[1] + 1, C.b); span(img, y, B[0] - 1, B[1] + 1, C.d);
    put(img, A[0] - 1, y, C.l); put(img, B[1] + 1, y, C.dd);
    if (y >= 80) { span(img, y, A[0] - 1, A[1] + 1, C.dd); span(img, y, B[0] - 1, B[1] + 1, C.dd); }
  }
  // open front with lapels; tunic shows inside
  for (let y = 53; y <= 92; y++) {
    const half = y < 70 ? Math.max(1, 6 - Math.floor((y - 53) / 3)) : 1;
    for (let x = 48 - half; x <= 47 + half; x++) img.d[(y * 96 + x) * 4 + 3] = 0;
    put(img, 47 - half, y, C.l); put(img, 48 + half, y, C.dd);
    if (y < 66) { put(img, 46 - half, y, C.l); put(img, 49 + half, y, C.d); }
  }
  // high collar beside the jaw and rust scarf (motif carried from the first tunic sash)
  for (let y = 45; y <= 52; y++) { span(img, y, 39, 43, C.l); span(img, y, 52, 56, C.d); put(img, 39, y, C.b); put(img, 56, y, C.dd); }
  for (let y = 50; y <= 54; y++) span(img, y, 44, 51, y === 50 ? C.scarfL : C.scarf);
  for (let y = 55; y <= 62; y++) { put(img, 45, y, C.scarf); put(img, 46, y, C.scarfL); }
  span(img, 92, 33, 62, C.dd);
  return { body: img };
}

function ironSword(pose, look) {
  const S = P.PAL.skin[look.skin || 'peach'];
  const Sv = { d: '#6e7888', b: '#a8b2be', l: '#dfe5ec' }, Cu = { d: '#8e5230', b: '#c07a48', l: '#e0a070' }, G = '#3a2a2a';
  const img = IO.blank(96, 128);
  const g = R.gripAnchor(pose); const c = y => Math.floor(g.x + (g.y - y) / 2);
  for (let y = 38; y <= 78; y++) { const k = c(y); put(img, k, y, Sv.l); put(img, k + 1, y, Sv.b); put(img, k + 2, y, Sv.d); }
  put(img, c(37) + 1, 37, Sv.l); put(img, c(36) + 1, 36, Sv.b);
  for (let y = 79; y <= 82; y++) { const k = c(y), w = 82 - y + 2; span(img, y, k - w, k + w + 1, y === 79 ? Cu.l : y === 82 ? Cu.d : Cu.b); }
  for (let y = 83; y <= 91; y++) { const k = c(y); put(img, k, y, G); put(img, k + 1, y, G); }
  { const k = c(92); span(img, 92, k - 1, k + 1, Cu.b); }
  P.fist(img, pose, S);
  return img;
}

function circlet() {
  const img = IO.blank(96, 128);
  span(img, 24, 33, 62, '#c07a48'); span(img, 25, 34, 61, '#8e5230');
  put(img, 47, 24, null); img.d[(24 * 96 + 47) * 4 + 3] = 0; img.d[(24 * 96 + 48) * 4 + 3] = 0;
  put(img, 46, 24, '#e0a070');
  return img;
}

// Effects (drawn after outline, intentional alpha allowed)
const BLUE = { core: '#e8f8ff', b: '#7fd0ff', d: '#3a8ad0' };
function fxGlint(img, pose) { const g = R.gripAnchor(pose); put(img, Math.floor(g.x) + 4, 83, BLUE.b); put(img, Math.floor(g.x) + 5, 82, BLUE.core); }
function fxOrb(img, x, y) { span(img, y - 1, x - 1, x + 1, BLUE.d); span(img, y, x - 2, x + 2, BLUE.b); put(img, x, y, BLUE.core); span(img, y + 1, x - 1, x + 1, BLUE.d); }
function fxAnchor(img) { // core_brief_anchor: open geometry flush with the feet, closing into a broken ring
  for (let x = 24; x <= 71; x++) {
    const t = (x - 47.5) / 24, dy = Math.round(4 * Math.sqrt(Math.max(0, 1 - t * t)));
    if (((x >> 2) & 1) === 0) { put(img, x, 117 - dy, BLUE.b + 'c0'); put(img, x, 117 + dy, BLUE.d + 'c0'); }
  }
  for (const x of [26, 47, 48, 69]) { put(img, x, 113, BLUE.core); }
}
function fxStaffLight(img, pose) { const g = R.gripAnchor(pose); for (let y = 62; y <= 80; y += 2) put(img, Math.floor(g.x) - 4 + ((y >> 1) & 1), y, y % 4 ? BLUE.b : BLUE.core); fxOrb(img, Math.floor(g.x) - 4, 58); }

function figure(spec) {
  const f = { sh: spec.sh, hd: spec.hd, lag: spec.hd, expr: spec.expr || 'neutral' };
  const pose = spec.pose, look = spec.look;
  const cell = IO.blank(96, 128);
  const body = R.outline(R.poseGroups(P.body(f.expr, pose, look), f), P.OUTLINE.body);
  const hairParts = spec.hair === 'wild' ? P.hairWildLayers(look) : P.hairShortNeat(look);
  if (hairParts.back) { const b = R.poseGroups({ back: hairParts.back, backLag: hairParts.backLag }, f); R.outline(b, P.OUTLINE.hair); R.blit(cell, b); }
  R.blit(cell, body);
  for (const t of spec.torso) {
    const parts = t === 'tunic' ? P.tunicLinen(pose, look) : t === 'robe' ? P.robeNovice(pose) : t === 'vest' ? quiltedVest(pose) : leatherCoat(pose);
    const ol = { tunic: P.OUTLINE.tunic, robe: P.OUTLINE.robe, vest: P.OUTLINE.vest, coat: P.OUTLINE.coat }[t];
    R.blit(cell, R.outline(R.poseGroups(parts, f), ol));
  }
  R.blit(cell, R.outline(R.poseGroups({ head: hairParts.head, lag: hairParts.lag }, f), P.OUTLINE.hair));
  if (spec.circlet) R.blit(cell, R.outline(R.poseGroups({ head: circlet() }, f), '#3a2216'));
  const held = spec.held === 'blade' ? R.outline(P.practiceBlade(0, pose, look), P.OUTLINE.blade)
    : spec.held === 'iron' ? R.outline(ironSword(pose, look), P.OUTLINE.iron)
      : spec.held === 'staff' ? R.outline(P.wovenStaff(0, pose, look), P.OUTLINE.staff) : null;
  if (held) R.blit(cell, held);
  const fx = IO.blank(96, 128);
  for (const e of spec.fx || []) {
    if (e === 'glint') fxGlint(fx, pose); if (e === 'orb') { const g = R.gripAnchor(pose); fxOrb(fx, Math.floor(g.x) + 6, 76); }
    if (e === 'anchor') fxAnchor(fx); if (e === 'staffLight') fxStaffLight(fx, pose);
  }
  return { cell, fx };
}

const A = { skin: 'peach', freckles: true };
const B = { skin: 'chestnut', ears: 'elf', hair: 'silver', scar: true, iris: '#5a7a9a' };
const rows = [
  [
    { pose: { armOut: 0, stance: 0 }, sh: 1, hd: 1, look: A, hair: 'short', torso: ['tunic'], held: 'blade', fx: ['glint'] },
    { pose: { armOut: 1, stance: 1 }, sh: 0, hd: -1, look: A, hair: 'short', torso: ['tunic', 'vest'], held: 'iron', fx: ['orb'] },
    { pose: { armOut: 2, stance: 2 }, sh: -1, hd: -1, look: A, hair: 'short', torso: ['tunic', 'coat'], held: 'iron', fx: [] },
    { pose: { armOut: 2, stance: 2 }, sh: -1, hd: -1, look: A, hair: 'short', torso: ['tunic', 'coat'], held: 'iron', fx: ['anchor'], expr: 'neutral' },
  ],
  [
    { pose: { armOut: 0, stance: 0 }, sh: 1, hd: 1, look: B, hair: 'wild', torso: ['tunic'], held: 'staff', fx: ['glint'] },
    { pose: { armOut: 1, stance: 1 }, sh: 0, hd: -1, look: B, hair: 'wild', torso: ['robe'], held: 'staff', fx: ['orb'] },
    { pose: { armOut: 2, stance: 2 }, sh: -1, hd: -1, look: B, hair: 'wild', torso: ['robe'], held: 'staff', circlet: true, fx: [] },
    { pose: { armOut: 2, stance: 2 }, sh: -1, hd: -1, look: B, hair: 'wild', torso: ['robe'], held: 'staff', circlet: true, fx: ['staffLight'] },
  ],
];
function fill(w, h, hex) { const i = IO.blank(w, h); R.rect(i, 0, 0, w - 1, h - 1, hex); return i; }
function silhouette(img) { const o = IO.clone(img); for (let i = 0; i < o.w * o.h; i++) if (o.d[i * 4 + 3]) { o.d[i * 4] = o.d[i * 4 + 1] = o.d[i * 4 + 2] = 16; o.d[i * 4 + 3] = 255; } return o; }
const LIGHT = '#e8e4dc', DARK = '#1c1824', GAP = 6;
const figs = rows.map(r => r.map(figure));
const board = fill(4 * 96 + 5 * GAP, 4 * 128 + 5 * GAP, LIGHT);
figs.forEach((r, ri) => r.forEach((f, ci) => {
  const x = GAP + ci * (96 + GAP), y = GAP + ri * 2 * (128 + GAP);
  const bgc = fill(96, 128, ri === 0 ? LIGHT : DARK);
  const shadow = P.contactShadow(); R.blit(bgc, shadow, 25, 110);
  R.blit(bgc, f.cell); R.blit(bgc, f.fx); R.blit(board, bgc, x, y);
  const sil = fill(96, 128, '#d8d4cc'); R.blit(sil, silhouette(f.cell)); R.blit(board, sil, x, y + 128 + GAP);
}));
IO.write(path.join(OUT, 'evolution_same_individual_v1_x3.png'), IO.scale(board, 3));
IO.write(path.join(OUT, 'evolution_same_individual_v1_x1_phone.png'), board);
console.log('study written');
