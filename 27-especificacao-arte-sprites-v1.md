# Especificação de arte e prompts para sprites V1

**Estado da arte descrita** · `CANDIDATO_JOGAVEL` · Referência técnica conferida em `08561d3`, Unity `6000.0.40f1`.

Este documento complementa o [pipeline visual](18-pipeline-visual.md), o [catálogo V1](22-pacote-conteudo-v1.md) e o [plano de conteúdo](26-plano-conteudo-e-aceite.md). Claude produz e entrega os PNGs, fontes e fichas de arte. O agente Unity resolve importação, catálogo, referências, composição, testes e uso no jogo. A aprovação visual final segue a [governança criativa](15-governanca-criativa.md).

## 1. Uso no ciclo existente

| Marco | Uso da arte |
| --- | --- |
| G0 · Ambiente | APK mínimo conforme o [plano mestre](12-plano-mestre.md). |
| G1 · Visual modular | Quarto, sombra, corpo equilibrado, dois cabelos, dois torsos e duas armas em idle e reação. O APK já foi aceito. Use a fatia como prova de encaixe para a arte candidata. |
| G2 · Ciclo local | O [backlog](13-backlog-execucao.md) começa em SIM-01 e SIM-02. Prepare visuais de cuidado, Circuito de Mana, inventário local, corpos, cabelos e overlays no momento indicado pelos itens existentes. RUNE-01 abrange G2/G3. CORE-01 usa dois núcleos com manifestação jogável. |
| G3 · Online | Pedras rúnicas, feedback de invocação e aparência nos três slots, conforme o fluxo e o resultado autoritativo. |
| G4 · MVP v0.1 | Subconjunto jogável de arte e equipamentos para lar, treino, ficha, inventário e loja, conforme EQUIP-02 e os aceites existentes. |
| v0.2, v0.3 e V1 | Classes e primeiro treino de combate em v0.2. Pets em v0.3. Demais núcleos e os 18 equipamentos no alvo V1 conforme o plano. |

As poses de combate, locomoção e os estudos de visual avançado abaixo são referências de produção condicionadas às atividades e à revisão criativa previstas. Os números de exportação além do G1 são propostas técnicas para prova de encaixe.

## 2. Contrato Unity conferido

- Projeto Universal 2D em `client/`. A cena [Home](client/Assets/Game/Scenes/Home.unity) usa o [PrototypeHumanoid](client/Assets/Game/Prefabs/PrototypeHumanoid.prefab) e o [catálogo PrototypeAppearance](client/Assets/Game/Content/PrototypeAppearance.asset), versão 1, com arquétipo `humanoid_front` e compatibilidade exata com `body_balanced`.
- O [renderizador](client/Assets/Game/Scripts/Presentation/Character/ModularCharacter.cs) usa um índice comum para todas as peças. O [catálogo](client/Assets/Game/Scripts/Presentation/Character/AppearanceCatalog.cs) expõe `Body`, `Torso`, `Hair`, `HeldMain` e um array de sete referências `Sprite` com ordem por quadro. Mãos livres equivale a item ausente. Para G1, rosto integra o corpo e cabelo é uma camada composta. As camadas extras e animações por ID precisam de integração futura.
- Sete folhas em [Art/Prototype](client/Assets/Game/Art/Prototype), cada uma com **672 × 128 px**, sete células de **96 × 128 px**, uma linha, sem margem ou espaçamento. A célula global `i` começa em `x = 96 × i`, `y = 0`. Subsprites `<id>__idle__front__00..03` nas células 0–3 e `<id>__react__front__00..02` nas células 4–6. Idle repete a cada 4 × 240 ms. A reação dura 3 × 120 ms e retorna ao idle.
- Cada subsprite tem pivô **(48, 11)** medido da esquerda e de baixo, ou **(0.5, 0.0859375)** normalizado. Num PNG com origem superior esquerda, a linha geométrica do pivô fica em `y = 117`. Use **32 PPU**, Sprite Multiple, Point, alpha, mipmaps desligados e exportação sem perdas. Confira na importação Android que escala e compressão preservam os pixels. Veja o [meta de referência](client/Assets/Game/Art/Prototype/body_balanced.png.meta).
- Ordem observada no quarto **Room −20 → sombra −10 → corpo 0 → torso 10 → cabelo 20 → mão 30**. `prototype_room.png` é fundo único **192 × 336 px**. `contact_shadow.png` é sombra única **46 × 12 px**. A grade e o pivô do humanoide se aplicam às sete folhas de peças, enquanto fundo e sombra seguem suas referências próprias.
- As folhas existentes são cortadas via `.meta` e o catálogo aponta diretamente para os sprites. O projeto conferido não possui `.spriteatlas`. Em uma integração futura, preserve GUIDs, nomes e IDs locais dos subsprites existentes e valide as referências antes de substituir qualquer textura.

