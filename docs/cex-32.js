/* CE3X 3.2 input adapter. Parses data only; never executes Python globals. */
const CEX32_INPUT_KEY = 'cex.nativeInputs';

function cex32Blocks(text) {
  const source = String(text).replace(/\r\n/g, '\n');
  const blocks = [];
  let offset = 0;
  while (offset < source.length && source.slice(offset).trim()) {
    const parser = new CexPickleParser(source, offset);
    const value = parser.parse();
    blocks.push({ value, text: source.slice(offset, parser.index) });
    offset = parser.index;
  }
  return blocks;
}

function cex32String(value) {
  return 'V' + String(value ?? '').replace(/\\/g, '\\u005c').replace(/\r/g, '\\u000d').replace(/\n/g, '\\u000a')
    .replace(/[^\x00-\xff]/g, char => '\\u' + char.charCodeAt(0).toString(16).padStart(4, '0')) + '\n';
}

function cex32Serialize(value) {
  if (value === null || value === undefined) return 'N';
  if (typeof value === 'string') return cex32String(value);
  if (typeof value === 'boolean') return value ? 'I01\n' : 'I00\n';
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('Hay un valor numérico no válido.');
    return Number.isInteger(value) ? `I${value}\n` : `F${value}\n`;
  }
  if (Array.isArray(value)) return '(l' + value.map(item => cex32Serialize(item) + 'a').join('');
  const className = value.__cexClass;
  if (className && !/^Envolvente\.objetosEnvolvente\.Hueco(?:Estimadas|Conocidas)$/.test(className)) {
    throw new Error(`El objeto ${className} necesita revisión antes de exportar.`);
  }
  const pairs = Object.entries(value).filter(([key]) => !key.startsWith('__cex') && key !== '__args');
  const dictionary = '(d' + pairs.map(([key, item]) => cex32String(key) + cex32Serialize(item) + 's').join('');
  if (!className) return dictionary;
  const split = className.lastIndexOf('.');
  return `(i${className.slice(0, split)}\n${className.slice(split + 1)}\n` + dictionary + 'b';
}

function cex32Snapshot(source, version) {
  const blocks = cex32Blocks(source);
  if (blocks.length !== 15) throw new Error('El CEX no contiene los 15 bloques esperados.');
  const inputs = blocks.slice(1, 5).map(block => block.value);
  // Images already have their own chunked storage columns.
  inputs[1][17] = ''; inputs[1][18] = '';
  const snapshot = JSON.stringify({ version, inputs, shadows: blocks[10].value });
  if (snapshot.length > 360000) throw new Error('El CEX contiene más datos de los que admite el almacenamiento. No se ha importado.');
  return snapshot;
}

function cex32Table(record, path) {
  const [sectionId, groupId] = path.split('.');
  const columns = SECTIONS.find(s => s.id === sectionId)?.groups.find(g => g.id === groupId)?.fields.find(f => f.id === 'items')?.columns || [];
  return normalizeCexRows(record.data[path], columns.map(column=>column.id));
}

