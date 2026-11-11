'use strict';
// Builds batch 01 (g1_compat) of myDigitalExistence ContentV1 art:
//   client/Assets/Game/Art/ContentV1/g1_compat/*.png (+ import .meta cloned from the prototype)
//   art-source/content-v1/{masters,boards,previews}/ and manifest.json
// Usage (from repo root): node art-source/content-v1/tools/build_g1.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const IO = require('./imageio.js');
const R = require('./rig.js');
const P = require('./parts.js');

const ROOT = path.resolve(__dirname, '../../..');
const OUT_G1 = path.join(ROOT, 'client/Assets/Game/Art/ContentV1/g1_compat');
const PROTO = path.join(ROOT, 'client/Assets/Game/Art/Prototype');
const SRC = path.join(ROOT, 'art-source/content-v1');
for (const d of [OUT_G1, path.join(SRC, 'masters'), path.join(SRC, 'boards'), path.join(SRC, 'previews')]) fs.mkdirSync(d, { recursive: true });

const MASTER_VERSION = 'g1-master-v1';
const SHEET_W = R.CELL_W * 7;

function clean(img) { for (let i = 0; i < img.w * img.h; i++) if (!img.d[i * 4 + 3]) img.d.fill(0, i * 4, i * 4 + 3); return img; }

// ---- per-frame layers ----------------------------------------------------------
function bodyFrame(f, pose, look) { return clean(R.outline(R.poseGroups(P.body(f.expr, pose, look), f), P.OUTLINE.body)); }
function torsoFrame(id, f, pose, look) {
  const parts = id === 'torso_linen_tunic' ? P.tunicLinen(pose, look) : P.robeNovice(pose, look);
  return clean(R.outline(R.poseGroups(parts, f), id === 'torso_linen_tunic' ? P.OUTLINE.tunic : P.OUTLINE.robe));
}
// Hair returns { composite, front, back }. The back sub-layer is hidden where the body is.
function hairFrame(id, f, bodyImg, look) {
  const h = id === 'hair_short_neat' ? P.hairShortNeat(look) : P.hairWildLayers(look);
  const front = R.outline(R.poseGroups({ head: h.head, lag: h.lag }, f), P.OUTLINE.hair);
  const back = IO.blank(R.CELL_W, R.CELL_H);
  if (h.back) {
    const raw = R.poseGroups({ back: h.back, backLag: h.backLag }, f);
    R.blit(back, raw);
    R.outline(back, P.OUTLINE.hair, (x, y) => R.alpha(bodyImg, x, y) > 0);
  }
  const visibleBack = IO.clone(back); R.erase(visibleBack, R.maskOf(bodyImg));
  const composite = IO.blank(R.CELL_W, R.CELL_H); R.blit(composite, visibleBack); R.blit(composite, front);
  return { composite: clean(composite), front: clean(front), back: clean(back) };
}
function heldFrame(id, i, pose, look) {
  const img = id === 'wpn_ashwood_practice_blade' ? P.practiceBlade(i, pose, look) : P.wovenStaff(i, pose, look);
  return clean(R.outline(img, id === 'wpn_ashwood_practice_blade' ? P.OUTLINE.blade : P.OUTLINE.staff));
}

// ---- build all frames -----------------------------------------------------------
const pose = R.DEFAULT_POSE, look = {};
const frames = { body_balanced: [], hair_short_neat: [], hair_wild_layers: [], torso_linen_tunic: [], torso_novice_robe: [], wpn_ashwood_practice_blade: [], wpn_woven_staff: [] };
const splits = { hair_wild_layers__back: [], hair_wild_layers__front: [], hair_short_neat__front: [] };
R.FRAMES.forEach((f, i) => {
  const b = bodyFrame(f, pose, look); frames.body_balanced.push(b);
  for (const id of ['hair_short_neat', 'hair_wild_layers']) {
    const h = hairFrame(id, f, b, look); frames[id].push(h.composite);
    if (id === 'hair_wild_layers') { splits.hair_wild_layers__back.push(h.back); splits.hair_wild_layers__front.push(h.front); }
    else splits.hair_short_neat__front.push(h.front);
  }
  for (const id of ['torso_linen_tunic', 'torso_novice_robe']) frames[id].push(torsoFrame(id, f, pose, look));
  for (const id of ['wpn_ashwood_practice_blade', 'wpn_woven_staff']) frames[id].push(heldFrame(id, i, pose, look));
});

