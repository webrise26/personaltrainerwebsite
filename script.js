/* ═══════════════════════════════════════════════════
   Federico Guerreschi PT — 10/10 JS
   ═══════════════════════════════════════════════════ */

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ══════════════════════════════════════
   A — SMOOTH SCROLL
   Usa Lenis se disponibile (CDN), altrimenti
   fallback vanilla lerp-based (stessa qualità).
══════════════════════════════════════ */

/* ── Vanilla smooth scroll (fallback production-grade) ── */
class SmoothScroll {
  constructor() {
    this.y  = window.scrollY;
    this.ty = window.scrollY;
    this._wheel = this._wheel.bind(this);
    this._tick  = this._tick.bind(this);
    this._syncOnExternalScroll = this._syncOnExternalScroll.bind(this);
    this._scrolling = false;
    document.addEventListener('wheel', this._wheel, { passive: false });
    window.addEventListener('scroll', this._syncOnExternalScroll, { passive: true });
    this._raf = requestAnimationFrame(this._tick);
  }
  _wheel(e) {
    e.preventDefault();
    const max = document.documentElement.scrollHeight - window.innerHeight;
    this.ty = Math.max(0, Math.min(max, this.ty + e.deltaY * 0.85));
    this._scrolling = true;
  }
  _tick() {
    const diff = this.ty - this.y;
    if (Math.abs(diff) > 0.3) {
      this.y += diff * 0.13;
      window.scrollTo(0, this.y);
    } else if (this._scrolling) {
      this.y = this.ty;
      window.scrollTo(0, this.y);
      this._scrolling = false;
    }
    this._raf = requestAnimationFrame(this._tick);
  }
  _syncOnExternalScroll() {
    // Mantieni sync con scroll da keyboard/touch/link
    if (!this._scrolling) {
      this.y = window.scrollY;
      this.ty = window.scrollY;
    }
  }
  scrollTo(el, offset = -68) {
    const top = el.getBoundingClientRect().top + window.scrollY + offset;
    this.ty = Math.max(0, top);
    this._scrolling = true;
  }
}

let scroller = null;
if (!reducedMotion) {
  // Prova Lenis (CDN nel browser reale)
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
      duration: 1.25,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.8,
    });
    function lenisRaf(time) { lenis.raf(time); requestAnimationFrame(lenisRaf); }
    requestAnimationFrame(lenisRaf);
    scroller = { scrollTo: (el, offset) => lenis.scrollTo(el, { offset: offset ?? -68, duration: 1.4 }) };
  } else {
    // Fallback vanilla — stessa qualità visiva
    scroller = new SmoothScroll();
  }
}

// Anchor links con smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (target && scroller) {
      e.preventDefault();
      scroller.scrollTo(target);
    }
  });
});

/* ══════════════════════════════════════
   A — CHARACTER-BY-CHARACTER REVEAL
══════════════════════════════════════ */
function splitCharsAnimate(el, baseDelay, charDelay) {
  if (reducedMotion) return;
  const text = el.textContent;
  el.innerHTML = text.split('').map((ch, i) =>
    `<span class="char" style="--d:${baseDelay + i * charDelay}ms">${ch === ' ' ? '&nbsp;' : ch}</span>`
  ).join('');
}

const nameFirst = document.querySelector('.hero__name-first');
const nameLast  = document.querySelector('.hero__name-last');

if (nameFirst) splitCharsAnimate(nameFirst, 180, 52);
// nameLast usa clip-path wipe (mantiene gradient) — non serve char split

/* ── Nav scroll ── */
const nav = document.getElementById('nav');
const scrollEl = () => lenis ? lenis.scroll : window.scrollY;
window.addEventListener('scroll', () => {
  nav.classList.toggle('nav--scrolled', window.scrollY > 40);
}, { passive: true });

/* ── Hamburger ── */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
let menuOpen = false;
hamburger.addEventListener('click', () => {
  menuOpen = !menuOpen;
  mobileMenu.classList.toggle('open', menuOpen);
  hamburger.classList.toggle('open', menuOpen);
  document.body.style.overflow = menuOpen ? 'hidden' : '';
});
document.querySelectorAll('.mob-link').forEach(l => {
  l.addEventListener('click', () => {
    menuOpen = false;
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ── Hero parallax glow ── */
const heroGlow = document.querySelector('.hero__glow');
if (heroGlow && !reducedMotion) {
  window.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth  - 0.5) * 60;
    const y = (e.clientY / window.innerHeight - 0.5) * 60;
    heroGlow.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
  }, { passive: true });
}

/* ── Hero photo parallax on scroll (desktop only) ── */
const heroPhotoCol = document.querySelector('.hero__photo-col');
const isMobile = () => window.innerWidth <= 640;
if (heroPhotoCol && !reducedMotion) {
  window.addEventListener('scroll', () => {
    if (isMobile()) { heroPhotoCol.style.transform = ''; return; }
    const y = window.scrollY;
    if (y < window.innerHeight * 1.4)
      heroPhotoCol.style.transform = `translateY(${y * 0.10}px)`;
  }, { passive: true });
}

/* ── Card mouse-tracking glow ── */
if (!reducedMotion) {
  document.querySelectorAll('.bento__card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
      const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
    });
    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--mx', '50%');
      card.style.setProperty('--my', '50%');
    });
  });
}

