/* ============================================================
   FAIR CONSTRUCTION SERVICES — main.js
   ============================================================ */

(function () {
  'use strict';

  var header    = document.getElementById('site-header');
  var navToggle = document.getElementById('nav-toggle');
  var navLinks  = document.getElementById('nav-links');
  var isMobile  = function () { return window.matchMedia('(max-width: 768px)').matches; };

  /* ============================================================
     INIT AOS
     ============================================================ */
  if (window.AOS) {
    window.AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60,
      disable: function () {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      }
    });
  }

  /* ============================================================
     STICKY NAV + PARALLAX
     ============================================================ */
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 8);
    updateParallax();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ============================================================
     MOBILE NAV TOGGLE
     ============================================================ */
  function closeMenu() {
    if (!navLinks) return;
    navLinks.classList.remove('open');
    if (navToggle) {
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
    document.body.classList.remove('menu-open');
  }

  function openMenu() {
    if (!navLinks) return;
    navLinks.classList.add('open');
    if (navToggle) {
      navToggle.classList.add('open');
      navToggle.setAttribute('aria-expanded', 'true');
    }
    document.body.classList.add('menu-open');
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      if (navLinks.classList.contains('open')) closeMenu();
      else openMenu();
    });

    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', function (e) {
      if (!navLinks.classList.contains('open')) return;
      if (header && header.contains(e.target)) return;
      closeMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) closeMenu();
    });

    // If viewport grows past mobile, force-close any lingering open state
    window.addEventListener('resize', function () {
      if (!isMobile()) closeMenu();
    });
  }

  /* ============================================================
     SMOOTH SCROLL (with header offset)
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = this.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var offset = (header ? header.offsetHeight : 70) + 8;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: 'smooth'
      });
    });
  });

  /* ============================================================
     ACTIVE NAV — IntersectionObserver
     ============================================================ */
  if (navLinks && 'IntersectionObserver' in window) {
    var sections = ['hero', 'about', 'residential', 'commercial', 'projects', 'testimonials', 'estimate']
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    var sectionLinks = {};
    navLinks.querySelectorAll('a[href^="#"]').forEach(function (a) {
      sectionLinks[a.getAttribute('href').slice(1)] = a;
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = sectionLinks[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          Object.keys(sectionLinks).forEach(function (k) { sectionLinks[k].classList.remove('active'); });
          link.classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

    sections.forEach(function (s) { io.observe(s); });
  }

  /* ============================================================
     COUNT-UP STATS — animated number reveal
     ============================================================ */
  if ('IntersectionObserver' in window) {
    var counters = document.querySelectorAll('.count[data-count]');
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var countObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el     = entry.target;
        var target = parseInt(el.getAttribute('data-count'), 10) || 0;
        var dur    = prefersReduced ? 0 : 1400;
        var start  = performance.now();

        function step(now) {
          var p = Math.min((now - start) / dur, 1);
          // ease-out cubic
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString();
          if (p < 1) requestAnimationFrame(step);
        }
        if (dur === 0) el.textContent = target.toLocaleString();
        else requestAnimationFrame(step);

        obs.unobserve(el);
      });
    }, { threshold: 0.4 });

    counters.forEach(function (c) { countObserver.observe(c); });
  }

  /* ============================================================
     HERO PARALLAX (desktop only)
     ============================================================ */
  var heroBg = document.getElementById('hero-parallax-bg');

  function updateParallax() {
    if (!heroBg || isMobile()) return;
    var sy = window.scrollY;
    if (sy > window.innerHeight) return; // skip once below hero
    heroBg.style.transform = 'translate3d(0,' + (sy * 0.25) + 'px,0)';
  }

  /* ============================================================
     FORM VALIDATION & SUBMISSION
     ============================================================ */
  var form = document.getElementById('estimate-form');
  if (!form) return;

  var submitBtn  = document.getElementById('submit-btn');
  var successMsg = document.getElementById('form-success');
  var errorMsg   = document.getElementById('form-error');

  function setError(id, msg) {
    var e = document.getElementById('err-' + id);
    var w = document.getElementById('field-' + id + '-wrap');
    if (e) e.textContent = msg;
    if (w) w.classList.toggle('has-error', !!msg);
  }

  form.querySelectorAll('input, textarea').forEach(function (el) {
    el.addEventListener('input', function () {
      var id = el.id.replace('field-', '');
      setError(id, '');
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    successMsg.hidden = true;
    errorMsg.hidden   = true;
    ['company', 'name', 'phone', 'email', 'message'].forEach(function (id) { setError(id, ''); });

    var phone = document.getElementById('field-phone').value.trim();
    var email = document.getElementById('field-email').value.trim();
    var ok    = true;

    if (!phone) {
      setError('phone', 'Phone is required.'); ok = false;
    } else if (phone.replace(/[\s\-().+]/g, '').length < 7) {
      setError('phone', 'Enter a valid phone number.'); ok = false;
    }
    if (!email) {
      setError('email', 'Email is required.'); ok = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('email', 'Enter a valid email address.'); ok = false;
    }
    if (!ok) return;

    submitBtn.disabled    = true;
    submitBtn.textContent = 'Sending…';

    fetch('../api.php', { method: 'POST', body: new FormData(form) })
      .then(function (r) {
        if (r.ok) { successMsg.hidden = false; form.reset(); }
        else      { throw new Error(r.status); }
      })
      .catch(function () { errorMsg.hidden = false; })
      .finally(function () {
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Send Request';
      });
  });

})();
