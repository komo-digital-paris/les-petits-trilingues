/* Les Petits Trilingues — interactions
   (nav mobile, carrousel, FAQ, tabs témoignages, reveal scroll,
   compteurs stats, lead form) */
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

  /* ---------- reveal au scroll + compteurs ----------
     Auto-tag : pas besoin de toucher au HTML. Chaque groupe est révélé
     avec un léger décalage entre ses éléments (stagger).
     Implémenté via getBoundingClientRect sur scroll (rAF-throttled)
     plutôt qu'IntersectionObserver : certains environnements headless
     ne délivrent jamais les callbacks IO. */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pendingReveal = [];
  var pendingCount = [];

  if (!reduceMotion) {
    var GROUPS = [
      '.trust-list > .trust-card',
      '.prog-track > .prog-card',
      '.teachers-list > .teacher-card',
      '.routine-list > .routine-item',
      '.stats-list > .stats-item',
      '.faq-list > .faq-item',
      '.lp-courses > .lp-course',
      '.lp-testi > .lp-testi-card',
      '.assure-strip > .assure'
    ];
    var SINGLES = [
      '.sec-title-wrap', '.sec-title-wrap--left', '.sec-sub',
      '.story-wrap > img', '.story-copy',
      '.choose-wrap > img', '.choose-copy',
      '.testi-panel', '.cta-wrap',
      '.campus-grid > img', '.campus-info', '.form-card'
    ];
    GROUPS.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el, i) {
        el.classList.add('reveal');
        el.style.setProperty('--d', Math.min(i * 90, 450) + 'ms');
        pendingReveal.push(el);
      });
    });
    SINGLES.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (!el.classList.contains('reveal')) {
          el.classList.add('reveal');
          pendingReveal.push(el);
        }
      });
    });
    pendingCount = Array.prototype.slice.call(document.querySelectorAll('.stats-value'));
  }

  var fmtNum = function (n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };
  var countUp = function (el) {
    var raw = el.textContent.trim();
    var target = parseInt(raw.replace(/[^\d]/g, ''), 10);
    var suffix = raw.replace(/[\d\s  ]/g, '');
    if (!target) return;
    var t0 = Date.now();
    var DUR = 1200;
    /* setInterval plutôt que rAF (voir note ci-dessus) — 30 fps suffit
       pour un compteur. */
    var timer = setInterval(function () {
      var p = Math.min((Date.now() - t0) / DUR, 1);
      var eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      el.textContent = fmtNum(Math.round(target * eased)) + suffix;
      if (p >= 1) clearInterval(timer);
    }, 33);
  };

  var onScroll;
  var checkInView = function () {
    // innerHeight peut être 0 dans certains renderers headless → fallback
    var vh = window.innerHeight || document.documentElement.clientHeight || 720;
    var i, r;
    for (i = pendingReveal.length - 1; i >= 0; i--) {
      r = pendingReveal[i].getBoundingClientRect();
      // Révélé dès que le haut passe sous 92 % du viewport.
      // Pas de condition sur le bas : un élément déjà dépassé (arrivée
      // par ancre puis remontée) doit être visible aussi.
      if (r.top < vh * 0.92) {
        pendingReveal[i].classList.add('is-in');
        pendingReveal.splice(i, 1);
      }
    }
    for (i = pendingCount.length - 1; i >= 0; i--) {
      r = pendingCount[i].getBoundingClientRect();
      if (r.top < vh * 0.85) {
        countUp(pendingCount[i]);
        pendingCount.splice(i, 1);
      }
    }
    if (!pendingReveal.length && !pendingCount.length && onScroll) {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    }
  };
  /* Throttle par timestamp + trailing call (PAS de rAF : inerte dans
     certains renderers headless, et le scroll suffit largement). */
  var lastCheck = 0;
  var trailing = null;
  onScroll = function () {
    var now = Date.now();
    if (now - lastCheck > 80) {
      lastCheck = now;
      checkInView();
    } else if (!trailing) {
      trailing = setTimeout(function () {
        trailing = null;
        lastCheck = Date.now();
        checkInView();
      }, 90);
    }
  };
  if (pendingReveal.length || pendingCount.length) {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    // état initial : éléments déjà dans le viewport au chargement
    checkInView();
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
