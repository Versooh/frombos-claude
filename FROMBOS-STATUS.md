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
- Added Tactical Pro enhancement layer without replacing the validated Wild Rift map implementation.
- Tactical Board now has an execution timeline with 15-second granularity and coach-defined tactical markers.
- Added map grid toggle for spacing/route analysis.
- Added point-to-point map measurement tool.
- Added board framing/reset control.
- Added non-destructive visual-layer hide/show control.
- Added SVG snapshot export for sharing tactical boards without altering the source scenario.
- Added Tactical Pro visual badge and responsive enhancement styling.
- PWA cache includes Tactical Pro assets.

## Tactical Board direction
The Tactical Board remains the tactical analysis surface, with scenarios, champion markers, wards, control wards, objectives, routes, zones, notes and coach plan. The new enhancement layer adds execution-oriented tooling without duplicating or replacing the underlying tactical state model.

## Current limitation
Tactical timeline markers and measurement overlays are currently session/UI enhancements and are not yet persisted as first-class cloud annotations. Tactical scenarios themselves remain local-first until the Tactical/VOD persistence migration.

## Next engineering priorities
1. Persist Tactical scenarios, timeline markers and annotations to Supabase with organization/season RLS.
2. Connect Tactical Board timestamps to VOD Review so a tactical marker can open the corresponding video moment.
3. Add organization administration: members, roles, invitations and multi-team management.
4. Persist VOD/Training and connect annotation → drill workflows.
5. Add cloud-aware backup/import plus dirty-state/conflict handling.
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
