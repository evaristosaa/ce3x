/* Drafts and calculation receipts live inside the existing installation JSON cells. */
const ESTIMATION_PATHS = ['instalaciones.acs.items','instalaciones.calefaccion.items','instalaciones.refrigeracion.items'];

function estimationCanonical(value) {
  if (Array.isArray(value)) return '['+value.map(estimationCanonical).join(',')+']';
  if (value && typeof value==='object') return '{'+Object.keys(value).sort().map(key=>JSON.stringify(key)+':'+estimationCanonical(value[key])).join(',')+'}';
  return JSON.stringify(value);
}

function estimationContext(data) {
  return {zone:String(data['generales.datos.zonaClimaticaHE1'] || ''),buildingType:cexBuildingType(data['generales.datos.tipoEdificio'])};
}

function estimationRows(data) {
  return ESTIMATION_PATHS.flatMap(path=>{
    let rows=data[path] || [];
    if(typeof rows==='string') { try {rows=JSON.parse(rows);if(Array.isArray(rows)) data[path]=rows;} catch {rows=[];} }
    return (Array.isArray(rows)?rows:[]).filter(row=>row && !row.values).map(row=>({path,row}));
  });
}

function estimationGroups(data) {
  if (!data['cex.nativeInputs']) return [];
  const native=JSON.parse(data['cex.nativeInputs']);
  const systemsVersion=native.sectionVersions?.systems||native.version;
  const rows=estimationRows(data);
  const result=[];
  for(let group=0;group<6;group++) for(const [index,raw] of (native.inputs?.[3]?.[group] || []).entries()) {
    if (!/^Estimado según Instalación$/i.test(String(raw[6]))) continue;
    const id='s:'+group+':'+index;
    const members=rows.filter(item=>item.row.__cexSource?.startsWith(id+':'));
    if(!members.length) continue;
    const services=group===0?[0]:group===1?[1]:group===2?[2]:group===3?[1,2]:group===4?[0,1]:[0,1,2];
    let parameters=null, reason='La parametrización de este tipo de equipo aún necesita contraste con CE³X.';
    const p=raw[7];
    if(systemsVersion==='3.2' && [0,1].includes(group) && raw[3]==='Caldera Estándar' && Array.isArray(p) && p.length>=5 && p[4]?.length===7) {
      parameters={aislanteCaldera:String(p[0]),rendCombCaldera:Number(p[1]),cargaMediaCaldera:Number(p[2]),potenciaCaldera:Number(p[3]),vectorTipoCaldera:structuredClone(p[4])};
    } else if(systemsVersion==='3.2' && group<=3 && raw[3]==='Bomba de Calor' && Array.isArray(p?.[0]) && p[0].length===3 && estimationCanonical(p[1])==='[0,1,0]' && Array.isArray(p[2]) && !p[2].length && !p[3]) {
      parameters={variosGeneradoresCheck:false,fraccionPotencia:1,fraccionPotenciaEntrada:0};
      for(const service of services) parameters[['rendNominalACS','rendNominalCal','rendNominalRef'][service]]=Number(p[0][service]);
    }
    const drafts=members.map(item=>item.row.estimacion).filter(Boolean);
    if(new Set(drafts).size>1) throw new Error('El equipo compartido tiene borradores de estimación contradictorios.');
    let draft=null;
    if(drafts.length) {try {draft=JSON.parse(drafts[0]);} catch {throw new Error('Los parámetros guardados del equipo no son válidos.');}}
    if(draft && (draft.schema!==1 || !draft.parameters || typeof draft.parameters!=='object')) throw new Error('Revisa el formato de los parámetros de estimación guardados.');
    result.push({id,group,index,raw,members,services,parameters,reason:parameters?'':reason,draft,
      originalContext:native.systemContext||{zone:String(native.inputs[1][4]),buildingType:cexBuildingType(native.inputs[1][1])}});
  }
  return result;
}

function estimationRequest(data,group,parameters) {
  if(!group.parameters) throw new Error(group.reason);
  if(estimationCanonical(Object.keys(parameters).sort())!==estimationCanonical(Object.keys(group.parameters).sort())) throw new Error('No cambies la estructura de los parámetros del equipo importado.');
  // Keep characteristics whose UI semantics have not yet been validated unchanged.
  for(const key of ['vectorTipoCaldera','variosGeneradoresCheck','fraccionPotencia','fraccionPotenciaEntrada']) {
    if(key in group.parameters && estimationCanonical(parameters[key])!==estimationCanonical(group.parameters[key])) throw new Error('Las características y el escalonamiento deben conservar sus valores importados.');
  }
  for(const key of ['rendCombCaldera','potenciaCaldera','cargaMediaCaldera','rendNominalACS','rendNominalCal','rendNominalRef']) {
    if(key in parameters && (typeof parameters[key]!=='number'||!Number.isFinite(parameters[key])||parameters[key]<=0||(key==='cargaMediaCaldera'&&parameters[key]>1)||(key==='rendCombCaldera'&&parameters[key]>100))) throw new Error('Revisa el parámetro '+key+'.');
  }
  return {context:estimationContext(data),systems:[{id:group.id,service:['ACS','calefaccion','refrigeracion','climatizacion'][group.group],
    generator:group.raw[3],fuel:group.raw[4],parameters:structuredClone(parameters)}]};
}

