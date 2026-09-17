# FROMBOS RIFT V24.1 — Screen Polish

Visual-only refinement built on top of V24 Tactical Editorial.

## Scope

- Champion Intelligence / Guide: denser visual registry, large official champion splash, improved portrait hierarchy, evidence rail and responsive guide layout.
- Draft Room: light tournament layout, overflow-safe pick/ban labels, denser sequence, larger champion browser and clearer pool/Fearless states.
- Composition Intelligence: five-role visual lineup, dossier sections and flatter evidence-first presentation.
- Scouting War Room: fully light opponent dossier, clearer metrics/evidence/signal hierarchy and compact validation queue.
- Tactical Board: exact Wild Rift map preserved; surrounding toolbar, panels, selectors and board frame repolished for light editorial use.
- Mobile/tablet: dedicated 1380 / 1120 / 820 / 520 breakpoints and reduced-motion support.

## Data safety

No competitive data, store state, pick/ban state, map geometry, evidence provenance or observed statistics are changed by V24.1.

## Runtime

`visual-v24-tactical-editorial.js` imports `screen-polish-v24-1.js`. The V24.1 controller loads `screen-polish-v24-1.css?v=24.1` and applies presentation semantics only.
