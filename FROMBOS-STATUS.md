# FROMBOS — Live Status

_Last updated: 2026-09-15_

## Current branch
`rebuild/frombos-v2-next`

## Current HEAD
`fe154d5356034b9ed8dc5c09a39b17ba77d08307`

## Product phase
**Phase 1 — Product Foundation**. P0 Core foundation is now underway.

## What was completed in this work
- Audited the V2 entry point and module structure.
- Confirmed `app.js` as the current shell/router composition point.
- Confirmed `data.js` as the current static catalog/provenance registry.
- Confirmed `store.js` as the current V2 local persistence boundary.
- Added `assets/js/core/schema.js` with canonical entity/provenance contracts.
- Added `assets/js/core/workspace.js` with canonical workspace state, import/export and legacy V2 migration.
- Added `docs/CORE-MIGRATION-MAP.md` mapping existing modules into Core.
- Preserved the old V2 store for compatibility; it has not been deleted or replaced yet.

## Current architecture finding
The V2 foundation is intentionally small enough to consolidate safely. The main architectural gap is not the number of screens; it is that module state is still centered around the legacy V2 store and modules do not yet share canonical domain entities.

## Next engineering priorities
1. Build a Core Store adapter around `core/workspace.js`.
2. Migrate Team and Composition first because they are low-risk producers of shared entities.
3. Migrate Draft/Series next so drafts reference canonical team, champion and composition entities.
4. Migrate Tactical and VOD annotations.
5. Link VOD annotations → Training items.
6. Implement Champion/Matchup/Build/Scouting/Competitive domains on the same evidence model.
7. Add browser QA before retiring legacy state paths.

## Do not do yet
- Do not modify `main` experimentally.
- Do not delete `assets/js/store.js` yet.
- Do not add another global CSS generation as a substitute for architecture work.
- Do not fabricate current competitive statistics.
- Do not replace validated Wild Rift map geometry.

## Handoff protocol
The next worker must read `FROMBOS-CONTEXT.md`, this file, `FROMBOS-DECISIONS.md` and `docs/CORE-MIGRATION-MAP.md` before editing. Update this file and `FROMBOS-CHANGELOG.md` after meaningful changes, including tests and known risks.
