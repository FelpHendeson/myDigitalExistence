# Arte ContentV1 — ficha de entrega

Status: **CANDIDATO_JOGAVEL**. Nada aqui é arte aprovada; a revisão criativa segue [15-governanca-criativa.md](../../15-governanca-criativa.md). Especificação: [27-especificacao-arte-sprites-v1.md](../../27-especificacao-arte-sprites-v1.md) em `df24f22`.

## Lote 01 · `g1_compat` (mestre `g1-master-v1`)

**Mestre:** `body_balanced` + `hair_short_neat` + `torso_linen_tunic` + `wpn_ashwood_practice_blade`, e a mesma composição com as mãos livres. As outras peças saem da mesma pose mestre e das mesmas âncoras.

| Arquivo em `client/Assets/Game/Art/ContentV1/g1_compat/` | Tamanho | Ordem |
| --- | --- | --- |
| `body_balanced.png` | 672 × 128, 7 células | 0 |
| `torso_linen_tunic.png`, `torso_novice_robe.png` | 672 × 128 | 10 |
| `hair_short_neat.png`, `hair_wild_layers.png` | 672 × 128 | 20 |
| `wpn_ashwood_practice_blade.png`, `wpn_woven_staff.png` | 672 × 128 | 30 |
| `prototype_room.png` | 192 × 336 | −20 |
| `contact_shadow.png` | 46 × 12 | −10 |

Células 0–3 = `idle` (240 ms, loop), 4–6 = `react` (120 ms, volta ao idle). Pivô (48, 11) a partir de baixo, 32 PPU, Point. Os `.meta` são clones dos `.meta` do protótipo, com os mesmos nomes de subsprites, rects, pivôs e IDs internos e com um GUID novo.

**Animação.** As linhas acima de y = 66 seguem os ombros, a cabeça e o cabelo seguem um deslocamento próprio, e os pés e as mãos ficam fixos. Por isso, a empunhadura nunca se separa da mão. No idle, a sequência é neutro → ombros sobem → ápice com olhar suave → retorno. Na reação, a sequência é atenção (olhos abertos) → sorriso → repouso. As pontas do cabelo selvagem têm follow-through de um quadro.

**Itens de mão.** Cada item inclui o punho fechado sobre a mão relaxada do corpo, para que os dedos cubram a empunhadura. Sem item, a mão aparece livre.

## Onde olhar

- `boards/b01_master_blade_vs_free_hands_x3.png`: o mestre com arma e com as mãos livres nos 7 quadros, sobre fundo claro e escuro.
- `boards/b01_swap_matrix_idle0_react1_x2.png`: as 12 combinações no mesmo quadro (idle0 em cima, react1 embaixo). As colunas seguem a ordem túnica × {livre, lâmina, cajado} e depois veste × {livre, lâmina, cajado}. As linhas seguem a ordem cabelo curto e depois selvagem.
- `boards/b01_layers_cells_pivot_x2.png`: as camadas isoladas, com divisórias de célula em magenta e a linha do pivô em azul.
- `boards/b01_room_game_scale_x1.png` e `b01_room_phone_scale_x3.png`: a composição no quarto.
- `previews/*.apng.png`: animações (idle ×2 → react → idle). Abra em um navegador.
- `studies/evolution_same_individual_v1_x3.png`: o estudo recém-invocado → treinado → imponente (efeito desligado/ligado) para um humano e para um elfo, com silhuetas.
- `masters/b01_g1_master_v1.ora`: master em camadas (Krita/GIMP), com a camada de guias e âncoras oculta.
- `manifest.json`: IDs, rects, quadros, durações, pivôs, âncoras por quadro, ordem, oclusão, fallback, autoria e SHA-256.

## Regenerar

```bash
node art-source/content-v1/tools/build_g1.js
node art-source/content-v1/tools/study_evolution.js
node art-source/content-v1/tools/make_manifest.js
```

A fonte editável é o gerador em `tools/`, em Node ≥ 18 e sem dependências: `rig.js` define a pose mestre e as âncoras, e `parts.js` define os desenhos e as paletas. O resultado é determinístico.

## Pendências

As pendências de integração e de revisão estão listadas em `manifest.json`, nos campos `pendingIntegration`, `pendingReview` e `notInThisBatch`.