function sheet(list) { const s = IO.blank(SHEET_W, R.CELL_H); list.forEach((c, i) => R.blit(s, c, i * R.CELL_W, 0)); return s; }
const roomImg = P.room(), shadowImg = P.contactShadow();

// ---- write game PNGs + metas ----------------------------------------------------
const sha = buf => crypto.createHash('sha256').update(buf).digest('hex');
const written = {};
function writePng(file, img) { const buf = IO.encode(img); fs.writeFileSync(file, buf); written[path.relative(ROOT, file).replace(/\\/g, '/')] = { sha256: sha(buf), w: img.w, h: img.h }; }
function guidFor(name) { return crypto.createHash('md5').update('mde-contentv1-' + name).digest('hex'); }
function writeMeta(file, protoName) {
  const metaPath = file + '.meta';
  let meta = fs.readFileSync(path.join(PROTO, protoName + '.png.meta'), 'utf8');
  meta = meta.replace(/^guid: [0-9a-f]+$/m, 'guid: ' + guidFor(path.relative(ROOT, file).replace(/\\/g, '/')));
  fs.writeFileSync(metaPath, meta);
}
for (const [id, list] of Object.entries(frames)) { const f = path.join(OUT_G1, id + '.png'); writePng(f, sheet(list)); writeMeta(f, id); }
writePng(path.join(OUT_G1, 'prototype_room.png'), roomImg); writeMeta(path.join(OUT_G1, 'prototype_room.png'), 'prototype_room');
writePng(path.join(OUT_G1, 'contact_shadow.png'), shadowImg); writeMeta(path.join(OUT_G1, 'contact_shadow.png'), 'contact_shadow');
function folderMeta(dir) {
  const rel = path.relative(ROOT, dir).replace(/\\/g, '/');
  fs.writeFileSync(dir + '.meta', `fileFormatVersion: 2\nguid: ${guidFor(rel)}\nfolderAsset: yes\nDefaultImporter:\n  externalObjects: {}\n  userData: \n  assetBundleName: \n  assetBundleVariant: \n`);
}
folderMeta(path.join(ROOT, 'client/Assets/Game/Art/ContentV1')); folderMeta(OUT_G1);

// split hair masters (future hair_back / hair_front layers)
for (const [id, list] of Object.entries(splits)) writePng(path.join(SRC, 'masters', id + '.png'), sheet(list));

