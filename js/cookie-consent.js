// Bandeau de consentement cookies — minimal, sans dépendance.
// Stocke le choix dans localStorage et expose window.capitaliConsent pour que
// tout script de mesure d'audience ajouté plus tard (GA4, etc.) puisse
// vérifier le consentement avant de se charger, au lieu de charger puis demander.
(function () {
  var STORAGE_KEY = "capitali_cookie_consent";

  function getConsent() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function setConsent(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {}
    window.capitaliConsent = value;
    document.dispatchEvent(new CustomEvent("capitali:consent", { detail: value }));
  }

  window.capitaliConsent = getConsent();

  if (window.capitaliConsent) return; // déjà répondu (accepté ou refusé)

  function injectBanner() {
    var banner = document.createElement("div");
    banner.id = "cookie-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Consentement aux cookies");
    banner.innerHTML =
      '<p>Nous utilisons des cookies de mesure d’audience pour comprendre l’usage du site. ' +
      'Aucun cookie non essentiel n’est déposé sans votre accord. ' +
      '<a href="/confidentialite/">En savoir plus</a>.</p>' +
      '<div class="cookie-banner-actions">' +
      '<button type="button" class="btn-ghost" data-consent="refuse">Refuser</button>' +
      '<button type="button" class="btn-primary" data-consent="accept">Accepter</button>' +
      "</div>";
    document.body.appendChild(banner);

    banner.addEventListener("click", function (e) {
      var choice = e.target && e.target.getAttribute("data-consent");
      if (!choice) return;
      setConsent(choice === "accept" ? "accepted" : "refused");
      banner.remove();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectBanner);
  } else {
    injectBanner();
  }
})();
