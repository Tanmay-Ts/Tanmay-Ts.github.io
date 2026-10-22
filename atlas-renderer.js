(() => {
  'use strict';

  const WIDTH = 400;
  const HEIGHT = 430;
  const GROUND = 420;
  const ATLAS_SIZE = 1254;
  const ALPHA_THRESHOLD = 8;
  const IMAGE_PATH = 'assets/dollhouse/character-atlas.png';
  const METADATA_PATH = 'assets/dollhouse/atlas-frames.json';

  // Also allows a local file preview when fetching JSON is restricted.
  // These measured crops match atlas-frames.json; the PNG stays untouched.
  const fallbackRows = [
    ['frontstop', 54, 99, 192, 368, 367],
    ['workA', 356, 168, 238, 300, 299],
    ['workB', 659, 166, 239, 302, 301],
    ['readA', 997, 168, 215, 300, 299],
    ['readB', 49, 545, 223, 305, 304],
    ['controller', 355, 551, 233, 301, 300],
    ['stretch', 661, 480, 220, 376, 375],
    ['bag', 993, 500, 217, 356, 355],
    ['guard', 32, 874, 210, 331, 330],
    ['punch', 322, 885, 273, 323, 321],
    ['kick', 639, 877, 315, 328, 327],
    ['sleep', 922, 1034, 317, 174, 172]
  ];
  const fallbackFrames = fallbackRows.map(([name, x, y, w, h, groundY], index) => ({
    index, name, x, y, w, h,
    ground: { y: groundY },
    draw: { x: Math.round((WIDTH - w) / 2), y: GROUND - groundY },
    ...(name === 'kick' ? { clip: [[0, 0], [315, 0], [315, 147], [271, 147], [271, 328], [0, 328]] } : {})
  }));

  let resolveReady;
  let frameCache = [];
  let frames = fallbackFrames;
  let visibleContext;
  let canvas;
  let requestedFrame = 0;
  const state = {
    status: 'loading',
    frame: 0,
    pose: 'frontstop',
    atlas: { width: ATLAS_SIZE, height: ATLAS_SIZE },
    canvas: { width: WIDTH, height: HEIGHT, groundY: GROUND, scale: 1 },
    frameCount: 12,
    metadataSource: 'pending',
    alphaThreshold: ALPHA_THRESHOLD,
    error: null,
    warning: null
  };
  const ready = new Promise(resolve => { resolveReady = resolve; });

  function snapshot() {
    const frame = frames[requestedFrame];
    return {
      ...state,
      atlas: { ...state.atlas },
      canvas: { ...state.canvas },
      sourceRect: frame ? { x: frame.x, y: frame.y, w: frame.w, h: frame.h } : null,
      drawOffset: frame ? { ...frame.draw } : null,
      visibleBounds: frameCache[requestedFrame]?.bounds || null
    };
  }

  function setFrame(value) {
    const index = Number(value);
    if (!Number.isInteger(index) || index < 0 || index >= 12) return false;
    requestedFrame = index;
    state.frame = index;
    state.pose = frames[index].name;
    if (!visibleContext || !frameCache[index]) return true;
    visibleContext.clearRect(0, 0, WIDTH, HEIGHT);
    visibleContext.drawImage(frameCache[index].canvas, 0, 0);
    canvas.dataset.frame = String(index);
    canvas.dataset.pose = frames[index].name;
    return true;
  }

  window.DollhouseActor = {
    ready,
    setFrame,
    get state() { return snapshot(); }
  };

  function loadImage() {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('The character atlas could not be loaded.'));
      image.src = new URL(IMAGE_PATH, document.baseURI).href;
    });
  }

  function validMetadata(metadata) {
    if (metadata?.atlas?.width !== ATLAS_SIZE || metadata?.atlas?.height !== ATLAS_SIZE ||
        !Array.isArray(metadata.frames) || metadata.frames.length !== 12) return false;
    return metadata.frames.every((frame, index) => {
      return frame.index === index && typeof frame.name === 'string' &&
        ['x', 'y', 'w', 'h'].every(key => Number.isInteger(frame[key])) &&
        frame.x >= 0 && frame.y >= 0 && frame.w > 0 && frame.h > 0 &&
        frame.x + frame.w <= ATLAS_SIZE && frame.y + frame.h <= ATLAS_SIZE &&
        Number.isFinite(frame.ground?.y) && frame.ground.y > 0 && frame.ground.y <= frame.h &&
        (!frame.clip || frame.clip.every(point => Array.isArray(point) && point.length === 2 && point.every(Number.isFinite)));
    });
  }

  async function loadFrames() {
    try {
      const response = await fetch(new URL(METADATA_PATH, document.baseURI));
      if (!response.ok) throw new Error('Frame metadata returned HTTP ' + response.status + '.');
      const metadata = await response.json();
      if (!validMetadata(metadata)) throw new Error('Frame metadata failed validation.');
      state.metadataSource = 'atlas-frames.json';
      return metadata.frames.map(frame => ({
        ...frame,
        draw: { x: Math.round((WIDTH - frame.w) / 2), y: GROUND - frame.ground.y }
      }));
    } catch (error) {
      state.metadataSource = 'embedded-fallback';
      state.warning = error.message;
      return fallbackFrames;
    }
  }

  function cacheFrame(image, frame) {
    const buffer = document.createElement('canvas');
    buffer.width = WIDTH;
    buffer.height = HEIGHT;
    const context = buffer.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Canvas rendering is unavailable.');
    context.imageSmoothingEnabled = false;
    context.save();
    if (frame.clip) {
      context.beginPath();
      frame.clip.forEach(([x, y], index) => {
        if (index === 0) context.moveTo(frame.draw.x + x, frame.draw.y + y);
        else context.lineTo(frame.draw.x + x, frame.draw.y + y);
      });
      context.closePath();
      context.clip();
    }
    context.drawImage(image, frame.x, frame.y, frame.w, frame.h,
      frame.draw.x, frame.draw.y, frame.w, frame.h);
    context.restore();

    // Remove barely visible generation specks only in this runtime canvas.
    // Existing edge alpha is retained; the original image is never rewritten.
    const pixels = context.getImageData(0, 0, WIDTH, HEIGHT);
    let minX = WIDTH, minY = HEIGHT, maxX = -1, maxY = -1;
    for (let pixel = 0; pixel < WIDTH * HEIGHT; pixel++) {
      const alphaIndex = pixel * 4 + 3;
      if (pixels.data[alphaIndex] < ALPHA_THRESHOLD) {
        pixels.data[alphaIndex] = 0;
        continue;
      }
      const x = pixel % WIDTH;
      const y = Math.floor(pixel / WIDTH);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
    context.putImageData(pixels, 0, 0);
    return {
      canvas: buffer,
      bounds: maxX === -1 ? null : { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 }
    };
  }

  async function initialize() {
    const host = document.getElementById('actor-sprite');
    const character = document.getElementById('character');
    if (!host) {
      state.status = 'error';
      state.error = 'The character sprite host is missing.';
      resolveReady(snapshot());
      return;
    }

    const sources = [...new Set([character, host].filter(Boolean))];
    const initialSource = sources.find(element => element.hasAttribute('data-frame'));
    setFrame(initialSource?.getAttribute('data-frame') || 0);
    const observer = new MutationObserver(records => {
      for (const record of records) {
        if (record.attributeName === 'data-frame') setFrame(record.target.getAttribute('data-frame'));
      }
    });
    sources.forEach(element => observer.observe(element, { attributes: true, attributeFilter: ['data-frame'] }));

    try {
      const [image, measuredFrames] = await Promise.all([loadImage(), loadFrames()]);
      if (image.naturalWidth !== ATLAS_SIZE || image.naturalHeight !== ATLAS_SIZE) {
        throw new Error('The character atlas dimensions do not match its measured frames.');
      }
      frames = measuredFrames;
      frameCache = frames.map(frame => cacheFrame(image, frame));
      canvas = document.createElement('canvas');
      canvas.width = WIDTH;
      canvas.height = HEIGHT;
      canvas.className = 'actor-atlas-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      canvas.style.cssText = 'display:block;width:100%;height:100%;image-rendering:pixelated;pointer-events:none';
      visibleContext = canvas.getContext('2d');
      if (!visibleContext) throw new Error('Canvas rendering is unavailable.');
      visibleContext.imageSmoothingEnabled = false;
      setFrame(requestedFrame);
      host.append(canvas);
      host.style.backgroundImage = 'none';
      host.classList.add('atlas-ready');
      host.dataset.atlasStatus = 'ready';
      state.status = 'ready';
      window.dispatchEvent(new CustomEvent('portfolio:actor-ready', { detail: snapshot() }));
    } catch (error) {
      // Keep any existing first-pose CSS fallback visible on load failure.
      observer.disconnect();
      state.status = 'error';
      state.error = error.message;
      host.classList.add('atlas-load-error');
      host.dataset.atlasStatus = 'error';
      window.dispatchEvent(new CustomEvent('portfolio:actor-error', { detail: snapshot() }));
    }
    resolveReady(snapshot());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
