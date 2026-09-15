# FROMBOS CORE — Migration Map

_Last updated: 2026-09-15_

## Objective
Move the current V2 foundation toward one canonical domain/state layer without breaking recovered behavior.

## Current → Core mapping

| Current | Core destination | Action |
|---|---|---|
| `assets/js/data.js` | `core/schema.js` + domain registries | Keep catalog temporarily; gradually separate static catalog from domain model |
| `assets/js/store.js` | `core/workspace.js` | Replace as canonical persistence boundary after migration tests |
| `draft-room.js` | Draft domain + Draft Room UI | Keep UI behavior; migrate state writes to Core |
| `tactical.js` | Tactical domain + Tactical Board UI | Keep map/editor behavior; migrate annotations/scenarios to Core |
| `vod-review.js` | VOD + Annotation domain | Keep local player/review behavior; link annotations to Training |
| `renderTeam()` | Team Workspace | Keep UX; use canonical player entities |
| `renderComps()` | Composition Lab | Convert recovered/custom compositions into canonical entities |
| `renderSeries()` | Series/Fearless domain | Series owns games; each game owns a draft reference |
| placeholders | Their respective domains | Implement only after contracts exist |

## Canonical relationships

```text
Team
 ├── Player
 │    └── Champion Pool
 ├── Composition
 └── Series
       └── Game
            └── Draft
                 └── Pick/Ban Actions

VOD
 └── Annotation
       └── Training Item

Scouting ──→ Opponent / Champion / Draft observations
Meta ──────→ Evidence / Insights
Champion ──→ Pool / Matchup / Build / Composition / Draft / Scouting
Tactical ──→ Scenario / Objective / Annotation
```

## Migration rules

1. Do not delete `store.js` until Core workspace can import old V2 localStorage safely.
2. Do not move competitive facts into the Core schema without provenance.
3. Do not couple visual components directly to raw localStorage.
4. Do not duplicate the same entity in multiple module-specific stores.
5. Legacy recovered compositions remain labeled as recovered/curated hypotheses.
6. Existing public behavior remains protected until equivalent Core behavior is tested.

## Phase P0 status

- [x] Canonical provenance vocabulary
- [x] Canonical entity vocabulary
- [x] Core workspace state
- [x] Legacy V2 workspace migration path
- [ ] Core Store adapter wired into `app.js`
- [ ] Draft state migrated
- [ ] Tactical state migrated
- [ ] VOD/annotation state migrated
- [ ] Training linkage implemented
- [ ] Browser regression checks
