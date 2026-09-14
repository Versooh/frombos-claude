# FROMBOS V2 — Plano de Execução

Data: 2026-09-14
Branch de trabalho: `rebuild/frombos-v2`
Status: EM EXECUÇÃO

## 1. Objetivo

Reconstruir o FROMBOS como uma plataforma única de inteligência competitiva para Wild Rift, preservando o conhecimento, os fluxos úteis e os dados recuperados do FROMBOS COACH/FROMBOS RIFT, mas substituindo a arquitetura monolítica e os protótipos por uma base modular, testável, persistente e evolutiva.

O produto final deve funcionar como um sistema integrado para coach, analista e time competitivo.

## 2. Regra de ouro

Cada fase precisa terminar com:

- código executável;
- comportamento validável;
- persistência quando aplicável;
- ausência de dados fictícios apresentados como reais;
- documentação do que foi concluído;
- critérios claros para avançar.

Não haverá "mockup final" desconectado de funcionalidade.

## 3. Arquitetura-alvo

### Produto

`FROMBOS`

Módulos:

1. Command Center
2. Team Workspace
3. Champion Intelligence
4. Matchup Lab
5. Build Intelligence
6. Composition Lab
7. Draft Room
8. Series / Fearless Intelligence
9. Tactical Board
10. VOD Review
11. Scouting War Room
12. Training Center
13. Competitive Center
14. Meta Intelligence
15. Reports
16. Data Center
17. Settings / Backup / Import / Export

### Camadas técnicas

- Presentation / UX
- Router
- Local Workspace State
- Persistent Storage
- Competitive Domain Models
- Intelligence Engine
- Source Provenance
- Import / Export
- Offline / PWA
- Tests / QA

## 4. Contrato de dados

Toda informação competitiva deve declarar sua natureza.

Tipos mínimos:

- `OFFICIAL`
- `OBSERVED`
- `CURATED`
- `FROMBOS_STRUCTURAL`
- `USER_PRIVATE`
- `UNKNOWN`

Campos de provenance quando aplicável:

- source
- patch
- region
- rank/mode
- sample
- observedAt
- confidence
- evidence
- stale

Nunca converter recomendação em estatística observada.

## 5. Roadmap executável

### PHASE 0 — Recovery Lock

Objetivo: impedir perda de conhecimento antigo.

Entregas:

- auditoria do site atual;
- inventário de arquivos recuperados;
- inventário do repositório;
- classificação KEEP / REBUILD / DISCARD;
- branch isolada de rebuild.

Critério de saída:

- nenhuma alteração na `main`;
- fonte de recuperação documentada.

Status: CONCLUÍDA.

---

### PHASE 1 — Product Foundation

Objetivo: criar o novo esqueleto funcional da plataforma.

Entregas:

- novo shell visual;
- navegação por módulos;
- estado global persistente;
- tema tactical dark;
- responsive mobile/desktop;
- PWA base;
- import/export do workspace;
- Data Center com estado das fontes;
- empty states honestos.

Critério de saída:

- todas as rotas principais navegáveis;
- refresh não perde workspace local;
- export + import reconstroem o estado;
- nenhuma métrica fictícia.

Status: EM EXECUÇÃO.

---

### PHASE 2 — Team Workspace + Champion Pools

Objetivo: fazer o FROMBOS conhecer o time.

Entregas:

- nome/time/oponente;
- 5 posições;
- jogadores;
- champion pool por jogador/role;
- estados CONFORTO / TREINO / SITUACIONAL / DESENVOLVIMENTO;
- filtros;
- visão estrutural da pool;
- dados exportáveis.

Critério de saída:

- champion pool usada pelo Draft e Composition Lab.

---

### PHASE 3 — Composition Lab

Objetivo: transformar composições em planos executáveis.

Entregas:

- recuperar seis composições atuais;
- composições customizadas;
- arquétipos;
- lineup e roles;
- win condition;
- strengths / weaknesses;
- curva de poder;
- bans;
- replacements;
- plano de jogo;
- transformar comp em treino;
- abrir comp diretamente no Draft.

Critério de saída:

- nenhuma composição recebe WR inventado;
- origem sempre visível.

---

### PHASE 4 — Draft Room + Fearless Series

Objetivo: criar o principal ambiente de decisão do produto.

Entregas:

- roster Wild Rift canônico;
- busca/filtro por campeão;
- pick/ban manual;
- rulesets;
- MD1/MD3/MD5;
- Fearless;
- histórico G1-G5;
- branches A/B/C;
- undo/redo;
- salvar sessão;
- importar comp;
- champion pool fit;
- leitura estrutural;
- risco / reveal / execution cost;
- alternativas;
- opponent model evidence-only.

Critério de saída:

- estado da série persiste após refresh;
- campeões usados ficam legalmente bloqueados conforme ruleset;
- decisões estruturais são explicáveis.

---

### PHASE 5 — Tactical Board 2.0

