# FROMBOS — Collaboration Changelog

## 2026-09-15

### Shared continuity layer
- Added `FROMBOS-CONTEXT.md` as the canonical project context for all ChatGPT workers.
- Added `FROMBOS-STATUS.md` as the live handoff/status document.
- Added `FROMBOS-DECISIONS.md` for durable architectural and product decisions.
- Added this changelog for cross-account handoff visibility.

### Audit findings
- Confirmed `rebuild/frombos-v2-next` as the active reconstruction branch for this work.
- Confirmed the branch is divergent from `rebuild/frombos-v2`; merge/rebase should be deliberate, not automatic.
- Confirmed V24 Tactical Editorial is the latest published visual generation in repository history and is presentation-only.
- Identified accumulated generation-specific CSS/JS layers as a consolidation target.

### Core foundation
- Added canonical Core schema/provenance contracts.
- Added canonical workspace state and V2 legacy migration.
- Added Core Store adapter.
- Wired Team, Composition and Series-facing state to the Core boundary without deleting the legacy store.

### SaaS / multi-tenant foundation
- Connected the static/PWA frontend to the existing `FROMBOS-RIFT` Supabase project using the publishable browser key and pinned `@supabase/supabase-js@2.116.0`.
- Added authenticated sign-in/sign-up boot flow.
- Added organization discovery and active organization selection.
- Added organization creation through the existing authenticated `create_organization_with_owner` RPC.
- Added responsive authentication and organization onboarding UI.
- Updated PWA caching for auth/Core assets.
- Verified the database already contains organization/team/season/player/composition/series/draft structures with organization-aware RLS policies.
- Verified the organization creation RPC is executable by `authenticated` and not `anon`.

### Organization cloud workspace
- Added `assets/js/core/cloud-store.js` as the Supabase organization-aware Cloud Store boundary.
- Boot now hydrates the active organization/team/season/roster/champion pools before importing the main application.
- Team Workspace can select the active cloud team.
- Team name, roster and champion pools sync to Supabase through an ordered save queue.
- First save can create the team's first season automatically.
- Normalized Wild Rift role values between Core and database (`DUO ↔ dragon`).
- Updated the service-worker cache to include the new cloud-store module.
- Kept the legacy local migration bridge gated so an already-hydrated cloud team is not overwritten by stale local state.

### Composition cloud workspace
- Added `assets/js/core/cloud-compositions.js` for organization/season-scoped Composition Lab persistence.
- Composition reads join `team_composition_slots` and reconstruct the Core lineup model.
- Composition writes create/update the parent row and synchronize its five role slots using the existing schema.
- Recovered compositions remain separate from organization-private cloud compositions.
- Updated the Composition Lab route to prefer cloud compositions when available.
- Updated the PWA cache for the new cloud Composition module.

### Series / Draft cloud foundation
- Added `assets/js/core/cloud-series.js` for organization/season-scoped `series_plans` and `draft_sessions` persistence.
- Boot hydrates cloud series plans and draft sessions into Core before the application loads.
- Draft session snapshots preserve actions, Fearless state, branches, game number, side, ruleset and sequence number.
- Verified the live Supabase columns and RLS policies for `series_plans` and `draft_sessions` before integration; no duplicate schema was created.
- Updated the PWA cache for the cloud Series/Draft module.

### Draft Room Core migration
- Moved Draft Room state authority from legacy `store.js` to `coreStore.state.ui.activeDraft`.
- Draft Room now consumes the Core team/roster instead of legacy team state.
- BAN/PICK, game switching, undo, reset, Fearless, ruleset and branches update Core first.
- Added an ordered cloud save queue so Draft actions persist into `draft_sessions.state_snapshot` and `last_sequence_no`.
- Cloud-hydrated drafts can seed the active Draft Room instead of creating an unrelated local draft.
- Kept `store.js` intact for the remaining legacy modules.

### Product direction
FROMBOS is explicitly being built as a multi-tenant SaaS:

`Account → Organization → Teams → Seasons/Rosters → Competitive Workflow`

Cloud is canonical for authenticated organization/team data; local Core remains an offline/cache layer during migration.

### Next
- Add organization member/role/invitation and multi-team administration.
- Decide whether collaborative Draft requires dedicated event/branch rows beyond the current JSON snapshot contract.
- Persist Tactical/VOD/Training to cloud and progressively retire local-only state.
- Add cloud-aware backup/import plus dirty-state/conflict handling.
- Run authenticated browser QA against a non-production organization before promoting to `main`.