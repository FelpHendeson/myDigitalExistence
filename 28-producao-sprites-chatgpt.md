# Produção de sprites modulares com ChatGPT Images

Fluxo de produção para o catálogo `CANDIDATO_JOGAVEL` de myDigitalExistence. Consulte as [fichas de arte e animação](27-especificacao-arte-sprites-v1.md) e a [governança criativa](15-governanca-criativa.md). Comece com corpo equilibrado, cabelo curto, túnica de linho e Lâmina de Freixo. Depois de provar o encaixe, repita com o segundo cabelo, a segunda roupa e o cajado.

## Abra a conversa de arte

1. Abra uma nova conversa no ChatGPT e peça para criar uma imagem. Anexe este guia, as fichas V1 e, se disponíveis, os PNGs de [corpo, cabelo curto, túnica e lâmina do protótipo](client/Assets/Game/Art/Prototype) para indicar escala, poses e encaixes. Anexe separadamente qualquer referência aprovada de estilo e diga o que ela define. [Como criar, anexar e salvar imagens no ChatGPT](https://help.openai.com/en/articles/11084440-images-in-chatgpt).
2. Cole o prompt **Modelo mestre**. Escolha e aprove uma prancha com o diretor. Salve a imagem e sua versão. Reanexe as referências aprovadas quando mudar de conversa.
3. Cole o prompt **Base animada**. Normalize a base e prepare seu guia de âncoras. Depois use **Folha de uma peça** com uma linha da tabela por pedido, anexando o mestre, a base limpa e o guia. Salve as imagens originais para o pós-processamento.

## Modelo mestre

```text
Crie uma prancha de referência candidata para myDigitalExistence, um RPG mobile em pixel art 2D de fantasia aventureira. Use as fichas de arte anexas. Mostre a mesma pessoa frontal de corpo inteiro, em pose neutra, com mãos livres e com a Lâmina de Freixo na mão. Use corpo equilibrado, cabelo curto alinhado e túnica de linho creme com gola contrastante e faixa discreta. A lâmina é de madeira escura, curta, com ponta arredondada e pano azul na guarda.

Mantenha a mesma escala, linha de apoio dos pés, rosto, proporções e pose nas duas composições. Os PNGs do protótipo indicam escala, pose e encaixes. A referência de estilo aprovada, se anexada, indica o acabamento. Use grupos de pixels definidos, luz suave superior esquerda e rosto legível no celular. Fundo simples de revisão, sem texto ou marcas d'água. Gere só a prancha do mestre para revisão nesta rodada.
```

Na aprovação, registre a imagem, a paleta, o enquadramento e a versão do mestre. Fixe a linha do chão, centro da cabeça, olhos, ombros, cintura, pés, punhos e ponto de pega.

## Base animada

```text
Gere uma folha de body_balanced em vista frontal usando o mestre aprovado anexado. Isole o corpo com rosto, mãos e pés, com cobertura neutra onde necessário. Use o mesmo rosto e a mesma anatomia em todas as poses. Deixe cabelo, roupas equipáveis, arma, cenário e sombra para as folhas próprias.

Faça sete quadros, da esquerda para a direita. Idle 00 neutro, 01 sobe ombros, 02 ápice com olhar suave, 03 aproxima do neutro. Reação 00 abre os olhos em atenção, 01 sorri no ápice, 02 retorna ao repouso. Mantenha os pés apoiados, mãos visíveis e cabeça e tronco com deslocamentos pequenos. Use as poses do protótipo como guia de gesto. Organize em uma faixa de sete células iguais com espaço transparente para isolar os quadros. Se precisar, gere uma faixa de idle e outra de reação com a mesma escala e apoio. Fundo alpha transparente, sem grades pintadas, legendas, molduras, desfoque ou antialiasing.

A saída de produção será normalizada para células de 96 × 128 px e pivô (48, 11) a partir do canto inferior esquerdo. Mantenha a silhueta dentro de cada célula. Gere apenas a base animada.
```

Normalize e revise a base antes de gerar as peças. Prepare um guia visual separado com as sete poses numeradas e as âncoras marcadas por quadro. Anexe o guia e a base limpa a cada pedido. Deixe as marcações fora das folhas exportadas.

## Folha de uma peça

Cole o bloco abaixo com uma única linha da tabela, trocando os campos entre `< >`. Para uma peça fora do lote G1, use o motivo visual da ficha V1 e adapte a sequência, a vista, a variante, as dimensões e as âncoras à ação e ao corpo de referência. Para um erro localizado, reanexe a folha e especifique o quadro e o ajuste. Na montagem, substitua apenas o quadro corrigido depois de verificar o encaixe.

```text
Gere somente a folha de <part_id>, camada <layer>, variante <variant>, na vista frontal. O mestre aprovado anexado define estilo, identidade e paleta. A base animada limpa e o guia anexados definem cada pose e ponto de encaixe. Use os sete quadros na mesma ordem da base, quatro idle e três reação. Preserve escala, pose e posição no canvas do corpo. Não centralize, recorte rente ou redimensione a peça individualmente.

Desenho e contato: <instrução da tabela ou da ficha V1>.

Devolva só os pixels dessa camada. Corpo, dedos, outras peças e marcações do guia ficam fora da folha. Deixe transparente todo o restante de cada célula, inclusive vazados. Use pixels nítidos, grupos de cor e a mesma luz do mestre. Sem fundo pintado, texto, borda, sombra de chão, antialiasing ou vazamento entre quadros. Se precisar dividir a geração, mantenha a escala e entregue os grupos idle e reação na ordem do guia. A montagem final em PNG RGBA usa sete células de 96 × 128 px, sem margens.
```

Use `body_balanced` como corpo compatível e `default` como variante inicial. As camadas traseira e frontal de um corte mantêm o mesmo ID de catálogo.

| `part_id` | `layer` | Instrução de desenho e contato |
| --- | --- | --- |
| `hair_short_neat` | `hair_front` | Franja curta alinhada e discreta. Encaixe no crânio e mantenha olhos e pontas das orelhas legíveis. |
| `hair_short_neat` | `hair_back` | Nuca rente, atrás da cabeça. Se o corte aprovado dispensar pixels traseiros, registre a camada como ausente no manifesto. |
| `hair_wild_layers` | `hair_front` | Franja e mechas médias soltas em blocos largos. Siga o centro da cabeça e preserve a leitura do rosto. |
| `hair_wild_layers` | `hair_back` | Volume médio e pontas aventureiras atrás do pescoço e ombros. Confira a cobertura com os dois torsos. |
| `torso_linen_tunic` | `torso` | Linho creme, gola contrastante, faixa discreta e costura simples. Siga ombros, cintura e punhos. Preserve pescoço e mãos livres. |
| `torso_novice_robe` | `torso` | Veste curta azul-petróleo com gola desdobrada. Siga ombros e cintura e deixe os punhos livres. |
| `wpn_ashwood_practice_blade` | `held_main` | Madeira escura curta, ponta arredondada e guarda com pano azul. Registre a pega abaixo do pano e ajuste a oclusão na palma em cada pose. |
| `wpn_woven_staff` | `held_main` | Haste alta de madeira e fibra, topo em anel com vazado transparente. Alinhe a trama do punho ao ponto de pega em cada pose. |

**Quarto e sombra.** Para `prototype_room`, peça um PNG único de quarto acolhedor com piso legível, cama e canto de cuidado. Anexe o fundo do protótipo para manter enquadramento, espaço para o personagem e contatos da cena. Normalize para 192 × 336 px. Em outro pedido, para `contact_shadow`, peça uma elipse baixa pixelada com borda em degraus, alpha suave e sem emissão. Normalize para 46 × 12 px e mantenha o centro sob os pés conforme a referência. Use os importadores correspondentes do protótipo como referência.

## Pós-processamento e exportação G1

1. Guarde a imagem original. Em um editor de pixels, isole os quadros e reconstrua a transparência onde necessário. Limpe pixels soltos, halos e bordas interpoladas. Use alpha 0 ou 255 nas peças sólidas e preserve alpha parcial intencional de sombra, vidro ou efeitos. Exporte em PNG RGBA sem perdas.
2. Se houver mudança de escala, aplique uma escala comum com vizinho mais próximo, sem esticar a figura. Revise a arte na resolução final e retoque pixels se necessário. Encaixe cada quadro em um canvas de 96 × 128 px com deslocamentos de pixels inteiros. Alinhe cada peça sobre a pose correspondente pelas âncoras. Se a silhueta ou pose tiver mudado, corrija ou regenere o quadro.
3. Monte a faixa de **672 × 128 px**, sem margem ou espaçamento. Cada retângulo é `(96 × i, 0, 96, 128)`, para `i` de 0 a 6. Os índices globais 0–3 são `idle` 00–03 a 240 ms por quadro em loop. Os índices 4–6 são `react` 00–02 a 120 ms por quadro, uma vez com retorno ao idle. Todos os recortes usam pivô **(48, 11)** da esquerda e de baixo. No guia com origem superior esquerda, o mesmo ponto é **(48, 117)** nas coordenadas de borda. O importador Unity usa pivô normalizado **(0.5, 0.0859375)** e **32 PPU**. A resolução gerada pelo ChatGPT pode variar. As medidas se aplicam aos exports normalizados.
4. Derive um `g1_compat/<id>.png` por ID de catálogo. No G1 a pilha do personagem é sombra → corpo → torso → cabelo → mão. Preserve as folhas frontal e traseira na fonte. Para o cabelo composto, masque os pixels traseiros ocultos pelo corpo e torso em cada quadro e combine o trecho visível com a camada frontal. Confirme que a mesma máscara funciona com **ambos** os torsos. Se a oclusão variar, ajuste a silhueta da variante para o G1 ou registre a combinação como pendente de integração de camadas. Na arma, masque a área coberta pelos dedos sem pintá-los na folha. Mãos livres é a ausência do item. Mantenha o rosto no corpo no export G1.

As medidas, a cadência e os slots acima formam o [contrato conferido de integração G1](27-especificacao-arte-sprites-v1.md#2-contrato-unity-conferido). Alterações dependem de decisão explícita.

## Arquivos e manifesto

Organize cada revisão do lote fora de `Assets`, por exemplo em `art-source/content-v1/b01/v001/`.

| Caminho no lote | Conteúdo |
| --- | --- |
| `refs/` | Mestre aprovado, paleta, base animada limpa e guia de âncoras. |
| `raw/` e `prompts/` | Imagens originais geradas e prompts exatos usados, inclusive correções. |
| `character/<part_id>/<variant>/` | Fontes editáveis e folhas normalizadas `<part_id>__<layer>__front.png`, como `hair_wild_layers__hair_back__front.png`. O último `front` é a vista. |
| `g1_compat/` | Sete folhas `<id>.png` nas dimensões G1, mais `prototype_room.png` e `contact_shadow.png` para o lote completo. Preserve os nomes de subsprites `<id>__idle__front__00..03` e `<id>__react__front__00..02` na importação. |
| `qa/` | Pranchas montadas, provas de alpha e alinhamento, previews em movimento e resultado dos testes. |
| `manifest.json` | Inventário da revisão e mapa de origem dos exports. |

Use IDs de catálogo existentes em `lowercase_snake_case`. Dê a cada folha modular um `assetId` estável, como `hair_wild_layers__hair_back__front__default`, com `catalogId: hair_wild_layers`. Quarto e sombra usam seus IDs de produção e `catalogId: null`. Use `v001`, `v002` etc. para revisões do lote e registre motivo, revisão anterior e alterações. Ao mudar a base ou o mestre, declare a nova dependência, revalide as peças afetadas e identifique as que precisam de correção. Guarde o prompt exato, arquivos de referência versionados, ferramenta/modelo conforme exibido e SHA-256 dos arquivos para repetir a solicitação e identificar o resultado original. Uma nova geração pode produzir pixels diferentes.

| Nível do manifesto | Campos mínimos |
| --- | --- |
| Lote | `batchId`, `revision`, `previousRevision`, `status`, `contractCommit`, `masterRef`, `baseRef`, aprovação do mestre e resumo das mudanças. Identifique referências por caminho, versão e hash. |
| Peça | `assetId`, `catalogId`, `layer`, `variant`, `view`, `compatibleBodyIds`, `status`, caminhos de fonte e export, revisão de mestre/base, referências e prompt utilizados, ferramenta, autoria/origem, licença ou condições de uso e `sha256`. |
| Folha e quadros | Dimensões, formato, PPU e pivô com origem declarada. Para cada quadro, índice global, estado, índice no estado, retângulo, duração e âncoras medidas. Registre ordem de composição, oclusões, ausência intencional ou fallback por estado. |
| Export compatível e QA | Caminho, hash e lista de `assetId` e revisões de origem. Registre as máscaras usadas, combinações testadas, evidências, resultado e pendências. |

Exemplo de entrada de quadro em uma folha. Preencha as âncoras medidas na entrega real.

```json
{
  "index": 4,
  "animationId": "react",
  "frame": "00",
  "rect": [384, 0, 96, 128],
  "durationMs": 120,
  "pivotBottomLeftPx": [48, 11],
  "anchorsBottomLeftPx": {}
}
```

## Validação e entrega

- **Arquivo.** Confira dimensões, modo RGBA, sete retângulos na ordem e nenhum pixel vazando para a célula vizinha. Inspecione transparência real e bordas sobre fundos claro e escuro. Registre hashes e confira se os arquivos do manifesto existem. Declare as camadas ausentes intencionais.
- **Encaixe.** Sobreponha cada quadro à base com o pivô comum. Confira pés no chão, cabelo no crânio, roupa nos ombros e cintura, arma na pega e oclusão de dedos. Inspecione a 100% e amplie em escala inteira para localizar pixels soltos, cortes e halos. Registre os quadros aprovados e os que pedem retoque.
- **Composição.** Na prova inicial, compare cabelo curto e túnica com lâmina e mãos livres. Para o lote G1 completo, teste os dois cabelos × dois torsos × lâmina, cajado ou mãos livres, nos sete quadros. Faça previews na cadência G1 e confira idle 03 → 00, reação 02 → idle e trocas de peça no mesmo quadro. Veja a composição no fundo do quarto em escala de jogo e retrato. Encaminhe os PNGs prontos e liste os que ainda dependem de correção.
- **Unity.** Envie a pasta do lote com manifesto, referências, exports e QA. Use os importadores G1 como referência para Sprite Multiple, Point, alpha, mipmaps desligados e escala e compressão que preservem os pixels no Android. Ao substituir texturas existentes, preserve os `.meta`, GUIDs e IDs locais dos subsprites. Confira `PrototypeAppearance`, `PrototypeHumanoid` e `Home`. Rode `PrototypeAppearanceTests` e `HomeFlowTests`, confira trocas e reação em Play Mode e registre a evidência Android quando houver build e aparelho disponíveis.

**Mensagem para o agente Unity depois de validar o lote**

```text
Receba o lote de arte <caminho e revisão>. Leia manifest.json, as evidências em qa/ e o contrato G1 da especificação V1. Importe apenas os exports compatíveis liberados, mantendo IDs, sequência, pivô, PPU e referências serializadas. Use as folhas modulares como fonte e o cabelo composto como o export do slot Hair. Valide o catálogo e o fluxo do quarto pelos testes e pela matriz de troca. Registre os resultados executados, pendências e evidências de integração.
```
