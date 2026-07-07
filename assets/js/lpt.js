/* Les Petits Trilingues — interactions
   (nav mobile, carrousel, FAQ, tabs témoignages, lead form) */
(function () {
  'use strict';

  /* ---------- nav mobile ---------- */
  var burger = document.getElementById('navBurger');
  var links = document.getElementById('navLinks');
  if (burger && links) {
    burger.addEventListener('click', function () {
      links.classList.toggle('is-open');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') links.classList.remove('is-open');
    });
  }

  /* ---------- carrousel programmes ---------- */
  var track = document.getElementById('progTrack');
  var prev = document.getElementById('progPrev');
  var next = document.getElementById('progNext');
  if (track && prev && next) {
    var pitch = function () {
      var card = track.querySelector('.prog-card');
      if (!card) return 396;
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 24;
      return card.getBoundingClientRect().width + gap;
    };
    prev.addEventListener('click', function () {
      track.scrollBy({ left: -pitch(), behavior: 'smooth' });
    });
    next.addEventListener('click', function () {
      track.scrollBy({ left: pitch(), behavior: 'smooth' });
    });
  }

  /* ---------- FAQ accordéon ---------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');
      var list = item.closest('.faq-list');
      if (list) {
        list.querySelectorAll('.faq-item.is-open').forEach(function (o) {
          o.classList.remove('is-open');
        });
      }
      if (!isOpen) item.classList.add('is-open');
    });
  });

  /* ---------- tabs témoignages (home) ---------- */
  var testiBtns = document.querySelectorAll('[data-testi-btn]');
  if (testiBtns.length) {
    testiBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = btn.getAttribute('data-testi-btn');
        document.querySelectorAll('[data-testi]').forEach(function (item) {
          item.classList.toggle('is-active', item.getAttribute('data-testi') === idx);
        });
        testiBtns.forEach(function (b) {
          b.classList.toggle('is-active', b === btn);
        });
      });
    });
  }

  /* ---------- formulaire lead (landing) ----------
     Démo : soumission simulée côté client.
     En production :
       1. Envoyer les champs vers votre endpoint CRM (fetch POST).
       2. Déclencher la conversion Google Ads ici :
          gtag('event', 'conversion', { send_to: 'AW-XXXX/YYYY' });   */
  var form = document.getElementById('lead-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('lf-name');
      var phone = document.getElementById('lf-phone');
      var age = document.getElementById('lf-age');
      var ok = true;
      [name, phone, age].forEach(function (f) {
        if (!f.value || !f.value.trim()) {
          f.style.borderColor = 'var(--red)';
          ok = false;
        } else {
          f.style.borderColor = '';
        }
      });
      if (!ok) return;
      form.closest('.form-card').classList.add('is-sent');
    });
  }
})();
