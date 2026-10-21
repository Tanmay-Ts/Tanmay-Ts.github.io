/* Localized animation for the 1536 × 1024 pixel workspace illustration. */
(() => {
  'use strict';

  const vertexSource = `
    attribute vec2 a_position;
    void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
  `;

  const fragmentSource = `
    precision highp float;
    uniform sampler2D u_image;
    uniform vec2 u_resolution;
    uniform vec2 u_imageSize;
    uniform vec2 u_visibleSize;
    uniform vec2 u_origin;
    uniform float u_time;

    vec4 pixelAt(vec2 point) {
      // Nearest-neighbour texture filtering preserves the illustration's pixels.
      return texture2D(u_image, (floor(point) + 0.5) / u_imageSize);
    }

    float box(vec2 p, vec4 bounds, float edge) {
      vec2 inner = smoothstep(bounds.xy, bounds.xy + edge, p);
      vec2 outer = 1.0 - smoothstep(bounds.zw - edge, bounds.zw, p);
      return inner.x * inner.y * outer.x * outer.y;
    }

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    void main() {
      vec2 screen = vec2(gl_FragCoord.x, u_resolution.y - gl_FragCoord.y) / u_resolution;
      vec2 p = u_origin + screen * u_visibleSize;
      vec4 original = pixelAt(p);
      vec4 color = original;

      // Crown and upper bangs only: source coordinates, measured against the art.
      // The lower boundary follows the forehead; the face, ear and hand stay fixed.
      float hairEllipse = length((p - vec2(856.0, 503.0)) / vec2(104.0, 63.0));
      float hair = 1.0 - smoothstep(0.72, 1.0, hairEllipse);
      float forehead = 542.0 + abs(p.x - 854.0) * 0.22;
      hair *= 1.0 - smoothstep(forehead - 6.0, forehead + 1.0, p.y);
      hair *= smoothstep(445.0, 456.0, p.y);
      if (hair > 0.001) {
        vec2 breeze = vec2(
          sin(u_time * 1.12 + p.y * 0.043) * 3.2 + sin(u_time * 0.61) * 0.8,
          sin(u_time * 1.12 + p.x * 0.028) * 1.15
        );
        color = pixelAt(p + floor(breeze * hair + 0.5));
      }

      // Three safe sky patches sit inside the window panes, above the skyline.
      // The mullions, poster, buildings and bridge are never translated.
      float sky = max(
        box(p, vec4(1119.0, 412.0, 1189.0, 471.0), 8.0),
        box(p, vec4(1217.0, 397.0, 1357.0, 487.0), 9.0)
      );
      sky = max(sky, box(p, vec4(1372.0, 477.0, 1438.0, 532.0), 7.0));
      if (sky > 0.001) {
        float drift = sin(u_time * 0.27 + p.y * 0.008) * 7.5;
        float rise = sin(u_time * 0.31 + p.x * 0.007) * 1.5;
        vec2 offset = floor(vec2(drift, rise) * sky + 0.5);
        color = pixelAt(p + offset);
      }

      // Only existing warm window pixels inside these building silhouettes blink.
      // Keep this separate from the sky mask so clouds never flicker.
      float city = max(
        box(p, vec4(1142.0, 484.0, 1170.0, 594.0), 2.0),
        box(p, vec4(1240.0, 504.0, 1271.0, 584.0), 2.0)
      );
      city = max(city, box(p, vec4(1320.0, 516.0, 1340.0, 579.0), 2.0));
      city = max(city, box(p, vec4(1290.0, 555.0, 1310.0, 588.0), 2.0));
      city = max(city, box(p, vec4(1401.0, 551.0, 1426.0, 603.0), 2.0));
      if (city > 0.001 && original.r > 0.43 && original.g > 0.14 && original.r > original.b * 1.35) {
        float seed = hash(floor(p / vec2(4.0, 5.0)));
        float pulse = sin(u_time * (0.55 + seed * 0.55) + seed * 6.28318);
        float light = mix(0.56, 1.29, smoothstep(-0.72, 0.76, pulse));
        float selected = step(0.26, seed) * city;
        color.rgb = mix(original.rgb, min(original.rgb * light, vec3(1.0)), selected);
      }

      gl_FragColor = color;
    }
  `;

  function animateRoom(room) {
    if (room.querySelector('[data-room-motion]')) return;

    const root = document.documentElement;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const canvas = document.createElement('canvas');
    canvas.dataset.roomMotion = '';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;image-rendering:pixelated;display:none;';
    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: 'low-power'
    });
    if (!gl) return;

    let program;
    const shaders = [];
    try {
      for (const [type, source] of [[gl.VERTEX_SHADER, vertexSource], [gl.FRAGMENT_SHADER, fragmentSource]]) {
        const shader = gl.createShader(type);
        if (!shader) throw new Error('Shader unavailable');
        shaders.push(shader);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error('Shader unsupported');
      }
      program = gl.createProgram();
      if (!program) throw new Error('Program unavailable');
      shaders.forEach(shader => gl.attachShader(program, shader));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Program unsupported');
      gl.useProgram(program);
    } catch {
      shaders.forEach(shader => gl.deleteShader(shader));
      if (program) gl.deleteProgram(program);
      return; // The CSS background remains the complete static experience.
    }
    shaders.forEach(shader => gl.deleteShader(shader));

    const vertices = gl.createBuffer();
    const texture = gl.createTexture();
    if (!vertices || !texture) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const uniforms = {};
    ['resolution', 'imageSize', 'visibleSize', 'origin', 'time', 'image'].forEach(name => {
      uniforms[name] = gl.getUniformLocation(program, 'u_' + name);
    });
    gl.uniform1i(uniforms.image, 0);

    let ready = false;
    let failed = false;
    let hasSize = false;
    let inView = true;
    let eventPaused = false;
    let frame = 0;
    let elapsed = 0;
    let lastPaint = 0;
    let previousPaint = 0;
    const frameInterval = 1000 / 24;
    const source = new Image();

    if (getComputedStyle(room).position === 'static') room.style.position = 'relative';
    room.appendChild(canvas);

    function isActive() {
      return ready && !failed && hasSize && inView && !document.hidden && !eventPaused &&
        !preference.matches && !root.classList.contains('motion-paused');
    }

    function stop() {
      cancelAnimationFrame(frame);
      frame = 0;
      lastPaint = 0;
      previousPaint = 0;
      canvas.style.display = 'none';
    }

    function paint(timestamp) {
      frame = 0;
      if (!isActive()) { stop(); return; }
      if (!lastPaint || timestamp - lastPaint >= frameInterval) {
        if (previousPaint) elapsed += Math.min((timestamp - previousPaint) / 1000, 0.12);
        previousPaint = timestamp;
        lastPaint = lastPaint ? timestamp - ((timestamp - lastPaint) % frameInterval) : timestamp;
        gl.uniform1f(uniforms.time, elapsed);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        canvas.style.display = 'block';
      }
      frame = requestAnimationFrame(paint);
    }

    function sync() {
      if (!isActive()) { stop(); return; }
      if (!frame) frame = requestAnimationFrame(paint);
    }

    function backgroundFraction(value) {
      if (value.endsWith('%')) return parseFloat(value) / 100;
      if (value === 'left' || value === 'top') return 0;
      if (value === 'right' || value === 'bottom') return 1;
      // The room uses cover with percentage positioning (normally center center).
      return 0.5;
    }

    function resize() {
      if (!ready || failed) return;
      const rect = room.getBoundingClientRect();
      hasSize = rect.width > 0 && rect.height > 0;
      if (!hasSize) { stop(); return; }
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.round(rect.width * ratio));
      const height = Math.max(1, Math.round(rect.height * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
      const scale = Math.max(rect.width / source.naturalWidth, rect.height / source.naturalHeight);
      const visibleWidth = rect.width / scale;
      const visibleHeight = rect.height / scale;
      const background = getComputedStyle(room).backgroundPosition.split(/\s+/);
      const x = backgroundFraction(background[0] || '50%');
      const y = backgroundFraction(background[1] || '50%');
      gl.uniform2f(uniforms.resolution, width, height);
      gl.uniform2f(uniforms.imageSize, source.naturalWidth, source.naturalHeight);
      gl.uniform2f(uniforms.visibleSize, visibleWidth, visibleHeight);
      gl.uniform2f(uniforms.origin, (source.naturalWidth - visibleWidth) * x, (source.naturalHeight - visibleHeight) * y);
      lastPaint = 0;
      sync();
    }

    function onMotion(event) {
      if (typeof event.detail?.paused !== 'boolean') return;
      eventPaused = event.detail.paused;
      sync();
    }

    function fail() {
      failed = true;
      stop();
      canvas.remove();
      resizeObserver?.disconnect();
      visibilityObserver?.disconnect();
      classObserver.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pageshow', sync);
      window.removeEventListener('pagehide', stop);
      document.removeEventListener('visibilitychange', sync);
      document.removeEventListener('portfolio:motion', onMotion);
      window.removeEventListener('portfolio:motion', onMotion);
      root.removeEventListener('portfolio:motion', onMotion);
      preference.removeEventListener?.('change', sync);
      gl.deleteBuffer(vertices);
      gl.deleteTexture(texture);
      gl.deleteProgram(program);
    }

    const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(resize) : null;
    resizeObserver?.observe(room);
    const visibilityObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      sync();
    }, { threshold: 0 }) : null;
    visibilityObserver?.observe(room);
    const classObserver = new MutationObserver(sync);
    classObserver.observe(root, { attributes: true, attributeFilter: ['class'] });
    preference.addEventListener?.('change', sync);
    document.addEventListener('visibilitychange', sync);
    document.addEventListener('portfolio:motion', onMotion);
    window.addEventListener('portfolio:motion', onMotion);
    root.addEventListener('portfolio:motion', onMotion);
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pageshow', sync);
    window.addEventListener('pagehide', stop);
    canvas.addEventListener('webglcontextlost', fail, { once: true });

    source.onload = () => {
      if (failed) return;
      // Masks belong to this artwork. A later replacement keeps its static image.
      if (source.naturalWidth !== 1536 || source.naturalHeight !== 1024) { fail(); return; }
      try {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
        if (gl.getError() !== gl.NO_ERROR) { fail(); return; }
        ready = true;
        resize();
      } catch { fail(); }
    };
    source.onerror = fail;
    const backgroundUrl = getComputedStyle(room).backgroundImage.match(/url\(["']?(.*?)["']?\)/);
    source.src = room.dataset.motionSrc || backgroundUrl?.[1] || new URL('assets/pixel-workspace.png', document.baseURI).href;
  }

  function init() { document.querySelectorAll('.room-art').forEach(animateRoom); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
