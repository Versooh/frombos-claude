# FROMBOS — Live Status

_Last updated: 2026-09-15_

## Current branch
`rebuild/frombos-v2-next`

## Product phase
**Phase 1 — Product Foundation → SaaS foundation.** Authentication, organization context, Team/Roster, Composition Lab and the Series/Draft cloud persistence path are connected to the existing Supabase backend.

## Completed in the latest sequence
- Added `assets/js/core/cloud-store.js` for organization-scoped Team/Roster persistence.
- Added `assets/js/core/cloud-compositions.js` for organization/season-scoped Composition Lab persistence.
- Added `assets/js/core/cloud-series.js` for Series Plans and Draft Sessions.
- `series_plans` now maps to the Core series model with opponent, format, Fearless mode and ruleset.
- `draft_sessions` now maps to Core drafts with game number, side, Fearless, ruleset, sequence number and JSON state snapshot.
- Boot hydrates cloud Series/Draft state before importing `app.js`.
- PWA cache now includes the cloud Series/Draft module.
- Verified the real Supabase columns for `series_plans` and `draft_sessions` before integrating; no parallel schema was created.

## Product direction
FROMBOS is a **multi-tenant SaaS product**:

`Account → Organization → Teams → Seasons/Rosters → Competitive Workflow`

Cloud is canonical for authenticated organization/team data. Local Core remains an offline/cache layer during migration.

## Current limitation
Tactical, VOD and Training are not yet fully cloud-persisted. Draft event/branch granularity will be connected after the base Draft Session persistence is stable.

## Next engineering priorities
1. Connect Draft Room actions to `draft_sessions.state_snapshot` and `last_sequence_no` with cloud-safe save/load.
2. Add organization administration: members, roles, invitations and multi-team management.
3. Persist Tactical/VOD/Training to cloud and remove remaining local-only paths progressively.
4. Add cloud-aware backup/import and conflict/dirty-state handling.
5. Deploy the SaaS build and perform authenticated browser QA against a non-production test organization before promoting to `main`.

## Security rules
- Never expose a Supabase service-role key in the browser.
- Keep organization authorization in database RLS, not editable browser metadata.
- Do not trust user metadata for authorization decisions.
- Do not weaken existing organization/team policies just to simplify frontend CRUD.
- Keep public competitive knowledge separated from organization-private data.

## Do not do yet
- Do not modify `main` experimentally.
- Do not delete `assets/js/store.js` yet.
- Do not create a second organization/team schema when the existing Supabase model already covers the domain.
- Do not fabricate current competitive statistics.
- Do not replace validated Wild Rift map geometry.

## Handoff protocol
The next worker must read `FROMBOS-CONTEXT.md`, this file, `FROMBOS-DECISIONS.md` and `docs/CORE-MIGRATION-MAP.md` before editing. Update this file and `FROMBOS-CHANGELOG.md` after meaningful changes, including tests and known risks.