function cex32Inputs(template, record) {
  const blocks = cex32Blocks(template);
  if (blocks[0]?.value !== 'CE3Xv3.2 Residencial') throw new Error('La plantilla no es nativa de CE3X 3.2.');
  const data = record.data || {};
  cex32HydrateSources(data);
  let native;
  if (data[CEX32_INPUT_KEY]) {
    try { native = JSON.parse(data[CEX32_INPUT_KEY]); }
    catch { throw new Error('Los datos originales del CEX no se pueden recuperar. Vuelve a importar el archivo.'); }
  }
  const defaults = blocks.slice(1, 5).map(block => block.value);
  const inputs = native?.inputs ? structuredClone(native.inputs) : structuredClone(defaults);
  const [admin, general] = inputs;
  while (admin.length < defaults[0].length) admin.push(structuredClone(defaults[0][admin.length]));
  while (general.length < defaults[1].length) general.push(structuredClone(defaults[1][general.length]));
  const assign = (list, mapping) => Object.entries(mapping).forEach(([index, path]) => {
    if (data[path] !== undefined) list[Number(index)] = String(data[path]);
  });
  assign(admin, {
    0:'admin.localizacion.nombreEdificio',1:'admin.localizacion.direccion',2:'admin.localizacion.localidad',3:'admin.localizacion.provincia',
    5:'admin.cliente.nombreRazonSocial',6:'admin.cliente.nif',7:'admin.cliente.direccion',8:'admin.cliente.telefono',9:'admin.cliente.email',
    10:'admin.tecnico.razonSocial',11:'admin.tecnico.nombre',12:'admin.tecnico.telefono',13:'admin.tecnico.email',14:'admin.localizacion.codigoPostal',
    16:'admin.cliente.localidad',17:'admin.cliente.provincia',18:'admin.cliente.codigoPostal',19:'admin.tecnico.nif',20:'admin.tecnico.cif',
    21:'admin.tecnico.direccion',22:'admin.tecnico.provincia',23:'admin.tecnico.localidad',24:'admin.tecnico.codigoPostal',25:'admin.tecnico.titulacion',
    26:'admin.localizacion.gradoProteccion',28:'admin.localizacion.usoEdificio',
  });
  const references = Array.isArray(admin[15]) ? admin[15].slice() : [];
  if (data['admin.localizacion.referenciaCatastral'] !== undefined) {
    const primary = String(data['admin.localizacion.referenciaCatastral'] || '').trim();
    if (!primary && references.length > 1) throw new Error('No puedes dejar vacía la referencia principal mientras haya referencias adicionales en el CEX.');
    admin[15] = cex32ProjectReferences(primary,references);
  }
  const local = cexCompatibleLocality(admin[2], admin[3]);
  admin[4] = local === 'Otro' ? admin[2] : ''; admin[2] = local;
  if (String(admin[20]).trim() === '.') admin[20] = '';
  if (!admin[26]) admin[26] = 'Ninguna';
  if (!admin[28]) admin[28] = 'ResidencialPrivado';
  assign(general, {0:'generales.datos.normativaVigente',1:'generales.datos.tipoEdificio',2:'generales.datos.provincia',3:'generales.datos.localidad',
    4:'generales.datos.zonaClimaticaHE1',5:'generales.datos.zonaClimaticaHE4',6:'generales.definicion.superficieUtilHabitable',7:'generales.definicion.alturaLibrePlanta',
    8:'generales.definicion.numeroPlantasHabitables',9:'generales.definicion.demandaDiariaACS',10:'generales.definicion.masaParticionesInternas',
    16:'generales.definicion.ventilacionInmueble',19:'generales.datos.anioConstruccion'});
  assign(general, CEX32_CERTIFICATE_FIELDS);
  general[1] = normalizeText(general[1]) === 'vivienda individual' ? 'Vivienda Individual' : cexBuildingType(general[1]);
  if (/^CTE\s*20\d\d$/i.test(general[0])) general[0] = 'C.T.E.';
  const generalLocal = cexCompatibleLocality(general[3], general[2]);
  general[12] = generalLocal === 'Otro' ? String(data['generales.datos.localidad'] || data['admin.localizacion.localidad'] || '') : '';
  general[3] = generalLocal;
  general[11] = /^(s[ií]|true|1)$/i.test(String(data['generales.definicion.ensayoEstanqueidad'] || ''));
  general[17] = embeddedImageBase64(data['generales.definicion.imagenEdificio']);
  general[18] = embeddedImageBase64(data['generales.definicion.planoSituacion']);
  // Reuse native input objects when their editable representation is unchanged.
  const sourceData = native ? cex32ImportedTables(native.inputs) : {};
  const envelopePaths = ['envolvente.cerramientos.items','envolvente.huecos.items','envolvente.puentesTermicos.items'];
  const serializers = [serializeCexCerramientosInput, serializeCexHuecosInput, serializeCexPuentesInput];
  envelopePaths.forEach((path, index) => {
    const rows = cex32Table(record, path);
    if (native && cex32SameRows(rows, sourceData[path])) return;
    // The established input serializers produce no derived calculation cache.
    const text = serializers[index](rows);
    const generated = new CexPickleParser(text + '.', 0).parse();
    if (native) {
      const original = sourceData[path] || [];
      const raw = inputs[2][index];
      const used = new Set();
      inputs[2][index] = rows.map((row, rowIndex) => {
        const source = cex32FindOriginal(row, original);
        const oldIndex = source ? original.indexOf(source) : -1;
        if (oldIndex < 0) return generated[rowIndex];
        if (used.has(oldIndex)) throw new Error('Dos filas de la envolvente apuntan al mismo elemento original. Vuelve a importar el CEX.');
        used.add(oldIndex);
        const item = structuredClone(raw[oldIndex]);
        const before = original[oldIndex];
        if (index === 0 && row.tipoCerramiento !== before.tipoCerramiento) throw new Error('El cambio de tipo de cerramiento necesita revisar su definición en CE3X.');
        const maps = [
          {nombre:0,tipoCerramiento:1,superficie:2,u:3,peso:4,posicion:5,patronSombras:7,modoDefinicion:8},
          {nombre:'descripcion',cerramientoAsociado:'cerramientoAsociado',longitud:'longitud',altura:'altura',multiplicador:'multiplicador',superficie:'superficie',uVidrio:'Uvidrio',gVidrio:'Gvidrio',uMarco:'Umarco',porcMarco:'porcMarco',absortividadMarco:'absortividadValor',permeabilidad:'permeabilidadValor',orientacion:'orientacion',patronSombras:'patronSombras'},
          {nombre:0,tipoPuenteTermico:2,fi:3,longitud:4,cerramientoAsociado:7},
        ];
        for (const [key, slot] of Object.entries(maps[index])) {
          if (row[key] !== undefined && String(row[key]) !== String(before[key] ?? '')) {
            const value = row[key]; item[slot] = typeof item[slot] === 'number' ? Number(String(value).replace(',','.')) : value;
          }
        }
        if(index===2) {
          if(cex32NumericChanged(row.fi,before.fi))item[5]='usuario_fi';
          if(cex32NumericChanged(row.longitud,before.longitud))item[6]='usuario';
        }
        return item;
      });
    } else inputs[2][index] = generated;
  });
  if (!Array.isArray(inputs[2][3])) inputs[2][3] = [];
  inputs[2][0].forEach(item=>{if(typeof item[5]==='string')item[5]=cexWallOrientation(item[5]);});
  solarOverlay(data,inputs[2][1],cex32Table(record,'envolvente.huecos.items'),sourceData['envolvente.huecos.items']);
  windowOverlay(data,inputs[2][1],cex32Table(record,'envolvente.huecos.items'),sourceData['envolvente.huecos.items']);
  const systemPaths = ['instalaciones.acs.items','instalaciones.calefaccion.items','instalaciones.refrigeracion.items','instalaciones.contribuciones.items'];
  const changed = systemPaths.some(path => !native || !cex32SameRows(cex32Table(record,path), sourceData[path]));
  const approvedEstimated = estimationOverlay(data,inputs[3]);
  if (changed && native) {
    cex32PatchNativeSystems(inputs[3], sourceData, systemPaths.map(path => cex32Table(record,path)),approvedEstimated);
  } else if (changed) {
    const [acs, heat, cool, contributions] = systemPaths.map(path => cex32Table(record,path));
    // Single-service systems stay independent: do not pair unrelated heating/cooling equipment.
    inputs[3] = Array.from({length:14},()=>[]);
    inputs[3][0] = acs.map(row=>cex32KnownSystem(row,0));
    inputs[3][1] = heat.map(row=>cex32KnownSystem(row,1));
    inputs[3][2] = cool.map(row=>cex32KnownSystem(row,2));
    inputs[3][6] = new CexPickleParser(serializeCexContribucionesInput(contributions.filter(isUsefulCexContribution))+'.',0).parse();
  }
  for (const group of inputs[3].slice(0,6)) {
    for (const row of group || []) {
      if (cexKnownHeatPump(row[3], row[6]) && Array.isArray(row[7]) && (row[7][3] == null || row[7][3] === '')) {
        row[7][3] = 0;
      }
    }
  }
  while (inputs[3].length < 14) inputs[3].push([]);
  if ((native?.sectionVersions?.systems || native?.version) === '2.3') {
      for (const index of [1,2,3,4,5]) inputs[3][index].forEach(row=> {
        if (row.length === 9) row.splice(8,0,['','','']);
      });
  }
  return { blocks, inputs, shadows: native?.shadows };
}

