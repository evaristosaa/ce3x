const SHEET_NAME = 'referencias';
const APP_SECRET = 'CAMBIAR_ESTE_SECRETO';
const LEGACY_RAW_JSON_HEADERS = [
  'rawJson',
  'rawJson2',
  'rawJson3',
  'rawJson4',
  'rawJson5',
  'rawJson6',
  'rawJson7',
  'rawJson8',
  'rawJson9',
  'rawJson10',
  'rawJson11',
  'rawJson12',
  'rawJson13',
  'rawJson14',
  'rawJson15',
  'rawJson16',
  'rawJson17',
  'rawJson18',
  'rawJson19',
  'rawJson20',
];
const SCALAR_DATA_PATHS = [
  'admin.localizacion.nombreEdificio',
  'admin.localizacion.direccion',
  'admin.localizacion.provincia',
  'admin.localizacion.localidad',
  'admin.localizacion.codigoPostal',
  'admin.localizacion.referenciaCatastral',
  'admin.cliente.nombreRazonSocial',
  'admin.cliente.direccion',
  'admin.cliente.provincia',
  'admin.cliente.localidad',
  'admin.cliente.codigoPostal',
  'admin.cliente.telefono',
  'admin.cliente.email',
  'admin.tecnico.nombre',
  'admin.tecnico.nif',
  'admin.tecnico.razonSocial',
  'admin.tecnico.cif',
  'admin.tecnico.direccion',
  'admin.tecnico.provincia',
  'admin.tecnico.localidad',
  'admin.tecnico.codigoPostal',
  'admin.tecnico.telefono',
  'admin.tecnico.email',
  'admin.tecnico.titulacion',
  'generales.datos.normativaVigente',
  'generales.datos.anioConstruccion',
  'generales.datos.tipoEdificio',
  'generales.datos.provincia',
  'generales.datos.localidad',
  'generales.datos.zonaClimaticaHE1',
  'generales.datos.zonaClimaticaHE4',
  'generales.definicion.superficieUtilHabitable',
  'generales.definicion.alturaLibrePlanta',
  'generales.definicion.numeroPlantasHabitables',
  'generales.definicion.ventilacionInmueble',
  'generales.definicion.demandaDiariaACS',
  'generales.definicion.masaParticionesInternas',
  'generales.definicion.ensayoEstanqueidad',
  'generales.definicion.imagenEdificio',
  'generales.definicion.planoSituacion',
];
const JSON_DATA_PATHS = [
  'envolvente.cerramientos.items',
  'envolvente.huecos.items',
  'envolvente.puentesTermicos.items',
  'instalaciones.acs.items',
  'instalaciones.calefaccion.items',
  'instalaciones.refrigeracion.items',
  'instalaciones.contribuciones.items',
];

const BASE_HEADERS = [
  'id',
  'referenciaCatastral',
  'estado',
  'gestor',
  'direccion',
  'municipio',
  'provincia',
  'codigoPostal',
  'uso',
  'superficieUtil',
  'superficieCatastral',
  'anioConstruccion',
  'plantas',
  'orientacionPrincipal',
  'tipoEdificio',
  'envolvente',
  'instalaciones',
  'observaciones',
  'cexGenerado',
  'fechaCexGenerado',
  'createdAt',
  'updatedAt',
];

const HEADERS = BASE_HEADERS.concat(SCALAR_DATA_PATHS, JSON_DATA_PATHS);

function setup() {
  getSheet_();
}

function compactSchema() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  return compactSheetSchema_(sheet, { backup: true });
}

function authorizeExternalRequest() {
  UrlFetchApp.fetch('https://www.google.com', { muteHttpExceptions: true });
}

function doGet(e) {
  return handle_(e);
}

function doPost(e) {
  return handle_(e);
}

