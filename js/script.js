(function () {
  "use strict";

  /* =========================================================
     CONFIG — edit these to personalize the site
     ========================================================= */
  var CONFIG = {
    weddingDate: "2026-10-10T16:00:00", // used by the countdown timer

    // RSVP responses are logged to a Google Sheet via a Google Apps
    // Script Web App. Set this to your deployment's /exec URL — see
    // google-apps-script/Code.gs and the README for setup steps.
    // Left empty, RSVP submissions just show the local "Thank you"
    // message without recording anywhere.
    rsvpEndpoint: "https://script.google.com/macros/s/AKfycbyKR9LW3Ldag4IAIEAPd89-w0ByNMNtmm4JLllMDV0jdIHWwXvpYdCrqQB7NjLTQc7H/exec",

    // WhatsApp number offered to a guest whose name isn't found on the
    // guest list, so they can reach out directly. International
    // format, digits only (no "+", spaces, or leading zeros).
    contactWhatsApp: "96171737441",
  };

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* =========================================================
     Envelope intro
     ========================================================= */
  var overlay = document.getElementById("envelopeOverlay");
  var envelope = document.getElementById("envelope");
  var tapHint = document.getElementById("tapHint");
  var skipIntro = document.getElementById("skipIntro");
  var siteNav = document.getElementById("siteNav");
  var siteContent = document.getElementById("siteContent");

  document.body.classList.add("no-scroll");

  function revealSite() {
    overlay.classList.add("is-hidden");
    siteNav.classList.add("is-visible");
    siteContent.classList.add("is-visible");
    document.body.classList.remove("no-scroll");
    setTimeout(function () {
      overlay.style.display = "none";
    }, 1000);
  }

  function openEnvelope() {
    if (envelope.classList.contains("is-opening")) return;
    envelope.classList.add("is-opening");
    tapHint.style.opacity = "0";
    setTimeout(revealSite, 1100);
  }

  if (prefersReducedMotion) {
    revealSite();
  } else {
    envelope.addEventListener("click", openEnvelope);
    envelope.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openEnvelope();
      }
    });
    skipIntro.addEventListener("click", revealSite);
  }

  /* =========================================================
     Nav: scrolled state
     ========================================================= */
  window.addEventListener("scroll", function () {
    siteNav.classList.toggle("is-scrolled", window.scrollY > 40);
  });

  /* =========================================================
     Fit the couple's names to one line
     Measures the ACTUAL rendered width (whatever font ends up
     loading on this device) rather than guessing a font-size that
     assumes particular character widths — the script font
     (Alex Brush) is noticeably wider than typical fallback serif
     fonts, so a size tuned against a fallback can still wrap.
     ========================================================= */
  function fitNamesToOneLine() {
    var namesEl = document.querySelector(".invitation__names");
    if (!namesEl || !namesEl.parentElement) return;

    namesEl.style.fontSize = ""; // reset to the CSS-defined size first
    var maxWidth = namesEl.parentElement.clientWidth;
    var textWidth = namesEl.scrollWidth;

    if (textWidth > maxWidth) {
      var currentSize = parseFloat(window.getComputedStyle(namesEl).fontSize);
      var scale = (maxWidth / textWidth) * 0.96; // small safety margin
      namesEl.style.fontSize = currentSize * scale + "px";
    }
  }

  fitNamesToOneLine();
  window.addEventListener("resize", fitNamesToOneLine);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fitNamesToOneLine);
  }

  /* =========================================================
     Countdown
     ========================================================= */
  var weddingTime = new Date(CONFIG.weddingDate).getTime();
  var elDays = document.getElementById("cd-days");
  var elHours = document.getElementById("cd-hours");
  var elMins = document.getElementById("cd-mins");
  var elSecs = document.getElementById("cd-secs");

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function updateCountdown() {
    var now = Date.now();
    var diff = weddingTime - now;
    if (diff < 0) diff = 0;

    var days = Math.floor(diff / 86400000);
    var hours = Math.floor((diff % 86400000) / 3600000);
    var mins = Math.floor((diff % 3600000) / 60000);
    var secs = Math.floor((diff % 60000) / 1000);

    elDays.textContent = pad(days);
    elHours.textContent = pad(hours);
    elMins.textContent = pad(mins);
    elSecs.textContent = pad(secs);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* =========================================================
     Scroll reveal animations
     ========================================================= */
  var revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("in-view");
    });
  }

  /* =========================================================
     RSVP: guest-list search + party checklist
     ========================================================= */
  var rsvpForm = document.getElementById("rsvpForm");
  var rsvpSubmitBtn = document.getElementById("rsvpSubmitBtn");
  var rsvpError = document.getElementById("rsvpError");
  var rsvpModal = document.getElementById("rsvpModal");
  var rsvpModalClose = document.getElementById("rsvpModalClose");

  var guestSearchStep = document.getElementById("rsvpSearchStep");
  var guestSearchInput = document.getElementById("guestSearch");
  var guestSearchBtn = document.getElementById("guestSearchBtn");
  var rsvpSearchMessage = document.getElementById("rsvpSearchMessage");
  var rsvpPartyLabel = document.getElementById("rsvpPartyLabel");
  var rsvpPartyList = document.getElementById("rsvpPartyList");
  var rsvpChangeSearch = document.getElementById("rsvpChangeSearch");

  var guestList = [];
  fetch("data/guests.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      guestList = data;
    })
    .catch(function () {
      guestList = [];
    });

  function normalizeName(str) {
    return str.toLowerCase().trim().replace(/\s+/g, " ");
  }

  function tokenize(str) {
    var normalized = normalizeName(str);
    return normalized.length ? normalized.split(" ") : [];
  }

  // Full names only, no partial/prefix matching — a search must spell out
  // a member's complete name (word order, case, and spacing don't matter)
  // to match. Prefix matching (e.g. "Douaihy" matching every "Douaihy ..."
  // name) would let a search reveal other guests' names and families, so
  // it's deliberately not supported here.
  function canonicalKey(str) {
    return tokenize(str).slice().sort().join(" ");
  }

  function nameMatches(queryKey, memberName) {
    return queryKey === canonicalKey(memberName);
  }

  function findMatchingGroups(query) {
    var queryKey = canonicalKey(query);
    if (!queryKey) return [];
    return guestList.filter(function (group) {
      return group.members.some(function (member) {
        return nameMatches(queryKey, member);
      });
    });
  }

  function showSearchMessage(html) {
    rsvpSearchMessage.innerHTML = html;
    rsvpSearchMessage.hidden = false;
  }

  function selectGroup(group) {
    rsvpSearchMessage.hidden = true;
    guestSearchStep.hidden = true;

    rsvpPartyLabel.textContent = group.label || group.members.join(", ");
    rsvpPartyList.innerHTML = "";

    group.members.forEach(function (name) {
      var item = document.createElement("label");
      item.className = "rsvp__party-item";

      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = true;
      checkbox.dataset.name = name;
      checkbox.addEventListener("change", function () {
        item.classList.toggle("is-declined", !checkbox.checked);
      });

      var span = document.createElement("span");
      span.textContent = name;

      item.appendChild(checkbox);
      item.appendChild(span);
      rsvpPartyList.appendChild(item);
    });

    rsvpForm.hidden = false;
    rsvpForm.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function runGuestSearch() {
    var query = guestSearchInput.value.trim();
    rsvpSearchMessage.hidden = true;
    if (!query) return;

    var matches = findMatchingGroups(query);

    if (matches.length === 0) {
      showSearchMessage(
        "We couldn't find that name on our guest list. Please double-check the spelling, or " +
          '<a href="https://wa.me/' +
          CONFIG.contactWhatsApp +
          '" target="_blank" rel="noopener">message us on WhatsApp</a> so we can help.'
      );
    } else if (matches.length === 1) {
      selectGroup(matches[0]);
    } else {
      // More than one guest shares this exact name. Never reveal who —
      // just ask them to confirm/correct their name, or reach out.
      showSearchMessage(
        "We found more than one guest with that exact name. Please double-check it matches your invitation exactly (e.g. add a middle or last name), or " +
          '<a href="https://wa.me/' +
          CONFIG.contactWhatsApp +
          '" target="_blank" rel="noopener">message us on WhatsApp</a> so we can help.'
      );
    }
  }

  guestSearchBtn.addEventListener("click", runGuestSearch);
  guestSearchInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      runGuestSearch();
    }
  });

  function resetSubmitBtn() {
    rsvpSubmitBtn.hidden = false;
    rsvpSubmitBtn.disabled = false;
    rsvpSubmitBtn.textContent = "RSVP";
  }

  function showRsvpModal(text) {
    document.getElementById("rsvpModalText").textContent = text;
    rsvpModal.hidden = false;
  }

  rsvpModalClose.addEventListener("click", function () {
    rsvpModal.hidden = true;
  });

  rsvpChangeSearch.addEventListener("click", function () {
    rsvpForm.hidden = true;
    guestSearchStep.hidden = false;
    guestSearchInput.value = "";
    guestSearchInput.focus();
    rsvpError.hidden = true;
    resetSubmitBtn();
  });

  function buildRsvpPayload() {
    var checkboxes = rsvpPartyList.querySelectorAll("input[type=checkbox]");
    var attending = [];
    var declined = [];
    checkboxes.forEach(function (cb) {
      (cb.checked ? attending : declined).push(cb.dataset.name);
    });

    return {
      party: rsvpPartyLabel.textContent,
      attending: attending,
      declined: declined,
    };
  }

  rsvpForm.addEventListener("submit", function (e) {
    // If `action` has been set to a real endpoint (e.g. Formspree),
    // let the form submit normally instead of intercepting it.
    if (rsvpForm.getAttribute("action")) return;

    e.preventDefault();
    rsvpError.hidden = true;

    // Disable + relabel immediately so a slow network can't be mistaken
    // for a missed click — that's what was causing repeated submissions.
    rsvpSubmitBtn.disabled = true;
    rsvpSubmitBtn.textContent = "Sending…";

    if (!CONFIG.rsvpEndpoint) {
      // Not configured yet — nothing to send to, just confirm locally.
      rsvpSubmitBtn.hidden = true;
      showRsvpModal("Thank you! Your RSVP has been recorded.");
      return;
    }

    // Google Apps Script Web Apps don't handle CORS preflight requests,
    // so this uses Content-Type: text/plain to keep it a "simple"
    // request (no preflight) and mode: "no-cors" since Apps Script's
    // response usually can't be read cross-origin anyway. That means
    // we can't actually confirm the row was written from here — a
    // network-level failure still surfaces via .catch(), but a script
    // error on Google's side would not. Worth spot-checking the sheet
    // after a few real submissions.
    fetch(CONFIG.rsvpEndpoint, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(buildRsvpPayload()),
    })
      .then(function () {
        rsvpSubmitBtn.hidden = true;
        showRsvpModal("Thank you! Your RSVP has been recorded.");
      })
      .catch(function () {
        rsvpError.hidden = false;
        resetSubmitBtn();
      });
  });
})();