function cex32ImportedTables(inputs) {
  const s = systemRows(inputs[3]);
  return {'envolvente.cerramientos.items':envelopeRows(inputs[2][0]),'envolvente.huecos.items':envelopeHuecoRows(inputs[2][1]),
    'envolvente.puentesTermicos.items':envelopePuenteRows(inputs[2][2]),'instalaciones.acs.items':s.acs,
    'instalaciones.calefaccion.items':s.calefaccion,'instalaciones.refrigeracion.items':s.refrigeracion,'instalaciones.contribuciones.items':s.contribuciones};
}

function cex32ProjectReferences(primary,original) {
  const references=Array.isArray(original)?original.slice():[];
  if(primary===undefined)return references;
  const first=String(primary??'').trim();
  if(!first)return references.length>1?['',...references.slice(1)]:[];
  const index=references.findIndex(value=>String(value).trim().toUpperCase()===first.toUpperCase());
  return index>0?[first,...references.filter((value,position)=>position!==index)]:[first,...references.slice(1)];
}

function cex32ReferenceList(data) {
  let native=null;
  if(data[CEX32_INPUT_KEY]) {
    try{native=JSON.parse(data[CEX32_INPUT_KEY]);}catch{throw new Error('No se pueden recuperar las referencias del CEX original.');}
    if(!Array.isArray(native.inputs?.[0]))throw new Error('El bloque administrativo nativo no tiene el formato esperado.');
  }
  return cex32ProjectReferences(data['admin.localizacion.referenciaCatastral'],native?.inputs?.[0]?.[15]).map(value=>String(value??''));
}