// ---- composition helpers ----------------------------------------------------------
const LIGHT = '#e8e4dc', DARK = '#1c1824';
function fill(w, h, hex) { const img = IO.blank(w, h); R.rect(img, 0, 0, w - 1, h - 1, hex); return img; }
function compose(i, combo, bg) {
  const cell = bg ? fill(R.CELL_W, R.CELL_H, bg) : IO.blank(R.CELL_W, R.CELL_H);
  R.blit(cell, shadowImg, 48 - 23, 117 - 1 - 6);
  R.blit(cell, frames.body_balanced[i]);
  if (combo.torso) R.blit(cell, frames[combo.torso][i]);
  if (combo.hair) R.blit(cell, frames[combo.hair][i]);
  if (combo.held) R.blit(cell, frames[combo.held][i]);
  return cell;
}
function inRoom(i, combo) {
  const img = IO.clone(roomImg);
  R.blit(img, shadowImg, 96 - 23, 168 - 1 - 6);
  const c = compose(i, combo, null);
  // compose() already drew the shadow in-cell; redraw without it for the room
  const cell = IO.blank(R.CELL_W, R.CELL_H);
  for (const k of ['body', 'torso', 'hair', 'held']) {
    const layer = k === 'body' ? frames.body_balanced[i] : combo[k] && frames[combo[k]][i];
    if (layer) R.blit(cell, layer);
  }
  R.blit(img, cell, 96 - 48, 168 - 117);
  return img;
}
const COMBOS = [
  { name: 'master_blade', hair: 'hair_short_neat', torso: 'torso_linen_tunic', held: 'wpn_ashwood_practice_blade' },
  { name: 'master_free', hair: 'hair_short_neat', torso: 'torso_linen_tunic', held: null },
  { name: 'wild_robe_staff', hair: 'hair_wild_layers', torso: 'torso_novice_robe', held: 'wpn_woven_staff' },
  { name: 'wild_robe_free', hair: 'hair_wild_layers', torso: 'torso_novice_robe', held: null },
  { name: 'short_robe_staff', hair: 'hair_short_neat', torso: 'torso_novice_robe', held: 'wpn_woven_staff' },
  { name: 'wild_tunic_blade', hair: 'hair_wild_layers', torso: 'torso_linen_tunic', held: 'wpn_ashwood_practice_blade' },
];
function grid(cells, cols, gap, bg) {
  const rows = Math.ceil(cells.length / cols), w = cells[0].w, h = cells[0].h;
  const out = fill(cols * w + (cols + 1) * gap, rows * h + (rows + 1) * gap, bg);
  cells.forEach((c, i) => R.blit(out, c, gap + (i % cols) * (w + gap), gap + Math.floor(i / cols) * (h + gap)));
  return out;
}
function stackV(imgs, gap, bg) {
  const w = Math.max(...imgs.map(i => i.w)), h = imgs.reduce((s, i) => s + i.h, 0) + gap * (imgs.length - 1);
  const out = fill(w, h, bg); let y = 0; for (const i of imgs) { R.blit(out, i, 0, y); y += i.h + gap; } return out;
}
function stackH(imgs, gap, bg) {
  const h = Math.max(...imgs.map(i => i.h)), w = imgs.reduce((s, i) => s + i.w, 0) + gap * (imgs.length - 1);
  const out = fill(w, h, bg); let x = 0; for (const i of imgs) { R.blit(out, i, x, 0); x += i.w + gap; } return out;
}

// Board A: the master composition, with blade and with free hands, 7 frames, light + dark.
const boardA = stackH([LIGHT, DARK].map(bg => grid(
  [0, 1].flatMap(r => R.FRAMES.map((_, i) => compose(i, COMBOS[r], bg))), 7, 4, bg)), 0, LIGHT);
writePng(path.join(SRC, 'boards', 'b01_master_blade_vs_free_hands_x3.png'), IO.scale(boardA, 3));

// Board B: every combination of the batch (12) on the same frame (swap test), idle0 and react1.
const SWAP = [];
for (const hair of ['hair_short_neat', 'hair_wild_layers']) for (const torso of ['torso_linen_tunic', 'torso_novice_robe']) for (const held of [null, 'wpn_ashwood_practice_blade', 'wpn_woven_staff']) SWAP.push({ hair, torso, held });
const boardB = stackV([0, 5].map(i => stackH([LIGHT, DARK].map(bg => grid(SWAP.map(c => compose(i, c, bg)), 6, 4, bg)), 0, LIGHT)), 0, LIGHT);
writePng(path.join(SRC, 'boards', 'b01_swap_matrix_idle0_react1_x2.png'), IO.scale(boardB, 2));

// Board C: isolated layers per frame on a checker, to inspect cuts and alpha.
function checker(w, h) { const img = IO.blank(w, h); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) R.put(img, x, y, ((x >> 3) + (y >> 3)) & 1 ? '#c8c4cc' : '#ecebef'); return img; }
const layerRows = Object.keys(frames).map(id => { const s = sheet(frames[id]); const c = checker(s.w, s.h); R.blit(c, s); for (let k = 1; k < 7; k++) for (let y = 0; y < s.h; y++) R.put(c, k * 96, y, '#ff00ff'); for (let x = 0; x < s.w; x++) R.put(c, x, 117, '#00b0ff'); return c; });
writePng(path.join(SRC, 'boards', 'b01_layers_cells_pivot_x2.png'), IO.scale(stackV(layerRows, 2, '#202020'), 2));

