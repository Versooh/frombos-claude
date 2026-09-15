# FROMBOS — Live Status

_Last updated: 2026-09-15_

## Current branch
`rebuild/frombos-v2-next`

## Current HEAD
`90a3e2054b3b2dcaf4b0588523670462bef63fef`

## Product phase
**Phase 1 — Product Foundation → SaaS foundation.** Core state migration is underway and the first multi-tenant account boundary is now connected to the existing Supabase backend.

## Completed in the latest sequence
- Added `assets/js/core/store-adapter.js` as the new Core persistence boundary while preserving the legacy V2 store.
- Wired the main app shell, Team, Composition and Series surfaces to Core state where migration is safe.
- Added pinned Supabase JS `2.116.0` browser client integration in `assets/js/core/auth.js`.
- Added authenticated sign-in/sign-up flow.
- Added organization discovery and active-organization context.
- Added organization creation through the existing `create_organization_with_owner` RPC.
- Added auth/organization onboarding UI and responsive styling.
- Updated the PWA service-worker cache for the new auth/Core assets.
- Verified the connected Supabase project is `FROMBOS-RIFT` in `sa-east-1` and already contains organization, team, player, composition, series and draft persistence tables with organization-aware RLS policies.
- Verified the organization creation RPC is executable by `authenticated` and not by `anon`.

## Important product direction
FROMBOS is now being treated as a **multi-tenant SaaS product**, not only a local PWA.

Target model:

`Account → Organization → Teams → Seasons/Rosters → Competitive Workflow`

A user can belong to one or more organizations. An organization owns its teams and private competitive workspace. Team staff roles will control roster, strategy, scouting and administrative actions through database RLS.

## Current limitation
Authentication and organization selection are now real, but the migrated Core workspace is still local-first. Team/composition/draft data is not yet fully synchronized with the organization database from the new Core adapter.

That is intentional: cloud synchronization must be implemented against the existing RLS model rather than creating a second parallel database model.

## Next engineering priorities
1. Build the organization-aware Cloud Store adapter over the existing Supabase schema.
2. Load/create/select organization teams and active team seasons from the cloud.
3. Persist Team/Roster/Champion Pools to `teams`, `team_seasons`, `players` and `player_champion_pool`.
4. Persist Composition Lab to `team_compositions` + `team_composition_slots`.
5. Connect Draft/Series to `series_plans` + `draft_sessions` and existing draft event/branch structures.
6. Add organization administration: members, roles, invitations and team management.
7. Add cloud persistence for Tactical/VOD/Training and then retire local-only state paths progressively.
8. Deploy the SaaS build and perform authenticated browser QA against a non-production test organization before promoting to `main`.

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
