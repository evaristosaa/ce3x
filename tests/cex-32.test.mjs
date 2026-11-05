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
  const source = ['cex-import.js','cex-32.js','estimation-model.js'].map(name=>readFileSync(new URL('../app/'+name,import.meta.url),'utf8')).join('\n');
  vm.runInContext(source+'\n'+app+'\nglobalThis.h={parseCexRecordData,buildCex32,cex32Blocks,cex32Serialize,normalizeRecord,cex32Snapshot,selectHtml,selectCellHtml,estimationGroups,estimationStore,estimationRequest,estimationSignature,copySectionsData,copySectionPaths,cex32ReferenceList,cex32SetReferences,recordReferences,recordsMatchingReference,recordSearchText};',context);
  return context.h;
}

const template=readFileSync(new URL('../app/templates/base-3.2.cex',import.meta.url),'latin1');
const plain=value=>JSON.parse(JSON.stringify(value));

export function nativeFixture(h) {
  const values=h.cex32Blocks(template).map(block=>block.value);
  Object.assign(values[1],{0:'Edificio de prueba',1:'Calle Ensayo 1',2:'Otro',3:'Sevilla',4:'BENACAZON',14:'41805',15:['00000000000000000000'],26:'Ninguna',28:'ResidencialPrivado'});
  Object.assign(values[2],{0:'C.T.E.',1:'Unifamiliar',2:'Sevilla',3:'Otro',4:'B4',5:'V',6:'114',7:'2.7',8:'2',9:'100',12:'BENACAZON',19:'2007',22:'104',23:'1',24:'0',25:'2'});
  values[3][0]=[['Cubierta','Cubierta','59',.45,344,'Techo','','Sin patrón','Por defecto',['Cubierta inclinada'],'','','1','Edificio Objeto','aire']];
  values[3][1]=[{__cexClass:'Envolvente.objetosEnvolvente.HuecoEstimadas',descripcion:'Ventana',cerramientoAsociado:'Cubierta',superficie:'2',longitud:'1',altura:'2',multiplicador:'1',Uvidrio:3.3,Gvidrio:.75,Umarco:4,porcMarco:'20',absortividadValor:'.3',permeabilidadValor:'50',orientacion:'SE',patronSombras:'Sin patrón',elementosProteccionSolar:['dato que debe conservarse'],tipoVidrio:'Doble',tipoMarco:'Metálico con RPT'}];
  values[4][0]=[['ACS','ACS',[77.2,'',''],'Caldera Estándar','GLP',[['114','100'],['',''],['','']],'Estimado según Instalación',['Bien aislada y mantenida','90','0.2','24',[0,0,1,0,0,1,0]],[0],'Edificio Objeto']];
  values[4][3]=[['Clima','climatizacion',['',153,113.9],'Bomba de Calor','Electricidad',[['',''],['76.73','67.31'],['76.73','67.31']],'Estimado según Instalación',[['','220','200'],[0,1,0],[],0],['','3000','3000'],'Edificio Objeto']];
  return h.cex32Blocks(template)[0].text + values.slice(1).map(v=>h.cex32Serialize(v)+'.').join('');
}

function alteredFixture(h, change) {
  const blocks=h.cex32Blocks(nativeFixture(h));
  const values=blocks.map(block=>block.value);
  change(values);
  return blocks[0].text+values.slice(1).map(value=>h.cex32Serialize(value)+'.').join('');
}

function estimationResult(id, values) {
  return {ok:true,engine:'CE3X 3.2 installed seasonal-performance module',seasonalModuleSha256:'a'.repeat(64),runtimeExecutableSha256:'b'.repeat(64),systems:[{id,seasonalPerformancePercent:values}]};
}

function loadStorageWriteHelpers(records) {
  const context={initialRecords:plain(records),Utilities:{getUuid:()=> 'generated-id'}};vm.createContext(context);
  const gs=readFileSync(new URL('../google-apps-script/Code.gs',import.meta.url),'utf8');
  vm.runInContext(gs+`\n
    globalThis.writes=[];
    getSheet_=()=>({getLastRow:()=>initialRecords.length+1,getRange:()=>({getValues:()=>initialRecords.map(recordToRow_)})});
    ensureCleanSchemaForWrite_=()=>{};
    listRecords_=()=>initialRecords;
    findRowById_=(sheet,id)=>initialRecords.findIndex(record=>record.id===id)+2;
    writeRecordRow_=(sheet,rowNumber,row)=>writes.push({rowNumber,record:rowToRecord_(row,HEADERS)});
    globalThis.storage={saveRecord_,patchRecord_,findRecordForWrite_,findRowByIdOrReference_,getSheet_,addSummaryFields_,recordToRow_,rowToRecord_,HEADERS};
  `,context);
  return {storage:context.storage,writes:context.writes};
}

