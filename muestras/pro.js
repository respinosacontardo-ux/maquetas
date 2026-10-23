/*
  Detalles "pro" compartidos para las muestras y maquetas de Facundo Social Media.
  Uso: <script src="/muestras/pro.js" defer></script>  (después del script que define const WHATSAPP)
  - Debajo del mapa de Google Maps: botones "Cómo llegar", "Escribinos por WhatsApp" y "Llamar".
  - Datos del negocio para Google (schema.org LocalBusiness) con nombre, dirección y teléfono.
  - El mapa carga de forma diferida para que la página abra más rápido.
*/
(function () {
  function numero() {
    try { if (typeof WHATSAPP !== "undefined") return String(WHATSAPP); } catch (e) {}
    var a = document.querySelector('a[href*="wa.me/"]');
    var m = a && a.href.match(/wa\.me\/(\d+)/);
    return m ? m[1] : null;
  }

  function nombre() {
    var og = document.querySelector('meta[property="og:title"]');
    return ((og && og.content) || document.title).split("·")[0].trim();
  }

  function start() {
    // En el celular el botón flotante de WhatsApp va un poco más chico y
    // la página deja lugar abajo para que nunca tape el final del contenido
    if (!document.getElementById("pro-css")) {
      var st = document.createElement("style");
      st.id = "pro-css";
      st.textContent = "@media (max-width:700px){.wa-float,.whatsapp-float,.wa-fab{width:52px!important;height:52px!important;right:12px!important}.wa-float svg{width:26px!important;height:26px!important}footer{padding-bottom:140px!important}}";
      document.head.appendChild(st);
    }
    var map = document.querySelector('iframe[src*="output=embed"]');
    var tel = numero();
    var dir = null;
    if (map) {
      map.loading = "lazy";
      var q = new URL(map.src).searchParams.get("q");
      dir = q ? q.replace(/\+/g, " ") : null;

      if (!document.querySelector(".pro-map-actions")) {
        var bar = document.createElement("div");
        bar.className = "pro-map-actions";
        var base = "display:inline-flex;align-items:center;gap:8px;padding:11px 18px;border-radius:999px;font:700 14px/1 system-ui,sans-serif;text-decoration:none;";
        var links = [];
        var yaTiene = [].some.call(document.querySelectorAll("a"), function (a) { return /cómo llegar/i.test(a.textContent); });
        if (dir && !yaTiene) links.push(['https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(dir), "📍 Cómo llegar", base + "background:#1a73e8;color:#fff"]);
        if (tel) {
          links.push(["https://wa.me/" + tel + "?text=" + encodeURIComponent("Hola! Quiero hacer una consulta."), document.documentElement.dataset.pais === "CL" ? "💬 Escríbenos por WhatsApp" : "💬 Escribinos por WhatsApp", base + "background:#25d366;color:#0b2e17"]);
          links.push(["tel:+" + tel, "📞 Llamar", base + "background:transparent;color:inherit;border:1px solid currentColor;opacity:.85"]);
        }
        bar.style.cssText = "display:flex;flex-wrap:wrap;gap:10px;margin-top:14px";
        links.forEach(function (l) {
          var a = document.createElement("a");
          a.href = l[0]; a.textContent = l[1]; a.style.cssText = l[2];
          if (l[0].indexOf("http") === 0) { a.target = "_blank"; a.rel = "noopener"; }
          bar.appendChild(a);
        });
        // Va justo después del contenedor del mapa
        var box = map.parentElement && map.parentElement !== document.body ? map.parentElement : map;
        box.insertAdjacentElement("afterend", bar);
      }
    }

    // Datos estructurados para Google
    if (!document.querySelector('script[type="application/ld+json"]')) {
      var data = { "@context": "https://schema.org", "@type": "LocalBusiness", name: nombre(), url: location.href.split("#")[0] };
      if (tel) data.telephone = "+" + tel;
      // La página puede indicar otro país/ciudad con <html data-pais="CL" data-ciudad="Santiago">
      var raiz = document.documentElement.dataset;
      var ciudad = raiz.ciudad || "Córdoba";
      if (dir) data.address = { "@type": "PostalAddress", streetAddress: dir.split(",")[0], addressLocality: ciudad, addressRegion: raiz.pais === "CL" ? "Región Metropolitana" : ciudad, addressCountry: raiz.pais || "AR" };
      var s = document.createElement("script");
      s.type = "application/ld+json";
      s.textContent = JSON.stringify(data);
      document.head.appendChild(s);
    }
  }
  /* Seguro de animaciones: si alguien baja muy rápido o salta con un link del menú,
     ningún bloque con animación de entrada se queda invisible. */
  function noInvisibles() {
    var CLASES = ["in", "visible", "is-visible", "revealed", "show", "active"];
    // La portada nunca espera al scroll: entra apenas carga la página
    setTimeout(function () {
      document.querySelectorAll("section.hero [class*='reveal'], section.hero[class*='reveal']").forEach(function (el) {
        CLASES.forEach(function (c) { el.classList.add(c); });
      });
    }, 150);
    var pend = [].slice.call(document.querySelectorAll("[class*='reveal'], [data-reveal], [data-aos]"));
    function check() {
      var vh = innerHeight;
      pend = pend.filter(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.95) {
          if (+getComputedStyle(el).opacity < 0.5) {
            el.classList.add("in", "visible", "is-visible", "revealed", "show", "active");
            el.style.opacity = "1"; el.style.transform = "none";
          }
          return false;
        }
        return true;
      });
    }
    var t = null;
    addEventListener("scroll", function () { clearTimeout(t); t = setTimeout(check, 250); }, { passive: true });
    addEventListener("hashchange", function () { setTimeout(check, 400); });
    setTimeout(check, 2500);
  }

  /* Encabezado en celular: con nombres de negocio largos, el botón del menú no se parte en dos líneas.
     Primero se achica el nombre del logo; si igual no entra, se oculta el botón (queda el WhatsApp flotante). */
  function encabezado() {
    var header = document.querySelector("header");
    if (!header || innerWidth > 700) return;
    var btn = [].slice.call(header.querySelectorAll(".btn, [class*='btn']")).filter(function (b) { return b.offsetParent !== null && !b.closest("nav"); })[0];
    var logo = header.querySelector(".logo");
    if (!btn) return;
    btn.style.whiteSpace = "nowrap";
    var alto = function () { return btn.getBoundingClientRect().height; };
    var desborda = function () { return header.scrollWidth > innerWidth + 1 || alto() > 56; };
    var paso = 0;
    while (logo && desborda() && paso < 6) {
      var fs = parseFloat(getComputedStyle(logo).fontSize);
      logo.style.fontSize = (fs * 0.92) + "px";
      logo.querySelectorAll("*").forEach(function (c) { c.style.fontSize = (parseFloat(getComputedStyle(c).fontSize) * 0.92) + "px"; });
      paso++;
    }
    if (desborda()) btn.style.display = "none";
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", noInvisibles); else noInvisibles();
  addEventListener("load", encabezado);
})();
