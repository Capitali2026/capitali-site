// =============================================================================
// Capitali - calcul du simulateur AGA et rendu de ses emails
// =============================================================================
// CE FICHIER EST LA SEULE IMPLÉMENTATION DU CALCUL.
//
// Il tourne dans deux runtimes : le navigateur (chargé par
// site/simulateur-aga/index.html) et Deno (recopié à l'octet près entre les
// marqueurs `CAPITALI:GENERATED aga-calc` de supabase/functions/lpv-leads/index.ts).
// L'email reçu affiche donc exactement les chiffres vus à l'écran, par
// construction et non par convention.
//
// Contraintes que cette cohabitation impose, vérifiées par
// scripts/simulateur-aga/check_params.py, ne pas les contourner :
//   1. Aucun import / export, un seul binding de premier niveau (`AGA_CALC`).
//   2. Tout paramètre de fonction exposée a une valeur par défaut : le bloc
//      recopié dans un fichier .ts reste alors inférable par TypeScript.
//   3. Pas d'`Intl.NumberFormat` : son séparateur de milliers vaut U+00A0 ou
//      U+202F selon la version d'ICU du runtime : l'écran et l'email
//      diffèreraient d'un caractère invisible. Le formatage est fait à la main.
//   4. Aucune formule écrite deux fois : les deux profils partagent leurs
//      primitives (contribution, dilution, abonnement, net du bénéficiaire).
//
// Le bloc `aga-params` ci-dessous est GÉNÉRÉ depuis
// scripts/simulateur-aga/params.json et scripts/simulateur-aga/email/*.html
// par `python3 scripts/simulateur-aga/apply_params.py`. Ne pas l'éditer.
// =============================================================================