function handle_(e) {
  let request = {};
  try {
    request = parseRequest_(e);
    assertAuthorized_(request);

    const action = request.action || 'list';
    if (action === 'list') return response_(request, { ok: true, items: listRecords_() });
    if (action === 'get') return response_(request, { ok: true, item: getRecord_(request.id) });
    if (action === 'save') return response_(request, { ok: true, item: saveRecord_(request.item || {}) });
    if (action === 'patch') return response_(request, { ok: true, item: patchRecord_(request) });
    if (action === 'delete') return response_(request, { ok: true, deleted: deleteRecord_(request.id, request.referenciaCatastral) });
    if (action === 'compactSchema') return response_(request, { ok: true, result: compactSchema() });
    if (action === 'schemaStatus') return response_(request, { ok: true, result: schemaStatus_() });
    if (action === 'catastro') return response_(request, { ok: true, item: getCatastro_(request.reference || request.referenciaCatastral || '') });
    if (action === 'markGenerated') {
      return response_(request, { ok: true, item: markGenerated_(request.id, request.filename) });
    }

    throw new Error('Accion no soportada: ' + action);
  } catch (error) {
    request = request && Object.keys(request).length ? request : parseRequestQuiet_(e);
    return response_(request, { ok: false, error: String(error && error.message ? error.message : error) });
  }
}

function parseRequest_(e) {
  const params = Object.assign({}, e && e.parameter ? e.parameter : {});
  const payload = params.payload ? JSON.parse(params.payload) : {};
  const body = parsePostBody_(e && e.postData && e.postData.contents ? e.postData.contents : '', !params.payload);
  return Object.assign(params, payload, body);
}

function parseRequestQuiet_(e) {
  try {
    return parseRequest_(e);
  } catch (error) {
    const params = Object.assign({}, e && e.parameter ? e.parameter : {});
    return {
      callback: params.callback || '',
      requestId: params.requestId || '',
      transport: params.transport || '',
    };
  }
}

function parsePostBody_(contents, allowPayloadField) {
  const text = String(contents || '').trim();
  if (!text) return {};
  if (text[0] === '{' || text[0] === '[') return JSON.parse(text);

  const form = parseFormEncoded_(text);
  let payload = {};
  if (allowPayloadField && form.payload) payload = JSON.parse(form.payload);
  delete form.payload;
  return Object.assign(form, payload);
}

function parseFormEncoded_(text) {
  return String(text || '').split('&').reduce(function(result, pair) {
    if (!pair) return result;
    const parts = pair.split('=');
    const key = decodeFormComponent_(parts.shift());
    const value = decodeFormComponent_(parts.join('='));
    if (key) result[key] = value;
    return result;
  }, {});
}

function decodeFormComponent_(value) {
  return decodeURIComponent(String(value || '').replace(/\+/g, ' '));
}

function assertAuthorized_(request) {
  if (!APP_SECRET || APP_SECRET === 'CAMBIAR_ESTE_SECRETO') {
    throw new Error('Configura APP_SECRET en Apps Script antes de publicar');
  }
  if (request.secret !== APP_SECRET) {
    throw new Error('No autorizado');
  }
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  ensureHeaders_(sheet);
  return sheet;
}

function ensureHeaders_(sheet) {
  const headers = getHeaderRow_(sheet);
  if (!headers.length) writeCleanHeader_(sheet);
  const width = Math.max(headers.length, HEADERS.length);
  sheet.getRange(1, 1, Math.max(sheet.getMaxRows(), 1), width).setNumberFormat('@');
}

function getHeaderRow_(sheet) {
  const width = sheet.getLastColumn();
  if (!width) return [];
  const headers = sheet.getRange(1, 1, 1, width).getValues()[0].map(function(header) {
    return String(header || '').trim();
  });
  while (headers.length && !headers[headers.length - 1]) headers.pop();
  return headers;
}

function isCleanSchema_(headers) {
  if (headers.length !== HEADERS.length) return false;
  return HEADERS.every(function(header, index) {
    return headers[index] === header;
  });
}

function writeCleanHeader_(sheet) {
  sheet.getRange(1, 1, 1, HEADERS.length).setNumberFormat('@').setValues([HEADERS]);
  sheet.setFrozenRows(1);
}

