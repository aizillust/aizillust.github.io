/**
 * Footer social links: desktop uses normal target=_blank.
 * On phones / touch devices: try native app URL first; if the app does not open,
 * fall back to the HTTPS profile in a new tab (blur/pagehide cancels fallback).
 */
(function () {
  var profiles = {
    x: {
      scheme: "twitter://user?screen_name=aiz_illust",
      web: "https://x.com/aiz_illust",
    },
    instagram: {
      scheme: "instagram://user?username=aiz_illust",
      web: "https://www.instagram.com/aiz_illust/",
    },
    linkedin: {
      scheme: "linkedin://in/john-camacho-96912229a",
      web: "https://www.linkedin.com/in/john-camacho-96912229a/",
    },
  };

  function useNativeHandoff() {
    return window.matchMedia("(max-width: 991.98px), (hover: none)").matches;
  }

  document.addEventListener(
    "click",
    function (e) {
      var a = e.target.closest("a.footer-social-native");
      if (!a) return;
      var key = a.getAttribute("data-social-native");
      if (!key || !profiles[key]) return;
      if (!useNativeHandoff()) return;

      e.preventDefault();

      var cfg = profiles[key];
      var fallbackDone = false;
      var t = window.setTimeout(function () {
        if (!fallbackDone) {
          fallbackDone = true;
          window.open(cfg.web, "_blank", "noopener,noreferrer");
        }
      }, 650);

      function cancelFallback() {
        fallbackDone = true;
        window.clearTimeout(t);
        window.removeEventListener("blur", onBlur);
        window.removeEventListener("pagehide", onHide);
      }

      function onBlur() {
        cancelFallback();
      }

      function onHide() {
        cancelFallback();
      }

      window.addEventListener("blur", onBlur, { once: true });
      window.addEventListener("pagehide", onHide, { once: true });

      window.location.href = cfg.scheme;
    },
    true
  );
})();