const AGA_CALC = (function () {
    /* ══ CAPITALI:GENERATED aga-params ══ */
    var PARAMS =     {
      "calcul": {
        "horizonAns": 4,
        "profils": {
          "fidelisation": {
            "bornes": {
              "nbBeneficiaires": {
                "defaut": 3,
                "max": 30,
                "min": 1,
                "step": 1
              },
              "valeurAnnuelle": {
                "defaut": 6000,
                "max": 18000,
                "min": 2000,
                "step": 500
              },
              "valorisation": {
                "defaut": 2000000,
                "inputMax": 500000000,
                "inputMin": 50000,
                "inputStep": 10000,
                "max": 20000000,
                "min": 100000,
                "step": 100000
              }
            },
            "libelle": "Fidélisation",
            "sousTitre": "Garder mes profils clés"
          },
          "transmission": {
            "bornes": {
              "dureeAns": {
                "defaut": 5,
                "max": 10,
                "min": 2,
                "step": 1
              },
              "nbRepreneurs": {
                "defaut": 3,
                "max": 10,
                "min": 1,
                "step": 1
              },
              "partTransmisePct": {
                "defaut": 10,
                "max": 20,
                "min": 1,
                "step": 0.5
              },
              "valorisation": {
                "defaut": 2000000,
                "inputMax": 500000000,
                "inputMin": 50000,
                "inputStep": 10000,
                "max": 20000000,
                "min": 100000,
                "step": 100000
              }
            },
            "libelle": "Transmission",
            "sousTitre": "Reprise progressive par mes cadres"
          }
        }
      },
      "cta": {
        "label": "Réserver 30 minutes",
        "url": "https://cal.com/capitali/30min"
      },
      "endpoint": {
        "anonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2dXVyZW1pempzbmlscGhhaHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NTY0ODMsImV4cCI6MjA5MTIzMjQ4M30.nL3McMOnJ245eYibDp1xFPbBT0lVjx3vkw5YeO8xcBk",
        "url": "https://gvuuremizjsnilphahul.supabase.co/functions/v1/lpv-leads"
      },
      "fiscal": {
        "contributionPatronaleTaux": 0.3,
        "contributionPatronaleTauxAValiderAvocat": "Q5",
        "exonerationPmePlafondPass": 1.0,
        "exonerationPmePlafondPassAValiderAvocat": "Q5",
        "gainAcquisitionAbattementPct": 0.5,
        "gainAcquisitionAbattementPctAValiderAvocat": "Q8",
        "gainAcquisitionPrelevementsSociauxPct": 0.172,
        "gainAcquisitionPrelevementsSociauxPctAValiderAvocat": "Q8",
        "passAnnuel": 47100.0,
        "passAnnuelAValiderAvocat": "Q5",
        "primeChargesPatronalesPct": 0.45,
        "primeChargesPatronalesPctAValiderAvocat": "Q19",
        "primeChargesSalarialesPct": 0.22,
        "primeChargesSalarialesPctAValiderAvocat": "Q19",
        "primeTauxImpositionPct": 0.3,
        "primeTauxImpositionPctAValiderAvocat": "Q19"
      },
      "plafonds": {
        "generalPct": 0.15,
        "generalPctAValiderAvocat": "Q1",
        "individuelPct": 0.1,
        "individuelPctAValiderAvocat": "Q3",
        "pmeNonCoteePct": 0.2,
        "pmeNonCoteePctAValiderAvocat": "Q1"
      },
      "prix": {
        "abonnementMensuel": 190,
        "setup": 3500
      },
      "textes": {
        "disclaimerSimulateur": "Simulation illustrative fondée exclusivement sur les hypothèses que vous avez saisies et sur des ordres de grandeur de charges et d'imposition : elle ne constitue ni une valorisation réelle de votre entreprise, ni une garantie de performance, ni un conseil en investissement, ni une recommandation personnalisée. Le coût employeur et le net du bénéficiaire reposent sur des taux provisoires en cours de validation juridique. La plus-value réalisée lors d'une revente ultérieure des actions n'est pas modélisée. Consultez votre expert-comptable ou un conseiller habilité avant toute décision.",
        "mentionContributionPatronale": "Contribution patronale de {{taux_contribution}} appliquée à la valeur attribuée, due à l'acquisition des actions et non à la décision d'attribution. Taux provisoire, en cours de validation juridique.",
        "mentionDonnees": "Vous recevez cet email parce que vous avez demandé le détail de votre simulation sur capitali.fr. Pour ne plus être contacté, répondez simplement à ce message.",
        "mentionExoneration": "Une PME qui n'a jamais distribué de dividendes en est exonérée dans la limite de {{plafond_exoneration}} par bénéficiaire, c'est le cas retenu ici.",
        "mentionPlafondIndividuel": "Attention : ce plan attribuerait {{part_par_beneficiaire}} du capital à un seul bénéficiaire, au-delà du plafond individuel de {{plafond_individuel}}. Répartissez sur davantage de bénéficiaires, ou réduisez la part attribuée.",
        "sujetEmailFidelisation": "Votre simulation : la prime vous coûte {{cout_prime}}, le plan AGA {{cout_aga}}",
        "sujetEmailTransmission": "Votre simulation : transmettre {{part_transmise}} de votre capital pour {{cout_aga}}",
        "verdictFidelisation": "Sur {{horizon}}, la prime vous coûte {{cout_prime}}. Le plan AGA : {{cout_aga}}.",
        "verdictFidelisationSous": "Votre profil clé touche {{ecart_net}} de plus net, et vous conservez {{capital_conserve}} du capital.",
        "verdictTransmission": "Transmettre {{part_transmise}} de votre capital à {{nb_repreneurs}} coûte {{cout_aga}} sur {{duree}}.",
        "verdictTransmissionSous": "Vos repreneurs ne déboursent rien, là où un rachat leur demanderait {{valeur_transmise}} à financer. Vous conservez {{capital_conserve}} du capital."
      },
      "version": "aga-sim-2"
    };
    var EMAIL_TEMPLATES =     {
      "fidelisation": "<div style=\"margin:0;padding:24px 12px;background:#faf9f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;\">\n  <div style=\"max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e3ddd0;\">\n    <div style=\"padding:24px 24px 8px 24px;\">\n      <div style=\"font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#847d6c;\">Capitali · Fidélisation</div>\n      <h1 style=\"margin:8px 0 0 0;font-size:20px;line-height:1.3;font-weight:400;color:#12100c;\">{{verdict}}</h1>\n      <p style=\"margin:10px 0 0 0;font-size:14px;line-height:1.6;color:#4a4438;\">{{verdict_sous}}</p>\n    </div>\n\n    <div style=\"padding:16px 24px 0 24px;\">\n      <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" style=\"width:100%;border-collapse:collapse;\">\n        <tr>\n          <td width=\"50%\" style=\"padding:12px;background:rgba(194,72,31,0.06);border:1px solid #c2481f;vertical-align:top;\">\n            <div style=\"font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:#c2481f;\">Prime classique</div>\n            <div style=\"font-size:22px;color:#c2481f;padding:6px 0 2px 0;\">{{cout_prime}}</div>\n            <div style=\"font-size:11px;color:#847d6c;\">coût employeur sur {{horizon}}</div>\n          </td>\n          <td width=\"8\"></td>\n          <td width=\"50%\" style=\"padding:12px;background:rgba(0,184,107,0.08);border:1px solid #00b86b;vertical-align:top;\">\n            <div style=\"font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:#009a59;\">Plan AGA Capitali</div>\n            <div style=\"font-size:22px;color:#009a59;padding:6px 0 2px 0;\">{{cout_aga}}</div>\n            <div style=\"font-size:11px;color:#847d6c;\">coût employeur sur {{horizon}}</div>\n          </td>\n        </tr>\n      </table>\n      <p style=\"margin:10px 0 0 0;font-size:13px;color:#12100c;\">Écart : <strong>{{ecart_cout}}</strong> sur {{horizon}}.</p>\n    </div>\n\n    <div style=\"padding:20px 24px 0 24px;\">\n      <div style=\"font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#847d6c;padding-bottom:6px;\">Le détail, par bénéficiaire</div>\n      <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" style=\"width:100%;border-collapse:collapse;font-size:13px;color:#12100c;\">\n        <tr><td style=\"padding:6px 0;color:#847d6c;border-bottom:1px solid #efeade;\">Valeur attribuée</td><td align=\"right\" style=\"padding:6px 0;font-weight:600;border-bottom:1px solid #efeade;\">{{valeur_par_beneficiaire}}</td></tr>\n        <tr><td style=\"padding:6px 0;color:#847d6c;border-bottom:1px solid #efeade;\">Net s'il touchait une prime</td><td align=\"right\" style=\"padding:6px 0;border-bottom:1px solid #efeade;\">{{net_prime}}</td></tr>\n        <tr><td style=\"padding:6px 0;color:#847d6c;border-bottom:1px solid #efeade;\">Net avec le plan AGA</td><td align=\"right\" style=\"padding:6px 0;font-weight:600;color:#009a59;border-bottom:1px solid #efeade;\">{{net_aga}}</td></tr>\n        <tr><td style=\"padding:6px 0;color:#847d6c;\">Différence</td><td align=\"right\" style=\"padding:6px 0;font-weight:600;color:#009a59;\">{{ecart_net}}</td></tr>\n      </table>\n    </div>\n\n    <div style=\"padding:20px 24px 0 24px;\">\n      <div style=\"font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#847d6c;padding-bottom:6px;\">Ce que ça coûte, et ce que vous gardez</div>\n      <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" style=\"width:100%;border-collapse:collapse;font-size:13px;color:#12100c;\">\n        <tr><td style=\"padding:6px 0;color:#847d6c;border-bottom:1px solid #efeade;\">Abonnement Capitali sur {{horizon}}</td><td align=\"right\" style=\"padding:6px 0;border-bottom:1px solid #efeade;\">{{abonnement}}</td></tr>\n        <tr><td style=\"padding:6px 0;color:#847d6c;border-bottom:1px solid #efeade;\">Contribution patronale</td><td align=\"right\" style=\"padding:6px 0;border-bottom:1px solid #efeade;\">{{contribution}}</td></tr>\n        <tr><td style=\"padding:6px 0;color:#847d6c;border-bottom:1px solid #efeade;\">Capital attribué ({{nb_beneficiaires}})</td><td align=\"right\" style=\"padding:6px 0;border-bottom:1px solid #efeade;\">{{valeur_attribuee}} · {{dilution}}</td></tr>\n        <tr><td style=\"padding:6px 0;color:#847d6c;\">Capital que vous conservez</td><td align=\"right\" style=\"padding:6px 0;font-weight:600;\">{{capital_conserve}}</td></tr>\n      </table>\n      <p style=\"margin:10px 0 0 0;font-size:11px;line-height:1.6;color:#847d6c;\">{{mention_contribution}} {{mention_exoneration}}</p>\n      <p style=\"margin:8px 0 0 0;font-size:12px;line-height:1.6;color:#c2481f;\">{{alerte_plafond}}</p>\n    </div>\n\n    <div style=\"padding:20px 24px 24px 24px;\">\n      <a href=\"{{cta_url}}\" style=\"display:inline-block;background:#12100c;color:#ffffff;text-decoration:none;font-size:14px;padding:12px 20px;\">{{cta_label}} →</a>\n      <p style=\"margin:10px 0 0 0;font-size:12px;color:#847d6c;\">On passe en revue votre situation réelle : plafonds applicables, périodes d'acquisition, documents à produire.</p>\n    </div>\n\n    <div style=\"padding:16px 24px;border-top:1px solid #efeade;background:#fdfcf8;\">\n      <p style=\"margin:0;font-size:11px;line-height:1.7;color:#847d6c;\">{{disclaimer}}</p>\n      <p style=\"margin:10px 0 0 0;font-size:11px;line-height:1.7;color:#a8a29e;\">{{mention_donnees}}</p>\n      <p style=\"margin:10px 0 0 0;font-size:11px;line-height:1.7;color:#a8a29e;\">Vous ne souhaitez plus recevoir nos emails ? <a href=\"{{lien_desabonnement}}\" style=\"color:#a8a29e;\">Se désabonner en un clic</a>.</p>\n    </div>\n  </div>\n  <div style=\"max-width:520px;margin:12px auto 0 auto;text-align:center;font-size:11px;color:#a8a29e;\">Capitali · capitali.fr</div>\n</div>\n",
      "transmission": "<div style=\"margin:0;padding:24px 12px;background:#faf9f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;\">\n  <div style=\"max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e3ddd0;\">\n    <div style=\"padding:24px 24px 8px 24px;\">\n      <div style=\"font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#847d6c;\">Capitali · Transmission</div>\n      <h1 style=\"margin:8px 0 0 0;font-size:20px;line-height:1.3;font-weight:400;color:#12100c;\">{{verdict}}</h1>\n      <p style=\"margin:10px 0 0 0;font-size:14px;line-height:1.6;color:#4a4438;\">{{verdict_sous}}</p>\n    </div>\n\n    <div style=\"padding:16px 24px 0 24px;\">\n      <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" style=\"width:100%;border-collapse:collapse;\">\n        <tr>\n          <td width=\"50%\" style=\"padding:12px;background:rgba(194,72,31,0.06);border:1px solid #c2481f;vertical-align:top;\">\n            <div style=\"font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:#c2481f;\">Rachat à financer</div>\n            <div style=\"font-size:22px;color:#c2481f;padding:6px 0 2px 0;\">{{valeur_transmise}}</div>\n            <div style=\"font-size:11px;color:#847d6c;\">ce que vos cadres devraient réunir</div>\n          </td>\n          <td width=\"8\"></td>\n          <td width=\"50%\" style=\"padding:12px;background:rgba(0,184,107,0.08);border:1px solid #00b86b;vertical-align:top;\">\n            <div style=\"font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:#009a59;\">Transmission par AGA</div>\n            <div style=\"font-size:22px;color:#009a59;padding:6px 0 2px 0;\">{{debours_repreneurs}}</div>\n            <div style=\"font-size:11px;color:#847d6c;\">ce qu'ils déboursent</div>\n          </td>\n        </tr>\n      </table>\n    </div>\n\n    <div style=\"padding:20px 24px 0 24px;\">\n      <div style=\"font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#847d6c;padding-bottom:6px;\">Votre plan de transmission</div>\n      <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" style=\"width:100%;border-collapse:collapse;font-size:13px;color:#12100c;\">\n        <tr><td style=\"padding:6px 0;color:#847d6c;border-bottom:1px solid #efeade;\">Valorisation retenue</td><td align=\"right\" style=\"padding:6px 0;border-bottom:1px solid #efeade;\">{{valorisation}}</td></tr>\n        <tr><td style=\"padding:6px 0;color:#847d6c;border-bottom:1px solid #efeade;\">Part transmise sur {{duree}}</td><td align=\"right\" style=\"padding:6px 0;font-weight:600;border-bottom:1px solid #efeade;\">{{part_transmise}} · {{valeur_transmise}}</td></tr>\n        <tr><td style=\"padding:6px 0;color:#847d6c;border-bottom:1px solid #efeade;\">Par repreneur ({{nb_repreneurs}})</td><td align=\"right\" style=\"padding:6px 0;border-bottom:1px solid #efeade;\">{{valeur_par_repreneur}} · {{part_par_repreneur}}</td></tr>\n        <tr><td style=\"padding:6px 0;color:#847d6c;\">Capital que vous conservez</td><td align=\"right\" style=\"padding:6px 0;font-weight:600;\">{{capital_conserve}}</td></tr>\n      </table>\n    </div>\n\n    <div style=\"padding:20px 24px 0 24px;\">\n      <div style=\"font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#847d6c;padding-bottom:6px;\">Ce que ça vous coûte</div>\n      <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" style=\"width:100%;border-collapse:collapse;font-size:13px;color:#12100c;\">\n        <tr><td style=\"padding:6px 0;color:#847d6c;border-bottom:1px solid #efeade;\">Abonnement Capitali sur {{duree}}</td><td align=\"right\" style=\"padding:6px 0;border-bottom:1px solid #efeade;\">{{abonnement}}</td></tr>\n        <tr><td style=\"padding:6px 0;color:#847d6c;border-bottom:1px solid #efeade;\">Contribution patronale</td><td align=\"right\" style=\"padding:6px 0;border-bottom:1px solid #efeade;\">{{contribution}}</td></tr>\n        <tr><td style=\"padding:6px 0;color:#847d6c;\">Total</td><td align=\"right\" style=\"padding:6px 0;font-weight:600;color:#009a59;\">{{cout_aga}}</td></tr>\n      </table>\n      <p style=\"margin:10px 0 0 0;font-size:11px;line-height:1.6;color:#847d6c;\">{{mention_contribution}} {{mention_exoneration}}</p>\n      <p style=\"margin:8px 0 0 0;font-size:12px;line-height:1.6;color:#c2481f;\">{{alerte_plafond}}</p>\n    </div>\n\n    <div style=\"padding:20px 24px 24px 24px;\">\n      <a href=\"{{cta_url}}\" style=\"display:inline-block;background:#12100c;color:#ffffff;text-decoration:none;font-size:14px;padding:12px 20px;\">{{cta_label}} →</a>\n      <p style=\"margin:10px 0 0 0;font-size:12px;color:#847d6c;\">Une transmission se prépare : ordre des attributions, plafonds applicables, gouvernance pendant la période. On en parle.</p>\n    </div>\n\n    <div style=\"padding:16px 24px;border-top:1px solid #efeade;background:#fdfcf8;\">\n      <p style=\"margin:0;font-size:11px;line-height:1.7;color:#847d6c;\">{{disclaimer}}</p>\n      <p style=\"margin:10px 0 0 0;font-size:11px;line-height:1.7;color:#a8a29e;\">{{mention_donnees}}</p>\n      <p style=\"margin:10px 0 0 0;font-size:11px;line-height:1.7;color:#a8a29e;\">Vous ne souhaitez plus recevoir nos emails ? <a href=\"{{lien_desabonnement}}\" style=\"color:#a8a29e;\">Se désabonner en un clic</a>.</p>\n    </div>\n  </div>\n  <div style=\"max-width:520px;margin:12px auto 0 auto;text-align:center;font-size:11px;color:#a8a29e;\">Capitali · capitali.fr</div>\n</div>\n"
    };
/* ══ CAPITALI:END aga-params ══ */

    // Clés produites par buildEmailModel(), par profil. Le vérificateur s'en
    // sert pour refuser un jeton {{…}} d'un gabarit que rien n'alimenterait :
    // il arriverait littéral dans la boîte du prospect.
    var COMMON_KEYS = [
        "valorisation", "cout_aga", "abonnement", "contribution",
        "capital_conserve", "taux_contribution", "plafond_exoneration",
        "plafond_individuel", "verdict", "verdict_sous", "alerte_plafond",
        "mention_contribution", "mention_exoneration",
        "cta_url", "cta_label", "disclaimer", "mention_donnees",
        // Rempli par la fonction edge, qui seule détient le secret de signature.
        "lien_desabonnement"
    ];
    var EMAIL_MODEL_KEYS = {
        fidelisation: COMMON_KEYS.concat([
            "horizon", "nb_beneficiaires", "valeur_annuelle",
            "cout_prime", "ecart_cout", "net_prime", "net_aga", "ecart_net",
            "valeur_attribuee", "valeur_par_beneficiaire", "part_par_beneficiaire",
            "dilution"
        ]),
        transmission: COMMON_KEYS.concat([
            "duree", "part_transmise", "nb_repreneurs",
            "valeur_transmise", "valeur_par_repreneur", "debours_repreneurs",
            "part_par_repreneur"
        ])
    };

    var PROFILS = ["fidelisation", "transmission"];

    // Écrits en échappement Unicode et non en caractère littéral : ce sont des
    // espaces invisibles, un copier-coller les remplacerait par une espace simple.
    var GROUP_SEP = "\u202f";  // espace fine insécable, entre les milliers
    var EURO_SEP = "\u00a0";   // espace insécable, avant le symbole € et le %

    // ── Formatage ────────────────────────────────────────────────────────────

    function group(digits = "") {
        var out = "";
        for (var i = 0; i < digits.length; i++) {
            if (i > 0 && (digits.length - i) % 3 === 0) out += GROUP_SEP;
            out += digits.charAt(i);
        }
        return out;
    }

    function formatEur(n = 0) {
        var v = Number(n);
        if (!isFinite(v)) v = 0;
        return (v < 0 ? "-" : "") + group(String(Math.round(Math.abs(v)))) + EURO_SEP + "€";
    }

    function formatNumber(n = 0, decimals = 0) {
        var v = Number(n);
        if (!isFinite(v)) v = 0;
        var parts = Math.abs(v).toFixed(decimals).split(".");
        var out = group(parts[0]) + (parts.length > 1 ? "," + parts[1] : "");
        return (v < 0 ? "-" : "") + out;
    }

    // Un pourcentage au demi-point près s'affiche « 7,5 % », un entier « 5 % ».
    function formatPct(n = 0) {
        var v = Number(n);
        if (!isFinite(v)) v = 0;
        return formatNumber(v, v % 1 === 0 ? 0 : 1) + EURO_SEP + "%";
    }

    // ── Entrées ──────────────────────────────────────────────────────────────

    function clampOne(value = 0, min = 0, max = 0, fallback = 0) {
        var v = Number(value);
        if (!isFinite(v)) return fallback;
        if (v < min) return min;
        if (v > max) return max;
        return v;
    }

    function bornes(profil = "fidelisation") {
        return PARAMS.calcul.profils[profil].bornes;
    }

    function clampField(raw = {}, b = {}, key = "", entier = false) {
        var spec = b[key];
        // Piège : la règle « une valeur par défaut sur chaque paramètre »
        // (imposée par le vendoring dans un .ts) fait qu'un argument `undefined`
        // est remplacé par le défaut de la SIGNATURE, pas par le défaut métier.
        // Une saisie absente tomberait donc sur la borne basse. On tranche ici.
        var brut = raw[key];
        if (brut === undefined || brut === null || brut === "") return spec.defaut;
        var low = spec.inputMin === undefined ? spec.min : spec.inputMin;
        var high = spec.inputMax === undefined ? spec.max : spec.inputMax;
        var v = clampOne(brut, low, high, spec.defaut);
        return entier ? Math.round(v) : v;
    }

    // Appelé côté serveur : une charge utile forgée ne peut produire qu'une
    // simulation dans les limites des curseurs, jamais un texte arbitraire.
    function clampInputs(raw = {}) {
        var profil = PROFILS.indexOf(raw.profil) === -1 ? "fidelisation" : raw.profil;
        var b = bornes(profil);
        var out = { profil: profil, aDistribueDividendes: raw.aDistribueDividendes === true };
        if (profil === "fidelisation") {
            out.nbBeneficiaires = clampField(raw, b, "nbBeneficiaires", true);
            out.valeurAnnuelle = clampField(raw, b, "valeurAnnuelle");
            out.valorisation = clampField(raw, b, "valorisation");
        } else {
            out.valorisation = clampField(raw, b, "valorisation");
            out.partTransmisePct = clampField(raw, b, "partTransmisePct");
            out.nbRepreneurs = clampField(raw, b, "nbRepreneurs", true);
            out.dureeAns = clampField(raw, b, "dureeAns", true);
        }
        return out;
    }

    // ── Primitives partagées par les deux profils ────────────────────────────

    function abonnement(ans = 0) {
        return PARAMS.prix.setup + PARAMS.prix.abonnementMensuel * 12 * ans;
    }

    function plafondExoneration() {
        return PARAMS.fiscal.passAnnuel * PARAMS.fiscal.exonerationPmePlafondPass;
    }

    // Une PME qui n'a jamais distribué de dividendes est exonérée jusqu'à
    // 1 PASS par bénéficiaire (condition à valider, cf. QUESTIONS_AVOCAT.md Q5).
    function contributionPatronale(valeurParBeneficiaire = 0, nb = 1, aDistribueDividendes = false) {
        var assiette = aDistribueDividendes
            ? valeurParBeneficiaire
            : Math.max(0, valeurParBeneficiaire - plafondExoneration());
        return assiette * nb * PARAMS.fiscal.contributionPatronaleTaux;
    }

    // Même assiette que checkPlafondCollectif côté application : capital dilué
    // post-attribution. Sinon le simulateur annoncerait une dilution que
    // l'application contredirait.
    function dilution(valeurAttribuee = 0, valorisation = 0) {
        var total = valorisation + valeurAttribuee;
        return total > 0 ? valeurAttribuee / total : 0;
    }

    // Réciproque : quelle valeur attribuer pour diluer de `ratio`.
    function valeurPourDilution(valorisation = 0, ratio = 0) {
        return ratio >= 1 ? 0 : valorisation * ratio / (1 - ratio);
    }

    // Le taux d'imposition est celui du foyer : il s'applique des deux côtés de
    // la comparaison, sur le salaire comme sur le gain d'acquisition abattu.
    function netBeneficiaireAga(valeurParBeneficiaire = 0) {
        var f = PARAMS.fiscal;
        var imposable = valeurParBeneficiaire * f.gainAcquisitionAbattementPct;
        return valeurParBeneficiaire
            - imposable * f.primeTauxImpositionPct
            - valeurParBeneficiaire * f.gainAcquisitionPrelevementsSociauxPct;
    }

    function netBeneficiairePrime(brutAnnuel = 0, ans = 0) {
        var f = PARAMS.fiscal;
        return brutAnnuel * (1 - f.primeChargesSalarialesPct) * (1 - f.primeTauxImpositionPct) * ans;
    }

    // ── Les deux profils ─────────────────────────────────────────────────────

    function computeFidelisation(input = {}) {
        var i = input;
        var f = PARAMS.fiscal;
        var ans = PARAMS.calcul.horizonAns;

        var coutPrime = i.nbBeneficiaires * i.valeurAnnuelle * (1 + f.primeChargesPatronalesPct) * ans;
        var valeurParBeneficiaire = i.valeurAnnuelle * ans;
        var valeurAttribuee = valeurParBeneficiaire * i.nbBeneficiaires;
        var contribution = contributionPatronale(valeurParBeneficiaire, i.nbBeneficiaires, i.aDistribueDividendes);
        var abo = abonnement(ans);
        var netPrime = netBeneficiairePrime(i.valeurAnnuelle, ans);
        var netAga = netBeneficiaireAga(valeurParBeneficiaire);
        var dil = dilution(valeurAttribuee, i.valorisation);

        return {
            profil: "fidelisation", ans: ans,
            nbBeneficiaires: i.nbBeneficiaires, valeurAnnuelle: i.valeurAnnuelle,
            valorisation: i.valorisation, aDistribueDividendes: i.aDistribueDividendes,
            coutPrime: coutPrime,
            abonnement: abo,
            contribution: contribution,
            coutAga: abo + contribution,
            ecartCout: coutPrime - (abo + contribution),
            netPrime: netPrime,
            netAga: netAga,
            ecartNet: netAga - netPrime,
            valeurAttribuee: valeurAttribuee,
            valeurParBeneficiaire: valeurParBeneficiaire,
            dilution: dil,
            capitalConserve: 1 - dil,
            // Part d'UN bénéficiaire dans le capital dilué, l'assiette exacte du
            // plafond individuel de 10 % appliqué par checkPlafondIndividuel.
            partParBeneficiaire: valeurParBeneficiaire / (i.valorisation + valeurAttribuee),
            plafondIndividuelDepasse: false
        };
    }

    function computeTransmission(input = {}) {
        var i = input;
        var ans = i.dureeAns;
        var ratio = i.partTransmisePct / 100;

        var valeurTransmise = valeurPourDilution(i.valorisation, ratio);
        var valeurParRepreneur = valeurTransmise / i.nbRepreneurs;
        var contribution = contributionPatronale(valeurParRepreneur, i.nbRepreneurs, i.aDistribueDividendes);
        var abo = abonnement(ans);

        return {
            profil: "transmission", ans: ans,
            valorisation: i.valorisation, partTransmisePct: i.partTransmisePct,
            nbRepreneurs: i.nbRepreneurs, aDistribueDividendes: i.aDistribueDividendes,
            valeurTransmise: valeurTransmise,
            valeurParRepreneur: valeurParRepreneur,
            deboursRepreneurs: 0,
            abonnement: abo,
            contribution: contribution,
            coutAga: abo + contribution,
            dilution: ratio,
            capitalConserve: 1 - ratio,
            partParRepreneur: ratio / i.nbRepreneurs,
            plafondIndividuelDepasse: false
        };
    }

    function compute(raw = {}) {
        var i = clampInputs(raw);
        var r = i.profil === "transmission" ? computeTransmission(i) : computeFidelisation(i);
        // Le simulateur public cesse de proposer un plan que l'application
        // refuserait : checkPlafondIndividuel bloque au-delà de 10 % du capital
        // dilué pour un seul bénéficiaire.
        var part = r.profil === "transmission" ? r.partParRepreneur : r.partParBeneficiaire;
        r.plafondIndividuelDepasse = part > PARAMS.plafonds.individuelPct;
        return r;
    }

    // ── Rendu ────────────────────────────────────────────────────────────────

    function render(template = "", model = {}, keys = []) {
        var out = String(template);
        for (var k = 0; k < keys.length; k++) {
            var key = keys[k];
            out = out.split("{{" + key + "}}").join(model[key] === undefined ? "" : String(model[key]));
        }
        return out;
    }

    function buildEmailModel(raw = {}) {
        var r = compute(raw);
        var t = PARAMS.textes;
        var taux = formatPct(PARAMS.fiscal.contributionPatronaleTaux * 100);
        var keys = EMAIL_MODEL_KEYS[r.profil];

        var m = {
            valorisation: formatEur(r.valorisation),
            cout_aga: formatEur(r.coutAga),
            abonnement: formatEur(r.abonnement),
            contribution: formatEur(r.contribution),
            capital_conserve: formatPct(r.capitalConserve * 100),
            taux_contribution: taux,
            plafond_exoneration: formatEur(plafondExoneration()),
            plafond_individuel: formatPct(PARAMS.plafonds.individuelPct * 100),
            cta_url: PARAMS.cta.url,
            cta_label: PARAMS.cta.label,
            disclaimer: t.disclaimerSimulateur,
            mention_donnees: t.mentionDonnees,
            lien_desabonnement: ""
        };

        if (r.profil === "fidelisation") {
            m.horizon = r.ans + " ans";
            m.nb_beneficiaires = r.nbBeneficiaires + (r.nbBeneficiaires > 1 ? " profils clés" : " profil clé");
            m.valeur_annuelle = formatEur(r.valeurAnnuelle);
            m.cout_prime = formatEur(r.coutPrime);
            m.ecart_cout = formatEur(r.ecartCout);
            m.net_prime = formatEur(r.netPrime);
            m.net_aga = formatEur(r.netAga);
            m.ecart_net = formatEur(r.ecartNet);
            m.valeur_attribuee = formatEur(r.valeurAttribuee);
            m.valeur_par_beneficiaire = formatEur(r.valeurParBeneficiaire);
            m.part_par_beneficiaire = formatPct(r.partParBeneficiaire * 100);
            m.dilution = formatPct(r.dilution * 100);
        } else {
            m.duree = r.ans + " ans";
            m.part_transmise = formatPct(r.partTransmisePct);
            m.nb_repreneurs = r.nbRepreneurs + (r.nbRepreneurs > 1 ? " cadres" : " cadre");
            m.valeur_transmise = formatEur(r.valeurTransmise);
            m.valeur_par_repreneur = formatEur(r.valeurParRepreneur);
            m.debours_repreneurs = formatEur(r.deboursRepreneurs);
            m.part_par_repreneur = formatPct(r.partParRepreneur * 100);
        }

        // Ces textes portent eux-mêmes des jetons : on les résout avant de les
        // poser dans le modèle, sinon ils ressortiraient littéraux.
        m.mention_contribution = render(t.mentionContributionPatronale, m, keys);
        m.mention_exoneration = r.aDistribueDividendes ? "" : render(t.mentionExoneration, m, keys);
        m.alerte_plafond = r.plafondIndividuelDepasse ? render(t.mentionPlafondIndividuel, m, keys) : "";
        m.verdict = render(r.profil === "fidelisation" ? t.verdictFidelisation : t.verdictTransmission, m, keys);
        m.verdict_sous = render(r.profil === "fidelisation" ? t.verdictFidelisationSous : t.verdictTransmissionSous, m, keys);
        return m;
    }

    function renderEmail(model = {}, profil = "fidelisation") {
        return render(EMAIL_TEMPLATES[profil], model, EMAIL_MODEL_KEYS[profil]);
    }

    function renderSubject(model = {}, profil = "fidelisation") {
        var sujet = profil === "transmission"
            ? PARAMS.textes.sujetEmailTransmission
            : PARAMS.textes.sujetEmailFidelisation;
        return render(sujet, model, EMAIL_MODEL_KEYS[profil]);
    }

    // Résumé stocké dans lpv_leads.estimation_eligibilite (lisible dans le CRM).
    function buildLeadSummary(raw = {}) {
        var r = compute(raw);
        if (r.profil === "transmission") {
            return "AGA transmission : " + formatPct(r.partTransmisePct) + " du capital ("
                + formatEur(r.valeurTransmise) + ") vers " + r.nbRepreneurs + " cadre"
                + (r.nbRepreneurs > 1 ? "s" : "") + " sur " + r.ans + " ans, coût employeur "
                + formatEur(r.coutAga) + ", valorisation " + formatEur(r.valorisation);
        }
        return "AGA fidélisation : " + r.nbBeneficiaires + " profil"
            + (r.nbBeneficiaires > 1 ? "s" : "") + " clé" + (r.nbBeneficiaires > 1 ? "s" : "")
            + " à " + formatEur(r.valeurAnnuelle) + "/an sur " + r.ans + " ans, prime "
            + formatEur(r.coutPrime) + " contre AGA " + formatEur(r.coutAga)
            + ", soit " + formatEur(r.ecartCout) + " d'écart";
    }

    return {
        VERSION: PARAMS.version,
        PARAMS: PARAMS,
        PROFILS: PROFILS,
        EMAIL_MODEL_KEYS: EMAIL_MODEL_KEYS,
        formatEur: formatEur,
        formatNumber: formatNumber,
        formatPct: formatPct,
        clampInputs: clampInputs,
        compute: compute,
        plafondExoneration: plafondExoneration,
        buildEmailModel: buildEmailModel,
        buildLeadSummary: buildLeadSummary,
        renderEmail: renderEmail,
        renderSubject: renderSubject
    };
})();
