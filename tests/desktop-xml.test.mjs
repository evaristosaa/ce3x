import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

test('desktop XML handoff publishes readiness after writing the CEX and downloads the new XML', async () => {
  const source = readFileSync(new URL('../app/app.js', import.meta.url), 'utf8');
  const start = source.indexOf('function renderDesktopReportFlow(');
  const end = source.indexOf('async function loadCex32Template()', start);
  assert.ok(start >= 0 && end > start);
  const calls = [];
  const button = {};
  const status = {};
  const xml = new Blob(['<DatosEnergeticosDelEdificio/>']);
  let firstRead = true;
  const job = {
    async getFileHandle(name, options) {
      calls.push(name);
      if (name === 'example.cex' || name === 'report.json') {
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
  await vm.runInNewContext(source.slice(start, end) + '\ncollectDesktopXml()', {
    selectedRecordWithCurrentFormData: () => ({id:'example',data:{'admin.informe.fechaVisita':'2026-11-05','admin.informe.observaciones':'Prueba'}}),
    criticalCexIssues: () => [],
    desktopXmlButton: button, issueDesktopReportBtn: {},
    desktopReportResults: new Map(), selectedRecord: () => null,
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
        return {documentElement: {localName: 'DatosEnergeticosDelEdificio'}, getElementsByTagName: () => []};
      }
    },
    downloadBlob(file, name) {
      assert.equal(file, xml);
      calls.push('download:' + name);
    },
    setTimeout: callback => callback()
  });
  assert.deepEqual(calls, ['example.cex', 'cex bytes', 'closed', 'report.json', '{"visitDate":"2026-11-05","observations":"Prueba","autoSubmit":false}', 'closed', 'ready', 'example.xml', 'example.xml', 'download:example.xml', 'prepare:pdf']);
  assert.equal(button.disabled, false);
  assert.match(status.textContent, /XML recogido/);
});


