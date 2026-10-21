(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const root = document.documentElement;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const motionButton = $('.motion-toggle');
  let userPaused = false;
  try { userPaused = localStorage.getItem('tanmay-motion-paused') === 'true'; } catch { /* Storage is optional. */ }

  function syncMotion() {
    const paused = userPaused || reducedMotion.matches;
    root.classList.toggle('motion-paused', paused);
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.innerHTML = paused ? 'Motion paused <span aria-hidden="true">▷</span>' : 'Pause motion <span aria-hidden="true">Ⅱ</span>';
    motionButton.disabled = reducedMotion.matches;
    motionButton.title = reducedMotion.matches ? 'Reduced motion follows your device preference' : 'Toggle decorative animation';
  }
  syncMotion();
  motionButton.addEventListener('click', () => {
    userPaused = !userPaused;
    syncMotion();
    try { localStorage.setItem('tanmay-motion-paused', String(userPaused)); } catch { /* Storage is optional. */ }
  });
  reducedMotion.addEventListener('change', syncMotion);

  const menuButton = $('.menu-toggle');
  const navigation = $('#navigation');
  function closeMenu() {
    menuButton.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
  }
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('is-open', open);
  });
  $$('#navigation a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      closeMenu(); menuButton.focus();
    }
  });
  matchMedia('(min-width: 621px)').addEventListener('change', closeMenu);

  const projects = {
    tireless: {
      title: 'The Tireless Hand', kicker: 'AGENT EVALUATION / FLYTBASE HACKATHON',
      summary: 'An LLM mutation agent meets a deterministic test harness for a drone flight cockpit.',
      role: 'Engineering & QA automation', stack: 'TypeScript · Playwright · Socket.IO',
      idea: 'A convincing cockpit UI can still be wrong. Test whether it reflects what the drone is actually doing—even when telemetry is stale, the link drops, or panels disagree.',
      features: 'A mutation agent injects realistic defects. Seven deterministic checks compare the interface against independent telemetry, with no LLM calls in the test loop. The report includes recordings, evidence, and the defects the harness missed.',
      note: 'Reported evaluation: 11 of 13 injected bugs caught, with zero false alarms across three clean or harmless builds. Two misses are documented. These are results from this test set, not a general reliability guarantee.',
      url: 'https://github.com/Tanmay-Ts/Tireless', label: 'Explore the repository ↗',
      secondary: 'https://github.com/Tanmay-Ts/Tireless/blob/main/qa/recordings/report-cloud.md', secondaryLabel: 'Read the evaluation ↗'
    },
    vigil: {
      title: 'Vigil', kicker: 'AI PRODUCT / FOUNDER & BUILDER',
      summary: 'Brand-reputation monitoring with a perception layer for what AI models say about a brand.',
      role: 'Founder & solo builder', stack: 'Next.js · FastAPI · Supabase',
      idea: 'Understand a brand’s online reputation across public signals and AI answers, and spot the early signs of a reputation crisis.',
      features: 'Vigil probes ChatGPT, Gemini, and Perplexity for brand perception. Feedback from PR and GEO agencies shaped the roadmap, including crisis detection and a free brand checker. It grew out of NeuroChain, a public Mumbai Hacks 2025 prototype.',
      note: 'Vigil’s current product code is private. NeuroChain is the public earlier prototype. Its README reports a top-five finish among 5,000 teams at Mumbai Hacks 2025.',
      url: 'https://getvigil.in/', label: 'Visit Vigil ↗',
      secondary: 'https://github.com/Tanmay-Ts/neurochain', secondaryLabel: 'Explore the prototype ↗'
    },
    driving: {
      title: 'Driving Seat', kicker: 'OPEN SOURCE / HUMAN–AGENT COLLABORATION',
      summary: 'A Claude Code skill for keeping human judgment in the decisions that matter.',
      role: 'Skill design & implementation', stack: 'Claude Code · Agent instructions · Scenario evaluation',
      idea: 'AI can write code quickly. The developer should still own the intent, tradeoffs, and consequential decisions behind that code.',
      features: 'The skill encourages measurable specifications, records routine choices, and surfaces consequential decisions for the developer. The result is a more explicit, auditable collaboration between a person and a coding agent.',
      note: 'The repository includes four written evaluation scenarios. The supplied résumé reports one run per scenario, all meeting the checks, with self-grading. Treat this as a sanity check, not a broad benchmark.',
      url: 'https://github.com/Tanmay-Ts/driving-seat', label: 'Explore the skill ↗',
      secondary: 'https://github.com/Tanmay-Ts/driving-seat#readme', secondaryLabel: 'Read the approach ↗'
    },
    reels: {
      title: 'Reel-MMA', kicker: 'VIDEO AUTOMATION / EXPERIMENT CURRENTLY PAUSED',
      summary: 'An automated highlight-reel pipeline built for Ignition MMA training footage.',
      role: 'Pipeline engineering', stack: 'Python · GPT-4o · ffmpeg · Cloudflare R2',
      idea: 'Turn long training sessions into candidate vertical highlights without handing over the final editorial decision.',
      features: 'Motion and audio heuristics find candidate moments. GPT-4o vision scores the action, and ffmpeg renders 9:16 reels. GitHub Actions runs the workflow, Cloudflare R2 handles media storage, and outputs go to human review.',
      note: 'Currently paused because vision API costs per reel were too high. This is a documented engineering experiment; it does not automatically publish video.',
      url: 'https://github.com/Tanmay-Ts/Reel-MMA', label: 'Explore the pipeline ↗',
      secondary: 'https://github.com/Tanmay-Ts/Reel-MMA#readme', secondaryLabel: 'Read the project notes ↗'
    }
  };
  const openers = new WeakMap();
  function openDialog(dialog, opener) {
    openers.set(dialog, opener);
    dialog.showModal();
    document.body.classList.add('modal-open');
    dialog.scrollTop = 0;
    dialog.querySelector('[data-close]').focus({ preventScroll: true });
  }
  $$('dialog').forEach(dialog => {
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('modal-open');
      openers.get(dialog)?.focus({ preventScroll: true });
    });
  });
  $$('[data-project]').forEach(button => button.addEventListener('click', () => {
    const project = projects[button.dataset.project];
    for (const key of ['title', 'kicker', 'summary', 'role', 'stack', 'idea', 'features', 'note']) {
      $('#dialog-' + key).textContent = project[key];
    }
    $('#dialog-primary').href = project.url;
    $('#dialog-primary').textContent = project.label;
    $('#dialog-secondary').href = project.secondary;
    $('#dialog-secondary').textContent = project.secondaryLabel;
    openDialog($('#project-dialog'), button);
  }));
  $('[data-research]').addEventListener('click', event => openDialog($('#research-dialog'), event.currentTarget));

  $$('[data-filter]').forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    $$('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    let count = 0;
    $$('.project-card').forEach(card => {
      card.hidden = filter !== 'all' && card.dataset.category !== filter;
      if (!card.hidden) { count++; card.classList.add('is-visible'); }
    });
    $('#filter-status').textContent = String(count).padStart(2, '0') + (filter === 'all' ? ' SELECTED PROJECTS' : filter === 'ai' ? ' AI & AGENT PROJECTS' : ' AUTOMATION PROJECT');
  }));
  let toastTimer;
  function notify(message) {
    $('#toast').textContent = message;
    $('#toast').classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 4000);
  }
  $('#copy-email').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('tanmaysurte.ts@gmail.com');
      notify('Email copied. Let’s make something good.');
    } catch { notify('Reach me at tanmaysurte.ts@gmail.com'); }
  });

  const clock = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false });
  function updateClock() {
    const now = new Date();
    $('#local-time').textContent = clock.format(now) + ' IST';
    $('#local-time').dateTime = now.toISOString();
  }
  updateClock();
  setInterval(updateClock, 60000);
  $('#year').textContent = String(new Date().getFullYear());

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
    $$('.reveal').forEach(element => {
      if (element.getBoundingClientRect().top < innerHeight) element.classList.add('is-visible');
      else revealObserver.observe(element);
    });
    root.classList.add('motion-ready');
    const sectionsObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          $$('#navigation a').forEach(link => {
            const active = link.hash === '#' + entry.target.id;
            link.classList.toggle('active', active);
            if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
          });
        }
      });
    }, { rootMargin: '-15% 0px -60% 0px', threshold: 0 });
    $$('main section[id]').forEach(section => sectionsObserver.observe(section));
  }
  let scrollFrame = false;
  function updateScroll() {
    const maxScroll = document.documentElement.scrollHeight - innerHeight;
    $('.reading-progress').style.width = (maxScroll > 0 ? scrollY / maxScroll * 100 : 0) + '%';
    $('.site-header').classList.toggle('scrolled', scrollY > 20);
    scrollFrame = false;
  }
  addEventListener('scroll', () => { if (!scrollFrame) { scrollFrame = true; requestAnimationFrame(updateScroll); } }, { passive: true });
  updateScroll();
})();
