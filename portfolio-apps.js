(() => {
  'use strict';

  function initializeApps() {
    const $ = selector => document.querySelector(selector);
    const $$ = selector => [...document.querySelectorAll(selector)];
    const root = document.documentElement;
    const data = window.PORTFOLIO_DATA || { projects: {}, contributions: [] };
    const appNames = new Set(['work', 'project', 'oss', 'about', 'research', 'contact', 'toolbox', 'education', 'routine']);
    const routeNames = new Set(['work', 'about', 'oss', 'research', 'contact']);
    const dialogStack = [];
    const openers = new WeakMap();
    const backdropPresses = new WeakMap();
    const brand = $('.os-brand');
    const toast = $('#toast');
    let toastTimer;

    function topDialog() {
      return [...dialogStack].reverse().find(dialog => dialog.open);
    }

    function syncApps() {
      const top = topDialog();
      let activeName = top?.id.replace(/-dialog$/, '');
      if (activeName === 'project') activeName = 'work';
      document.body.classList.toggle('modal-open', Boolean(top));
      $$('.app-launcher[data-open]').forEach(button => {
        const active = button.dataset.open === activeName;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-expanded', String(active));
      });
    }

    function routeFromStack() {
      for (let index = dialogStack.length - 1; index >= 0; index--) {
        const dialog = dialogStack[index];
        if (!dialog.open) continue;
        const name = dialog.id.replace(/-dialog$/, '');
        if (name === 'project') return 'work';
        if (routeNames.has(name)) return name;
      }
      return 'home';
    }

    function writeRoute(mode = 'replace') {
      const route = routeFromStack();
      if (location.hash === '#' + route || (route === 'home' && !location.hash)) return;
      const url = new URL(location.href);
      url.hash = route;
      try {
        history[mode === 'push' ? 'pushState' : 'replaceState'](history.state, '', url);
      } catch { /* App controls also work when history access is restricted. */ }
    }

    function focusSafely(preferred) {
      const top = topDialog();
      const usable = preferred instanceof HTMLElement && preferred.isConnected &&
        !preferred.closest('[hidden], [inert]') && preferred.getClientRects().length > 0 &&
        (!preferred.closest('dialog') || preferred.closest('dialog').open) &&
        (!top || preferred.closest('dialog') === top);
      const target = usable ? preferred : top?.querySelector('[data-close]') || brand;
      target?.focus({ preventScroll: true });
    }

    function clearToast() {
      clearTimeout(toastTimer);
      if (!toast) return;
      toast.classList.remove('show');
      toast.textContent = '';
      (topDialog() || document.body).append(toast);
    }

    function finishClose(dialog, restoreFocus, updateRoute) {
      const index = dialogStack.indexOf(dialog);
      if (index === -1) return;
      const wasTop = index === dialogStack.length - 1;
      dialogStack.splice(index, 1);
      backdropPresses.delete(dialog);
      syncApps();
      clearToast();
      if (updateRoute) writeRoute();
      if (restoreFocus && wasTop) focusSafely(openers.get(dialog));
    }

    function closeDialog(dialog, { restoreFocus = true, updateRoute = true } = {}) {
      if (!dialog) return;
      const index = dialogStack.indexOf(dialog);
      // Close children first so no modal is left above a closed parent.
      if (index !== -1) {
        [...dialogStack.slice(index + 1)].reverse().forEach(child => {
          if (child.open) child.close();
          finishClose(child, false, false);
        });
      }
      if (dialog.open) dialog.close();
      finishClose(dialog, restoreFocus, updateRoute);
    }

    function closeAll({ restoreFocus = true, updateRoute = true } = {}) {
      const hadApps = dialogStack.length > 0;
      [...dialogStack].reverse().forEach(dialog => closeDialog(dialog, { restoreFocus: false, updateRoute: false }));
      syncApps();
      if (updateRoute) writeRoute();
      if (restoreFocus && hadApps) focusSafely(brand);
    }

    function openDialog(dialog, opener, { updateRoute = true } = {}) {
      if (!dialog) return;
      if (dialog.open) {
        const index = dialogStack.indexOf(dialog);
        if (index !== -1) {
          [...dialogStack.slice(index + 1)].reverse().forEach(child => closeDialog(child, { restoreFocus: false, updateRoute: false }));
        }
        syncApps();
        focusSafely(dialog.querySelector('[data-close]'));
        if (updateRoute) writeRoute();
        return;
      }
      openers.set(dialog, opener || document.activeElement);
      dialog.showModal();
      dialogStack.push(dialog);
      dialog.scrollTop = 0;
      const content = dialog.querySelector('.app-content');
      if (content) content.scrollTop = 0;
      syncApps();
      clearToast();
      focusSafely(dialog.querySelector('[data-close]'));
      if (updateRoute) writeRoute('push');
    }

    function openApp(name, opener, options) {
      if (!appNames.has(name) || name === 'project') return;
      openDialog(document.getElementById(name + '-dialog'), opener, options);
    }

    function isOutside(dialog, event) {
      const bounds = dialog.getBoundingClientRect();
      return event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom;
    }

    $$('dialog').forEach(dialog => {
      dialog.addEventListener('cancel', event => {
        event.preventDefault();
        if (topDialog() === dialog) closeDialog(dialog);
      });
      dialog.addEventListener('pointerdown', event => {
        backdropPresses.set(dialog, event.target === dialog && isOutside(dialog, event));
      });
      dialog.addEventListener('click', event => {
        const startedOutside = backdropPresses.get(dialog);
        backdropPresses.delete(dialog);
        if (startedOutside && event.target === dialog && isOutside(dialog, event)) closeDialog(dialog);
      });
      // Covers native form method="dialog" closures as well as the buttons below.
      dialog.addEventListener('close', () => {
        if (!dialog.open) finishClose(dialog, true, true);
      });
    });

    brand?.addEventListener('click', event => {
      event.preventDefault();
      closeAll();
    });

    function setText(id, value) {
      const element = document.getElementById(id);
      if (element) element.textContent = value || '';
    }

    function openProject(name, opener) {
      const project = data.projects?.[name];
      if (!project) return;
      ['title', 'kicker', 'summary', 'role', 'stack', 'idea', 'features', 'note'].forEach(key => {
        setText('detail-' + key, project[key]);
      });
      setText('detail-file', name + ' / project_notes.txt');
      const primary = $('#detail-primary');
      if (primary) {
        primary.href = project.url;
        primary.textContent = project.label.toUpperCase() + ' \u2197';
      }
      const secondary = $('#detail-secondary');
      if (secondary) {
        secondary.hidden = !project.secondary;
        if (project.secondary) {
          secondary.href = project.secondary;
          secondary.textContent = project.secondaryLabel.toUpperCase() + ' \u2197';
        }
      }
      openDialog($('#project-dialog'), opener);
    }

    function filterProjects(button) {
      $$('#work-dialog [data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      let visible = 0;
      $$('#work-dialog .explorer-project').forEach(project => {
        project.hidden = button.dataset.filter !== 'all' && project.dataset.category !== button.dataset.filter;
        if (!project.hidden) visible++;
      });
      setText('filter-status', 'Showing ' + visible + (visible === 1 ? ' project' : ' projects'));
      const count = $('#work-dialog .app-status span:first-child');
      if (count) count.textContent = visible + (visible === 1 ? ' item' : ' items');
    }

    document.addEventListener('click', event => {
      if (!(event.target instanceof Element)) return;
      const button = event.target.closest('[data-close], [data-project], [data-filter], [data-open]');
      if (!button || button.matches(':disabled, [aria-disabled="true"]')) return;
      if (button.hasAttribute('data-close')) {
        event.preventDefault();
        closeDialog(button.closest('dialog'));
      } else if (button.hasAttribute('data-project')) {
        event.preventDefault();
        openProject(button.dataset.project, button);
      } else if (button.hasAttribute('data-filter')) {
        event.preventDefault();
        filterProjects(button);
      } else if (appNames.has(button.dataset.open)) {
        event.preventDefault();
        openApp(button.dataset.open, button);
      }
      // Download, mailto and external links retain their native behavior.
    });

    const contributionList = $('#contribution-list');
    if (contributionList) {
      const fragment = document.createDocumentFragment();
      (data.contributions || []).forEach(item => {
        const link = document.createElement('a');
        link.className = 'contribution';
        link.href = item.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        const body = document.createElement('div');
        const repo = document.createElement('span');
        repo.className = 'contribution-repo';
        repo.textContent = item.repo + ' / #' + item.number;
        const title = document.createElement('h4');
        title.textContent = item.title + ' \u2197';
        const description = document.createElement('p');
        description.textContent = item.description;
        body.append(repo, title, description);
        const status = document.createElement('span');
        const state = ['merged', 'draft', 'open'].includes(item.status) ? item.status : 'open';
        status.className = 'contribution-status ' + state;
        status.textContent = state === 'merged' ? '\u21b3 MERGED' : state === 'draft' ? 'DRAFT PR' : 'OPEN PR';
        link.append(body, status);
        fragment.append(link);
      });
      contributionList.replaceChildren(fragment);
    }

    function notify(message) {
      if (!toast) return;
      (topDialog() || document.body).append(toast);
      toast.textContent = message;
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('show'), 4000);
    }

    $('#copy-email')?.addEventListener('click', async () => {
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText('tanmaysurte.ts@gmail.com');
        notify('Email copied. Say hello when you\'re ready.');
      } catch {
        notify('Email: tanmaysurte.ts@gmail.com');
      }
    });

    const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
    const motionButton = $('#motion-button');
    let userPaused = false;
    try { userPaused = localStorage.getItem('tanmay-dollhouse-motion') === 'paused'; } catch { /* Storage is optional. */ }
    function syncMotion() {
      const paused = userPaused || motionPreference.matches;
      root.classList.toggle('motion-paused', paused);
      if (motionButton) {
        motionButton.setAttribute('aria-pressed', String(paused));
        motionButton.setAttribute('aria-label', paused ? 'Resume ambient motion' : 'Pause ambient motion');
        motionButton.textContent = paused ? '\u25b7' : '\u2161';
        motionButton.title = motionPreference.matches ? 'Reduced motion follows your device preference' : paused ? 'Resume ambient motion' : 'Pause ambient motion';
        motionButton.disabled = motionPreference.matches;
      }
      window.dispatchEvent(new CustomEvent('portfolio:motion', { detail: { paused } }));
    }
    motionButton?.addEventListener('click', () => {
      userPaused = !userPaused;
      try { localStorage.setItem('tanmay-dollhouse-motion', userPaused ? 'paused' : 'running'); } catch { /* Storage is optional. */ }
      syncMotion();
    });
    motionPreference.addEventListener('change', syncMotion);
    syncMotion();

    const fullscreenButton = $('#fullscreen-button');
    if (fullscreenButton) {
      fullscreenButton.hidden = !document.fullscreenEnabled;
      function syncFullscreen() {
        const full = Boolean(document.fullscreenElement);
        fullscreenButton.setAttribute('aria-pressed', String(full));
        fullscreenButton.setAttribute('aria-label', full ? 'Exit full screen' : 'Enter full screen');
        fullscreenButton.title = full ? 'Exit full screen' : 'Full screen';
        fullscreenButton.textContent = full ? '\u25a3' : '\u25a1';
      }
      fullscreenButton.addEventListener('click', async () => {
        try {
          if (document.fullscreenElement) await document.exitFullscreen();
          else await root.requestFullscreen();
        } catch {
          notify('Full screen is unavailable in this browser.');
        }
      });
      document.addEventListener('fullscreenchange', syncFullscreen);
      syncFullscreen();
    }

    function applyRoute() {
      const route = location.hash.slice(1).toLowerCase();
      if (routeNames.has(route)) {
        const dialog = document.getElementById(route + '-dialog');
        if (!dialog) return;
        if (!dialog.open) closeAll({ restoreFocus: false, updateRoute: false });
        const launcher = $$('.app-launcher[data-open]').find(button => button.dataset.open === route);
        openApp(route, launcher || brand, { updateRoute: false });
      } else if (!route || route === 'home') {
        closeAll({ updateRoute: false });
      }
    }
    window.addEventListener('hashchange', applyRoute);
    window.addEventListener('popstate', applyRoute);
    syncApps();
    applyRoute();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApps, { once: true });
  } else {
    initializeApps();
  }
})();
