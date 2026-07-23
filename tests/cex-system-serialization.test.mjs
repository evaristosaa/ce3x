import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function loadCexHelpers() {
  let source = readFileSync(new URL('../app/app.js', import.meta.url), 'utf8');
  source = source
    .replace('cleanupLocalDataStorage();', '')
    .replace('renderTabs();', '')
    .replace('renderStorageMode();', '')
    .replace('loadRecords();', '')
    .replace(
      "addChatMessage('assistant', 'Selecciona arriba el expediente para el chat. Casa 37 queda cargado como primer expediente; todo lo que dictes irÃ¡ al expediente seleccionado.');",
      '',
    );

  const noopElement = {
    addEventListener() {},
    appendChild() {},
    close() {},
    querySelector() { return noopElement; },
    remove() {},
    showModal() {},
    style: {},
  };
  const context = {
    Blob,
    TextDecoder,
    TextEncoder,
    URL,
    URLSearchParams,
    alert() {},
    document: {
      body: noopElement,
      createElement() { return noopElement; },
      querySelector() { return noopElement; },
    },
    localStorage: {
      getItem() { return null; },
      removeItem() {},
      setItem() {},
    },
    navigator: {},
    window: {
      addEventListener() {},
      crypto: { randomUUID: () => 'test-id' },
      location: { protocol: 'http:', search: '' },
      setTimeout,
    },
  };
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(`${source}
globalThis.__cexHelpers = {
  alignCexEnvelopeReferences,
  applyCexReplacements,
  catastroPatchFromData,
  catastroCartographyUrl,
  catastro3dUrl,
  normativaVigenteDesdeAnio,
  normalizeRecord,
  emptyOnlyPatch,
  serializeCexSystemsStream,
  storedValueForPatchPath,
  applyCexEmbeddedImageReplacements,
  catastroSituationPlanModel,
  hasUsefulCatastroData,
  estimatedEnvelopePatch,
  catastroAutocompletionPatch,
  shouldPreferFormTransport,
  estimatedSystemsPatch,
  coveredSurfaceForPercentage,
  criticalCexIssues,
  stripCexImprovements,
  serializeCexCerramientosInput,
  serializeCexHuecosInput,
  serializeCexContribucionesInput,
  isUsefulCexContribution,
};`, context);
  return context.__cexHelpers;
}

function loadCexImportHelpers() {
  const source = readFileSync(new URL('../app/cex-import.js', import.meta.url), 'utf8');
  const context = {};
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(`${source}
globalThis.__cexImportHelpers = { parseCexRecordData };`, context);
  return context.__cexImportHelpers;
}

function loadAppsScriptHelpers() {
  const source = readFileSync(new URL('../google-apps-script/Code.gs', import.meta.url), 'utf8');
  const context = {
    console,
    Utilities: {
      formatDate() { return '20260622-000000'; },
      getUuid() { return 'test-uuid'; },
    },
    Session: {
      getScriptTimeZone() { return 'Europe/Madrid'; },
    },
};
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(`${source}
globalThis.__appsScriptHelpers = {
  HEADERS,
  parseCatastroJson_,
  recordToRow_,
  rowToRecord_,
};`, context);
  return context.__appsScriptHelpers;
}

