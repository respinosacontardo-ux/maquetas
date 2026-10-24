/*
  Asistente virtual + reserva/cotizador interactivo, compartido por las muestras y maquetas de Facundo Social Media.
  Lo carga pro.js (no hace falta agregarlo a mano). Todo sale del contenido de la propia página:
  - Asistente de chat (botón abajo a la izquierda): responde con las preguntas frecuentes, servicios,
    precios, horarios y ubicación de la página, y termina invitando a escribir por WhatsApp.
    Funciona sin clave ni servidor; en la versión final para el cliente se puede conectar a una IA real.
  - Sección "en 30 segundos" antes de las preguntas frecuentes, distinta por rubro:
    turnos (estética, barbería, kinesiología), plan ideal (gimnasio) o cotización de obra (obras).
    Al final arma el mensaje completo y lo abre en WhatsApp.
  - Contadores animados en los números de la portada (+180, 15 años, 4,9 ★…).
*/
(function () {
  if (window.__fsmAsistente) return;
  window.__fsmAsistente = true;

  var CL = document.documentElement.dataset.pais === "CL";
  var fx = document.querySelector("script[data-theme]");
  var TEMA = (fx && fx.dataset.theme) || "obras";

  // Colores por plantilla: acento, texto sobre el acento, fondo del panel, texto, borde
  var PALETAS = {
    estetica: ["#6b3a4b", "#fff", "#fffaf7", "#2e2226", "rgba(107,58,75,.16)"],
    kinesiologia: ["#0f9488", "#fff", "#ffffff", "#0f2a43", "rgba(15,42,67,.12)"],
    gimnasio: ["#c6f432", "#0b0b0c", "#141416", "#ffffff", "#2a2a2f"],
    barberia: ["#c9a25b", "#121110", "#1a1816", "#f2ead9", "#34302a"],
    obras: ["#2dd4bf", "#06201d", "#0e1d32", "#ffffff", "#21364f"]
  };
  var P = PALETAS[TEMA] || PALETAS.obras;
  var OSCURO = /^(gimnasio|barberia|obras)$/.test(TEMA);

  // Textos en tuteo (Chile) o voseo (Argentina)
  var T = CL ? {
    hola: "¡Hola! 👋 Soy el asistente virtual. Pregúntame lo que quieras sobre nuestros servicios, precios, horarios o cómo llegar.",
    escribe: "Escribe tu pregunta…", wa: "Escríbenos por WhatsApp", noSe: "Esa te la responde mejor el equipo. ¿Te paso con WhatsApp? Respondemos en minutos.",
    reserva: "¿Quieres reservar o cotizar? Lo armas en 30 segundos acá abajo 👇", tu: "tu", quieres: "Quieres", nombre: "¿Cómo te llamas?",
    enviar: "Enviar por WhatsApp", listo: "¡Listo! Revisa tu solicitud y envíala por WhatsApp:", ver: "Ver opciones"
  } : {
    hola: "¡Hola! 👋 Soy el asistente virtual. Preguntame lo que quieras sobre nuestros servicios, precios, horarios o cómo llegar.",
    escribe: "Escribí tu pregunta…", wa: "Escribinos por WhatsApp", noSe: "Esa te la responde mejor el equipo. ¿Te paso con WhatsApp? Respondemos en minutos.",
    reserva: "¿Querés reservar o cotizar? Lo armás en 30 segundos acá abajo 👇", tu: "tu", quieres: "Querés", nombre: "¿Cómo te llamás?",
    enviar: "Enviar por WhatsApp", listo: "¡Listo! Revisá tu solicitud y enviala por WhatsApp:", ver: "Ver opciones"
  };

  function numero() {
    try { if (typeof WHATSAPP !== "undefined") return String(WHATSAPP); } catch (e) {}
    var a = document.querySelector('a.wa-float[href*="wa.me/"], #contacto a[href*="wa.me/"]');
    var m = a && a.href.match(/wa\.me\/(\d+)/);
    return m ? m[1] : "";
  }
  function negocio() {
    var og = document.querySelector('meta[property="og:title"]');
    return ((og && og.content) || document.title).split(/[·|–-]/)[0].trim();
  }
  function waLink(texto) { return "https://wa.me/" + numero() + "?text=" + encodeURIComponent(texto); }
  function txt(el) { return el ? el.textContent.replace(/\s+/g, " ").trim() : ""; }
  // Texto de un bloque separando sus partes ("Martes a sábado · 10 a 21 h · Lunes · …")
  function partes(el) {
    var out = [], w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) { var t = w.currentNode.textContent.replace(/\s+/g, " ").trim(); if (t) out.push(t); }
    return out;
  }
  // Solo el texto propio del elemento, sin el de sus hijos (ej. el nombre sin la aclaración en <small>)
  function propio(el) {
    if (!el) return "";
    var t = [].filter.call(el.childNodes, function (n) { return n.nodeType === 3; }).map(function (n) { return n.textContent; }).join(" ").replace(/\s+/g, " ").trim();
    return t || txt(el);
  }
  function norm(s) { return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ñ ]/g, " "); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- Lo que sabe el asistente: sale de la página ---------- */
  function faqs() {
    var out = [];
    document.querySelectorAll("#faq details").forEach(function (d) {
      out.push({ q: txt(d.querySelector("summary")), a: txt(d.querySelector("p")) || txt(d).replace(txt(d.querySelector("summary")), "") });
    });
    document.querySelectorAll("#faq .faq-item").forEach(function (d) {
      out.push({ q: txt(d.querySelector(".faq-q")).replace(/[+−]$/, ""), a: txt(d.querySelector(".faq-a")) });
    });
    return out.filter(function (f) { return f.q && f.a; });
  }
  function servicios() {
    var sec = document.querySelector("#servicios, #tratamientos, #clases");
    if (!sec) return [];
    return [].slice.call(sec.querySelectorAll("article, .card, .svc")).map(function (c) {
      return { n: txt(c.querySelector("h3, h4")), d: txt(c.querySelector("p")) };
    }).filter(function (s, i, arr) { return s.n && s.n.length < 60 && !/\?$/.test(s.n) && arr.findIndex(function (x) { return x.n === s.n; }) === i; }).slice(0, 8);
  }
  function precios() {
    var sec = document.querySelector("#planes, #precios");
    if (!sec) return [];
    var items = [].slice.call(sec.querySelectorAll("article, li, .row, tr")).map(function (el) {
      var t = txt(el), n = propio(el.querySelector("h3, h4")) || propio(el.querySelector(".name, strong")) || propio(el.querySelector("td")) || propio(el.querySelector("span"));
      var p = t.match(/(\$|USD|CLP)\s?[\d.,]+(\s?\/\s?\w+)?/);
      return p && n ? (n.length < 50 ? n : n.slice(0, 50)) + ": " + p[0] : null;
    }).filter(Boolean);
    return items.filter(function (x, i) { return items.indexOf(x) === i; }).slice(0, 6);
  }
  function direccion() {
    var map = document.querySelector('iframe[src*="maps"]');
    try {
      var q = map && new URL(map.src).searchParams.get("q");
      if (!q) return "";
      // Sin partes repetidas ("Calama, Calama, …")
      return q.replace(/\+/g, " ").split(/\s*,\s*/).filter(function (x, i, a) { return x && a.indexOf(x) === i; }).join(", ");
    } catch (e) { return ""; }
  }
  function horario() {
    // Contacto y horarios primero; el pie de página al final (las citas de testimonios también usan <footer>)
    var secs = ["#contacto", "#horarios", "body > footer", "footer"].map(function (q) { return document.querySelector(q); }).filter(Boolean);
    if (!secs.length) return "";
    var sec = secs[0];
    for (var k = 0; k < secs.length; k++) { if (/lunes|martes|s[aá]bado/i.test(txt(secs[k]))) { sec = secs[k]; break; } }
    // Los bloques de texto que mencionen días y horas de atención
    var cand = [].slice.call(sec.querySelectorAll("p, li, div, dl, ul, table, tr, dd, span")).filter(function (el) {
      var t = txt(el); return /lunes|martes|sábado|sabado|lun\b|lun\.|lun a/i.test(t) && /\d/.test(t) && t.length < 200;
    }).sort(function (a, b) { return txt(a).length - txt(b).length; });
    // Entre los que tienen días y horas, el que junta más días (la tabla completa y no una sola fila)
    var dias = function (el) { return (txt(el).match(/lunes|martes|miércoles|jueves|viernes|sábado|sabado|domingo/gi) || []).length; };
    var mejor = cand.sort(function (a, b) { return dias(b) - dias(a) || txt(a).length - txt(b).length; })[0];
    return mejor ? partes(mejor).filter(function (x) { return !/^horarios?$/i.test(x); }).join(" · ").replace(/\.$/, "") : "";
  }

  var SINONIMOS = {
    precio: "precio precios cuesta cuestan valor valores sale salen cobran tarifa cuanto plata costo costos presupuesto cotizacion pago",
    reserva: "reservar reserva turno turnos agendar agenda cita hora sacar disponible disponibilidad visita",
    ubicacion: "donde ubicacion direccion llegar queda estan local zona mapa comuna barrio",
    horario: "horario horarios abren cierran atienden abierto dias sabado domingo",
    pago: "pagar pago tarjeta transferencia efectivo cuotas mercadopago medios",
    demora: "demora tarda tiempo dura duracion semanas meses plazo"
  };
  function expandir(palabras) {
    var out = palabras.slice();
    palabras.forEach(function (p) {
      Object.keys(SINONIMOS).forEach(function (k) {
        var lista = SINONIMOS[k].split(" ");
        if (lista.indexOf(p) >= 0) out = out.concat(lista.slice(0, 6), [k]);
      });
    });
    return out;
  }
  var VACIAS = "el la los las un una de del y o a en que es por con para mi me te se lo le su sus al como hay tienen tiene hacen hacer puedo pueden quiero queria necesito sobre esto eso vos tu usted ustedes ser son".split(" ");
  function palabras(s) { return norm(s).split(/\s+/).filter(function (p) { return p.length > 2 && VACIAS.indexOf(p) < 0; }); }
  function parecido(a, b) {
    // Coincidencia exacta o por raíz (precio/precios, reservar/reserva)
    return a === b || (a.length > 4 && b.length > 4 && a.slice(0, 5) === b.slice(0, 5));
  }

  function responder(pregunta) {
    var p = norm(pregunta), ws = expandir(palabras(pregunta));
    if (/^(hola|buenas|buen dia|buenos dias|que tal|hey)\b/.test(p.trim()) && ws.length < 3) return { t: "¡Hola! ¿En qué te puedo ayudar? Puedes preguntarme por servicios, precios, horarios o cómo reservar.".replace("Puedes", CL ? "Puedes" : "Podés"), chips: true };
    if (/\b(gracias|genial|perfecto|buenisimo)\b/.test(p)) return { t: "¡De nada! Si " + (CL ? "quieres" : "querés") + ", " + (CL ? "escríbenos" : "escribinos") + " por WhatsApp y te atendemos personalmente 🙌", wa: true };

    var tema = function (k) { return ws.indexOf(k) >= 0; };
    // "¿Cuánto…?" puede ser precio o tiempo: si habla de plazos, no es una pregunta de precio
    var esPrecio = /(cuest|precio|valor|sale |salen|cobr|tarifa|costo|presupuest|plata|cotiz)/.test(p + " ") ||
      (/cuanto/.test(p) && !/(demor|tarda|tiempo|dura|plazo|semana|mes|dia)/.test(p));
    // Mejor pregunta frecuente por palabras en común
    var mejor = null, puntos = 0;
    faqs().forEach(function (f) {
      var fq = expandir(palabras(f.q)), fa = palabras(f.a);
      var s = 0;
      ws.forEach(function (w) {
        if (fq.some(function (x) { return parecido(w, x); })) s += 2;
        else if (fa.some(function (x) { return parecido(w, x); })) s += 0.5;
      });
      if (s > puntos) { puntos = s; mejor = f; }
    });
    // Un servicio nombrado en la pregunta
    var serv = servicios().filter(function (s) {
      var ns = palabras(s.n);
      return ns.length && ns.some(function (n) { return ws.some(function (w) { return parecido(w, n); }); });
    })[0];

    if (tema("horario") && horario()) return { t: "🕒 " + horario() + ".", wa: true };
    if (esPrecio) {
      // Si hay una pregunta frecuente sobre precios o pagos, esa va primero
      var pr = precios();
      // Precio de un servicio puntual, si la página lo tiene
      if (serv) {
        var clave = palabras(serv.n);
        var uno = pr.filter(function (x) { var px = palabras(x.split(":")[0]); return clave.some(function (c) { return px.some(function (y) { return parecido(c, y); }); }); });
        if (uno.length) return { t: "💰 " + uno.join("\n💰 ") + "\n\n" + (CL ? "¿Quieres reservar?" : "¿Querés reservar?") + " " + T.reserva.split("? ")[1], cot: true, wa: true };
      }
      var fp = faqs().filter(function (f) { return /cuest|precio|valor|cobr|presupuest|tarifa|honorario/.test(norm(f.q)); })[0];
      if (fp) return { t: fp.a, wa: true, cot: true };
      if (pr.length) return { t: "Estos son algunos valores de referencia:\n• " + pr.join("\n• ") + "\n\n" + (CL ? "Para un valor exacto escríbenos y te cotizamos." : "Para un valor exacto escribinos y te pasamos el presupuesto."), wa: true, cot: true };
      return { t: "Los valores dependen de lo que " + (CL ? "necesites" : "necesités") + ". " + T.reserva, cot: true, wa: true };
    }
    if (puntos >= 4) return { t: mejor.a, wa: true };
    if (serv) return { t: "✨ " + serv.n + (serv.d ? ": " + serv.d : "") + "\n\n" + T.reserva, cot: true, wa: true };
    if (tema("reserva")) return { t: T.reserva, cot: true, wa: true };
    if (tema("ubicacion") && direccion()) return { t: "📍 Estamos en " + direccion() + ".", mapa: true, wa: true };
    if (puntos >= 2) return { t: mejor.a, wa: true };
    if (/servicio|hacen|ofrecen|tratamiento|clase/.test(p) && servicios().length) return { t: (CL ? "Esto es lo que hacemos" : "Esto es lo que hacemos") + ":\n• " + servicios().map(function (s) { return s.n; }).join("\n• ") + "\n\n¿Sobre cuál " + (CL ? "quieres" : "querés") + " saber más?", chips: true };
    // Una sección de la página que hable del tema (ej. "obras sociales", "horarios", "equipo")
    var secc = [].slice.call(document.querySelectorAll("section[id]")).filter(function (sc) {
      var ids = palabras(sc.id.replace(/-/g, " ") + " " + txt(sc.querySelector("h2")));
      return ws.some(function (w) { return ids.some(function (x) { return parecido(w, x); }); });
    })[0];
    if (secc) {
      var lead = txt(secc.querySelector("p"));
      var items = [].slice.call(secc.querySelectorAll("li, .chip, .tag")).map(txt).filter(function (x) { return x && x.length < 40; }).slice(0, 10);
      if (lead || items.length) return { t: (lead ? lead : "") + (items.length ? (lead ? "\n\n" : "") + "• " + items.join("\n• ") : ""), wa: true };
    }
    return { t: T.noSe, wa: true };
  }

  /* ---------- Estilos ---------- */
  function css() {
    var s = document.createElement("style");
    s.id = "fsm-asis-css";
    var surf = P[2], ink = P[3], line = P[4], acc = P[0], on = P[1];
    var soft = OSCURO ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.04)";
    s.textContent = [
      ".fa-btn{position:fixed;left:16px;bottom:18px;z-index:70;display:flex;align-items:center;gap:9px;padding:10px 16px 10px 10px;border:0;border-radius:999px;background:" + acc + ";color:" + on + ";font:700 14px/1 system-ui,-apple-system,Segoe UI,sans-serif;cursor:pointer;box-shadow:0 14px 34px -10px rgba(0,0,0,.55);transition:transform .25s,opacity .25s}",
      ".fa-btn:hover{transform:translateY(-2px)}",
      ".fa-btn .fa-av{width:30px;height:30px;border-radius:50%;background:" + on + ";color:" + acc + ";display:grid;place-items:center;font-size:16px;position:relative}",
      ".fa-btn .fa-av::after{content:'';position:absolute;right:-1px;bottom:-1px;width:9px;height:9px;border-radius:50%;background:#22c55e;border:2px solid " + acc + "}",
      ".fa-tip{position:fixed;left:16px;bottom:72px;z-index:70;max-width:240px;background:" + surf + ";color:" + ink + ";border:1px solid " + line + ";padding:11px 14px;border-radius:14px 14px 14px 4px;font:500 13.5px/1.4 system-ui,sans-serif;box-shadow:0 18px 40px -16px rgba(0,0,0,.5);opacity:0;transform:translateY(8px);transition:.35s;pointer-events:none}",
      ".fa-tip.on{opacity:1;transform:none;pointer-events:auto;cursor:pointer}",
      ".fa-panel{position:fixed;left:16px;bottom:18px;z-index:80;width:370px;max-width:calc(100vw - 32px);height:560px;max-height:calc(100vh - 36px);display:flex;flex-direction:column;background:" + surf + ";color:" + ink + ";border:1px solid " + line + ";border-radius:22px;overflow:hidden;box-shadow:0 30px 80px -20px rgba(0,0,0,.6);font:400 14.5px/1.45 system-ui,-apple-system,Segoe UI,sans-serif;opacity:0;transform:translateY(16px) scale(.97);transform-origin:bottom left;pointer-events:none;transition:opacity .28s,transform .28s}",
      ".fa-panel.on{opacity:1;transform:none;pointer-events:auto}",
      ".fa-head{display:flex;align-items:center;gap:11px;padding:15px 16px;background:" + acc + ";color:" + on + "}",
      ".fa-head b{display:block;font-size:15px;line-height:1.2}.fa-head small{opacity:.8;font-size:12px}",
      ".fa-head .fa-av{width:38px;height:38px;border-radius:50%;background:" + on + ";color:" + acc + ";display:grid;place-items:center;font-size:19px;flex:none}",
      ".fa-x{margin-left:auto;background:none;border:0;color:inherit;font-size:24px;line-height:1;cursor:pointer;opacity:.8;padding:4px 6px}",
      ".fa-msgs{flex:1;overflow-y:auto;padding:16px 14px;display:flex;flex-direction:column;gap:10px;overscroll-behavior:contain}",
      ".fa-m{max-width:86%;padding:10px 13px;border-radius:16px;white-space:pre-line;animation:faIn .3s ease both}",
      ".fa-m.bot{background:" + soft + ";border:1px solid " + line + ";border-bottom-left-radius:5px;align-self:flex-start}",
      ".fa-m.yo{background:" + acc + ";color:" + on + ";border-bottom-right-radius:5px;align-self:flex-end}",
      ".fa-acts{display:flex;flex-wrap:wrap;gap:7px;align-self:flex-start;max-width:100%;animation:faIn .3s ease both}",
      ".fa-chip{border:1px solid " + line + ";background:transparent;color:inherit;border-radius:999px;padding:7px 12px;font:600 13px/1.2 system-ui,sans-serif;cursor:pointer;text-decoration:none;transition:background .2s,border-color .2s}",
      ".fa-chip:hover{border-color:" + acc + "}",
      ".fa-chip.wa{background:#25d366;border-color:#25d366;color:#0b2e17}",
      ".fa-chip.pri{background:" + acc + ";border-color:" + acc + ";color:" + on + "}",
      ".fa-dots{display:flex;gap:4px;padding:13px 14px}.fa-dots i{width:7px;height:7px;border-radius:50%;background:currentColor;opacity:.4;animation:faDot 1s infinite}.fa-dots i:nth-child(2){animation-delay:.15s}.fa-dots i:nth-child(3){animation-delay:.3s}",
      ".fa-form{display:flex;gap:8px;padding:12px;border-top:1px solid " + line + "}",
      ".fa-form input{flex:1;min-width:0;border:1px solid " + line + ";background:" + soft + ";color:inherit;border-radius:999px;padding:11px 15px;font:inherit;font-size:16px;outline:none}",
      ".fa-form input:focus{border-color:" + acc + "}",
      ".fa-form button{border:0;width:44px;height:44px;border-radius:50%;background:" + acc + ";color:" + on + ";font-size:18px;cursor:pointer;flex:none}",
      ".fa-pie{text-align:center;font-size:11px;opacity:.55;padding:0 12px 9px}",
      "@keyframes faIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}",
      "@keyframes faDot{50%{opacity:1;transform:translateY(-2px)}}",
      "@media (max-width:700px){.fa-btn{left:12px;bottom:14px;padding:9px 14px 9px 9px;font-size:13px}.fa-tip{left:12px;bottom:66px}.fa-panel{left:8px;right:8px;bottom:8px;width:auto;max-width:none;height:78vh;border-radius:20px}}",
      /* Sección reserva / cotizador */
      ".fq{padding:clamp(64px,9vw,110px) 0}",
      ".fq-wrap{max-width:1100px;margin:0 auto;padding:0 20px;display:grid;grid-template-columns:1fr 1.15fr;gap:clamp(28px,5vw,64px);align-items:center}",
      ".fq-eye{display:inline-block;font:700 12px/1 system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:" + acc + ";margin-bottom:14px}",
      ".fq h2{margin:0 0 14px}",
      ".fq-lead{opacity:.78;margin:0 0 22px;max-width:44ch}",
      ".fq-ok{list-style:none;padding:0;margin:0;display:grid;gap:10px}.fq-ok li{display:flex;gap:10px;align-items:center;opacity:.9}.fq-ok li::before{content:'✓';width:24px;height:24px;border-radius:50%;background:" + acc + ";color:" + on + ";display:grid;place-items:center;font-weight:800;font-size:13px;flex:none}",
      ".fq-card{position:relative;background:" + surf + ";color:" + ink + ";border:1px solid " + line + ";border-radius:26px;padding:clamp(22px,3.5vw,34px);box-shadow:0 40px 90px -40px rgba(0,0,0,.55);overflow:hidden;overflow:clip}",
      ".fq-card::before{content:'';position:absolute;top:-160px;right:-120px;width:320px;height:320px;border-radius:50%;background:" + acc + ";opacity:.13;filter:blur(60px);pointer-events:none}",
      ".fq-body{min-height:300px}",
      ".fq-bar{height:5px;border-radius:9px;background:" + soft + ";margin-bottom:22px;overflow:hidden}.fq-bar i{display:block;height:100%;width:0;background:" + acc + ";border-radius:9px;transition:width .45s cubic-bezier(.2,.8,.2,1)}",
      ".fq-step{display:none;animation:faIn .4s ease both}.fq-step.on{display:block}",
      ".fq-n{font:700 12.5px/1 system-ui,sans-serif;opacity:.6;margin-bottom:8px;letter-spacing:.04em}",
      ".fq-q{font-size:clamp(19px,2.3vw,23px);font-weight:700;margin:0 0 16px;line-height:1.25}",
      ".fq-opts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}",
      ".fq-o{border:1.5px solid " + line + ";background:" + soft + ";color:inherit;border-radius:14px;padding:13px 14px;font:600 14.5px/1.3 system-ui,sans-serif;text-align:left;cursor:pointer;transition:border-color .2s,transform .2s,background .2s}",
      ".fq-o:hover{border-color:" + acc + ";transform:translateY(-1px)}.fq-o.sel{border-color:" + acc + ";background:" + acc + ";color:" + on + "}",
      ".fq-range{width:100%;accent-color:" + acc + "}.fq-val{font-size:34px;font-weight:800;color:" + acc + ";margin:4px 0 6px}",
      ".fq-in{width:100%;box-sizing:border-box;border:1.5px solid " + line + ";background:" + soft + ";color:inherit;border-radius:14px;padding:14px 16px;font:inherit;font-size:16px;outline:none;margin-bottom:12px}.fq-in:focus{border-color:" + acc + "}",
      ".fq-nav{display:flex;justify-content:space-between;align-items:center;margin-top:20px;gap:10px}",
      ".fq-back{background:none;border:0;color:inherit;opacity:.65;font:600 14px system-ui,sans-serif;cursor:pointer;padding:8px 2px}",
      ".fq-go{border:0;border-radius:999px;padding:13px 22px;background:" + acc + ";color:" + on + ";font:800 15px/1 system-ui,sans-serif;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:8px}",
      ".fq-go[disabled]{opacity:.4;cursor:default}.fq-go.wa{background:#25d366;color:#0b2e17}",
      ".fq-res{border:1px dashed " + line + ";border-radius:16px;padding:14px 16px;margin:6px 0 4px;display:grid;gap:6px;font-size:14.5px}.fq-res b{color:" + acc + "}",
      ".fq-rec{font-size:22px;font-weight:800;margin:2px 0 4px}",
      ".fq-nota{font-size:12px;opacity:.6;margin-top:12px}",
      "@media (max-width:820px){.fq-wrap{grid-template-columns:1fr}.fq-opts{grid-template-columns:1fr 1fr}}",
      "@media (max-width:380px){.fq-opts{grid-template-columns:1fr}}"
    ].join("\n");
    document.head.appendChild(s);
  }

  /* ---------- Chat ---------- */
  var panel, msgs, abierto = false;
  function chat() {
    var btn = document.createElement("button");
    btn.className = "fa-btn"; btn.type = "button";
    btn.setAttribute("aria-label", "Abrir asistente virtual");
    btn.innerHTML = '<span class="fa-av" aria-hidden="true">✨</span><span>' + (CL ? "¿Te ayudo?" : "¿Te ayudo?") + "</span>";
    var tip = document.createElement("div");
    tip.className = "fa-tip";
    tip.textContent = (CL ? "¿Tienes una duda? " : "¿Tenés una duda? ") + "Te respondo al instante 💬";

    panel = document.createElement("div");
    panel.className = "fa-panel"; panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "Asistente virtual");
    panel.innerHTML = '<div class="fa-head"><span class="fa-av" aria-hidden="true">✨</span><div><b>' + esc(negocio()) + '</b><small>Asistente virtual · responde al instante</small></div><button class="fa-x" type="button" aria-label="Cerrar">×</button></div>' +
      '<div class="fa-msgs" aria-live="polite"></div>' +
      '<form class="fa-form"><input type="text" placeholder="' + T.escribe + '" aria-label="' + T.escribe + '" autocomplete="off"><button type="submit" aria-label="Enviar">➤</button></form>' +
      '<div class="fa-pie">Asistente automático · ' + (CL ? "para atención personal, escríbenos por WhatsApp" : "para atención personal, escribinos por WhatsApp") + "</div>";
    msgs = panel.querySelector(".fa-msgs");
    document.body.appendChild(tip); document.body.appendChild(btn); document.body.appendChild(panel);

    function abrir() {
      abierto = true; tip.classList.remove("on");
      panel.classList.add("on"); btn.style.opacity = "0"; btn.style.pointerEvents = "none";
      if (!msgs.childElementCount) { bot({ t: T.hola, chips: true }, 300); }
      if (innerWidth > 700) setTimeout(function () { panel.querySelector("input").focus({ preventScroll: true }); }, 300);
    }
    function cerrar() { abierto = false; panel.classList.remove("on"); btn.style.opacity = ""; btn.style.pointerEvents = ""; }
    btn.onclick = abrir; tip.onclick = abrir;
    panel.querySelector(".fa-x").onclick = cerrar;
    addEventListener("keydown", function (e) { if (e.key === "Escape" && abierto) cerrar(); });
    panel.querySelector("form").onsubmit = function (e) {
      e.preventDefault();
      var inp = this.querySelector("input"), v = inp.value.trim();
      if (!v) return;
      inp.value = ""; yo(v); bot(responder(v));
    };
    // Invitación suave una sola vez, cuando la persona ya recorrió un poco la página
    var visto = false;
    addEventListener("scroll", function () {
      if (visto || abierto || scrollY < innerHeight * 1.2) return;
      visto = true; tip.classList.add("on");
      setTimeout(function () { tip.classList.remove("on"); }, 7000);
    }, { passive: true });
    window.__fsmAbrirChat = abrir;
    window.__fsmResponder = responder;
  }
  function yo(t) {
    var m = document.createElement("div"); m.className = "fa-m yo"; m.textContent = t;
    msgs.appendChild(m); msgs.scrollTop = msgs.scrollHeight;
  }
  function bot(r, espera) {
    var d = document.createElement("div"); d.className = "fa-m bot fa-dots"; d.innerHTML = "<i></i><i></i><i></i>";
    msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
    setTimeout(function () {
      d.remove();
      var m = document.createElement("div"); m.className = "fa-m bot"; m.textContent = r.t;
      msgs.appendChild(m);
      var acts = document.createElement("div"); acts.className = "fa-acts";
      if (r.chips) {
        var sug = faqs().slice(0, 3).map(function (f) { return f.q; });
        if (precios().length) sug.unshift(CL ? "¿Cuáles son los precios?" : "¿Qué precios tienen?");
        if (direccion()) sug.push("¿Dónde están?");
        sug.slice(0, 5).forEach(function (q) {
          var c = document.createElement("button"); c.type = "button"; c.className = "fa-chip"; c.textContent = q;
          c.onclick = function () { acts.remove(); yo(q); bot(responder(q)); };
          acts.appendChild(c);
        });
      }
      if (r.cot && document.getElementById("reservar")) {
        var b = document.createElement("button"); b.type = "button"; b.className = "fa-chip pri"; b.textContent = TITULOS().boton;
        b.onclick = function () { document.getElementById("reservar").scrollIntoView({ behavior: "smooth" }); if (innerWidth <= 700) panel.querySelector(".fa-x").click(); };
        acts.appendChild(b);
      }
      if (r.mapa && direccion()) {
        var mp = document.createElement("a"); mp.className = "fa-chip"; mp.target = "_blank"; mp.rel = "noopener";
        mp.href = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(direccion()); mp.textContent = "📍 Cómo llegar";
        acts.appendChild(mp);
      }
      if (r.wa && numero()) {
        var w = document.createElement("a"); w.className = "fa-chip wa"; w.target = "_blank"; w.rel = "noopener";
        var ultima = [].slice.call(msgs.querySelectorAll(".fa-m.yo")).pop();
        w.href = waLink("¡Hola " + negocio() + "! " + (ultima ? "Les consulto: " + ultima.textContent : "Quiero hacer una consulta."));
        w.textContent = "💬 " + T.wa;
        acts.appendChild(w);
      }
      if (acts.childElementCount) msgs.appendChild(acts);
      msgs.scrollTop = msgs.scrollHeight;
    }, espera || 650 + Math.min(900, r.t.length * 6));
  }

  /* ---------- Reserva / cotizador por rubro ---------- */
  function TITULOS() {
    if (TEMA === "obras") return { eye: CL ? "Cotiza en 30 segundos" : "Cotizá en 30 segundos", h2: CL ? "Cuéntanos tu proyecto" : "Contanos tu proyecto", boton: CL ? "Cotizar mi proyecto" : "Cotizar mi proyecto",
      lead: CL ? "En 5 pasos rápidos te enviamos una cotización orientativa y una fecha para la visita técnica sin costo." : "En 5 pasos rápidos te mandamos una cotización orientativa y una fecha para la visita técnica sin cargo.",
      ok: ["Visita técnica sin costo", "Presupuesto cerrado y por escrito", "Respuesta en menos de 24 h"] };
    if (TEMA === "gimnasio") return { eye: CL ? "Test de 30 segundos" : "Test de 30 segundos", h2: CL ? "Encuentra tu plan ideal" : "Encontrá tu plan ideal", boton: CL ? "Encontrar mi plan" : "Encontrar mi plan",
      lead: CL ? "Dinos tu objetivo y cuántos días puedes entrenar: te recomendamos el plan justo y te reservamos una clase de prueba." : "Decinos tu objetivo y cuántos días podés entrenar: te recomendamos el plan justo y te reservamos una clase de prueba.",
      ok: ["Clase de prueba gratis", "Plan a tu medida", "Sin matrícula este mes"] };
    return { eye: CL ? "Reserva en 30 segundos" : "Reservá en 30 segundos", h2: CL ? "Agenda tu hora sin esperas" : "Sacá tu turno sin esperas", boton: CL ? "Reservar mi hora" : "Reservar mi turno",
      lead: CL ? "Elige el servicio, el día y el horario que te acomodan. Te confirmamos por WhatsApp en minutos." : "Elegí el servicio, el día y el horario que te quedan cómodos. Te confirmamos por WhatsApp en minutos.",
      ok: ["Confirmación inmediata", "Recordatorio el día anterior", "Reprogramas sin costo".replace("Reprogramas", CL ? "Reprogramas" : "Reprogramás")] };
  }

  function pasos() {
    var serv = servicios().map(function (s) { return s.n; }).slice(0, 6);
    if (!serv.length) serv = ["Consulta general"];
    if (TEMA === "obras") return [
      { k: "Servicio", q: CL ? "¿Qué necesitas?" : "¿Qué necesitás?", o: serv },
      { k: "Tamaño aprox.", q: CL ? "¿De qué tamaño es el proyecto?" : "¿De qué tamaño es el proyecto?", rango: [10, 400, 60, "m²"] },
      { k: "Plazo", q: CL ? "¿Para cuándo lo necesitas?" : "¿Para cuándo lo necesitás?", o: ["Lo antes posible", "En 1 a 3 meses", "En más de 3 meses", "Solo estoy cotizando"] },
      { k: "Ubicación", q: CL ? "¿En qué comuna es la obra?" : "¿En qué barrio o ciudad es la obra?", texto: document.documentElement.dataset.ciudad || "" },
      { k: "Nombre", q: T.nombre, texto: "", nombre: true }
    ];
    if (TEMA === "gimnasio") return [
      { k: "Objetivo", q: CL ? "¿Cuál es tu objetivo?" : "¿Cuál es tu objetivo?", o: ["Bajar de peso", "Ganar músculo", "Mejorar resistencia", "Salud y bienestar"] },
      { k: "Días por semana", q: CL ? "¿Cuántos días puedes entrenar?" : "¿Cuántos días podés entrenar?", o: ["2 días", "3 días", "4 o 5 días", "Todos los días"] },
      { k: "Horario", q: "¿En qué horario?", o: ["Mañana", "Mediodía", "Tarde", "Noche"] },
      { k: "Nombre", q: T.nombre, texto: "", nombre: true }
    ];
    return [
      { k: "Servicio", q: CL ? "¿Qué servicio quieres?" : "¿Qué servicio querés?", o: serv },
      { k: "Día", q: CL ? "¿Qué día te acomoda?" : "¿Qué día te queda bien?", o: ["Hoy", "Mañana", "Esta semana", "La próxima semana"] },
      { k: "Horario", q: "¿En qué horario?", o: ["Mañana", "Mediodía", "Tarde", "Última hora"] },
      { k: "Nombre", q: T.nombre, texto: "", nombre: true }
    ];
  }

  function planRecomendado(r) {
    var sec = document.querySelector("#planes");
    var planes = sec ? [].slice.call(sec.querySelectorAll("article")).map(function (a) { return txt(a.querySelector("h3")); }).filter(Boolean) : [];
    if (!planes.length) return "";
    var d = r["Días por semana"] || "";
    var i = /^2/.test(d) ? 0 : /^3/.test(d) ? Math.min(1, planes.length - 1) : planes.length - 1;
    return planes[i];
  }

  function cotizador() {
    var ancla = document.querySelector("#faq") || document.querySelector("#contacto");
    if (!ancla || document.getElementById("reservar") || !numero()) return;
    var t = TITULOS(), ps = pasos(), r = {}, i = 0;
    var sec = document.createElement("section");
    sec.id = "reservar"; sec.className = "fq";
    // Fondo alternado según la sección anterior, para que no se pegue a la de arriba
    var prev = ancla.previousElementSibling;
    if (prev && !prev.classList.contains("alt") && ancla.classList.contains("alt") === false) sec.classList.add("alt");
    sec.innerHTML = '<div class="fq-wrap"><div class="fq-txt reveal-fq"><span class="fq-eye">' + t.eye + "</span><h2>" + t.h2 + '</h2><p class="fq-lead">' + t.lead + '</p><ul class="fq-ok">' +
      t.ok.map(function (x) { return "<li>" + x + "</li>"; }).join("") + '</ul></div><div class="fq-card"><div class="fq-bar"><i></i></div><div class="fq-body"></div></div></div>';
    ancla.parentNode.insertBefore(sec, ancla);
    var body = sec.querySelector(".fq-body"), bar = sec.querySelector(".fq-bar i");

    ps.forEach(function (p, n) {
      var st = document.createElement("div"); st.className = "fq-step";
      var h = '<div class="fq-n">PASO ' + (n + 1) + " DE " + ps.length + '</div><p class="fq-q">' + p.q + "</p>";
      if (p.o) h += '<div class="fq-opts">' + p.o.map(function (o) { return '<button type="button" class="fq-o">' + esc(o) + "</button>"; }).join("") + "</div>";
      if (p.rango) h += '<div class="fq-val"><span>' + p.rango[2] + "</span> " + p.rango[3] + '</div><input class="fq-range" type="range" min="' + p.rango[0] + '" max="' + p.rango[1] + '" step="5" value="' + p.rango[2] + '" aria-label="' + p.k + '">';
      if (p.texto !== undefined) h += '<input class="fq-in" type="text" value="' + esc(p.texto) + '" placeholder="' + (p.nombre ? (CL ? "Tu nombre" : "Tu nombre") : "") + '" aria-label="' + p.k + '" autocomplete="' + (p.nombre ? "given-name" : "off") + '">';
      h += '<div class="fq-nav"><button type="button" class="fq-back"' + (n ? "" : ' style="visibility:hidden"') + '>← Volver</button><button type="button" class="fq-go"' + (p.o ? " disabled" : "") + ">" + (n === ps.length - 1 ? T.ver.replace("Ver opciones", "Ver mi solicitud") : "Siguiente →") + "</button></div>";
      st.innerHTML = h; body.appendChild(st);
      var go = st.querySelector(".fq-go");
      st.querySelectorAll(".fq-o").forEach(function (b) {
        b.onclick = function () {
          st.querySelectorAll(".fq-o").forEach(function (x) { x.classList.remove("sel"); });
          b.classList.add("sel"); r[p.k] = b.textContent; go.disabled = false;
          setTimeout(function () { mover(1); }, 260);
        };
      });
      var rg = st.querySelector(".fq-range");
      if (rg) { r[p.k] = rg.value + " " + p.rango[3]; rg.oninput = function () { st.querySelector(".fq-val span").textContent = rg.value; r[p.k] = rg.value + " " + p.rango[3]; }; }
      var tx = st.querySelector(".fq-in");
      if (tx) {
        var val = function () { r[p.k] = tx.value.trim(); go.disabled = p.nombre && !r[p.k]; };
        tx.oninput = val; val();
        tx.onkeydown = function (e) { if (e.key === "Enter" && !go.disabled) { e.preventDefault(); go.click(); } };
      }
      go.onclick = function () { mover(1); };
      st.querySelector(".fq-back").onclick = function () { mover(-1); };
    });
    var fin = document.createElement("div"); fin.className = "fq-step"; body.appendChild(fin);

    function resultado() {
      var nom = r["Nombre"] || "";
      var lineas = ps.map(function (p) { return p.k; }).filter(function (k) { return k !== "Nombre" && r[k]; });
      var rec = TEMA === "gimnasio" ? planRecomendado(r) : "";
      var msg = "¡Hola " + negocio() + "! Soy " + nom + ". " +
        (TEMA === "obras" ? "Quiero cotizar un proyecto:" : TEMA === "gimnasio" ? "Quiero empezar a entrenar" + (rec ? " (me interesa el " + rec + ")" : "") + ":" : (CL ? "Quiero reservar una hora:" : "Quiero sacar un turno:")) +
        "\n" + lineas.map(function (k) { return "• " + k + ": " + r[k]; }).join("\n");
      if (TEMA === "gimnasio") msg += "\n" + (CL ? "¿Puedo agendar una clase de prueba?" : "¿Puedo reservar una clase de prueba?");
      fin.innerHTML = '<div class="fq-n">' + (CL ? "TU SOLICITUD" : "TU SOLICITUD") + '</div>' +
        (rec ? '<p class="fq-q" style="margin-bottom:4px">' + esc(nom) + ", " + (CL ? "te recomendamos:" : "te recomendamos:") + '</p><div class="fq-rec">' + esc(rec) + "</div>" : '<p class="fq-q">' + T.listo.replace("¡Listo!", "¡Listo, " + esc(nom) + "!") + "</p>") +
        '<div class="fq-res">' + lineas.map(function (k) { return "<div><b>" + esc(k) + ":</b> " + esc(r[k]) + "</div>"; }).join("") + "</div>" +
        '<div class="fq-nav"><button type="button" class="fq-back">← Cambiar</button><a class="fq-go wa" target="_blank" rel="noopener" href="' + waLink(msg) + '">💬 ' + T.enviar + "</a></div>" +
        '<p class="fq-nota">' + (TEMA === "obras" ? (CL ? "Valores y plazos se confirman en la visita técnica. Es una estimación orientativa." : "Valores y plazos se confirman en la visita técnica. Es una estimación orientativa.") : (CL ? "Te confirmamos disponibilidad por WhatsApp." : "Te confirmamos disponibilidad por WhatsApp.")) + "</p>";
      fin.querySelector(".fq-back").onclick = function () { mover(-1); };
    }
    function mover(d) {
      var steps = body.querySelectorAll(".fq-step");
      i = Math.max(0, Math.min(steps.length - 1, i + d));
      if (i === steps.length - 1) resultado();
      steps.forEach(function (s, n) { s.classList.toggle("on", n === i); });
      bar.style.width = Math.round((i / (steps.length - 1)) * 100) + "%";
      var inp = steps[i].querySelector(".fq-in");
      if (inp && d && innerWidth > 700) inp.focus({ preventScroll: true });
    }
    mover(0);
  }

  /* ---------- Contadores de la portada ---------- */
  function contadores() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var els = [].slice.call(document.querySelectorAll("section.hero strong, .hero strong, .stats strong")).filter(function (el, i, a) {
      return a.indexOf(el) === i && /^\s*\+?\d[\d.,]*/.test(el.textContent) && !el.children.length;
    });
    els.forEach(function (el) {
      var orig = el.textContent, m = orig.match(/^(\s*\+?)(\d[\d.]*)(,\d+)?(.*)$/);
      if (!m) return;
      var fin = parseInt(m[2].replace(/\./g, ""), 10);
      if (!fin || fin < 3) return;
      var miles = m[2].indexOf(".") > 0, t0 = null;
      var fmt = function (n) { var s = String(n); return miles ? s.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : s; };
      var io = new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting) return;
        io.disconnect();
        var paso = function (t) {
          if (!t0) t0 = t;
          var k = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - k, 3);
          el.textContent = m[1] + fmt(Math.round(fin * e)) + (m[3] || "") + m[4];
          if (k < 1) requestAnimationFrame(paso); else el.textContent = orig;
        };
        requestAnimationFrame(paso);
        setTimeout(function () { el.textContent = orig; }, 2500);
      });
      io.observe(el);
    });
  }

  function start() {
    css();
    try { cotizador(); } catch (e) { console.warn("cotizador", e); }
    try { chat(); } catch (e) { console.warn("asistente", e); }
    try { contadores(); } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
