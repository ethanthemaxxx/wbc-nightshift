/* Nightshift concept site — shared behaviour. No libraries. */
(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const onView = (el, cb, opts = { threshold: 0.3 }) => {
    if (!('IntersectionObserver' in window)) { cb(); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { cb(); io.disconnect(); } }), opts);
    io.observe(el);
  };

  /* ── Navigation: mega menus ── */
  const triggers = $$('[data-mega]');
  let closeTimer;
  const closeAll = (except) => triggers.forEach((t) => {
    if (t === except) return;
    t.setAttribute('aria-expanded', 'false');
    $('#' + t.getAttribute('aria-controls'))?.classList.remove('is-open');
  });
  const open = (t) => {
    clearTimeout(closeTimer);
    closeAll(t);
    t.setAttribute('aria-expanded', 'true');
    const panel = $('#' + t.getAttribute('aria-controls'));
    panel.classList.add('is-open');
    // keep the panel inside the viewport
    panel.style.left = '0px';
    const r = panel.getBoundingClientRect();
    const over = r.right - (window.innerWidth - 16);
    if (over > 0) panel.style.left = -over + 'px';
  };
  triggers.forEach((t) => {
    const item = t.parentElement;
    t.addEventListener('click', () => (t.getAttribute('aria-expanded') === 'true' ? closeAll() : open(t)));
    item.addEventListener('mouseenter', () => { if (matchMedia('(hover: hover)').matches) open(t); });
    item.addEventListener('mouseleave', () => { closeTimer = setTimeout(() => closeAll(), 160); });
    item.addEventListener('focusout', (e) => { if (!item.contains(e.relatedTarget)) closeAll(); });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const openT = triggers.find((t) => t.getAttribute('aria-expanded') === 'true');
    if (openT) { closeAll(); openT.focus(); }
    if ($('#mnav')?.classList.contains('is-open')) closeMobile();
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.nav__item')) closeAll(); });

  const nav = $('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Mobile overlay ── */
  const mnav = $('#mnav');
  const burger = $('.nav__burger');
  function openMobile() {
    mnav.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    $('.mnav__close', mnav).focus();
  }
  function closeMobile() {
    mnav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    burger.focus();
  }
  if (mnav && burger) {
    burger.addEventListener('click', openMobile);
    $('.mnav__close', mnav).addEventListener('click', closeMobile);
    $$('a', mnav).forEach((a) => a.addEventListener('click', () => { mnav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }));
    $$('.mnav__acc > button', mnav).forEach((b) => b.addEventListener('click', () => {
      const exp = b.getAttribute('aria-expanded') === 'true';
      b.setAttribute('aria-expanded', String(!exp));
      $('#' + b.getAttribute('aria-controls')).hidden = exp;
    }));
    mnav.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const f = $$('a, button', mnav).filter((x) => x.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
  }

  /* ── Product tour ── */
  const tour = $('#tour');
  if (tour) {
    // the load-in animation runs once; drop it afterwards so nothing can replay it
    [tour, $('.tabs-wrap', tour)].forEach((el) => el && el.addEventListener('animationend', (e) => { if (e.target === el) el.style.animation = 'none'; }));
    const frame = $('#tour-frame', tour);
    const scaler = $('.tour__scaler', tour);
    const fit = () => scaler.style.setProperty('--tour-s', frame.clientWidth / 1064);
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(frame); else window.addEventListener('resize', fit);
    fit();

    const ui = $('.ui', tour);
    const tabs = $$('.tab', tour);
    const scenes = $$('.ui-scene', tour);
    const sub = $('[data-sub]', tour);
    const pauseBtn = $('.tour__pause', tour);
    const durs = tabs.map((t) => +t.dataset.dur);
    let ch = 0, t = 0, last = 0, raf = 0;
    let userPaused = reduce, visible = true;

    const fmt = (n) => Math.round(n).toLocaleString('en-US');
    function render() {
      const sc = scenes[ch];
      $$('[data-at],[data-out],[data-type],[data-count],[data-num-from],[data-press],[data-fire],[data-idle],[data-hl]', sc).forEach((el) => {
        const d = el.dataset;
        if (d.at !== undefined) el.classList.toggle('on', t >= +d.at && (d.out === undefined || t < +d.out));
        else if (d.out !== undefined) el.classList.toggle('off', t >= +d.out);
        if (d.type !== undefined) {
          const p = Math.min(1, Math.max(0, (t - +d.at) / +d.dur));
          const s = d.type.slice(0, Math.round(p * d.type.length));
          if (el.textContent !== s) el.textContent = s;
        }
        if (d.count !== undefined) {
          const p = Math.min(1, Math.max(0, (t - +d.at) / +d.dur));
          el.textContent = Math.ceil(+d.count * (1 - p)) + 's';
          el.classList.add('on');
        }
        if (d.numFrom !== undefined) {
          const p = Math.min(1, Math.max(0, (t - +d.at) / +d.dur));
          const e = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(+d.numFrom + (+d.numTo - +d.numFrom) * e);
          el.classList.add('on');
        }
        if (d.press !== undefined) el.classList.toggle('pressed', t >= +d.press && t < +d.press + 220);
        if (d.fire !== undefined) el.classList.toggle('fired', t >= +d.fire);
        if (d.idle !== undefined) el.classList.toggle('idle', t >= +d.idle);
        if (d.hl !== undefined) el.classList.toggle('hl', t >= +d.hl);
      });
      tabs.forEach((tab, i) => {
        const fill = $('.tab__fill', tab);
        const p = i === ch ? Math.min(1, t / durs[i]) : 0;
        fill.style.transform = `translateX(${(p - 1) * 100}%)`;
      });
    }
    function setChapter(i) {
      ch = (i + scenes.length) % scenes.length;
      t = reduce || userPaused ? durs[ch] - 1 : 0;
      tabs.forEach((tab, k) => {
        tab.setAttribute('aria-selected', String(k === ch));
        tab.tabIndex = k === ch ? 0 : -1;
      });
      scenes.forEach((s, k) => s.classList.toggle('is-active', k === ch));
      sub.textContent = scenes[ch].dataset.sub;
      const n = String(ch + 1);
      $$('[data-on]', ui).forEach((el) => el.classList.toggle('is-on', el.dataset.on.split(' ').includes(n)));
      render();
    }
    function frameLoop(ts) {
      raf = 0;
      if (userPaused || !visible) return;
      if (last) t += Math.min(64, ts - last);
      last = ts;
      if (t >= durs[ch]) { setChapter(ch + 1); last = ts; }
      else render();
      raf = requestAnimationFrame(frameLoop);
    }
    const play = () => { if (!raf && !userPaused && visible) { last = 0; raf = requestAnimationFrame(frameLoop); } };
    const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => { setChapter(i); stop(); play(); });
      tab.addEventListener('keydown', (e) => {
        const k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!k) return;
        e.preventDefault();
        setChapter(ch + k); tabs[ch].focus(); stop(); play();
      });
    });
    const syncPause = () => {
      pauseBtn.dataset.paused = String(userPaused);
      pauseBtn.setAttribute('aria-label', userPaused ? 'Play product tour' : 'Pause product tour');
    };
    pauseBtn.addEventListener('click', () => {
      userPaused = !userPaused;
      syncPause();
      if (userPaused) stop(); else { if (t >= durs[ch] - 1) t = 0; play(); }
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((es) => es.forEach((e) => { visible = e.isIntersecting; visible ? play() : stop(); }), { threshold: 0.15 }).observe(frame);
    }
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else play(); });
    syncPause();
    setChapter(0);
    play();
  }

  /* ── Chapters: active station + scroll fallback for the parcel ── */
  const chapters = $$('.chapter');
  if (chapters.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('is-active', e.isIntersecting && !reduce)), { rootMargin: '-35% 0px -35% 0px' });
    chapters.forEach((c) => io.observe(c));
  }
  const timelineOK = window.CSS && CSS.supports && CSS.supports('animation-timeline: view()');
  if (chapters.length && !timelineOK && !reduce) {
    const parcels = chapters.map((c) => [c, $('.parcel', c)]).filter(([, p]) => p);
    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = window.innerHeight;
      parcels.forEach(([c, p]) => {
        const r = c.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const prog = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
        const cs = getComputedStyle(c);
        const from = parseFloat(cs.getPropertyValue('--from')) || 0;
        const to = parseFloat(cs.getPropertyValue('--to')) || 400;
        p.style.transform = `translateY(${from + (to - from) * prog}px)`;
      });
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ── Band scenes: play once on entry ── */
  $$('[data-scene-play]').forEach((el) => {
    const go = () => {
      el.classList.add('play');
      if (el.classList.contains('sc-enqueue')) setTimeout(() => el.classList.add('go'), reduce ? 0 : 1300);
    };
    if (reduce) go(); else onView(el, go, { threshold: 0.35 });
  });

  /* ── Split-flap board ── */
  const grid = $('.board__grid');
  if (grid) {
    const rows = JSON.parse(grid.dataset.rows);
    const CH = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789,.%-';
    let cells = [], targets = [], played = false;
    const build = () => {
      const W = grid.parentElement.clientWidth;
      const wide = W >= 1100;
      const cols = wide ? 31 : W >= 640 ? 22 : 18;
      grid.style.setProperty('--cols', cols);
      grid._mode = cols;
      const lines = [''.padEnd(cols)];
      const pad = (l, v) => {
        const row = Array(cols).fill(' ');
        if (l) for (let i = 0; i < l.length; i++) row[1 + i] = l[i];
        if (v) for (let i = 0; i < v.length; i++) row[cols - 1 - v.length + i] = v[i];
        return row;
      };
      rows.forEach(([l, v]) => {
        if (wide) lines.push(pad(l, v));
        else { lines.push(pad(l, '')); lines.push(pad('', v)); }
      });
      lines.push(''.padEnd(cols));
      grid.innerHTML = '';
      cells = []; targets = [];
      lines.forEach((row, r) => Array.from(row).forEach((c, k) => {
        const d = document.createElement('div');
        d.className = 'flap';
        const isLabel = wide ? k < 18 : (r % 2 === 1);
        if (isLabel) d.classList.add('lbl');
        d.textContent = played || reduce ? c : ' ';
        grid.appendChild(d);
        cells.push(d); targets.push(c);
      }));
    };
    const flipTo = (cell, target, steps, delay) => {
      let n = 0;
      const step = () => {
        n++;
        const c = n >= steps ? target : CH[1 + Math.floor(Math.random() * (CH.length - 1))];
        cell.classList.remove('flip'); void cell.offsetWidth; cell.classList.add('flip');
        setTimeout(() => { cell.textContent = c; }, 150);
        if (n < steps) setTimeout(step, 300);
      };
      setTimeout(step, delay);
    };
    const run = () => {
      played = true;
      if (reduce) { cells.forEach((c, i) => { c.textContent = targets[i]; }); return; }
      const cols = grid._mode;
      cells.forEach((c, i) => { if (targets[i] !== ' ') flipTo(c, targets[i], 2 + Math.floor(Math.random() * 3), (i % cols) * 30); });
    };
    build();
    let rw;
    const modeFor = (W) => (W >= 1100 ? 31 : W >= 640 ? 22 : 18);
    window.addEventListener('resize', () => { if (modeFor(grid.parentElement.clientWidth) !== grid._mode) build(); });
    onView(grid, run, { threshold: 0.25 });
  }

  /* ── Loading dock ── */
  const dock = $('#dock');
  if (dock) {
    if (reduce) dock.classList.add('is-open');
    else onView(dock, () => { dock.classList.add('is-cracked'); setTimeout(() => dock.classList.add('is-open'), 450); }, { threshold: 0.4 });
  }

  /* ── Marquee ── */
  const mq = $('.marquee');
  if (mq) {
    // a second, hidden copy of the posts makes the loop seamless
    const tr = $('.marquee__track', mq);
    if (tr && !reduce) Array.from(tr.children).forEach((n) => { const c = n.cloneNode(true); c.setAttribute('aria-hidden', 'true'); tr.appendChild(c); });
    const btn = $('.marquee__btn');
    btn?.addEventListener('click', () => {
      const p = !mq.classList.contains('is-paused');
      mq.classList.toggle('is-paused', p);
      btn.setAttribute('aria-pressed', String(p));
      $('span', btn).textContent = p ? btn.dataset.labelPlay : btn.dataset.labelPause;
      $('use', btn).setAttribute('href', p ? '#i-play' : '#i-pause');
    });
    if ('IntersectionObserver' in window) new IntersectionObserver((es) => es.forEach((e) => mq.classList.toggle('is-off', !e.isIntersecting))).observe(mq);
    if (reduce && btn) btn.parentElement.hidden = true;
  }

  /* ── Footer: brand word in a 1-bit dither ── */
  const dither = $('.dither');
  if (dither) {
    const cv = $('canvas', dither);
    const narrow = () => window.innerWidth < 768;
    const size = () => {
      if (!narrow()) return [1440, 464];
      const w = Math.max(320, Math.round(dither.clientWidth));
      return [w, Math.round(w * 464 / 1440)];
    };
    let drawnFor = '';
    const draw = () => {
      // phones: draw at the box's own size so the whole word fits and the 2px dots stay crisp
      [cv.width, cv.height] = size();
      drawnFor = cv.width + 'x' + cv.height;
      const W = cv.width, H = cv.height, S = 2;
      const off = document.createElement('canvas');
      off.width = W / S; off.height = H / S;
      const o = off.getContext('2d');
      const w = off.width, h = off.height;
      const fs = Math.min(Math.round(h * 0.62), Math.round(w * 0.2));
      const g = o.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.55, 'rgba(255,255,255,.22)'); g.addColorStop(1, 'rgba(255,255,255,.05)');
      o.fillStyle = g; o.fillRect(0, 0, w, h);
      o.fillStyle = '#fff';
      o.font = `700 ${fs}px Satoshi, system-ui, sans-serif`;
      o.textAlign = 'center'; o.textBaseline = 'middle';
      o.fillText('nightshift', w / 2, h * 0.52);
      const img = o.getImageData(0, 0, w, h).data;
      const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
      const ctx = cv.getContext('2d');
      const out = ctx.createImageData(W, H);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const v = img[(y * w + x) * 4] / 255 * (img[(y * w + x) * 4 + 3] / 255);
        const on = v * 0.9 > (bayer[(y % 4) * 4 + (x % 4)] + 0.5) / 16;
        if (!on) continue;
        const a = v > 0.8 ? 70 : 42;
        for (let dy = 0; dy < S; dy++) for (let dx = 0; dx < S - 1; dx++) {
          const i = ((y * S + dy) * W + (x * S + dx)) * 4;
          out.data[i] = 246; out.data[i + 1] = 214; out.data[i + 2] = 160; out.data[i + 3] = a;
        }
      }
      ctx.putImageData(out, 0, 0);
      dither.classList.add('is-on');
    };
    const go = () => (document.fonts && document.fonts.ready ? document.fonts.ready.then(draw) : draw());
    onView(dither, go, { threshold: 0.05, rootMargin: '200px' });
    let rz;
    window.addEventListener('resize', () => {
      clearTimeout(rz);
      rz = setTimeout(() => { if (dither.classList.contains('is-on') && size().join('x') !== drawnFor) draw(); }, 200);
    });
  }
  /* ── Footer: the Legal items open a short concept notice ── */
  const note = $('#concept-note');
  const legal = $$('.flegal__btn');
  if (note && legal.length) {
    legal.forEach((b) => b.addEventListener('click', () => {
      const open = note.hidden;
      note.hidden = !open;
      legal.forEach((x) => x.setAttribute('aria-expanded', String(open)));
    }));
  }
})();
