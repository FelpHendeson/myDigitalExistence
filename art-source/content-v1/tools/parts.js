'use strict';
// Candidate (CANDIDATO_JOGAVEL) part drawings for the G1-compatible batch.
// Each part returns neutral groups that rig.poseGroups() animates.
const IO = require('./imageio.js');
const R = require('./rig.js');
const { put, span, rect, sym, tint, tintSpan, M } = R;

// --- palettes (light from upper-left) ---------------------------------------
const PAL = {
  skin: {
    peach: { o: '#2a1c26', d2: '#8f4f3f', d: '#bd7255', b: '#df9c76', l: '#f1c29c' },
    ivory: { o: '#2a1c26', d2: '#a0705c', d: '#cf9a7e', b: '#efc8a8', l: '#fbe3cb' },
    bronze: { o: '#2a1c26', d2: '#7a4430', d: '#a4603f', b: '#c6825a', l: '#dca47a' },
    chestnut: { o: '#24161e', d2: '#4e2a22', d: '#6e3e2e', b: '#8e563c', l: '#ad7350' },
  },
  hair: {
    brown: { o: '#24161a', d: '#4a2c22', b: '#6e4430', l: '#93603f', ll: '#b07a50' },
    silver: { o: '#2a2632', d: '#7c7a8c', b: '#a8a8b8', l: '#cfd0dc', ll: '#eceef4' },
  },
  face: { lid: '#2b1a22', iris: '#6b4430', glint: '#fff3df', brow: '#4a2c22', mouth: '#7a3040', mouthDark: '#5a1f2c', tongue: '#c4566a', blush: '#e7826f' },
  under: { d: '#3a3448', b: '#4c4660', l: '#615a78' },
  pants: { d: '#463b45', b: '#5e5060', l: '#7a6a78', belt: '#3a2626', buckle: '#c9a25a' },
  shoes: { sole: '#24161a', d: '#3e2722', b: '#5a3a30', l: '#7a5242' },
};
const OUTLINE = { body: '#2a1c26', tunic: '#4a3a30', robe: '#11262c', hair: '#24161a', blade: '#24161a', staff: '#2a1c16', vest: '#2e1e18', coat: '#26160f', iron: '#1e1a24' };

// --- body_balanced -----------------------------------------------------------
function drawFace(img, expr, S, F, opts = {}) {
  const eye = (x0, mode) => {
    const { lid, iris, glint } = F;
    if (mode === 'happy') { put(img, x0 + 1, 33, lid); put(img, x0, 34, lid); put(img, x0 + 2, 34, lid); return; }
    if (mode === 'soft') { span(img, 33, x0, x0 + 2, S.d); span(img, 34, x0, x0 + 2, lid); put(img, x0, 35, lid); span(img, 35, x0 + 1, x0 + 2, iris); return; }
    const top = mode === 'wide' ? 32 : 33;
    span(img, top, x0, x0 + 2, lid);
    for (let y = top + 1; y <= 35; y++) { put(img, x0, y, lid); span(img, y, x0 + 1, x0 + 2, opts.iris || iris); }
    put(img, x0 + 2, top + 1, glint);
  };
  const browY = expr === 'wide' ? 29 : 30;
  span(img, browY, 38, 41, F.brow); span(img, browY, 54, 57, F.brow);
  if (expr === 'neutral' || expr === 'soft' || expr === 'smile') { put(img, 38, browY + 1, F.brow); put(img, 57, browY + 1, F.brow); }
  const mode = expr === 'happy' ? 'happy' : expr === 'soft' ? 'soft' : expr === 'wide' ? 'wide' : 'open';
  eye(39, mode); eye(54, mode);
  put(img, 48, 38, S.d); put(img, 48, 39, S.d); // nose, shadow side
  if (expr === 'smile' || expr === 'happy') {
    put(img, 45, 41, F.mouth); put(img, 50, 41, F.mouth);
    span(img, 42, 46, 49, expr === 'happy' ? F.mouthDark : F.mouth);
    if (expr === 'happy') span(img, 43, 47, 48, F.tongue);
    span(img, 39, 38, 39, F.blush); span(img, 39, 56, 57, F.blush);
  } else if (expr === 'wide') {
    span(img, 42, 47, 48, F.mouthDark); span(img, 43, 47, 48, F.mouthDark);
  } else {
    span(img, 42, 47, 48, F.mouth);
  }
  if (opts.freckles) for (const [x, y] of [[38, 37], [40, 38], [55, 38], [57, 37]]) put(img, x, y, S.d);
  if (opts.scar) { put(img, 57, 31, S.d2); put(img, 58, 32, S.d2); put(img, 58, 33, S.l); }
}

function drawEars(img, S, kind) {
  if (kind === 'elf') {
    const rows = { 27: [30, 30], 28: [30, 31], 29: [31, 32], 30: [31, 34], 31: [32, 34], 32: [33, 34], 33: [33, 34], 34: [33, 34], 35: [33, 34], 36: [33, 34], 37: [34, 34] };
    for (const [y, [a, b]] of Object.entries(rows)) { span(img, +y, a, b, S.b); span(img, +y, M(b), M(a), S.d); }
    for (const y of [30, 31, 32, 33, 34]) { put(img, 34, y, S.d); put(img, 61, y, S.d2); }
    put(img, 30, 27, S.l); put(img, 31, 28, S.l);
    return;
  }
  for (let y = 31; y <= 37; y++) {
    const x0 = y === 31 || y === 37 ? 34 : 33;
    span(img, y, x0, 34, S.b); span(img, y, 61, M(x0), S.d);
  }
  for (let y = 33; y <= 35; y++) { put(img, 34, y, S.d); put(img, 61, y, S.d2); }
}