function compactSheetSchema_(sheet, options) {
  options = options || {};
  const oldHeaders = getHeaderRow_(sheet);
  const oldWidth = Math.max(oldHeaders.length, sheet.getLastColumn(), HEADERS.length);
  const oldLastRow = sheet.getLastRow();
  const backupName = options.backup ? backupSheet_(sheet) : '';
  const records = oldLastRow > 1
    ? sheet.getRange(2, 1, oldLastRow - 1, oldWidth).getValues()
      .filter(rowHasData_)
      .map(function(row) {
        return rowToRecord_(row, oldHeaders);
      })
    : [];

  sheet.clearContents();
  writeCleanHeader_(sheet);
  if (records.length) {
    const rows = records.map(recordToRow_);
    const range = sheet.getRange(2, 1, rows.length, HEADERS.length);
    range.setNumberFormat('@');
    range.setValues(rows);
  }
  if (sheet.getMaxColumns() > HEADERS.length) {
    sheet.deleteColumns(HEADERS.length + 1, sheet.getMaxColumns() - HEADERS.length);
  }
  sheet.getRange(1, 1, Math.max(sheet.getMaxRows(), 1), HEADERS.length).setNumberFormat('@');
  return { rows: records.length, columns: HEADERS.length, backupSheet: backupName };
}

function schemaStatus_() {
  const sheet = getSheet_();
  const headers = getHeaderRow_(sheet);
  return {
    clean: isCleanSchema_(headers),
    columns: headers.length,
    expectedColumns: HEADERS.length,
    extraHeaders: headers.filter(function(header) {
      return HEADERS.indexOf(header) < 0;
    }),
    missingHeaders: HEADERS.filter(function(header) {
      return headers.indexOf(header) < 0;
    }),
  };
}

function backupSheet_(sheet) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss');
  let name = SHEET_NAME + '_backup_' + timestamp;
  let suffix = 2;
  while (ss.getSheetByName(name)) {
    name = SHEET_NAME + '_backup_' + timestamp + '_' + suffix;
    suffix += 1;
  }
  const backup = sheet.copyTo(ss).setName(name);
  ss.setActiveSheet(sheet);
  return backup.getName();
}

function rowHasData_(row) {
  return row.some(function(value) {
    return hasCellValue_(value);
  });
}

function listRecords_() {
  const sheet = getSheet_();
  const headers = getHeaderRow_(sheet);
  const width = Math.max(headers.length, HEADERS.length);
  if (sheet.getLastRow() <= 1) return [];
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, width).getValues();
  return rows.filter(row => row[0]).map(function(row) {
    return rowToRecord_(row, headers);
  });
}

function getRecord_(id) {
  return listRecords_().find(item => item.id === id) || null;
}

function saveRecord_(item) {
  const sheet = getSheet_();
  ensureCleanSchemaForWrite_(sheet);
  const now = new Date().toISOString();
  const records = listRecords_();
  const existing = records.find(record => record.id === item.id || (
    item.referenciaCatastral && record.referenciaCatastral === item.referenciaCatastral
  ));

  const next = Object.assign({}, existing || {}, item);
  next.id = next.id || Utilities.getUuid();
  next.estado = next.estado || inferEstado_(next);
  next.createdAt = next.createdAt || now;
  next.updatedAt = now;
  const row = recordToRow_(next);
  if (existing) {
    const rowNumber = findRowById_(sheet, existing.id);
    writeRecordRow_(sheet, rowNumber, row);
  } else {
    writeRecordRow_(sheet, sheet.getLastRow() + 1, row);
  }

  return next;
}

function patchRecord_(request) {
  const sheet = getSheet_();
  ensureCleanSchemaForWrite_(sheet);
  const now = new Date().toISOString();
  const item = request.item || {};
  const dataPatch = request.dataPatch || item.data || {};
  const id = request.id || item.id;
  const referenciaCatastral = request.referenciaCatastral || item.referenciaCatastral;
  const records = listRecords_();
  const existing = records.find(function(record) {
    return (id && record.id === id) || (
      referenciaCatastral && normalizeReference_(record.referenciaCatastral) === normalizeReference_(referenciaCatastral)
    );
  });

  const next = Object.assign({}, existing || {}, item);
  next.id = next.id || id || Utilities.getUuid();
  next.data = Object.assign({}, existing && existing.data ? existing.data : {}, item.data || {}, dataPatch);
  next.createdAt = next.createdAt || now;
  next.updatedAt = now;
  addSummaryFields_(next);
  next.estado = item.estado || next.estado || inferEstado_(next);
  const row = recordToRow_(next);
  if (existing) {
    const rowNumber = findRowById_(sheet, existing.id);
    writeRecordRow_(sheet, rowNumber, row);
  } else {
    writeRecordRow_(sheet, sheet.getLastRow() + 1, row);
  }

  return next;
}