/* ── Scroll reveal — con stagger per gruppi ── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = parseInt(entry.target.dataset.delay || 0);
      setTimeout(() => entry.target.classList.add('visible'), delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

/* Gruppi con stagger differenziato */
const revealGroups = [
  { sel: '.about__card',         delay: 80 },
  { sel: '.bento__card',         delay: 70 },
  { sel: '.cert',                delay: 90 },
  { sel: '.timeline__item',      delay: 100 },
  { sel: '.review-card',         delay: 80 },
  { sel: '.trust-badge',         delay: 60 },
  { sel: '.contact__info',       delay: 0  },
  { sel: '.contact__form-wrap',  delay: 120 },
];

revealGroups.forEach(({ sel, delay }) => {
  document.querySelectorAll(sel).forEach((el, i) => {
    el.classList.add('reveal');
    el.dataset.delay = i * delay;
    revealObserver.observe(el);
  });
});

/* ── Counter animation — più drammatico con overshoot ── */
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  if (isNaN(target)) return;
  const duration = reducedMotion ? 0 : 1600;
  if (duration === 0) { el.textContent = target; return; }
  const start = performance.now();

  const update = now => {
    const p = Math.min((now - start) / duration, 1);
    // Ease out quart + slight overshoot feel
    const eased = p < 1 ? 1 - Math.pow(1 - p, 4) : 1;
    el.textContent = Math.round(eased * target);
    if (p < 1) requestAnimationFrame(update);
    else el.textContent = target;
  };
  requestAnimationFrame(update);
}

new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      entry.target.closest('.stat-item')?.classList.add('stat-fired');
    }
  });
}, { threshold: 0.7 }).observe(
  ...document.querySelectorAll('.counter')
);

// Attacca a tutti i counter
document.querySelectorAll('.counter').forEach(el => {
  new IntersectionObserver((entries, obs) => {
    if (entries[0].isIntersecting) {
      animateCounter(el);
      obs.disconnect();
    }
  }, { threshold: 0.6 }).observe(el);
});