function cex32BlankSnapshot(template) {
  const blocks=cex32Blocks(template);
  if(blocks.length!==15||blocks[0].value!=='CE3Xv3.2 Residencial')throw new Error('La plantilla no es nativa de CE3X 3.2.');
  return {version:'3.2',inputs:blocks.slice(1,5).map(block=>block.value),shadows:[]};
}

function cex32SetReferences(data,values,template='') {
  if(!Array.isArray(values))throw new Error('Introduce una referencia por línea.');
  const references=values.map(value=>String(value??'').trim().toUpperCase());
  if(references.some(value=>!value))throw new Error('No dejes líneas vacías entre referencias. La primera línea debe ser la principal.');
  if(references.some(value=>!/^[A-Z0-9]{20}$/.test(value)))throw new Error('Cada referencia debe contener 20 letras o números.');
  if(new Set(references).size!==references.length)throw new Error('Hay referencias repetidas. Mantén una única línea para cada una.');
  const next=structuredClone(data);
  let native;
  if(next[CEX32_INPUT_KEY]) {
    try{native=JSON.parse(next[CEX32_INPUT_KEY]);}catch{throw new Error('No se pueden recuperar los datos nativos del expediente.');}
    if(!['2.3','3.2'].includes(native.version)||!Array.isArray(native.inputs)||native.inputs.length!==4||native.inputs.some(part=>!Array.isArray(part)))throw new Error('Los datos nativos del expediente no tienen el formato esperado.');
  } else {
    if(!template)throw new Error('Falta la plantilla limpia para guardar las referencias.');
    native=cex32BlankSnapshot(template);
  }
  native.inputs[0][15]=references;
  const text=JSON.stringify(native);
  if(text.length>360000)throw new Error('Los datos nativos superan el tamaño admitido. No se han guardado las referencias.');
  next[CEX32_INPUT_KEY]=text;
  next['admin.localizacion.referenciaCatastral']=references[0]||'';
  return next;
}

function cex32CopyNativeSections(source,targetData,baseTemplate='') {
  const read=(value,label)=>{
    if(!value)return null;
    let snapshot;
    try {snapshot=JSON.parse(value);} catch {throw new Error('No se pueden recuperar los datos nativos del expediente '+label+'.');}
    if(!['2.3','3.2'].includes(snapshot.version) || !Array.isArray(snapshot.inputs) || snapshot.inputs.length!==4 || snapshot.inputs.some(part=>!Array.isArray(part))) throw new Error('Los datos nativos del expediente '+label+' no tienen el formato esperado.');
    return snapshot;
  };
  const original=read(source.data?.[CEX32_INPUT_KEY],'origen');
  let target=read(targetData[CEX32_INPUT_KEY],'destino');
  if(!original&&!target)return '';
  if(!target) {
    if(!baseTemplate)throw new Error('Falta la plantilla limpia para copiar los datos nativos sin heredar datos personales del origen.');
    target=cex32BlankSnapshot(baseTemplate);
  }
  target=structuredClone(target);
  target.inputs[2]=original?structuredClone(original.inputs[2]):Array.from({length:4},()=>[]);
  target.inputs[3]=original?structuredClone(original.inputs[3]):Array.from({length:14},()=>[]);
  target.shadows=original?structuredClone(original.shadows||[]):[];
  target.sectionVersions={...(target.sectionVersions||{}),
    envelope:original?(original.sectionVersions?.envelope||original.version):'3.2',
    systems:original?(original.sectionVersions?.systems||original.version):'3.2'};
  target.systemContext=original?structuredClone(original.systemContext||{
    zone:String(original.inputs[1][4]),buildingType:cexBuildingType(original.inputs[1][1])
  }):{zone:String(targetData['generales.datos.zonaClimaticaHE1']||''),buildingType:cexBuildingType(targetData['generales.datos.tipoEdificio'])};
  target.copiedSections={recordId:String(source.id||''),at:new Date().toISOString(),sections:['envelope','systems']};
  const encoded=JSON.stringify(target);
  if(encoded.length>360000)throw new Error('Los datos nativos copiados superan el tamaño admitido. No se ha aplicado la copia.');
  return encoded;
}

