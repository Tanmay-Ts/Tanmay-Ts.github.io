# Tanmay Surte — Portfolio

Personal portfolio at **https://tanmay-ts.github.io/**.

A Pixel Dollhouse portfolio with an illustrated apartment, a separate gym, a time-driven character, functioning app windows, verified projects and contributions, and a downloadable résumé. No build step or third-party runtime JavaScript is required.

## Preview

Serve this directory with any static HTTP server, such as `python -m http.server 4173`, then visit `http://localhost:4173`.

## Update

- Main content: [index.html](index.html)
- Dollhouse layout, scene presentation, and responsive sizing: [dollhouse.css](dollhouse.css)
- Shared portfolio dialog styles: [desktop.css](desktop.css)
- App windows, filters, keyboard interactions, and preferences: [portfolio-apps.js](portfolio-apps.js)
- Verified project and contribution content: [desktop-data.js](desktop-data.js)
- IST schedule, activity animation, time previews, and character reactions: [dollhouse-life.js](dollhouse-life.js)
- Transparent sprite rendering and measured frames: [atlas-renderer.js](atlas-renderer.js), [atlas-frames.json](assets/dollhouse/atlas-frames.json)
- Artwork and generation details: [assets/dollhouse/ARTWORK.md](assets/dollhouse/ARTWORK.md)
- Résumé: [assets/Tanmay-Surte-Resume.pdf](assets/Tanmay-Surte-Resume.pdf)

GitHub Pages publishes from the root of `main`. Push to `main` to update the site. Open-source PR statuses were verified on 22 October 2026; update the date when rechecking them.

The room and character are decorative pixel artwork adapted from the approved Pixel Dollhouse concept. Text and controls are real HTML. The character follows a scheduled illustration of a routine, not live personal tracking. Metrics are scoped to the linked evaluations; ongoing research and draft/open contributions are labeled accordingly. Private memory archives are not included.

## Fonts

Bungee, Pixelify Sans, VT323, and IBM Plex Mono are self-hosted under their respective SIL Open Font Licenses; license texts are included in [assets/fonts](assets/fonts).

## Accessibility

The whole portfolio fits one viewport without page scrolling. Long project and about content scrolls inside its window while the dollhouse remains fixed.

The site supports keyboard navigation, native modal dialogs with focus restoration, visible focus states, an explicit motion pause control, and OS reduced-motion preferences. Main project links, email, and the résumé remain available without JavaScript. Contact opens the visitor's email application.

The character uses twelve measured transparent sprites rendered to a small cached canvas. Frame changes stop with reduced motion, the pause control, hidden tabs, or an open app window. The hover/tap/keyboard reaction remains usable with reduced motion.

## Daily routine

The schedule always uses `Asia/Kolkata`, independently of the visitor's timezone:

| IST | Activity |
| --- | --- |
| 00:00–06:30 | Laptop work |
| 06:30–13:00 | Sleep |
| 13:00–14:00 | Wake up and lunch |
| 14:00–17:00 | Reading and work, alternating every 30 minutes |
| 17:00–19:00 | Unwind |
| 19:00–20:00 | Prepare for MMA |
| 20:00–22:00 | MMA training |
| 22:00–00:00 | Chill after training |

Visitors can select activities, click room zones, or move the time slider. **Follow IST** restores the scheduled scene. The real clock remains live during previews. Desktop hover, mobile tap, or keyboard activation makes the character face the visitor and say “Hey, don't do that!” for 2.8 seconds before returning to the activity.
