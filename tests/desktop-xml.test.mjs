import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

for (const issue of [false, true]) test(issue ? 'issue files are archived under the reference and XML supplies the rating' : 'desktop XML handoff publishes readiness and downloads the new XML', async () => {
  const source = readFileSync(new URL('../app/app.js', import.meta.url), 'utf8');
  const start = source.indexOf('function certificateResult(');
  const end = source.indexOf('async function loadCex32Template()', start);
  assert.ok(start >= 0 && end > start);
  const calls = [];
  const button = {};
  const status = {};
  const xml = new Blob(['<DatosEnergeticosDelEdificio/>']);
  const pdf = new Blob(['%PDF-1.7']);
  const reference = '00000000000000000000';
  const results = new Map();
  const stem = issue ? 'example_1970-01-01-00-00-00_CE3X-unique' : 'example';
  const sidecar = issue ? stem + '.report.json' : 'report.json';
  const ready = issue ? stem + '.ready' : 'ready';
  let saved;
  const record = {id:'example',data:{'admin.localizacion.referenciaCatastral': reference,'admin.informe.fechaVisita':'2026-11-05','admin.informe.observaciones':'Prueba'}};
  const operationMessages = [];
  let firstRead = true;
  let elapsed = 0;
  const job = {
    async getFileHandle(name, options) {
      calls.push(name);
      if (name === stem + '.cex' || name === sidecar || name === stem + '.pdf') {
        assert.equal(options.create, true);
        return {createWritable: async () => ({
          write: async content => calls.push(content),
          close: async () => calls.push('closed')
        })};
      }
      if (name === ready) {
        assert.equal(options.create, true);
        assert.equal(calls.at(-2), 'closed');
        return {};
      }
      assert.equal(name, stem + '.xml');
      if (firstRead) {
        firstRead = false;
        throw Object.assign(new Error(), {name: 'NotFoundError'});
      }
      return {getFile: async () => xml};
    }
  };
  await vm.runInNewContext(source.slice(start, end) + '\ncollectDesktopXml(' + issue + ')', {
    selectedRecordWithCurrentFormData: () => record,
    renderDetail() {},
    saveLocalWorkspace: next => { saved = next; },
    criticalCexIssues: () => [], generationBlockers: () => "", renderRecords() {},
    desktopXmlButton: button, issueDesktopReportBtn: {}, issueWithoutImprovements: {},
    showOperation: (title, message, busy = true) => operationMessages.push({title, message, busy}),
    desktopReportResults: results, selectedRecord: () => null,
    location: {hostname: 'evaristosaa.github.io'}, state: {config: {pdfKey: 'test'}, records: [record]},
    generateCertificatePdf: async file => { assert.equal(file, xml); return pdf; },
    CustomEvent: class {
      constructor(type, {detail}) { Object.assign(this, {type, detail}); }
    },
    document: {
      querySelector: selector => selector === '#desktopXmlStatus' ? status : {close() {}},
      dispatchEvent(event) {
        assert.equal(event.type, 'ce3x:xml-collected');
        assert.equal(event.detail, xml);
        calls.push('prepare:pdf');
      }
    },
    xmlFolderSetting: async () => ({
      queryPermission: async () => 'granted',
      getFileHandle: async name => assert.equal(name, issue ? '.ce3x-xml-bridge-v2' : '.ce3x-xml-bridge'),
      getDirectoryHandle: async name => {
        if (issue) {
          assert.equal(name, 'example [' + reference + ']');
          return job;
        }
        assert.equal(name, 'CE3X-unique');
        return job;
      }
    }),
    crypto: {randomUUID: () => 'unique'},
    normalizeCexLineEndings: value => value,
    buildCex32: () => 'cex bytes',
    embeddedImageBase64: () => '',
    loadCex32Template: async () => '',
    fileSafe: value => value,
    recordLabel: () => 'example',
    latin1Encode: value => value,
    DOMParser: class {
      parseFromString() {
        const node = (localName, children = [], textContent = '') => ({localName, children, textContent});
        return {documentElement: node('DatosEnergeticosDelEdificio', [
          node('Indicadores', [node('Emisiones', [node('Tot', [], '58.03')])]),
          node('Calificacion', [node('Emisiones', [node('Tot', [], 'E')])])
        ]), getElementsByTagName: () => []};
      }
    },
    downloadBlob(file, name) {
      assert.equal(file, name.endsWith('.pdf') ? pdf : xml);
      calls.push('download:' + name);
    },
    Date: Object.assign(class extends Date {}, {now: () => elapsed}),
    setTimeout: callback => { elapsed += 7 * 60 * 1000; callback(); }
  });
  assert.deepEqual(calls, [stem + '.cex', 'cex bytes', 'closed', sidecar,
    JSON.stringify({issueDate: '', visitDate: '2026-11-05', observations: 'Prueba', recommendations: '', documentation: '', autoSubmit: issue, acceptNoImprovements: false}),
    'closed', ready, stem + '.xml', stem + '.xml',
    ...(issue ? [stem + '.pdf', pdf, 'closed'] : ['download:example.xml', 'prepare:pdf'])]);
  if (issue) {
    const latest = saved.data['informe.ultimaEmision'];
    assert.equal(latest.name, stem);
    assert.equal(latest.folder, 'example [' + reference + ']');
    assert.equal(latest.rating[0].grade, 'E');
  }
  assert.equal(button.disabled, false);
  assert.equal(elapsed, 7 * 60 * 1000);
  assert.equal(operationMessages[0].busy, true);
  if (issue) assert.equal(operationMessages.at(-1).busy, false);
  assert.equal(results.get('example').rating[0].value, '58.03');
  assert.equal(results.get('example').rating[0].grade, 'E');
  assert.match(status.textContent, issue ? /CEX, XML y PDF guardados/ : /XML recogido/);
});