test('reference lists can be reordered, extended and reduced without changing thermal inputs',()=>{
  const h=loadHelpers(),data=h.parseCexRecordData(nativeFixture(h)),A='0'.repeat(20),B='1'.repeat(20),C='2'.repeat(20);
  const before=h.cex32Blocks(nativeFixture(h));
  let edited=h.cex32SetReferences(data,[B,A,C]);
  assert.deepEqual(plain(h.cex32ReferenceList(edited)),[B,A,C]);
  assert.equal(edited['admin.localizacion.referenciaCatastral'],B);
  const result=h.cex32Blocks(h.buildCex32(template,{data:edited}));
  assert.deepEqual(plain(result[1].value[15]),[B,A,C]);assert.deepEqual(plain(result[3].value),plain(before[3].value));assert.deepEqual(plain(result[4].value),plain(before[4].value));
  edited=h.cex32SetReferences(edited,[C,B]);
  assert.deepEqual(plain(h.cex32Blocks(h.buildCex32(template,{data:edited}))[1].value[15]),[C,B]);
});

test('promoting an existing additional reference retains the former primary exactly once',()=>{
  const h=loadHelpers(),data=h.parseCexRecordData(nativeFixture(h)),A='0'.repeat(20),B='1'.repeat(20);
  let edited=h.cex32SetReferences(data,[A,B]);edited['admin.localizacion.referenciaCatastral']=B;
  assert.deepEqual(plain(h.cex32ReferenceList(edited)),[B,A]);
  assert.deepEqual(plain(h.cex32Blocks(h.buildCex32(template,{data:edited}))[1].value[15]),[B,A]);
});

test('explicitly clearing all references survives legacy normalization and Sheets serialization',()=>{
  const h=loadHelpers(),data=h.parseCexRecordData(nativeFixture(h)),A='0'.repeat(20),B='1'.repeat(20);
  const empty=h.cex32SetReferences(h.cex32SetReferences(data,[A,B]),[]);
  const normalized=h.normalizeRecord({id:'target',referenciaCatastral:A,data:empty});
  assert.equal(normalized.data['admin.localizacion.referenciaCatastral'],'');
  const {storage}=loadStorageWriteHelpers([]);storage.addSummaryFields_(normalized);
  assert.equal(normalized.referenciaCatastral,'');
  const restored=storage.rowToRecord_(storage.recordToRow_(normalized),storage.HEADERS);
  assert.deepEqual(plain(h.cex32ReferenceList(restored.data)),[]);
  assert.deepEqual(plain(h.cex32Blocks(h.buildCex32(template,restored))[1].value[15]),[]);
});

test('invalid or duplicate references are rejected atomically and valid text is normalized',()=>{
  const h=loadHelpers(),data=h.parseCexRecordData(nativeFixture(h)),before=JSON.stringify(data),A='a'.repeat(20);
  assert.throws(()=>h.cex32SetReferences(data,['short']),/20 letras/);
  assert.throws(()=>h.cex32SetReferences(data,[A,A.toUpperCase()]),/repetidas/);
  assert.throws(()=>h.cex32SetReferences(data,['',A]),/líneas vacías/);
  assert.equal(JSON.stringify(data),before);
  assert.deepEqual(plain(h.cex32ReferenceList(h.cex32SetReferences(data,[' '+A+' ']))),[A.toUpperCase()]);
});

test('new-record references use a clean snapshot and retain explicitly entered known equipment',()=>{
  const h=loadHelpers(),data={'admin.cliente.nif':'X0000000T','generales.datos.tipoEdificio':'Unifamiliar',
    'instalaciones.acs.items':[{nombre:'ACS nueva',modoDefinicion:'Conocido',tipoGenerador:'Efecto Joule',combustible:'Electricidad',rendimientoEstacional:'100',m2Cubiertos:'50',demandaCubierta:'100'}]};
  assert.throws(()=>h.cex32SetReferences(data,['0'.repeat(20)]),/plantilla limpia/);
  const edited=h.cex32SetReferences(data,['0'.repeat(20),'1'.repeat(20)],template);
  const result=h.cex32Blocks(h.buildCex32(template,{data:edited}));
  assert.equal(result[1].value[6],'X0000000T');assert.equal(result[4].value[0][0][0],'ACS nueva');
  assert.deepEqual(plain(result[1].value[15]),['0'.repeat(20),'1'.repeat(20)]);
});

