const SHEET_NAME = 'referencias';
const APP_SECRET = 'CAMBIAR_ESTE_SECRETO';
const GOOGLE_MAPS_API_KEY = '';
const CATASTRO_PARSER_VERSION = '20260722-lcons-bi-1';
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
const REPORT_DATA_PATHS = ['admin.informe.fechaVisita', 'admin.informe.observaciones',
  'admin.informe.fechaEmision', 'admin.informe.recomendacionesUso', 'admin.informe.documentacion'];
const SCALAR_DATA_PATHS = [
  'cex.sourceVersion',
  'cex.nativeInputs',
  'admin.localizacion.gradoProteccion',
  'admin.localizacion.usoEdificio',
  'admin.localizacion.nombreEdificio',
  'admin.localizacion.direccion',
  'admin.localizacion.provincia',
  'admin.localizacion.localidad',
  'admin.localizacion.codigoPostal',
  'admin.localizacion.referenciaCatastral',
  'admin.cliente.nombreRazonSocial',
  'admin.cliente.nif',
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
  'catastro.x',
  'catastro.y',
  'catastro.reference',
  'catastro.srs',
  'catastro.superficiePlantaInferior',
  'catastro.superficiePlantaMayor',
  'catastro.parcelasColindantes',
  'catastro.fachadasExpuestas',
].concat(REPORT_DATA_PATHS);
const JSON_DATA_PATHS = [
  'informe.ultimaEmision',
  'revision.campos',
  'envolvente.cerramientos.items',
  'envolvente.huecos.items',
  'envolvente.puentesTermicos.items',
  'instalaciones.acs.items',
  'instalaciones.calefaccion.items',
  'instalaciones.refrigeracion.items',
  'instalaciones.contribuciones.items',
];
const LONG_TEXT_DATA_PATHS = [
  'cex.nativeInputs',
  'generales.definicion.imagenEdificio',
  'generales.definicion.planoSituacion',
];
const LONG_TEXT_CHUNK_SIZE = 45000;
const LONG_TEXT_CHUNK_COUNT = 8;
const LONG_TEXT_CHUNK_HEADERS = LONG_TEXT_DATA_PATHS.reduce(function(headers, path) {
  for (let index = 2; index <= LONG_TEXT_CHUNK_COUNT; index += 1) {
    headers.push(path + '#' + index);
  }
  return headers;
}, []);

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

// Keep the 91 historical columns in place; append the 3.2 extension.
const CEX32_DATA_PATHS = ['cex.sourceVersion', 'cex.nativeInputs',
  'admin.localizacion.gradoProteccion', 'admin.localizacion.usoEdificio', 'admin.cliente.nif'];
const HEADERS = BASE_HEADERS.concat(
  SCALAR_DATA_PATHS.filter(path => !CEX32_DATA_PATHS.includes(path) && !REPORT_DATA_PATHS.includes(path)),
  JSON_DATA_PATHS.filter(path=>!['revision.campos','informe.ultimaEmision'].includes(path)),
  LONG_TEXT_CHUNK_HEADERS.filter(path => path.indexOf('cex.nativeInputs#') !== 0),
  CEX32_DATA_PATHS,
  LONG_TEXT_CHUNK_HEADERS.filter(path => path.indexOf('cex.nativeInputs#') === 0),
  ['revision.campos'],
  REPORT_DATA_PATHS,
  ['informe.ultimaEmision']
);

function setup() {
  getSheet_();
}

function compactSchema() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  return compactSheetSchema_(sheet, { backup: true });
}

function migrateSchema32() {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const sheet = getSheet_();
    const headers = getHeaderRow_(sheet);
    if (isCleanSchema_(headers)) return schemaStatus_();
    if (!headers.every(function(header, index) { return HEADERS[index] === header; })) {
      throw new Error('La hoja no tiene el esquema anterior esperado. No se ha modificado.');
    }
    const backup = backupSheet_(sheet);
    if (sheet.getMaxColumns() < HEADERS.length) {
      sheet.insertColumnsAfter(sheet.getMaxColumns(), HEADERS.length - sheet.getMaxColumns());
    }
    const missing = HEADERS.slice(headers.length);
    if (missing.length) {
      sheet.getRange(1, headers.length + 1, 1, missing.length)
        .setNumberFormat('@').setValues([missing]);
      sheet.getRange(2, headers.length + 1, sheet.getMaxRows() - 1, missing.length)
        .setNumberFormat('@');
    }
    return Object.assign(schemaStatus_(), { backupSheet: backup });
  } finally { lock.releaseLock(); }
}

