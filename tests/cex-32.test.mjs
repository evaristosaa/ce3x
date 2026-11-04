import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

export function loadHelpers() {
  const noop = {addEventListener(){},appendChild(){},close(){},querySelector(){return noop},remove(){},showModal(){},style:{}};
  const context = {structuredClone, Blob, TextDecoder, TextEncoder, URL, URLSearchParams, setTimeout,
    alert(){}, document:{body:noop,createElement(){return noop},querySelector(){return noop}},
    localStorage:{getItem(){return null},setItem(){},removeItem(){}},navigator:{},
    window:{addEventListener(){},crypto:{randomUUID:()=> 'test-id'},location:{protocol:'http:',search:''},setTimeout}};
  context.globalThis=context; vm.createContext(context);
  let app=readFileSync(new URL('../app/app.js',import.meta.url),'utf8');
  for(const call of ['cleanupLocalDataStorage();','renderTabs();','renderStorageMode();','loadRecords();']) app=app.replace(call,'');
  const source = ['cex-import.js','cex-32.js'].map(name=>readFileSync(new URL('../app/'+name,import.meta.url),'utf8')).join('\n');
  vm.runInContext(source+'\n'+app+'\nglobalThis.h={parseCexRecordData,buildCex32,cex32Blocks,cex32Serialize,normalizeRecord,cex32Snapshot};',context);
  return context.h;
}

const template=readFileSync(new URL('../app/templates/base-3.2.cex',import.meta.url),'latin1');
const plain=value=>JSON.parse(JSON.stringify(value));

function nativeFixture(h) {
  const values=h.cex32Blocks(template).map(block=>block.value);
  Object.assign(values[1],{0:'Edificio de prueba',1:'Calle Ensayo 1',2:'Otro',3:'Sevilla',4:'BENACAZON',14:'41805',15:['00000000000000000000'],26:'Ninguna',28:'ResidencialPrivado'});
  Object.assign(values[2],{0:'C.T.E.',1:'Unifamiliar',2:'Sevilla',3:'Otro',4:'B4',5:'V',6:'114',7:'2.7',8:'2',9:'100',12:'BENACAZON',19:'2007',22:'104',23:'1',24:'0',25:'2'});
  values[3][0]=[['Cubierta','Cubierta','59',.45,344,'Techo','','Sin patrón','Por defecto',['Cubierta inclinada'],'','','1','Edificio Objeto','aire']];
  values[3][1]=[{__cexClass:'Envolvente.objetosEnvolvente.HuecoEstimadas',descripcion:'Ventana',cerramientoAsociado:'Cubierta',superficie:'2',longitud:'1',altura:'2',multiplicador:'1',Uvidrio:3.3,Gvidrio:.75,Umarco:4,porcMarco:'20',absortividadValor:'.3',permeabilidadValor:'50',orientacion:'SE',patronSombras:'Sin patrón',elementosProteccionSolar:['dato que debe conservarse'],tipoVidrio:'Doble',tipoMarco:'Metálico con RPT'}];
  values[4][0]=[['ACS','ACS',[77.2,'',''],'Caldera Estándar','GLP',[['114','100'],['',''],['','']],'Estimado según Instalación',['Bien aislada y mantenida','90','0.2','24',[0,0,1]],[0],'Edificio Objeto']];
  values[4][3]=[['Clima','climatizacion',['',153,113.9],'Bomba de Calor','Electricidad',[['',''],['76.73','67.31'],['76.73','67.31']],'Estimado según Instalación',[['','220','200'],[0,1,0],[],0],['','3000','3000'],'Edificio Objeto']];
  return h.cex32Blocks(template)[0].text + values.slice(1).map(v=>h.cex32Serialize(v)+'.').join('');
}

test('native 3.2 template has 15 blocks and no inherited envelope, systems or improvements',()=>{
  const h=loadHelpers(), blocks=h.cex32Blocks(template);
  assert.equal(blocks.length,15);assert.equal(blocks[0].value,'CE3Xv3.2 Residencial');
  assert.equal(blocks[1].value.length,29);assert.equal(blocks[2].value.length,26);
  assert.equal(blocks[4].value.length,14);assert.ok(blocks[4].value.every(row=>row.length===0));assert.equal(blocks[5].value.length,0);
});
test('3.2 import retains Otro locality, new fields, unknown inputs and climate power slots',()=>{
  const h=loadHelpers(), data=h.parseCexRecordData(nativeFixture(h));
  assert.equal(data['admin.localizacion.localidad'],'BENACAZON');assert.equal(data['generales.datos.localidad'],'BENACAZON');
  assert.equal(data['cex.sourceVersion'],'3.2');assert.equal(data['admin.localizacion.gradoProteccion'],'Ninguna');
  assert.equal(data['instalaciones.calefaccion.items'][0].zona,'Edificio Objeto');
  assert.equal(data['instalaciones.acs.items'][0].acumulacion,'No');
  assert.equal(JSON.parse(data['cex.nativeInputs']).inputs[1][22],'104');
});
test('3.2 round trip preserves native envelope, solar protection and estimated installations',()=>{
  const h=loadHelpers(), source=nativeFixture(h), data=h.parseCexRecordData(source);
  const output=h.buildCex32(template,{data}), before=h.cex32Blocks(source), after=h.cex32Blocks(output);
  assert.deepEqual(plain(after[3].value),plain(before[3].value));assert.deepEqual(plain(after[4].value),plain(before[4].value));
  assert.equal(after[2].value[22],'104');assert.equal(after[5].value.length,0);assert.equal(after.length,15);
});
test('changing administrative data does not mutate the imported climate configuration',()=>{
  const h=loadHelpers(), data=h.parseCexRecordData(nativeFixture(h));data['admin.localizacion.direccion']='Calle Nueva 8';
  const blocks=h.cex32Blocks(h.buildCex32(template,{data}));
  assert.equal(blocks[1].value[1],'Calle Nueva 8');assert.equal(blocks[4].value[3][0][8][1],'3000');
});