test('lookup finds additional references and search excludes superseded native primary values',()=>{
  const h=loadHelpers(),A='A'.repeat(20),B='B'.repeat(20),C='C'.repeat(20);
  const data=h.cex32SetReferences(h.parseCexRecordData(nativeFixture(h)),[A,B]);
  data['admin.localizacion.referenciaCatastral']=C;
  const record={id:'target',referenciaCatastral:A,data};
  assert.equal(h.recordsMatchingReference([record],B)[0].id,'target');assert.equal(h.recordsMatchingReference([record],A).length,0);
  assert.equal(h.recordsMatchingReference([record],'').length,0);
  const text=h.recordSearchText(record);assert.ok(text.includes(B)&&text.includes(C));assert.ok(!text.includes(A));
});

test('save and patch use the supplied ID when the new primary belongs to another record',()=>{
  const A='A'.repeat(20),B='B'.repeat(20),records=[{id:'first',referenciaCatastral:B,data:{'admin.cliente.nombreRazonSocial':'Cliente primero'}},{id:'target',referenciaCatastral:A,data:{'admin.cliente.nombreRazonSocial':'Cliente destino'}}];
  for(const action of ['save','patch']) {
    const {storage,writes}=loadStorageWriteHelpers(records);
    const item={id:'target',referenciaCatastral:B,data:{'admin.localizacion.referenciaCatastral':B}};
    const result=action==='save'?storage.saveRecord_(item):storage.patchRecord_({id:'target',referenciaCatastral:B,item,dataPatch:item.data});
    assert.equal(writes[0].rowNumber,3);assert.equal(result.id,'target');
    assert.equal(result.data['admin.cliente.nombreRazonSocial'],'Cliente destino');
  }
});

test('new IDs never overwrite a matching-reference record and legacy writes retain stable IDs',()=>{
  const ref='A'.repeat(20),records=[{id:'existing',referenciaCatastral:ref,data:{'admin.localizacion.referenciaCatastral':ref}}];
  const created=loadStorageWriteHelpers(records);created.storage.saveRecord_({id:'new',referenciaCatastral:ref,data:{'admin.localizacion.referenciaCatastral':ref}});
  assert.equal(created.writes[0].rowNumber,3);assert.equal(created.writes[0].record.id,'new');
  const legacy=loadStorageWriteHelpers(records);assert.equal(legacy.storage.saveRecord_({id:'',referenciaCatastral:ref,data:{}}).id,'existing');
  assert.equal(legacy.writes[0].rowNumber,2);
});

test('ambiguous reference-only writes and mismatched deletion IDs never choose another record',()=>{
  const A='A'.repeat(20),B='B'.repeat(20),records=[{id:'first',referenciaCatastral:B,data:{}},{id:'target',referenciaCatastral:A,data:{}}];
  const {storage}=loadStorageWriteHelpers(records);
  assert.equal(storage.findRowByIdOrReference_(storage.getSheet_(),'target',B),3);
  assert.throws(()=>storage.findRowByIdOrReference_(storage.getSheet_(),'missing',B),/no encontrada/);
  const duplicate=loadStorageWriteHelpers([{id:'first',referenciaCatastral:B,data:{}},{id:'second',referenciaCatastral:B,data:{}}]);
  assert.throws(()=>duplicate.storage.saveRecord_({referenciaCatastral:B,data:{}}),/varios expedientes/);
  assert.throws(()=>duplicate.storage.findRowByIdOrReference_(duplicate.storage.getSheet_(),'',B),/varios expedientes/);
  assert.equal(duplicate.writes.length,0);
});

test('installation drafts roundtrip in existing JSON cells and block export until recalculated',()=>{
  const h=loadHelpers(),data=h.parseCexRecordData(nativeFixture(h));
  const group=h.estimationGroups(data).find(g=>g.id==='s:0:0');
  assert.equal(group.parameters.potenciaCaldera,24);
  let edited=h.estimationStore(data,group.id,{...group.parameters,rendCombCaldera:85});
  edited['instalaciones.acs.items']=JSON.stringify(edited['instalaciones.acs.items']);
  edited=h.normalizeRecord({data:edited}).data;
  assert.equal(h.estimationGroups(edited)[0].draft.parameters.rendCombCaldera,85);
  assert.throws(()=>h.buildCex32(template,{data:edited}),/pendientes de recalcular/);
  assert.equal(JSON.parse(edited['cex.nativeInputs']).inputs[3][0][0][7][1],'90');
});