## 3. Prompt mestre para Claude

> Produza arte original candidata para myDigitalExistence, fantasia aventureira em pixel art 2D, corpo inteiro frontal, com leitura na tela de um Android em retrato. Leia as fichas deste documento e os capítulos 22–26 do repositório. Use os PNGs atuais como referência de grade, âncoras e gesto. Para cada entrega, use o mesmo mestre de poses e recorte cada componente da composição aprovada em uma camada isolada. Trabalhe em pixels inteiros, com grupos de cor nítidos, luz suave superior esquerda, sombras em blocos pequenos, contraste na silhueta e rosto legível. Mantenha RGB e transparência RGBA no export. Deixe o fundo totalmente transparente nas peças. Exclua texto, marcas d'água, guias, fundo quadriculado pintado, desfoque, antialiasing, pixels semitransparentes acidentais e elementos de franquias. Vidro, sombra e VFX podem ter alpha intencional.
>
> Comece pela comparação montada de corpo equilibrado, cabelo curto, túnica de linho e Lâmina de Freixo, em idle e reação. Inclua uma comparação de mãos livres. Use a mesma pose, paleta, proporção e iluminação nas duas aparências. Trave os mestres antes de produzir variações em série. Gere cada pose-chave com a referência da anterior e corrija à mão os pixels, se necessário. Entregue camadas alinhadas com o mesmo canvas, contatos e pivôs. Se a ferramenta só produzir pranchas compostas, separe e revise as peças em editor de pixels antes da entrega. Entregue apenas os lotes associados ao pedido de produção.
>
> Em cada ficha, use o ID fornecido, aplique o motivo visual da tabela e declare função, vista, corpo compatível, quadro, âncoras, oclusão, duração, fallback e caminho de saída. Registre autoria, ferramenta, fonte editável e condições de uso. Mostre a composição sobre fundo claro e escuro e na escala de jogo. Compare o primeiro e último quadro em loop. Encaminhe inconsistências e arquivos pendentes ao agente Unity na ficha de entrega.

**Modelo para uma solicitação unitária**

```text
Gere <id> para <slot>, variante <corpo/paleta>, frontal.
Use <arquivo mestre e versão>, célula <animação e índice>.
Desenhe <motivo da ficha>. Alinhe <âncoras> e respeite <oclusões>.
Exporte <caminho>, <dimensões>, PNG RGBA, pivô <x,y>.
Mostre <combinação de QA> e registre <fallback ou peça oculta>.
```

## 4. Arquivos, âncoras e atlas de entrega

Pasta candidata para a próxima tarefa de arte, `client/Assets/Game/Art/ContentV1/`. Consulte as instruções locais antes de publicar. Organize `g1_compat/`, `character/<part_id>/<variant>/`, `room/`, `icons/`, `runes/` e `fx/`. Guarde mestres editáveis, guias, pranchas de revisão e `manifest.json` fora de `Assets`, em `art-source/content-v1/`. Guarde uma representação separada para cada função visual mesmo quando os arquivos compartilham um ID de jogo.

