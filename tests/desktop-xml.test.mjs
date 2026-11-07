import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

for (const issue of [false, true]) test(issue ? 'issue files are archived under the reference and XML supplies the rating' : 'desktop XML handoff publishes readiness and downloads the new XML', async () => {
  const source = readFileSync(new URL('../app/app.js', import.meta.url), 'utf8');
  const start = source.indexOf('function renderDesktopReportFlow(');
  const end = source.indexOf('async function loadCex32Template()', start);
  assert.ok(start >= 0 && end > start);
  const calls = [];
  const button = {};
  const status = {};
  const xml = new Blob(['<DatosEnergeticosDelEdificio/>']);
  const pdf = new Blob(['%PDF-1.7']);
  const reference = '00000000000000000000';
  const results = new Map();
  let firstRead = true;
  const job = {
    async getFileHandle(name, options) {
      calls.push(name);
      if (name === 'example.cex' || name === 'report.json' || name === 'example.pdf') {
        assert.equal(options.create, true);
        return {createWritable: async () => ({
          write: async content => calls.push(content),
          close: async () => calls.push('closed')
        })};
      }
      if (name === 'ready') {
        assert.equal(options.create, true);
        assert.equal(calls.at(-2), 'closed');
        return {};
      }
      assert.equal(name, 'example.xml');
      if (firstRead) {
        firstRead = false;
        throw Object.assign(new Error(), {name: 'NotFoundError'});
      }
      return {getFile: async () => xml};
    }
  };
  await vm.runInNewContext(source.slice(start, end) + '\ncollectDesktopXml(' + issue + ')', {
    selectedRecordWithCurrentFormData: () => ({id:'example',data:{'admin.localizacion.referenciaCatastral': reference,'admin.informe.fechaVisita':'2026-11-05','admin.informe.observaciones':'Prueba'}}),
    criticalCexIssues: () => [], missingSections: () => [], renderRecords() {},
    desktopXmlButton: button, issueDesktopReportBtn: {},
    desktopReportResults: results, selectedRecord: () => null,
    location: {hostname: 'evaristosaa.github.io'}, state: {config: {pdfKey: 'test'}},
    generateCertificatePdf: async file => { assert.equal(file, xml); return pdf; },
    CustomEvent: class {
      constructor(type, {detail}) { Object.assign(this, {type, detail}); }
    },
    document: {
      querySelector: selector => selector === '#desktopXmlStatus' ? status : {},
      dispatchEvent(event) {
        assert.equal(event.type, 'ce3x:xml-collected');
        assert.equal(event.detail, xml);
        calls.push('prepare:pdf');
      }
    },
    xmlFolderSetting: async () => ({
      queryPermission: async () => 'granted',
      getFileHandle: async name => assert.equal(name, '.ce3x-xml-bridge'),
      getDirectoryHandle: async name => {
        if (issue) {
          assert.equal(name, 'example [' + reference + ']');
          return {getDirectoryHandle: async nested => {
            assert.equal(nested, 'CE3X-unique');
            return job;
          }};
        }
        assert.equal(name, 'CE3X-unique');
        return job;
      }
    }),
    crypto: {randomUUID: () => 'unique'},
    normalizeCexLineEndings: value => value,
    buildCex32: () => 'cex bytes',
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
    setTimeout: callback => callback()
  });
  assert.deepEqual(calls, ['example.cex', 'cex bytes', 'closed', 'report.json',
    JSON.stringify({issueDate: '', visitDate: '2026-11-05', observations: 'Prueba', recommendations: '', documentation: '', autoSubmit: issue, acceptNoImprovements: false}),
    'closed', 'ready', 'example.xml', 'example.xml',
    ...(issue ? ['example.pdf', pdf, 'closed'] : ['download:example.xml', 'prepare:pdf'])]);
  assert.equal(button.disabled, false);
  assert.equal(results.get('example').rating[0].value, '58.03');
  assert.equal(results.get('example').rating[0].grade, 'E');
  assert.match(status.textContent, issue ? /CEX, XML y PDF guardados/ : /XML recogido/);
});