function estimationSignature(data,group,parameters) {
  return estimationCanonical({source:group.raw,request:estimationRequest(data,group,parameters)});
}

function estimationStore(data,id,parameters,response=null) {
  const next=structuredClone(data), group=estimationGroups(next).find(item=>item.id===id);
  if(!group) throw new Error('El equipo ya no está en el expediente.');
  const signature=estimationSignature(next,group,parameters);
  let receipt=group.draft?.receipt?.signature===signature?group.draft.receipt:null;
  if(response) {
    if(response.ok!==true || response.systems?.length!==1 || response.systems[0].id!==id || !/^[a-f0-9]{64}$/.test(response.seasonalModuleSha256 || '') || !/^[a-f0-9]{64}$/.test(response.runtimeExecutableSha256 || '')) throw new Error('El servidor no ha devuelto una respuesta de cálculo identificable.');
    const values=response.systems[0].seasonalPerformancePercent;
    const expected=group.services.map(service=>['ACS','calefaccion','refrigeracion'][service]);
    if(!values || estimationCanonical(Object.keys(values).sort())!==estimationCanonical(expected.sort()) || Object.values(values).some(value=>typeof value!=='number'||!Number.isFinite(value)||value<=0)) throw new Error('El servidor no ha devuelto todos los rendimientos esperados.');
    receipt={signature,values,engine:response.engine,moduleSha256:response.seasonalModuleSha256,runtimeSha256:response.runtimeExecutableSha256,calculatedAt:new Date().toISOString()};
  }
  const draft=JSON.stringify({schema:1,parameters,receipt});
  for(const {row} of group.members) {
    row.estimacion=draft;
    if(receipt) row.rendimientoEstacional=String(receipt.values[['ACS','calefaccion','refrigeracion'][Number(row.__cexSource.split(':')[3])]]);
  }
  return next;
}

function estimationOverlay(data,systems) {
  const approved={};
  for(const group of estimationGroups(data)) {
    const contextChanged=estimationCanonical(estimationContext(data))!==estimationCanonical(group.originalContext);
    if(!group.draft) {
      if(contextChanged) throw new Error('Han cambiado la zona climática o el tipo de edificio. Recalcula las instalaciones estimadas antes de exportar.');
      continue;
    }
    if(!group.parameters) throw new Error(group.reason);
    const draft=group.draft, signature=estimationSignature(data,group,draft.parameters);
    const changed=estimationCanonical(draft.parameters)!==estimationCanonical(group.parameters);
    if(!draft.receipt) {
      if(changed || contextChanged) throw new Error('Hay parámetros de instalaciones pendientes de recalcular. Abre Parámetros y rendimiento antes de exportar.');
      continue;
    }
    if(draft.receipt.signature!==signature) throw new Error('El cálculo de instalaciones ha quedado desactualizado. Recalcula antes de exportar.');
    if(!/^[a-f0-9]{64}$/.test(draft.receipt.moduleSha256||'') || !/^[a-f0-9]{64}$/.test(draft.receipt.runtimeSha256||'') || !draft.receipt.engine) throw new Error('No se puede identificar el módulo del cálculo guardado. Recalcula antes de exportar.');
    const raw=systems[group.group][group.index], params=draft.parameters;
    if(raw[3]==='Caldera Estándar') {
      raw[7][0]=params.aislanteCaldera;raw[7][1]=String(params.rendCombCaldera);raw[7][2]=String(params.cargaMediaCaldera);raw[7][3]=String(params.potenciaCaldera);
    } else {
      for(const service of group.services) raw[7][0][service]=String(params[['rendNominalACS','rendNominalCal','rendNominalRef'][service]]);
    }
    for(const {row} of group.members) {
      const service=Number(row.__cexSource.split(':')[3]), name=['ACS','calefaccion','refrigeracion'][service], value=draft.receipt.values?.[name];
      if(typeof value!=='number'||!Number.isFinite(value)||value<=0 || Number(row.rendimientoEstacional)!==value) throw new Error('El rendimiento del formulario no coincide con el cálculo guardado. Recalcula antes de exportar.');
      raw[2][service]=value;approved[row.__cexSource]=value;
    }
  }
  return approved;
}
