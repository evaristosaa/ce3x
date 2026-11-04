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
  admin[15] = [String(data['admin.localizacion.referenciaCatastral'] || '')];
  const local = cexCompatibleLocality(admin[2], admin[3]);
  admin[4] = local === 'Otro' ? admin[2] : ''; admin[2] = local;
  if (!admin[26]) admin[26] = 'Ninguna';
  if (!admin[28]) admin[28] = 'ResidencialPrivado';
  assign(general, {0:'generales.datos.normativaVigente',1:'generales.datos.tipoEdificio',2:'generales.datos.provincia',3:'generales.datos.localidad',
    4:'generales.datos.zonaClimaticaHE1',5:'generales.datos.zonaClimaticaHE4',6:'generales.definicion.superficieUtilHabitable',7:'generales.definicion.alturaLibrePlanta',
    8:'generales.definicion.numeroPlantasHabitables',9:'generales.definicion.demandaDiariaACS',10:'generales.definicion.masaParticionesInternas',
    16:'generales.definicion.ventilacionInmueble',19:'generales.datos.anioConstruccion'});
  general[1] = cexBuildingType(general[1]);
  if (/^CTE\s*20\d\d$/i.test(general[0])) general[0] = 'C.T.E.';
  general[12] = local === 'Otro' ? String(data['generales.datos.localidad'] || data['admin.localizacion.localidad'] || '') : '';
  general[3] = cexCompatibleLocality(general[3], general[2]);
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
      inputs[2][index] = rows.map((row, rowIndex) => {
        const oldIndex = original.findIndex(item=>item.nombre === row.nombre);
        if (oldIndex < 0) return generated[rowIndex];
        const item = structuredClone(raw[oldIndex]);
        const before = original[oldIndex];
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
        return item;
      });
    } else inputs[2][index] = generated;
  });
  if (!Array.isArray(inputs[2][3])) inputs[2][3] = [];
  const systemPaths = ['instalaciones.acs.items','instalaciones.calefaccion.items','instalaciones.refrigeracion.items','instalaciones.contribuciones.items'];
  const changed = systemPaths.some(path => !native || !cex32SameRows(cex32Table(record,path), sourceData[path]));
  if (changed) {
    const [acs, heat, cool, contributions] = systemPaths.map(path => cex32Table(record,path));
    // Single-service systems stay independent: do not pair unrelated heating/cooling equipment.
    const single = (row, service) => {
      const performance = ['', '', '']; performance[service] = Number(String(row.rendimientoEstacional || 0).replace(',', '.'));
      const coverage = [['',''],['',''],['','']]; coverage[service] = [String(row.m2Cubiertos || ''),String(row.demandaCubierta || '')];
      const known = ['', '', '']; known[service] = String(row.rendimientoEstacional || '');
      return [row.nombre, ['ACS','calefaccion','refrigeracion'][service], performance, row.tipoGenerador, row.combustible, coverage,
        'Conocido (Ensayado/justificado)', known, ...(service === 0 ? [[0]] : [['','','']]), row.zona || 'Edificio Objeto'];
    };
    if (acs.some(row => /^(s[ií]|true|1)$/i.test(String(row.acumulacion)))) {
      throw new Error('La acumulación de ACS necesita sus parámetros nativos. Conserva la instalación importada o completa la acumulación en CE3X antes de exportar.');
    }
    inputs[3] = Array.from({length:14},()=>[]);
    inputs[3][0] = acs.map(row=>single(row,0));
    inputs[3][1] = heat.map(row=>single(row,1));
    inputs[3][2] = cool.map(row=>single(row,2));
    inputs[3][6] = new CexPickleParser(serializeCexContribucionesInput(contributions)+'.',0).parse();
  } else {
    while (inputs[3].length < 14) inputs[3].push([]);
    if (native.version === '2.3') {
      for (const index of [1,2,3,4,5]) inputs[3][index].forEach(row=> {
        if (row.length === 9) row.splice(8,0,['','','']);
      });
    }
  }
  return { blocks, inputs, shadows: native?.shadows };
}

function cex32ImportedTables(inputs) {
  const s = systemRows(inputs[3]);
  return {'envolvente.cerramientos.items':envelopeRows(inputs[2][0]),'envolvente.huecos.items':envelopeHuecoRows(inputs[2][1]),
    'envolvente.puentesTermicos.items':envelopePuenteRows(inputs[2][2]),'instalaciones.acs.items':s.acs,
    'instalaciones.calefaccion.items':s.calefaccion,'instalaciones.refrigeracion.items':s.refrigeracion,'instalaciones.contribuciones.items':s.contribuciones};
}

function cex32SameRows(rows, original) {
  return rows.length === (original || []).length && rows.every((row,index) =>
    Object.keys(row).every(key => String(row[key] ?? '') === String(original[index][key] ?? '')));
}

function buildCex32(template, record) {
  const {blocks, inputs, shadows} = cex32Inputs(template,record);
  const values = blocks.map(block=>block.value);
  values.splice(1,4,...inputs);
  if (shadows) values[10] = shadows;
  // Keep the native blank tail (including its version token). Old improvements/results must be recalculated.
  return blocks[0].text + values.slice(1,13).map(value=>cex32Serialize(value)+'.').join('') + blocks.slice(13).map(block=>block.text).join('');
}
