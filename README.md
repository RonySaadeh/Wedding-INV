# Alexandra & James — Wedding Invitation Website

A luxurious, single-page wedding invitation site with an animated **envelope-opening intro**: a sealed envelope with a wax seal breaks open, the invitation card slides out, and the full site fades in underneath.

No build step, no dependencies — plain HTML/CSS/JS, ready to host on GitHub Pages, Netlify, or any static host.

## Structure

```
index.html      All page content and sections
css/style.css   All styling (colors, fonts, envelope animation, layout)
js/script.js    Envelope animation logic, countdown timer, scroll reveals, RSVP form
```

## Customize it

1. **Names & dates** — find/replace "Alexandra" and "James" throughout `index.html`, and update the wedding date text.
2. **Countdown date** — open `js/script.js` and edit `CONFIG.weddingDate` at the top.
3. **Monogram initials** — the wax seal ("A J") is in `index.html` inside `<div class="wax-seal">`.
4. **Event Details** — update venue names, addresses, and times in the `#details` section. Replace the `href="https://maps.google.com"` links with real Google Maps links to your venues.
5. **Our Story** — edit the four milestones inside `#story`.
6. **Gallery** — each `.gallery__item` is currently a placeholder tile. Replace the `<div class="gallery__item">...</div>` blocks with `<img src="assets/your-photo.jpg" alt="...">` once you have photos. Add your images to the `assets/` folder.
7. **Colors & fonts** — all defined as CSS variables at the top of `css/style.css` (`--ivory`, `--gold`, `--charcoal`, fonts, etc.) so you can retheme the whole site by changing a handful of values.

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
