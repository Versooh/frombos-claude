# Champion assets

FROMBOS V20 resolves champion art locally from:

- `assets/champions/portrait/<slug>.webp`
- `assets/champions/hero/<slug>.webp`

## Policy

Only Wild Rift-specific assets may be placed here.

Do not silently fall back to League of Legends PC portraits. If a Wild Rift asset has not yet been recovered/verified, the UI intentionally falls back to the FROMBOS initials tile.

This prevents a visually polished screen from masking a cross-game data/asset mismatch.

## Naming

The canonical slugger lives in `assets/js/champion-visual.js`.

Examples:

- `Ahri` -> `ahri.webp`
- `Jarvan IV` -> `jarvan-iv.webp`
- `Kai'Sa` -> `kaisa.webp`
- `Nunu & Willump` -> `nunu-willump.webp`

## Recovery target

The saved `FROMBOS-RIFT-PREVIEW-0.9-COMPETITIVE-KNOWLEDGE.html` contains a large embedded image set and is the preferred recovery source when raw bytes become available. Official Wild Rift assets are the canonical external source for any missing art.