Objetivo: criar uma sala tática realmente útil para Wild Rift.

Entregas:

- mapa Wild Rift validado;
- zoom/pan;
- layers;
- champions;
- nomes de jogadores;
- paths/setas;
- desenho livre;
- texto;
- objetivos;
- waves;
- wards reais;
- range de visão;
- danger/vision zones;
- scenarios;
- undo/redo;
- autosave;
- export;
- share state;
- fullscreen presentation.

Critério de saída:

- mapa não pode ser substituído por Summoner's Rift PC ou representação genérica.

---

### PHASE 6 — VOD Review

Objetivo: ligar vídeo, tática e treino.

Entregas:

- abrir vídeo local;
- player interativo;
- velocidade;
- frame/pause;
- canvas de desenho sobre vídeo;
- annotations por timestamp;
- tags;
- comentários;
- bookmarks;
- captura de frame;
- export das notas;
- enviar achados para Training Center.

Critério de saída:

- annotations retornam ao timestamp correto.

---

### PHASE 7 — Champion Intelligence + Matchups + Builds

Objetivo: unificar inteligência por campeão.

Entregas:

- Champion Hub;
- official identity;
- roles;
- skills;
- curated knowledge;
- observed matchup quando existir;
- structural matchup;
- builds baseline;
- contextual matchup build;
- full-comp override;
- power windows;
- combos;
- synergies;
- evidence viewer.

Critério de saída:

- observed e structural nunca aparecem misturados como a mesma coisa.

---

### PHASE 8 — Scouting + Competitive Center

Objetivo: transformar informação adversária em preparação.

Entregas:

- opponent workspace;
- roster;
- priority picks;
- bans;
- flexes;
- draft tendencies;
- response patterns;
- series history;
- tournament context;
- timeline;
- mapa quando houver evidência;
- conexão direta com Draft Room.

Critério de saída:

- nenhuma tendência sem origem/evidência.

---

### PHASE 9 — Training Center + Reports

Objetivo: converter análise em processo de evolução.

Entregas:

- calendário;
- scrims;
- weekly plan;
- drills;
- role tasks;
- checklist;
- goals;
- vínculo com VOD, Draft, Comps e Tactical Board;
- relatórios reais;
- evolução baseada em dados inseridos/observados.

Critério de saída:

- relatório não exibe métrica sem fonte real.

---

### PHASE 10 — Data Intelligence Pipeline

Objetivo: reconstruir a camada de dados confiável.

Entregas:

- Riot Official;
- RiftGG observed recovery;
- WildRiftFire curated;
- Wild Legends curated;
- fontes adicionais validadas;
- snapshots;
- source health;
- stale detection;
- canonical mappings;
- quality gates;
- update workflow;
- rollback.

Critério de saída:

- cada dado rastreável até sua origem.

---

### PHASE 11 — Production Hardening

Objetivo: colocar o novo produto em condição de substituir o atual.

Entregas:

- accessibility;
- reduced motion;
- offline;
- PWA install;
- backup/restore;
- responsive 360/390/430/tablet/desktop;
- performance;
- error boundaries;
- recovery states;
- release checklist;
- migration dos dados locais possíveis;
- smoke tests.

Critério de saída:

- novo FROMBOS supera funcionalmente o site atual em fluxos críticos.

---

### PHASE 12 — Release

Objetivo: trocar a versão pública com segurança.

Estratégia:

1. build final em branch;
2. validação;
3. preview;
4. backup da versão antiga;
5. merge controlado;
6. deploy;
7. smoke test público;
8. rollback disponível.

A versão antiga só será substituída quando a nova passar nos critérios de release.

## 6. Ordem prática de implementação

Sequência recomendada de construção:

`Foundation → Team → Comps → Draft/Fearless → Tactical → VOD → Champion/Matchup/Build → Scouting → Training/Reports → Data pipeline → Production`.

Isso garante que cada módulo novo se conecta a algo já funcional.

## 7. Definição de pronto

Uma feature só pode ser marcada DONE quando:

- funciona no desktop;
- funciona no mobile;
- salva estado quando necessário;
- possui empty/error state;
- não inventa dados;
- possui labels de provenance quando necessário;
- não quebra navegação;
- não depende de um fluxo inexistente;
- foi integrada aos módulos relacionados.

## 8. Política de publicação

Durante o rebuild:

- `main` continua sendo a versão estável;
- `rebuild/frombos-v2` recebe a reconstrução;
- nenhum deploy destrutivo automático;
- só promover para produção após release gate.

## 9. Primeira execução

A primeira execução implementa a PHASE 1 e prepara os contratos usados pelas fases seguintes:

- shell novo;
- router;
- storage;
- workspace schema;
- módulos navegáveis;
- backup/restore;
- PWA base;
- Data Center;
- visual system inicial.

Depois disso, o projeto passa a crescer por módulos sem voltar à arquitetura monolítica antiga.
