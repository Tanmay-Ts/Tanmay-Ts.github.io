# Pixel Dollhouse artwork

Created with the built-in ImageGen tool from the user's approved **Pixel Dollhouse** concept and supplied chibi character reference. These are fictional illustrations of a routine, not photographs or live tracking.

## Production files

- [home.png](home.png): golden-hour apartment, 1536×1024.
- [home-day.png](home-day.png): matching daylight apartment, 1536×1024.
- [home-night.png](home-night.png): matching night apartment, 1536×1024.
- [gym.png](gym.png): nighttime isometric training gym, 1536×1024.
- [character-atlas.png](character-atlas.png): transparent 1254×1254 character atlas with twelve poses.
- [atlas-frames.json](atlas-frames.json): measured frame bounds and shared ground registration. Generated poses are not evenly spaced; the renderer uses these measurements instead of assuming a grid.

The original generated PNGs are retained unchanged. Runtime canvas rendering clears nearly transparent stray pixels, clips a neighboring fragment out of the kick crop, preserves common pixel scale, and aligns feet to a shared ground point.

## Generation prompt set

### Apartment

Production asset for an interactive pixel dollhouse website. Take only the main isometric cutaway apartment artwork from the approved concept and expand it to a standalone landscape 1536×1024 image. No webpage, interface, panels, titles, words, characters, people, cats, animals, speech bubbles, thumbnails or white presentation margins. Preserve the cozy connected floor plan: bedroom rear-left with a navy bed; study desk and computer rear-right beside a Navi Mumbai skyline window; green sofa and low coffee table front-center/left; reading bookcases, plants, lamps, wooden floors, doorway and gym bag front-right. Remove the seated character and cat. Leave visible staging spaces for an independent sprite on the sofa, bed, near the desk and doorway. Complete room without clipped furniture, dark navy exterior void, no large unused borders. Rich detailed crisp handcrafted pixel art matching the concept, not smooth vector art or photorealism.

### Gym

Standalone landscape 1536×1024 isometric cutaway MMA gym using the same pixel art, camera angle, visual scale, shadows and palette as the apartment. Dark navy exterior void, entire gym in frame. No interface, people, characters, cats, text labels, speech bubbles or thumbnails. Spacious central mat area for the independent animated character; black/red hanging punching bag right of the mat; rear wall gloves, left bench and gym bag, water bottle, towels, dumbbells and stored pads. Rear windows show deep blue Mumbai skyline at 20:30 with warm city lights. Warm amber lamps, cool exterior, readable equipment. Keep the lower-middle and middle-right mat clear for boxing. No slogans or typography.

### Character atlas

Transparent character animation atlas using the supplied reference identity: medium warm brown skin, messy black hair, large dark eyes, charcoal hoodie over a pale shirt, black trousers and light sneakers. Crisp outlined chibi pixel art, consistent size and slightly elevated three-quarter view. Four columns and three rows were requested with no labels, grid, checkerboard or painted background. The twelve row-major poses: front-facing stop reaction with raised palm; cross-legged laptop typing A; same laptop pose typing B; open-book reading A; page-turn reading B; seated controller/headphones; waking stretch; gym backpack preparation; MMA guard in shorts/gloves; rightward punch; rightward kick; side-sleeping with pillow/navy blanket. All figures fully inside their regions, paired poses aligned, true transparency essential. The generated result required measured frame registration, documented above.

### Day and night variants

Lighting-only edits referencing the generated apartment. Lock camera, perspective, all room/furniture geometry, object count and positions, pixel-art style, backdrop and 1536×1024 framing. Prohibit new people, animals, text, UI, logos and furniture. Day: blue midday sky and soft clouds, neutral natural daylight, no orange horizon sun, subdued lamp emission. Night: blue-black sky with stars and a small moon, no sun, glowing city windows, warm existing lamps and laptop light, readable cool ambient shadows. No programmatic repainting of the artwork was used.
