# FROMBOS — Auditoria do site publicado

Data: 2026-09-15
Origem publicada: `https://frombos-coach.satiromanoel91.chatgpt.site`
Site projection recuperada: `FROMBOS COACH.txt`
Projeto publicado identificado: `frombos-coach`

## Objetivo

Usar o site atualmente publicado como fonte de recuperação de produto e fluxo, sem transformar sua arquitetura ou visual antigo em requisito do novo FROMBOS.

## Navegação recuperada

A experiência publicada organiza o trabalho de equipe em:

- Composições
- Meu time & pools
- Laboratório de draft
- Mapa & objetivos
- Treinos & evolução
- Cenário competitivo
- Fontes & método

A V20 preserva esses conceitos, mas os integra à plataforma unificada FROMBOS.

## Comportamentos que não podem ser perdidos

- instalação/PWA;
- persistência local;
- configuração do time;
- champion pools por função;
- importação/exportação e backup;
- planos salvos;
- composições e filtros;
- Draft manual;
- preparação tática;
- treino;
- contexto competitivo;
- indicação de fonte/patch/evidência.

## Loop principal recuperado

1. Configurar equipe e pools.
2. Selecionar ou criar composição.
3. Entender condição de vitória e plano.
4. Levar composição ao Draft.
5. Treinar execução.
6. Rever VOD e decisões.
7. Converter padrões em drills.
8. Reutilizar aprendizado em Draft, Scouting e Série.

## Composições recuperadas do site publicado

### Aperta o R e vai junto
- Arquétipo: Engage em camadas
- Malphite / Wukong / Orianna / Xayah / Rakan
- Ideia: duas entradas, dano em área e acompanhamento coordenado.

### Operação: carry vivo
- Arquétipo: Proteção e escala
- Ornn / Xin Zhao / Orianna / Jinx / Lulu
- Ideia: frontline, controle e proteção para converter lutas longas.

### Sem vida, sem dragão
- Arquétipo: Cerco e alcance
- Jayce / Gragas / Ziggs / Ezreal / Karma
- Ideia: ganhar vida/espaço antes de entrar no objetivo.

### Sumiu? Já rotacionou.
- Arquétipo: Lateral e captura
- Camille / Lee Sin / Galio / Ezreal / Nautilus
- Ideia: pressão lateral, captura coordenada e conversão em objetivo.

### Bola de neve com endereço
- Arquétipo: Engage em camadas
- Renekton / Jarvan IV / Galio / Lucian / Nami
- Ideia: pressão precoce e rota de jungle orientada ao primeiro recurso.

### Vem que tem resposta
- Arquétipo: Proteção e escala
- Gwen / Poppy / Orianna / Xayah / Janna
- Ideia: anti-engage, resposta à frontline e ameaça lateral.

## Princípio de honestidade recuperado

O próprio site publicado já trata propostas de composição como hipóteses de treino e não como prova de superioridade no patch. A V20 deve reforçar essa separação.

## Estado editorial recuperado

A projeção publicada referenciava uma base editorial 7.2e. Esse valor é histórico da versão recuperada e não deve ser convertido automaticamente em patch atual.

## Direção da reconstrução

FROMBOS é o produto principal. Os conceitos antigos viram módulos conectados:

- Team Workspace
- Composition Lab
- Draft Room Pro
- Series / Fearless Intelligence
- Tactical Board
- VOD Review
- Champion Intelligence
- Matchup Lab
- Build Intelligence
- Scouting
- Training / Performance Center
- Competitive Intelligence
- Meta Intelligence
- Reports
- Data Center

## Regra de migração

Quando fontes antigas entrarem em conflito:

1. funcionalidade verificada do site publicado vence para fluxo do usuário;
2. dado canônico/verificado vence para fatos;
3. mockup/preview pode inspirar UX, nunca estatística de produção;
4. dados observados, conteúdo curado, Riot Official e cálculo FROMBOS permanecem separados;
5. `UNKNOWN` é preferível a preencher lacunas artificialmente.

## V20 — Champion Visual Overhaul

A auditoria do código mais recente encontrou três gerações visuais atuando sobre retratos de campeão, incluindo duas injeções simultâneas em Composições. A V20 consolida a propriedade visual no módulo `champion-visual-upgrade.js`, mantendo compatibilidade com V19 e retirando `visual-polish.js` do carregamento ativo.

Os retratos são resolvidos pelo registro oficial de Wild Rift reconstruído pelo pipeline `scripts/build-champion-registry.mjs` a partir das páginas oficiais da Riot. O pipeline rejeita thumbnails de item/habilidade e exige alta cobertura antes do deploy.
