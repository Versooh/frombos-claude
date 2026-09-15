# FROMBOS — Architecture Audit

_Date: 2026-09-15_
_Branch audited: `rebuild/frombos-v2-next`_
_Base commit at start of audit: `b463a756315434b51888d7e90feea03b2e27755d`_

## 1. Executive finding

The current `rebuild/frombos-v2-next` is substantially cleaner than the historical public/main line: it is a small V2 foundation with a modular ES-module entry point, centralized data definitions, a local workspace store, and dedicated Draft/Tactical/VOD modules.

The main architectural risk is no longer the number of files in this branch. It is that the V2 foundation is still a **module shell**, while the repository history contains many older V15–V24 layers. The correct strategy is therefore to keep V2-next as the reconstruction base and migrate behavior deliberately, rather than merging generations wholesale.

## 2. Current runtime topology

`index.html`
→ `assets/js/app.js`
→ `assets/js/data.js` + `assets/js/store.js`
→ feature modules (`draft-room.js`, `tactical.js`, `vod-review.js`)
→ `localStorage` workspace

The HTML entry point is intentionally minimal and mounts `#app`; the application shell and routes are rendered by `app.js`.

## 3. Current files and responsibilities

### Application shell
- `index.html`: HTML bootstrap, manifest and service-worker registration.
- `assets/js/app.js`: router, shell, page rendering and module binding.
- `assets/css/app.css`: core layout/components.
- `assets/css/features.css`: feature styling.

### Domain/data
- `assets/js/data.js`: modules, roles, champion catalog, recovered compositions, sources and draft order.
- `assets/js/store.js`: local workspace state, persistence, reset and import/export.

### Feature modules
- `assets/js/draft-room.js`: Draft UI and state interactions.
- `assets/js/tactical.js`: tactical board and persisted tactical state.
- `assets/js/vod-review.js`: local VOD review and timestamp notes.

### Product documentation
- `docs/PROJECT-EXECUTION-PLAN.md`: reconstruction roadmap and definition of done.
- `docs/recovery/LIVE-SITE-AUDIT-2026-09-14.md`: recovered public behavior and migration rules.
- `FROMBOS-CONTEXT.md`: shared context between ChatGPT accounts.
- `FROMBOS-STATUS.md`: live handoff status.
- `FROMBOS-DECISIONS.md`: durable decisions.
- `FROMBOS-CHANGELOG.md`: cross-account work history.

## 4. What is already correctly separated

### State
`store.js` is the current single persistence boundary. The state covers team, pools, training, draft, tactical and VOD domains.

### Data
`data.js` separates reusable catalogs and recovered content from runtime state.

### Presentation
The V2 branch does not need another V24-style global overlay as its next step. Visual consolidation should happen in the core CSS rather than through an additional generation-specific stylesheet.

### Provenance
The product already defines OFFICIAL, OBSERVED, CURATED, FROMBOS_STRUCTURAL, USER_PRIVATE and UNKNOWN as provenance classes. This must remain a domain contract, not merely a label in the UI.

## 5. Current gaps

### G1 — Canonical domain model is still implicit
State is stored as a broad nested object. We need explicit domain contracts for Team, Player, Champion, Composition, Draft, Series, Tactical Scenario, VOD Review, Training Item and Evidence.

### G2 — Router and module registry are coupled
`app.js` contains both route dispatch and page implementation. This is acceptable for the foundation but should evolve toward a route/module registry with stable module contracts.

### G3 — Many routes are placeholders
Champions, Matchups, Builds, Scouting, Reports and Competitive are registered but currently render a generic placeholder. They need real domain-backed modules in later phases.

### G4 — Cross-module event flow is incomplete
The intended loop exists conceptually, but most connections are still manual navigation. Draft, Team, Composition, Scouting, Tactical, VOD and Training need shared IDs/references and explicit handoff actions.

### G5 — Persistence is local-only
`localStorage` is useful for the current foundation but is not multi-device or multi-user synchronization. Backup/import is present; shared cloud workspace is a later architectural decision and must not be confused with GitHub code synchronization.

### G6 — Competitive data pipeline is not live
Sources are registered, but several are marked planned/recovery. The system must not imply live competitive statistics until an actual verified pipeline exists.

### G7 — Testing needs browser-level coverage
The foundation needs automated smoke tests for route loading, persistence, draft actions, tactical state and VOD notes on desktop and mobile.

## 6. Canonical target architecture

```text
FROMBOS CORE
├── App Shell / Router
├── Design System
├── Workspace Store
├── Domain Models
│   ├── Team / Player / Pool
│   ├── Champion
│   ├── Composition
│   ├── Draft / Series / Fearless
│   ├── Tactical Scenario
│   ├── VOD Review / Observation
│   ├── Training / Drill
│   └── Evidence / Source
├── Intelligence Services
│   ├── Draft reasoning
│   ├── Composition reasoning
│   ├── Matchup reasoning
│   ├── Scouting reasoning
│   └── Pattern → Training conversion
├── Feature Modules
│   ├── Command Center
│   ├── Team
│   ├── Compositions
│   ├── Draft
│   ├── Series
│   ├── Tactical
│   ├── VOD
│   ├── Champions
│   ├── Matchups
│   ├── Builds
│   ├── Scouting
│   ├── Training
│   ├── Reports
│   ├── Competitive
│   └── Data Center
└── Persistence / Import / Export / PWA
```

## 7. Migration rule

Do not delete the historical V15–V24 layers yet.

Instead:
1. identify a behavior worth preserving;
2. implement it in the V2 Core/module architecture;
3. test it;
4. document the migration;
5. retire the old implementation only after no required route depends on it.

This prevents visual or functional regressions caused by a premature cleanup.

## 8. Immediate implementation order

1. Core domain contracts and IDs.
2. Workspace store normalization/versioning.
3. Module registry + route contracts.
4. Shared design tokens and component primitives.
5. Team ↔ Composition ↔ Draft data flow.
6. Draft ↔ Series/Fearless state flow.
7. Tactical scenario persistence and reusable references.
8. VOD observation model → Training drill conversion.
9. Champion Intelligence as a shared domain entity.
10. Browser QA and release gate.

## 9. Explicit non-goals for this phase

- No blind merge of `rebuild/frombos-v2` into `rebuild/frombos-v2-next`.
- No new V25/V26 global CSS overlay.
- No fabricated competitive statistics.
- No replacement of the exact Wild Rift tactical map with a PC map.
- No destructive deletion of legacy modules before behavior migration.
- No claim that GitHub synchronizes local user workspace data; GitHub synchronizes project code/docs between workers.