test('validated calculation receipts update native estimated boiler inputs without losing climate data',()=>{
  const h=loadHelpers(),source=nativeFixture(h),data=h.parseCexRecordData(source);
  const group=h.estimationGroups(data).find(g=>g.id==='s:0:0');
  const edited=h.estimationStore(data,group.id,{...group.parameters,rendCombCaldera:85},estimationResult(group.id,{ACS:72.2}));
  const result=h.cex32Blocks(h.buildCex32(template,{data:edited})),before=h.cex32Blocks(source);
  assert.equal(result[4].value[0][0][2][0],72.2);
  assert.equal(result[4].value[0][0][7][1],'85');
  assert.equal(result[4].value[0][0][6],'Estimado según Instalación');
  assert.deepEqual(plain(result[4].value[0][0][8]),plain(before[4].value[0][0][8]));
  assert.deepEqual(plain(result[4].value[3]),plain(before[4].value[3]));
});

test('shared heat-pump calculations update both services and retain native powers and age flags',()=>{
  const h=loadHelpers(),source=nativeFixture(h),data=h.parseCexRecordData(source);
  const group=h.estimationGroups(data).find(g=>g.id==='s:3:0');
  const edited=h.estimationStore(data,group.id,{...group.parameters,rendNominalCal:300},estimationResult(group.id,{calefaccion:210,refrigeracion:113.9}));
  const output=h.cex32Blocks(h.buildCex32(template,{data:edited}))[4].value[3][0];
  assert.equal(output[7][0][1],'300');assert.equal(output[2][1],210);assert.equal(output[2][2],113.9);
  assert.deepEqual(plain(output[8]),['','3000','3000']);assert.deepEqual(plain(output[7][1]),[0,1,0]);
  assert.equal(edited['instalaciones.calefaccion.items'][0].estimacion,edited['instalaciones.refrigeracion.items'][0].estimacion);
});

test('climate or building changes invalidate stored installation calculation receipts',()=>{
  const h=loadHelpers(),data=h.parseCexRecordData(nativeFixture(h));
  const group=h.estimationGroups(data)[0];
  const edited=h.estimationStore(data,group.id,group.parameters,estimationResult(group.id,{ACS:77.2}));
  edited['generales.datos.zonaClimaticaHE1']='C3';
  assert.throws(()=>h.buildCex32(template,{data:edited}),/desactualizado/);
  const unchanged=h.parseCexRecordData(nativeFixture(h));unchanged['generales.datos.tipoEdificio']='Bloque de viviendas';
  assert.throws(()=>h.buildCex32(template,{data:unchanged}),/zona climática o el tipo de edificio/);
});

test('changed drafts discard old receipts and manual estimated performance edits remain rejected',()=>{
  const h=loadHelpers(),data=h.parseCexRecordData(nativeFixture(h)),group=h.estimationGroups(data)[0];
  let edited=h.estimationStore(data,group.id,group.parameters,estimationResult(group.id,{ACS:77.2}));
  edited=h.estimationStore(edited,group.id,{...group.parameters,rendCombCaldera:80});
  assert.equal(JSON.parse(edited['instalaciones.acs.items'][0].estimacion).receipt,null);
  assert.throws(()=>h.buildCex32(template,{data:edited}),/pendientes de recalcular/);
  edited=h.estimationStore(data,group.id,group.parameters,estimationResult(group.id,{ACS:77.2}));
  edited['instalaciones.acs.items'][0].rendimientoEstacional='90';
  assert.throws(()=>h.buildCex32(template,{data:edited}),/no coincide/);
});

test('incomplete or unidentified engine responses cannot create a valid receipt',()=>{
  const h=loadHelpers(),data=h.parseCexRecordData(nativeFixture(h)),group=h.estimationGroups(data).find(g=>g.id==='s:3:0');
  assert.throws(()=>h.estimationStore(data,group.id,group.parameters,estimationResult(group.id,{calefaccion:153})),/todos los rendimientos/);
  const response=estimationResult(group.id,{calefaccion:153,refrigeracion:113.9});response.seasonalModuleSha256='';
  assert.throws(()=>h.estimationStore(data,group.id,group.parameters,response),/identificable/);
  assert.throws(()=>h.estimationRequest(data,group,{...group.parameters,fraccionPotencia:0.5}),/escalonamiento/);
});

