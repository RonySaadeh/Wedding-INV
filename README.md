# Wassim & Jamela — Wedding Invitation Website

A luxurious, single-page wedding invitation site with a **lace-trimmed envelope intro**: a real envelope graphic with a scalloped lace edge and a gold wax seal opens on tap, revealing a formal invitation, countdown, and RSVP flow underneath — all built from your own asset pack.

No build step, no dependencies — plain HTML/CSS/JS, ready to host on GitHub Pages, Netlify, or any static host.

## Structure

```
index.html                    All page content and sections
css/style.css                 All styling (colors, fonts, layout, image-based envelope)
js/script.js                  Envelope animation, countdown timer, scroll reveals, guest search + RSVP
assets/                       Image assets (see below)
data/sanklinjit.json          Guest list used by the RSVP search (see below)
google-apps-script/Code.gs    Script that logs RSVP submissions to a Google Sheet
```

## Assets

These come from the "Website Assets" pack you provided, cropped and compressed to WebP for the web (originals were ~55MB total; these are ~310KB combined):

- `envelope-closed.webp` — the boxed sealed-envelope graphic used for the intro on laptop/desktop (see "Envelope intro" below)
- `envelope-open.webp` — crossfades in when the envelope is tapped, and reused for the RSVP teaser section
- `photo-frame.webp` — the gold oval frame with your couple photo, shown at the top of the invitation section
- `bg-texture.webp` — the paisley/damask texture tiled as the page background, and behind the boxed envelope on desktop
- `lace-trim.webp` — fills the entire intro screen as the background on phones, cropped to cover whatever size/shape the visitor's viewport is
- `stamp-seal.webp` — the gold "WJ" wax-seal graphic layered on top of the lace, tapped to open the invitation
- `swan-heart-motif.svg` — small two-swans-forming-a-heart motif above Ceremony, colored to match the site's brown palette (`#6b4630`)
- `cheers-glasses.svg` — clinking champagne glasses icon shown under "Click Here" on the RSVP teaser envelope
- `candelabra.svg` — three-candle candelabra motif above Reception to Follow, same brown color
- `gift-box.svg` — hand-drawn gift boxes icon shown above the "Gifts" heading in the registry section
- `swan-heart.svg` — an earlier, larger swan-and-heart icon (with spread wings and water lines); currently unused, kept in case you prefer it back
- `entrance-song.mp3` — background music that starts playing when the envelope (or "Skip intro") is tapped; swap this file for a different track if you'd rather, no code changes needed

