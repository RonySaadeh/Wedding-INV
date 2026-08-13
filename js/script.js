(function () {
  "use strict";

  /* =========================================================
     CONFIG — edit these to personalize the site
     ========================================================= */
  var CONFIG = {
    weddingDate: "2026-10-10T16:00:00", // used by the countdown timer

    // RSVP responses are sent as a WhatsApp "click to chat" message to
    // each number listed here. Numbers must be in international format,
    // digits only (no "+", spaces, or leading zeros).
    // Currently set to a single number for testing. To notify both of
    // you, add a second number, e.g.:
    // whatsappNumbers: ["96176532981", "961XXXXXXXX"]
    whatsappNumbers: ["96176532981"],
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
  var rsvpSuccess = document.getElementById("rsvpSuccess");
  var whatsappFallback = document.getElementById("whatsappFallback");
  var whatsappExtraLinks = document.getElementById("whatsappExtraLinks");

  var guestSearchStep = document.getElementById("rsvpSearchStep");
  var guestSearchInput = document.getElementById("guestSearch");
  var guestSearchBtn = document.getElementById("guestSearchBtn");
  var rsvpSearchMessage = document.getElementById("rsvpSearchMessage");
  var rsvpSearchChoices = document.getElementById("rsvpSearchChoices");
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

  // A query matches a member name if every query token is at least the
  // start of some token in that name — so "rita", "rita abou", or the
  // full "rita abou khalil" all match "Rita Abou Khalil".
  function nameMatches(queryTokens, memberName) {
    var memberTokens = tokenize(memberName);
    return queryTokens.every(function (qt) {
      return memberTokens.some(function (mt) {
        return mt.indexOf(qt) === 0;
      });
    });
  }

  function findMatchingGroups(query) {
    var queryTokens = tokenize(query);
    if (!queryTokens.length) return [];
    return guestList.filter(function (group) {
      return group.members.some(function (member) {
        return nameMatches(queryTokens, member);
      });
    });
  }

  function showSearchMessage(html) {
    rsvpSearchMessage.innerHTML = html;
    rsvpSearchMessage.hidden = false;
  }

  function clearSearchChoices() {
    rsvpSearchChoices.innerHTML = "";
    rsvpSearchChoices.hidden = true;
  }

  function selectGroup(group) {
    rsvpSearchMessage.hidden = true;
    clearSearchChoices();
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
    clearSearchChoices();
    if (!query) return;

    var matches = findMatchingGroups(query);

    if (matches.length === 0) {
      showSearchMessage(
        "We couldn't find that name on our guest list. Please double-check the spelling, or " +
          '<a href="https://wa.me/' +
          CONFIG.whatsappNumbers[0] +
          '" target="_blank" rel="noopener">message us on WhatsApp</a> so we can help.'
      );
    } else if (matches.length === 1) {
      selectGroup(matches[0]);
    } else {
      showSearchMessage("We found a few possible matches — please select yours:");
      rsvpSearchChoices.hidden = false;
      matches.forEach(function (group) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "rsvp__search-choice";
        btn.textContent = group.label || group.members.join(", ");
        btn.addEventListener("click", function () {
          selectGroup(group);
        });
        rsvpSearchChoices.appendChild(btn);
      });
    }
  }

  guestSearchBtn.addEventListener("click", runGuestSearch);
  guestSearchInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      runGuestSearch();
    }
  });

  rsvpChangeSearch.addEventListener("click", function () {
    rsvpForm.hidden = true;
    guestSearchStep.hidden = false;
    guestSearchInput.value = "";
    guestSearchInput.focus();
    rsvpSuccess.hidden = true;
    whatsappFallback.hidden = true;
    whatsappExtraLinks.innerHTML = "";
  });

  function buildWhatsAppMessage() {
    var checkboxes = rsvpPartyList.querySelectorAll("input[type=checkbox]");
    var attending = [];
    var declined = [];
    checkboxes.forEach(function (cb) {
      (cb.checked ? attending : declined).push(cb.dataset.name);
    });

    var lines = ["New RSVP", "Party: " + rsvpPartyLabel.textContent];
    lines.push("Attending: " + (attending.length ? attending.join(", ") : "None"));
    if (declined.length) {
      lines.push("Not attending: " + declined.join(", "));
    }
    return lines.join("\n");
  }

  rsvpForm.addEventListener("submit", function (e) {
    // If `action` has been set to a real endpoint (e.g. Formspree),
    // let the form submit normally instead of intercepting it.
    if (rsvpForm.getAttribute("action")) return;

    e.preventDefault();

    var encodedMessage = encodeURIComponent(buildWhatsAppMessage());
    var links = CONFIG.whatsappNumbers.map(function (number) {
      return "https://wa.me/" + number + "?text=" + encodedMessage;
    });

    // Mobile browsers (iOS Safari in particular) only allow a WhatsApp
    // deep link to open if it happens synchronously inside the tap that
    // triggered it — any setTimeout/async delay and it gets silently
    // blocked. So the first (primary) number is opened immediately here,
    // with a same-tab redirect as a fallback if the popup is blocked.
    var primaryWindow = window.open(links[0], "_blank");
    if (!primaryWindow) {
      window.location.href = links[0];
    }

    // Always show a manual link too, in case nothing above worked.
    whatsappFallback.href = links[0];
    whatsappFallback.hidden = false;

    // Auto-opening more than one WhatsApp chat per tap isn't reliable on
    // mobile, so any additional numbers get their own manual "tap to
    // send" links instead of trying to force them open.
    whatsappExtraLinks.innerHTML = "";
    links.slice(1).forEach(function (url, i) {
      var a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener";
      a.className = "rsvp__whatsapp-fallback";
      a.textContent = "Also send to recipient " + (i + 2);
      whatsappExtraLinks.appendChild(a);
    });

    rsvpSuccess.hidden = false;
  });
})();
