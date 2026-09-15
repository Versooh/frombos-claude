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
- BAN/PICK actions update Core and persist to `draft_sessions.state_snapshot`.
- Added Tactical Pro enhancement layer without replacing the validated Wild Rift map implementation.
- Tactical Board has execution timeline, coach-defined tactical markers, grid, measurement, framing, visual-layer control and SVG snapshot export.
- Added Supabase `tactical_scenarios` and `tactical_events` with organization-scoped RLS.
- Added `assets/js/core/cloud-tactical.js` for scenario/event persistence and authenticated boot hydration.
- Added `assets/js/core/tactical-cloud-bridge.js` so UI modules can persist tactical state without coupling directly to Supabase.
- Tactical events support both map timestamp and a separate VOD timestamp reference.
- Plan × Execution playback controller exists as an integration layer.

## Tactical Board direction
The Tactical Board remains the tactical analysis surface, with scenarios, champion markers, wards, control wards, objectives, routes, zones, notes and coach plan. Cloud persistence is now available at the Core boundary while the existing board UI remains protected from a large rewrite.

## Current limitation
The cloud model and hydration are implemented, but the existing `tactical.js` UI has not yet been fully rewired to persist every scenario/annotation automatically. The VOD seek bridge also requires integration with the actual VOD player lifecycle. No browser QA has been claimed yet.

## Next engineering priorities
1. Wire Tactical Board scenario save/create and coach-plan changes to the cloud bridge.
2. Persist meaningful tactical events/markers without storing every transient pointer movement.
3. Connect Tactical Board timestamps to VOD Review and support direct seek when a native video element is available.
4. Finish Playback Coach with Plan × Execution and map snapshots.
5. Convert qualifying mistakes into Training Items without duplicates.
6. Add organization administration: members, roles, invitations and multi-team management.
7. Deploy the SaaS build and perform authenticated browser QA against a non-production test organization before promoting to `main`.

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