function writeRecordRow_(sheet, rowNumber, row) {
  const range = sheet.getRange(rowNumber, 1, 1, HEADERS.length);
  range.setNumberFormat('@');
  range.setValues([row.map(cellValue_)]);
}

function markGenerated_(id, filename) {
  const item = getRecord_(id);
  if (!item) throw new Error('Referencia no encontrada');
  item.estado = 'CEX_GENERADO';
  item.cexGenerado = filename || item.cexGenerado || '';
  item.fechaCexGenerado = new Date().toISOString();
  return saveRecord_(item);
}

function deleteRecord_(id, referenciaCatastral) {
  const sheet = getSheet_();
  ensureCleanSchemaForWrite_(sheet);
  const rowNumber = findRowByIdOrReference_(sheet, id, referenciaCatastral);
  sheet.deleteRow(rowNumber);
  return true;
}

function ensureCleanSchemaForWrite_(sheet) {
  const headers = getHeaderRow_(sheet);
  if (!isCleanSchema_(headers)) compactSheetSchema_(sheet, { backup: true });
}

function getCatastro_(reference) {
  const rc = String(reference || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (rc.length !== 20) throw new Error('Referencia catastral no valida');
  const url = 'https://ovc.catastro.meh.es/OVCServWeb/OVCSWLocalizacionRC/OVCCallejero.asmx/Consulta_DNPRC?Provincia=&Municipio=&RC=' + encodeURIComponent(rc);
  const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  if (response.getResponseCode() >= 400) {
    throw new Error('Catastro respondio HTTP ' + response.getResponseCode());
  }
  const xml = response.getContentText();
  return {
    referenciaCatastral: rc,
    direccion: extractTag_(xml, 'ldt'),
    provincia: titleCase_(extractTag_(xml, 'np')),
    localidad: extractTag_(xml, 'nm'),
    codigoPostal: extractTag_(xml, 'dp'),
    uso: extractTag_(xml, 'luso'),
    superficieCatastral: extractTag_(xml, 'sfc'),
    anioConstruccion: extractTag_(xml, 'ant'),
    construcciones: extractConstructions_(xml),
  };
}

function findRowById_(sheet, id) {
  const values = sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 1), 1).getValues();
  for (let index = 0; index < values.length; index += 1) {
    if (values[index][0] === id) return index + 2;
  }
  throw new Error('Fila no encontrada para id ' + id);
}