test('client identity survives import, editing and native 3.2 export',()=>{
  const h=loadHelpers(), blocks=h.cex32Blocks(nativeFixture(h));
  blocks[1].value[6]='00000000T';
  const source=blocks[0].text+blocks.slice(1).map(b=>h.cex32Serialize(b.value)+'.').join('');
  const data=h.parseCexRecordData(source);
  assert.equal(data['admin.cliente.nif'],'00000000T');
  data['admin.cliente.nif']='X0000000T';
  assert.equal(h.cex32Blocks(h.buildCex32(template,{data}))[1].value[6],'X0000000T');
});

test('new records never inherit a real technician identity from the public bundle',()=>{
  const h=loadHelpers(), record=h.normalizeRecord({data:{}});
  for(const key of ['nombre','nif','direccion','telefono','email']) {
    assert.ok(!record.data['admin.tecnico.'+key]);
  }
  const existing=h.normalizeRecord({data:{'admin.tecnico.nombre':'Técnico de prueba','admin.tecnico.nif':'00000000T'}});
  assert.equal(existing.data['admin.tecnico.nombre'],'Técnico de prueba');
  assert.equal(existing.data['admin.tecnico.nif'],'00000000T');
});

test('every editable scalar field has a Google Sheets storage column',()=>{
  const app=readFileSync(new URL('../app/app.js',import.meta.url),'utf8');
  const sheet=readFileSync(new URL('../google-apps-script/Code.gs',import.meta.url),'utf8');
  const context={};vm.createContext(context);
  vm.runInContext(sheet+'\nglobalThis.headers=HEADERS;',context);
  const groupPattern=/group\('([^']+)'[^\n]*\[([\s\S]*?)(?=\n    \]\),)/g;
  const sectionPattern=/section\('([^']+)'/g;
  for(const match of app.matchAll(groupPattern)) {
    const section=[...app.slice(0,match.index).matchAll(sectionPattern)].at(-1)?.[1];
    for(const field of match[2].matchAll(/field\('([^']+)'/g)) {
      const path=section+'.'+match[1]+'.'+field[1];
      assert.ok(context.headers.includes(path),'Missing sheet column '+path);
    }
  }
});
test('editing an imported window retains its solar protection',()=>{
  const h=loadHelpers(),data=h.parseCexRecordData(nativeFixture(h));data['envolvente.huecos.items'][0].longitud='1.2';
  const win=h.cex32Blocks(h.buildCex32(template,{data}))[3].value[1][0];
  assert.equal(win.longitud,'1.2');assert.equal(win.elementosProteccionSolar[0],'dato que debe conservarse');
});
test('new 3.2 exports never invent template installations or renewable contributions',()=>{
  const h=loadHelpers(), data={'admin.localizacion.nombreEdificio':'Nuevo','generales.datos.tipoEdificio':'Unifamiliar'};
  const blocks=h.cex32Blocks(h.buildCex32(template,{data}));assert.equal(blocks[0].value,'CE3Xv3.2 Residencial');
  assert.ok(blocks[4].value.every(row=>row.length===0));
});

test('single-service heating and cooling retain their performance and coverage after export/import',()=>{
  const h=loadHelpers(), data={};
  for(const [service,performance] of [['calefaccion','180'],['refrigeracion','240']]) {
    data['instalaciones.'+service+'.items']=[{nombre:service,tipoGenerador:'Bomba de Calor',combustible:'Electricidad',rendimientoEstacional:performance,m2Cubiertos:'75',demandaCubierta:'100',zona:'Edificio Objeto'}];
  }
  const restored=h.parseCexRecordData(h.buildCex32(template,{data}));
  assert.equal(restored['instalaciones.calefaccion.items'][0].rendimientoEstacional,'180');
  assert.equal(restored['instalaciones.refrigeracion.items'][0].rendimientoEstacional,'240');
  assert.equal(restored['instalaciones.calefaccion.items'][0].m2Cubiertos,'75');
  assert.equal(restored['instalaciones.refrigeracion.items'][0].demandaCubierta,'100');
});
test('unsupported versions, non-residential CEX and truncated files are rejected',()=>{
  const h=loadHelpers();for(const version of ['CE3Xv3.1 Residencial','CE3Xv3.2 GranTerciario','CEXv2.4 Residencial']) {
    assert.throws(()=>h.parseCexRecordData(template.replace('CE3Xv3.2 Residencial',version)));
  }
  assert.throws(()=>h.parseCexRecordData(template.slice(0,-8)));
});
test('protocol-0 string roundtrip is lossless for newlines, backslashes and Unicode',()=>{
  const h=loadHelpers(),value='Línea 1\nOtra\\ruta — 😀';
  assert.equal(h.cex32Blocks(h.cex32Serialize(value)+'.')[0].value,value);
});
test('3.2 adapter rejects unsupported Python classes without executing them',()=>{
  const h=loadHelpers();assert.throws(()=>h.cex32Serialize({__cexClass:'os.system',__args:['anything']}));
});