**Worth knowing:** `assets/stamp-seal.webp` (the intro screen's wax seal) has the initials **"WJ"** baked in — which happens to already match Wassim & Jamela. If names ever change, that seal would need a re-exported asset with new initials, since it's a flat graphic, not editable text. Same goes for the couple photo in the gold frame — swap `assets/photo-frame.webp` for a new photo composited into a matching frame graphic if needed.

## Page flow

1. **Envelope intro** — two variants, swapped by viewport width (breakpoint: 900px, in the "ENVELOPE INTRO" section of `style.css`). On phones: a full-page lace background (`assets/lace-trim.webp`) with your gold "WJ" wax seal and "Open Invitation" over it, nothing else. On laptop/desktop: the original boxed envelope graphic (`assets/envelope-closed.webp`) on the paisley background. Tapping either variant opens it and also starts the entrance song (`assets/entrance-song.mp3`, looping); a small mute button appears bottom-right once it's playing so guests can turn it off. Browsers only allow audio to autoplay off a real tap/click, so this deliberately doesn't try to play automatically for visitors with "reduce motion" enabled, since they skip straight past the tap.
2. **Header** — your monogram plus a live countdown to the big day, fixed at the top of every page as you scroll. There's no navigation menu — the header is informational only.
3. **Invitation** — a short quote, your gold-framed couple photo, "Together With Their Families," names in script, the formal request line, date, ceremony & reception details (swan-heart motif above Ceremony, candelabra above Reception, each with a "View on Google Maps" button under the time), and a "Gifts" section with the IBAN/Whish details as cards.
4. **RSVP teaser** — a second lace envelope, opened, with a "Kindly RSVP — Click Here" card. The RSVP section (`#rsvp`) starts with the `hidden` attribute, so there's nothing below the teaser to scroll to — clicking the envelope is the only way in; it reveals the section and scrolls down to it.
5. **RSVP form** — a guest-list search (see below) instead of a free-text name field.

## Customize it

1. **Names & monogram** — currently set to "Wassim & Jamela" / "W & J"; find/replace throughout `index.html` if this changes.
2. **Countdown date** — open `js/script.js` and edit `CONFIG.weddingDate` at the top. The countdown itself lives in the `<header class="site-nav">` block in `index.html` (`.site-nav__countdown`).
3. **Ceremony / reception details** — update venue names, times, and addresses in the two `.invitation__event` blocks. Each also has a `.invitation__map-btn` link pinned to the venue's exact Google Maps location — to change it, open the location in Google Maps, tap Share > Copy link, and paste that in as the `href`.
4. **Gifts / registry** — edit or delete `.invitation__registry`; the IBAN/Whish values are each a `.registry-card` — copy the block to add more (e.g. a different bank or payment app).
5. **Photo** — see the Assets section above; replacing it means swapping `assets/photo-frame.webp` for a new composited frame+photo graphic.
6. **Colors & fonts** — all defined as CSS variables at the top of `css/style.css` (`--cream`, `--taupe`, `--brown`, fonts, etc.), so you can retheme the whole site by changing a handful of values.

## Guest-list search RSVP

Instead of a free-text name field, the RSVP section asks guests to search for themselves by name. If found, it reveals their whole party (family/couple) as a checklist so they can untick anyone not attending, instead of typing a guest count.

**How it works:**
1. `data/sanklinjit.json` holds the guest list as an array of groups:
   ```json
   [
     { "id": "abou-khalil-family", "label": "The Abou Khalil Family", "members": ["Elie Abou Khalil", "Rita Abou Khalil", "Karim Abou Khalil", "Maya Abou Khalil"] },
     { "id": "sarah-khoury", "label": "Sarah Khoury", "members": ["Sarah Khoury"], "plusOnes": 1 }
   ]
   ```
   `label` is the friendly name shown above the checklist once a match is found; `members` is every person in that party. Add `"plusOnes": N` to let that group bring N guests whose names you don't have yet — that many optional text fields appear on their RSVP form for them to fill in (see next point). `"allowPlusOne": true` also still works as a synonym for `"plusOnes": 1`, kept for whoever's already been flagged that way. Omit either field for everyone else.
2. A search matches a group only if it spells out a member's **complete, exact name** — word order, capitalization, and extra spacing don't matter, but partial names don't match. So "Rita Abou Khalil" (in any word order/case) finds the Abou Khalil family, but searching just "Abou Khalil" or "Rita" does not. This is deliberate: matching on a partial name (e.g. just a surname) would let a search surface — and on a tie, list — other guests' names, which is a privacy leak for a guest list with repeated surnames. If two different guests share the exact same full name, the search reports the tie without revealing either party, and asks the visitor to add a middle/last name or contact you directly.
3. Once a group is found, every member is shown as a checked-by-default checkbox; unticking someone marks them as not attending. If the group has `plusOnes`, that many optional "full name" fields appear below the checklist — any that get filled in are added to the submission's attending list tagged `(+1)` so it's clear in the Sheet they weren't among the originally invited names. Submitting logs the response to a Google Sheet — see the next section.

**Privacy trade-off:** this is a fully static site with no backend, so `data/sanklinjit.json` is fetched by the page and searched in the visitor's own browser — the complete guest list (names and family groupings) is downloadable by anyone who opens their browser's dev tools, even though it's never displayed on screen. The deliberately odd filename (rather than `guests.json`) is a minor speed bump against casual URL-guessing, not real protection — anyone who actually opens dev tools while using the RSVP search, reads `js/script.js`, or (if this repo is public) just browses the repo on GitHub can find it immediately. That's a reasonable trade-off for a low-stakes wedding site, but if it matters, the real alternative is a small private backend lookup (e.g. a Google Sheets Apps Script endpoint) that never sends the full list to the browser — happy to build that instead if you'd rather.

## Recording RSVPs to a Google Sheet

Submitting the RSVP form logs the response as a new row in a Google Sheet, via a small Google Apps Script Web App — no other backend needed.

**Setup:**
1. Open (or create) the Google Sheet you want responses to land in.
2. **Extensions → Apps Script**, delete the starter code, and paste in the contents of `google-apps-script/Code.gs` from this repo.
3. **Deploy → New deployment**, click the gear icon, choose type **Web app**. Set **Execute as: Me** and **Who has access: Anyone**.
4. Deploy, and authorize the permissions Google prompts for.
5. Copy the **Web app URL** (it ends in `/exec`).
6. In `js/script.js`, set `CONFIG.rsvpEndpoint` to that URL.

Each submission appends a row with a timestamp, the party's name, who's attending, who's not, and an attending count, to a sheet tab called "RSVPs" (created automatically on first submission). It also emails a copy of the submission to `NOTIFY_EMAILS` at the top of `Code.gs` (currently your Hotmail and Gmail addresses, both — see "Two things worth knowing" below for why not a primary/fallback pair) — a second, independent record in case the Sheet write itself ever silently fails.

**Two things worth knowing:**
- If `CONFIG.rsvpEndpoint` is left empty, submitting just shows the local "Thank you" message without recording anywhere — handy for testing the UI before the Sheet is wired up.
- Apps Script Web Apps don't support CORS in a way `fetch()` can read a response from, so the site sends the request in "fire and forget" mode: it can tell you if the request failed to reach Google at all (shows an error message), but not if something went wrong inside the script itself (e.g. a typo introduced while editing `Code.gs`). That's exactly what the email notification above is for — it's a channel independent of the Sheet write, so you'd still hear about a submission even if the row never landed. Worth doing a real test submission and checking both the Sheet and your inbox after any changes to the script.
- This currently only logs a running list of *responses* — it won't show guests who haven't responded at all yet, since it only writes a row when someone actually submits. If you want a full roster view (everyone from the guest list, with a status per person including "no response yet"), that's a reasonable next step — just ask.

**If you already have this deployed:** editing `Code.gs` alone doesn't update a live deployment — go to **Deploy → Manage deployments → edit (pencil icon) → New version → Deploy** so the email notification actually takes effect.

**Alternative:** if you'd rather use [Formspree](https://formspree.io) or Google Forms instead, add an `action` attribute to `<form id="rsvpForm">` in `index.html`, e.g. `action="https://formspree.io/f/xxxxxxx" method="POST"` — the script steps aside and lets the form submit normally once an `action` is present. Note the party checklist's checkboxes don't have `name=` attributes (they're read via JavaScript, not a native form submit), so wiring up a native `action` this way would need each checkbox given a `name`/`value` first.

## Hosting on GitHub Pages

1. Go to the repo's **Settings → Pages**.
2. Under "Build and deployment", set **Source** to `Deploy from a branch`, branch `main`, folder `/ (root)`.
3. Save — your site will be live at `https://<username>.github.io/<repo-name>/` within a minute or two.

## Accessibility notes

- The intro respects `prefers-reduced-motion` — visitors with that setting enabled skip straight to the full site.
- A "Skip intro" button is always available in the top-right corner of the envelope screen.
- The envelope is keyboard-accessible (`Tab` to focus, `Enter`/`Space` to open).