// Board D: in-room composition at game scale (1x) and phone-like 3x, both hand states.
const roomShots = [COMBOS[0], COMBOS[1], COMBOS[2], COMBOS[3]].map(c => inRoom(0, c));
writePng(path.join(SRC, 'boards', 'b01_room_game_scale_x1.png'), stackH(roomShots, 4, '#000000'));
writePng(path.join(SRC, 'boards', 'b01_room_phone_scale_x3.png'), IO.scale(stackH(roomShots.slice(0, 2), 4, '#000000'), 3));
writePng(path.join(SRC, 'boards', 'b01_room_empty_x2.png'), IO.scale(roomImg, 2));

// Board E: loop closure (idle3 vs idle0, react2 vs idle0) as onion-skin difference.
function diffCount(a, b) { let n = 0; for (let i = 0; i < a.d.length; i += 4) if (a.d.readUInt32BE(i) !== b.d.readUInt32BE(i)) n++; return n; }

// ---- animated previews (APNG) -----------------------------------------------------
const SEQ = [0, 1, 2, 3, 0, 1, 2, 3, 4, 5, 6, 0, 1, 2, 3];
for (const c of COMBOS) for (const [bgName, bg] of [['light', LIGHT], ['dark', DARK]]) {
  const fr = SEQ.map(i => IO.scale(compose(i, c, bg), 4));
  fs.writeFileSync(path.join(SRC, 'previews', `b01_${c.name}_${bgName}_x4.apng.png`), IO.encodeApng(fr, SEQ.map(i => R.FRAMES[i].ms)));
}
for (const c of [COMBOS[0], COMBOS[1], COMBOS[2]]) {
  const fr = SEQ.map(i => IO.scale(inRoom(i, c), 2));
  fs.writeFileSync(path.join(SRC, 'previews', `b01_room_${c.name}_x2.apng.png`), IO.encodeApng(fr, SEQ.map(i => R.FRAMES[i].ms)));
}

// ---- layered editable master (OpenRaster) ----------------------------------------
const guides = IO.blank(SHEET_W, R.CELL_H);
for (let k = 0; k < 7; k++) {
  const f = R.FRAMES[k];
  for (let y = 0; y < R.CELL_H; y++) { R.put(guides, k * 96, y, '#ff00ff80'); }
  for (let x = 0; x < 96; x++) R.put(guides, k * 96 + x, 117, '#00b0ff80');
  R.put(guides, k * 96 + 48, 117, '#00ffff');
  for (const [name, a] of Object.entries(R.ANCHORS)) {
    const dy = a.follows === 'hd' ? f.hd : a.follows === 'sh' ? f.sh : 0;
    R.put(guides, k * 96 + Math.floor(a.x), Math.floor(a.y) + dy, name.startsWith('grip') ? '#ffee00' : '#ff3030');
  }
}
const oraLayers = [
  { name: 'guides_pivot_anchors', img: guides, hidden: true },
  { name: 'held_main__wpn_woven_staff', img: sheet(frames.wpn_woven_staff), hidden: true },
  { name: 'held_main__wpn_ashwood_practice_blade', img: sheet(frames.wpn_ashwood_practice_blade) },
  { name: 'hair_front__hair_wild_layers', img: sheet(splits.hair_wild_layers__front), hidden: true },
  { name: 'hair__hair_short_neat', img: sheet(frames.hair_short_neat) },
  { name: 'torso__torso_novice_robe', img: sheet(frames.torso_novice_robe), hidden: true },
  { name: 'torso__torso_linen_tunic', img: sheet(frames.torso_linen_tunic) },
  { name: 'body__body_balanced', img: sheet(frames.body_balanced) },
  { name: 'hair_back__hair_wild_layers (under body)', img: sheet(splits.hair_wild_layers__back), hidden: true },
];
const merged = IO.blank(SHEET_W, R.CELL_H);
for (const l of [...oraLayers].reverse()) if (!l.hidden) R.blit(merged, l.img);
const oraBuf = IO.encodeOra(SHEET_W, R.CELL_H, oraLayers, merged);
fs.writeFileSync(path.join(SRC, 'masters', 'b01_g1_master_v1.ora'), oraBuf);
written['art-source/content-v1/masters/b01_g1_master_v1.ora'] = { sha256: sha(oraBuf) };
const roomOra = IO.encodeOra(192, 336, [{ name: 'prototype_room', img: roomImg }], roomImg);
fs.writeFileSync(path.join(SRC, 'masters', 'b01_room_v1.ora'), roomOra);

