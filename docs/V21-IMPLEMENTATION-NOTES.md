# V21 Implementation Notes

Primary visual ownership:
- `assets/css/visual-v21-rebuild.css`
- `assets/js/visual-v21-shell.js`

Integration:
- V21 CSS loads after V20 rendering/performance layers.
- V21 JS loads after the shared V20 runtime.
- PWA cache version advances to V21.
- V20 functionality remains intact under the new presentation layer.
