/*
  Recibe los contactos de la web (cotizador y formulario) y los agrega como filas en esta planilla.
  Instalación: en la planilla → Extensiones → Apps Script → pegar este código → Implementar →
  Nueva implementación → tipo "Aplicación web" → Ejecutar como: Yo · Quién tiene acceso: Cualquier usuario.
  La URL que termina en /exec va en config.js → contactos.appsScriptUrl.
*/
var COLUMNAS = ["fecha", "origen", "nombre", "email", "telefono", "comuna", "plazo", "piscina", "extras", "estimacion", "analisis_ia", "mensaje", "pagina"];

function doPost(e) {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (hoja.getLastRow() === 0) {
    hoja.appendRow(COLUMNAS);
    hoja.getRange(1, 1, 1, COLUMNAS.length).setFontWeight("bold");
    hoja.setFrozenRows(1);
  }
  var datos = {};
  try { datos = JSON.parse(e.postData.contents); } catch (err) { datos = e.parameter || {}; }
  hoja.appendRow(COLUMNAS.map(function (c) { return datos[c] || ""; }));
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}

// Para probar que la URL responde (abrirla en el navegador)
function doGet() {
  return ContentService.createTextOutput("Contactos de la web: funcionando ✓");
}
