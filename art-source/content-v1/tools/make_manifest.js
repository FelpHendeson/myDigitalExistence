'use strict';
// Writes art-source/content-v1/manifest.json for batch 01 from the generated files.
// Run after build_g1.js. Usage: node art-source/content-v1/tools/make_manifest.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const R = require('./rig.js');

const ROOT = path.resolve(__dirname, '../../..');
const SRC = path.join(ROOT, 'art-source/content-v1');
const sha = f => crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, f))).digest('hex');
const checks = JSON.parse(fs.readFileSync(path.join(SRC, 'checks_b01.json'), 'utf8'));

const AUTHOR = { author: 'Claude (Anthropic) para o diretor criativo do myDigitalExistence', tool: 'Gerador procedural em Node.js, art-source/content-v1/tools (sem modelos de imagem, sem referencias externas)', license: 'Arte original do projeto; sem assets de terceiros', origin: 'original' };
const EXPORT = { format: 'PNG RGBA8 sem perdas', ppu: 32, filter: 'Point', spriteMode: 'Multiple', mipmaps: false, compression: 'None', alphaIsTransparency: true };

function framesFor(id) {
  return R.FRAMES.map((f, i) => ({
    cell: i, name: `${id}__${f.anim}__front__${String(f.index).padStart(2, '0')}`, animation: f.anim, index: f.index,
    rect: { x: i * 96, y: 0, w: 96, h: 128 }, pivotPx: { x: 48, y: 11 }, pivotNormalized: { x: 0.5, y: 0.0859375 }, durationMs: f.ms,
    offsets: { shoulders: f.sh, head: f.hd, hairTipsLag: f.lag }, expression: f.expr, pose: f.note,
  }));
}
function anchorsPerFrame() {
  return R.FRAMES.map((f, i) => Object.fromEntries(Object.entries(R.ANCHORS).map(([k, a]) => {
    const dy = a.follows === 'hd' ? f.hd : a.follows === 'sh' ? f.sh : 0;
    return [k, { x: a.x, yFromTop: a.y + dy, yFromBottom: 127 - (a.y + dy) }];
  })));
}
const SHEETS = [
  { id: 'body_balanced', slot: 'body', renderSlots: ['body', 'face', 'legs', 'feet'], sortingOrder: 0, occlusion: 'G1: rosto, calca e calcados integram o corpo. Pescoco desenhado sob o queixo para nao abrir fresta com deslocamento da cabeca.', fallback: 'Nenhum (peca obrigatoria).' },
  { id: 'torso_linen_tunic', slot: 'torso', catalogSlot: 'torso_base', sortingOrder: 10, occlusion: 'Cobre tronco e braco superior (mangas ate y=63); abertura em V mostra o corpo. Nao cobre maos.', fallback: 'Sem torso: camiseta base do corpo.' },
  { id: 'torso_novice_robe', slot: 'torso', catalogSlot: 'torso_outer', sortingOrder: 10, occlusion: 'Cobre tronco, coxas ate y=96 e mangas largas ate y=76; maos livres.', fallback: 'Sem torso: camiseta base do corpo.' },
  { id: 'hair_short_neat', slot: 'hair', sortingOrder: 20, occlusion: 'Camada unica frontal; costeletas deixam a orelha legivel.', fallback: 'Sem cabelo: cabeca do corpo.', split: { front: 'art-source/content-v1/masters/hair_short_neat__front.png' } },
  { id: 'hair_wild_layers', slot: 'hair', sortingOrder: 20, occlusion: 'G1: camada composta = frente + parte traseira recortada onde o corpo existe. Mechas laterais cobrem a orelha. Pontas com follow-through de 1 quadro.', fallback: 'Sem cabelo: cabeca do corpo.', split: { front: 'art-source/content-v1/masters/hair_wild_layers__front.png', back: 'art-source/content-v1/masters/hair_wild_layers__back.png', note: 'back deve ficar abaixo do corpo quando hair_back existir' } },
  { id: 'wpn_ashwood_practice_blade', slot: 'held_main', sortingOrder: 30, occlusion: 'Inclui punho fechado (pele peach) sobre a mao livre do corpo; dedos cobrem a empunhadura. Pano da guarda oscila 1 px.', fallback: 'Ausente = maos livres (mao relaxada do corpo).' },
  { id: 'wpn_woven_staff', slot: 'held_main', sortingOrder: 30, occlusion: 'Inclui punho fechado (pele peach). Haste apoiada no chao (y=116); anel no topo fora do cabelo.', fallback: 'Ausente = maos livres.' },
];
const assets = SHEETS.map(s => {
  const p = `client/Assets/Game/Art/ContentV1/g1_compat/${s.id}.png`;
  return {
    assetId: `contentv1.g1_compat.${s.id}`, catalogId: s.id, status: 'CANDIDATO_JOGAVEL', version: 1, masterVersion: 'g1-master-v1',
    archetypeId: 'humanoid_front', slot: s.slot, catalogSlot: s.catalogSlot || s.slot, renderSlots: s.renderSlots || [s.slot],
    compatibility: { bodyId: ['body_balanced'], skinPaletteBakedIn: 'peach', hairPaletteBakedIn: s.slot === 'hair' ? 'brown' : undefined },
    path: p, size: { w: 672, h: 128 }, grid: { cellW: 96, cellH: 128, cells: 7, rows: 1, margin: 0, spacing: 0 },
    sequence: { idle: { cells: [0, 1, 2, 3], frameMs: 240, loop: true }, react: { cells: [4, 5, 6], frameMs: 120, loop: false, then: 'idle' } },
    frames: framesFor(s.id), sortingOrder: s.sortingOrder, occlusion: s.occlusion, fallback: s.fallback, split: s.split,
    replaces: `client/Assets/Game/Art/Prototype/${s.id}.png`, meta: 'Clonado do .meta do prototipo (mesmos nomes, rects, pivos e internal IDs); GUID novo.',
    ...AUTHOR, export: EXPORT, sha256: sha(p),
  };
});
for (const [id, w, h, order, note] of [['prototype_room', 192, 336, -20, 'Fundo unico; pivo central. Pivo do personagem em (96,168) a partir do topo. Centro liso atras do corpo; cama a esquerda; canto de cuidado (bacia, toalha, alimento) a direita.'], ['contact_shadow', 46, 12, -10, 'Elipse com 2 niveis de alpha intencional (160 e 96); sem emissao.']]) {
  const p = `client/Assets/Game/Art/ContentV1/g1_compat/${id}.png`;
  assets.push({ assetId: `contentv1.g1_compat.${id}`, catalogId: id, status: 'CANDIDATO_JOGAVEL', version: 1, slot: id === 'prototype_room' ? 'room' : 'shadow', path: p, size: { w, h }, pivotNormalized: { x: 0.5, y: 0.5 }, sortingOrder: order, notes: note, replaces: `client/Assets/Game/Art/Prototype/${id}.png`, ...AUTHOR, export: { ...EXPORT, spriteMode: 'Single' }, sha256: sha(p) });
}

