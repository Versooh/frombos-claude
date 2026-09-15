# FROMBOS — Architectural & Product Decisions

## D001 — GitHub is the shared memory layer
**Status:** accepted

The repository is the canonical handoff layer between different ChatGPT accounts. Conversations are not assumed to synchronize with each other.

## D002 — `main` stays stable
**Status:** accepted

Production/public behavior remains on `main`. Reconstruction and experiments use rebuild/feature branches and are promoted only after QA and release review.

## D003 — FROMBOS is one integrated competitive workflow
**Status:** accepted

FROMBOS is not a collection of disconnected calculators. Team setup, champion pools, compositions, Draft, Series/Fearless, Tactical Board, VOD Review, Scouting and Training must share context.

## D004 — Evidence provenance is mandatory
**Status:** accepted

Facts and recommendations must preserve provenance. The product must distinguish OFFICIAL, OBSERVED, CURATED, FROMBOS_STRUCTURAL, USER_PRIVATE and UNKNOWN.

## D005 — Exact Wild Rift map geometry is protected
**Status:** accepted

Tactical functionality must use validated Wild Rift map geometry. A generic League PC map cannot silently replace it.

## D006 — Consolidate before adding more overlays
**Status:** accepted

The project has accumulated many generation-specific CSS/JS layers. New work should prefer refactoring into a Core architecture instead of stacking another global visual patch.

## D007 — VOD Review feeds Training
**Status:** accepted

A VOD observation should be capable of becoming a timestamped coaching note, pattern, mistake/strength classification, drill or training objective.

## D008 — Champion is a central domain entity
**Status:** accepted

Champion intelligence must be reusable across pools, matchups, builds, compositions, Draft, scouting and VOD analysis.

## D009 — No fake competitive data
**Status:** accepted

Missing data is represented as unknown or unavailable. Curated coaching hypotheses must never be presented as measured competitive statistics.

## D010 — Two-account collaboration protocol
**Status:** accepted

Concurrent workers use feature branches. Before editing, read `FROMBOS-CONTEXT.md`, `FROMBOS-STATUS.md`, recent commits and relevant decisions. After editing, commit clearly and update status/changelog.
