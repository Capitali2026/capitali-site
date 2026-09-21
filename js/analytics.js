// Google Analytics 4 — chargé uniquement après consentement (cf. cookie-consent.js).
// Ne charge jamais gtag.js tant que le visiteur n'a pas explicitement accepté.
(function () {
  var GA_ID = "G-9KPDEWZZN8";
  var loaded = false;

  function loadGA() {
    if (loaded) return;
    loaded = true;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag("js", new Date());
    gtag("config", GA_ID);
  }

  if (window.capitaliConsent === "accepted") {
    loadGA();
  } else {
    document.addEventListener("capitali:consent", function (e) {
      if (e.detail === "accepted") loadGA();
    });
  }
})();
