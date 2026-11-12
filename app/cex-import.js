const CEX32_CERTIFICATE_FIELDS = {
  22: 'generales.definicion.superficieUtilCertificada',
  23: 'generales.definicion.numeroViviendas',
  24: 'generales.definicion.plantasBajoRasante',
  25: 'generales.definicion.plantasSobreRasante',
};

/* Minimal protocol-0 pickle reader for the text streams used by CE3X 2.3 and 3.2. */
function parseCexRecordData(text) {
  const source = String(text || '').replace(/\r\n/g, '\n');
  const version = source.match(/^S'(?:CEXv(2\.3)|CE3Xv(3\.2)) Residencial'\n/);
  if (!version) {
    throw new Error('Solo se admiten archivos residenciales de CE3X 2.3 o 3.2. No se ha importado el archivo.');
  }
  const streams = parseCexPickleStreams(source, 5);
  const admin = Array.isArray(streams[1]) ? streams[1] : [];
  const general = Array.isArray(streams[2]) ? streams[2] : [];
  const envelope = Array.isArray(streams[3]) ? streams[3] : [];
  const systems = Array.isArray(streams[4]) ? streams[4] : [];
  if (admin.length < 4 || general.length < 10 || !Array.isArray(envelope[0])) {
    throw new Error('No he podido leer la estructura de datos del archivo CEX.');
  }

  const data = {};
  data['cex.sourceVersion'] = version[1] || version[2];
  const set = (path, value) => {
    if (value !== undefined && value !== null) data[path] = String(value);
  };
  const boolText = value => value ? 'Si' : 'No';
  const first = value => Array.isArray(value) ? value[0] : value;

  set('admin.localizacion.nombreEdificio', admin[0]);
  set('admin.localizacion.direccion', admin[1]);
  set('admin.localizacion.localidad', admin[2] === 'Otro' ? (admin[4] || admin[2]) : admin[2]);
  set('admin.localizacion.provincia', admin[3]);
  set('admin.localizacion.codigoPostal', admin[14]);
  set('admin.localizacion.referenciaCatastral', first(admin[15]));
  set('admin.cliente.nombreRazonSocial', admin[5]);
  set('admin.cliente.nif', admin[6]);
  set('admin.cliente.direccion', admin[7]);
  set('admin.cliente.telefono', admin[8]);
  set('admin.cliente.email', admin[9]);
  set('admin.cliente.localidad', admin[16]);
  set('admin.cliente.provincia', admin[17]);
  set('admin.cliente.codigoPostal', admin[18]);
  set('admin.tecnico.razonSocial', admin[10]);
  set('admin.tecnico.nombre', admin[11]);
  set('admin.tecnico.telefono', admin[12]);
  set('admin.tecnico.email', admin[13]);
  set('admin.tecnico.nif', admin[19]);
  set('admin.tecnico.cif', admin[20]);
  set('admin.tecnico.direccion', admin[21]);
  set('admin.tecnico.provincia', admin[22]);
  set('admin.tecnico.localidad', admin[23]);
  set('admin.tecnico.codigoPostal', admin[24]);
  set('admin.tecnico.titulacion', admin[25]);

  set('generales.datos.normativaVigente', general[0]);
  set('generales.datos.tipoEdificio', importedBuildingType(general[1]));
  set('generales.datos.provincia', general[2]);
  set('generales.datos.localidad', general[3] === 'Otro' ? (general[12] || general[3]) : general[3]);
  set('generales.datos.zonaClimaticaHE1', general[4]);
  set('generales.datos.zonaClimaticaHE4', general[5]);
  set('generales.definicion.superficieUtilHabitable', general[6]);
  set('generales.definicion.alturaLibrePlanta', general[7]);
  set('generales.definicion.numeroPlantasHabitables', general[8]);
  set('generales.definicion.demandaDiariaACS', general[9]);
  set('generales.definicion.masaParticionesInternas', general[10]);
  set('generales.definicion.ensayoEstanqueidad', boolText(general[11]));
  set('generales.definicion.imagenEdificio', importedImageData(general[17]));
  set('generales.definicion.planoSituacion', importedImageData(general[18]));
  set('generales.definicion.ventilacionInmueble', general[16]);
  set('generales.datos.anioConstruccion', general[19]);
  if (version[2]) Object.entries(CEX32_CERTIFICATE_FIELDS).forEach(([index, path]) => set(path, general[index]));

  data['envolvente.cerramientos.items'] = envelopeRows(envelope[0]);
  data['envolvente.huecos.items'] = envelopeHuecoRows(envelope[1]);
  data['envolvente.puentesTermicos.items'] = envelopePuenteRows(envelope[2]);
  const importedSystems = systemRows(systems);
  data['instalaciones.acs.items'] = importedSystems.acs;
  data['instalaciones.calefaccion.items'] = importedSystems.calefaccion;
  data['instalaciones.refrigeracion.items'] = importedSystems.refrigeracion;
  data['instalaciones.contribuciones.items'] = importedSystems.contribuciones;
  if (version[2]) {
    set('admin.localizacion.gradoProteccion', admin[26]);
    set('admin.localizacion.usoEdificio', admin[28]);
  }
  if (typeof cex32Snapshot === 'function') data['cex.nativeInputs'] = cex32Snapshot(source, version[1] || version[2]);
  return data;
}

