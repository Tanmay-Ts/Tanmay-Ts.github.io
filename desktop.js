(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const root = document.documentElement;
  const data = window.PORTFOLIO_DATA;
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const motionButton = $('#motion-button');
  let paused = false;
  try { paused = localStorage.getItem('tanmay-retro-motion') === 'paused'; } catch { /* Optional storage. */ }
  function syncMotion() {
    const off = paused || motionPreference.matches;
    root.classList.toggle('motion-paused', off);
    motionButton.setAttribute('aria-pressed', String(off));
    motionButton.setAttribute('aria-label', off ? 'Resume ambient motion' : 'Pause ambient motion');
    motionButton.textContent = off ? '▷' : 'Ⅱ';
    motionButton.title = motionPreference.matches ? 'Reduced motion follows your device preference' : off ? 'Resume ambient motion' : 'Pause ambient motion';
    motionButton.disabled = motionPreference.matches;
    window.dispatchEvent(new CustomEvent('portfolio:motion', { detail: { paused: off } }));
  }
  syncMotion();
  motionButton.addEventListener('click', () => {
    paused = !paused;
    try { localStorage.setItem('tanmay-retro-motion', paused ? 'paused' : 'running'); } catch { /* Optional storage. */ }
    syncMotion();
  });
  motionPreference.addEventListener('change', syncMotion);

  // Fit the desktop to the available height, with compact launchers on small screens.
  const workspace = $('.workspace');
  const introWindow = $('.intro-window');
  const educationWindow = $('.education-window');
  const layoutDesktop = () => {
    const scale = innerWidth > 1000 ? Math.min(1, Math.max(.45, (workspace.clientHeight - 20) / (innerWidth * .625))) : 1;
    workspace.style.setProperty('--scene-scale', scale.toFixed(4));
    workspace.style.setProperty('--intro-height', (introWindow.offsetHeight * scale).toFixed(2) + 'px');
    workspace.style.setProperty('--education-bottom', (educationWindow.offsetTop + educationWindow.offsetHeight * scale).toFixed(2) + 'px');
  };
  layoutDesktop();
  if ('ResizeObserver' in window) {
    const desktopObserver = new ResizeObserver(layoutDesktop);
    [workspace, introWindow, educationWindow].forEach(element => desktopObserver.observe(element));
  }
  addEventListener('resize', layoutDesktop, { passive: true });
  document.fonts.ready.then(layoutDesktop);
  $('#toolbox-app-content').append($('#toolbox-content .toolbox-list').cloneNode(true));
  [...$('#education-content').children].forEach(element => $('#education-app-content').append(element.cloneNode(true)));

  const startButton = $('#start-button');
  const startMenu = $('#start-menu');
  function closeStart(restoreFocus = false) {
    startMenu.hidden = true;
    startButton.setAttribute('aria-expanded', 'false');
    if (restoreFocus) startButton.focus();
  }
  startButton.addEventListener('click', () => {
    const opening = startMenu.hidden;
    startMenu.hidden = !opening;
    startButton.setAttribute('aria-expanded', String(opening));
    if (opening) startMenu.querySelector('button').focus();
  });
  document.addEventListener('click', event => {
    if (!startMenu.hidden && !event.target.closest('#start-menu, #start-button')) closeStart();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !startMenu.hidden) { closeStart(true); event.preventDefault(); }
    if (!startMenu.hidden && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
      const items = [...startMenu.querySelectorAll('button,a')];
      const index = items.indexOf(document.activeElement);
      items[(index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length].focus();
      event.preventDefault();
    }
  });

  function toggleDesktopWindow(button, forceOpen = false) {
    const panel = button.closest('[data-window]');
    const content = document.getElementById(button.getAttribute('aria-controls'));
    const open = forceOpen || button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', (open ? 'Minimize ' : 'Restore ') + panel.dataset.window);
    button.title = (open ? 'Minimize ' : 'Restore ') + panel.dataset.window;
    button.textContent = open ? '−' : '+';
    content.hidden = !open;
    panel.classList.toggle('is-minimized', !open);
  }
  $$('.window-toggle').forEach(button => button.addEventListener('click', () => toggleDesktopWindow(button)));
  $('#restore-windows').addEventListener('click', () => {
    $$('.window-toggle').forEach(button => toggleDesktopWindow(button, true));
    closeStart(true); notify('Desktop windows restored.');
  });

  const openers = new WeakMap();
  const dialogStack = [];
  function syncApps() {
    const top = dialogStack.at(-1);
    document.body.classList.toggle('modal-open', dialogStack.length > 0);
    $$('.task-buttons [data-open]').forEach(button => {
      const active = button.dataset.open + '-dialog' === top?.id;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-expanded', String(active));
    });
  }
  function openDialog(dialog, opener) {
    if (!dialog || dialog.open) return;
    closeStart();
    openers.set(dialog, opener || document.activeElement);
    dialog.showModal();
    dialogStack.push(dialog);
    dialog.scrollTop = 0;
    syncApps();
    dialog.querySelector('[data-close]').focus({ preventScroll: true });
  }
  $$('[data-open]').forEach(button => button.addEventListener('click', () => openDialog($('#' + button.dataset.open + '-dialog'), button)));
  $$('dialog').forEach(dialog => {
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      const index = dialogStack.indexOf(dialog);
      if (index !== -1) dialogStack.splice(index, 1);
      syncApps();
      document.body.append($('#toast'));
      $('#toast').classList.remove('show');
      const opener = openers.get(dialog);
      if (opener?.isConnected && !opener.closest('[hidden]')) opener.focus({ preventScroll: true });
    });
  });
  $('.os-brand').addEventListener('click', () => {
    [...dialogStack].reverse().forEach(dialog => dialog.close());
    closeStart();
  });

  $$('[data-project]').forEach(button => button.addEventListener('click', () => {
    const project = data.projects[button.dataset.project];
    for (const key of ['title', 'kicker', 'summary', 'role', 'stack', 'idea', 'features', 'note']) $('#detail-' + key).textContent = project[key];
    $('#detail-file').textContent = button.dataset.project + ' / project_notes.txt';
    $('#detail-primary').href = project.url;
    $('#detail-primary').textContent = project.label.toUpperCase() + ' ↗';
    $('#detail-secondary').href = project.secondary;
    $('#detail-secondary').textContent = project.secondaryLabel.toUpperCase() + ' ↗';
    openDialog($('#project-dialog'), button);
  }));
  $$('[data-filter]').forEach(button => button.addEventListener('click', () => {
    $$('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    let visible = 0;
    $$('.explorer-project').forEach(project => {
      project.hidden = button.dataset.filter !== 'all' && project.dataset.category !== button.dataset.filter;
      if (!project.hidden) visible++;
    });
    $('#filter-status').textContent = 'Showing ' + visible + (visible === 1 ? ' project' : ' projects');
    $('#work-dialog .app-status span:first-child').textContent = visible + (visible === 1 ? ' item' : ' items');
  }));
  data.contributions.forEach(item => {
    const link = document.createElement('a');
    link.className = 'contribution'; link.href = item.url; link.target = '_blank'; link.rel = 'noopener noreferrer';
    const body = document.createElement('div');
    const repo = document.createElement('span'); repo.className = 'contribution-repo'; repo.textContent = item.repo + ' / #' + item.number;
    const title = document.createElement('h4'); title.textContent = item.title + ' ↗';
    const description = document.createElement('p'); description.textContent = item.description;
    body.append(repo, title, description);
    const status = document.createElement('span'); status.className = 'contribution-status ' + item.status;
    status.textContent = item.status === 'merged' ? '↳ MERGED' : item.status === 'draft' ? 'DRAFT PR' : 'OPEN PR';
    link.append(body, status); $('#contribution-list').append(link);
  });

  let toastTimer;
  function notify(message) {
    const toast = $('#toast');
    (dialogStack.at(-1) || document.body).append(toast);
    toast.textContent = message; toast.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
  }
  $('#copy-email').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText('tanmaysurte.ts@gmail.com'); notify('Email copied. Over to you.'); }
    catch { notify('Email: tanmaysurte.ts@gmail.com'); }
  });
  const fullScreenButton = $('#fullscreen-button');
  if (!document.fullscreenEnabled) fullScreenButton.hidden = true;
  fullScreenButton.addEventListener('click', async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await root.requestFullscreen(); }
    catch { notify('Full screen is unavailable in this browser.'); }
  });
  document.addEventListener('fullscreenchange', () => {
    const full = !!document.fullscreenElement;
    fullScreenButton.setAttribute('aria-label', full ? 'Exit full screen' : 'Enter full screen');
    fullScreenButton.title = full ? 'Exit full screen' : 'Full screen';
    fullScreenButton.textContent = full ? '▣' : '□';
  });
  const clock = new Intl.DateTimeFormat('en-GB', { timeZone:'Asia/Kolkata', hour:'2-digit', minute:'2-digit', hour12:false });
  function tick() { const now = new Date(); $('#clock').textContent = clock.format(now) + ' IST'; $('#clock').dateTime = now.toISOString(); }
  tick(); setInterval(tick, 60000);
  const route = location.hash.slice(1);
  if (['work', 'about', 'oss', 'research', 'contact'].includes(route)) openDialog($('#' + route + '-dialog'), $('.os-brand'));
})();