function unpickledTopLevelLength(pickleText) {
  const result = spawnSync('python', ['-c', 'import pickle,sys; print(len(pickle.loads(sys.stdin.buffer.read())))'], {
    input: Buffer.from(pickleText, 'latin1'),
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  return Number(result.stdout.trim());
}

function unpickleJson(pickleText) {
  const result = spawnSync('python', ['-c', [
    'import io,json,pickle,sys',
    'class D:',
    ' def __init__(self,*a,**k): self.__dict__["__args__"]=a',
    ' def __setstate__(self,s): self.__dict__.update(s if isinstance(s,dict) else {"__state__":s})',
    'class U(pickle.Unpickler):',
    ' def find_class(self,m,n): return type(n,(D,),{"__module__":m})',
    "data=sys.stdin.buffer.read().replace(b'\\r\\n', b'\\n')",
    'def j(o): return o.__dict__ if hasattr(o,"__dict__") else str(o)',
    'print(json.dumps(U(io.BytesIO(data)).load(), ensure_ascii=False, default=j))',
  ].join('\n')], {
    input: Buffer.from(pickleText, 'latin1'),
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

test('serializes every installation row into the CEX systems stream', () => {
  const { serializeCexSystemsStream } = loadCexHelpers();
  const stream = serializeCexSystemsStream(
    [
      { nombre: 'ACS principal', rendimientoEstacional: '100', tipoGenerador: 'Caldera Estándar', combustible: 'Electricidad', m2Cubiertos: '50', demandaCubierta: '60', modoDefinicion: 'Estimado según Instalación', zona: 'Edificio Objeto', acumulacion: 'Sí' },
      { nombre: 'ACS apoyo', rendimientoEstacional: '95', tipoGenerador: 'Efecto Joule', combustible: 'Electricidad', m2Cubiertos: '20', demandaCubierta: '40', modoDefinicion: 'Estimado según Instalación', zona: 'Edificio Objeto', acumulacion: 'No' },
    ],
    [
      { nombre: 'Calefacción principal', rendimientoEstacional: '180', tipoGenerador: 'Bomba de Calor', combustible: 'Electricidad', m2Cubiertos: '80', demandaCubierta: '70', modoDefinicion: 'Estimado según Instalación', zona: 'Edificio Objeto' },
      { nombre: 'Calefacción apoyo', rendimientoEstacional: '120', tipoGenerador: 'Efecto Joule', combustible: 'Electricidad', m2Cubiertos: '30', demandaCubierta: '30', modoDefinicion: 'Estimado según Instalación', zona: 'Edificio Objeto' },
    ],
    [
      { nombre: 'Refrigeración principal', rendimientoEstacional: '150', tipoGenerador: 'Bomba de Calor', combustible: 'Electricidad', m2Cubiertos: '80', demandaCubierta: '70', modoDefinicion: 'Estimado según Instalación', zona: 'Edificio Objeto' },
      { nombre: 'Refrigeración apoyo', rendimientoEstacional: '110', tipoGenerador: 'Equipo autónomo', combustible: 'Electricidad', m2Cubiertos: '30', demandaCubierta: '30', modoDefinicion: 'Estimado según Instalación', zona: 'Edificio Objeto' },
    ],
    [
      { nombre: 'FV cubierta', zona: 'Edificio Objeto', acsRenovable: '80', calefaccionRenovable: '10', refrigeracionRenovable: '5', calorRecuperadoAcs: '', calorRecuperadoCalefaccion: '', frioRecuperado: '', energiaConsumidaGeneracionElectricidad: '10200', combustible: 'Electricidad' },
      { nombre: 'Solar térmica', zona: 'Edificio Objeto', acsRenovable: '20', calefaccionRenovable: '0', refrigeracionRenovable: '0', calorRecuperadoAcs: '', calorRecuperadoCalefaccion: '', frioRecuperado: '', energiaConsumidaGeneracionElectricidad: '500', combustible: 'Electricidad' },
    ],
  );

  for (const expected of [
    'ACS principal',
    'ACS apoyo',
    'Calefacción principal',
    'Calefacción apoyo',
    'FV cubierta',
    'Solar térmica',
  ]) {
    assert.match(stream, new RegExp(expected));
  }

  assert.equal(unpickledTopLevelLength(stream), 12);
});

test('imports CE3X CEX streams into the editable expediente model', () => {
  const { parseCexRecordData } = loadCexImportHelpers();
  const source = readFileSync(new URL('../app/templates/base.cex', import.meta.url), 'latin1');
  const data = parseCexRecordData(source);

  assert.equal(data['admin.localizacion.referenciaCatastral'], '0128501TG4302N0037ZI');
  assert.equal(data['generales.definicion.superficieUtilHabitable'], '149.40');
  assert.equal(data['envolvente.cerramientos.items'].length, 5);
  assert.equal(data['envolvente.huecos.items'].length, 10);
  assert.equal(data['envolvente.puentesTermicos.items'].length, 8);
  assert.equal(data['instalaciones.acs.items'].length, 1);
  assert.equal(data['instalaciones.calefaccion.items'].length, 1);
  assert.equal(data['instalaciones.refrigeracion.items'].length, 1);
  assert.equal(data['instalaciones.contribuciones.items'].length, 1);
  assert.match(data['generales.definicion.imagenEdificio'], /^data:image\/png;base64,/);
  assert.match(data['generales.definicion.planoSituacion'], /^data:image\/png;base64,/);
});

test('keeps envelope row counts and reassigns broken references to the remaining enclosure', () => {
  const { alignCexEnvelopeReferences } = loadCexHelpers();
  const aligned = alignCexEnvelopeReferences(
    [
      { nombre: 'Cubierta con aire', tipoCerramiento: 'Cubierta' },
    ],
    [
      { nombre: 'Hueco 1', cerramientoAsociado: 'Muro de fachada no' },
    ],
    [
      { nombre: 'PT fachada borrada', cerramientoAsociado: 'Muro de fachada no' },
    ],
  );

  assert.deepEqual(aligned.cerramientos.map(row => row.nombre), ['Cubierta con aire']);
  assert.deepEqual(aligned.huecos.map(row => [row.nombre, row.cerramientoAsociado]), [['Hueco 1', 'Cubierta con aire']]);
  assert.deepEqual(aligned.puentes.map(row => [row.nombre, row.cerramientoAsociado]), [['PT fachada borrada', 'Cubierta con aire']]);
});

test('normalizes closed-list installation values before CEX serialization', () => {
  const { serializeCexSystemsStream } = loadCexHelpers();
  const stream = serializeCexSystemsStream(
    [
      { nombre: 'ACS libre', rendimientoEstacional: '100', tipoGenerador: 'Caldera Estandar', combustible: 'Electricidad', m2Cubiertos: '50', demandaCubierta: '60', modoDefinicion: 'Modo libre', zona: 'Zona libre', acumulacion: 'No' },
    ],
    [
      { nombre: 'Calor libre', rendimientoEstacional: '120', tipoGenerador: 'Bomba de Calor', combustible: 'Electricidad', m2Cubiertos: '30', demandaCubierta: '30', modoDefinicion: 'Modo libre', zona: 'Zona libre' },
    ],
    [],
    [
      { nombre: 'Contrib libre', zona: 'Zona libre', acsRenovable: '20', calefaccionRenovable: '0', refrigeracionRenovable: '0', calorRecuperadoAcs: '', calorRecuperadoCalefaccion: '', frioRecuperado: '', energiaConsumidaGeneracionElectricidad: '500', combustible: 'Electricidad' },
    ],
  );

  assert.doesNotMatch(stream, /Modo libre/);
  assert.doesNotMatch(stream, /Zona libre/);
  assert.match(stream, /Edificio Objeto/);
});

test('exports CE3X-compatible building type values in all general fields', () => {
  const { applyCexReplacements } = loadCexHelpers();
  const source = [
    'VCTE 2013',
    'p1',
    'aVUnifamiliar',
    'p2',
    "S'tipoEdificio'",
    'p5071',
    'VUnifamiliar',
    'p5072',
  ].join('\r\n');
  const next = applyCexReplacements(source, {
    data: {
      'generales.datos.normativaVigente': 'CTE 2013',
      'generales.datos.tipoEdificio': 'Vivienda individual',
    },
  });

  assert.match(next, /aVUnifamiliar\r\np2/);
  assert.match(next, /S'tipoEdificio'\r\np5071\r\nVUnifamiliar\r\np5072/);
  assert.doesNotMatch(next, /Vivienda individual/);
  assert.doesNotMatch(next, /Vivienda Individual/);
});

test('exports current administrative fields and habitable floors from the full CEX template', () => {
  const { applyCexReplacements } = loadCexHelpers();
  const { parseCexRecordData } = loadCexImportHelpers();
  const source = readFileSync(new URL('../app/templates/base.cex', import.meta.url), 'latin1');
  const output = applyCexReplacements(source, {
    data: {
      'admin.localizacion.nombreEdificio': 'CL TORRE DEL ORO 7 41805',
      'admin.localizacion.direccion': 'CL TORRE DEL ORO 7 41805',
      'admin.localizacion.localidad': 'BENACAZON',
      'admin.localizacion.provincia': 'Sevilla',
      'admin.localizacion.codigoPostal': '41805',
      'admin.localizacion.referenciaCatastral': '8676623QB4387N0001EU',
      'admin.cliente.direccion': 'CL TORRE DEL ORO 7 41805',
      'admin.cliente.localidad': 'BENACAZON',
      'admin.cliente.codigoPostal': '41805',
      'admin.cliente.telefono': '.',
      'admin.cliente.email': '.',
      'admin.tecnico.nombre': 'JUAN JOSE MORENO FRESNO',
      'admin.tecnico.nif': '28629645G',
      'admin.tecnico.cif': '.',
      'admin.tecnico.direccion': 'C/ JOSE MEJIAS SALGUERO Nº4, CASA 37',
      'admin.tecnico.localidad': 'DOS HERMANAS',
      'admin.tecnico.codigoPostal': '41704',
      'admin.tecnico.titulacion': 'INGENIERO TECNICO DE MINAS',
      'generales.datos.normativaVigente': 'NBE-CT-79',
      'generales.datos.tipoEdificio': 'Vivienda individual',
      'generales.datos.provincia': 'Sevilla',
      'generales.datos.localidad': 'BENACAZON',
      'generales.datos.zonaClimaticaHE1': 'B4',
      'generales.datos.zonaClimaticaHE4': 'V',
      'generales.datos.anioConstruccion': '2002',
      'generales.definicion.superficieUtilHabitable': '108',
      'generales.definicion.alturaLibrePlanta': '2.70',
      'generales.definicion.numeroPlantasHabitables': '2',
      'generales.definicion.ventilacionInmueble': '0.63',
      'generales.definicion.demandaDiariaACS': '120',
      'generales.definicion.masaParticionesInternas': 'Ligera',
    },
  });

  const parsed = parseCexRecordData(output);
  assert.equal(parsed['admin.localizacion.referenciaCatastral'], '8676623QB4387N0001EU');
  assert.equal(parsed['admin.localizacion.localidad'], 'Benacazon');
  assert.equal(parsed['admin.localizacion.codigoPostal'], '41805');
  assert.equal(parsed['generales.definicion.numeroPlantasHabitables'], '2');
  assert.equal(parsed['generales.datos.normativaVigente'], 'NBE-CT-79');
  assert.equal(parsed['generales.datos.anioConstruccion'], '2002');
  assert.equal(parsed['generales.datos.localidad'], 'Benacazon');
});

test('returns an explicit residential floor count from Catastro constructions', () => {
  const { parseCatastroJson_ } = loadAppsScriptHelpers();
  const result = parseCatastroJson_(JSON.stringify({
    consulta_dnprcResult: {
      bico: {
        bi: {
          dt: {
            ldt: 'CL TORRE DEL ORO 7',
            np: 'SEVILLA',
            nm: 'BENACAZON',
            locs: { lous: { lourb: { dp: '41805' } } },
          },
          debi: { sfc: '108', ant: '2002', luso: 'Residencial' },
        },
      },
      lcons: [
        { lcd: 'VIVIENDA', dt: { lourb: { loint: { pt: '00' } } }, dfcons: { stl: '54' } },
        { lcd: 'VIVIENDA', dt: { lourb: { loint: { pt: '01' } } }, dfcons: { stl: '54' } },
      ],
    },
  }));

  assert.equal(result.plantas, '2');
  assert.equal(result.construcciones.length, 2);
});

test('reads the real Consulta_DNPRC construction list nested inside bico.bi', () => {
  const { parseCatastroJson_ } = loadAppsScriptHelpers();
  const result = parseCatastroJson_(JSON.stringify({
    consulta_dnprcResult: {
      control: { cudnp: 1, cucons: 3 },
      bico: { bi: {
        dt: {
          ldt: 'CL TORRE DEL ORO 7 41805 BENACAZON (SEVILLA)',
          np: 'SEVILLA',
          nm: 'BENACAZON',
          locs: { lous: { lourb: { dp: '41805' } } },
        },
        debi: { sfc: '108', ant: '2002', luso: 'Residencial' },
        lcons: [
          { lcd: 'VIVIENDA', dt: { lourb: { loint: { pt: '00' } } }, dfcons: { stl: '44' } },
          { lcd: 'APARCAMIENTO', dt: { lourb: { loint: { pt: '00' } } }, dfcons: { stl: '20' } },
          { lcd: 'VIVIENDA', dt: { lourb: { loint: { pt: '01' } } }, dfcons: { stl: '44' } },
        ],
      } },
    },
  }));

  assert.equal(result.plantas, '2');
  assert.equal(result.construcciones.map(row => row.planta).join(','), '00,00,01');
});

test('exports internal partition mass in all CE3X general fields', () => {
  const { applyCexReplacements } = loadCexHelpers();
  const source = [
    'VCTE 2013',
    'p1',
    'aVUnifamiliar',
    'p2',
    'aVMedia',
    'p11',
    "S'masaParticiones'",
    'p5001',
    'VMedia',
    'p5002',
  ].join('\r\n');
  const next = applyCexReplacements(source, {
    data: {
      'generales.datos.normativaVigente': 'CTE 2013',
      'generales.datos.tipoEdificio': 'Unifamiliar',
      'generales.definicion.masaParticionesInternas': 'Ligera',
    },
  });

  assert.match(next, /aVLigera\r\np11/);
  assert.match(next, /S'masaParticiones'\r\np5001\r\nVLigera\r\np5002/);
  assert.doesNotMatch(next, /VMedia/);
});

test('builds estimated envelope rows from general building data', () => {
  const { estimatedEnvelopePatch } = loadCexHelpers();
  const patch = estimatedEnvelopePatch({
    'generales.definicion.superficieUtilHabitable': '152',
    'generales.definicion.numeroPlantasHabitables': '2',
    'generales.definicion.alturaLibrePlanta': '2.60',
  });

  assert.equal(patch['envolvente.cerramientos.items'].length, 5);
  assert.equal(patch['envolvente.huecos.items'].length, 10);
  assert.equal(patch['envolvente.puentesTermicos.items'].length, 8);
  assert.equal(patch['envolvente.cerramientos.items'][0].modoDefinicion, 'Por defecto');
  assert.equal(patch['envolvente.cerramientos.items'][2].modoDefinicion, 'Por defecto');
});

test('serializes CE3X envelope enclosures with editable default shapes', () => {
  const { estimatedEnvelopePatch, serializeCexCerramientosInput, serializeCexHuecosInput } = loadCexHelpers();
  const patch = estimatedEnvelopePatch({
    'generales.definicion.superficieUtilHabitable': '88',
    'generales.definicion.numeroPlantasHabitables': '2',
    'generales.definicion.alturaLibrePlanta': '2.60',
  });
  const rows = unpickleJson(serializeCexCerramientosInput(patch['envolvente.cerramientos.items']) + '.');

  assert.equal(rows[0][5], 'Techo');
  assert.equal(rows[1][5], 'Suelo');
  assert.equal(rows[0][8], 'Por defecto');
  assert.equal(rows[1][1], 'Suelo');
  assert.equal(rows[1].length, 17);
  assert.equal(rows[1][9], true);
  assert.equal(rows[2][1], 'Fachada');
  assert.equal(rows[2][5], 'NO');
  assert.equal(rows[2][8], 'Por defecto');
  assert.deepEqual(rows[2][9], []);
  assert.notEqual(rows[2][10], '');
  assert.notEqual(rows[2][11], '');

  const huecos = unpickleJson(serializeCexHuecosInput(patch['envolvente.huecos.items']) + '.');
  assert.equal(huecos[0].orientacion, 'NO');
  assert.equal(huecos[0].correctorSolar, 'NO');
});

test('builds estimated system rows from useful surface', () => {
  const { estimatedSystemsPatch } = loadCexHelpers();
  const patch = estimatedSystemsPatch({
    'generales.definicion.superficieUtilHabitable': '152',
  });

  assert.equal(patch['instalaciones.acs.items'][0].m2Cubiertos, '152');
  assert.equal(patch['instalaciones.calefaccion.items'][0].tipoGenerador, 'Bomba de Calor');
  assert.equal(patch['instalaciones.refrigeracion.items'][0].demandaCubierta, '100');
  assert.equal(patch['instalaciones.contribuciones.items'][0].nombre, 'Sin contribuciones renovables');
  assert.equal(patch['instalaciones.contribuciones.items'][0].acsRenovable, '0');
});

test('calculates heating and cooling covered surface from demand percentage', () => {
  const { coveredSurfaceForPercentage } = loadCexHelpers();

  assert.equal(coveredSurfaceForPercentage('152', '75'), '114');
  assert.equal(coveredSurfaceForPercentage('152', '50'), '76');
  assert.equal(coveredSurfaceForPercentage('149,40', '33.33'), '49.8');
  assert.equal(coveredSurfaceForPercentage('', '50'), '');
});

test('combines Catastro data with envelope and installation autocompletion', () => {
  const { catastroAutocompletionPatch } = loadCexHelpers();
  const patch = catastroAutocompletionPatch({}, {
    'generales.definicion.superficieUtilHabitable': '120',
    'generales.definicion.numeroPlantasHabitables': '2',
  });

  assert.equal(patch['generales.definicion.superficieUtilHabitable'], '120');
  assert.ok(patch['envolvente.cerramientos.items'].length > 0);
  assert.ok(patch['instalaciones.acs.items'].length > 0);
  assert.ok(patch['instalaciones.calefaccion.items'].length > 0);
  assert.ok(patch['instalaciones.refrigeracion.items'].length > 0);
});

test('uses form transport for large Catastro patches with images', () => {
  const { shouldPreferFormTransport } = loadCexHelpers();

  assert.equal(shouldPreferFormTransport({ action: 'patch', dataPatch: { image: 'x'.repeat(50001) } }), true);
  assert.equal(shouldPreferFormTransport({ action: 'patch', dataPatch: { image: 'x'.repeat(100) } }), false);
  assert.equal(shouldPreferFormTransport({ action: 'save', item: { image: 'x'.repeat(50001) } }), false);
});

test('omits zero renewable contribution rows from CEX export', () => {
  const { isUsefulCexContribution, serializeCexSystemsStream } = loadCexHelpers();

  assert.equal(isUsefulCexContribution({
    acsRenovable: '0',
    calefaccionRenovable: '0',
    refrigeracionRenovable: '0',
    calorRecuperadoAcs: '',
    calorRecuperadoCalefaccion: '',
    frioRecuperado: '',
    energiaConsumidaGeneracionElectricidad: '0',
  }), false);
  assert.equal(isUsefulCexContribution({
    acsRenovable: '20',
    calefaccionRenovable: '0',
    refrigeracionRenovable: '0',
  }), true);

  const stream = serializeCexSystemsStream([], [], [], []);
  assert.equal(stream.includes('10200'), false);
  assert.equal(stream.includes('Contribuciones energ'), false);
});

test('removes inherited improvement packages from a new CEX export', () => {
  const { stripCexImprovements } = loadCexHelpers();
  const source = readFileSync(new URL('../app/templates/base.cex', import.meta.url), 'latin1');
  const cleaned = stripCexImprovements(source);

  assert.equal(cleaned.includes('iMedidasDeMejora.objetoGrupoMejoras'), false);
  assert.equal(cleaned.includes('CONJUNTO DE MEJORAS 1'), false);
  assert.equal(cleaned.includes('CONJUNTO DE MEJORAS 2'), false);
  assert.match(cleaned, /^S'CEXv2\.3 Residencial'/);
});

test('keeps estimated envelope compatible with the CE3X reference shape', () => {
  const { estimatedEnvelopePatch } = loadCexHelpers();
  const data = {
    'generales.definicion.superficieUtilHabitable': '88',
    'generales.definicion.alturaLibrePlanta': '2.60',
    'generales.definicion.numeroPlantasHabitables': '2',
  };
  const patch = estimatedEnvelopePatch(data);

  assert.equal(patch['envolvente.cerramientos.items'].map(row => row.tipoCerramiento).join('|'), 'Cubierta|Suelo|Fachada|Fachada|Fachada');
  assert.equal(patch['envolvente.huecos.items'].map(row => row.orientacion).join('|'), 'NO|NO|SO|SO|NO|NO|SE|SE|SE|SE');
});

test('reports critical CE3X gaps before export', () => {
  const { criticalCexIssues } = loadCexHelpers();
  const issues = criticalCexIssues({ data: {} });

  assert.ok(issues.includes('Tipo de edificio'));
  assert.ok(issues.includes('Envolvente: cerramientos'));
  assert.ok(issues.includes('Instalaciones: equipo ACS'));
});

test('applies the CE3X normative rule from the construction year', () => {
  const { normativaVigenteDesdeAnio } = loadCexHelpers();

  assert.equal(normativaVigenteDesdeAnio('1952'), 'Anterior');
  assert.equal(normativaVigenteDesdeAnio('1981'), 'NBE-CT-79');
  assert.equal(normativaVigenteDesdeAnio('2006'), 'NBE-CT-79');
  assert.equal(normativaVigenteDesdeAnio('2007'), 'CTE 2006');
  assert.equal(normativaVigenteDesdeAnio('2013'), 'CTE 2006');
  assert.equal(normativaVigenteDesdeAnio('2014'), 'CTE 2013');
  assert.equal(normativaVigenteDesdeAnio(''), '');
});

test('defaults empty client contact fields to a dot', () => {
  const { normalizeRecord } = loadCexHelpers();
  const record = normalizeRecord({ data: {
    'admin.cliente.telefono': '',
    'admin.cliente.email': '',
  } });

  assert.equal(record.data['admin.cliente.telefono'], '.');
  assert.equal(record.data['admin.cliente.email'], '.');
  assert.equal(normalizeRecord({ data: {
    'admin.cliente.telefono': '600123123',
    'admin.cliente.email': 'cliente@example.com',
  } }).data['admin.cliente.telefono'], '600123123');
});

test('defaults empty internal partition mass to light', () => {
  const { normalizeRecord } = loadCexHelpers();
  assert.equal(normalizeRecord({ data: {} }).data['generales.definicion.masaParticionesInternas'], 'Ligera');
  assert.equal(normalizeRecord({ data: {
    'generales.definicion.masaParticionesInternas': 'Pesada',
  } }).data['generales.definicion.masaParticionesInternas'], 'Pesada');
});

test('maps Catastro data and fills reviewable CE3X estimates', () => {
  const { catastroPatchFromData } = loadCexHelpers();
  const patch = catastroPatchFromData({
    referenciaCatastral: '0128501TG4302N0037ZI',
    direccion: 'Calle Real 1',
    provincia: 'SEVILLA',
    localidad: 'Dos Hermanas',
    codigoPostal: '41704',
    uso: 'Residencial',
    superficieCatastral: '120',
    anioConstruccion: '1998',
    x: '-5.93289982319168',
    y: '37.3044423187296',
    srs: 'EPSG:4326',
    imagenEdificio: 'data:image/jpeg;base64,/9j/BUILDINGIMAGE',
    planoSituacion: 'data:image/png;base64,iVBORw0KGgoCATASTROMAP',
    construcciones: [
      { destino: 'VIVIENDA', superficie: '17', planta: '-1' },
      { destino: 'VIVIENDA', superficie: '75', planta: '00' },
      { destino: 'VIVIENDA', superficie: '73', planta: '01' },
      { destino: 'ALMACEN', superficie: '14' },
    ],
  });

  assert.equal(patch['admin.localizacion.referenciaCatastral'], '0128501TG4302N0037ZI');
  assert.equal(patch['generales.definicion.superficieUtilHabitable'], '165');
  assert.equal(patch['generales.definicion.numeroPlantasHabitables'], '3');
  assert.equal(patch['generales.definicion.alturaLibrePlanta'], '2.70');
  assert.equal(patch['generales.definicion.ventilacionInmueble'], '0.63');
  assert.equal(patch['generales.definicion.demandaDiariaACS'], '120');
  assert.equal(patch['generales.definicion.imagenEdificio'], 'data:image/jpeg;base64,/9j/BUILDINGIMAGE');
  assert.equal(patch.superficieCatastral, '120');
  assert.equal(patch.uso, 'Residencial');
  assert.equal(patch['catastro.x'], '-5.93289982319168');
  assert.equal(patch['catastro.y'], '37.3044423187296');
  assert.equal(patch['catastro.srs'], 'EPSG:4326');
  assert.equal(patch['catastro.reference'], '0128501TG4302N0037ZI');
  assert.equal(patch['catastro.superficiePlantaInferior'], '17');
  assert.equal(patch['catastro.superficiePlantaMayor'], '75');
  assert.equal(patch['generales.definicion.planoSituacion'], 'data:image/png;base64,iVBORw0KGgoCATASTROMAP');
  assert.equal(patch['generales.datos.normativaVigente'], 'NBE-CT-79');
});

test('uses the lowest and largest Catastro floor surfaces for soil and roof', () => {
  const { estimatedEnvelopePatch } = loadCexHelpers();
  const patch = estimatedEnvelopePatch({
    'generales.definicion.superficieUtilHabitable': '165',
    'generales.definicion.numeroPlantasHabitables': '3',
    'generales.definicion.alturaLibrePlanta': '2.70',
    'catastro.superficiePlantaInferior': '17',
    'catastro.superficiePlantaMayor': '75',
  });
  const byType = Object.fromEntries(patch['envolvente.cerramientos.items'].map(item => [item.tipoCerramiento, item]));
  assert.equal(byType.Suelo.superficie, '17');
  assert.equal(byType.Cubierta.superficie, '75');
});

test('uses the Catastro neighbour heuristic to choose exposed facade count', () => {
  const { estimatedEnvelopePatch } = loadCexHelpers();
  const patch = estimatedEnvelopePatch({
    'generales.definicion.superficieUtilHabitable': '165',
    'generales.definicion.numeroPlantasHabitables': '3',
    'catastro.superficiePlantaInferior': '17',
    'catastro.superficiePlantaMayor': '75',
    'catastro.fachadasExpuestas': '2',
  });
  assert.equal(patch['envolvente.cerramientos.items'].filter(item => item.tipoCerramiento === 'Fachada').length, 2);
  assert.equal(patch['envolvente.huecos.items'].every(item => ['Muro de fachada NO', 'Muro de fachada SE'].includes(item.cerramientoAsociado)), true);
  assert.ok(patch['envolvente.huecos.items'].length >= 6);
  assert.ok(patch['envolvente.huecos.items'].every(item => Number(item.superficie) > 0 && Number(item.altura) > 0));
});

test('builds the Catastro cartography link from the expediente', () => {
  const { catastroCartographyUrl, catastro3dUrl } = loadCexHelpers();
  const withCoordinates = catastroCartographyUrl({
    data: {
      'admin.localizacion.referenciaCatastral': '8676623QB4387N0001EU',
      'catastro.x': '-5.983',
      'catastro.y': '37.389',
      'catastro.srs': 'EPSG:4326',
    },
  });
  assert.match(withCoordinates, /mapa\.aspx\?refcat=8676623QB4387N0001EU/);
  assert.match(withCoordinates, /x=-5\.983/);
  assert.match(withCoordinates, /y=37\.389/);

  const withoutCoordinates = catastroCartographyUrl({
    data: {
      'admin.localizacion.referenciaCatastral': '8676623QB4387N0001EU',
      'admin.localizacion.provincia': 'Sevilla',
      'admin.localizacion.localidad': 'Sevilla',
    },
  });
  assert.equal(
    withoutCoordinates,
    'https://www1.sedecatastro.gob.es/Cartografia/mapa.aspx?del=41&mun=15&refcat=8676623QB4387N0001EU&final=&ZV=NO&anyoZV=',
  );
  assert.equal(
    catastro3dUrl({
      data: {
        'admin.localizacion.referenciaCatastral': '8676623QB4387N0001EU',
        'admin.localizacion.provincia': 'Sevilla',
        'admin.localizacion.localidad': 'Sevilla',
      },
    }),
    'https://www1.sedecatastro.gob.es/Cartografia/FXCC/Visor3D.aspx?del=41&mun=15&refcat=8676623QB4387N0001EU&final=',
  );

  assert.equal(catastroCartographyUrl({ data: { 'admin.localizacion.referenciaCatastral': 'incompleta' } }), '');
  assert.equal(catastro3dUrl({ data: { 'admin.localizacion.referenciaCatastral': 'incompleta' } }), '');
});

test('infers residential floors from construction rows when Catastro does not provide floor labels', () => {
  const { catastroPatchFromData } = loadCexHelpers();
  const patch = catastroPatchFromData({
    uso: 'Residencial',
    superficieCatastral: '240',
    construcciones: [
      { destino: 'VIVIENDA', superficie: '17' },
      { destino: 'VIVIENDA', superficie: '75' },
      { destino: 'VIVIENDA', superficie: '73' },
      { destino: 'APARCAMIENTO', superficie: '31' },
    ],
  });

  assert.equal(patch['generales.definicion.numeroPlantasHabitables'], '3');
});

test('uses the explicit Catastro residential floor count when available', () => {
  const { catastroPatchFromData } = loadCexHelpers();
  const patch = catastroPatchFromData({
    uso: 'Residencial',
    plantas: '2',
    construcciones: [{ destino: 'VIVIENDA', superficie: '108' }],
  });

  assert.equal(patch['generales.definicion.numeroPlantasHabitables'], '2');
});

test('keeps Catastro residential imports usable when construction rows are missing', () => {
  const { catastroPatchFromData } = loadCexHelpers();
  const patch = catastroPatchFromData({
    uso: 'Residencial',
    superficieCatastral: '108',
    anioConstruccion: '2002',
  });

  assert.equal(patch['generales.definicion.numeroPlantasHabitables'], '1');
});

test('keeps existing values when applying Catastro only to empty fields', () => {
  const { emptyOnlyPatch } = loadCexHelpers();
  const filtered = emptyOnlyPatch(
    {
      direccion: 'Resumen existente',
      data: {
        'admin.localizacion.direccion': 'Direccion existente',
        'generales.definicion.superficieUtilHabitable': '',
      },
    },
    {
      direccion: 'Resumen Catastro',
      'admin.localizacion.direccion': 'Direccion Catastro',
      'generales.definicion.superficieUtilHabitable': '106',
    },
  );

  assert.deepEqual(JSON.parse(JSON.stringify(filtered)), {
    'generales.definicion.superficieUtilHabitable': '106',
  });
});

test('allows Catastro image data to replace non-image placeholders', () => {
  const { emptyOnlyPatch } = loadCexHelpers();
  const filtered = emptyOnlyPatch(
    {
      data: {
        'generales.definicion.planoSituacion': 'Catastro: 7150427TG3475S0001RG',
      },
    },
    {
      'generales.definicion.planoSituacion': 'data:image/png;base64,iVBORw0KGgoREALPLAN',
    },
  );

  assert.equal(
    filtered['generales.definicion.planoSituacion'],
    'data:image/png;base64,iVBORw0KGgoREALPLAN',
  );
});

test('verifies flat Google Sheet fields outside nested CE3X data', () => {
  const { storedValueForPatchPath } = loadCexHelpers();
  const record = {
    uso: 'Residencial',
    superficieCatastral: '120',
    data: {
      'generales.definicion.superficieUtilHabitable': '106',
    },
  };

  assert.equal(storedValueForPatchPath(record, 'uso'), 'Residencial');
  assert.equal(storedValueForPatchPath(record, 'superficieCatastral'), '120');
  assert.equal(storedValueForPatchPath(record, 'generales.definicion.superficieUtilHabitable'), '106');
});

test('stores long image fields across multiple Google Sheet cells', () => {
  const { HEADERS, recordToRow_, rowToRecord_ } = loadAppsScriptHelpers();
  const image = 'data:image/png;base64,' + 'A'.repeat(120000);
  const row = recordToRow_({
    id: 'exp-long-image',
    data: {
      'generales.definicion.planoSituacion': image,
    },
  });

  const planCells = HEADERS
    .map((header, index) => [header, row[index]])
    .filter(([header]) => String(header).startsWith('generales.definicion.planoSituacion'));

  assert.ok(planCells.length > 1);
  assert.ok(planCells.every(([, value]) => String(value || '').length < 50000));

  const restored = rowToRecord_(row, HEADERS);
  assert.equal(restored.data['generales.definicion.planoSituacion'], image);
});

test('embeds building and situation plan images into CEX pickle text', () => {
  const { applyCexEmbeddedImageReplacements } = loadCexHelpers();
  const source = [
    "S'imagen'",
    'p1',
    "S'OLD_IMAGE_BASE64'",
    'p2',
    "S'plano'",
    'p3',
    "S'OLD_PLAN_BASE64'",
    'p4',
  ].join('\n');
  const next = applyCexEmbeddedImageReplacements(source, {
    data: {
      'generales.definicion.imagenEdificio': 'data:image/png;base64,iVBORw0KGgoNEWIMAGEBASE64',
      'generales.definicion.planoSituacion': 'data:image/png;base64,iVBORw0KGgoNEWPLANBASE64',
    },
  });

  assert.match(next, /S'iVBORw0KGgoNEWIMAGEBASE64'/);
  assert.match(next, /S'iVBORw0KGgoNEWPLANBASE64'/);
  assert.doesNotMatch(next, /OLD_IMAGE_BASE64/);
  assert.doesNotMatch(next, /OLD_PLAN_BASE64/);
});

test('embeds images when CEX pickle text uses CRLF line endings', () => {
  const { applyCexEmbeddedImageReplacements } = loadCexHelpers();
  const source = [
    "S'imagen'",
    'p4696',
    "S'OLD_IMAGE_BASE64'",
    'p4697',
    "S'plano'",
    'p5076',
    "S'OLD_PLAN_BASE64'",
    'p5077',
  ].join('\r\n');
  const next = applyCexEmbeddedImageReplacements(source, {
    data: {
      'generales.definicion.imagenEdificio': 'data:image/jpeg;base64,/9j/NEWIMAGEBASE64',
      'generales.definicion.planoSituacion': 'data:image/png;base64,iVBORw0KGgoNEWPLANBASE64',
    },
  });

  assert.match(next, /S'\/9j\/NEWIMAGEBASE64'/);
  assert.match(next, /S'iVBORw0KGgoNEWPLANBASE64'/);
  assert.doesNotMatch(next, /OLD_IMAGE_BASE64/);
  assert.doesNotMatch(next, /OLD_PLAN_BASE64/);
});

test('embeds images into top-level CE3X preview copies as well as keyed fields', () => {
  const { applyCexEmbeddedImageReplacements } = loadCexHelpers();
  const oldImage = 'iVBORw0KGgo' + 'A'.repeat(1200);
  const oldPlan = 'iVBORw0KGgo' + 'B'.repeat(1200);
  const source = [
    "S'" + oldImage + "'",
    'p16',
    'a',
    "S'" + oldPlan + "'",
    'p17',
    'a',
    "S'imagen'",
    'p4696',
    "S'" + oldImage + "'",
    "S'plano'",
    'p5076',
    "S'" + oldPlan + "'",
  ].join('\r\n');
  const next = applyCexEmbeddedImageReplacements(source, {
    data: {
      'generales.definicion.imagenEdificio': 'data:image/jpeg;base64,/9j/NEWIMAGEBASE64',
      'generales.definicion.planoSituacion': 'data:image/png;base64,iVBORw0KGgoNEWPLANBASE64',
    },
  });

  assert.equal((next.match(/\/9j\/NEWIMAGEBASE64/g) || []).length, 2);
  assert.equal((next.match(/iVBORw0KGgoNEWPLANBASE64/g) || []).length, 2);
  assert.doesNotMatch(next, new RegExp(oldImage));
  assert.doesNotMatch(next, new RegExp(oldPlan));
});

test('builds situation plan model from Catastro patch data', () => {
  const { catastroSituationPlanModel } = loadCexHelpers();
  const model = catastroSituationPlanModel({
    'admin.localizacion.referenciaCatastral': '0128501TG4302N0004BU',
    'admin.localizacion.direccion': 'PL SEN-1 ENTRENUCLEOS 40(D)',
    'admin.localizacion.localidad': 'Dos Hermanas',
    'catastro.x': '-5.93289982319168',
    'catastro.y': '37.3044423187296',
    'catastro.srs': 'EPSG:4326',
  });

  assert.equal(model.reference, '0128501TG4302N0004BU');
  assert.equal(model.title, 'Plano de situación');
  assert.equal(model.subtitle, 'PL SEN-1 ENTRENUCLEOS 40(D), Dos Hermanas');
  assert.equal(model.x, '-5.93289982319168');
  assert.equal(model.y, '37.3044423187296');
});

test('rejects Catastro responses without building data', () => {
  const { hasUsefulCatastroData } = loadCexHelpers();

  assert.equal(hasUsefulCatastroData({
    referenciaCatastral: '0128501TG4302N0004BU',
    x: '-5.93289982319168',
    y: '37.3044423187296',
  }), false);
  assert.equal(hasUsefulCatastroData({
    referenciaCatastral: '0128501TG4302N0004BU',
    direccion: 'PL SEN-1 ENTRENUCLEOS 40(D)',
  }), true);
});
