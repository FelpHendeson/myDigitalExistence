# myDigitalExistence

myDigitalExistence é um projeto de jogo mobile em pixel art que combina os cuidados de um pet virtual com a progressão de um RPG. O jogador invoca um companheiro humanoide por meio de uma runa, cuida dele no dia a dia e acompanha seu crescimento. A plataforma inicial é Android, com o cliente em Unity 2D e C#.

## Propósito

O jogo quer criar um vínculo com o personagem por meio de uma rotina leve. Alimentar, descansar e cuidar da higiene e da saúde do companheiro faz parte da experiência, assim como treinar mana, jogar minigames e ganhar recursos para personalizá-lo.

A invocação define a origem do personagem. Ao longo do jogo, o jogador escolhe sua classe e desenvolve seus atributos e habilidades. Roupas, cabelos e equipamentos em camadas permitem mudar a aparência do companheiro. O progresso ficará vinculado a uma conta com espaço para até três personagens.

## Estado e próximos passos

O projeto Unity Universal 2D está em `client/` e abriu a `SampleScene` com o Editor `6000.0.40f1`. Android Build Support, Android SDK & NDK Tools e OpenJDK foram instalados, e o Editor reconheceu Android em **File → Build Profiles**.

O primeiro marco (G0) termina quando um APK mínimo rodar em um aparelho Android. Em seguida, a primeira prova visual (G1) prevê um personagem modular com animação de repouso e troca de peça em um quarto simples. Os critérios estão no [plano mestre](12-plano-mestre.md) e no [backlog](13-backlog-execucao.md).

O [MVP proposto](02-gdd-mvp.md) reúne invocação, lar, cuidados, um minigame de mana, progressão inicial, inventário, loja e salvamento online. O fornecedor do backend ainda está em aberto. Classes completas e pets do personagem aparecem em etapas posteriores do [roadmap](10-roadmap.md).

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

## Acordo de execução e criação

O [AGENTS.md](AGENTS.md) e a [governança criativa](15-governanca-criativa.md) registram a autonomia técnica dos agentes e a decisão final do criador sobre a direção artística e as regras conceituais do jogo. O [pacote inicial V1](22-pacote-conteudo-v1.md) foi autorizado para implementação e teste como `CANDIDATO_JOGAVEL`. A aprovação definitiva dos conceitos e do balanceamento fica para a revisão criativa.
