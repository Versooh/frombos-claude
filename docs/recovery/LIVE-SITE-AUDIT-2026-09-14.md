# FROMBOS — Live Site Recovery Audit

Date: 2026-09-14
Branch: `rebuild/frombos-v2`
Live project: `FROMBOS COACH`
Live slug: `frombos-coach`
Live URL: `https://frombos-coach.satiromanoel91.chatgpt.site`

## Goal

Preserve product knowledge, useful content, data structures and user workflows from the currently published FROMBOS COACH while rebuilding the technical architecture from scratch where necessary.

This is a recovery document, not a mandate to reproduce the current visual/technical implementation.

## Verified from the current live-site artifact

### Global product shell

Current primary navigation exposes:

- Composições
- Meu time & pools
- Laboratório de draft
- Mapa & objetivos
- Treinos & evolução
- Cenário competitivo
- Fontes & método

The product is presented as a team coaching workspace rather than a generic statistics dashboard.

### PWA / local-first behavior to preserve

The current published product communicates:

- Installable application/PWA behavior
- Data stored on the device
- Team export
- Team import
- Saved plans
- Persistent local configuration

These are migration-critical behaviors.

### Team-centric flow

The current home/composition experience follows this loop:

1. Configure the team.
2. Configure champion pools by lane.
3. Choose or create a composition.
4. Understand the composition's plan.
5. Carry it into training.
6. Review and evolve.
7. Reuse the result in draft preparation.

This loop should remain one of the product's primary UX narratives.

### Roles

The live product currently uses the Wild Rift competitive role language:

- Baron
- Jungle
- Mid
- Dragon
- Support

Internal IDs may later be normalized separately from PT-BR presentation labels.

### Composition filters and catalog

The live composition view includes filtering by:

- player
- champion
- style
- pool eligibility
- favorites
- saved plans
- competitive use / training proposal context

Verified styles include:

- Engage em camadas
- Proteção e escala
- Cerco e alcance
- Lateral e captura

### Training compositions currently represented

Representative live-site proposals include:

#### Aperta o R e vai junto
Archetype: Engage em camadas
Lineup: Malphite / Wukong / Orianna / Xayah / Rakan
Intent: layered initiation, AoE damage, coordinated follow-up.

#### Operação: carry vivo
Archetype: Proteção e escala
Lineup: Ornn / Xin Zhao / Orianna / Jinx / Lulu
Intent: frontline, control and long-fight protection for Jinx.

#### Sem vida, sem dragão
Archetype: Cerco e alcance
Lineup: Jayce / Gragas / Ziggs / Ezreal / Karma
Intent: range, siege and objective setup before entering the pit.

#### Sumiu? Já rotacionou.
Archetype: Lateral e captura
Lineup: Camille / Lee Sin / Galio / Ezreal / Nautilus
Intent: coordinated pick/catch with side pressure.

#### Bola de neve com endereço
Archetype: Engage em camadas
Lineup: Renekton / Jarvan IV / Galio / Lucian / Nami
Intent: early pressure focused around first resources/objectives.

#### Vem que tem resposta
Archetype: Proteção e escala
Lineup: Gwen / Poppy / Orianna / Xayah / Janna
Intent: anti-engage, frontline damage and side-lane pressure.

### Data honesty already visible in the product

The current site explicitly distinguishes training proposals from proof of current-patch superiority and links its editorial base to patch context. This principle must be retained and strengthened.

## Recovered project behavior that should migrate into V2

The following behaviors were part of the evolved FROMBOS project and remain compatible with the live product direction.

### Draft Room

Preserve or rebuild:

- manual draft
- real Wild Rift roster
- configurable rulesets
- pick/ban sequence
- role resolution
- champion pool fit
- Fearless state
- saved branches / Plan A-B-C
- structural read of own draft
- opponent draft read
- alternatives / repair suggestions
- evidence labels
- patch/source awareness

Fearless must visually mark already-used champions as unavailable and retain series history.

