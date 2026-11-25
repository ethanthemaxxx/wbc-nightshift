/* Nightshift inner pages: pricing calculator, FAQ, chart, features scroll-spy, code tabs and copy. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fmt = new Intl.NumberFormat('en-US');
  var usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /* ── Step chart: draw once when visible ── */
  var chart = document.querySelector('.p-chart');
  if (chart && !reduce && 'IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { chart.classList.add('is-drawing'); co.disconnect(); }
    }, { threshold: .3 });
    co.observe(chart);
  }

  /* ── Calculator (formula from COPY.md §3.5) ── */
  var runs = document.getElementById('runs');
  var mins = document.getElementById('mins');
  if (runs && mins) {
    var PLANS = [
      { name: 'Hobby', base: 0, runs: 50000, mins: 1000, rRate: null, mRate: null },
      { name: 'Pro', base: 29, runs: 500000, mins: 10000, rRate: .30, mRate: .001 },
      { name: 'Team', base: 149, runs: 5000000, mins: 100000, rRate: .20, mRate: .0007 }
    ];
    var toVal = function (el) {
      var lo = Math.log10(+el.dataset.min), hi = Math.log10(+el.dataset.max);
      return Math.pow(10, lo + (hi - lo) * (+el.value / +el.max));
    };
    var toPos = function (el, v) {
      var lo = Math.log10(+el.dataset.min), hi = Math.log10(+el.dataset.max);
      return Math.round((Math.log10(v) - lo) / (hi - lo) * +el.max);
    };
    var nice = function (v) {
      var p = Math.pow(10, Math.max(0, Math.floor(Math.log10(v)) - 1));
      return Math.round(v / p) * p;
    };
    var vals = { runs: +runs.dataset.init, mins: +mins.dataset.init };
    runs.value = toPos(runs, vals.runs);
    mins.value = toPos(mins, vals.mins);

    var cost = function (p, r, m) {
      if (p.rRate === null) return (r <= p.runs && m <= p.mins) ? { total: 0, base: 0, er: 0, em: 0 } : null;
      var er = Math.max(0, r - p.runs) / 10000 * p.rRate;
      var em = Math.max(0, m - p.mins) * p.mRate;
      return { total: p.base + er + em, base: p.base, er: er, em: em };
    };
    var $ = function (id) { return document.getElementById(id); };
    var render = function () {
      var r = vals.runs, m = vals.mins, best = null;
      PLANS.forEach(function (p) {
        var c = cost(p, r, m);
        if (c && (!best || c.total < best.c.total)) best = { p: p, c: c };
      });
      $('runs-out').textContent = fmt.format(r);
      $('mins-out').textContent = fmt.format(m);
      runs.setAttribute('aria-valuetext', fmt.format(r) + ' jobs per month');
      mins.setAttribute('aria-valuetext', fmt.format(m) + ' compute minutes per month');
      runs.style.setProperty('--p', (runs.value / runs.max * 100) + '%');
      mins.style.setProperty('--p', (mins.value / mins.max * 100) + '%');
      var t = best.c.total;
      $('calc-total').textContent = '$' + fmt.format(Math.round(t));
      $('calc-fit').textContent = 'Best fit: ' + best.p.name;
      $('calc-base').textContent = usd.format(best.c.base);
      $('calc-runs').textContent = usd.format(best.c.er);
      $('calc-mins').textContent = usd.format(best.c.em);
      $('calc-over').hidden = !(r >= 100000000 || t > 2000);
      // one short announcement once the slider settles, not one per step
      clearTimeout(sayTimer);
      sayTimer = setTimeout(function () {
        var say = $('calc-say');
        if (say) say.textContent = 'Estimated cost $' + fmt.format(Math.round(t)) + ' per month, best fit ' + best.p.name + '.';
      }, 400);
    };
    var sayTimer;
    runs.addEventListener('input', function () { vals.runs = nice(toVal(runs)); render(); });
    mins.addEventListener('input', function () { vals.mins = nice(toVal(mins)); render(); });
    render();
  }

  /* ── FAQ accordion ── */
  document.querySelectorAll('.faq__q').forEach(function (b) {
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') === 'true';
      b.setAttribute('aria-expanded', String(!open));
      document.getElementById(b.getAttribute('aria-controls')).hidden = open;
    });
  });

  /* ── Features sub-nav scroll-spy ── */
  var links = Array.prototype.slice.call(document.querySelectorAll('.subnav a'));
  if (links.length) {
    var targets = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
    var spy = function () {
      var line = (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 72) + 120;
      var idx = 0;
      targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top <= line) idx = i; });
      links.forEach(function (a, i) {
        if (i === idx) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
      var cur = links[idx];
      if (cur && cur.parentElement && cur.closest('.subnav__list')) {
        var list = cur.closest('.subnav__list');
        if (list.scrollWidth > list.clientWidth) list.scrollLeft = cur.offsetLeft - 16;
      }
    };
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(function () { spy(); ticking = false; }); }
    }, { passive: true });
    spy();
  }

  /* ── Language tabs ── */
  document.querySelectorAll('.ltabs').forEach(function (list) {
    var tabs = Array.prototype.slice.call(list.querySelectorAll('[role=tab]'));
    var select = function (tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tab.focus();
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          select(tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length], true);
        }
      });
    });
  });

  /* ── Copy code ── */
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    var label = btn.querySelector('span');
    label.setAttribute('aria-live', 'polite');
    btn.addEventListener('click', function () {
      var text = btn.parentElement.querySelector('code').textContent;
      var done = function () {
        label.textContent = 'Copied';
        btn.classList.add('is-done');
        setTimeout(function () { label.textContent = 'Copy code'; btn.classList.remove('is-done'); }, 1800);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, done);
      } else {
        var ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (e) { /* no clipboard */ }
        document.body.removeChild(ta); done();
      }
    });
  });
})();
