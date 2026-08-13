# Bride & Groom — Wedding Invitation Website

A luxurious, single-page wedding invitation site with a **lace-trimmed envelope intro**: a real envelope graphic with a scalloped lace edge and a gold wax seal opens on tap, revealing a formal invitation, countdown, and RSVP flow underneath — all built from your own asset pack.

No build step, no dependencies — plain HTML/CSS/JS, ready to host on GitHub Pages, Netlify, or any static host.

## Structure

```
index.html      All page content and sections
css/style.css   All styling (colors, fonts, layout, image-based envelope)
js/script.js    Envelope animation logic, countdown timer, scroll reveals, RSVP form
assets/         Image assets (see below)
```

## Assets

These come from the "Website Assets" pack you provided, cropped and compressed to WebP for the web (originals were ~55MB total; these are ~310KB combined):

- `envelope-closed.webp` — the sealed envelope shown on load
- `envelope-open.webp` — crossfades in when the envelope is tapped, and reused for the RSVP teaser section
- `photo-frame.webp` — the gold oval frame with your couple photo, shown at the top of the invitation section
- `bg-texture.webp` — the paisley/damask texture tiled as the page background
- `lace-trim.webp` — a standalone lace crop, currently unused but available if you want it as a decorative accent elsewhere

**Two things worth knowing about these assets:**
1. The wax seal is baked into the envelope images with the initials **"WJ"** — since it's a flat graphic, that can't be changed with text/CSS. If your initials are different, you'd need a re-exported version of that asset with your own monogram (from wherever this pack came from), or a replacement graphic.
2. The couple photo in the gold frame — if that's not actually you two, swap `assets/photo-frame.webp` for your own photo. Since the frame and photo are one flat image, you'd need your photo composited into a matching gold-frame graphic (e.g. back in Canva) rather than just dropping in a new file of a different shape.

## Page flow

1. **Envelope intro** — a Bible/love quote, a lace-trimmed envelope with your monogram. Tap to open.
2. **Header** — your monogram plus a live countdown to the big day, fixed at the top of every page as you scroll. There's no navigation menu — the header is informational only.
3. **Invitation** — your gold-framed couple photo, names in script, date, ceremony & reception details (with a candle icon), and an optional registry note.
4. **RSVP teaser** — a second lace envelope, opened, with a "Kindly RSVP — Click Here" card that scrolls down to the form.
5. **RSVP form** — name, attendance (pill buttons), guest count, and a submit button.

## Customize it

1. **Names & monogram** — find/replace "Groom", "Bride" and "B & G" throughout `index.html`.
2. **Countdown date** — open `js/script.js` and edit `CONFIG.weddingDate` at the top. The countdown itself lives in the `<header class="site-nav">` block in `index.html` (`.site-nav__countdown`).
3. **Ceremony / reception details** — update venue names, times, and addresses in the two `.invitation__event` blocks.
4. **Registry note** — edit or delete `.invitation__registry`.
5. **Photo** — see the Assets section above; replacing it means swapping `assets/photo-frame.webp` for a new composited frame+photo graphic.
6. **Colors & fonts** — all defined as CSS variables at the top of `css/style.css` (`--cream`, `--taupe`, `--brown`, fonts, etc.), so you can retheme the whole site by changing a handful of values.

## Making the RSVP form actually work

Right now submitting the RSVP form just shows a "Thank you" message locally (nothing is sent anywhere). To collect real responses:

1. Create a free form endpoint at [Formspree](https://formspree.io) (or use Google Forms).
2. In `index.html`, find the `<form id="rsvpForm">` element and add an `action` pointing to your endpoint, e.g.:
   ```html
   <form class="rsvp__form" id="rsvpForm" action="https://formspree.io/f/xxxxxxx" method="POST">
   ```
3. That's it — the script automatically steps aside and lets the form submit normally once an `action` is present.

## Hosting on GitHub Pages

1. Go to the repo's **Settings → Pages**.
2. Under "Build and deployment", set **Source** to `Deploy from a branch`, branch `main`, folder `/ (root)`.
3. Save — your site will be live at `https://<username>.github.io/<repo-name>/` within a minute or two.

## Accessibility notes

- The intro respects `prefers-reduced-motion` — visitors with that setting enabled skip straight to the full site.
- A "Skip intro" button is always available in the top-right corner of the envelope screen.
- The envelope is keyboard-accessible (`Tab` to focus, `Enter`/`Space` to open).
