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
