# FROMBOS — Shared Project Context

## Purpose
FROMBOS is a competitive intelligence and coaching platform for Wild Rift, designed for coaches, analysts and competitive teams.

The product loop is:

**Configure team → Build composition → Draft → Play → Review VOD → identify patterns → convert patterns into training → reuse learning in future Drafts and Series.**

## Source of truth
GitHub is the shared source of truth for code, product documentation, architectural decisions and project status. ChatGPT sessions/accounts are workers on the same repository, not separate sources of truth.

## Repository
`Versooh/frombos-claude`

## Production rule
`main` is the stable/public line. Experimental/rebuild work must stay outside `main` until it passes the release gate.

## Current coordination branch
`rebuild/frombos-v2-next`

Before changing code, inspect the latest branch state and the coordination documents in the repository.

## Core modules
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

## Data integrity
Competitive information must distinguish:
- OFFICIAL
- OBSERVED
- CURATED
- FROMBOS_STRUCTURAL
- USER_PRIVATE
- UNKNOWN

Never present a recommendation as an observed statistic. When evidence is missing, prefer `UNKNOWN` over invented values.

## Product principles
- Function over decoration.
- Every module should connect to the competitive workflow.
- Tactical Board must use validated Wild Rift map geometry, not a generic PC Summoner's Rift substitute.
- VOD annotations must remain linked to timestamps and be convertible into training items.
- Draft decisions should be explainable from available evidence and team context.
- Champion intelligence should connect champion, player pool, matchup, build, composition and draft context.
- UI layers must not mutate competitive evidence, draft state or map geometry.
- Desktop and mobile are first-class experiences.
- Persistence matters: workspace state should survive refresh and support backup/restore where applicable.

## Collaboration rule
If two ChatGPT accounts are used, each must:
1. read this file;
2. read `FROMBOS-STATUS.md`;
3. read `FROMBOS-DECISIONS.md` when making architectural/product decisions;
4. inspect recent commits before editing;
5. work on a dedicated feature branch for concurrent work;
6. update status/changelog after meaningful work;
7. never overwrite another worker's work blindly.

## Commit convention
Prefer concise conventional messages such as:
- `feat(draft): ...`
- `feat(tactical): ...`
- `fix(vod): ...`
- `refactor(core): ...`
- `docs: ...`
- `test(...): ...`

## Definition of done
A feature is not DONE unless it works, persists when required, has appropriate empty/error states, avoids fake data, preserves navigation, and is integrated with related modules.
