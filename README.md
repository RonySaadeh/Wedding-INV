# Wassim & Jamela — Wedding Invitation Website

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
- `swan-heart-motif.svg` — small two-swans-forming-a-heart motif above Ceremony and RSVP, colored to match the site's brown palette (`#6b4630`)
- `candelabra.svg` — three-candle candelabra motif above Reception to Follow, same brown color
- `swan-heart.svg` — an earlier, larger swan-and-heart icon (with spread wings and water lines); currently unused, kept in case you prefer it back

**Worth knowing:** the wax seal is baked into the envelope images with the initials **"WJ"** — which happens to already match Wassim & Jamela. If names ever change, that seal would need a re-exported asset with new initials, since it's a flat graphic, not editable text. Same goes for the couple photo in the gold frame — swap `assets/photo-frame.webp` for a new photo composited into a matching frame graphic if needed.

## Page flow

1. **Envelope intro** — a Bible/love quote, a lace-trimmed envelope with your monogram. Tap to open.
2. **Header** — your monogram plus a live countdown to the big day, fixed at the top of every page as you scroll. There's no navigation menu — the header is informational only.
3. **Invitation** — a short quote, your gold-framed couple photo, "Together With Their Families," names in script, the formal request line, date, ceremony & reception details (swan-heart motif above Ceremony/RSVP, candelabra above Reception), and an optional registry note.
4. **RSVP teaser** — a second lace envelope, opened, with a "Kindly RSVP — Click Here" card that scrolls down to the form.
5. **RSVP form** — on the `feature/guest-list-rsvp` branch, this is a guest-list search (see below) instead of a free-text name field.

## Customize it

1. **Names & monogram** — currently set to "Wassim & Jamela" / "W & J"; find/replace throughout `index.html` if this changes.
2. **Countdown date** — open `js/script.js` and edit `CONFIG.weddingDate` at the top. The countdown itself lives in the `<header class="site-nav">` block in `index.html` (`.site-nav__countdown`).
3. **Ceremony / reception details** — update venue names, times, and addresses in the two `.invitation__event` blocks.
4. **Registry note** — edit or delete `.invitation__registry`.
5. **Photo** — see the Assets section above; replacing it means swapping `assets/photo-frame.webp` for a new composited frame+photo graphic.
6. **Colors & fonts** — all defined as CSS variables at the top of `css/style.css` (`--cream`, `--taupe`, `--brown`, fonts, etc.), so you can retheme the whole site by changing a handful of values.

## Guest-list search RSVP (experimental — `feature/guest-list-rsvp` branch)

**Not merged to `main` yet — the live site is unaffected until this is confirmed and merged.**

Instead of a free-text name field, the RSVP section now asks guests to search for themselves by name. If found, it reveals their whole party (family/couple) as a checklist so they can untick anyone not attending, instead of typing a guest count.

**How it works:**
1. `data/guests.json` holds the guest list as an array of groups:
   ```json
   [
     { "id": "abou-khalil-family", "label": "The Abou Khalil Family", "members": ["Elie Abou Khalil", "Rita Abou Khalil", "Karim Abou Khalil", "Maya Abou Khalil"] },
     { "id": "sarah-khoury", "label": "Sarah Khoury", "members": ["Sarah Khoury"] }
   ]
   ```
   `label` is the friendly name shown above the checklist (and in the "pick one" list if a search matches more than one group); `members` is every person in that party. **The file currently contains sample data for testing** — replace it with your real guest list before merging this branch.
2. A search matches a group if every word typed is the start of some word in any one member's name — so "Rita", "Rita Abou", or the full name all find the Abou Khalil family; searching a shared surname can surface more than one group, in which case the visitor picks the right one from a list.
3. Once a group is found, every member is shown as a checked-by-default checkbox; unticking someone marks them as not attending. Submitting sends a WhatsApp message listing who's attending and who isn't from that party (reusing the WhatsApp flow already on the site).

**Converting your Excel file:** once you send it, I'll convert it to this JSON format — the main thing I need from the spreadsheet is which rows belong together as one party (a shared family/household ID column works well, or I can infer it from a "party name" column if that's how it's laid out).

**Privacy trade-off:** this is a fully static site with no backend, so `data/guests.json` is fetched by the page and searched in the visitor's own browser — the complete guest list (names and family groupings) is downloadable by anyone who opens their browser's dev tools, even though it's never displayed on screen. That's a reasonable trade-off for a low-stakes wedding site, but if it matters, the alternative is a small private backend lookup (e.g. a Google Sheets Apps Script endpoint) that never sends the full list to the browser — happy to build that instead if you'd rather.

## Making the RSVP form actually work

Submitting the RSVP form currently opens WhatsApp with the guest's details pre-filled, addressed to the number(s) in `CONFIG.whatsappNumbers` (`js/script.js`). One real limitation: the guest still has to tap Send themselves inside WhatsApp — no browser can silently send a WhatsApp message on a site's behalf.

If you'd rather collect responses by email/spreadsheet instead of (or alongside) WhatsApp, you can still point the form at a service like [Formspree](https://formspree.io) or Google Forms:
1. Create a free form endpoint there.
2. In `index.html`, find the `<form id="rsvpForm">` element and add an `action` pointing to your endpoint, e.g.:
   ```html
   <form class="rsvp__form" id="rsvpForm" action="https://formspree.io/f/xxxxxxx" method="POST">
   ```
   The script steps aside and lets the form submit normally once an `action` is present, instead of intercepting it for WhatsApp.
3. **On the `feature/guest-list-rsvp` branch**, note the checklist checkboxes don't have `name=` attributes (they're read via JavaScript, not a native form submit) — wiring up a native `action` there would need each checkbox given a `name`/`value` first.

## Hosting on GitHub Pages

1. Go to the repo's **Settings → Pages**.
2. Under "Build and deployment", set **Source** to `Deploy from a branch`, branch `main`, folder `/ (root)`.
3. Save — your site will be live at `https://<username>.github.io/<repo-name>/` within a minute or two.

## Accessibility notes

- The intro respects `prefers-reduced-motion` — visitors with that setting enabled skip straight to the full site.
- A "Skip intro" button is always available in the top-right corner of the envelope screen.
- The envelope is keyboard-accessible (`Tab` to focus, `Enter`/`Space` to open).
