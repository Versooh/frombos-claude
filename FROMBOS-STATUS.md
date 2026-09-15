# FROMBOS — Live Status

_Last updated: 2026-09-15_

## Current branch
`rebuild/frombos-v2-next`

## Product phase
**Phase 1 — Product Foundation → SaaS foundation.** Authentication, organization context and the first real organization-scoped Team/Roster cloud path are connected to the existing Supabase backend.

## Completed in the latest sequence
- Added `assets/js/core/cloud-store.js` as the organization-aware cloud persistence adapter.
- Cloud reads now load the active organization team, active season, roster and champion pools before `app.js` boots.
- Team Workspace now supports organization-scoped team selection.
- Team name, roster and champion-pool changes are queued into Supabase automatically, with an explicit `Salvar na organização` action as well.
- First save can create the organization's first team and its default current-year season through the existing RLS-protected tables.
- Corrected the Core/database role boundary: `BARON/JUNGLE/MID/DUO/SUPPORT` maps to `baron/jungle/mid/dragon/support` in Supabase.
- Updated the PWA service-worker cache to include `cloud-store.js` and invalidate the previous auth-only cache.
- Verified the real database schema and RLS policies for `teams`, `team_seasons`, `players`, `player_champion_pool`, `team_compositions`, `team_composition_slots`, `series_plans`, `draft_sessions` and `organization_members`.
- Verified `create_organization_with_owner(text,text)` returns a UUID and is exposed only to `authenticated`.

## Important product direction
FROMBOS is being built as a **multi-tenant SaaS product**:

`Account → Organization → Teams → Seasons/Rosters → Competitive Workflow`

Cloud is canonical for authenticated organization/team data. Local Core remains an offline/cache layer during migration.

## Current limitation
Composition, Series/Draft, Tactical, VOD and Training are not yet fully cloud-persisted. Their Core state can still be local while the migration proceeds module by module.

The legacy `store.js` bridge remains intentionally active only before a cloud team has been hydrated, preventing stale local state from silently overwriting an existing organization team.

## Next engineering priorities
1. Persist Composition Lab to `team_compositions` + `team_composition_slots`.
2. Connect Draft/Series to `series_plans` + `draft_sessions` and existing draft event/branch structures.
3. Add organization administration: members, roles, invitations and multi-team management.
4. Persist Tactical/VOD/Training and remove their remaining local-only paths progressively.
5. Add cloud-aware backup/import and conflict/dirty-state handling.
6. Deploy the SaaS build and perform authenticated browser QA against a non-production test organization before promoting to `main`.

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
