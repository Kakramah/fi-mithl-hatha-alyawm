/* script.js — في مثل هذا اليوم */
'use strict';

/* === هالة المؤشر الذهبية (5.6.1) === */
(function initCursor() {
  const glow = document.getElementById('cursor-glow');
  if (!glow) return;
  const isTouchDevice = window.matchMedia('(hover: none) or (pointer: coarse)').matches;
  if (isTouchDevice) { glow.style.display = 'none'; return; }

  let mx = 0, my = 0, cx = 0, cy = 0, raf;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  function animate() {
    cx += (mx - cx) * 0.08;
    cy += (my - cy) * 0.08;
    glow.style.left = cx + 'px';
    glow.style.top = cy + 'px';
    raf = requestAnimationFrame(animate);
  }
  animate();
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else raf = requestAnimationFrame(animate);
  });
})();

/* === شريط التنقل scrolled === */
(function initNav() {
  const nav = document.getElementById('site-nav');
  if (!nav) return;
  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* === شريط تقدم القراءة === */
(function initProgress() {
  const bar = document.getElementById('reading-progress');
  if (!bar) return;
  function update() {
    const scrollTop = window.scrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docH > 0 ? (scrollTop / docH) * 100 : 0;
    bar.style.width = pct + '%';
    bar.setAttribute('aria-valuenow', Math.round(pct));
  }
  window.addEventListener('scroll', update, { passive: true });
})();

/* === مؤشر التمرير في الـ Hero === */
(function initScrollIndicator() {
  const ind = document.getElementById('scroll-indicator');
  if (!ind) return;
  function check() {
    ind.classList.toggle('hidden', window.scrollY > 80);
  }
  window.addEventListener('scroll', check, { passive: true });
})();

/* === الظهور عند التمرير (Reveal) === */
(function initReveal() {
  const items = document.querySelectorAll('.reveal-up, .reveal-fade');
  if (!items.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  items.forEach(el => obs.observe(el));
})();

/* === Parallax للـ Hero (سطح المكتب فقط) === */
(function initParallax() {
  const img = document.querySelector('.hero-img');
  if (!img) return;
  const mq = window.matchMedia('(min-width: 769px) and (prefers-reduced-motion: no-preference)');
  if (!mq.matches) return;
  function onScroll() {
    const y = window.scrollY * 0.25;
    img.style.setProperty('--parallax-y', `-${y}px`);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* === نقاط التنقل الجانبية === */
(function initSideDots() {
  const dots = document.querySelectorAll('.nav-dot');
  if (!dots.length) return;
  const sections = Array.from(dots).map(d => document.getElementById(d.dataset.target)).filter(Boolean);

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const target = document.getElementById(dot.dataset.target);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        dots.forEach(d => d.classList.toggle('active', d.dataset.target === e.target.id));
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => obs.observe(s));
})();

/* === Lightbox (5.7.6) === */
(function initLightbox() {
  const overlay = document.getElementById('lightbox-overlay');
  const lbImg = document.getElementById('lightbox-img');
  const closeBtn = document.getElementById('lightbox-close');
  if (!overlay || !lbImg || !closeBtn) return;

  let lastFocus = null;

  function open(src, alt) {
    lbImg.src = src;
    lbImg.alt = alt || '';
    overlay.style.display = 'flex';
    closeBtn.focus();
    document.body.style.overflow = 'hidden';
  }
  function close() {
    overlay.style.display = 'none';
    lbImg.src = '';
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll('.lightbox-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      lastFocus = btn;
      open(btn.dataset.img, btn.dataset.alt);
    });
  });

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.style.display !== 'none') close();
  });
})();

/* === عداد لحظة الرقم (5.7.1 · 8.4.2) === */
(function initCounters() {
  const counter = document.getElementById('moment-count') || document.querySelector('.moment-number[data-target]');
  if (!counter) return;

  const target = parseInt(counter.dataset.target || '15', 10);
  const pref = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (pref.matches) {
    counter.textContent = target;
    return;
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      obs.unobserve(e.target);

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        counter.textContent = target;
        return;
      }

      let current = 0;
      const duration = 1200;
      const start = performance.now();
      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        current = Math.round(progress * target);
        counter.textContent = current;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.3 });

  obs.observe(counter);
})();