test('shared equipment cannot retain contradictory calculation drafts',()=>{
  const h=loadHelpers(),data=h.parseCexRecordData(nativeFixture(h)),group=h.estimationGroups(data).find(g=>g.id==='s:3:0');
  const edited=h.estimationStore(data,group.id,group.parameters);
  edited['instalaciones.refrigeracion.items'][0].estimacion=JSON.stringify({schema:1,parameters:{...group.parameters,rendNominalCal:400}});
  assert.throws(()=>h.buildCex32(template,{data:edited}),/borradores de estimación contradictorios/);
});

test('Apps Script roundtrip retains installation drafts, receipts and stable source identifiers',()=>{
  const h=loadHelpers(),data=h.parseCexRecordData(nativeFixture(h)),group=h.estimationGroups(data)[0];
  const edited=h.estimationStore(data,group.id,{...group.parameters,rendCombCaldera:85},estimationResult(group.id,{ACS:72.2}));
  const context={};vm.createContext(context);
  vm.runInContext(readFileSync(new URL('../google-apps-script/Code.gs',import.meta.url),'utf8')+';globalThis.sheet={recordToRow_,rowToRecord_,HEADERS};',context);
  const restored=context.sheet.rowToRecord_(context.sheet.recordToRow_({id:'test-draft',data:edited}),context.sheet.HEADERS);
  assert.equal(restored.data['instalaciones.acs.items'][0].estimacion,edited['instalaciones.acs.items'][0].estimacion);
  assert.equal(restored.data['instalaciones.acs.items'][0].__cexSource,'s:0:0:0');
  assert.equal(h.cex32Blocks(h.buildCex32(template,restored))[4].value[0][0][2][0],72.2);
});

test('damaged stored calculation identity and invalid numeric drafts cannot be exported',()=>{
  const h=loadHelpers(),data=h.parseCexRecordData(nativeFixture(h)),group=h.estimationGroups(data)[0];
  const edited=h.estimationStore(data,group.id,group.parameters,estimationResult(group.id,{ACS:77.2}));
  const draft=JSON.parse(edited['instalaciones.acs.items'][0].estimacion);delete draft.receipt.moduleSha256;
  edited['instalaciones.acs.items'][0].estimacion=JSON.stringify(draft);
  assert.throws(()=>h.buildCex32(template,{data:edited}),/identificar el módulo/);
  assert.throws(()=>h.estimationStore(data,group.id,{...group.parameters,cargaMediaCaldera:2}),/Revisa el parámetro/);
});

test('copying envelope and systems retains source native details and target identities',()=>{
  const h=loadHelpers();
  const source=h.parseCexRecordData(alteredFixture(h,values=>{values[1][6]='00000000T';values[4][12]=[['Auxiliar origen']];values[10]=[['Sombra origen']];}));
  const target=h.parseCexRecordData(alteredFixture(h,values=>{values[1][0]='Destino';values[1][6]='X0000000T';values[2][22]='777';values[3][1][0].elementosProteccionSolar=['Protección destino'];}));
  const originalSource=JSON.stringify(source);
  h.copySectionsData({id:'source',data:source},target,template);
  const result=h.cex32Blocks(h.buildCex32(template,{data:target}));
  assert.equal(result[1].value[0],'Destino');assert.equal(result[1].value[6],'X0000000T');assert.equal(result[2].value[22],'777');
  assert.deepEqual(plain(result[3].value[1][0].elementosProteccionSolar),['dato que debe conservarse']);
  assert.deepEqual(plain(result[4].value[12]),[['Auxiliar origen']]);assert.deepEqual(plain(result[10].value),[['Sombra origen']]);
  assert.equal(JSON.stringify(source),originalSource);assert.ok(h.copySectionPaths().includes('cex.nativeInputs'));
});