function body(expr, pose = R.DEFAULT_POSE, look = {}) {
  const S = PAL.skin[look.skin || 'peach'], F = PAL.face, U = PAL.under, P = PAL.pants, SH = PAL.shoes;
  const bodyImg = IO.blank(R.CELL_W, R.CELL_H), head = IO.blank(R.CELL_W, R.CELL_H);
  const st = pose.stance || 0;
  // trunk with fitted undershirt
  for (let y = 51; y <= 77; y++) {
    const hw = R.TRUNK_HW(y); sym(bodyImg, y, hw, U.b);
    const x0 = 48 - hw, x1 = 47 + hw;
    tintSpan(bodyImg, y, x1 - 2, x1, U.d);
    if (y >= 53 && y <= 64) put(bodyImg, x0, y, U.l);
    if (y >= 76) tintSpan(bodyImg, y, x0 + 1, x1, U.d);
  }
  // neck (extends under the chin so head offsets never open a gap)
  for (let y = 41; y <= 52; y++) {
    sym(bodyImg, y, y === 52 ? 3 : 4, S.d);
    if (y <= 48) sym(bodyImg, y, 4, y >= 47 ? S.d2 : S.d);
    put(bodyImg, 44 + (y === 52 ? 1 : 0), y, y >= 49 ? S.b : S.d);
  }
  // arms and relaxed hands
  for (let y = 53; y <= 90; y++) {
    const L = R.armSpanLeft(y, pose), Rr = R.armSpanRight(y, pose);
    span(bodyImg, y, L[0], L[1], S.b); span(bodyImg, y, Rr[0], Rr[1], S.b);
    if (y >= 55) put(bodyImg, L[0], y, S.l);
    put(bodyImg, L[1], y, S.d);
    put(bodyImg, Rr[0], y, S.d); put(bodyImg, Rr[1], y, S.d); if (y >= 58 && y <= 83) put(bodyImg, Rr[1] - 1, y, S.d);
    if (y === 90) { span(bodyImg, y, L[0], L[1], S.d); span(bodyImg, y, Rr[0], Rr[1], S.d2); }
  }
  const lh = R.armSpanLeft(89, pose), rh = R.armSpanRight(89, pose);
  put(bodyImg, lh[0] + 2, 89, S.d); put(bodyImg, lh[0] + 4, 89, S.d);
  put(bodyImg, rh[1] - 2, 89, S.d2); put(bodyImg, rh[1] - 4, 89, S.d2);
  for (let y = 84; y <= 86; y++) { put(bodyImg, lh[1], y, S.d); put(bodyImg, rh[0], y, S.d); }
  // hips, belt and trousers (G1: legs live in the body sheet)
  for (let y = 78; y <= 84; y++) sym(bodyImg, y, 12, P.b);
  span(bodyImg, 78, 36, 59, P.belt); span(bodyImg, 78, 47, 48, P.buckle);
  for (let y = 79; y <= 84; y++) { span(bodyImg, y, 57, 59, P.d); put(bodyImg, 36, y, P.l); }
  for (let y = 85; y <= 110; y++) {
    const a = (y <= 100 ? 37 : 38) - st, b = 46 - (y > 100 ? 0 : 0) - st;
    span(bodyImg, y, a, b, P.b); put(bodyImg, a, y, P.l); put(bodyImg, b, y, P.d);
    const c = 49 + st, e = (y <= 100 ? 58 : 57) + st;
    span(bodyImg, y, c, e, P.b); put(bodyImg, e, y, P.d); put(bodyImg, e - 1, y, P.d); put(bodyImg, c, y, P.d);
  }
  if (!st) span(bodyImg, 85, 45, 50, P.d); else span(bodyImg, 85, 45 - st, 50 + st, P.d);
  put(bodyImg, 41 - st, 97, P.d); put(bodyImg, 42 - st, 98, P.d); put(bodyImg, 54 + st, 97, P.d);
  // shoes on the ground line
  for (let y = 111; y <= 116; y++) {
    const la = (y === 111 ? 37 : 36) - st, lb = 46 - st, ra = 49 + st, rb = (y === 111 ? 58 : 59) + st;
    const col = y === 116 ? SH.sole : SH.b;
    span(bodyImg, y, la, lb, col); span(bodyImg, y, ra, rb, col);
    if (y < 116) { put(bodyImg, lb, y, SH.d); put(bodyImg, rb, y, SH.d); put(bodyImg, rb - 1, y, SH.d); }
  }
  span(bodyImg, 112, 37 - st, 39 - st, SH.l); span(bodyImg, 112, 50 + st, 51 + st, SH.l);
  span(bodyImg, 111, 37 - st, 46 - st, SH.d); span(bodyImg, 111, 49 + st, 58 + st, SH.d);

  // head
  for (let y = 20; y <= 46; y++) {
    const hw = R.headHw(y); sym(head, y, hw, S.b);
    const x0 = 48 - hw, x1 = 47 + hw;
    tintSpan(head, y, x1 - 1, x1, S.d);
    if (y >= 23 && y <= 27) tintSpan(head, y, x0 + 1, x0 + 4, S.l);
    if (y >= 44) tintSpan(head, y, 48, x1, S.d);
    if (y === 46) tintSpan(head, y, x0, x1, S.d);
  }
  put(head, 37, 36, S.l); put(head, 38, 36, S.l);
  drawEars(head, S, look.ears || 'human');
  drawFace(head, expr, S, F, look);
  return { body: bodyImg, head };
}

