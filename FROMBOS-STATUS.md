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
- Wired Tactical Board save/create, map interaction and coach-plan changes to the cloud bridge through `assets/js/tactical-cloud-ui.js` without rewriting the validated board.
- VOD Review timestamp notes now create cloud tactical events when an active tactical scenario exists; native local video seeking remains intact.
- Service-worker cache bumped to include the tactical cloud integration assets.
- Plan × Execution playback controller remains the next UI integration surface.

## Tactical Board direction
The Tactical Board remains the tactical analysis surface, with scenarios, champion markers, wards, control wards, objectives, routes, zones, notes and coach plan. Cloud persistence is now connected around the existing board instead of replacing its validated Wild Rift map implementation.

## Current limitation
Cloud scenario persistence is wired at the UI boundary, but every transient pointer movement is intentionally not stored as a separate event. VOD notes become tactical events only when an active scenario exists. The richer Plan × Execution playback panel still needs to be mounted into the VOD/Tactical UI. No browser QA has been claimed yet.

## Next engineering priorities
1. Finish Playback Coach with Plan × Execution, tactical-event timeline and direct native-video seek.
2. Load cloud tactical events into the VOD/Tactical playback surface and keep map/VOD timestamps distinct.
3. Convert qualifying mistakes into Training Items with deterministic deduplication.
4. Add organization administration: members, roles, invitations and multi-team management.
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