/* === نموذج الميثاق (4.10 · 8.2) === */
(function initPledgeForm() {
  const form = document.getElementById('pledge-form');
  const btn = document.getElementById('pledge-submit-btn');
  const successMsg = document.getElementById('success-message');
  if (!form || !btn || !successMsg) return;

  const COOLDOWN = 30000;
  const CD_KEY = 'pledge-last-submit';

  // التبريد في التخزين المحلي لا في الذاكرة — إعادة تحميل الصفحة كانت تُصفّره (4.10.5)
  function lastSubmitAt() {
    try { return parseInt(localStorage.getItem(CD_KEY), 10) || 0; } catch { return 0; }
  }
  function markSubmit() {
    try { localStorage.setItem(CD_KEY, String(Date.now())); } catch {}
  }
  // رسالة واحدة داخل الصفحة لكل الحالات — لا alert() ولا أنماط inline (4.10.2)
  function showFormMsg(text, isError) {
    let el = form.querySelector('.form-msg');
    if (!el) {
      el = document.createElement('p');
      el.className = 'form-msg';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      form.appendChild(el);
    }
    el.classList.toggle('form-msg--error', !!isError);
    el.textContent = text;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();

    // مصيدة الروبوت
    if (form.querySelector('[name="botcheck"]').checked) return;

    // حماية إعادة الإرسال — تُبلِّغ ولا تصمت
    const now = Date.now();
    const waited = now - lastSubmitAt();
    if (waited < COOLDOWN) {
      showFormMsg('وصلَنا توقيعك قبل قليل. انتظر ' + Math.ceil((COOLDOWN - waited) / 1000) + ' ثانية قبل إرسالٍ آخر.', false);
      return;
    }
    // يُختم قبل الإرسال لا بعد نجاحه — وإلا بقيت المحاولات الفاشلة بلا حدّ
    markSubmit();

    // تعطيل الزر
    const btnText = btn.querySelector('.btn-text');
    const btnLoading = btn.querySelector('.btn-loading');
    btn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = '';

    try {
      const data = new FormData(form);
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: data
      });
      const json = await res.json();
      if (json.success) {
        form.style.display = 'none';
        successMsg.style.display = 'block';
        successMsg.focus();
      } else {
        throw new Error(json.message || 'خطأ في الإرسال');
      }
    } catch (err) {
      btnText.style.display = '';
      btnLoading.style.display = 'none';
      btn.disabled = false;
      showFormMsg('حدث خطأ في الإرسال، يرجى المحاولة مرة أخرى.', true);
    }
  });
})();

/* === كتلة المشاركة (8.6) === */
(function initShare() {
  const URL = 'https://kakramah.github.io/fi-mithl-hatha-alyawm/';
  const TITLE = 'في مثل هذا اليوم — ثلاثاء الوفاء للشهداء';

  const nativeBtn = document.getElementById('share-native');
  const copyBtn = document.getElementById('share-copy');
  const copyFb = document.getElementById('copy-feedback');
  const afterPledgeBtn = document.getElementById('share-after-pledge');

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: TITLE, url: URL });
      } catch {}
    } else {
      copyToClipboard();
    }
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(URL);
      if (copyFb) {
        copyFb.style.display = 'block';
        setTimeout(() => { copyFb.style.display = 'none'; }, 2500);
      }
    } catch {}
  }

  if (nativeBtn) nativeBtn.addEventListener('click', nativeShare);
  if (copyBtn) copyBtn.addEventListener('click', copyToClipboard);
  if (afterPledgeBtn) afterPledgeBtn.addEventListener('click', nativeShare);

  // إخفاء زر native share إن لم يُدعم وعلى سطح المكتب
  if (nativeBtn && !navigator.share) {
    nativeBtn.style.display = 'none';
  }
})();
