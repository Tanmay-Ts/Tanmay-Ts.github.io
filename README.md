# Tanmay Surte — Portfolio

Personal portfolio at **https://tanmay-ts.github.io/**.

A retro desktop portfolio built around an illustrated pixel workspace, functioning app windows, self-hosted fonts, project notes, verified open-source contributions, and a downloadable résumé. No build step or third-party runtime JavaScript is required.

## Preview

Serve this directory with any static HTTP server, such as `python -m http.server 4173`, then visit `http://localhost:4173`.

## Update

- Main content: [index.html](index.html)
- Window design and responsive layouts: [desktop.css](desktop.css)
- Start menu, app windows, filters, keyboard interactions, and preferences: [desktop.js](desktop.js)
- Verified project and contribution content: [desktop-data.js](desktop-data.js)
- Localized hair, cloud, and city-light animation: [room-motion.js](room-motion.js)
- Workspace artwork and generation details: [assets/ARTWORK.md](assets/ARTWORK.md)
- Résumé: [assets/Tanmay-Surte-Resume.pdf](assets/Tanmay-Surte-Resume.pdf)

GitHub Pages publishes from the root of `main`. Push to `main` to update the site. Open-source PR statuses were verified on 22 October 2026; update the date when rechecking them.

The room is decorative pixel artwork adapted from the user's chosen reference. Text and controls are real HTML. Metrics are scoped to the linked evaluations; ongoing research and draft/open contributions are labeled accordingly. Private memory archives are not included.

## Fonts

Bungee, Pixelify Sans, VT323, and IBM Plex Mono are self-hosted under their respective SIL Open Font Licenses; license texts are included in [assets/fonts](assets/fonts).

## Accessibility

The site supports keyboard navigation, native modal dialogs with focus restoration, visible focus states, an explicit motion pause control, and OS reduced-motion preferences. Main project links, email, and the résumé remain available without JavaScript. Contact opens the visitor's email application.

Room animation uses a single WebGL canvas capped at 24 FPS and 1.5 device-pixel ratio. It pauses when offscreen or hidden and falls back to the original image without WebGL. The masks are calibrated to the 1536 × 1024 workspace asset; replacing it with a differently sized image automatically disables the effect.
