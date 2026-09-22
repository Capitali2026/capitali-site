// Capitali - comportements partagés du design system (v2)
// Bandeau LPV fermable (fermeture mémorisée) + reveal au scroll.
// Chargé par toutes les pages actives, juste après le .topstack : le bandeau
// est donc déjà dans le DOM quand ce script s'exécute, ce qui permet de le
// masquer avant peinture si l'utilisateur l'a déjà fermé (pas de clignotement).
(function () {
  var STORAGE_KEY = 'capitali:banner-lpv-dismissed';

  // localStorage peut lever (navigation privée, cookies tiers bloqués) :
  // le bandeau doit rester fonctionnel même si le stockage est indisponible.
  function readDismissed() {
    try { return window.localStorage.getItem(STORAGE_KEY) === '1'; }
    catch (e) { return false; }
  }
  function storeDismissed() {
    try { window.localStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
  }

  var banner = document.getElementById('banner');
  if (banner) {
    if (readDismissed()) {
      banner.classList.add('is-hidden');
    }
    var close = document.getElementById('banner-close');
    if (close) {
      close.addEventListener('click', function () {
        banner.classList.add('is-hidden');
        storeDismissed();
      });
    }
  }

  // Menu mobile : un seul .nav-toggle par page, delegue au document pour ne
  // pas dependre de l'ordre de chargement ni dupliquer ce script par page.
  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('.nav-toggle');
    if (toggle) {
      var panel = document.getElementById(toggle.getAttribute('aria-controls'));
      if (!panel) return;
      var open = panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      return;
    }
    document.querySelectorAll('.nav-right.is-open').forEach(function (panel) {
      if (!panel.contains(e.target)) {
        panel.classList.remove('is-open');
        var btn = panel.closest('nav').querySelector('.nav-toggle');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.nav-right.is-open').forEach(function (panel) {
      panel.classList.remove('is-open');
      var btn = panel.closest('nav').querySelector('.nav-toggle');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('DOMContentLoaded', function () {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var revealEls = document.querySelectorAll('.reveal');
    if (reduceMotion) {
      revealEls.forEach(function (el) { el.classList.add('in-view'); });
    } else if ('IntersectionObserver' in window) {
      var revealObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      revealEls.forEach(function (el) { revealObs.observe(el); });
    }
  });
})();
