# FROMBOS — Live Status

_Last updated: 2026-09-15_

## Current branch
`rebuild/frombos-v2-next`

## Current HEAD
`aa7872845beaffbf6f68cbfc3a2db60c28e16418`

## Product phase
**Phase 1 — Product Foundation** is the active reconstruction phase, with the existing branch already containing the foundation modules and a large amount of recovered/legacy functionality.

## Important current finding
The repository contains many successive visual generations (V15 through V24 and multiple feature-specific layers). The next major engineering direction should be **consolidation**, not another independent visual overlay.

The target architecture is a FROMBOS Core in which navigation, state, design tokens, domain models and module contracts are centralized.

## Existing work to preserve
- Team and player pools
- Composition workflows
- Draft workflows
- Tactical preparation
- VOD Review
- Training workflows
- Competitive context
- Source/provenance concepts
- Import/export and persistence
- PWA behavior
- Responsive layouts
- Exact-map safety rules

## Current visual state
V24 Tactical Editorial is the latest published visual layer in the repository history. It is explicitly presentation-only and includes safeguards against rewriting competitive data, draft state and map geometry.

## Branch warning
`rebuild/frombos-v2-next` is currently diverged from `rebuild/frombos-v2` (4 commits ahead and 36 behind at the time of the 2026-09-15 audit). Do not merge these branches blindly. Establish the intended base before attempting consolidation.

## Next engineering priorities
1. Establish a single FROMBOS Core architecture.
2. Define canonical application state and domain contracts.
3. Consolidate navigation and design tokens.
4. Map every current module to the Core architecture.
5. Remove/retire redundant visual and feature layers only after behavior is covered by tests.
6. Connect Draft ↔ Team ↔ Composition ↔ Scouting ↔ Tactical ↔ VOD ↔ Training.
7. Strengthen persistence, import/export and offline/PWA behavior.
8. Add browser QA for desktop and mobile before release.

## Do not do yet
- Do not modify `main` as an experimental workspace.
- Do not replace the real Wild Rift tactical map with a generic map.
- Do not fabricate competitive statistics.
- Do not add another global CSS layer without documenting why consolidation cannot solve the problem.
- Do not delete legacy modules until their required behavior is mapped and covered.

## Handoff
The last worker must update this file with:
- current branch
- current HEAD
- what changed
- what remains
- tests/QA performed
- known risks
