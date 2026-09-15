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

### Product direction
FROMBOS is now explicitly being built as a multi-tenant SaaS:

`Account → Organization → Teams → Seasons/Rosters → Competitive Workflow`

Cloud is canonical for authenticated organization/team data; local Core remains an offline/cache layer during migration.

### Next
- Persist Composition Lab entities to existing composition tables.
- Connect Draft/Series to existing series/draft/session structures.
- Add organization member/role/invitation and multi-team administration.
- Persist Tactical/VOD/Training to cloud and progressively retire local-only state.
- Add cloud-aware backup/import plus dirty-state/conflict handling.
- Run authenticated browser QA against a non-production organization before promoting to `main`.