// --- hair --------------------------------------------------------------------
function hairShortNeat(look = {}) {
  const H = PAL.hair[look.hair || 'brown'];
  const head = IO.blank(R.CELL_W, R.CELL_H);
  const rows = { 16: [[42, 53]], 17: [[39, 56]], 18: [[37, 58]], 19: [[36, 59]], 20: [[35, 60]] };
  for (let y = 21; y <= 26; y++) rows[y] = [[34, 61]];
  rows[27] = [[34, 37], [40, 53], [58, 61]];
  rows[28] = [[34, 36], [42, 50], [59, 61]];
  rows[29] = [[34, 35], [44, 46], [60, 61]];
  for (let y = 30; y <= 32; y++) rows[y] = [[34, 35], [60, 61]];
  for (const [y, segs] of Object.entries(rows)) for (const [a, b] of segs) span(head, +y, a, b, H.b);
  for (let y = 18; y <= 29; y++) tintSpan(head, y, 59, 61, H.d);
  tintSpan(head, 17, 40, 46, H.l); tintSpan(head, 18, 38, 47, H.l); tintSpan(head, 19, 37, 44, H.l);
  put(head, 41, 17, H.ll); put(head, 42, 17, H.ll); put(head, 40, 18, H.ll);
  for (const [x, y] of [[42, 16], [42, 17], [43, 20], [44, 21], [45, 22], [46, 23], [47, 24], [48, 25], [52, 21], [53, 22], [54, 23], [55, 24], [38, 22], [37, 23], [37, 24]]) tint(head, x, y, H.d);
  for (const [x, y] of [[45, 29], [46, 28], [50, 28], [53, 27], [40, 27], [34, 30], [34, 31], [34, 32], [60, 30], [61, 31], [61, 32]]) tint(head, x, y, H.d);
  return { head };
}

function hairWildLayers(look = {}) {
  const H = PAL.hair[look.hair || 'brown'];
  const head = IO.blank(R.CELL_W, R.CELL_H), lag = IO.blank(R.CELL_W, R.CELL_H);
  const back = IO.blank(R.CELL_W, R.CELL_H), backLag = IO.blank(R.CELL_W, R.CELL_H);
  const rows = {
    11: [[47, 48]], 12: [[38, 39], [46, 49]], 13: [[38, 40], [45, 50], [56, 57]], 14: [[37, 41], [44, 51], [55, 58]],
    15: [[37, 58]], 16: [[35, 60]], 17: [[34, 61]], 18: [[33, 62]], 19: [[32, 63]], 20: [[30, 64]], 21: [[30, 65]], 22: [[31, 65]],
    28: [[32, 40], [42, 47], [49, 53], [55, 63]],
    29: [[32, 35], [37, 40], [43, 46], [49, 52], [56, 58], [60, 63]],
    30: [[32, 35], [44, 46], [50, 51], [60, 63]],
    31: [[32, 35], [45, 45], [60, 63]],
  };
  for (let y = 23; y <= 27; y++) rows[y] = [[32, 63]];
  for (let y = 32; y <= 40; y++) rows[y] = [[31, 35], [60, 64]];
  for (const [y, segs] of Object.entries(rows)) for (const [a, b] of segs) span(head, +y, a, b, H.b);
  const lagRows = { 41: [[31, 34], [61, 64]], 42: [[31, 34], [61, 64]], 43: [[32, 34], [61, 63]], 44: [[32, 33], [62, 63]], 45: [[33, 33], [62, 62]] };
  for (const [y, segs] of Object.entries(lagRows)) for (const [a, b] of segs) span(lag, +y, a, b, H.b);
  // shading: highlight crown upper-left, strand breaks, shadowed right side
  tintSpan(head, 15, 38, 45, H.l); tintSpan(head, 16, 36, 46, H.l); tintSpan(head, 17, 36, 44, H.l); tintSpan(head, 18, 35, 41, H.l);
  for (const [x, y] of [[39, 13], [38, 14], [47, 12], [46, 13], [40, 16], [41, 16]]) tint(head, x, y, H.ll);
  for (let y = 18; y <= 40; y++) tintSpan(head, y, 61, 64, H.d);
  for (const [x, y] of [[41, 19], [41, 20], [40, 21], [40, 22], [39, 23], [39, 24], [48, 20], [48, 21], [48, 22], [47, 23], [47, 24], [47, 25], [55, 19], [55, 20], [56, 21], [56, 22], [57, 23], [57, 24], [41, 28], [48, 28], [54, 28],
    [35, 29], [35, 30], [35, 31], [33, 33], [33, 34], [33, 35], [33, 36], [34, 38], [34, 39], [34, 40], [46, 30], [51, 30], [40, 29], [58, 29]]) tint(head, x, y, H.d);
  for (let y = 41; y <= 45; y++) { tintSpan(lag, y, 61, 64, H.d); tint(lag, 34, y, H.d); }
  // hair behind the neck (drawn under the body in the split master)
  const backRows = {};
  for (let y = 38; y <= 46; y++) backRows[y] = [[34, 42], [53, 61]];
  backRows[47] = [[35, 42], [53, 60]];
  for (const [y, segs] of Object.entries(backRows)) for (const [a, b] of segs) span(back, +y, a, b, H.d);
  const backLagRows = { 48: [[35, 38], [40, 42], [53, 55], [57, 60]], 49: [[35, 36], [41, 42], [53, 54], [59, 60]] };
  for (const [y, segs] of Object.entries(backLagRows)) for (const [a, b] of segs) span(backLag, +y, a, b, H.d);
  for (let y = 40; y <= 47; y++) { put(back, 38, y, H.o); put(back, 57, y, H.o); }
  return { head, lag, back, backLag };
}

