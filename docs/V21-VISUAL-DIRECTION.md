# FROMBOS V21 — Visual Direction

## Objective
Replace the inherited V2/V20 shell with an esports-grade competitive workspace while preserving the validated V20 engine, evidence model, Wild Rift-only policy and local workspace behavior.

## Reference principles
- Champion knowledge architecture: champion-first navigation with build, matchup and strategy paths kept close together.
- Competitive draft presentation: strong blue/red team separation, broadcast-like hierarchy, visible series/Fearless context and fast champion scanning.
- Tactical workspace: high-density information without generic SaaS cards or dashboard chrome.
- FROMBOS identity: near-black tactical canvas, cyan interaction light, controlled violet depth, gold decision emphasis, red ban/danger states.

## V21.0 scope
- New global shell skin and spatial hierarchy.
- Rebuilt sidebar/brand/topbar treatment.
- Cinematic Command Center hero and operational KPIs.
- Route command strip using only existing local workspace state.
- Composition Lab visual rebuild.
- Champion Intelligence visual rebuild.
- Draft Room visual rebuild.
- Tactical/VOD shell alignment.
- Mobile/safe-area ownership.
- No competitive data changes.
- No evidence reclassification.
- No new network calls.
- No League PC assets or fallbacks.

## Architecture
V21 loads after all V20 visual layers and owns the final visual cascade through `assets/css/visual-v21-rebuild.css`. `assets/js/visual-v21-shell.js` only enhances presentation and reads existing workspace state. It does not call `store.update`, does not perform network requests and does not mutate public evidence provenance.