| Saída | Especificação |
| --- | --- |
| Folhas compatíveis | `g1_compat/<id>.png`, sete células na ordem G1. Entregue as sete peças listadas na seção 5, mais quarto e sombra como PNGs individuais. O agente Unity faz a troca de referências. |
| Peça modular | `<part_id>__<animation_id>__front__<nn>.png`, índice de dois dígitos por estado, célula inteira 96 × 128 px. Variante de corpo ou paleta no diretório e manifesto. Para cabelo dividido, mantenha o ID do corte e declare subcamada `front`/`back` no diretório e na ficha. |
| Ícones | PNG 32 × 32 px como amostra, pivô central, margem transparente de 2 px. Silhueta isolada e legível sem texto. Um ícone para cada equipamento, runa e entrada visual de habilidade. |
| Efeitos e props | PNGs por quadro. Efeito vestido usa a grade do personagem. Efeito local pode usar 32 × 32 px, ancorado na mão, objeto, chão ou alvo conforme a ficha. Runa tem pedra estática e emissão em folha separada. |
| Atlas Unity futuro | Agrupar por uso simultâneo em quarto, ícones e efeitos, com runas separadas se só carregadas na invocação. Para sprites modulares, começar com rotação e tight packing desligados, malha Full Rect e padding de 4 px. Conferir bleeding e tamanho em Android antes de escolher tamanho de página e compressão. Empacotar os mesmos sprites na Unity, sem entregar uma segunda cópia dos PNGs dentro de `Assets`. |

No mestre, marque chão, centro da cabeça, olhos, orelhas, ombros, punhos, pontos de pega, cintura, tornozelos, base da cauda e pontos de contato com cama e objetos. Registre as coordenadas por quadro, no mesmo sistema do pivô. Para respirar, mantenha os pés apoiados e altere ombro/cabeça em incrementos discretos. O punho dirige a arma, o crânio dirige cabelo e chifres. A roupa de cada compleição é redesenhada sobre a silhueta de referência, com as mesmas âncoras lógicas.

A pilha futura compõe sombra, cauda/capa, cabelo traseiro, corpo, rosto/traços raciais, roupa/pernas/calçados, cabelo frontal, cobertura de cabeça, acessório, mão e VFX. Resolva profundidade por pose. Em uma pega frontal, a empunhadura cruza a palma e os dedos visíveis cobrem a empunhadura onde necessário. Para o capuz, declare quais partes do cabelo são cobertas e use o recorte compatível com chifres. Para uma peça estática, só reutilize quadro com a mesma âncora e cobertura. Se um estado de cuidado pedir mãos livres ou esconder pernas sob a coberta, declare a ocultação nesse estado e restaure no retorno.

O manifesto registra para cada variante `assetId`, ID de catálogo, status, versão, slot, compatibilidades, caminho, retângulos, sequência e duração, pivôs, âncoras, ordenação, oclusão e fallback por estado, autoria, origem/licença, parâmetros de exportação e hash SHA-256. Liste as poses e variações pendentes explicitamente. Use IDs novos desta especificação como rótulos de produção, subordinados aos IDs já registrados no catálogo.

## 5. Fichas de personagem, personalização e cenário

Cada linha complementa o prompt mestre. Renderize os elementos visíveis em todos os quadros da ação solicitada. A seção 6 define a sequência. Os sete IDs marcados com † integram as folhas G1.