// ---- automated checks ---------------------------------------------------------------
const checks = [];
function check(name, ok, detail) { checks.push({ name, ok: !!ok, detail }); }
for (const [id, list] of Object.entries(frames)) {
  const s = IO.read(path.join(OUT_G1, id + '.png'));
  check(`${id}: 672x128`, s.w === 672 && s.h === 128, `${s.w}x${s.h}`);
  const alphas = new Set(); for (let i = 3; i < s.d.length; i += 4) alphas.add(s.d[i]);
  check(`${id}: alpha binario (0/255)`, [...alphas].every(a => a === 0 || a === 255), [...alphas].join(','));
  let edge = 0; for (let k = 0; k < 7; k++) for (let y = 0; y < 128; y++) { if (R.alpha(list[k], 0, y) || R.alpha(list[k], 95, y)) edge++; } for (let k = 0; k < 7; k++) for (let x = 0; x < 96; x++) if (R.alpha(list[k], x, 0) || R.alpha(list[k], x, 127)) edge++;
  check(`${id}: margem transparente nas bordas da celula`, edge === 0, `${edge} px`);
  check(`${id}: loop idle3->idle0 (px diferentes)`, true, diffCount(list[3], list[0]));
  check(`${id}: retorno react2->idle0 (px diferentes)`, true, diffCount(list[6], list[0]));
}
frames.body_balanced.forEach((b, k) => {
  let bottom = -1; for (let y = 127; y >= 0 && bottom < 0; y--) for (let x = 0; x < 96; x++) if (R.alpha(b, x, y)) { bottom = y; break; }
  check(`body_balanced f${k}: sola na linha do chao (y=116, contorno em 117)`, bottom === 117, `ultima linha opaca y=${bottom}`);
  let feetSame = true; for (let y = 100; y < 128; y++) for (let x = 0; x < 96; x++) if (b.d.readUInt32BE((y * 96 + x) * 4) !== frames.body_balanced[0].d.readUInt32BE((y * 96 + x) * 4)) feetSame = false;
  check(`body_balanced f${k}: pes fixos vs f0`, feetSame, '');
});
for (const id of ['wpn_ashwood_practice_blade', 'wpn_woven_staff']) frames[id].forEach((h, k) => {
  // the fist overlay must fully cover the relaxed hand of the body in every frame
  let uncovered = 0; const b = frames.body_balanced[k];
  for (let y = 84; y <= 90; y++) for (let x = 60; x <= 72; x++) { const skin = R.alpha(b, x, y) && b.d[(y * 96 + x) * 4] > 150; if (skin && !R.alpha(h, x, y)) uncovered++; }
  check(`${id} f${k}: punho cobre a mao livre`, uncovered === 0, `${uncovered} px de pele expostos`);
});
for (const f of ['prototype_room', 'contact_shadow']) { const s = IO.read(path.join(OUT_G1, f + '.png')); check(`${f}: dimensoes`, f === 'prototype_room' ? s.w === 192 && s.h === 336 : s.w === 46 && s.h === 12, `${s.w}x${s.h}`); }

fs.writeFileSync(path.join(SRC, 'checks_b01.json'), JSON.stringify(checks, null, 2));
module.exports = { written, checks, frames };
if (require.main === module) {
  const bad = checks.filter(c => !c.ok);
  console.log(`checks: ${checks.length - bad.length}/${checks.length} ok`);
  for (const c of checks.filter(c => /loop|retorno/.test(c.name))) console.log('  ', c.name, c.detail);
  for (const c of bad) console.log('FAIL', c.name, c.detail);

}
