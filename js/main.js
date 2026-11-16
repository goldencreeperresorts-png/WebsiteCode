(() => {
  const body = document.body;
  const intro = document.getElementById('intro');
  const introLogo = document.getElementById('introLogo');
  const heroMark = document.getElementById('heroMark');
  const header = document.getElementById('header');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const skipIntro = new URLSearchParams(location.search).get('intro') === '0';

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Intro: landing screen -> home ---------- */
  const INTRO_HOLD = 3700;
  const EXIT_DURATION = 1500;
  let leaving = false;

  function finishIntro() {
    body.classList.remove('is-intro');
    body.classList.add('is-ready');
    intro && intro.remove();
    onScroll();
  }

  function leaveIntro() {
    if (leaving || !intro) return;
    leaving = true;
    const from = introLogo.getBoundingClientRect();
    const to = heroMark.getBoundingClientRect();
    const dx = (to.left + to.width / 2) - (from.left + from.width / 2);
    const dy = (to.top + to.height / 2) - (from.top + from.height / 2);
    const scale = to.height / from.height;
    body.classList.add('is-revealing');
    intro.classList.add('is-leaving');
    introLogo.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
    setTimeout(finishIntro, EXIT_DURATION);
  }

  if (!intro || reduceMotion || skipIntro) {
    finishIntro();
  } else {
    const heroImg = new Image();
    heroImg.src = document.querySelector('.hero__media img').currentSrc || 'img/hero.jpg';
    const ready = Promise.all([
      new Promise(r => setTimeout(r, INTRO_HOLD)),
      heroImg.decode ? heroImg.decode().catch(() => {}) : Promise.resolve(),
      document.fonts ? document.fonts.ready : Promise.resolve()
    ]);
    ready.then(leaveIntro);
    intro.addEventListener('click', leaveIntro);
    window.addEventListener('keydown', e => { if (e.key === 'Escape' || e.key === 'Enter') leaveIntro(); });
  }

  /* ---------- Header state ---------- */
  function onScroll() {
    header.classList.toggle('header--solid', window.scrollY > window.innerHeight - 100);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  /* ---------- Menu ---------- */
  const menuBtn = document.getElementById('menuBtn');
  const toggleMenu = open => {
    body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  };
  menuBtn.addEventListener('click', () => toggleMenu(!body.classList.contains('menu-open')));
  document.querySelectorAll('.menu a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));

  /* ---------- Hero card ---------- */
  const card = document.querySelector('.hero__card');
  card.querySelector('.hero__card-close').addEventListener('click', () => card.classList.add('is-closed'));

  /* ---------- Sliders ---------- */
  document.querySelectorAll('[data-slider]').forEach(slider => {
    const track = slider.querySelector('.slider__track');
    const slides = [...track.children];
    let index = 0;
    const step = () => {
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return slides[0].getBoundingClientRect().width + gap;
    };
    const maxIndex = () => {
      const visible = Math.max(1, Math.floor((slider.clientWidth + 1) / step()));
      return Math.max(0, slides.length - visible);
    };
    const go = i => {
      const max = maxIndex();
      index = i < 0 ? max : i > max ? 0 : i;
      track.style.transform = `translateX(${-index * step()}px)`;
    };
    slider.querySelector('.slider__btn--prev').addEventListener('click', () => go(index - 1));
    slider.querySelector('.slider__btn--next').addEventListener('click', () => go(index + 1));
    window.addEventListener('resize', () => go(index));
  });

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); } });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();