| ID ou família | Instrução de desenho |
| --- | --- |
| `body_balanced` † | Corpo de referência, ombros médios, braços relaxados, mãos distinguíveis junto ao quadril. Postura inicial modesta e olhar atento. Reproduza os contatos do protótipo. |
| `body_slender` | Tronco estreito e braços finos, ombros suaves. Mantenha linha dos olhos e apoios do mestre. |
| `body_sturdy` | Ombros e tronco mais largos, membros encorpados, contorno de punho e encaixe de roupa próprios. |
| Paletas de pele | Marfim, pêssego, bronze, castanho, ébano e cinza azulado. Uma rampa coerente por cor com contraste de rosto equivalente. Aplicáveis às quatro raças. |
| `hair_short_neat` † | Curto alinhado, franja discreta, nuca rente. Deixe olhos e ponta de orelha legíveis. |
| `hair_wild_layers` † | Médio, mechas soltas em blocos largos, pontas aventureiras. Separe o que passa atrás do pescoço da franja. |
| `hair_tied_long` | Preso comprido com cauda atrás dos ombros, duas mechas laterais curtas. Follow-through de um quadro nas ações. |
| `hair_curly_volume` | Volume arredondado superior e lateral, cachos agrupados, abertura clara na testa. |
| Paletas de cabelo | Preto, castanho, dourado, cobre, prata e violeta profundo. Mesmas máscaras de pixels em todas as cores de um corte. |
| Olhos e boca | Olhos arredondados expressivos, estreitos concentrados e semicerrados calmos. Íris castanha, verde, azul, âmbar ou violeta. Rosto neutro com boca curta, alegre com sorriso, faminto com olhar para o alimento, cansado com pálpebras baixas, irritado/desconfortável com sobrancelhas juntas, concentrado com olhar firme e surpresa com olhos abertos e boca pequena. |
| Marcas opcionais | Sardas espaçadas, pequena cicatriz com contraste discreto ou geometria original de face/ombro. Mantenha em camada independente do tom de pele. |
| `race_human` | Use as partes comuns. Sem overlay racial obrigatório. |
| `race_elf` | Orelhas alongadas que partem da mesma raiz das orelhas comuns. Teste a ponta com cabelos volumosos e capuz. |
| `race_draconic` | Par de chifres curtos, escamas esparsas nas maçãs e ombros, cauda opcional atrás com raiz na cintura. Teste capuz e capa. |
| `race_vesperine` | Reflexo crepuscular nos olhos, geometria discreta no pescoço e antebraços, contrastes localizados. |
| Kit casual do capítulo 23 | Camisa de mangas dobradas com dobra legível, segunda paleta para calça leve e capa curta em camada traseira. Reaproveite as fichas de túnica, sapato, faixa, capuz e armas da seção 7 onde o visual coincidir. |
| `prototype_room` | Quarto acolhedor com piso legível, centro livre de detalhe atrás do corpo, cama e canto de cuidado. Mantenha pontos de contato da cena ao criar a folha compatível. Separe borda de cama/coberta se o sono exigir oclusão. |
| `contact_shadow` | Elipse baixa com borda em degraus, alpha suave em poucos níveis. Sem luz emissiva. |
| Props de cuidado | Alimento simples com versões inteiro/mordido, cama/travesseiro e coberta em planos independentes, pano dobrado e gotas para limpeza. Gere marcas de sujeira removíveis e ícones de fome, sono, higiene, saúde, reserva e qualidade de mana com formas distintas. |
| Circuito de Mana | Trilha neutra, zona-alvo com contorno próprio, pulso luminoso e sinais de acerto/erro distinguíveis em cinza (anel fechado e anel quebrado). O pulso é um sprite móvel, com posição dada pelo jogo. A indicação de rodada e o resultado usam a interface. |
| Invocação e catálogo | Altar escuro com encaixe central, iluminação azul separada, receptáculo de slot vazio discreto. Reutilize composição do personagem para retrato e os ícones para ficha, inventário e loja. Ícones de moeda e XP têm silhuetas diferentes. |

## 6. Fichas de animação

A duração em G1 vem do catálogo. Nos demais estados use 120–180 ms por quadro como amostra inicial, com pausa maior no repouso. A duração do jogo vem das regras da atividade. Efeitos, expressões, comida e acessórios usam o mesmo quadro lógico da ação. Poses candidatas futuras retornam ao idle após o último quadro, ou pela transição que o agente Unity configurar.