// --- torsos ------------------------------------------------------------------
function tunicLinen(pose = R.DEFAULT_POSE, look = {}) {
  const T = { d2: '#a89470', d: '#cbb894', b: '#e9dcbd', l: '#f7f0dc' };
  const C = { d: '#2c4d5e', b: '#3f6a80', l: '#6a94a8' };
  const Rd = look.sash || { d: '#7a3a2c', b: '#a2503a', l: '#c4704f' };
  const img = IO.blank(R.CELL_W, R.CELL_H);
  const hw = y => (y === 50 ? 7 : y === 51 ? 9 : y === 52 ? 12 : y <= 62 ? 14 : y <= 72 ? 13 : y <= 77 ? 12 : y <= 84 ? 13 : y <= 90 ? 14 : 0);
  for (let y = 50; y <= 90; y++) {
    const w = hw(y); sym(img, y, w, T.b);
    const x0 = 48 - w, x1 = 47 + w;
    tintSpan(img, y, x1 - 2, x1 - 1, T.d); put(img, x1, y, T.d2);
    if (y >= 52 && y <= 72) put(img, x0, y, T.l);
  }
  // sleeves follow the shared arm spans
  for (let y = 53; y <= 63; y++) {
    const L = R.armSpanLeft(y, pose), Rr = R.armSpanRight(y, pose);
    span(img, y, L[0] - 1, L[1] + 1, T.b); span(img, y, Rr[0] - 1, Rr[1] + 1, T.d);
    put(img, L[0] - 1, y, T.l); put(img, L[1] + 1, y, T.d); put(img, Rr[1] + 1, y, T.d2); put(img, Rr[0] - 1, y, T.d2);
    if (y === 63) { span(img, y, L[0] - 1, L[1] + 1, T.d); span(img, y, Rr[0] - 1, Rr[1] + 1, T.d2); }
  }
  // V neckline with contrasting collar (body shows through the opening)
  const open = { 50: [44, 51], 51: [45, 50], 52: [45, 50], 53: [46, 49], 54: [46, 49], 55: [47, 48], 56: [47, 48] };
  for (const [y, [a, b]] of Object.entries(open)) {
    span(img, +y, a, b, null); for (let x = a; x <= b; x++) img.d[((+y) * img.w + x) * 4 + 3] = 0;
    put(img, a - 1, +y, C.l); put(img, a - 2, +y, C.b); put(img, b + 1, +y, C.b); put(img, b + 2, +y, C.d);
  }
  span(img, 57, 46, 49, C.b); put(img, 49, 57, C.d);
  span(img, 50, 41, 42, C.b); span(img, 50, 53, 54, C.d);
  // sash with knot and tail on the left hip
  for (let y = 74; y <= 76; y++) { const w = hw(y); span(img, y, 48 - w, 47 + w, y === 74 ? Rd.l : y === 76 ? Rd.d : Rd.b); }
  rect(img, 39, 75, 42, 77, Rd.b); put(img, 39, 75, Rd.l); put(img, 42, 77, Rd.d);
  for (let y = 78; y <= 84; y++) { put(img, 40, y, Rd.b); put(img, 41, y, Rd.d); }
  put(img, 40, 84, Rd.d);
  // seams and folds
  for (let y = 59; y <= 71; y += 2) put(img, 48, y, T.d);
  for (let y = 80; y <= 89; y++) { put(img, 44, y, T.d); put(img, 53, y, T.d2); }
  for (let x = 36; x <= 59; x += 2) put(img, x, 88, T.d);
  span(img, 90, 34, 61, T.d);
  if (look.motifStripe) span(img, 89, 35, 60, Rd.b);
  return { body: img };
}