// Checks serialization/storage without creating or editing an expediente.
function verifySchema32() {
  const status = schemaStatus_();
  if (!status.clean) throw new Error('Esquema pendiente de migrar.');
  const test = {id: 'prueba-en-memoria', data: {
    'admin.cliente.nif': '00000000T',
    'admin.localizacion.gradoProteccion': 'Ninguna',
    'cex.sourceVersion': '3.2',
    'cex.nativeInputs': 'x'.repeat(90001)
  }};
  const restored = rowToRecord_(recordToRow_(test), HEADERS);
  Object.keys(test.data).forEach(function(path) {
    if (restored.data[path] !== test.data[path]) throw new Error('Fallo de almacenamiento: ' + path);
  });
  console.log(JSON.stringify({schema: status, storageRoundTrip: true}));
  return status;
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
    if (action === 'getTechnicianConfig') return response_(request, {ok: true, technician: technicianConfig_()});
    if (action === 'saveTechnicianConfig') {
      if (!e || !e.postData) throw new Error('El perfil solo se guarda por POST.');
      return response_(request, {ok: true, technician: technicianConfig_(request.technician || {})});
    }
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

function technicianConfig_(profile) {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  const name = 'Configuración CE3X';
  if (profile === undefined) {
    const sheet = book.getSheetByName(name);
    const stored = sheet && sheet.getRange('B2').getValue();
    return stored ? JSON.parse(stored) : null;
  }
  const fields = ['nombre', 'nif', 'razonSocial', 'cif', 'direccion', 'provincia',
    'localidad', 'codigoPostal', 'telefono', 'email', 'titulacion'];
  const cleaned = {};
  fields.forEach(function(field) {
    const path = 'admin.tecnico.' + field;
    if (typeof profile[path] === 'string') cleaned[path] = profile[path].trim().slice(0, 500);
  });
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = book.getSheetByName(name) || book.insertSheet(name);
    sheet.getRange('A1:B2').setValues([['Configuración', 'Valor'], ['Técnico por defecto', JSON.stringify(cleaned)]]);
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
  return cleaned;
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
  const width = Math.min(sheet.getMaxColumns(), Math.max(headers.length, HEADERS.length));
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
  if (sheet.getMaxColumns() < HEADERS.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), HEADERS.length - sheet.getMaxColumns());
  }
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
    cexVersion: '3.2',
    referenceWriteVersion: 1,
    reviewWriteVersion: 1,
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
  const existing = findRecordForWrite_(records,item.id,item.referenciaCatastral);

  const next = Object.assign({}, existing || {}, item);
  next.data = Object.assign({}, existing && existing.data || {}, item.data || {});
  next.id = existing?existing.id:(next.id || Utilities.getUuid());
  next.estado = next.estado || inferEstado_(next);
  next.createdAt = next.createdAt || now;
  next.updatedAt = now;
  addSummaryFields_(next);
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
  const existing = findRecordForWrite_(records,id,referenciaCatastral);

  const next = Object.assign({}, existing || {}, item);
  next.id = existing?existing.id:(next.id || id || Utilities.getUuid());
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

function findRecordForWrite_(records,id,reference) {
  if(id) {
    const matches=records.filter(function(record){return String(record.id||'')===String(id);});
    if(matches.length>1)throw new Error('El identificador del expediente está repetido. Revisa el histórico antes de guardar.');
    return matches[0]||null;
  }
  const normalized=normalizeReference_(reference);
  if(!normalized)return null;
  const matches=records.filter(function(record){return normalizeReference_(record.referenciaCatastral)===normalized;});
  if(matches.length>1)throw new Error('Hay varios expedientes con esa referencia. Indica el id del expediente.');
  return matches[0]||null;
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
  if (!isCleanSchema_(headers)) throw new Error('La hoja necesita migracion. Ejecuta migrateSchema32() desde Apps Script antes de guardar.');
}

