# FROMBOS — Live Status

_Last updated: 2026-09-15_

## Current branch
`rebuild/frombos-v2-next`

## Product phase
**Phase 1 — Product Foundation → SaaS foundation.** Authentication, organization context, Team/Roster, Composition Lab and the base Series/Draft cloud workflow are connected to the existing Supabase backend.

## Completed in the latest sequence
- Added `assets/js/core/cloud-series.js` for organization/season-scoped Series Plans and Draft Sessions.
- Verified the real Supabase columns and RLS policies for `series_plans` and `draft_sessions`; frontend relies on existing authorization policies.
- Boot hydrates cloud Series/Draft state before importing `app.js`.
- Draft Room no longer uses the legacy `store.js` as its state authority; active draft state now lives in Core.
- Draft Room loads the most recent hydrated Core draft when available.
- BAN/PICK actions update Core and persist to `draft_sessions.state_snapshot`.
- `last_sequence_no` tracks the number of recorded draft actions.
- Game switching, undo, reset, Fearless, ruleset changes and branches trigger the cloud save queue.
- Existing Draft Room UI/flow was preserved while moving its state boundary from legacy Store → Core → Supabase.
- PWA cache includes the cloud Series/Draft module.

## Product direction
FROMBOS is a **multi-tenant SaaS product**:

`Account → Organization → Teams → Seasons/Rosters → Competitive Workflow`

Cloud is canonical for authenticated organization/team data. Local Core remains an offline/cache layer during migration.

## Current limitation
Draft event/branch granularity is currently serialized into `draft_sessions.state_snapshot`; dedicated event/branch persistence can be added later without changing the Draft Room contract. Tactical, VOD and Training remain local-first.

## Next engineering priorities
1. Add organization administration: members, roles, invitations and multi-team management.
2. Add dedicated Draft event/branch persistence if collaborative draft editing requires it.
3. Persist Tactical/VOD/Training to cloud and remove remaining local-only paths progressively.
4. Add cloud-aware backup/import plus dirty-state/conflict handling.
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