function robeNovice(pose = R.DEFAULT_POSE) {
  const N = { dd: '#173840', d: '#205058', b: '#2f6b72', l: '#4b8d91' };
  const L = { d: '#b8a47a', b: '#d8c69c', l: '#efe2c0' };
  const cord = { b: '#c9a25a', d: '#9a7a3e' };
  const img = IO.blank(R.CELL_W, R.CELL_H);
  const hw = y => (y === 50 ? 8 : y === 51 ? 10 : y === 52 ? 13 : y <= 62 ? 14 : y <= 72 ? 13 : y <= 77 ? 12 : y <= 84 ? 13 : y <= 90 ? 14 : y <= 96 ? 15 : 0);
  for (let y = 50; y <= 96; y++) {
    const w = hw(y); sym(img, y, w, N.b);
    const x0 = 48 - w, x1 = 47 + w;
    tintSpan(img, y, x1 - 2, x1 - 1, N.d); put(img, x1, y, N.dd);
    if (y >= 52 && y <= 90) put(img, x0, y, N.l);
  }
  // lower layer of the robe (second tier) and hem
  span(img, 90, 34, 61, N.dd); for (let y = 91; y <= 96; y++) put(img, 33, y, N.l);
  span(img, 96, 33, 62, N.dd);
  // front opening showing the inner layer
  for (let y = 79; y <= 96; y++) { span(img, y, 46, 49, N.dd); put(img, 45, y, N.l); put(img, 50, y, N.d); }
  // wide sleeves, hands free
  for (let y = 52; y <= 76; y++) {
    const A = R.armSpanLeft(y, pose) || [33, 35], B = R.armSpanRight(y, pose) || [60, 62];
    const grow = y < 60 ? 1 : y < 66 ? 2 : y < 71 ? 3 : 4;
    span(img, y, A[0] - grow, A[1] + 1, N.b); span(img, y, B[0] - 1, B[1] + grow, N.d);
    put(img, A[0] - grow, y, N.l); put(img, A[1] + 1, y, N.d); put(img, B[1] + grow, y, N.dd); put(img, B[0] - 1, y, N.dd);
    if (y >= 75) {
      span(img, y, A[0] - grow, A[1] + 1, y === 75 ? L.b : N.dd); span(img, y, B[0] - 1, B[1] + grow, y === 75 ? L.d : N.dd);
      if (y === 76) { put(img, A[0] - grow, y, N.d); put(img, B[1] + grow, y, N.d); }
    }
  }
  // unfolded collar / lapels in cream lining
  const open = { 50: [44, 51], 51: [44, 51], 52: [45, 50], 53: [45, 50], 54: [46, 49], 55: [46, 49], 56: [46, 49], 57: [47, 48], 58: [47, 48] };
  for (let y = 50; y <= 62; y++) {
    const o = open[y];
    const a = o ? o[0] : 48, b = o ? o[1] : 47;
    const flap = y >= 51 && y <= 54 ? y - 50 : y >= 55 && y <= 57 ? 58 - y : 0;
    span(img, y, a - 3 - flap, a - 1, L.b); span(img, y, b + 1, b + 3 + flap, L.d);
    put(img, a - 1, y, L.l); put(img, a - 3 - flap, y, L.d); put(img, b + 3 + flap, y, N.dd);
    if (o) for (let x = a; x <= b; x++) img.d[(y * img.w + x) * 4 + 3] = 0;
  }
  // belt cord and knot
  for (let y = 73; y <= 74; y++) { const w = hw(y); span(img, y, 48 - w, 47 + w, y === 73 ? cord.b : cord.d); }
  rect(img, 46, 72, 49, 75, cord.b); put(img, 49, 75, cord.d); put(img, 46, 72, '#e4c47e');
  for (let y = 76; y <= 80; y++) put(img, 46, y, cord.b); for (let y = 76; y <= 79; y++) put(img, 49, y, cord.d);
  return { body: img };
}

// --- held items (drawn per frame; fist overlay covers the relaxed hand) -----
function fist(img, pose, S) {
  const r = R.armSpanRight(86, pose); const x0 = r[0], x1 = r[1]; // 63..68 at rest
  span(img, 84, x0 + 1, x1 - 1, S.b);
  for (let y = 85; y <= 89; y++) span(img, y, x0, x1, S.b);
  span(img, 90, x0 + 1, x1 - 1, S.d);
  span(img, 84, x0 + 1, x0 + 3, S.l); span(img, 85, x0, x0 + 2, S.l); put(img, x0 + 3, 85, S.d);
  put(img, x0 + 1, 88, S.d); put(img, x0 + 3, 88, S.d); put(img, x0 + 1, 89, S.d); put(img, x0 + 3, 89, S.d);
  for (let y = 85; y <= 89; y++) put(img, x1, y, S.d);
}