test('copying imported sections into a new record starts from blank administrative data',()=>{
  const h=loadHelpers(),source=h.parseCexRecordData(nativeFixture(h));
  const target={'admin.localizacion.nombreEdificio':'Destino nuevo','admin.cliente.nif':'X0000000T','generales.datos.tipoEdificio':'Unifamiliar','generales.datos.zonaClimaticaHE1':'B4'};
  assert.throws(()=>h.copySectionsData({data:source},target),/plantilla limpia/);
  assert.equal(target['envolvente.huecos.items'],undefined);
  h.copySectionsData({id:'source',data:source},target,template);
  const snapshot=JSON.parse(target['cex.nativeInputs']);
  assert.equal(snapshot.inputs[0][0],'');assert.equal(snapshot.inputs[0][6],'');
  assert.notEqual(snapshot.inputs[1][22],'104');
  const result=h.cex32Blocks(h.buildCex32(template,{data:target}));assert.equal(result[1].value[6],'X0000000T');
});

test('manual source sections clear old native details and foreign calculation receipts',()=>{
  const h=loadHelpers(),target=h.parseCexRecordData(nativeFixture(h));
  const source={data:{'instalaciones.calefaccion.items':[{nombre:'Equipo manual',tipoEquipo:'Calefacción',modoDefinicion:'Conocido',tipoGenerador:'Efecto Joule',combustible:'Electricidad',rendimientoEstacional:'100',m2Cubiertos:'50',demandaCubierta:'100',__cexSource:'s:3:0:1',estimacion:'foreign'}]}};
  h.copySectionsData(source,target);
  assert.equal(target['instalaciones.calefaccion.items'][0].__cexSource,undefined);
  assert.equal(target['instalaciones.calefaccion.items'][0].estimacion,undefined);
  const snapshot=JSON.parse(target['cex.nativeInputs']);assert.ok(snapshot.inputs[2].every(group=>!group.length));assert.ok(snapshot.inputs[3].every(group=>!group.length));
  const systems=h.cex32Blocks(h.buildCex32(template,{data:target}))[4].value;
  assert.equal(systems[1][0][0],'Equipo manual');assert.equal(systems[3].length,0);assert.equal(systems[12].length,0);
});

test('copied estimated equipment retains its source climate context and requires recalculation',()=>{
  const h=loadHelpers(),source=h.parseCexRecordData(nativeFixture(h));
  const target=h.parseCexRecordData(alteredFixture(h,values=>{values[2][4]='C3';}));
  h.copySectionsData({data:source},target,template);
  assert.equal(JSON.parse(target['cex.nativeInputs']).inputs[1][4],'C3');
  assert.equal(h.estimationGroups(target)[0].originalContext.zone,'B4');
  assert.throws(()=>h.buildCex32(template,{data:target}),/zona climática o el tipo de edificio/);
});

test('section-specific versions migrate copied 2.3 systems inside a 3.2 target',()=>{
  const h=loadHelpers(),source=h.parseCexRecordData(nativeFixture(h)),target=h.parseCexRecordData(nativeFixture(h));
  const snapshot=JSON.parse(source['cex.nativeInputs']);snapshot.version='2.3';snapshot.inputs[3][3][0].splice(8,1);
  source['cex.nativeInputs']=JSON.stringify(snapshot);
  h.copySectionsData({data:source},target,template);
  const copied=JSON.parse(target['cex.nativeInputs']);assert.equal(copied.version,'3.2');assert.equal(copied.sectionVersions.systems,'2.3');
  const systems=h.cex32Blocks(h.buildCex32(template,{data:target}))[4].value;
  assert.equal(systems[3][0].length,10);assert.deepEqual(plain(systems[3][0][8]),['','','']);
  assert.equal(systems[3][0][9],'Edificio Objeto');
});

test('invalid source snapshots are rejected before changing target sections',()=>{
  const h=loadHelpers(),target=h.parseCexRecordData(nativeFixture(h)),before=JSON.stringify(target);
  assert.throws(()=>h.copySectionsData({data:{'cex.nativeInputs':'broken'}},target,template),/expediente origen/);
  assert.equal(JSON.stringify(target),before);
});

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
    data['instalaciones.'+service+'.items']=[{nombre:service,modoDefinicion:'Conocido',tipoGenerador:'Bomba de Calor',combustible:'Electricidad',rendimientoEstacional:performance,m2Cubiertos:'75',demandaCubierta:'100',zona:'Edificio Objeto'}];
  }
  const restored=h.parseCexRecordData(h.buildCex32(template,{data}));
  assert.equal(restored['instalaciones.calefaccion.items'][0].rendimientoEstacional,'180');
  assert.equal(restored['instalaciones.refrigeracion.items'][0].rendimientoEstacional,'240');
  assert.equal(restored['instalaciones.calefaccion.items'][0].m2Cubiertos,'75');
  assert.equal(restored['instalaciones.refrigeracion.items'][0].demandaCubierta,'100');
});