const manifest = {
  schema: 'mde.art-manifest/1', project: 'myDigitalExistence', spec: '27-especificacao-arte-sprites-v1.md @ df24f22', generatedAt: new Date().toISOString().slice(0, 10),
  batches: [{
    id: 'b01_g1_compat', status: 'CANDIDATO_JOGAVEL', gate: 'G1 (prova de encaixe da arte candidata)', masterVersion: 'g1-master-v1',
    master: { composition: 'body_balanced + hair_short_neat + torso_linen_tunic + wpn_ashwood_practice_blade', freeHands: 'mesma composicao sem held_main', seamY: R.SEAM_Y, groundY: R.GROUND_Y, pivot: R.PIVOT, poseRule: 'linhas acima de y=66 seguem os ombros (sh); cabeca/cabelo seguem hd; abaixo fica fixo (pes e maos plantados)' },
    sortingObserved: { prototype_room: -20, contact_shadow: -10, body: 0, torso: 10, hair: 20, held_main: 30 },
    anchorsPerFrame: anchorsPerFrame(), assets,
    sources: {
      generator: ['art-source/content-v1/tools/rig.js', 'art-source/content-v1/tools/parts.js', 'art-source/content-v1/tools/build_g1.js', 'art-source/content-v1/tools/imageio.js'],
      layeredMaster: 'art-source/content-v1/masters/b01_g1_master_v1.ora', roomMaster: 'art-source/content-v1/masters/b01_room_v1.ora',
      splitHair: ['art-source/content-v1/masters/hair_wild_layers__front.png', 'art-source/content-v1/masters/hair_wild_layers__back.png', 'art-source/content-v1/masters/hair_short_neat__front.png'],
      boards: fs.readdirSync(path.join(SRC, 'boards')).map(f => 'art-source/content-v1/boards/' + f),
      previews: fs.readdirSync(path.join(SRC, 'previews')).map(f => 'art-source/content-v1/previews/' + f),
      studies: fs.readdirSync(path.join(SRC, 'studies')).map(f => 'art-source/content-v1/studies/' + f),
    },
    checks: { total: checks.length, passed: checks.filter(c => c.ok).length, file: 'art-source/content-v1/checks_b01.json' },
    pendingIntegration: [
      'Unity: decidir entre copiar os PNGs sobre Art/Prototype (preserva GUIDs/IDs do catalogo) ou apontar o PrototypeAppearance para ContentV1; rodar PrototypeAppearanceTests e HomeFlowTests.',
      'Unity/Android: conferir Point, PPU 32, compressao None e leitura em retrato no aparelho (ART-09).',
      'Punho dos itens de mao usa a pele peach embutida; com paletas de pele sera preciso camada hand_front ou troca de paleta.',
      'Cabelos tem cor castanho embutida; paletas de cabelo exigem swap por mascara (mascaras ja sao unicas por corte).',
      'hair_wild_layers: em G1 a parte traseira esta recortada na camada composta; usar o split back/front quando hair_back existir.',
    ],
    pendingReview: [
      'Contorno escuro perde leitura sobre fundo muito escuro; avaliar contorno de borda mais clara (rim) no aparelho.',
      'Sombra de contato quase invisivel sobre fundo escuro de prancha (no quarto le bem).',
      'Mechas do hair_wild_layers cobrem a orelha; com race_elf a ponta fica pouco visivel.',
      'Estudo de evolucao: a diferenca de postura entre os tres momentos ainda e sutil; candidata a revisao criativa.',
    ],
    notInThisBatch: ['body_slender', 'body_sturdy', 'hair_tied_long', 'hair_curly_volume', 'paletas de pele/cabelo como variantes exportadas', 'olhos/expressoes como camada face separada', 'overlays raciais', '16 equipamentos restantes e 18 icones', 'props de cuidado e estados eat/sleep/clean/mana_train', 'Circuito de Mana', 'runas e summon', 'VFX de afinidades, nucleos e habilidades'],
  }],
};
fs.writeFileSync(path.join(SRC, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log('manifest assets:', assets.length);
