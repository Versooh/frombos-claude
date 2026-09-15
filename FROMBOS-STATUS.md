# FROMBOS — Live Status

_Last updated: 2026-09-15_

## Current branch
`rebuild/frombos-v2-next`

## Product phase
**Phase 1 — Product Foundation → SaaS foundation.** Authentication, organization context, Team/Roster cloud persistence and the first Composition Lab cloud path are connected to the existing Supabase backend.

## Completed in the latest sequence
- Added `assets/js/core/cloud-store.js` as the organization-aware cloud persistence adapter.
- Cloud reads load the active organization team, active season, roster and champion pools before `app.js` boots.
- Team Workspace supports organization-scoped team selection and queued cloud persistence.
- Core/database role mapping is explicit: `BARON/JUNGLE/MID/DUO/SUPPORT` ↔ `baron/jungle/mid/dragon/support`.
- Added `assets/js/core/cloud-compositions.js` for organization-scoped Composition Lab persistence.
- Composition Lab reads private compositions from `team_compositions` + `team_composition_slots` and keeps recovered public/curated compositions separate.
- Composition slot writes use the database's five role values and replace slots transactionally at the application flow level.
- Updated PWA cache to include the cloud Composition module.
- Verified the real database columns for compositions, series plans and draft sessions before integrating them; no parallel schema was created.

## Product direction
FROMBOS is a **multi-tenant SaaS product**:

`Account → Organization → Teams → Seasons/Rosters → Competitive Workflow`

Cloud is canonical for authenticated organization/team data. Local Core remains an offline/cache layer during migration.

## Current limitation
Series/Draft, Tactical, VOD and Training are not yet fully cloud-persisted. Their Core state can still be local while migration proceeds module by module.

## Next engineering priorities
1. Connect Draft/Series to `series_plans` + `draft_sessions` and existing draft event/branch structures.
2. Add organization administration: members, roles, invitations and multi-team management.
3. Persist Tactical/VOD/Training and remove remaining local-only paths progressively.
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