function parseCexPickleStreams(source, limit) {
  const streams = [];
  let offset = 0;
  while (offset < source.length && streams.length < limit) {
    const parser = new CexPickleParser(source, offset);
    try {
      streams.push(parser.parse());
    } catch (error) {
      throw new Error(`No he podido leer el CEX (${error.message}).`);
    }
    if (parser.index <= offset) break;
    offset = parser.index;
  }
  return streams;
}

class CexPickleParser {
  constructor(source, offset) {
    this.source = source;
    this.index = offset;
    this.stack = [];
    this.memo = Object.create(null);
  }

  parse() {
    while (this.index < this.source.length) {
      const opcode = this.source[this.index++];
      switch (opcode) {
        case '(':
          this.stack.push(cexPickleMark);
          break;
        case 'l':
        case 't': {
          const mark = this.stack.lastIndexOf(cexPickleMark);
          if (mark < 0) throw new Error('marca de lista no encontrada');
          const values = this.stack.splice(mark + 1);
          this.stack.pop();
          this.stack.push(values);
          break;
        }
        case 'a': {
          const value = this.stack.pop();
          const list = this.stack[this.stack.length - 1];
          if (!Array.isArray(list)) throw new Error('lista no encontrada');
          list.push(value);
          break;
        }
        case 'e': {
          const mark = this.stack.lastIndexOf(cexPickleMark);
          if (mark < 1 || !Array.isArray(this.stack[mark - 1])) throw new Error('lista APPENDS no encontrada');
          const list = this.stack[mark - 1];
          list.push(...this.stack.splice(mark + 1));
          this.stack.splice(mark, 1);
          break;
        }
        case 'd': {
          const mark = this.stack.lastIndexOf(cexPickleMark);
          if (mark < 0) throw new Error('marca de diccionario no encontrada');
          const values = this.stack.splice(mark + 1);
          this.stack.pop();
          const object = Object.create(null);
          for (let index = 0; index < values.length; index += 2) object[String(values[index])] = values[index + 1];
          this.stack.push(object);
          break;
        }
        case '}':
          this.stack.push(Object.create(null));
          break;
        case ']':
          this.stack.push([]);
          break;
        case 's': {
          const value = this.stack.pop();
          const key = this.stack.pop();
          const object = this.stack[this.stack.length - 1];
          if (!object || typeof object !== 'object') throw new Error('diccionario SETITEM no encontrado');
          if (['__proto__','constructor','prototype'].includes(String(key))) throw new Error('clave de diccionario no permitida');
          object[String(key)] = value;
          break;
        }
        case 'u': {
          const mark = this.stack.lastIndexOf(cexPickleMark);
          if (mark < 1 || !this.stack[mark - 1] || typeof this.stack[mark - 1] !== 'object') throw new Error('diccionario SETITEMS no encontrado');
          const object = this.stack[mark - 1];
          const values = this.stack.splice(mark + 1);
          for (let index = 0; index < values.length; index += 2) object[String(values[index])] = values[index + 1];
          this.stack.splice(mark, 1);
          break;
        }
        case '0': this.stack.pop(); break;
        case '1': {
          const mark = this.stack.lastIndexOf(cexPickleMark);
          if (mark < 0) throw new Error('marca POP_MARK no encontrada');
          this.stack.splice(mark);
          break;
        }
        case '2': this.stack.push(this.stack[this.stack.length - 1]); break;
        case 'N': this.stack.push(null); break;
        case 'I': {
          const value = this.readLine();
          this.stack.push(value === 'True' ? true : value === 'False' ? false : Number(value));
          break;
        }
        case 'F': this.stack.push(Number(this.readLine())); break;
        case 'L': this.stack.push(Number(this.readLine().replace(/L$/, ''))); break;
        case 'S': this.stack.push(decodeCexPickleString(this.readLine())); break;
        case 'V': this.stack.push(this.readLine().replace(/\\u([0-9a-fA-F]{4})|\\U([0-9a-fA-F]{8})/g, (_, u, U) => String.fromCodePoint(parseInt(u || U, 16)))); break;
        case 'p': this.memo[this.readLine()] = this.stack[this.stack.length - 1]; break;
        case 'g': { const key = this.readLine(); if (!(key in this.memo)) throw new Error('referencia de memoria no encontrada'); this.stack.push(this.memo[key]); break; }
        case 'q': this.memo[this.source[this.index++]] = this.stack[this.stack.length - 1]; break;
        case 'c': {
          const module = this.readLine();
          const name = this.readLine();
          this.stack.push({ __cexClass: `${module}.${name}` });
          break;
        }
        case 'i': {
          const module = this.readLine();
          const name = this.readLine();
          const mark = this.stack.lastIndexOf(cexPickleMark);
          if (mark >= 0) this.stack.splice(mark);
          this.stack.push({ __cexClass: `${module}.${name}` });
          break;
        }
        case 'o': {
          const mark = this.stack.lastIndexOf(cexPickleMark);
          const values = mark >= 0 ? this.stack.splice(mark) : [];
          this.stack.push({ __cexClass: values[1]?.__cexClass || '', __args: values.slice(2) });
          break;
        }
        case 'b': {
          const state = this.stack.pop();
          const object = this.stack[this.stack.length - 1];
          if (object && state && typeof state === 'object') Object.assign(object, Array.isArray(state) && state[0] && typeof state[0] === 'object' ? state[0] : state);
          break;
        }
        case 'R': {
          const args = this.stack.pop();
          const callable = this.stack.pop();
          this.stack.push({ __cexClass: callable?.__cexClass || '', __args: args });
          break;
        }
        case 'T': {
          const bytes = this.source.slice(this.index, this.index + 4);
          this.index += 4;
          const length = bytes.charCodeAt(0) | (bytes.charCodeAt(1) << 8) | (bytes.charCodeAt(2) << 16) | (bytes.charCodeAt(3) << 24);
          this.stack.push(this.source.slice(this.index, this.index + length));
          this.index += length;
          break;
        }
        case '.': return this.stack[this.stack.length - 1];
        case '\n':
        case '\r':
        case ' ':
        case '\t': break;
        default: throw new Error(`opcode ${JSON.stringify(opcode)} no soportado`);
      }
    }
    throw new Error('fin de archivo inesperado');
  }