function cex32SameRows(rows, original) {
  return rows.length === (original || []).length && rows.every((row,index) =>
    Object.keys(row).filter(key => !key.startsWith('__cex')).every(key => String(row[key] ?? '') === String(original[index][key] ?? '')));
}

function cex32FindOriginal(row, originals) {
  if (row.__cexSource) {
    const original = originals.find(item => item.__cexSource === row.__cexSource);
    if (!original) throw new Error('La fila no corresponde a sus datos originales. Vuelve a importar el CEX.');
    return original;
  }
  const matches = originals.filter(item => item.nombre === row.nombre);
  if (matches.length > 1) throw new Error('Hay elementos con el mismo nombre sin identificar. Vuelve a importar el CEX antes de editarlos.');
  return matches[0];
}

function cex32HydrateSources(data) {
  if (!data[CEX32_INPUT_KEY]) {
    let rows=data['envolvente.puentesTermicos.items'];
    if(typeof rows==='string'){try{rows=JSON.parse(rows);}catch{return;}}
    if(Array.isArray(rows))data['envolvente.puentesTermicos.items']=rows.map(row=>row.values?row:{...row,
      origenFi:row.origenFi||'Origen no registrado',origenLongitud:row.origenLongitud||'Origen no registrado'});
    return;
  }
  let source;
  try {
    const snapshot = JSON.parse(data[CEX32_INPUT_KEY]);
    source = cex32ImportedTables(snapshot.inputs);
    if (snapshot.version === '3.2') {
      for (const [index, path] of Object.entries(CEX32_CERTIFICATE_FIELDS)) {
        const value = snapshot.inputs[1]?.[index];
        if (!Object.hasOwn(data, path) && value != null) data[path] = String(value);
      }
    }
  }
  catch { return; } // Export reports malformed snapshots; loading must retain the record.
  for (const [path, originals] of Object.entries(source)) {
    if(typeof data[path]==='string') {
      try {const rows=JSON.parse(data[path]);if(Array.isArray(rows)) data[path]=rows;} catch {}
    }
    if (!Array.isArray(data[path])) continue;
    data[path] = data[path].map(row => {
      if(row.values)return row;
      const matches = originals.filter(item => item.nombre === row.nombre);
      const next={...row};
      if (!next.__cexSource && matches.length === 1) next.__cexSource = matches[0].__cexSource;
      if (/^instalaciones\.(acs|calefaccion|refrigeracion)\.items$/.test(path)) {
        const original = originals.find(item => item.__cexSource === next.__cexSource);
        for (const key of ['potenciaNominal','tipoIntercambioBdC']) {
          if (!Object.hasOwn(next,key) && original?.[key]) next[key] = original[key];
        }
      }
      if(path==='instalaciones.acs.items') {
        const original = originals.find(item => item.__cexSource === next.__cexSource);
        if (original && acsHasTank(original.acumulacion) && (!next.acumulacion || acsHasTank(next.acumulacion))) {
          const inherited = Object.fromEntries(['acumulacion', ...ACS_TANK_FIELDS]
            .filter(key => !Object.hasOwn(next, key)).map(key => [key, original[key]]));
          return {...next, ...inherited};
        }
      }
      if(path==='envolvente.puentesTermicos.items') {
        const original=originals.find(item=>item.__cexSource===next.__cexSource);
        return {...next,...cex32BridgeOrigins(next,original)};
      }
      return next;
    });
  }
}

