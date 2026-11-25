# Nightshift — concept site

A portfolio concept for **Nightshift**, a fictional platform for queues, jobs, crons and retries. Static HTML/CSS/JS, no build step, relative paths, ready for the root of a GitHub Pages subdomain (`nightshift.wolfbc.art`).

## Pages
- `index.html`: home. Hero with a scripted product tour, five chapters (Enqueue, Schedule, Retry, Observe, Scale), testimonials and a posts marquee, a split-flap stats board, the loading-dock call to action, and the footer.
- `pricing/index.html`: plans, unit prices, usage calculator, comparison table, FAQ, call to action.
- `features/index.html`: four capability groups, each with its own scene and a divided list, a scroll-spy sub-nav, and SDK code samples (copy button, JavaScript/Python tabs).
- `404.html`: "This job never made it to the dock." GitHub Pages serves it at any missing URL, so every local path in it starts at the site root (`/css/site.css`, `/pricing/`…).
- No legal pages. The footer's Legal items are buttons that open a short concept notice (no cookies, no analytics, fonts from Fontshare and Google Fonts).

## Fonts
- Erode 400/500 (headings) and Satoshi 400/500/700 (body and UI), from Fontshare.
- JetBrains Mono 400/500 (logs, code, board), from Google Fonts.
- All load with `display=swap`.

## Libraries
None. All behaviour is in `js/site.js` (shared) and `js/pages.js` (inner pages), written in vanilla JS.

## Reproduced from the reference (structure and behaviour only)
- **Layout:** 1160 px container on a 12-column grid (67.33 px columns, 32 px gutters). Panels sit 16 px from the edge with a 16 px radius and an inset ring. Section order and vertical rhythm follow the reference.
- **Header:** 72 px sticky opaque bar with three mega menus (Product, Developers, Company; a 540 px bento of one 252 px tile plus three stacked tiles) and a plain Pricing link, as the brief sets it. On mobile it becomes a full-screen overlay with accordions.
- **Hero:** inset panel with a full-bleed illustration. A 1064×757 product frame plays a ~30 s tour in five chapters (5.2 / 5.9 / 5.6 / 8.0 / 5.1 s), driven by a tab bar with progress fill that overlaps the frame by 24 px. On load the frame rises and the chapter bar lands (copy stays still). A 6×2 logo grid sits below. On phones the frame is hidden and the grid drops to 2 columns.
- **Chapters:** they alternate tinted panels and open bands. Column 1 holds a conveyor rail with a roller station and a travelling parcel driven by scroll (CSS `animation-timeline: view()`, with a JS fallback). Each chapter has a pill, a two-line serif H2, a lead with an underlined inline link, a large visual, three features and an "Instead of" row.
- **Trust section:** three story cards with an inner frame at 8 px, then a 120 s marquee (posts duplicated once, hidden from assistive tech, for a seamless loop) that pauses on hover, when off-screen, and with its own button.
- **Stats board:** split-flap board (31 columns at desktop, two-line layout on smaller screens) that flips 300 ms per character with a stagger.
- **Closing scene:** opens on entry: 1 s `cubic-bezier(.215,.61,.355,1)`, 700 ms content fade, glow fades in after 1.1 s, then rotates over 40 s.
- **Footer:** 1-bit dithered brand word, two promo cards, six link columns, a status pill and the legal line.
- **Type scale:** serif 54/36/40 with negative tracking, sans 20/18/16/14/13. Radii step through 4/6/8/10/12/16/28.

## Original to Nightshift
- **Identity:** name, crescent-moon logo (own SVG), amber "sodium lamp" palette (no violet, purple or pink, avatars included), fonts, all copy (from `COPY.md`), the 12 fictional customer wordmarks, testimonials, posts and demo numbers.
- **Metaphor:** the night-shift factory replaces the reference's train journey. The travelling object is a kraft parcel (tape, barcode label, a tag in the chapter colour) riding a conveyor carriage, seen from the side; the rail is a belt with cleats and the stations are rollers. The ending is a loading-dock shutter rolling up on a lit warehouse with racking and parcels.
- **Product UI:** all of it is Nightshift's own, in HTML/SVG: queues list, command palette, job form, schedule card with a clock, retry attempts with backoff, run search with an alert, and scaling with a pixel-art night crew (hard hats with lamps, hi-vis vests, each worker carrying a parcel).
- **Honesty labels:** every invented figure is marked where it appears: "Demo data" chips in the product frames, "Demo numbers…" under the stats headline, "Fictional customers, quotes and posts…" in the trust section, "Illustrative day" on the pricing chart, and the footer legal line.

## Images
- **Used from `assets/`:** `hero-night.webp` (plus 640 and 1024 px copies), `hero-strip.webp` (plus a 1408 px copy, masked in so it has no hard edge), `texture-skyline.webp`.
- **Built in code instead of images:**
  - CSS/SVG: product UI, chapter scenes (queue conveyor, cron clock, retry gate, night crew, dashboard), parcel, customer wordmarks, avatars (initials), dock wall, shutter, racking and floor, 404 scene, icons, favicon.
  - Canvas: the footer's dithered brand word, drawn with a 4×4 Bayer pattern (no WebGL); on phones it is drawn at the box's own size so the whole word fits.
- **Social preview:** `og.jpg` (1200×630) is a crop of the hero illustration; `og:image` uses the absolute URL, with `og:url` and `twitter:card`.

## Accessibility and motion
- **Structure:** one `h1` per page, headings in order, a skip link, visible amber focus rings that follow each element's radius, `scroll-padding-top` under the sticky bar, `aria-expanded` on menus, accordions and the Legal buttons, and an ARIA tablist with arrow-key support for the tour.
- **Targets and contrast:** interactive targets are at least 44 px at 320–390 px; text meets AA.
- **Reduced motion:** with `prefers-reduced-motion`, the tour shows each chapter's final frame, the marquee stops (no clones), the dock is shown open and scenes are static. Decorative loops (belt, roller, lamp) stop after a few cycles.
- **Width:** no sideways scroll from 320 px up.

## Not built
The reference's `/agents` and `/new` screens, and its legal pages, have no Nightshift copy in `COPY.md`, so they were left out on purpose.
