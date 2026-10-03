/* NEXYA - comportements communs des pages secondaires : theme et navigation. */
(function () {
  'use strict';
  var root = document.documentElement;
  var EN = root.lang === 'en';
  var T = EN ? { toLight: 'Switch to light theme', toDark: 'Switch to dark theme' }
             : { toLight: 'Passer en thème clair', toDark: 'Passer en thème sombre' };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  var toggle = document.querySelector('[data-theme-toggle]');
  var meta = document.querySelector('meta[name="theme-color"]');

  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function label() {
    if (toggle) toggle.setAttribute('aria-label', root.getAttribute('data-theme') === 'dark' ? T.toLight : T.toDark);
  }
  function apply(t) {
    root.setAttribute('data-theme', t);
    if (meta) meta.content = t === 'dark' ? '#08080B' : '#FBFBFD';
    label();
  }
  function setTheme(t, x, y) {
    store('nx-theme', t);
    if (!document.startViewTransition || reduce.matches) { apply(t); return; }
    root.classList.add('theme-swap');
    var vt = document.startViewTransition(function () { apply(t); });
    vt.ready.then(function () {
      var r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      root.animate(
        { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + r + 'px at ' + x + 'px ' + y + 'px)'] },
        { duration: 800, easing: 'cubic-bezier(.16,1,.3,1)', pseudoElement: '::view-transition-new(root)' }
      );
    }).catch(function () {});
    vt.finished.finally(function () { root.classList.remove('theme-swap'); });
  }

  label();
  if (toggle) toggle.addEventListener('click', function () {
    var r = toggle.getBoundingClientRect();
    setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', r.left + r.width / 2, r.top + r.height / 2);
  });
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', function (e) {
    if (!read('nx-theme')) apply(e.matches ? 'light' : 'dark');
  });

  var nav = document.querySelector('[data-nav]');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('is-scrolled', scrollY > 24); };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