  readLine() {
    const end = this.source.indexOf('\n', this.index);
    if (end < 0) throw new Error('linea incompleta');
    const value = this.source.slice(this.index, end).replace(/\r$/, '');
    this.index = end + 1;
    return value;
  }
}

const cexPickleMark = {};

function decodeCexPickleString(value) {
  const text = String(value || '');
  if (text.length < 2 || text[0] !== "'" || text[text.length - 1] !== "'") return text;
  return text.slice(1, -1).replace(/\\(x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|n|r|t|\\|')/g, (match, code) => {
    if (code[0] === 'x' || code[0] === 'u') return String.fromCharCode(parseInt(code.slice(1), 16));
    return ({ n: '\n', r: '\r', t: '\t', '\\': '\\', "'": "'" })[code] || code;
  });
}

function importedImageData(value) {
  const base64 = String(value || '').trim();
  if (/^iVBORw0KGgo/.test(base64)) return `data:image/png;base64,${base64}`;
  if (/^\/9j\//.test(base64)) return `data:image/jpeg;base64,${base64}`;
  return '';
}

function importedBuildingType(value) {
  const text = String(value || '').toLocaleLowerCase('es-ES');
  if (text.includes('bloque')) return 'Bloque de viviendas';
  if (text.includes('terciario')) return 'Terciario';
  return text.includes('unifamiliar') ? 'Unifamiliar' : String(value || '');
}

function cexImportValue(value) {
  return value === undefined || value === null || typeof value === 'object' ? '' : String(value);
}

function envelopeRows(rows) {
  return (Array.isArray(rows) ? rows : []).map((item, index) => ({
    __cexSource: `e:0:${index}`,
    nombre: cexImportValue(item[0]), tipoCerramiento: cexImportValue(item[1]), superficie: cexImportValue(item[2]),
    u: cexImportValue(item[3]), peso: cexImportValue(item[4]), posicion: cexImportValue(item[5]),
    patronSombras: cexImportValue(item[7]), modoDefinicion: cexImportValue(item[8]),
  })).filter(item => item.nombre || item.tipoCerramiento);
}

function envelopeHuecoRows(rows) {
  return (Array.isArray(rows) ? rows : []).map((item, index) => ({
    __cexSource: `e:1:${index}`,
    nombre: cexImportValue(item.descripcion), cerramientoAsociado: cexImportValue(item.cerramientoAsociado),
    longitud: cexImportValue(item.longitud), altura: cexImportValue(item.altura), multiplicador: cexImportValue(item.multiplicador),
    superficie: cexImportValue(item.superficie), uVidrio: cexImportValue(item.Uvidrio), gVidrio: cexImportValue(item.Gvidrio),
    uMarco: cexImportValue(item.Umarco), porcMarco: cexImportValue(item.porcMarco),
    absortividadMarco: cexImportValue(item.absortividadValor), modoDefinicion: /HuecoConocidas$/.test(item.__cexClass || '') ? 'Conocidas' : 'Estimadas',
    permeabilidad: cexImportValue(item.permeabilidadValor), orientacion: cexImportValue(item.orientacion),
    patronSombras: cexImportValue(item.patronSombras),
  })).filter(item => item.nombre || item.superficie);
}

function envelopePuenteRows(rows) {
  return (Array.isArray(rows) ? rows : []).map((item, index) => ({
    __cexSource: `e:2:${index}`,
    nombre: cexImportValue(item[0]), tipoPuenteTermico: cexImportValue(item[2]), fi: cexImportValue(item[3]),
    longitud: cexImportValue(item[4]), cerramientoAsociado: cexImportValue(item[7]),
    origenFi: item[5] === 'defecto_fi' ? 'Por defecto' : item[5] === 'usuario_fi' ? 'Introducido' : 'Importado',
    origenLongitud: item[6] === 'defecto' ? 'Por defecto' : item[6] === 'usuario' ? 'Introducido' : 'Importado',
  })).filter(item => item.nombre || item.tipoPuenteTermico);
}

const ACS_TANK_FIELDS = ['depositoVolumen', 'depositoTemperaturaAlta', 'depositoTemperaturaBaja', 'depositoUA', 'depositoCantidad'];

function acsHasTank(value) {
  return /^(s[ií]|true|1)$/i.test(String(value));
}

function systemTankFields(tank) {
  if (!tank?.[0]) return {acumulacion: 'No'};
  const [volume, high, low, ua, count] = ACS_TANK_FIELDS;
  return {acumulacion: 'Sí', [volume]: cexImportValue(tank[1]), [high]: cexImportValue(tank[2]),
    [low]: cexImportValue(tank[3]), [ua]: cexImportValue(tank[4]), [count]: cexImportValue(tank.at(-1))};
}

function systemAcsRow(item) {
  return {
    nombre: cexImportValue(item?.[0]), tipoEquipo: 'ACS', modoDefinicion: cexImportValue(item?.[6]),
    tipoGenerador: cexImportValue(item?.[3]), combustible: cexImportValue(item?.[4]),
    rendimientoEstacional: cexImportValue(item?.[2]?.[0]), m2Cubiertos: cexImportValue(item?.[5]?.[0]?.[0]),
    demandaCubierta: cexImportValue(item?.[5]?.[0]?.[1]), zona: cexImportValue(item?.[item.length - 1]),
    ...systemTankFields(item?.[8]),
  };
}

function systemClimateRow(item, index, type) {
  return {
    nombre: cexImportValue(item?.[0]), tipoEquipo: type, modoDefinicion: cexImportValue(item?.[6]),
    tipoGenerador: cexImportValue(item?.[3]), combustible: cexImportValue(item?.[4]),
    rendimientoEstacional: cexImportValue(item?.[2]?.[index]), m2Cubiertos: cexImportValue(item?.[5]?.[index]?.[0]),
    demandaCubierta: cexImportValue(item?.[5]?.[index]?.[1]), zona: cexImportValue(item?.[item.length - 1]),
  };
}

function systemContributionRow(item) {
  return {
    nombre: cexImportValue(item?.[0]), zona: cexImportValue(item?.[5]), acsRenovable: cexImportValue(item?.[2]?.[0]),
    calefaccionRenovable: cexImportValue(item?.[2]?.[1]), refrigeracionRenovable: cexImportValue(item?.[2]?.[2]),
    calorRecuperadoAcs: cexImportValue(item?.[3]?.[1]), calorRecuperadoCalefaccion: cexImportValue(item?.[3]?.[2]),
    frioRecuperado: cexImportValue(item?.[3]?.[3]), energiaConsumidaGeneracionElectricidad: cexImportValue(item?.[3]?.[4]),
    autoconsumoFotovoltaicoAnual: cexImportValue(item?.[3]?.[0]),
    combustible: cexImportValue(item?.[3]?.[5]),
  };
}

const CEX_HEAT_PUMP_TYPES = ['Aire-aire', 'Aire-agua', 'Otro', 'Agua-agua'];

function cexKnownHeatPump(generator, mode) {
  return /^bomba de calor$/i.test(String(generator).trim()) && /^conocido/i.test(String(mode));
}

function cexSystemPowerSlot(group) {
  return [0,4,5].includes(group) ? 9 : 8;
}

function systemRows(stream) {
  const result = { acs: [], calefaccion: [], refrigeracion: [], contribuciones: [] };
  if (!Array.isArray(stream)) return result;
  const push = (key, row, group, index, service) => {
    if (group < 6) {
      const raw = stream[group][index];
      if (cexKnownHeatPump(raw[3], raw[6]) && Number.isInteger(raw[7]?.[3])) {
        row.tipoIntercambioBdC = CEX_HEAT_PUMP_TYPES[raw[7][3]] || '';
      }
      const slot = cexSystemPowerSlot(group);
      if (slot < raw.length - 1 && Array.isArray(raw[slot])) {
        row.potenciaNominal = cexImportValue(raw[slot][service]);
      }
    }
    result[key].push({...row, __cexSource: `s:${group}:${index}:${service}`});
  };
  (stream[0] || []).forEach((item,index) => push('acs',systemAcsRow(item),0,index,0));
  const singleClimate = (item, service, label) => {
    const slot = cexImportValue(item?.[2]?.[service]) === '' ? 0 : service;
    return systemClimateRow(item, slot, label);
  };
  (stream[1] || []).forEach((item,index) => push('calefaccion',singleClimate(item,1,'Calefacción'),1,index,1));
  (stream[2] || []).forEach((item,index) => push('refrigeracion',singleClimate(item,2,'Refrigeración'),2,index,2));
  (stream[3] || []).forEach((item,index) => {
    push('calefaccion',systemClimateRow(item,1,'Calefacción y refrigeración'),3,index,1);
    push('refrigeracion',systemClimateRow(item,2,'Calefacción y refrigeración'),3,index,2);
  });
  (stream[4] || []).forEach((item,index) => {
    push('acs',{...systemClimateRow(item,0,'ACS'), ...systemTankFields(item?.[8])},4,index,0);
    push('calefaccion',systemClimateRow(item,1,'Calefacción'),4,index,1);
  });
  (stream[5] || []).forEach((item,index) => {
    push('acs',{...systemClimateRow(item,0,'ACS'), ...systemTankFields(item?.[8])},5,index,0);
    push('calefaccion',systemClimateRow(item,1,'Calefacción'),5,index,1);
    push('refrigeracion',systemClimateRow(item,2,'Refrigeración'),5,index,2);
  });
  (stream[6] || []).forEach((item,index) => push('contribuciones',systemContributionRow(item),6,index,0));
  return result;
}
