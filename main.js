/* ============================================================
   FAIR CONSTRUCTION SERVICES — main.js
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     STICKY NAV
     ============================================================ */
  var header = document.getElementById('site-header');

  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 10);
    highlightNav();
    updateParallax();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ============================================================
     MOBILE NAV TOGGLE
     ============================================================ */
  var navToggle = document.getElementById('nav-toggle');
  var navLinks  = document.getElementById('nav-links');

  navToggle.addEventListener('click', function () {
    var open = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  });

  // Close nav when any link clicked
  navLinks.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close nav on outside click
  document.addEventListener('click', function (e) {
    if (!header.contains(e.target)) {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
    }
  });

  /* ============================================================
     SMOOTH SCROLL
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = this.getAttribute('href');
      if (id === '#' || id === '#!next') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var offset = header ? header.offsetHeight : 70;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: 'smooth'
      });
    });
  });

  /* ============================================================
     ACTIVE NAV HIGHLIGHT
     ============================================================ */
  var navSections = Array.from(document.querySelectorAll(
    '#hero, #about, #residential, #commercial, #projects, #contact, #estimate'
  ));

  function highlightNav() {
    var scrollY  = window.scrollY;
    var vh       = window.innerHeight;
    var current  = '';
    for (var i = navSections.length - 1; i >= 0; i--) {
      if (navSections[i].offsetTop - vh * (1 / 3) <= scrollY) {
        current = navSections[i].id;
        break;
      }
    }
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }

  /* ============================================================
     HERO PARALLAX
     ============================================================ */
  var heroBg      = document.getElementById('hero-parallax-bg');
  var heroContent = document.getElementById('hero-parallax-content');

  function updateParallax() {
    var sy = window.scrollY;
    if (heroBg)      heroBg.style.transform      = 'translateY(' + (sy * 0.3)  + 'px)';
    if (heroContent) heroContent.style.transform = 'translateY(' + (sy * 0.15) + 'px)';
  }

  /* ============================================================
     SCROLL REVEAL  — gallery items intentionally excluded
     ============================================================ */
  var revealTargets = document.querySelectorAll(
    '.about-text, .about-image, .contact-box, .form-wrapper, .services-detail-col'
  );
  revealTargets.forEach(function (el) { el.classList.add('reveal'); });

  // Stagger service cards
  document.querySelectorAll('.services-cards').forEach(function (group) {
    group.querySelectorAll('.service-card').forEach(function (card, i) {
      card.classList.add('reveal', 'reveal-stagger-' + (i + 1));
    });
  });

  function revealOnScroll() {
    var fold = window.scrollY + window.innerHeight;
    document.querySelectorAll('.reveal:not(.visible)').forEach(function (el) {
      if (el.getBoundingClientRect().top + window.scrollY < fold - 50) {
        el.classList.add('visible');
      }
    });
  }
  window.addEventListener('scroll', revealOnScroll, { passive: true });
  revealOnScroll();

  /* ============================================================
     LIGHTBOX  — direct per-item listeners, no delegation walk-up
     ============================================================ */

  var lb        = document.getElementById('lightbox');
  var lbBdrop   = document.getElementById('lightbox-backdrop');
  var lbCloseEl = document.getElementById('lightbox-close');
  var lbPrevEl  = document.getElementById('lightbox-prev');
  var lbNextEl  = document.getElementById('lightbox-next');
  var lbImg     = document.getElementById('lightbox-img');
  var lbCaption = document.getElementById('lightbox-caption');
  var lbCounter = document.getElementById('lightbox-counter');

  // All gallery items — collected once after DOM is ready
  var galleryItems = Array.from(
    document.querySelectorAll('#gallery-grid [data-full]')
  );
  var total  = galleryItems.length;
  var curIdx = 0;
  var isOpen = false;
  var swipeX = 0;

  // ---- open ----
  function lbOpen(idx) {
    if (!lb) return;
    curIdx = ((idx % total) + total) % total;   // clamp + loop
    isOpen = true;
    lbLoad(curIdx);
    lb.style.display = 'flex';
    lb.classList.remove('lb-closing');
    lb.classList.add('lb-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  // ---- close ----
  function lbCloseFunc() {
    if (!lb || !isOpen) return;
    isOpen = false;
    lb.classList.remove('lb-open');
    lb.classList.add('lb-closing');
    lb.setAttribute('aria-hidden', 'true');
    setTimeout(function () {
      lb.style.display = 'none';
      lb.classList.remove('lb-closing');
      document.body.style.overflow = '';
    }, 200);
  }

  // ---- load image into lightbox ----
  function lbLoad(idx) {
    var item    = galleryItems[idx];
    var src     = item.getAttribute('data-full');
    var caption = item.getAttribute('data-caption') || '';

    lbImg.style.opacity    = '0';
    lbImg.style.transition = 'none';

    var tmp   = new Image();
    tmp.onload = function () {
      lbImg.src             = src;
      lbImg.alt             = caption || 'Project image';
      lbImg.style.transition = 'opacity 0.2s ease';
      lbImg.style.opacity    = '1';
    };
    tmp.onerror = function () {
      // Fallback to thumbnail that's already loaded in the grid
      var thumb = item.querySelector('img');
      lbImg.src             = thumb ? thumb.src : src;
      lbImg.alt             = caption || 'Project image';
      lbImg.style.transition = 'opacity 0.2s ease';
      lbImg.style.opacity    = '1';
    };
    tmp.src = src;

    if (lbCaption) lbCaption.textContent = caption;
    if (lbCounter) lbCounter.textContent = (idx + 1) + ' / ' + total;
  }

  // ---- attach direct click listener to every gallery item ----
  galleryItems.forEach(function (item, i) {
    item.style.cursor = 'pointer';
    item.setAttribute('tabindex', '0');
    item.setAttribute('role',     'button');
    item.setAttribute('aria-label', 'View larger image');

    // Click (mouse + touch tap)
    item.addEventListener('click', function () {
      lbOpen(i);
    });

    // Keyboard Enter / Space
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        lbOpen(i);
      }
    });
  });

  // ---- lightbox controls ----
  if (lbCloseEl) lbCloseEl.addEventListener('click', lbCloseFunc);
  if (lbBdrop)   lbBdrop.addEventListener('click',   lbCloseFunc);

  if (lbPrevEl) {
    lbPrevEl.addEventListener('click', function (e) {
      e.stopPropagation();
      lbOpen(curIdx - 1);
    });
  }
  if (lbNextEl) {
    lbNextEl.addEventListener('click', function (e) {
      e.stopPropagation();
      lbOpen(curIdx + 1);
    });
  }

  // Keyboard
  document.addEventListener('keydown', function (e) {
    if (!isOpen) return;
    if (e.key === 'Escape')     { lbCloseFunc();       return; }
    if (e.key === 'ArrowLeft')  { lbOpen(curIdx - 1);  return; }
    if (e.key === 'ArrowRight') { lbOpen(curIdx + 1);  return; }
  });

  // Touch swipe
  if (lb) {
    lb.addEventListener('touchstart', function (e) {
      swipeX = e.changedTouches[0].screenX;
    }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].screenX - swipeX;
      if (Math.abs(dx) > 40) {
        lbOpen(dx < 0 ? curIdx + 1 : curIdx - 1);
      }
    }, { passive: true });
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
    var f = document.getElementById('field-' + id);
    if (e) e.textContent = msg;
    if (f) f.classList.toggle('has-error', !!msg);
  }

  form.querySelectorAll('input, textarea').forEach(function (el) {
    el.addEventListener('input', function () {
      setError(el.id.replace('field-', ''), '');
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    successMsg.style.display = 'none';
    errorMsg.style.display   = 'none';
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
    submitBtn.textContent = 'Sending\u2026';

    fetch('../api.php', { method: 'POST', body: new FormData(form) })
      .then(function (r) {
        if (r.ok) { successMsg.style.display = 'block'; form.reset(); }
        else      { throw new Error(r.status); }
      })
      .catch(function ()  { errorMsg.style.display = 'block'; })
      .finally(function () {
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Submit';
      });
  });

})();