function cex32NumericChanged(value,before) {
  if(value===undefined)return false;
  const text=String(value??'').trim().replace(',','.'),old=String(before??'').trim().replace(',','.');
  return text!==old && (!text||!old||!Number.isFinite(Number(text))||!Number.isFinite(Number(old))||Number(text)!==Number(old));
}

function cex32BridgeOrigins(row,original,changedKey='') {
  return Object.fromEntries([['fi','origenFi'],['longitud','origenLongitud']].map(([key,origin])=>[
    origin,!original&&changedKey&&key!==changedKey?(row[origin]||'Origen no registrado'):
      original&&!cex32NumericChanged(row[key],original[key])?original[origin]:(String(row[key]??'').trim()?'Introducido':'')
  ]));
}

function cex32PatchNativeSystems(systems, sourceData, currentTables, approvedEstimated = {}) {
  const paths = ['instalaciones.acs.items','instalaciones.calefaccion.items','instalaciones.refrigeracion.items','instalaciones.contribuciones.items'];
  const originals = paths.map(path => sourceData[path] || []);
  const retained = new Map(), edits = new Map(), additions = Array.from({length:7},()=>[]);
  const known = value => /^conocido/i.test(String(value || ''));
  const changed = (row,before,key) => row[key] !== undefined && String(row[key] ?? '') !== String(before[key] ?? '');
  const number = (value,label) => {
    if (!String(value).trim()) throw new Error('Completa ' + label + ' antes de exportar.');
    const n = Number(String(value).replace(',','.'));
    if (!Number.isFinite(n) || n < 0) throw new Error('Revisa el valor de ' + label + '.');
    return n;
  };
  const common = (entity,key,value,apply) => {
    const id=entity+':'+key;
    if (edits.has(id) && edits.get(id)!==String(value)) throw new Error('El equipo compartido tiene cambios contradictorios en ' + key + '.');
    edits.set(id,String(value)); apply();
  };
  for (let table=0;table<4;table++) {
    const used = new Set();
    for (const row of currentTables[table]) {
      const before = cex32FindOriginal(row,originals[table]);
      if (!before) {
        if (table === 3) {
          if (!isUsefulCexContribution(row)) continue;
          additions[6].push(new CexPickleParser(serializeCexContribucionesInput([row])+'.',0).parse()[0]);
          continue;
        }
        additions[table].push(cex32KnownSystem(row,table));
        continue;
      }
      if (used.has(before.__cexSource)) throw new Error('Un mismo equipo original aparece duplicado en la tabla.');
      used.add(before.__cexSource);
      const [,groupText,indexText,serviceText]=before.__cexSource.split(':');
      const group=Number(groupText), index=Number(indexText), service=Number(serviceText), raw=systems[group][index], entity=group+':'+index;
      if (!retained.has(entity)) retained.set(entity,new Set());
      retained.get(entity).add(before.__cexSource);
      if (table===3) {
        for (const [key,slot] of Object.entries({nombre:0,zona:5})) if(changed(row,before,key)) raw[slot]=row[key];
        const maps={acsRenovable:[2,0],calefaccionRenovable:[2,1],refrigeracionRenovable:[2,2],calorRecuperadoAcs:[3,1],calorRecuperadoCalefaccion:[3,2],frioRecuperado:[3,3],energiaConsumidaGeneracionElectricidad:[3,4],combustible:[3,5]};
        for (const [key,[slot,part]] of Object.entries(maps)) if(changed(row,before,key)) {
          if (!Array.isArray(raw[slot])) throw new Error('La contribución necesita revisar sus parámetros nativos.');
          raw[slot][part]=row[key];
        }
        continue;
      }
      const originalKnown=known(before.modoDefinicion);
      if (changed(row,before,'tipoEquipo')) throw new Error('El tipo de un equipo importado debe modificarse en CE3X.');
      if (changed(row,before,'modoDefinicion') && !(originalKnown && known(row.modoDefinicion))) throw new Error('El cambio de modo de definición requiere completar sus parámetros en CE3X.');
      for (const key of ['tipoGenerador','combustible']) if(changed(row,before,key) && !originalKnown) throw new Error('Para cambiar el generador o combustible de un equipo estimado, revisa sus parámetros en CE3X.');
      for (const [key,slot] of Object.entries({nombre:0,tipoGenerador:3,combustible:4,zona:raw.length-1})) {
        if(changed(row,before,key)) common(entity,key,row[key],()=>{raw[slot]=row[key];});
      }
      const legacy = group<3 && service>0 && String(raw[2]?.[service] ?? '')==='';
      const slot=legacy?0:service;
      if(changed(row,before,'rendimientoEstacional')) {
        if(!originalKnown && approvedEstimated[row.__cexSource]!==Number(row.rendimientoEstacional)) throw new Error('El rendimiento estimado se calcula desde sus parámetros. Revísalos en CE3X antes de cambiarlo.');
        const value=number(row.rendimientoEstacional,'rendimiento estacional');
        if(!Array.isArray(raw[7])) throw new Error('El equipo necesita revisar sus parámetros de rendimiento conocidos.');
        raw[2][slot]=value;
        if(originalKnown) {
          if(Array.isArray(raw[7][0])) raw[7][0][slot]=String(row.rendimientoEstacional);
          else raw[7][raw[7].length === 1 ? 0 : slot]=String(row.rendimientoEstacional);
        }
      }
      for(const [key,part] of [['m2Cubiertos',0],['demandaCubierta',1]]) if(changed(row,before,key)) {
        const n=number(row[key],key==='m2Cubiertos'?'superficie cubierta':'porcentaje de demanda');
        if(part===1 && n>100) throw new Error('La demanda cubierta debe estar entre 0 y 100 %.');
        raw[5][slot][part]=String(row[key]);
      }
      if (cexKnownHeatPump(raw[3],raw[6]) && changed(row,before,'tipoIntercambioBdC')) {
        common(entity,'tipoIntercambioBdC',row.tipoIntercambioBdC,()=>{
          raw[7][3] = cex32HeatPumpType(row.tipoIntercambioBdC);
        });
      }
      if (changed(row,before,'potenciaNominal')) {
        const power = cex32Power(row);
        const powerSlot = cexSystemPowerSlot(group);
        if (raw.length - 1 === powerSlot) raw.splice(powerSlot,0,['','','']);
        if (!Array.isArray(raw[powerSlot]) || powerSlot >= raw.length - 1) {
          throw new Error('La potencia de este equipo importado debe revisarse en CE3X.');
        }
        raw[powerSlot][service] = power;
      }
      if (service === 0 && acsTankChanged(row, before)) raw[8] = cex32Tank(row);
    }
  }
  // Keep whole shared equipment or remove all its projections; never split it silently.
  const expected=new Map();
  for(const list of originals) for(const row of list) {
    const [,group,index]=row.__cexSource.split(':'), id=group+':'+index;
    expected.set(id,(expected.get(id)||0)+1);
  }
  for(const [entity,set] of retained) if(set.size!==expected.get(entity)) throw new Error('Un equipo compartido no se puede eliminar solo de uno de sus servicios. Elimínalo de todas sus tablas o revísalo en CE3X.');
  for(let group=0;group<7;group++) systems[group]=(systems[group]||[]).filter((row,index)=>retained.has(group+':'+index)).concat(additions[group]);
}

