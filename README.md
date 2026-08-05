# Bride & Groom — Wedding Invitation Website

A luxurious, single-page wedding invitation site with a **lace-trimmed envelope intro**: an ivory envelope with a scalloped lace edge and a script monogram opens on tap, revealing a formal invitation, countdown, and RSVP flow underneath.

No build step, no dependencies — plain HTML/CSS/JS, ready to host on GitHub Pages, Netlify, or any static host.

## Structure

```
index.html      All page content and sections
css/style.css   All styling (colors, fonts, envelope/lace SVG, layout)
js/script.js    Envelope animation logic, countdown timer, scroll reveals, RSVP form
```

## Page flow

1. **Envelope intro** — a Bible/love quote, a lace-trimmed envelope with your monogram. Tap to open.
2. **Invitation** — parents' names, formal wording, your names in script, date, ceremony & reception details (with a candle icon), and an optional registry note.
3. **Countdown** — an oval engagement photo placeholder and a live countdown to the big day.
4. **RSVP teaser** — a second lace envelope, opened, with a "Kindly RSVP — Click Here" card that scrolls down to the form.
5. **RSVP form** — name, attendance (pill buttons), guest count, and a submit button.

## Customize it

1. **Names & monogram** — find/replace "Groom", "Bride" and "B & G" throughout `index.html`.
2. **Countdown date** — open `js/script.js` and edit `CONFIG.weddingDate` at the top.
3. **Parents' names & wording** — edit `.invitation__parents` and `.invitation__request` in the `#invitation` section.
4. **Ceremony / reception details** — update venue names, times, and addresses in the two `.invitation__event` blocks.
5. **Registry note** — edit or delete `.invitation__registry`.
6. **Photo** — replace the `.countdown__photo` placeholder `<div>` with a real `<img>` (keep the oval shape by applying the same `border-radius`, or adjust it).
7. **Colors & fonts** — all defined as CSS variables at the top of `css/style.css` (`--cream`, `--taupe`, `--brown`, fonts, etc.), so you can retheme the whole site by changing a handful of values.
8. **Lace texture** — the corner lace ornament (`.lace-corner`) and the envelope's scalloped edge (the `.envelope__lace` SVG path) are CSS/SVG approximations of a lace trim, not a traced image. If you have a real lace texture/PNG you like better, swap `.lace-corner`'s background for `background-image: url(...)`.

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
