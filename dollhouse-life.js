/* Scheduled, illustrated routine. This is not presence or activity tracking. */
(() => {
  'use strict';

  const MINUTES_PER_DAY = 1440;
  const SCHEDULE = [
    { start: 0, end: 390, activity: 'work', label: 'Late-night laptop time' },
    { start: 390, end: 780, activity: 'sleep', label: 'Sleep' },
    { start: 780, end: 840, activity: 'wake', label: 'Wake up & lunch' },
    { start: 840, end: 870, activity: 'read', label: 'Read & learn' },
    { start: 870, end: 900, activity: 'work', label: 'Build & explore' },
    { start: 900, end: 930, activity: 'read', label: 'Read & learn' },
    { start: 930, end: 960, activity: 'work', label: 'Build & explore' },
    { start: 960, end: 990, activity: 'read', label: 'Read & learn' },
    { start: 990, end: 1020, activity: 'work', label: 'Build & explore' },
    { start: 1020, end: 1140, activity: 'chill', label: 'Unwind' },
    { start: 1140, end: 1200, activity: 'prep', label: 'Get ready for MMA' },
    { start: 1200, end: 1320, activity: 'train', label: 'MMA training' },
    { start: 1320, end: 1440, activity: 'chillnight', label: 'Chill after training' }
  ];

  const FRAMES = {
    work: [1, 2], read: [3, 4], chill: [5], chillnight: [5],
    wake: [6], prep: [7], train: [8, 9, 8, 10], sleep: [11]
  };
  const FRAME_DELAYS = { work: 650, read: 1100, train: 540 };
  const VISIT_MINUTES = { sleep: 480, work: 870, read: 840, wake: 780, chill: 1080, prep: 1170, train: 1260, chillnight: 1350 };

  // Normalized ground-anchor positions: x/y are 0..1, size is a CSS length.
  // Set window.DOLLHOUSE_POSITIONS before this script, or edit entries at runtime
  // and call DollhouseLife.refresh(). The artwork owner calibrates these anchors.
  const DEFAULT_POSITIONS = {
    sleep: { x: 0.30, y: 0.32, size: '18%' },
    wake: { x: 0.30, y: 0.43, size: '18%' },
    work: { x: 0.57, y: 0.51, size: '17%' },
    read: { x: 0.35, y: 0.69, size: '18%' },
    chill: { x: 0.35, y: 0.69, size: '18%' },
    prep: { x: 0.84, y: 0.79, size: '18%' },
    train: { x: 0.65, y: 0.65, size: '23%' },
    chillnight: { x: 0.35, y: 0.69, size: '18%' }
  };

  function normalizeMinute(value) {
    const minute = Number(value);
    if (!Number.isFinite(minute)) throw new TypeError('A finite minute value is required');
    return ((Math.floor(minute) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  }

  function formatMinute(value) {
    const minute = normalizeMinute(value);
    return `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
  }

  function lightAt(value) {
    const minute = normalizeMinute(value);
    if (minute < 390 || minute >= 1200) return 'night';
    if (minute < 780) return 'morning';
    if (minute < 1020) return 'day';
    return 'sunset';
  }

  function getRoutineState(value) {
    const minute = normalizeMinute(value);
    const index = SCHEDULE.findIndex(segment => minute >= segment.start && minute < segment.end);
    const segment = SCHEDULE[index];
    const next = SCHEDULE[(index + 1) % SCHEDULE.length];
    return {
      ...segment, minute, light: lightAt(minute),
      scene: segment.activity === 'train' ? 'gym' : 'home',
      nextActivity: next.activity, nextLabel: next.label, nextMinute: next.start,
      nextDay: next.start <= segment.start
    };
  }

  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata', hourCycle: 'h23', hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
  const dateFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata', weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
  });

  function getISTTime(date = new Date()) {
    const instant = date instanceof Date ? date : new Date(date);
    if (!Number.isFinite(instant.getTime())) throw new TypeError('A valid date is required');
    const parts = Object.fromEntries(timeFormatter.formatToParts(instant).map(part => [part.type, part.value]));
    const hour = Number(parts.hour);
    const minute = Number(parts.minute);
    return {
      hour, minute, second: Number(parts.second), minuteOfDay: hour * 60 + minute,
      timeLabel: `${parts.hour}:${parts.minute}:${parts.second} IST`,
      dateLabel: dateFormatter.format(instant), iso: instant.toISOString()
    };
  }

  function spriteCoordinates(frame) {
    if (!Number.isInteger(frame) || frame < 0 || frame > 11) throw new RangeError('Sprite frame must be 0..11');
    return { x: (frame % 4) / 3 * 100, y: Math.floor(frame / 4) / 2 * 100 };
  }

  const helpers = { normalizeMinute, formatMinute, lightAt, getRoutineState, getISTTime, spriteCoordinates };
  if (typeof module !== 'undefined' && module.exports) module.exports = helpers;
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  window.DollhouseLife = helpers;

  function init() {
    const stage = document.getElementById('world-stage');
    const actor = document.getElementById('character');
    const actorAnchor = document.getElementById('character-anchor') || actor;
    const sprite = document.getElementById('actor-sprite');
    const bubble = document.getElementById('speech-bubble');
    if (!stage || !actor || !sprite || !bubble || stage.dataset.lifeReady === 'true') return;
    stage.dataset.lifeReady = 'true';

    const root = document.documentElement;
    const byId = id => document.getElementById(id);
    const home = byId('home-scene');
    const gym = byId('gym-scene');
    const slider = byId('time-preview');
    const followButton = byId('follow-time');
    const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
    const fineHover = matchMedia('(hover: hover) and (pointer: fine)');
    const timeButtons = [...document.querySelectorAll('button[data-time]')];
    const visitButtons = [...document.querySelectorAll('button[data-visit]')];
    window.DOLLHOUSE_POSITIONS = Object.fromEntries(Object.entries(DEFAULT_POSITIONS).map(([key, value]) => [
      key, { ...value, ...(window.DOLLHOUSE_POSITIONS?.[key] || {}) }
    ]));

    let previewMinute = null;
    let state = null;
    let currentScene = null;
    let animationTimer = 0;
    let reactionTimer = 0;
    let sceneTimer = 0;
    let frameIndex = 0;
    let reacting = false;
    let hoverUsed = false;
    let cooldownUntil = 0;
    let eventPaused = false;

    function setText(id, text) {
      const node = byId(id);
      if (node && node.textContent !== text) node.textContent = text;
    }

    function labelActor() {
      const speech = reacting ? "Hey, don't do that! " : '';
      actor.setAttribute('aria-label', `${speech}Say hello to the character. Scheduled scene: ${state?.label || 'Getting ready'}.`);
    }

    function placeBubble() {
      if (!reacting) return;
      bubble.style.setProperty('--bubble-dx', '0px');
      bubble.style.setProperty('--bubble-dy', '0px');
      const bounds = stage.parentElement.getBoundingClientRect();
      const rect = bubble.getBoundingClientRect();
      const dx = rect.left < bounds.left + 8 ? bounds.left + 8 - rect.left : rect.right > bounds.right - 8 ? bounds.right - 8 - rect.right : 0;
      const dy = rect.top < bounds.top + 8 ? bounds.top + 8 - rect.top : rect.bottom > bounds.bottom - 8 ? bounds.bottom - 8 - rect.bottom : 0;
      bubble.style.setProperty('--bubble-dx', `${dx}px`);
      bubble.style.setProperty('--bubble-dy', `${dy}px`);
    }

    function motionAllowed() {
      return !motionPreference.matches && !eventPaused && !root.classList.contains('motion-paused') &&
        !document.hidden && !document.body.classList.contains('modal-open') && !root.classList.contains('modal-open');
    }

    function setFrame(frame) {
      const position = spriteCoordinates(frame);
      sprite.style.setProperty('--sprite-x', `${position.x}%`);
      sprite.style.setProperty('--sprite-y', `${position.y}%`);
      sprite.dataset.frame = String(frame);
    }

    function stepFrame() {
      animationTimer = 0;
      if (!state || reacting || !motionAllowed()) return;
      const frames = FRAMES[state.activity];
      frameIndex = (frameIndex + 1) % frames.length;
      setFrame(frames[frameIndex]);
      animationTimer = window.setTimeout(stepFrame, FRAME_DELAYS[state.activity] || 1000);
    }

    function syncMotion() {
      window.clearTimeout(animationTimer);
      animationTimer = 0;
      if (!state) return;
      if (reacting) { setFrame(0); return; }
      const frames = FRAMES[state.activity];
      frameIndex = motionAllowed() ? frameIndex % frames.length : 0;
      setFrame(frames[frameIndex]);
      if (motionAllowed() && frames.length > 1) {
        animationTimer = window.setTimeout(stepFrame, FRAME_DELAYS[state.activity] || 1000);
      }
      if (!motionAllowed()) {
        stage.classList.remove('scene-changing');
        home?.classList.remove('scene-entering');
        gym?.classList.remove('scene-entering');
      }
    }

    function positionActor(activity) {
      const position = { ...DEFAULT_POSITIONS[activity], ...window.DOLLHOUSE_POSITIONS[activity] };
      const x = Number.isFinite(position.x) ? Math.min(1, Math.max(0, position.x)) : DEFAULT_POSITIONS[activity].x;
      const y = Number.isFinite(position.y) ? Math.min(1, Math.max(0, position.y)) : DEFAULT_POSITIONS[activity].y;
      actorAnchor.style.setProperty('--actor-x', `${x * 100}%`);
      actorAnchor.style.setProperty('--actor-y', `${y * 100}%`);
      actorAnchor.style.setProperty('--actor-size', typeof position.size === 'number' ? `${position.size}%` : position.size);
    }

    function showScene(scene, light) {
      const homeAsset = light === 'night' ? 'home-night.png' : light === 'sunset' ? 'home.png' : 'home-day.png';
      const homeUrl = new URL(`assets/dollhouse/${homeAsset}`, document.baseURI).href;
      const homeChanged = Boolean(home && home.src !== homeUrl);
      if (homeChanged) home.src = homeUrl;
      if (scene === currentScene && !(scene === 'home' && homeChanged)) return;
      const hadScene = currentScene !== null;
      currentScene = scene;
      window.clearTimeout(sceneTimer);
      home?.classList.remove('scene-entering');
      gym?.classList.remove('scene-entering');
      stage.classList.remove('scene-changing');
      if (home) home.hidden = scene !== 'home';
      if (gym) gym.hidden = scene !== 'gym';
      stage.dataset.scene = scene;
      if (hadScene && motionAllowed()) {
        const incoming = scene === 'gym' ? gym : home;
        incoming?.classList.add('scene-entering');
        stage.classList.add('scene-changing');
        sceneTimer = window.setTimeout(() => {
          stage.classList.remove('scene-changing');
          incoming?.classList.remove('scene-entering');
        }, 420);
      }
    }

    function renderRoutine() {
      const minute = previewMinute === null ? getISTTime().minuteOfDay : previewMinute;
      const nextState = getRoutineState(minute);
      const changed = state?.activity !== nextState.activity;
      state = nextState;
      stage.dataset.activity = state.activity;
      actor.dataset.activity = state.activity;
      stage.dataset.light = state.light;
      stage.dataset.mode = previewMinute === null ? 'scheduled' : 'preview';
      showScene(state.scene, state.light);
      positionActor(state.activity);
      setText('activity-label', state.label);
      setText('next-activity', `Next: ${state.nextLabel} at ${formatMinute(state.nextMinute)} IST${state.nextDay ? ' tomorrow' : ''}`);
      setText('scene-label', (previewMinute === null ? '' : 'Preview / ') + (state.scene === 'gym' ? 'MMA gym' : 'Home / Navi Mumbai'));
      setText('routine-mode', previewMinute === null ? 'Scheduled routine · IST' : 'Preview · scheduled routine');
      setText('preview-time', `${formatMinute(minute)} IST`);
      labelActor();
      if (slider) {
        slider.value = String(minute);
        slider.setAttribute('aria-valuetext', `${formatMinute(minute)} IST — ${state.label}`);
      }
      followButton?.setAttribute('aria-pressed', String(previewMinute === null));
      timeButtons.forEach(button => {
        const value = Number(button.dataset.time);
        const selected = Number.isFinite(value) && getRoutineState(value).activity === (state.activity === 'chillnight' ? 'chill' : state.activity);
        button.setAttribute('aria-pressed', String(selected));
      });
      visitButtons.forEach(button => button.setAttribute('aria-pressed', String(
        button.dataset.visit === state.activity || (button.dataset.visit === 'chill' && state.activity === 'chillnight')
      )));
      if (changed) { frameIndex = 0; syncMotion(); }
    }

    function tickClock() {
      const now = getISTTime();
      setText('world-clock', now.timeLabel);
      const clock = byId('world-clock');
      if (clock) clock.dateTime = now.iso;
      setText('world-date', now.dateLabel);
      if (previewMinute === null && state?.minute !== now.minuteOfDay) renderRoutine();
    }

    function preview(value) {
      previewMinute = normalizeMinute(value);
      renderRoutine();
    }

    function follow() {
      previewMinute = null;
      tickClock();
      renderRoutine();
    }

    function react() {
      const now = Date.now();
      if (reacting || now < cooldownUntil) return;
      reacting = true;
      window.clearTimeout(animationTimer);
      animationTimer = 0;
      actor.classList.add('is-reacting');
      actor.dataset.reacting = 'true';
      setFrame(0);
      bubble.hidden = false;
      bubble.textContent = "Hey, don't do that!";
      labelActor();
      placeBubble();
      reactionTimer = window.setTimeout(() => {
        reacting = false;
        cooldownUntil = Date.now() + 1200;
        actor.classList.remove('is-reacting');
        delete actor.dataset.reacting;
        bubble.hidden = true;
        bubble.textContent = '';
        labelActor();
        frameIndex = 0;
        syncMotion();
      }, 2800);
    }

    bubble.hidden = true;
    bubble.textContent = '';
    actor.addEventListener('pointerenter', event => {
      if (!fineHover.matches || event.pointerType === 'touch' || hoverUsed) return;
      hoverUsed = true;
      react();
    });
    actor.addEventListener('pointerleave', () => { hoverUsed = false; });
    actor.addEventListener('click', react); // Native buttons supply Enter/Space activation.
    window.addEventListener('resize', () => { if (reacting) requestAnimationFrame(placeBubble); }, { passive: true });
    slider?.addEventListener('input', event => preview(event.currentTarget.value));
    followButton?.addEventListener('click', follow);
    timeButtons.forEach(button => button.addEventListener('click', () => {
      if (Number.isFinite(Number(button.dataset.time))) preview(button.dataset.time);
    }));
    visitButtons.forEach(button => button.addEventListener('click', () => {
      if (Object.hasOwn(VISIT_MINUTES, button.dataset.visit)) preview(VISIT_MINUTES[button.dataset.visit]);
    }));

    function onMotion(event) {
      if (typeof event.detail?.paused === 'boolean') eventPaused = event.detail.paused;
      syncMotion();
    }
    document.addEventListener('portfolio:motion', onMotion);
    window.addEventListener('portfolio:motion', onMotion);
    root.addEventListener('portfolio:motion', onMotion);
    motionPreference.addEventListener('change', syncMotion);
    document.addEventListener('visibilitychange', () => { tickClock(); syncMotion(); });
    const classObserver = new MutationObserver(syncMotion);
    classObserver.observe(root, { attributes: true, attributeFilter: ['class'] });
    classObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    tickClock();
    renderRoutine();
    window.setInterval(tickClock, 1000);
    window.setInterval(renderRoutine, 30000);
    window.DollhouseLife = { ...helpers, preview, follow, react, refresh: renderRoutine, getCurrentState: () => ({ ...state }) };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