function cex32NewEquipmentIssue(record) {
  const issues = [];
  const data = record.data || {};
  const snapshot = data[CEX32_INPUT_KEY] ? JSON.parse(data[CEX32_INPUT_KEY]) : null;
  const original = snapshot ? cex32ImportedTables(snapshot.inputs) : {};
  for (const [index, service] of ['acs', 'calefaccion', 'refrigeracion'].entries()) {
    const path = 'instalaciones.' + service + '.items';
    for (const row of cex32Table(record, path)) {
      try {
        const before = cex32FindOriginal(row, original[path] || []);
        if (!before) cex32KnownSystem(row, index);
        else if (index === 0 && acsTankChanged(row, before)) cex32Tank(row);
      } catch (error) {
        issues.push(error.message);
      }
    }
  }
  return issues.join('\n');
}

function acsTankChanged(row, before) {
  const hasTank = acsHasTank(row.acumulacion ?? before.acumulacion);
  return hasTank !== acsHasTank(before.acumulacion) || (hasTank && ACS_TANK_FIELDS.some(key =>
    Object.hasOwn(row, key) && String(row[key]) !== String(before[key] ?? '')));
}

function cex32Tank(row) {
  if (!acsHasTank(row.acumulacion)) return [0];
  const labels = ['volumen por depósito', 'temperatura alta', 'temperatura baja', 'UA total', 'número de depósitos'];
  const values = ACS_TANK_FIELDS.map((key, index) => {
    const text = String(row[key] ?? '').trim().replace(',', '.');
    const value = Number(text);
    if (!text || !Number.isFinite(value) || value <= 0 || (index === 4 && !Number.isSafeInteger(value))) {
      throw new Error('ACS · ' + (row.nombre || 'Equipo sin nombre') + ': indica un valor válido para ' + labels[index] + '.');
    }
    return value;
  });
  const [volume, high, low, ua, count] = values;
  if (high <= low) throw new Error('ACS · ' + (row.nombre || 'Equipo sin nombre') + ': la temperatura alta debe superar a la baja.');
  return [1, String(volume), String(high), String(low), String(ua), 'Conocido', String(count)];
}