function practiceBlade(frameIndex, pose = R.DEFAULT_POSE, look = {}) {
  const S = PAL.skin[look.skin || 'peach'];
  const W = { o: '#24161a', d: '#4a3226', b: '#6b4a36', l: '#8e6849' };
  const B = { d: '#2b4d75', b: '#3f6fa0', l: '#6a98c4' };
  const img = IO.blank(R.CELL_W, R.CELL_H);
  const g = R.gripAnchor(pose);
  const c = y => Math.floor(g.x + (g.y - y) / 2);
  // blade (dark ash wood, rounded tip)
  for (let y = 51; y <= 78; y++) { const k = c(y); put(img, k - 1, y, W.l); put(img, k, y, W.l); put(img, k + 1, y, W.b); put(img, k + 2, y, W.d); }
  { const k = c(50); span(img, 50, k - 1, k + 1, W.b); put(img, k - 1, 50, W.l); }
  { const k = c(49); span(img, 49, k, k + 1, W.l); }
  for (const y of [58, 66, 72]) put(img, c(y) + 1, y, W.d);
  // blue cloth guard just above the grip
  for (let y = 79; y <= 83; y++) { const k = c(y); span(img, y, k - 3, k + 2, y === 79 ? B.l : y === 83 ? B.d : B.b); put(img, k - 3, y, B.l); put(img, k + 2, y, B.d); }
  put(img, c(81), 81, B.d); put(img, c(81) - 1, 80, B.l);
  // cloth tail sways a pixel through the cycle
  const sway = [0, 0, 1, 1, 1, 2, 1][frameIndex] || 0;
  const tx = c(82) + 3;
  for (let r = 0; r < 6; r++) { const x = tx + (r >> 1) + (r >= 3 ? sway : 0); put(img, x, 81 + r, r % 2 ? B.d : B.b); if (r < 4) put(img, x + 1, 81 + r, B.d); }
  // grip and pommel
  for (let y = 84; y <= 91; y++) { const k = c(y); put(img, k - 1, y, W.b); put(img, k, y, W.d); }
  const p = c(93); span(img, 92, p - 2, p, W.b); span(img, 93, p - 2, p, W.d); put(img, p - 2, 92, W.l);
  fist(img, pose, S);
  return img;
}

function wovenStaff(frameIndex, pose = R.DEFAULT_POSE, look = {}) {
  const S = PAL.skin[look.skin || 'peach'];
  const W = { d: '#5a4028', b: '#7a5a3a', l: '#9a7650' };
  const Fb = { d: '#9c8250', b: '#b89a62', l: '#d8c08a' };
  const img = IO.blank(R.CELL_W, R.CELL_H);
  const g = R.gripAnchor(pose);
  const base = { x: g.x - 3.2, y: 116 };
  const cx = y => Math.floor(base.x + (base.y - y) / 9);
  for (let y = 27; y <= 116; y++) {
    const k = cx(y);
    if (y >= 113) { span(img, y, k - 1, k + 1, W.d); continue; }
    put(img, k - 1, y, W.l); put(img, k, y, W.b); put(img, k + 1, y, W.d);
    if (y >= 30 && y <= 110) {
      // diagonal weave of fibre over the wood
      for (let i = -1; i <= 1; i++) if (((y + i * 2) % 6 + 6) % 6 < 2) put(img, k + i, y, i < 0 ? Fb.l : i === 0 ? Fb.b : Fb.d);
    }
  }
  // grip wrapped in the weave
  for (let y = 80; y <= 93; y++) { const k = cx(y); put(img, k - 1, y, Fb.l); put(img, k, y, y % 2 ? Fb.d : Fb.b); put(img, k + 1, y, Fb.d); }
  // hollow ring on top (no crystal)
  const rc = { x: cx(20) + 0.5, y: 20.5 };
  for (let y = 13; y <= 28; y++) for (let x = Math.floor(rc.x) - 8; x <= Math.floor(rc.x) + 8; x++) {
    const d = Math.hypot(x + 0.5 - rc.x - 0.5, y + 0.5 - rc.y - 0.5);
    if (d >= 3.3 && d <= 6.2) {
      const lit = (x - rc.x) + (y - rc.y) < -2;
      const dark = (x - rc.x) + (y - rc.y) > 3;
      put(img, x, y, lit ? W.l : dark ? W.d : W.b);
      if (d <= 4.2 && !lit) put(img, x, y, W.d);
    }
  }
  // fibre binding where ring meets shaft and a small tassel that sways
  const kb = cx(28); span(img, 27, kb - 1, kb + 1, Fb.l); span(img, 28, kb - 1, kb + 1, Fb.d);
  const sway = [0, 0, 1, 0, 1, 1, 0][frameIndex] || 0;
  for (let r = 0; r < 5; r++) put(img, kb + 2 + (r > 2 ? sway : 0), 28 + r, r % 2 ? Fb.d : Fb.b);
  fist(img, pose, S);
  return img;
}