/* ── Active nav link ── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav__links a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 160) current = s.id;
  });
  navLinks.forEach(l => {
    const isActive = l.getAttribute('href') === `#${current}`;
    l.style.color = isActive ? '#fff' : '';
  });
}, { passive: true });

/* ── Magnetic buttons ── */
if (!reducedMotion) {
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width  / 2;
      const y = e.clientY - rect.top  - rect.height / 2;
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

/* ════════════════════════════════════════
   GDPR COOKIE CONSENT
════════════════════════════════════════ */
const CONSENT_KEY = 'fg_cookie_consent';
function initCookieBanner() {
  const banner = document.getElementById('cookieBanner');
  if (!banner) return;
  if (!localStorage.getItem(CONSENT_KEY)) {
    setTimeout(() => banner.classList.add('show'), 900);
  }
  const close = () => banner.classList.remove('show');
  document.getElementById('cookieAccept')?.addEventListener('click', () => {
    saveConsent({ necessary:true, analytics:true, marketing:true }); close();
  });
  document.getElementById('cookieReject')?.addEventListener('click', () => {
    saveConsent({ necessary:true, analytics:false, marketing:false }); close();
  });
  document.getElementById('cookieManage')?.addEventListener('click', () => {
    saveConsent({ necessary:true, analytics:false, marketing:false }); close();
  });
  document.getElementById('openCookieSettings')?.addEventListener('click', () => {
    localStorage.removeItem(CONSENT_KEY); banner.classList.add('show');
  });
}
function saveConsent(prefs) {
  localStorage.setItem(CONSENT_KEY, JSON.stringify({
    ...prefs, timestamp: new Date().toISOString(), version: '1.0'
  }));
}
initCookieBanner();

/* ════════════════════════════════════════
   CSRF TOKEN
════════════════════════════════════════ */
function generateCSRF() {
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  const token = Array.from(arr, b => b.toString(16).padStart(2,'0')).join('');
  sessionStorage.setItem('csrf_token', token);
  const el = document.getElementById('csrf_token');
  if (el) el.value = token;
}
generateCSRF();

/* ════════════════════════════════════════
   FORM VALIDATION — XSS-safe
════════════════════════════════════════ */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const sanitize = s => s.replace(/[<>"'`]/g, '').trim();
  const validators = {
    fname:    { pattern: /^[a-zA-ZÀ-ÿ\s'\-]{2,60}$/, msg: 'Nome non valido (solo lettere, 2–60 caratteri).' },
    femail:   { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, msg: 'Email non valida.' },
    fphone:   { pattern: /^[\+]?[\d\s\-\(\)]{7,20}$/, msg: 'Numero non valido.', optional: true },
    fmessage: { minLen: 10, msg: 'Messaggio troppo corto (min. 10 caratteri).' },
  };

  function setFieldState(id, isValid, msg='') {
    const input = document.getElementById(id);
    const error = document.getElementById(id + '-error');
    if (!input) return;
    input.classList.toggle('valid',  isValid);
    input.classList.toggle('invalid',!isValid);
    if (error) error.textContent = isValid ? '' : msg;
  }

  function validateField(id, value) {
    const v = validators[id];
    if (!v) return true;
    const clean = sanitize(value);
    if (v.optional && !clean) { setFieldState(id, true); return true; }
    if (!clean) { setFieldState(id, false, v.msg); return false; }
    if (v.pattern && !v.pattern.test(clean)) { setFieldState(id, false, v.msg); return false; }
    if (v.minLen && clean.length < v.minLen) { setFieldState(id, false, v.msg); return false; }
    setFieldState(id, true);
    return true;
  }

  ['fname','femail','fphone','fmessage'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('blur', () => validateField(id, el.value));
  });

  // Character counter
  const textarea = document.getElementById('fmessage');
  const charCount = document.getElementById('charCount');
  if (textarea && charCount) {
    textarea.addEventListener('input', () => {
      const n = textarea.value.length;
      charCount.textContent = `${n} / 1000`;
      charCount.style.color = n > 900 ? '#e53e3e' : n > 700 ? '#f59e0b' : '#aaa';
    });
  }

  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    // Honeypot
    const hp = document.getElementById('hp_website');
    if (hp?.value.trim()) return;
    // GDPR
    const gdpr = document.getElementById('gdpr_consent');
    if (!gdpr?.checked) {
      const err = document.getElementById('gdpr-error');
      if (err) err.textContent = 'Devi accettare la Privacy Policy per continuare.';
      gdpr.closest('.form-field')?.scrollIntoView({ behavior:'smooth', block:'center' });
      return;
    }
    if (document.getElementById('gdpr-error')) document.getElementById('gdpr-error').textContent = '';

    const valid = ['fname','femail','fphone','fmessage'].map(id =>
      validateField(id, document.getElementById(id)?.value || '')
    ).every(Boolean);
    if (!valid) return;

    const btn = document.getElementById('submitBtn');
    if (btn) { btn.disabled = true; btn.innerHTML = '⏳ Invio in corso...'; }

    /* ── NETLIFY FORMS ─────────────────────────────────────
       Zero configurazione. Funziona automaticamente quando
       il sito è pubblicato su Netlify.
       I messaggi arrivano su: Netlify → Impostazioni → Forms
       Puoi collegare email/Slack nelle notifiche Netlify.
       ───────────────────────────────────────────────────── */
    const formData = new FormData(contactForm);
    formData.append('form-name', 'contatti-federico');

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formData).toString()
    })
    .then(res => {
      if (!res.ok) throw new Error('Errore server');
      return res.json();
    })
    .then(() => {
      if (btn) {
        btn.innerHTML = '✅ Messaggio inviato! Ti rispondo entro 24h';
        btn.style.background = '#1a7a4a';
        setTimeout(() => {
          btn.innerHTML = 'Invia messaggio <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
          btn.style.background = '';
          btn.disabled = false;
          contactForm.reset();
          ['fname','femail','fphone','fmessage'].forEach(id => {
            document.getElementById(id)?.classList.remove('valid','invalid');
          });
          if (charCount) charCount.textContent = '0 / 1000';
          generateCSRF();
        }, 4000);
      }
    })
    .catch(() => {
      if (btn) {
        btn.innerHTML = '❌ Errore invio. Riprova o scrivimi su WhatsApp.';
        btn.style.background = '#c0392b';
        setTimeout(() => {
          btn.innerHTML = 'Invia messaggio <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
          btn.style.background = '';
          btn.disabled = false;
        }, 3000);
      }
    });
  });
}