function cex32Power(row) {
  const text = String(row.potenciaNominal ?? '').trim().replace(',', '.');
  if (!text) return '';
  if (!/^\d+(?:\.\d+)?$/.test(text) || !Number.isFinite(Number(text)) || Number(text) <= 0) {
    throw new Error((row.nombre || 'Equipo sin nombre') + ': indica una potencia nominal mayor que cero en kW.');
  }
  return text;
}

function cex32MissingPowerIssue(record) {
  const snapshot = record.data?.[CEX32_INPUT_KEY];
  const originals = snapshot ? cex32ImportedTables(JSON.parse(snapshot).inputs) : {};
  const issues = [];
  for (const [service,label] of [['acs','ACS'],['calefaccion','Calefacción'],['refrigeracion','Refrigeración']]) {
    const path = 'instalaciones.' + service + '.items';
    for (const row of cex32Table(record,path)) {
      const original = cex32FindOriginal(row, originals[path] || []);
      if (!cex32Power(row) && (!original || original.potenciaNominal)) {
        issues.push(label + ' / ' + (row.nombre || 'Equipo sin nombre') + ': falta la potencia nominal (kW).');
      }
    }
  }
  return issues.join('\n');
}

function cex32HeatPumpType(value) {
  const index = CEX_HEAT_PUMP_TYPES.indexOf(value || 'Aire-aire');
  if (index < 0) throw new Error('Selecciona el intercambio de la bomba de calor.');
  return index;
}

function cex32KnownSystem(row,service) {
  const label = ['ACS', 'Calefacción', 'Refrigeración'][service] + ' · ' + (row.nombre || 'Equipo sin nombre');
  if (!/^conocido/i.test(String(row.modoDefinicion || ''))) {
    throw new Error(label + ': el modo «' + (row.modoDefinicion || 'sin indicar') +
      '» requiere parámetros nativos de CE³X. Usa «Conocido» solo si tienes un rendimiento estacional justificado.');
  }
  const value=Number(String(row.rendimientoEstacional || '').replace(',','.'));
  if(!Number.isFinite(value) || value<=0) throw new Error(label + ': indica un rendimiento estacional conocido mayor que cero.');
  const performance=['','',''], coverage=[['',''],['',''],['','']];
  performance[service]=value;
  coverage[service]=[String(row.m2Cubiertos||''),String(row.demandaCubierta||'')];
  const parameters=['','',''];
  parameters[service]=String(row.rendimientoEstacional);
  if (cexKnownHeatPump(row.tipoGenerador,row.modoDefinicion)) parameters.push(cex32HeatPumpType(row.tipoIntercambioBdC));
  const power = ['','',''];
  power[service] = cex32Power(row);
  const tail = service === 0 ? [cex32Tank(row), ...(power[0] ? [power] : [])] : [power];
  return [row.nombre,['ACS','calefaccion','refrigeracion'][service],performance,row.tipoGenerador,row.combustible,coverage,'Conocido (Ensayado/justificado)',parameters,...tail,row.zona||'Edificio Objeto'];
}

function buildCex32(template, record) {
  const {blocks, inputs, shadows} = cex32Inputs(template,record);
  const values = blocks.map(block=>block.value);
  values.splice(1,4,...inputs);
  if (shadows) values[10] = shadows;
  // Keep the native blank tail (including its version token). Old improvements/results must be recalculated.
  return blocks[0].text + values.slice(1,13).map(value=>cex32Serialize(value)+'.').join('') + blocks.slice(13).map(block=>block.text).join('');
}