### Series Intelligence

Target state:

- MD3 / MD5 context
- Global or team-scoped Fearless rules when appropriate
- persistent G1/G2/G3/G4/G5 state
- remaining champion-pool depth by role
- future-value awareness before spending a champion

Do not use demonstrative preview counts as production data.

### Tactical Board / Map & Objectives

Preserve useful interaction concepts from the prior tactical board:

- scenarios
- positions
- arrows / paths
- free drawing
- objectives
- text notes
- danger/vision markers
- undo/redo
- zoom/pan
- local persistence
- shareable state
- portable export

Rebuild against the exact Wild Rift map representation and add proper Wild Rift ward/vision tooling rather than preserving generic placeholders.

### Scouting / Competitive Scenario

Treat as a War Room, not a generic CRM/profile screen.

Desired data when actually available:

- opponent
- region/event
- roster
- champion preferences
- ban tendencies
- priority picks
- flexes
- response patterns
- recent games
- strengths/vulnerabilities
- objective tendencies
- rotations
- evidence/patch labels

Never fabricate heatmaps or opponent tendencies.

### Training Center

The training route should become a performance center containing:

- calendar
- upcoming scrims/training sessions
- weekly plan
- focus areas: macro, mechanics, vision, communication, objectives
- drills
- role-specific tasks
- session checklist
- goals
- review links into compositions, draft and VOD analysis

Avoid corporate-planner aesthetics.

### VOD Review

Recovered project direction to carry forward into the rebuild:

- video upload/import workflow
- interactive player
- pause / playback speed
- drawing/annotation over paused video
- mouse and touch input
- timestamped comments
- tactical tags
- review notes that can feed training reports

This feature is not verified in the current site's flattened projection and must be treated as recovered project behavior, not as a claim about the exact currently rendered route.

### Reports

Reports should remain analytical and only expose real metrics:

- general performance
- evolution
- objective control
- draft reading
- role performance
- champions
- scrims
- summary

No fake dashboard metrics.

## Visual identity worth preserving

Preserve the direction, not the literal old implementation:

- esports / tactical / cosmic identity
- dark premium surfaces for tactical work
- cyan/blue for information and interaction
- gold for priority/prestige/decision
- violet for advanced intelligence/special states
- red for bans/threat/error/opponent
- green for confirmations/favorable states
- restrained glow
- editorial typography
- consistent role/champion imagery

Avoid:

- generic SaaS cards everywhere
- excessive glassmorphism
- random gradients
- oversized radii
- fake metrics
- excessive badges
- decorative charts with no decision value

## Migration priority

### P0 — Must not be lost

1. Team + champion pools
2. Composition catalog and custom plans
3. Manual Draft Room
4. Fearless series state
5. Tactical Board state model
6. Training center
7. Local persistence / import-export
8. Data provenance / patch / evidence labels
9. PWA/mobile behavior

### P1 — Rebuild better

1. Champion intelligence
2. Matchups
3. Contextual builds
4. Opponent scouting
5. VOD review
6. Reports
7. Competitive tournament context
8. Draft branches and structural evaluation

### P2 — Intelligence layer

1. Official Riot data
2. Observed datasets
3. Curated knowledge
4. FROMBOS structural calculations
5. Confidence and UNKNOWN states
6. Update pipeline
7. Meta evolution

## Architecture decision

The live site must not be copied as a monolithic page. V2 should separate:

- UI / routing
- team workspace state
- competitive data
- intelligence engine
- persistence
- import/export schemas
- tactical board state
- VOD annotations
- source provenance

FROMBOS remains the product. Coach/Rift/Tactical/VOD become modules of the same platform.

## Recovery rule

When a current behavior and an older preview conflict:

1. verified live functionality wins for user workflow;
2. verified canonical data wins for facts;
3. preview concepts may inspire UX but never supply production statistics;
4. old visual implementation is disposable;
5. state/data contracts should be migrated deliberately, not copied blindly.