// --- room and shadow ---------------------------------------------------------
function room() {
  const img = IO.blank(192, 336);
  const Wl = { top: '#241c2c', beam: '#3a2c38', beamL: '#4c3a44', w0: '#55445e', w1: '#4e3e58', w2: '#473852', panel: '#5c4038', panelD: '#4a322e', trim: '#8a6250', trimD: '#6b4a3e', base: '#3a2626' };
  rect(img, 0, 0, 191, 15, Wl.top);
  rect(img, 0, 16, 191, 19, Wl.beam); span(img, 16, 0, 191, Wl.beamL);
  // wall lit from the upper-left window: three flat value bands, plain behind the character
  rect(img, 0, 20, 191, 111, Wl.w1); rect(img, 0, 20, 63, 111, Wl.w0); rect(img, 140, 20, 191, 111, Wl.w2);
  for (let x = 4; x < 60; x += 8) for (let y = 24; y < 108; y += 2) if (x < 14 || x > 60) put(img, x, y, Wl.w1);
  // wainscot
  rect(img, 0, 112, 191, 137, Wl.panel); span(img, 112, 0, 191, Wl.trim); span(img, 113, 0, 191, Wl.trimD);
  for (let x = 0; x < 192; x += 24) { rect(img, x + 3, 117, x + 20, 133, Wl.panelD); span(img, 117, x + 3, x + 20, '#4f3630'); span(img, 133, x + 3, x + 20, Wl.trimD); }
  rect(img, 0, 138, 191, 140, Wl.base);
  // floor planks with perspective rows
  const F = { a: '#7a5442', b: '#84604b', c: '#6e4a3a', seam: '#4e3430', lit: '#93705a' };
  let y = 141, h = 6, row = 0;
  while (y < 336) {
    const col = row % 3 === 0 ? F.a : row % 3 === 1 ? F.b : F.c;
    rect(img, 0, y, 191, Math.min(335, y + h - 1), col);
    span(img, Math.min(335, y + h - 1), 0, 191, F.seam);
    const step = 34 + (row % 2) * 9, offs = (row * 23) % step;
    for (let x = offs; x < 192; x += step) for (let yy = y; yy < Math.min(336, y + h - 1); yy++) put(img, x, yy, F.seam);
    for (let x = (offs + 11) % step; x < 192; x += step) if (h > 7) put(img, x + 3, y + 2, F.c);
    y += h; row++; if (row % 2 === 0) h = Math.min(14, h + 1);
  }
  // soft window light on the floor (blocky parallelogram, two values)
  for (let yy = 196; yy <= 250; yy++) { const sh = Math.floor((yy - 196) * 0.5); for (let x = 22 + sh; x <= 70 + sh; x++) { const o = (yy * 192 + x) * 4; if (img.d[o] < 0x70) continue; img.d[o] = Math.min(255, img.d[o] + 14); img.d[o + 1] = Math.min(255, img.d[o + 1] + 10); img.d[o + 2] = Math.min(255, img.d[o + 2] + 6); } }
  // window upper-left with curtains
  const Wn = { frame: '#8a6250', frameL: '#a87a5c', frameD: '#5a3e34', s0: '#2f4a6a', s1: '#3d5c7c', s2: '#58789a', star: '#e8e0c0', moon: '#f0d890' };
  rect(img, 14, 34, 58, 88, Wn.frameD); rect(img, 16, 36, 56, 86, Wn.frame);
  rect(img, 19, 39, 53, 83, Wn.s0); rect(img, 19, 60, 53, 72, Wn.s1); rect(img, 19, 73, 53, 83, Wn.s2);
  rect(img, 35, 39, 37, 83, Wn.frame); rect(img, 19, 60, 53, 61, Wn.frame);
  span(img, 36, 16, 56, Wn.frameL); for (let yy = 36; yy <= 86; yy++) put(img, 16, yy, Wn.frameL);
  for (const [sx, sy] of [[24, 44], [46, 48], [29, 54], [50, 42]]) put(img, sx, sy, Wn.star);
  rect(img, 42, 44, 46, 50, Wn.moon); rect(img, 44, 43, 47, 49, Wn.s0); put(img, 42, 44, Wn.s0); put(img, 42, 50, Wn.s0);
  // distant hills
  for (let x = 19; x <= 53; x++) { const hh = 78 - Math.round(3 * Math.sin(x / 4)) - (x > 38 ? 2 : 0); for (let yy = hh; yy <= 83; yy++) put(img, x, yy, '#2a3a52'); }
  rect(img, 12, 88, 60, 91, Wn.frameL); span(img, 91, 12, 60, Wn.frameD);
  const Cu = { b: '#7a3a3c', l: '#9a5048', d: '#5a2a30' };
  for (const x0 of [8, 54]) { rect(img, x0, 30, x0 + 7, 96, Cu.b); for (let yy = 30; yy <= 96; yy++) { put(img, x0 + 2, yy, Cu.l); put(img, x0 + 5, yy, Cu.d); } span(img, 96, x0, x0 + 7, Cu.d); }
  rect(img, 4, 28, 66, 30, Wn.frameD); span(img, 28, 4, 66, Wn.frame);
  // bed on the left (headboard, mattress, blanket, footboard)
  const Bd = { wood: '#6b4430', woodL: '#8a5a3e', woodD: '#4a2e22', sheet: '#e9dcbd', sheetD: '#cbb894', bl: '#3f6a80', blL: '#5a8aa0', blD: '#2c4d5e' };
  rect(img, 4, 104, 62, 134, Bd.wood); span(img, 104, 6, 60, Bd.woodL); rect(img, 4, 104, 6, 134, Bd.woodL); rect(img, 60, 104, 62, 134, Bd.woodD);
  rect(img, 8, 102, 14, 104, Bd.wood); rect(img, 52, 102, 58, 104, Bd.wood);
  rect(img, 10, 110, 56, 114, Bd.woodD);
  rect(img, 2, 130, 64, 172, Bd.sheet); // mattress top
  rect(img, 10, 122, 54, 136, Bd.sheet); rect(img, 10, 134, 54, 136, Bd.sheetD); span(img, 122, 12, 52, '#f7f0dc'); put(img, 10, 122, null);
  rect(img, 2, 142, 64, 172, Bd.bl); span(img, 142, 2, 64, Bd.blL); rect(img, 2, 142, 64, 146, Bd.sheet); span(img, 146, 2, 64, Bd.sheetD);
  for (let yy = 150; yy <= 170; yy += 6) span(img, yy, 6, 60, Bd.blD);
  for (let x = 14; x <= 54; x += 20) for (let yy = 148; yy <= 171; yy++) put(img, x, yy, Bd.blL);
  rect(img, 58, 147, 64, 172, Bd.blD);
  rect(img, 0, 172, 66, 186, Bd.wood); span(img, 172, 0, 66, Bd.woodL); rect(img, 0, 184, 66, 186, Bd.woodD);
  rect(img, 2, 186, 6, 190, Bd.woodD); rect(img, 60, 186, 64, 190, Bd.woodD);
  // care corner on the right: cabinet, basin, towel, food bowl
  const Cb = { b: '#6b4430', l: '#8a5a3e', d: '#4a2e22', knob: '#c9a25a' };
  rect(img, 140, 120, 188, 162, Cb.b); rect(img, 138, 116, 190, 120, Cb.l); span(img, 120, 138, 190, Cb.d);
  rect(img, 144, 124, 162, 158, Cb.d); rect(img, 166, 124, 184, 158, Cb.d); rect(img, 145, 125, 161, 157, Cb.b); rect(img, 167, 125, 183, 157, Cb.b);
  put(img, 159, 140, Cb.knob); put(img, 169, 140, Cb.knob); rect(img, 140, 162, 188, 164, Cb.d);
  const Ba = { rim: '#c8d6dc', b: '#9ab0b8', d: '#6e8894', water: '#5a8aa0' };
  rect(img, 144, 108, 166, 115, Ba.b); span(img, 108, 144, 166, Ba.rim); span(img, 109, 146, 164, Ba.water); span(img, 115, 146, 164, Ba.d);
  rect(img, 150, 104, 152, 107, '#e8e0c0'); put(img, 151, 103, '#e8e0c0');
  const Tw = { b: '#e9dcbd', d: '#cbb894', st: '#a2503a' };
  rect(img, 172, 122, 182, 148, Tw.b); for (let yy = 122; yy <= 148; yy++) put(img, 182, yy, Tw.d); span(img, 140, 172, 182, Tw.st); span(img, 143, 172, 182, Tw.st); span(img, 122, 170, 184, Cb.d);
  const Bo = { b: '#a2503a', d: '#7a3a2c', apple: '#c4504a', appleL: '#e07060', bread: '#d4a060', breadD: '#a87a40', leaf: '#5a8a4a' };
  rect(img, 168, 110, 186, 115, Bo.b); span(img, 115, 170, 184, Bo.d); span(img, 110, 168, 186, '#c4704f');
  rect(img, 170, 105, 175, 109, Bo.apple); put(img, 171, 106, Bo.appleL); put(img, 173, 104, Bo.leaf);
  rect(img, 176, 104, 184, 109, Bo.bread); span(img, 109, 176, 184, Bo.breadD); put(img, 179, 105, Bo.breadD); put(img, 182, 105, Bo.breadD);
  // shelf with plant and books on the right wall
  rect(img, 136, 62, 186, 65, Cb.l); span(img, 65, 136, 186, Cb.d);
  const books = [['#3f6a80', 10], ['#a2503a', 12], ['#c9a25a', 9], ['#2f6b72', 11]];
  let bx = 140; for (const [c, hh] of books) { rect(img, bx, 62 - hh, bx + 3, 61, c); put(img, bx, 62 - hh, '#f7f0dc'); bx += 4; }
  rect(img, 166, 52, 178, 61, '#a2603a'); span(img, 52, 165, 179, '#c47a4a'); span(img, 61, 166, 178, '#7a4228');
  for (const [lx, ly, len, dir] of [[171, 51, 9, -1], [173, 51, 10, 1], [172, 51, 13, 0]]) for (let i = 0; i < len; i++) { put(img, lx + Math.round(dir * i * 0.6), ly - i, i % 3 ? '#4a7a4a' : '#6a9a5a'); put(img, lx + Math.round(dir * i * 0.6) + 1, ly - i, '#3a5e3e'); }
  // rug under the character
  const Rg = { b: '#3e6a64', d: '#2e524e', l: '#55827a', border: '#c9a25a', borderD: '#9a7a3e' };
  for (let yy = 154; yy <= 184; yy++) {
    const inset = yy < 156 ? 156 - yy : yy > 182 ? yy - 182 : 0;
    span(img, yy, 50 + inset, 141 - inset, Rg.border);
    if (yy >= 157 && yy <= 181) span(img, yy, 53, 138, Rg.b);
  }
  span(img, 184, 52, 139, Rg.borderD); span(img, 183, 51, 140, Rg.borderD);
  for (let yy = 160; yy <= 178; yy += 6) for (let x = 58; x <= 133; x += 4) put(img, x + ((yy / 6) % 2) * 2, yy, Rg.l);
  span(img, 159, 56, 135, Rg.d); span(img, 179, 56, 135, Rg.d);
  return img;
}

function contactShadow() {
  const img = IO.blank(46, 12);
  for (let y = 0; y < 12; y++) for (let x = 0; x < 46; x++) {
    const nx = (x + 0.5 - 23) / 23, ny = (y + 0.5 - 6) / 6, r = nx * nx + ny * ny;
    if (r <= 0.45) put(img, x, y, '#1a1220a0'); else if (r <= 1.0) put(img, x, y, '#1a122060');
  }
  return img;
}

module.exports = { PAL, OUTLINE, body, hairShortNeat, hairWildLayers, tunicLinen, robeNovice, practiceBlade, wovenStaff, fist, room, contactShadow };