function findRowByIdOrReference_(sheet, id, referenciaCatastral) {
  const values = sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 1), HEADERS.length).getValues();
  const idIndex = HEADERS.indexOf('id');
  const refIndex = HEADERS.indexOf('referenciaCatastral');
  const ref = String(referenciaCatastral || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  for (let index = 0; index < values.length; index += 1) {
    const rowId = String(values[index][idIndex] || '');
    const rowRef = String(values[index][refIndex] || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if ((id && rowId === id) || (ref && rowRef === ref)) return index + 2;
  }
  throw new Error('Fila no encontrada para eliminar');
}

function rowToRecord_(row, headers) {
  const record = {};
  (headers || HEADERS).forEach((header, index) => {
    if (!header) return;
    record[header] = row[index];
  });
  const rawJson = rawJsonFromRecord_(record);
  let next = record;
  if (rawJson) {
    try {
      next = Object.assign({}, JSON.parse(rawJson), record, { rawJson: rawJson });
    } catch (error) {
      next = record;
    }
  }
  next.data = Object.assign({}, next.data || {});
  SCALAR_DATA_PATHS.forEach(function(path) {
    if (hasCellValue_(record[path])) next.data[path] = record[path];
  });
  JSON_DATA_PATHS.forEach(function(path) {
    if (!hasCellValue_(record[path])) return;
    try {
      next.data[path] = JSON.parse(record[path]);
    } catch (error) {
      next.data[path] = record[path];
    }
  });
  addSummaryFields_(next);
  return next;
}

function recordToRow_(record) {
  const data = record.data || {};
  return HEADERS.map(function(header) {
    if (SCALAR_DATA_PATHS.indexOf(header) >= 0) return cellValue_(data[header]);
    if (JSON_DATA_PATHS.indexOf(header) >= 0) return jsonCellValue_(data[header], header);
    return cellValue_(record[header]);
  });
}

function rawJsonFromRecord_(record) {
  return LEGACY_RAW_JSON_HEADERS.map(function(header) {
    return record[header] || '';
  }).join('');
}

function hasCellValue_(value) {
  return value !== null && value !== undefined && String(value) !== '';
}

function cellValue_(value) {
  return hasCellValue_(value) ? value : '';
}

function jsonCellValue_(value, header) {
  if (!hasCellValue_(value)) return '';
  const text = JSON.stringify(value);
  if (text.length > 49000) {
    throw new Error('La columna JSON ' + header + ' supera el limite practico de Google Sheets');
  }
  return text;
}

function inferEstado_(item) {
  const required = ['referenciaCatastral', 'direccion', 'municipio', 'provincia', 'superficieUtil', 'anioConstruccion'];
  const complete = required.every(field => String(item[field] || '').trim());
  return complete ? 'COMPLETA' : 'PENDIENTE_DATOS';
}

function addSummaryFields_(record) {
  record.referenciaCatastral = valueFromData_(record, 'admin.localizacion.referenciaCatastral') || record.referenciaCatastral || '';
  record.direccion = valueFromData_(record, 'admin.localizacion.direccion') || record.direccion || '';
  record.municipio = valueFromData_(record, 'admin.localizacion.localidad') || record.municipio || '';
  record.provincia = valueFromData_(record, 'admin.localizacion.provincia') || record.provincia || '';
  record.codigoPostal = valueFromData_(record, 'admin.localizacion.codigoPostal') || record.codigoPostal || '';
  record.tipoEdificio = valueFromData_(record, 'generales.datos.tipoEdificio') || record.tipoEdificio || '';
  record.superficieUtil = valueFromData_(record, 'generales.definicion.superficieUtilHabitable') || record.superficieUtil || '';
  record.anioConstruccion = valueFromData_(record, 'generales.datos.anioConstruccion') || record.anioConstruccion || '';
}

function valueFromData_(record, path) {
  const value = record && record.data ? record.data[path] : '';
  if (Array.isArray(value)) return value.length ? JSON.stringify(value) : '';
  return String(value || '').trim();
}

function normalizeReference_(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function extractTag_(xml, tag) {
  const match = String(xml || '').match(new RegExp('<(?:\\w+:)?' + tag + '[^>]*>([^<]*)</(?:\\w+:)?' + tag + '>', 'i'));
  return match ? decodeXml_(match[1]).trim() : '';
}

function extractConstructions_(xml) {
  const blocks = String(xml || '').match(/<(?:\w+:)?cons\b[\s\S]*?<\/(?:\w+:)?cons>/gi) || [];
  return blocks.map(function(block) {
    return {
      destino: extractTag_(block, 'lcd'),
      superficie: extractTag_(block, 'stl'),
    };
  }).filter(function(item) {
    return item.destino || item.superficie;
  });
}

function decodeXml_(value) {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function titleCase_(value) {
  return String(value || '').toLowerCase().replace(/(^|\s)\S/g, function(match) {
    return match.toUpperCase();
  });
}

function response_(request, payload) {
  if (request && request.transport === 'formMessage') {
    return formMessage_(request, payload);
  }
  if (request && request.callback) {
    return jsonp_(request.callback, payload);
  }
  return json_(payload);
}

function formMessage_(request, payload) {
  const message = {
    source: 'ce3x-apps-script',
    requestId: request.requestId || '',
    payload: payload,
  };
  const html = '<!doctype html><html><body><script>' +
    'window.parent.postMessage(' + JSON.stringify(message) + ', "*");' +
    '</script></body></html>';
  return HtmlService
    .createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function jsonp_(callback, payload) {
  const safeCallback = String(callback || '').replace(/[^\w.$]/g, '');
  if (!safeCallback) return json_(payload);
  return ContentService
    .createTextOutput(safeCallback + '(' + JSON.stringify(payload) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
