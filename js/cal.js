// Capitali - embed Cal.com (prise de rendez-vous)
//
// Source unique de l'intégration : ce fichier était auparavant collé en dur
// dans six pages, ce qui avait déjà produit une dérive (experts-comptables
// pointait vers app.cal.com quand toutes les autres pointaient vers
// app.cal.eu). Une seule constante à changer désormais.
//
// L'instance EUROPÉENNE est conservée : le site annonce un hébergement dans
// l'UE et la conformité RGPD, et les données de réservation (nom, e-mail)
// transitent par cette instance. Basculer sur .com est un choix à faire en
// connaissance de cause, pas un détail d'implémentation.
//
// Les CTA restent des <a href> vers cal.com : sans JavaScript, le lien
// fonctionne toujours et ouvre la page de réservation.
//
// Une fois l'embed chargé, on annule nous-mêmes la navigation en phase de
// capture, au lieu de compter sur le preventDefault de Cal : avec un href
// présent, le navigateur ouvrait la page ET la modale s'affichait.
// Le garde-fou est le drapeau `ready` : tant que le script distant n'a pas
// été chargé, le clic suit le lien normalement plutôt que de ne rien faire.
(function () {
  var ORIGIN = 'https://app.cal.eu';
  var NAMESPACE = '30min';

  (function (C, A, L) {
    var p = function (a, ar) { a.q.push(ar); };
    var d = C.document;
    C.Cal = C.Cal || function () {
      var cal = C.Cal; var ar = arguments;
      if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement('script')).src = A; cal.loaded = true; }
      if (ar[0] === L) {
        var api = function () { p(api, arguments); };
        var namespace = ar[1]; api.q = api.q || [];
        if (typeof namespace === 'string') { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ['initNamespace', namespace]); }
        else p(cal, ar);
        return;
      }
      p(cal, ar);
    };
  })(window, ORIGIN + '/embed/embed.js', 'init');

  Cal('init', NAMESPACE, { origin: ORIGIN });
  Cal.config = Cal.config || {};
  Cal.config.forwardQueryParams = true;
  Cal.ns[NAMESPACE]('ui', { hideEventTypeDetails: false, layout: 'month_view' });

  // Le stub Cal vient d'injecter le script distant dans <head> : on s'y
  // raccroche pour savoir quand la modale est réellement disponible.
  var ready = false;
  var tag = document.head.querySelector('script[src="' + ORIGIN + '/embed/embed.js"]');
  if (tag) {
    tag.addEventListener('load', function () { ready = true; });
    tag.addEventListener('error', function () { ready = false; }); // le lien reprend la main
  }

  document.addEventListener('click', function (e) {
    if (!ready) return;                       // embed indisponible : on laisse le lien agir
    if (e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // ouverture volontaire dans un onglet
    var el = e.target.closest && e.target.closest('a[data-cal-link]');
    if (el) e.preventDefault();               // la modale seule, pas de navigation
  }, true);
})();