test('home state uses the persisted certificate after reload', () => {
  const source = readFileSync(new URL('../app/app.js', import.meta.url), 'utf8');
  const getFunction = (name, next) => source.slice(source.indexOf('function ' + name + '('), source.indexOf(next));
  const context = vm.createContext({inferStatus: record => record.estado});
  vm.runInContext(getFunction('displayRecordStatus', 'function inferStatus(')
    + getFunction('certificateResult', 'async function openCertificateFolder('), context);
  const persisted = {estado: 'COMPLETA', data: {
    'informe.ultimaEmision': {folder: 'Zaragoza', name: 'Zaragoza_v2', rating: []}
  }};
  assert.equal(context.displayRecordStatus(JSON.parse(JSON.stringify(persisted))), 'CERTIFICADO_GENERADO');
  assert.equal(context.displayRecordStatus({estado: 'COMPLETA'}), 'COMPLETA');
  assert.equal(context.displayRecordStatus({estado: 'BORRADOR'}), 'PENDIENTE_DATOS');
});


test('generation lists record, report and configuration blockers together', async () => {
  const source = readFileSync(new URL('../app/app.js', import.meta.url), 'utf8');
  const status = {};
  const messages = [];
  await vm.runInNewContext(source.slice(source.indexOf('async function desktopReportFolder('),
    source.indexOf('async function loadCex32Template()')) + '\ncollectDesktopXml(true)', {
    selectedRecordWithCurrentFormData: () => ({data: {'admin.localizacion.referenciaCatastral': 'INVALIDA'}}),
    document: {querySelector: () => status},
    criticalCexIssues: () => ['Superficie'],
    generationBlockers: () => 'NIF del cliente\nACS estimado',
    showOperation: (title, message) => messages.push(message),
    location: {hostname: 'evaristosaa.github.io'}, state: {config: {}},
    xmlFolderSetting: async () => null,
  });
  assert.equal(messages.length, 1);
  for (const issue of ['NIF del cliente', 'ACS estimado', 'Superficie', 'referencia catastral',
    'fecha de visita', 'comprobaciones', 'clave de Render', 'carpeta de trabajo']) {
    assert.ok(messages[0].includes(issue), issue);
  }
});


test('export converts and reduces JPEG images without changing the saved record', async () => {
  const source = readFileSync(new URL('../app/app.js', import.meta.url), 'utf8');
  const path = 'generales.definicion.imagenEdificio';
  const record = {data:{[path]:'/9j/example'}};
  const prefix='data:image/png;base64,';
  const sizes=[];
  let closed=false;
  const canvas={width:0,height:0,getContext:()=>({drawImage(){}}),toDataURL:()=>{
    sizes.push(canvas.width);
    return prefix + 'A'.repeat(canvas.width>500 ? 100000 : 100);
  }};
  const result=await vm.runInNewContext(source.slice(source.indexOf('async function buildCex32ForExport('),
    source.indexOf('async function loadCex32Template(')) + '\nbuildCex32ForExport(record)', {
    record, embeddedImageBase64:value=>value||'',
    fetch:async url=>{assert.match(url,/^data:image\/jpeg/);return {blob:async()=>({})};},
    createImageBitmap:async()=>({width:640,height:480,close(){closed=true;}}),
    document:{createElement:()=>canvas},
    loadCex32Template:async()=>'',buildCex32:(_,next)=>next
  });
  assert.deepEqual(sizes,[640,448]);
  assert.equal(result.data[path],prefix+'A'.repeat(100));
  assert.equal(record.data[path],'/9j/example');
  assert.ok(closed);
});