test('all cadastral references survive export and only the primary reference is edited',()=>{
  const h=loadHelpers(), source=alteredFixture(h,v=>{v[1][15]=['00000000000000000000','11111111111111111111'];});
  const data=h.parseCexRecordData(source);
  assert.deepEqual(plain(h.cex32Blocks(h.buildCex32(template,{data}))[1].value[15]),['00000000000000000000','11111111111111111111']);
  data['admin.localizacion.referenciaCatastral']='22222222222222222222';
  assert.deepEqual(plain(h.cex32Blocks(h.buildCex32(template,{data}))[1].value[15]),['22222222222222222222','11111111111111111111']);
});

test('renaming and reordering windows retains the correct native solar protections',()=>{
  const h=loadHelpers(), source=alteredFixture(h,v=>{
    const second=structuredClone(v[3][1][0]);second.descripcion='Ventana 2';second.elementosProteccionSolar=['Segunda protección'];v[3][1].push(second);
  });
  const data=h.parseCexRecordData(source);
  data['envolvente.huecos.items'].reverse();
  data['envolvente.huecos.items'][0].nombre='Ventana renombrada';
  const windows=h.cex32Blocks(h.buildCex32(template,{data}))[3].value[1];
  assert.equal(windows[0].descripcion,'Ventana renombrada');
  assert.equal(windows[0].elementosProteccionSolar[0],'Segunda protección');
  assert.equal(windows[1].elementosProteccionSolar[0],'dato que debe conservarse');
});

test('editing ACS retains estimated climate equipment, nominal powers and auxiliary systems',()=>{
  const h=loadHelpers(), source=alteredFixture(h,v=>{v[4][12]=[['Auxiliar de prueba',['parámetros adicionales']]];});
  const data=h.parseCexRecordData(source), before=h.cex32Blocks(source)[4].value;
  data['instalaciones.acs.items'][0].nombre='ACS renombrado';
  const after=h.cex32Blocks(h.buildCex32(template,{data}))[4].value;
  assert.equal(after[0][0][0],'ACS renombrado');
  assert.deepEqual(plain(after.slice(1)),plain(before.slice(1)));
  assert.equal(after[0][0][6],before[0][0][6]);
});

test('shared coverage edits preserve the other service, estimates and storage parameters',()=>{
  const h=loadHelpers(), source=alteredFixture(h,v=>{v[4][0][0][8]=[true,'150','80','60','4','Conocido','1'];});
  const before=h.cex32Blocks(source)[4].value, data=h.parseCexRecordData(source);
  Object.assign(data['instalaciones.calefaccion.items'][0],{m2Cubiertos:'80',demandaCubierta:'70'});
  const after=h.cex32Blocks(h.buildCex32(template,{data}))[4].value;
  assert.deepEqual(plain(after[0]),plain(before[0]));
  assert.deepEqual(plain(after[3][0][5][1]),['80','70']);
  assert.deepEqual(plain(after[3][0][5][2]),plain(before[3][0][5][2]));
  assert.deepEqual(plain(after[3][0][7]),plain(before[3][0][7]));
  assert.deepEqual(plain(after[3][0][8]),plain(before[3][0][8]));
});

test('shared common-field edits propagate once and conflicting edits are rejected',()=>{
  const h=loadHelpers(), data=h.parseCexRecordData(nativeFixture(h));
  data['instalaciones.calefaccion.items'][0].nombre='Equipo compartido';
  assert.equal(h.cex32Blocks(h.buildCex32(template,{data}))[4].value[3][0][0],'Equipo compartido');
  data['instalaciones.refrigeracion.items'][0].nombre='Otro nombre';
  assert.throws(()=>h.buildCex32(template,{data}),/contradictorios/);
});

test('deleting one shared projection is rejected and deleting the whole equipment preserves auxiliaries',()=>{
  const h=loadHelpers(), source=alteredFixture(h,v=>{v[4][11]=[['Auxiliar']];}), data=h.parseCexRecordData(source);
  data['instalaciones.calefaccion.items']=[];
  assert.throws(()=>h.buildCex32(template,{data}),/compartido/);
  data['instalaciones.refrigeracion.items']=[];
  const systems=h.cex32Blocks(h.buildCex32(template,{data}))[4].value;
  assert.equal(systems[3].length,0);assert.equal(systems[0].length,1);
  assert.deepEqual(plain(systems[11]),[['Auxiliar']]);
});

