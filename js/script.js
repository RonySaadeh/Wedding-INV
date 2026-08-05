(function () {
  "use strict";

  /* =========================================================
     CONFIG — edit these to personalize the site
     ========================================================= */
  var CONFIG = {
    weddingDate: "2027-06-12T16:00:00", // used by the countdown timer
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
    setTimeout(revealSite, 1500);
  }

  if (prefersReducedMotion) {
    revealSite();
  } else {
    envelope.addEventListener("click", openEnvelope);
    envelope.addEventListener("keypress", function (e) {
      if (e.key === "Enter" || e.key === " ") openEnvelope();
    });
    skipIntro.addEventListener("click", revealSite);
  }

  /* =========================================================
     Nav: scrolled state + mobile toggle
     ========================================================= */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");

  window.addEventListener("scroll", function () {
    siteNav.classList.toggle("is-scrolled", window.scrollY > 40);
  });

  navToggle.addEventListener("click", function () {
    navLinks.classList.toggle("is-open");
  });

  navLinks.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      navLinks.classList.remove("is-open");
    });
  });

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
     RSVP form
     ========================================================= */
  var rsvpForm = document.getElementById("rsvpForm");
  var rsvpSuccess = document.getElementById("rsvpSuccess");

  rsvpForm.addEventListener("submit", function (e) {
    // If `action` has been set to a real endpoint (e.g. Formspree),
    // let the form submit normally instead of intercepting it.
    if (rsvpForm.getAttribute("action")) return;

    e.preventDefault();
    rsvpSuccess.hidden = false;
    rsvpForm.reset();
  });
})();