function getCatastro_(reference) {
  const rc = String(reference || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (rc.length !== 20) throw new Error('Referencia catastral no valida');
  const url = 'https://ovc.catastro.meh.es/OVCServWeb/OVCWcfCallejero/COVCCallejero.svc/json/Consulta_DNPRC?RefCat=' + encodeURIComponent(rc);
  const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  if (response.getResponseCode() >= 400) {
    throw new Error('Catastro respondio HTTP ' + response.getResponseCode());
  }
  const result = parseCatastroJson_(response.getContentText());
  const coordinates = getCatastroCoordinates_(rc);
  const neighbourInfo = getCatastroNeighbourInfo_(rc);
  const streetViewImage = getStreetViewImage_(coordinates);
  const situationPlanImage = getCatastroSituationPlanImage_(coordinates);
  return {
    referenciaCatastral: rc,
    direccion: result.direccion,
    provincia: result.provincia,
    localidad: result.localidad,
    codigoPostal: result.codigoPostal,
    uso: result.uso,
    superficieCatastral: result.superficieCatastral,
    superficieVivienda: result.superficieVivienda,
    anioConstruccion: result.anioConstruccion,
    plantas: result.plantas,
    catastroParserVersion: CATASTRO_PARSER_VERSION,
    construcciones: result.construcciones,
    x: coordinates.x,
    y: coordinates.y,
    srs: coordinates.srs,
    imagenEdificio: streetViewImage,
    planoSituacion: situationPlanImage,
    parcelasColindantes: neighbourInfo.parcelasColindantes,
    fachadasExpuestas: neighbourInfo.fachadasExpuestas,
  };
}

function parseCatastroJson_(text) {
  let payload;
  try {
    payload = JSON.parse(String(text || ''));
  } catch (error) {
    throw new Error('Catastro devolvio una respuesta no valida');
  }

  const result = payload && payload.consulta_dnprcResult;
  const bi = result && result.bico && result.bico.bi;
  if (!bi) throw new Error('Catastro no devolvio datos del inmueble');

  const dt = bi.dt || {};
  const location = dt.locs && dt.locs.lous && dt.locs.lous.lourb || {};
  const addressParts = location.dir || {};
  const address = dt.ldt || [
    addressParts.tv,
    addressParts.nv,
    addressParts.pnp,
    location.dp,
    location.nm,
  ].filter(Boolean).join(' ');
  // Consulta_DNPRC places lcons inside bico.bi. Keep the root-level fallback
  // for older responses and test fixtures that exposed it beside bico.
  const rawConstructions = bi.lcons || result.lcons || [];
  const constructionItems = Array.isArray(rawConstructions)
    ? rawConstructions
    : (rawConstructions ? [rawConstructions] : []);
  const constructions = constructionItems.map(function(item) {
    const internal = item.dt && item.dt.lourb && item.dt.lourb.loint || {};
    return {
      destino: item.lcd || '',
      superficie: item.dfcons && item.dfcons.stl || '',
      planta: internal.pt || '',
    };
  }).filter(function(item) {
    return item.destino || item.superficie;
  });
  const residentialConstructions = constructions.filter(function(item) {
    return String(item.destino || '').toUpperCase().indexOf('VIVIENDA') >= 0;
  });
  const residentialFloors = {};
  residentialConstructions.forEach(function(item) {
    const floor = String(item.planta || '').trim();
    if (floor) residentialFloors[floor] = true;
  });
  const plantas = String(Object.keys(residentialFloors).length || residentialConstructions.length || '');
  const superficieVivienda = String(residentialConstructions.reduce(function(total, item) {
    const value = Number(String(item.superficie || '').replace(',', '.'));
    return total + (isFinite(value) ? value : 0);
  }, 0) || '');
  const building = bi.debi || {};
  const province = dt.np || dt.loine && dt.loine.np || '';
  const locality = dt.nm || dt.loine && dt.loine.nm || '';
  if (!address && !building.sfc && !constructions.length) {
    throw new Error('Catastro no devolvio datos del inmueble');
  }

  return {
    direccion: address,
    provincia: titleCase_(province),
    localidad: locality,
    codigoPostal: location.dp || '',
    uso: building.luso || '',
    superficieCatastral: building.sfc || '',
    superficieVivienda: superficieVivienda,
    anioConstruccion: building.ant || '',
    plantas: plantas,
    construcciones: constructions,
  };
}

function assertCatastroResponseOk_(xml) {
  const errorCount = extractTag_(xml, 'cuerr');
  const errorMessage = extractTag_(xml, 'des');
  if (errorCount && errorCount !== '0') {
    throw new Error('Catastro no devolvio datos: ' + (errorMessage || 'servicio no disponible'));
  }
  if (String(xml || '').match(/<(?:\w+:)?lerr\b/i)) {
    throw new Error('Catastro no devolvio datos: ' + (errorMessage || 'servicio no disponible'));
  }
}

function getCatastroCoordinates_(reference) {
  try {
    const parcelReference = normalizeReference_(reference).slice(0, 14);
    if (parcelReference.length !== 14) return {};
    const url = 'https://ovc.catastro.meh.es/INSPIRE/wfsCP.aspx?service=WFS&version=2.0.0&request=GetFeature&STOREDQUERIE_ID=GetParcel&refcat=' + encodeURIComponent(parcelReference) + '&srsname=EPSG::4326';
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (response.getResponseCode() >= 400) return {};
    const xml = response.getContentText();
    const match = String(xml || '').match(/<gml:posList[^>]*>([^<]+)<\/gml:posList>/i);
    if (!match) return {};
    const values = match[1].trim().split(/\s+/).map(Number).filter(isFinite);
    if (values.length < 2) return {};
    let latitude = 0;
    let longitude = 0;
    let count = 0;
    for (let index = 0; index + 1 < values.length; index += 2) {
      latitude += values[index];
      longitude += values[index + 1];
      count += 1;
    }
    return {
      x: String(longitude / count),
      y: String(latitude / count),
      srs: 'EPSG:4326',
    };
  } catch (error) {
    return {};
  }
}

function getCatastroNeighbourInfo_(reference) {
  try {
    const parcelReference = normalizeReference_(reference).slice(0, 14);
    if (parcelReference.length !== 14) return {};
    const url = 'https://ovc.catastro.meh.es/INSPIRE/wfsCP.aspx?service=WFS&version=2.0.0&request=GetFeature&STOREDQUERIE_ID=GETNEIGHBOURPARCEL&refcat=' + encodeURIComponent(parcelReference) + '&srsname=EPSG::25830';
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (response.getResponseCode() >= 400) return {};
    const xml = response.getContentText();
    const parcels = String(xml || '').match(/<(?:[A-Za-z0-9_]+:)?CadastralParcel\b/gi) || [];
    const neighbours = Math.max(0, parcels.length - 1);
    return {
      parcelasColindantes: String(neighbours),
      fachadasExpuestas: String(neighbours >= 2 ? 2 : neighbours === 1 ? 3 : 4),
    };
  } catch (error) {
    return {};
  }
}

function getStreetViewImage_(coordinates) {
  try {
    if (!GOOGLE_MAPS_API_KEY || !coordinates || !coordinates.x || !coordinates.y) return '';
    const location = coordinates.y + ',' + coordinates.x;
    const metadataUrl = 'https://maps.googleapis.com/maps/api/streetview/metadata?'
      + 'location=' + encodeURIComponent(location)
      + '&source=outdoor'
      + '&key=' + encodeURIComponent(GOOGLE_MAPS_API_KEY);
    const metadataResponse = UrlFetchApp.fetch(metadataUrl, { muteHttpExceptions: true });
    if (metadataResponse.getResponseCode() >= 400) return '';
    const metadata = JSON.parse(metadataResponse.getContentText() || '{}');
    if (metadata.status !== 'OK') return '';

    const imageUrl = 'https://maps.googleapis.com/maps/api/streetview?'
      + 'size=640x480'
      + '&location=' + encodeURIComponent(location)
      + '&source=outdoor'
      + '&fov=80'
      + '&pitch=0'
      + '&key=' + encodeURIComponent(GOOGLE_MAPS_API_KEY);
    const imageResponse = UrlFetchApp.fetch(imageUrl, { muteHttpExceptions: true });
    if (imageResponse.getResponseCode() >= 400) return '';
    const blob = imageResponse.getBlob();
    const contentType = blob.getContentType() || 'image/jpeg';
    return 'data:' + contentType + ';base64,' + Utilities.base64Encode(blob.getBytes());
  } catch (error) {
    return '';
  }
}

function getCatastroSituationPlanImage_(coordinates) {
  try {
    if (!coordinates || !coordinates.x || !coordinates.y) return '';
    const url = catastroWmsMapUrl_(coordinates);
    if (!url) return '';
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (response.getResponseCode() >= 400) return '';
    const blob = response.getBlob();
    const contentType = blob.getContentType() || 'image/png';
    if (!String(contentType).match(/^image\//i)) return '';
    return 'data:' + contentType + ';base64,' + Utilities.base64Encode(blob.getBytes());
  } catch (error) {
    return '';
  }
}

function catastroWmsMapUrl_(coordinates) {
  const x = Number(String(coordinates.x || '').replace(',', '.'));
  const y = Number(String(coordinates.y || '').replace(',', '.'));
  if (!isFinite(x) || !isFinite(y)) return '';
  // About 45 x 40 m in mainland Spain: the parcel fills the image while
  // retaining its immediate neighbouring plots.
  const longitudeSpan = 0.00052;
  const latitudeSpan = 0.00038;
  const bbox = [
    x - longitudeSpan / 2,
    y - latitudeSpan / 2,
    x + longitudeSpan / 2,
    y + latitudeSpan / 2,
  ].map(function(value) {
    return String(Math.round(value * 100000000000000) / 100000000000000);
  }).join(',');
  return 'https://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx'
    + '?SERVICE=WMS'
    + '&VERSION=1.1.1'
    + '&REQUEST=GetMap'
    + '&SRS=' + encodeURIComponent(coordinates.srs || 'EPSG:4326')
    + '&BBOX=' + encodeURIComponent(bbox)
    + '&WIDTH=1000'
    + '&HEIGHT=760'
    + '&LAYERS=Catastro'
    + '&STYLES='
    + '&FORMAT=image/png';
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
  const matches=[];
  for (let index = 0; index < values.length; index += 1) {
    const rowId = String(values[index][idIndex] || '');
    const rowRef = String(values[index][refIndex] || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (id ? rowId===String(id) : (ref && rowRef===ref)) matches.push(index+2);
  }
  if(matches.length>1)throw new Error('Hay varios expedientes con esa referencia. Indica el id del expediente.');
  if(matches.length===1)return matches[0];
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
    if (isLongTextPath_(path)) {
      const longValue = longTextFromRecord_(record, path);
      if (hasCellValue_(longValue)) next.data[path] = longValue;
    } else if (hasCellValue_(record[path])) {
      next.data[path] = record[path];
    }
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
  LONG_TEXT_DATA_PATHS.forEach(function(path) {
    if (String(data[path] || '').length > LONG_TEXT_CHUNK_SIZE * LONG_TEXT_CHUNK_COUNT) throw new Error('El campo ' + path + ' supera el tamaño admitido. No se ha guardado.');
  });
  return HEADERS.map(function(header) {
    if (SCALAR_DATA_PATHS.indexOf(header) >= 0) {
      if (isLongTextPath_(header)) return longTextChunk_(data[header], 1);
      return cellValue_(data[header]);
    }
    const chunk = longTextChunkHeader_(header);
    if (chunk) return longTextChunk_(data[chunk.path], chunk.index);
    if (JSON_DATA_PATHS.indexOf(header) >= 0) return jsonCellValue_(data[header], header);
    return cellValue_(record[header]);
  });
}

function isLongTextPath_(path) {
  return LONG_TEXT_DATA_PATHS.indexOf(path) >= 0;
}

function longTextChunkHeader_(header) {
  const match = String(header || '').match(/^(.+)#(\d+)$/);
  if (!match || !isLongTextPath_(match[1])) return null;
  return { path: match[1], index: Number(match[2]) };
}

function longTextChunk_(value, index) {
  const text = String(value || '');
  const start = (index - 1) * LONG_TEXT_CHUNK_SIZE;
  return text.slice(start, start + LONG_TEXT_CHUNK_SIZE);
}

function longTextFromRecord_(record, path) {
  const chunks = [record[path] || ''];
  for (let index = 2; index <= LONG_TEXT_CHUNK_COUNT; index += 1) {
    chunks.push(record[path + '#' + index] || '');
  }
  return chunks.join('');
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
  record.referenciaCatastral = record.data&&Object.prototype.hasOwnProperty.call(record.data,'admin.localizacion.referenciaCatastral')
    ?valueFromData_(record,'admin.localizacion.referenciaCatastral'):(record.referenciaCatastral||'');
  record.direccion = valueFromData_(record, 'admin.localizacion.direccion') || record.direccion || '';
  record.municipio = valueFromData_(record, 'admin.localizacion.localidad') || record.municipio || '';
  record.provincia = valueFromData_(record, 'admin.localizacion.provincia') || record.provincia || '';
  record.codigoPostal = valueFromData_(record, 'admin.localizacion.codigoPostal') || record.codigoPostal || '';
  record.uso = valueFromData_(record, 'uso') || record.uso || '';
  record.tipoEdificio = valueFromData_(record, 'generales.datos.tipoEdificio') || record.tipoEdificio || '';
  record.superficieUtil = valueFromData_(record, 'generales.definicion.superficieUtilHabitable') || record.superficieUtil || '';
  record.superficieCatastral = valueFromData_(record, 'superficieCatastral') || record.superficieCatastral || '';
  record.anioConstruccion = valueFromData_(record, 'generales.datos.anioConstruccion') || record.anioConstruccion || '';
  record.plantas = valueFromData_(record, 'generales.definicion.numeroPlantasHabitables') || record.plantas || '';
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
      planta: extractTag_(block, 'pt'),
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