| Estado | Quadros e instrução |
| --- | --- |
| `idle` | 4 em loop. Neutro → sobe ombros → ápice com olhar suave → retorna. Pés fixos, mechas e barra acompanham o tronco. |
| `react` | 3 one-shot G1. Atenção com olhos abertos → sorriso no ápice → volta a repouso. Reposicione os acessórios com as mãos. |
| `blink` | 2 de rosto. Pálpebra fecha → reabre, mantendo íris e boca registrados. Sobreponha na pose ativa compatível. |
| `eat` | 4. Erguer alimento → encostar na boca → mastigar com item mordido → baixar a mão. Ícone ou resíduo separado. Mãos livres durante a ação, se previsto pela integração. |
| `sleep` | 2 em loop lento. Deitado no travesseiro, olhos fechados, coberta baixa → leve expansão da coberta. Ancore à cama e mantenha máscara de pernas consistente. Retome o idle em pé ao sair. |
| `clean` | 4. Pano sobe → passa na área suja → duas gotas pequenas dissipam enquanto a marca sai → mão baixa e expressão aliviada. |
| `mana_train` | 4. Mãos aproximam → esfera azul pequena aparece → pulso ganha contorno → estabiliza e retorna. O alvo e os sinais de toque têm trilha de VFX própria. |
| `react_happy` | 3. Surpresa breve → sorriso e peito erguido → relaxa. Use a reação G1 como base quando o encaixe for idêntico. |
| `react_tired` | 2. Cabeça baixa e pálpebra pesa → expira e retorna. |
| `equip_preview` | 2. Pose neutra → mostra o item com a mão firme e silhueta aberta. A troca durante idle usa o quadro corrente. |
| `summon` | 4 de VFX. Fenda azul acende → gravação percorre a pedra → luz sobe do altar → dissipa revelando a silhueta inicial. Use as mesmas células das três runas. |
| `walk` · expansão | 4 por direção adotada. Apoio esquerdo → passagem → apoio direito → passagem. Teste contato alternado. Vista lateral/traseira depende da navegação aprovada. |
| `cast` · expansão | 4. Prepara mãos → concentra na âncora → libera → recupera. Core/afinidade entram em camadas próprias. |
| `attack`, `hurt`, `victory` · expansão | Ataque em 4 com antecipação, arco curto, fim e recuperação. Impacto em 3 com recuo, contrapeso e retorno. Vitória em 3 com expiração, gesto contido e repouso. Artes dependem da atividade aprovada. |

## 7. Fichas dos 18 equipamentos

Para cada ID gere um ícone e a camada vestida correspondente. Desenhe material e desgaste com o mesmo motivo nos dois tamanhos. Use `held_main` para armas e `accessory` para anel e pulseira. Gere a camada compatível por corpo quando o contorno ou a pega mudar. Use a referência de [equipamentos iniciais](25-equipamentos-iniciais.md).

| ID | Instrução de desenho e encaixe |
| --- | --- |
| `wpn_ashwood_practice_blade` † | Madeira escura curta, ponta arredondada, guarda com pano azul. Pega logo abaixo do pano. |
| `wpn_narrow_iron_sword` | Lâmina prata estreita, guarda cobre trapezoidal e punho escuro. Preserve leitura da ponta. |
| `wpn_woven_staff` † | Haste alta em madeira/fibra, anel vazado no topo, punho na trama. |
| `wpn_copper_resonator` | Bastão curto, couro no punho e três entalhes no cobre, com brilho localizado só em efeito separado. |
| `wpn_slag_hand_axe` | Um gume claro sobre cabeça escura, cabo curto de madeira e centro de pega bem visível. |
| `head_wayfarer_band` | Tira transversal de tecido na testa com franja preservada. |
| `head_fog_hood` | Capuz azul-cinza com costura clara, recorte alternativo para chifres, frente e volume traseiro separáveis. |
| `head_copper_circlet` | Aro fino sobre cabelo, fenda frontal legível, sem halo. |
| `torso_linen_tunic` † | Linho creme, gola contrastante, faixa de cor discreta, costura simples e ombro mole. |
| `torso_quilted_vest` | Painéis marrons acolchoados em losangos, sobressaindo sobre a camisa, cavas claras. |
| `torso_novice_robe` † | Veste curta em azul-petróleo, gola desdobrada, punhos livres. |
| `torso_travel_leather_coat` | Couro envelhecido, gola alta, lapelas e bainha no quadril. |
| `legs_canvas_trousers` | Calça cinza-oliva com costura vertical e barra ajustada, alinhada a tornozelo e cintura. |
| `legs_reinforced_trousers` | Tecido escuro e joelheiras de couro com contorno separado da dobra. |
| `feet_cloth_shoes` | Solado raso e faixa simples no tornozelo, sem alterar a linha do chão. |
| `feet_ranger_boots` | Cano curto com trava lateral e biqueira firme, mesma linha de chão. |
| `acc_focus_ring` | Ferro com pedra fosca, brilho azul pontual na inspeção. Na mão use detalhe mínimo e preserve os dedos. |
| `acc_ward_bracelet` | Corda escura, elos cobre, plaqueta lisa. Fixe no pulso em cada pose. |

