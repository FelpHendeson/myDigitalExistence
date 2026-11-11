# myDigitalExistence

myDigitalExistence é um projeto de jogo mobile em pixel art que combina os cuidados de um pet virtual com a progressão de um RPG. O jogador invoca um companheiro humanoide por meio de uma runa, cuida dele no dia a dia e acompanha seu crescimento. A plataforma inicial é Android, com o cliente em Unity 2D e C#.

## Propósito

O jogo quer criar um vínculo com o personagem por meio de uma rotina leve. Alimentar, descansar e cuidar da higiene e da saúde do companheiro faz parte da experiência, assim como treinar mana, jogar minigames e ganhar recursos para personalizá-lo.

A invocação define a origem do personagem. Ao longo do jogo, o jogador escolhe sua classe e desenvolve seus atributos e habilidades. Roupas, cabelos e equipamentos em camadas permitem mudar a aparência do companheiro. O progresso ficará vinculado a uma conta com espaço para até três personagens.

[**Baixar APK G1 para Android**](https://github.com/FelpHendeson/myDigitalExistence/releases/download/g1-android-dev.2/myDigitalExistence-g1-dev.apk) · 42,0 MiB · ARM64 · Android 6.0 ou superior.

## Estado e próximos passos

O projeto Universal 2D está em `client/`, com Unity `6000.0.40f1`, URP `17.0.4` e Input System `1.13.0`. A cena Bootstrap abre no Editor e já tem um APK de desenvolvimento compilado. A `SampleScene` original continua em `client/Assets/Scenes/`.

O diretor validou no celular os APKs de G0 e G1. O próximo marco, G2, começa pela simulação local de necessidades e pelas ações de cuidado no quarto. Os critérios estão no [plano mestre](12-plano-mestre.md) e no [backlog](13-backlog-execucao.md).

O [MVP proposto](02-gdd-mvp.md) reúne invocação, lar, cuidados, um minigame de mana, progressão inicial, inventário, loja e salvamento online. O fornecedor do backend ainda está em aberto. Classes completas e pets do personagem aparecem em etapas posteriores do [roadmap](10-roadmap.md).

## Build de homologação Android

- Abra `client/` no Unity `6000.0.40f1` com Android Build Support e as ferramentas fornecidas pelo Hub. O ambiente de homologação tem SDKs API 33–35, Build Tools 34.0.0, NDK r27c e OpenJDK 17.
- Em **File → Build Profiles**, ative o perfil [Android Development](client/Assets/Settings/Build%20Profiles/Android%20Development.asset). Ele usa a lista global com [Bootstrap](client/Assets/Game/Scenes/Bootstrap.unity) como cena inicial. **Development Build** está ativo e **Build App Bundle** está desativado.
- Escolha **Build** e grave o APK em `client/Builds/Android/`, diretório ignorado pelo Git. O pacote é `com.felphendeson.mydigitalexistence`, versão `0.1.0-dev.2` (código 2), IL2CPP ARM64, API mínima 23 e alvo automático pelo SDK instalado. O APK usa assinatura de depuração.
- O protótipo usa retrato como configuração técnica reversível. A Bootstrap usa o Input System e ajusta o painel à área segura. Em Play Mode, **Testar entrada** incrementa o contador de entradas.
- Para aceitar ENV-05, instale o APK em um aparelho Android ARM64, confirme que a tela abre, toque em **Testar entrada** e confira se a contagem aumenta. Registre o aparelho, a versão do Android e erros de inicialização, se houver.

### Resultado de homologação G0 em 11/11/2026

[APK da prévia G0](https://github.com/FelpHendeson/myDigitalExistence/releases/download/g0-android-dev.1/myDigitalExistence-dev.apk)

- O Editor executou a Bootstrap em Play Mode e o botão mostrou `Entrada recebida (1)`. O botão também respondeu a toque simulado no perfil Google Pixel 5, em retrato, no Device Simulator. O Console permaneceu sem erros ou avisos nos testes de interação.
- O Unity registrou `Succeeded` em 1152 s. APK local em `client/Builds/Android/myDigitalExistence-dev.apk` (43.924.560 bytes), compilado a partir da implementação registrada em `94d0992`. SHA-256: `cb224af3c7e3b433f136924fb3d17e5e93df6b4d99b6f1aa6c4c3e075d852d2e`.
- `aapt2` confirmou atividade de inicialização, retrato, `arm64-v8a`, API mínima 23 e alvo 35. `apksigner` confirmou a assinatura de depuração (v1 e v2), com avisos sobre entradas de metadados em `META-INF` no esquema v1.
- O log de compilação registrou avisos de shader de terreno do URP. O Gradle sinalizou metadados do SDK em pasta somente leitura e API Java depreciada na GameActivity do Unity. O empacotamento terminou com sucesso.
- **G0 / ENV-05 aceito em 11/11/2026.** O diretor confirmou o funcionamento do APK no próprio celular após baixar a prévia. O modelo, a versão do Android e o Logcat não foram fornecidos.

## Protótipo G1 · Meu quarto

Em Play Mode, inicie pela Bootstrap e selecione **Abrir quarto**. Os controles alternam dois cabelos, duas roupas e duas peças de mão, com a opção **Mãos livres**. **Interagir** dispara uma reação e devolve o personagem ao idle. As escolhas duram enquanto a cena está aberta.

- [Home](client/Assets/Game/Scenes/Home.unity), [prefab humanoide](client/Assets/Game/Prefabs/PrototypeHumanoid.prefab) e [catálogo de aparência v1](client/Assets/Game/Content/PrototypeAppearance.asset). Os IDs são estáveis, e o catálogo registra a compatibilidade com o corpo equilibrado e a ordem de cada quadro.
- [Sprites originais provisórios](client/Assets/Game/Art/Prototype) em estado `CANDIDATO_JOGAVEL`. O contrato frontal usa quadros de 96 × 128 px, pivô em (48, 11) a partir do canto inferior esquerdo, 32 PPU, filtro Point, quatro quadros de idle e três de reação. O [gerador PowerShell](client/Tools/Generate-PrototypeArt.ps1) reproduz os nove PNGs do protótipo. Para novos lotes de arte, siga o [guia de folhas modulares com ChatGPT Images](28-producao-sprites-chatgpt.md). Preserve os arquivos `.meta` para manter as referências.
- **Validação no Unity 6000.0.40f1.** Três EditMode passaram, incluindo IDs, dimensões, pivôs, compatibilidade e referências do prefab. Um PlayMode passou, cobrindo navegação, trocas no mesmo quadro, ordem das camadas, mãos livres e retorno ao idle. O Device Simulator mostrou a composição e os controles em retrato nos perfis Pixel 5 e Galaxy S10e.

- **APK do G1.** O build Android levou 322 s e o relatório Unity registrou sucesso, com zero erros e zero avisos. As cenas Bootstrap e Home foram incluídas. O manifesto e a assinatura de depuração foram verificados. O APK da prévia tem 44.068.185 bytes e SHA-256 `3163a52c647add507d0bb26d5b6e7e8a562099559e0f82d23f20b7235cd0ec45`.
- **G1 validado e aceito em 11/11/2026.** O diretor confirmou o teste do APK `0.1.0-dev.2` em seu celular. O modelo, a versão do Android e as medições de FPS e memória de ART-09 ainda não foram registrados. O catálogo visual segue em `CANDIDATO_JOGAVEL`.

## Documentação

1. [Visão do jogo](01-visao.md)
2. [Design do MVP](02-gdd-mvp.md)
3. [Personagens modulares e direção artística](03-personagens-modulares.md)
4. [Runas e invocação](04-runas-invocacao.md)
5. [Raças, classes, atributos e habilidades](05-progressao-rpg.md)
6. [Cuidados, mana e minigames](06-cuidados-mana-minigames.md)
7. [Economia, loja e pets](07-economia-pets.md)
8. [Arquitetura Unity e persistência](08-arquitetura.md)
9. [Planejamento do backend online](09-backend-online.md)
10. [Roadmap e critérios de validação](10-roadmap.md)
11. [Decisões e pendências](11-decisoes-pendencias.md)
12. [Plano mestre de desenvolvimento](12-plano-mestre.md)
13. [Backlog de execução](13-backlog-execucao.md)
14. [Qualidade, testes e validação Android](14-qualidade-validacao.md)
15. [Governança criativa](15-governanca-criativa.md)
16. [Especificação técnica Unity 2D e Android](16-especificacao-unity.md)
17. [Contratos de domínio, dados e mecânicas](17-contratos-de-dominio.md)
18. [Pipeline visual de personagens modulares](18-pipeline-visual.md)
19. [Interface, fluxos e QA Android](19-ux-e-qa.md)
20. [API, sincronização e segurança online](20-contratos-online.md)
21. [Roteiro de execução para agentes](21-roteiro-agentes.md)
22. [Pacote de conteúdo inicial V1](22-pacote-conteudo-v1.md)
23. [Modelos humanoides e personalização](23-modelos-e-personalizacao-v1.md)
24. [Runas, raças, classes e habilidades](24-runas-racas-classes-habilidades.md)
25. [Equipamentos iniciais](25-equipamentos-iniciais.md)
26. [Plano de conteúdo e critérios de aceite](26-plano-conteudo-e-aceite.md)
27. [Especificação de arte e fichas de sprites V1](27-especificacao-arte-sprites-v1.md)
28. [Produção de sprites modulares com ChatGPT Images](28-producao-sprites-chatgpt.md)

## Acordo de execução e criação

O [AGENTS.md](AGENTS.md) e a [governança criativa](15-governanca-criativa.md) registram a autonomia técnica dos agentes e a decisão final do criador sobre a direção artística e as regras conceituais do jogo. O [pacote inicial V1](22-pacote-conteudo-v1.md) foi autorizado para implementação e teste como `CANDIDATO_JOGAVEL`. A aprovação definitiva dos conceitos e do balanceamento fica para a revisão criativa.
