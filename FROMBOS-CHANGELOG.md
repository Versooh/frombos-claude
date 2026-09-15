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

### Product direction
FROMBOS is now explicitly being built as a multi-tenant SaaS:

`Account → Organization → Teams → Seasons/Rosters → Competitive Workflow`

The next boundary is cloud synchronization: Team/Roster/Pools → Compositions → Series/Draft, followed by organization administration and then Tactical/VOD/Training persistence.

### Next
- Build the organization-aware Cloud Store adapter against the existing Supabase schema.
- Load/create/select teams and active seasons from the cloud.
- Persist roster and champion pools with existing RLS.
- Persist Composition Lab entities.
- Connect Draft/Series to existing cloud draft/session structures.
- Add organization member/role administration.
- Run authenticated browser QA before promoting to `main`.