## 8. Runas, mana e habilidades

As três runas são pedras gravadas com brilho azul. Separe pedra, inscrição emissiva e partículas. Para o repouso, use 4 quadros em loop de intensidade baixa → média → alta → média. Use `rune_pulse` com três arcos interrompidos e pulsação central, `rune_veil` com duas curvas envolvendo lacuna de luz difusa e `rune_forge` com losango irregular e ranhuras que acendem nos vértices. Dê uma silhueta de pedra distinta a cada ícone. Runa, raça, afinidade, núcleo e classe conservam identidades independentes.

**Afinidades** · Mesmo pulso de treino com seis máscaras distintas. Brasa `element_ember` tem faíscas cobre ascendentes. Maré `element_tide` tem gotas em onda. Brisa `element_breeze` usa traços curvos leves. Rocha `element_stone` usa lascas e textura mineral. Alvor `element_dawn` abre brilho quente focalizado. Penumbra `element_dusk` retrai um contorno violeta escuro. Use forma, trajetória e valor além da cor.

**Núcleos** · Ícone extraído do motivo central e VFX independente. Use como base quatro fases, preparação → manifestação → leitura do efeito → dissipação. Consulte o [catálogo de habilidades](24-runas-racas-classes-habilidades.md) para a atividade e os limites.

| ID | Instrução de desenho e evolução do efeito |
| --- | --- |
| `core_counterweight` | Contorno duplicado nas mãos ou pés desloca um pouco e se reúne na recuperação. Evolui de um eco curto para dois ecos próximos, mantendo o corpo legível. |
| `core_noise_veil` | Ondas breves junto ao corpo se achatam e apagam. Cresce do passo para um objeto e depois para uma pequena zona. |
| `core_cold_ash` | Pontos de âmbar com centros cinza nas mãos ou objeto aquecido. Evolui de ponto único a cinza aderente e pequenos focos distribuídos. |
| `core_glass_breath` | Película translúcida sai da região da boca, se firma, racha e evapora. Uma placa plana dá lugar a curvatura e depois a placas pequenas defensivas. |
| `core_trace_reading` | Fios efêmeros sobre o objeto tocado acendem em sequência e somem. Evolui de rastro único a comparação e leitura de ordem. |
| `core_brief_anchor` | Geometria original rente aos pés ou à base do objeto, fecha e rompe ao soltar. Evolui de ponto corporal para objeto próximo e alternância entre pontos. |

**Genéricas** · `generic_breathe` usa peito sobe → pausa → expira. `generic_stance` usa baixar o centro → firmar pés → soltar. `generic_observe` usa olhar fixo → contorno na pista → dissipar. `generic_short_step` usa transferir peso → passo curto → firmar o pé. Os ícones usam, respectivamente, duas linhas de respiração, base de apoio, olho com ponto e par de pegadas. Reutilize poses de cuidado ou treino quando os contatos coincidirem.