test('estimated performances are never silently converted into justified known values',()=>{
  const h=loadHelpers(), data=h.parseCexRecordData(nativeFixture(h)), snapshot=data['cex.nativeInputs'];
  data['instalaciones.calefaccion.items'][0].rendimientoEstacional='200';
  assert.throws(()=>h.buildCex32(template,{data}),/estimado/);
  assert.equal(data['cex.nativeInputs'],snapshot);
});

test('known performance edits preserve powers and unrelated services',()=>{
  const h=loadHelpers(), source=alteredFixture(h,v=>{v[4][3][0][6]='Conocido (Ensayado/justificado)';v[4][3][0][7]=['','153','113.9'];});
  const data=h.parseCexRecordData(source);data['instalaciones.calefaccion.items'][0].rendimientoEstacional='200';
  const raw=h.cex32Blocks(h.buildCex32(template,{data}))[4].value[3][0];
  assert.equal(raw[2][1],200);assert.equal(raw[7][1],'200');assert.equal(raw[2][2],113.9);
  assert.deepEqual(plain(raw[8]),['','3000','3000']);
});

test('renaming a contribution preserves native monthly and auxiliary parameters',()=>{
  const h=loadHelpers(), source=alteredFixture(h,v=>{
    v[4][6]=[['Renovable','renovable',['10','',''],['100','2','3','4','5','Electricidad'],[true,false],'Edificio Objeto',['Mensual',1,2,3]]];
    v[4][10]=[['Recuperación',42]];
  });
  const data=h.parseCexRecordData(source), before=h.cex32Blocks(source)[4].value;
  data['instalaciones.contribuciones.items'][0].nombre='Renovable renombrada';
  const after=h.cex32Blocks(h.buildCex32(template,{data}))[4].value;
  assert.equal(after[6][0][0],'Renovable renombrada');
  assert.deepEqual(plain(after[6][0].slice(1)),plain(before[6][0].slice(1)));
  assert.deepEqual(plain(after[10]),plain(before[10]));
});

test('older stored records acquire stable source identities before editing',()=>{
  const h=loadHelpers(), data=h.parseCexRecordData(nativeFixture(h));
  for(const value of Object.values(data)) if(Array.isArray(value)) for(const row of value) delete row.__cexSource;
  const record=h.normalizeRecord({data});
  assert.equal(record.data['envolvente.huecos.items'][0].__cexSource,'e:1:0');
  record.data['envolvente.huecos.items'][0].nombre='Otro nombre';
  const raw=h.cex32Blocks(h.buildCex32(template,record))[3].value[1][0];
  assert.equal(raw.elementosProteccionSolar[0],'dato que debe conservarse');
});

test('new estimated equipment is rejected instead of labelled as justified known input',()=>{
  const h=loadHelpers(), data={'instalaciones.calefaccion.items':[{nombre:'Estimación',modoDefinicion:'Estimado según Instalación',rendimientoEstacional:'180',tipoGenerador:'Bomba de Calor',combustible:'Electricidad'}]};
  assert.throws(()=>h.buildCex32(template,{data}),/conocido y justificado/);
});

test('provenance cannot be duplicated to overwrite a native window twice',()=>{
  const h=loadHelpers(),data=h.parseCexRecordData(nativeFixture(h));
  data['envolvente.huecos.items'].push({...data['envolvente.huecos.items'][0],nombre:'Copia'});
  assert.throws(()=>h.buildCex32(template,{data}),/mismo elemento original/);
});

test('native modes and custom towns remain selected instead of becoming the first option',()=>{
  const h=loadHelpers();
  assert.match(h.selectHtml('localidad','BENACAZON',['Sevilla','Otro']),/<option value="BENACAZON" selected>/);
  assert.match(h.selectCellHtml('data-col="modoDefinicion"','Conocido (Ensayado/justificado)',['Estimado','Conocido']),/<option value="Conocido \(Ensayado\/justificado\)" selected>/);
  assert.match(h.selectHtml('provincia','',['A Coruña','Sevilla']),/<option value="" selected>/);
});

test('administrative and general custom towns are exported independently',()=>{
  const h=loadHelpers(), data=h.parseCexRecordData(nativeFixture(h));
  data['admin.localizacion.localidad']='Sevilla';
  const general=h.cex32Blocks(h.buildCex32(template,{data}))[2].value;
  assert.equal(general[3],'Otro');assert.equal(general[12],'BENACAZON');
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