**Passivos raciais** · Use ícone e destaque pontual no contexto previsto. Aprendizado Adaptável usa dois traços convergindo no indicador de treino. Leitura do Fluxo usa onda e pista adicional. Pele Resiliente usa trama de escamas e marca breve de esforço. Sentido da Penumbra usa olho crepuscular e contorno na pista. Associe ao ID racial existente até haver IDs de habilidades no catálogo.

**Classes de v0.2** · Para `class_swordsman`, Corte Medido segue preparação → corte preciso → recuperação, e Guarda Fluida usa ícone de guarda e pequeno realce no apoio. Para `class_arcanist`, Canalização Guiada segue mãos convergem → pulso estabiliza → brilho recua, e Reservatório Estável usa ícone de reserva e realce de repouso. Para `class_barbarian`, Ímpeto Crescente usa compressão → impulso → estabilização com peso no chão, e Fôlego de Aço usa ícone de respiração e realce breve no treino físico. Reuse as poses compatíveis e gere um ícone por capacidade. Passivos não precisam de animação corporal exclusiva.

## 9. Evolução visual do mesmo indivíduo

Use uma prancha com três retratos de corpo inteiro na mesma vista, escala, paleta-base, direção de luz e linha do chão. Trave formato dos olhos, cor de pele, corte ou motivo reconhecível do cabelo, traço racial e marca individual. Compare em silhueta preta e na escala do celular. Estes são estudos de direção visual sem níveis, bônus ou desbloqueios associados.

| Estudo | O que muda na composição |
| --- | --- |
| Recém-invocado | Ombros discretamente recolhidos, mãos próximas, tecido mate com costura simples, calçado leve e ferramenta de treino. Pouca área de alto contraste. Mana aparece por instantes e fica restrita à mão ou ao objeto. |
| Treinado | Postura assentada, olhar direto, uma camada de vestuário mais estruturada e um acento cromático que repete a cor do início. Equipamento com contorno mais limpo. Efeito ganha forma e duração visual suficientes para leitura. |
| Imponente | Postura firme, espaço negativo entre braços e tronco, diagonais da roupa ou arma conduzindo para o rosto. Contraste forte em dois focos, rosto e ferramenta. Use a linguagem visual do núcleo para uma manifestação controlada na pose-chave. Em idle, preserve o rosto visível e a força da silhueta com a emissão desligada. |

No estudo de Espadachim, destaque a guarda e a lâmina estreita. No de Arcanista, use a gola e o espaço entre mãos/cajado para concentrar luz. No de Bárbaro, concentre o peso visual no apoio dos pés e no eixo do machado. A classe é posterior à invocação e pode ser estudada com qualquer raça e corpo. Repita o teste de continuidade em um personagem com e outro sem overlay racial. Submeta o visual avançado como prancha candidata para revisão criativa.

## 10. Aceite do lote e passagem para Unity

- Claude entrega o manifesto e os PNGs com dimensões, ordem e nomes verificáveis, as fontes que puder redistribuir, pranchas de referência com fundo claro/escuro e previews dos loops. A prancha identifica a versão do mestre e as combinações.
- Confira os sete recortes de cada folha compatível e a coincidência do pivô. Teste troca de cabelo, torso e item no mesmo quadro, reação e mãos livres. Para as camadas futuras, compare todos os corpos com roupa base, os quatro cabelos com faixa/capuz e cauda com capa. Inspecione pele e olhos claros e escuros e cada contato nas poses de cuidado.
- Na Unity, verifique Sprite Multiple, alpha, Point, PPU, pivôs e IDs. Use [PrototypeAppearanceTests](client/Assets/Game/Tests/EditMode/PrototypeAppearanceTests.cs) e [HomeFlowTests](client/Assets/Game/Tests/PlayMode/HomeFlowTests.cs) na fatia compatível. Depois confirme composição e leitura em retrato no Android e registre aparelho, FPS e memória conforme ART-09.
- Registre previews e resultados por lote, versões de fontes, incompatibilidades conhecidas e fallback explícito. A aprovação criativa e os aceites por gate seguem seus documentos de origem.
