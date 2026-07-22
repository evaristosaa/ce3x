const STORAGE_KEY = 'ce3x-captura-config';
const LOCAL_KEY = 'ce3x-captura-local-records';
const LOCAL_BACKUP_KEY = 'ce3x-captura-local-backups';
const LOCAL_DATA_KEYS = [LOCAL_KEY, LOCAL_BACKUP_KEY];
const WRITE_ACTIONS = ['save', 'patch', 'delete', 'markGenerated'];
const CASA37_REFERENCE = '0128501TG4302N0037ZI';
const TECHNICIAN_PATH_PREFIX = 'admin.tecnico.';

const DEFAULT_TECHNICIAN = {
  'admin.tecnico.nombre': 'JUAN JOSÉ MORENO FRESNO',
  'admin.tecnico.razonSocial': '.',
  'admin.tecnico.nif': '28629645G',
  'admin.tecnico.cif': '.',
  'admin.tecnico.direccion': 'C/ JOSÉ MEJIAS SALGUERO Nº4, CASA 37',
  'admin.tecnico.provincia': 'Sevilla',
  'admin.tecnico.localidad': 'DOS HERMANAS',
  'admin.tecnico.codigoPostal': '41704',
  'admin.tecnico.telefono': '665379127',
  'admin.tecnico.email': 'juanjmf8@gmail.com',
  'admin.tecnico.titulacion': 'INGENIERO TÉCNICO DE MINAS',
};

const DEFAULT_CLIENT = {
  'admin.cliente.telefono': '.',
  'admin.cliente.email': '.',
};

const DEFAULT_GENERAL = {
  'generales.definicion.alturaLibrePlanta': '2.70',
  'generales.definicion.masaParticionesInternas': 'Ligera',
};

const CEX37_DEFAULTS = {
  'admin.localizacion.nombreEdificio': 'PL SEN-1 ENTRENUCLEOS 40(D)',
  'admin.localizacion.direccion': 'C/ JOSÉ MEJIAS SALGUERO Nº4, CASA 37',
  'admin.localizacion.provincia': 'Sevilla',
  'admin.localizacion.localidad': 'Dos Hermanas',
  'admin.localizacion.codigoPostal': '41704',
  'admin.localizacion.referenciaCatastral': CASA37_REFERENCE,
  'admin.cliente.nombreRazonSocial': 'JUAN JOSÉ MORENO FRESNO',
  'admin.cliente.direccion': 'C/ JOSÉ MEJIAS SALGUERO Nº4, CASA 37',
  'admin.cliente.provincia': 'Sevilla',
  'admin.cliente.localidad': 'DOS HERMANAS',
  'admin.cliente.codigoPostal': '41704',
  'admin.cliente.telefono': '665379127',
  'admin.cliente.email': '.',
  'generales.datos.normativaVigente': 'CTE 2013',
  'generales.datos.anioConstruccion': '2021',
  'generales.datos.tipoEdificio': 'Unifamiliar',
  'generales.datos.provincia': 'Sevilla',
  'generales.datos.localidad': 'Dos Hermanas',
  'generales.datos.zonaClimaticaHE1': 'B4',
  'generales.datos.zonaClimaticaHE4': 'V',
  'generales.definicion.superficieUtilHabitable': '149.40',
  'generales.definicion.alturaLibrePlanta': '2.60',
  'generales.definicion.numeroPlantasHabitables': '3',
  'generales.definicion.ventilacionInmueble': '0.63',
  'generales.definicion.demandaDiariaACS': '120',
  'generales.definicion.masaParticionesInternas': 'Media',
  'generales.definicion.ensayoEstanqueidad': 'No',
  'envolvente.cerramientos.items': [
    row(['Cubierta con aire', 'Cubierta', '76', '0.33', '344', 'Techo', 'Por defecto', 'Sin patrón']),
    row(['Suelo con terreno', 'Suelo', '18', '0.38', '750', 'Suelo', 'Por defecto', 'Sin patrón']),
    row(['Muro de fachada no', 'Fachada', '39.98', '0.38', '200.0', 'NO', 'Por defecto', 'Sin patrón']),
    row(['Muro de fachada se', 'Fachada', '39.98', '0.38', '200.0', 'SE', 'Por defecto', 'Sin patrón']),
    row(['Muro de fachada so', 'Fachada', '12.67', '0.38', '200.0', 'SO', 'Por defecto', 'Sin patrón']),
  ],
  'envolvente.huecos.items': [
    row(['Hueco 1', 'Muro de fachada no', '0.90', '1.25', '1', '1.13', '3.3', '0.75', '4.0', '20', '0.65', 'Estimadas', '50', 'NO', 'Sin patrón']),
    row(['Hueco 3', 'Muro de fachada no', '0.45', '1.25', '1', '0.56', '3.3', '0.75', '4.0', '20', '0.65', 'Estimadas', '50', 'NO', 'Sin patrón']),
    row(['Hueco 2', 'Muro de fachada so', '0.85', '1.25', '1', '1.06', '3.3', '0.75', '4.0', '20', '0.65', 'Estimadas', '50', 'SO', 'Sin patrón']),
    row(['Hueco 7', 'Muro de fachada so', '0.85', '1.30', '1', '1.1', '3.3', '0.75', '4.0', '20', '0.65', 'Estimadas', '50', 'SO', 'Sin patrón']),
    row(['Hueco 6', 'Muro de fachada no', '0.95', '2.25', '1', '2.14', '3.3', '0.75', '4.0', '20', '0.65', 'Estimadas', '50', 'NO', 'Sin patrón']),
    row(['Hueco 8', 'Muro de fachada no', '0.45', '1.25', '1', '0.56', '3.3', '0.75', '4.0', '20', '0.65', 'Estimadas', '50', 'NO', 'Sin patrón']),
    row(['Hueco 4', 'Muro de fachada se', '2.65', '2.05', '1', '5.43', '3.3', '0.75', '4.0', '20', '0.65', 'Estimadas', '50', 'SE', 'Sin patrón']),
    row(['Hueco 5', 'Muro de fachada se', '1.35', '2.05', '1', '2.77', '3.3', '0.75', '4.0', '20', '0.65', 'Estimadas', '50', 'SE', 'Sin patrón']),
    row(['Hueco 10', 'Muro de fachada se', '1.30', '1.30', '1', '1.69', '3.3', '0.75', '4.0', '20', '0.65', 'Estimadas', '50', 'SE', 'Sin patrón']),
    row(['Hueco 9', 'Muro de fachada se', '1.85', '2.15', '1', '3.98', '3.3', '0.75', '4.0', '20', '0.65', 'Estimadas', '50', 'SE', 'Sin patrón']),
  ],
  'envolvente.puentesTermicos.items': [
    row(['PT Encuentro de fachada con cubierta-Cubierta con aire', 'Cubierta con aire', 'Encuentro de fachada con cubierta', '0.82', '34.86']),
    row(['Fachada con solera-Suelo con terreno', 'Suelo con terreno', 'Encuentro de fachada con solera', '0.14', '18.86']),
    row(['Pilar en fachada-Muro de fachada SE', 'Muro de fachada no', 'Pilar integrado en fachada', '1.05', '19.5']),
    row(['Fachada con forjado-Muro de fachada SE', 'Muro de fachada no', 'Encuentro de fachada con forjado', '1.31', '12.3']),
    row(['Pilar en fachada-Muro de fachada NO', 'Muro de fachada se', 'Pilar integrado en fachada', '1.05', '19.5']),
    row(['Fachada con forjado-Muro de fachada NO', 'Muro de fachada se', 'Encuentro de fachada con forjado', '1.31', '12.3']),
    row(['Pilar en fachada-Muro de fachada NE', 'Muro de fachada so', 'Pilar integrado en fachada', '1.05', '13.0']),
    row(['Fachada con forjado-Muro de fachada NE', 'Muro de fachada so', 'Encuentro de fachada con forjado', '1.31', '3.9']),
  ],
  'instalaciones.acs.items': [
    row(['Equipo ACS', 'ACS', 'Estimado según Instalación', 'Caldera Estándar', 'Electricidad', '100.0', '149.4', '100', 'Edificio Objeto', 'Sí']),
  ],
  'instalaciones.calefaccion.items': [
    row(['Calefacción y refrigeración', 'Calefacción y refrigeración', 'Estimado según Instalación', 'Bomba de Calor', 'Electricidad', '187.7', '121.7', '81.46', 'Edificio Objeto']),
  ],
  'instalaciones.refrigeracion.items': [
    row(['Calefacción y refrigeración', 'Calefacción y refrigeración', 'Estimado según Instalación', 'Bomba de Calor', 'Electricidad', '142.4', '121.7', '81.46', 'Edificio Objeto']),
  ],
  'instalaciones.contribuciones.items': [
    row(['Contribuciones energéticas', 'Edificio Objeto', '80', '', '', '', '', '', '10200', 'Electricidad']),
  ],
};

const SELECT_OPTIONS = {
  normativaVigente: ['Anterior', 'NBE-CT-79', 'CTE 2006', 'CTE 2013'],
  tipoEdificio: ['Unifamiliar', 'Bloque de viviendas', 'Vivienda individual', 'Terciario'],
  provincia: ['Sevilla', 'Huelva', 'Cádiz', 'Córdoba', 'Málaga'],
  localidad: ['Dos Hermanas', 'DOS HERMANAS', 'Sevilla'],
  zonaClimaticaHE1: ['B4', 'A3', 'A4', 'B3', 'C3', 'C4', 'D3'],
  zonaClimaticaHE4: ['V', 'I', 'II', 'III', 'IV'],
  masaParticionesInternas: ['Ligera', 'Media', 'Pesada'],
  ensayoEstanqueidad: ['No', 'Sí'],
  tipoCerramiento: ['Cubierta', 'Suelo', 'Fachada', 'Medianera'],
  posicion: ['Techo', 'Suelo', 'NO', 'NE', 'SE', 'SO', 'N', 'S', 'E', 'O'],
  modoDefinicion: ['Por defecto', 'Estimadas', 'Estimado', 'Estimado según Instalación', 'Conocido'],
  patronSombras: ['Sin patrón'],
  tipoEquipo: ['ACS', 'Calefacción', 'Refrigeración', 'Calefacción y refrigeración'],
  tipoGenerador: ['Caldera Estándar', 'Bomba de Calor', 'Efecto Joule', 'Equipo autónomo'],
  combustible: ['Electricidad', 'Gas Natural', 'Gasóleo-C', 'GLP', 'Biomasa'],
  zona: ['Edificio Objeto'],
  acumulacion: ['Sí', 'No'],
};

const SECTIONS = [
  section('admin', 'Datos administrativos', [
    group('localizacion', 'Localización e identificación del edificio', ['nombreEdificio', 'direccion', 'provincia', 'localidad', 'codigoPostal', 'referenciaCatastral'], [
      field('nombreEdificio', 'Nombre del edificio'),
      field('direccion', 'Dirección'),
      field('provincia', 'Provincia/Ciudad autónoma', 'select', { optionsKey: 'provincia' }),
      field('localidad', 'Localidad', 'select', { optionsKey: 'localidad' }),
      field('codigoPostal', 'Código Postal'),
      field('referenciaCatastral', 'Referencia Catastral'),
    ]),
    group('cliente', 'Datos del cliente', ['nombreRazonSocial', 'direccion', 'provincia', 'localidad', 'codigoPostal', 'telefono'], [
      field('nombreRazonSocial', 'Nombre o razón social'),
      field('direccion', 'Dirección'),
      field('provincia', 'Provincia/Ciudad autónoma', 'select', { optionsKey: 'provincia' }),
      field('localidad', 'Localidad'),
      field('codigoPostal', 'Código Postal'),
      field('telefono', 'Teléfono'),
      field('email', 'E-mail'),
    ]),
    group('tecnico', 'Datos del técnico certificador', ['nombre', 'nif', 'direccion', 'provincia', 'localidad', 'codigoPostal', 'telefono', 'email', 'titulacion'], [
      field('nombre', 'Nombre y Apellidos'),
      field('nif', 'NIF'),
      field('razonSocial', 'Razón social'),
      field('cif', 'CIF'),
      field('direccion', 'Dirección'),
      field('provincia', 'Provincia/Ciudad autónoma', 'select', { optionsKey: 'provincia' }),
      field('localidad', 'Localidad'),
      field('codigoPostal', 'Código Postal'),
      field('telefono', 'Teléfono'),
      field('email', 'E-mail'),
      field('titulacion', 'Titulación habilitante según normativa vigente'),
    ]),
  ]),
  section('generales', 'Datos generales', [
    group('datos', 'Datos generales', ['normativaVigente', 'anioConstruccion', 'tipoEdificio', 'provincia', 'localidad', 'zonaClimaticaHE1', 'zonaClimaticaHE4'], [
      field('normativaVigente', 'Normativa vigente', 'select', { optionsKey: 'normativaVigente' }),
      field('anioConstruccion', 'Año construcción'),
      field('tipoEdificio', 'Tipo de edificio', 'select', { optionsKey: 'tipoEdificio' }),
      field('provincia', 'Provincia/Ciudad autónoma', 'select', { optionsKey: 'provincia' }),
      field('localidad', 'Localidad', 'select', { optionsKey: 'localidad' }),
      field('zonaClimaticaHE1', 'Zona climática HE-1', 'select', { optionsKey: 'zonaClimaticaHE1' }),
      field('zonaClimaticaHE4', 'Zona climática HE-4', 'select', { optionsKey: 'zonaClimaticaHE4' }),
    ]),
    group('definicion', 'Definición edificio', ['superficieUtilHabitable', 'alturaLibrePlanta', 'numeroPlantasHabitables', 'ventilacionInmueble', 'demandaDiariaACS', 'masaParticionesInternas'], [
      field('superficieUtilHabitable', 'Superficie útil habitable', 'number', { unit: 'm2' }),
      field('alturaLibrePlanta', 'Altura libre de planta', 'number', { unit: 'm' }),
      field('numeroPlantasHabitables', 'Número de plantas habitables', 'number'),
      field('ventilacionInmueble', 'Ventilación del inmueble', 'number', { unit: 'ren/h' }),
      field('demandaDiariaACS', 'Demanda diaria de ACS', 'number', { unit: 'l/día' }),
      field('masaParticionesInternas', 'Masa de las particiones internas', 'select', { optionsKey: 'masaParticionesInternas' }),
      field('ensayoEstanqueidad', 'Se ha ensayado la estanqueidad del edificio', 'select', { optionsKey: 'ensayoEstanqueidad' }),
      field('imagenEdificio', 'Imagen edificio', 'image'),
      field('planoSituacion', 'Plano situación', 'image'),
    ]),
  ]),
  section('envolvente', 'Envolvente térmica', [
    group('cerramientos', 'Cerramientos', ['items'], [
      field('items', 'Cerramientos', 'table', {
        columns: [
          col('nombre', 'Nombre'),
          col('tipoCerramiento', 'Tipo de cerramiento', 'select', 'tipoCerramiento'),
          col('superficie', 'Superficie (m2)'),
          col('u', 'U (W/m2K)'),
          col('peso', 'Peso/m2 (kg/m2)'),
          col('posicion', 'Posición', 'select', 'posicion'),
          col('modoDefinicion', 'Modo definición', 'select', 'modoDefinicion'),
          col('patronSombras', 'Patrón de sombras', 'select', 'patronSombras'),
        ],
      }),
    ]),
    group('huecos', 'Huecos', ['items'], [
      field('items', 'Huecos', 'table', {
        columns: [
          col('nombre', 'Nombre'),
          col('cerramientoAsociado', 'Cerramiento asociado'),
          col('longitud', 'Longitud (m)'),
          col('altura', 'Altura (m)'),
          col('multiplicador', 'Multiplicador'),
          col('superficie', 'Superficie (m2)'),
          col('uVidrio', 'U vidrio (W/m2K)'),
          col('gVidrio', 'g vidrio'),
          col('uMarco', 'U marco (W/m2K)'),
          col('porcMarco', '% Marco'),
          col('absortividadMarco', 'Absortividad marco'),
          col('modoDefinicion', 'Modo definición', 'select', 'modoDefinicion'),
          col('permeabilidad', 'Permeabilidad (m3/hm2)'),
          col('orientacion', 'Orientación', 'select', 'posicion'),
          col('patronSombras', 'Patrón de sombras', 'select', 'patronSombras'),
        ],
      }),
    ]),
    group('puentesTermicos', 'Puentes térmicos', ['items'], [
      field('items', 'Puentes térmicos', 'table', {
        columns: [
          col('nombre', 'Nombre'),
          col('cerramientoAsociado', 'Cerramiento asociado'),
          col('tipoPuenteTermico', 'Tipo de puente térmico'),
          col('fi', 'Ψ (W/mK)'),
          col('longitud', 'Longitud (m)'),
        ],
      }),
    ]),
  ]),
  section('instalaciones', 'Instalaciones', [
    group('acs', 'Equipos de ACS', ['items'], [
      field('items', 'Equipos de ACS', 'table', {
        columns: [
          col('nombre', 'Nombre'),
          col('tipoEquipo', 'Tipo de equipo', 'select', 'tipoEquipo'),
          col('modoDefinicion', 'Modo definición', 'select', 'modoDefinicion'),
          col('tipoGenerador', 'Tipo generador', 'select', 'tipoGenerador'),
          col('combustible', 'Combustible', 'select', 'combustible'),
          col('rendimientoEstacional', 'Rendimiento estacional (%)'),
          col('m2Cubiertos', 'm2 cubiertos'),
          col('demandaCubierta', 'Demanda cubierta (%)'),
          col('zona', 'Zona', 'select', 'zona'),
          col('acumulacion', 'Acumulación', 'select', 'acumulacion'),
        ],
      }),
    ]),
    group('calefaccion', 'Equipos de calefacción', ['items'], [
      field('items', 'Equipos de calefacción', 'table', {
        columns: [
          col('nombre', 'Nombre'),
          col('tipoEquipo', 'Tipo de equipo', 'select', 'tipoEquipo'),
          col('modoDefinicion', 'Modo definición', 'select', 'modoDefinicion'),
          col('tipoGenerador', 'Tipo generador', 'select', 'tipoGenerador'),
          col('combustible', 'Combustible', 'select', 'combustible'),
          col('rendimientoEstacional', 'Rendimiento estacional (%)'),
          col('m2Cubiertos', 'm2 cubiertos'),
          col('demandaCubierta', 'Demanda cubierta (%)'),
          col('zona', 'Zona', 'select', 'zona'),
        ],
      }),
    ]),
    group('refrigeracion', 'Equipos de refrigeración', ['items'], [
      field('items', 'Equipos de refrigeración', 'table', {
        columns: [
          col('nombre', 'Nombre'),
          col('tipoEquipo', 'Tipo de equipo', 'select', 'tipoEquipo'),
          col('modoDefinicion', 'Modo definición', 'select', 'modoDefinicion'),
          col('tipoGenerador', 'Tipo generador', 'select', 'tipoGenerador'),
          col('combustible', 'Combustible', 'select', 'combustible'),
          col('rendimientoEstacional', 'Rendimiento estacional (%)'),
          col('m2Cubiertos', 'm2 cubiertos'),
          col('demandaCubierta', 'Demanda cubierta (%)'),
          col('zona', 'Zona', 'select', 'zona'),
        ],
      }),
    ]),
    group('contribuciones', 'Contribuciones energéticas', ['items'], [
      field('items', 'Contribuciones energéticas', 'table', {
        columns: [
          col('nombre', 'Nombre'),
          col('zona', 'Zona', 'select', 'zona'),
          col('acsRenovable', '% demanda ACS cubierto con renovables'),
          col('calefaccionRenovable', '% calefacción cubierto con renovables'),
          col('refrigeracionRenovable', '% refrigeración cubierto con renovables'),
          col('calorRecuperadoAcs', 'Calor recuperado para ACS (kWh/año)'),
          col('calorRecuperadoCalefaccion', 'Calor recuperado para calefacción (kWh/año)'),
          col('frioRecuperado', 'Frío recuperado (kWh/año)'),
          col('energiaConsumidaGeneracionElectricidad', 'Energía consumida en generación de electricidad (kWh/año)'),
          col('combustible', 'Combustible', 'select', 'combustible'),
        ],
      }),
    ]),
  ]),
];

const COPY_SECTION_IDS = ['envolvente', 'instalaciones'];

const FLAT_FIELDS = SECTIONS.flatMap(sectionItem => sectionItem.groups.flatMap(groupItem => {
  return groupItem.fields.map(item => Object.assign({}, item, {
    sectionId: sectionItem.id,
    sectionLabel: sectionItem.label,
    groupId: groupItem.id,
    groupLabel: groupItem.label,
    path: `${sectionItem.id}.${groupItem.id}.${item.id}`,
  }));
}));

const manualAliases = [
  alias('admin.localizacion.referenciaCatastral', ['referencia catastral', 'referencia']),
  alias('admin.localizacion.nombreEdificio', ['nombre del edificio', 'edificio', 'expediente', 'nombre inmueble']),
  alias('admin.localizacion.direccion', ['direccion edificio', 'direccion inmueble', 'direccion localizacion', 'direccion', 'domicilio edificio']),
  alias('admin.localizacion.localidad', ['localidad edificio', 'localidad inmueble', 'localidad', 'municipio', 'poblacion']),
  alias('admin.localizacion.provincia', ['provincia edificio', 'provincia inmueble', 'provincia', 'provincia ciudad autonoma']),
  alias('admin.localizacion.codigoPostal', ['codigo postal edificio', 'codigo postal inmueble', 'codigo postal', 'cp', 'c p']),
  alias('admin.cliente.nombreRazonSocial', ['nombre del cliente', 'nombre cliente', 'nombre', 'cliente', 'razon social cliente', 'razon social', 'propietario']),
  alias('admin.cliente.direccion', ['direccion cliente', 'domicilio cliente', 'direccion del cliente']),
  alias('admin.cliente.provincia', ['provincia cliente', 'provincia del cliente']),
  alias('admin.cliente.localidad', ['localidad cliente', 'municipio cliente', 'poblacion cliente']),
  alias('admin.cliente.codigoPostal', ['codigo postal cliente', 'cp cliente', 'c p cliente']),
  alias('admin.cliente.telefono', ['telefono cliente', 'telefono', 'movil cliente', 'movil', 'móvil']),
  alias('admin.cliente.email', ['email cliente', 'email', 'e mail', 'correo cliente', 'correo', 'correo electronico']),
  alias('generales.datos.normativaVigente', ['normativa vigente', 'normativa']),
  alias('generales.datos.anioConstruccion', ['año construcción', 'ano construccion', 'año de construcción', 'ano de construccion', 'anio construccion']),
  alias('generales.datos.tipoEdificio', ['tipo edificio', 'tipo de edificio']),
  alias('generales.datos.zonaClimaticaHE1', ['zona climatica he 1', 'zona climatica']),
  alias('generales.datos.zonaClimaticaHE4', ['zona climatica he 4']),
  alias('generales.definicion.superficieUtilHabitable', ['superficie util habitable', 'superficie util', 'sup util']),
  alias('generales.definicion.alturaLibrePlanta', ['altura libre de planta', 'altura libre']),
  alias('generales.definicion.numeroPlantasHabitables', ['numero plantas habitables', 'plantas habitables', 'plantas']),
  alias('generales.definicion.ventilacionInmueble', ['ventilacion del inmueble', 'ventilacion inmueble', 'renovaciones hora']),
  alias('generales.definicion.demandaDiariaACS', ['demanda diaria acs', 'demanda acs']),
  alias('generales.definicion.masaParticionesInternas', ['masa particiones internas', 'masa termica']),
];

const autoAliases = FLAT_FIELDS
  .filter(item => item.type !== 'table' && !isTechnicianPath(item.path))
  .map(item => alias(item.path, [`${item.groupLabel} ${item.label}`]));

const aliasMap = manualAliases.concat(autoAliases).flatMap(item => item.aliases.map(name => ({
  path: item.path,
  alias: name,
  pattern: aliasToPattern(name),
})));

const state = {
  records: [],
  selectedId: '',
  activeChatId: '',
  activeSection: 'admin',
  rightView: 'list',
  config: loadConfig(),
  pendingMatches: [],
  pendingPatch: null,
  draft: null,
};

const chatLog = document.querySelector('#chatLog');
const chatForm = document.querySelector('#chatForm');
const chatInput = document.querySelector('#chatInput');
const voiceBtn = document.querySelector('#voiceBtn');
const expedientList = document.querySelector('#expedientList');
const listView = document.querySelector('#listView');
const detailView = document.querySelector('#detailView');
const backToListBtn = document.querySelector('#backToListBtn');
const activeRecordSelect = document.querySelector('#activeRecordSelect');
const searchInput = document.querySelector('#searchInput');
const statusFilter = document.querySelector('#statusFilter');
const summary = document.querySelector('#statusSummary');
const activeRecordText = document.querySelector('#activeRecordText');
const sectionTabs = document.querySelector('#sectionTabs');
const detailForm = document.querySelector('#detailForm');
const sectionFields = document.querySelector('#sectionFields');
const recordTitle = document.querySelector('#recordTitle');
const recordSubtitle = document.querySelector('#recordSubtitle');
const recordBadge = document.querySelector('#recordBadge');
const storageMode = document.querySelector('#storageMode');
const syncAlert = document.querySelector('#syncAlert');
const configDialog = document.querySelector('#configDialog');
const configForm = document.querySelector('#configForm');
const copyDataDialog = document.querySelector('#copyDataDialog');
const copyDataForm = document.querySelector('#copyDataForm');
const copySourceSelect = document.querySelector('#copySourceSelect');
const newRecordDialog = document.querySelector('#newRecordDialog');
const newRecordForm = document.querySelector('#newRecordForm');
const newRecordReferenceField = document.querySelector('#newRecordReferenceField');
const newRecordFileField = document.querySelector('#newRecordFileField');
const newRecordHelp = document.querySelector('#newRecordHelp');
const newRecordStatus = document.querySelector('#newRecordStatus');
const createNewRecordBtn = document.querySelector('#createNewRecordBtn');
const createNewRecordBtnLabel = document.querySelector('#createNewRecordBtnLabel');

document.querySelector('#newBtn').addEventListener('click', openNewRecordDialog);
document.querySelector('#catastroBtn').addEventListener('click', loadCatastroForSelected);
document.querySelector('#catastroMapBtn').addEventListener('click', openCatastroCartography);
document.querySelector('#catastro3dBtn').addEventListener('click', openCatastro3d);
document.querySelector('#autoEnvelopeBtn').addEventListener('click', autocompleteEnvelopeForSelected);
document.querySelector('#autoSystemsBtn').addEventListener('click', autocompleteSystemsForSelected);
document.querySelector('#copyDataBtn').addEventListener('click', openCopyDataDialog);
document.querySelector('#deleteRecordBtn').addEventListener('click', deleteSelectedRecord);
document.querySelector('#configBtn').addEventListener('click', openConfig);
document.querySelector('#closeConfigBtn').addEventListener('click', () => configDialog.close());
document.querySelector('#closeCopyDataBtn').addEventListener('click', () => copyDataDialog.close());
document.querySelector('#closeNewRecordBtn').addEventListener('click', () => newRecordDialog.close());
document.querySelector('#testConfigBtn').addEventListener('click', testConfigConnection);
document.querySelector('#copyConfigLinkBtn').addEventListener('click', copyConfigLink);
document.querySelector('#downloadJsonBtn').addEventListener('click', downloadJson);
document.querySelector('#downloadCexBtn').addEventListener('click', downloadCex);
backToListBtn.addEventListener('click', showListView);
chatForm.addEventListener('submit', handleChatSubmit);
chatInput.addEventListener('keydown', handleChatInputKeydown);
voiceBtn.addEventListener('click', startVoiceDictation);
searchInput.addEventListener('input', renderRecords);
statusFilter.addEventListener('change', renderRecords);
activeRecordSelect.addEventListener('change', () => {
  state.activeChatId = activeRecordSelect.value;
  state.selectedId = activeRecordSelect.value;
  state.rightView = state.selectedId ? 'detail' : state.rightView;
  renderAll();
});
detailForm.addEventListener('submit', saveDetail);
detailForm.addEventListener('input', updateNormativaFromConstructionYear);
detailForm.addEventListener('change', updateNormativaFromConstructionYear);
configForm.addEventListener('submit', saveConfig);
copyDataForm.addEventListener('submit', copyDataFromSelectedSource);
newRecordForm.addEventListener('submit', submitNewRecordForm);
newRecordForm.addEventListener('change', updateNewRecordMode);
window.addEventListener('error', event => {
  addChatMessage('assistant', 'Ha fallado el chat: ' + (event.error?.message || event.message || 'error desconocido'));
});
window.addEventListener('unhandledrejection', event => {
  addChatMessage('assistant', 'Ha fallado el chat: ' + (event.reason?.message || event.reason || 'error desconocido'));
});

cleanupLocalDataStorage();
renderTabs();
renderStorageMode();
loadRecords();
addChatMessage('assistant', 'Selecciona arriba el expediente para el chat. Casa 37 queda cargado como primer expediente; todo lo que dictes irá al expediente seleccionado.');

function row(values) {
  return { values };
}

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  const random = window.crypto && typeof window.crypto.getRandomValues === 'function'
    ? Array.from(window.crypto.getRandomValues(new Uint32Array(2)), value => value.toString(36)).join('')
    : Math.random().toString(36).slice(2);
  return `exp-${Date.now().toString(36)}-${random}`;
}

function section(id, label, groups) {
  return { id, label, groups };
}

function group(id, label, required, fields) {
  return { id, label, required, fields };
}

function field(id, label, type = 'text', config = {}) {
  return Object.assign({ id, label, type }, config);
}

function col(id, label, type = 'text', optionsKey = '') {
  return { id, label, type, optionsKey };
}

function alias(path, aliases) {
  return { path, aliases };
}

async function loadRecords() {
  try {
    clearSyncAlert();
    if (state.config.apiUrl) {
      const response = await api({ action: 'list' });
      state.records = (response.items || []).map(normalizeRecord);
    } else {
      state.records = [];
      showSyncAlert('Configura Google Sheet para cargar y guardar expedientes.');
    }

    ensureCasa37Record();
    const initialRecord = state.records.find(item => normalizeReference(valueAt(item, 'admin.localizacion.referenciaCatastral')) === CASA37_REFERENCE) || state.records[0];
    selectRecord(initialRecord);
    selectInitialChatRecord();
    renderAll();
  } catch (error) {
    state.records = [];
    ensureCasa37Record();
    selectRecord(state.records[0]);
    selectInitialChatRecord();
    renderAll();
    showSyncAlert(sheetErrorHelp(error));
  }
}

function ensureCasa37Record() {
  const index = state.records.findIndex(item => normalizeReference(valueAt(item, 'admin.localizacion.referenciaCatastral')) === CASA37_REFERENCE);
  if (state.config.apiUrl && index < 0 && state.records.length > 0) return;
  if (index >= 0) {
    state.records[index] = normalizeRecord(mergeDefaults(state.records[index], CEX37_DEFAULTS));
  }
}

function openNewRecordDialog() {
  newRecordForm.reset();
  updateNewRecordMode();
  newRecordDialog.showModal();
}

function updateNewRecordMode() {
  const mode = newRecordForm.elements.newRecordMode.value;
  const catastroMode = mode === 'catastro';
  newRecordReferenceField.hidden = !catastroMode;
  newRecordFileField.hidden = catastroMode;
  newRecordHelp.textContent = catastroMode
    ? 'Se creará el expediente y se consultará Catastro automáticamente.'
    : 'Se copiarán al expediente los datos que existan dentro del archivo .cex.';
}

function setNewRecordLoading(loading, message = '') {
  createNewRecordBtn.disabled = loading;
  createNewRecordBtn.classList.toggle('is-loading', loading);
  createNewRecordBtn.setAttribute('aria-busy', String(loading));
  createNewRecordBtnLabel.textContent = loading ? 'Esperando datos...' : 'Crear expediente';
  newRecordStatus.hidden = !loading;
  newRecordStatus.textContent = message;
  newRecordForm.querySelectorAll('input[type="radio"], input[name="reference"], input[name="cexFile"]').forEach(input => {
    input.disabled = loading;
  });
  document.querySelector('#closeNewRecordBtn').disabled = loading;
}

async function submitNewRecordForm(event) {
  event.preventDefault();
  const mode = newRecordForm.elements.newRecordMode.value;
  const reference = normalizeReference(newRecordForm.elements.reference.value);
  const file = newRecordForm.elements.cexFile.files?.[0];
  if (mode === 'catastro' && reference.length !== 20) {
    addChatMessage('assistant', 'La referencia catastral debe tener 20 caracteres.');
    return;
  }
  if (mode === 'cex' && !file) {
    addChatMessage('assistant', 'Selecciona un archivo .cex para crear el expediente.');
    return;
  }

  setNewRecordLoading(true, mode === 'catastro' ? 'Consultando Catastro y rellenando el expediente...' : 'Leyendo el archivo .cex...');
  try {
    if (mode === 'catastro') {
      const catastroPatch = await fetchCatastroPatch(reference);
      const record = await createNewRecord(true, catastroPatch);
      selectRecord(record, { openDetail: true });
      newRecordDialog.close();
      addChatMessage('assistant', `Expediente creado y Catastro consultado para ${reference}.`);
      return;
    }

    const buffer = await file.arrayBuffer();
    const text = new TextDecoder('iso-8859-1').decode(buffer);
    const importedData = parseCexRecordData(text);
    const record = await createNewRecord(true, importedData);
    newRecordDialog.close();
    addChatMessage('assistant', `Expediente creado desde ${file.name}: ${recordLabel(record)}.`);
  } catch (error) {
    addChatMessage('assistant', 'No he podido crear el expediente: ' + (error.message || error));
  } finally {
    setNewRecordLoading(false);
  }
}

async function createNewRecord(persist = true, initialData = {}) {
  if (!state.config.apiUrl && persist) {
    throw new Error('Configura Google Sheet antes de crear expedientes. Esta app ya no guarda expedientes en local.');
  }
  const now = new Date().toISOString();
  const record = normalizeRecord({
    id: createId(),
    estado: 'BORRADOR',
    createdAt: now,
    updatedAt: now,
    data: Object.assign({}, DEFAULT_TECHNICIAN, initialData),
  });
  if (persist) {
    const saved = await persistRecord(record);
    state.rightView = 'detail';
    selectRecord(saved, { openDetail: true });
    addChatMessage('assistant', 'Nuevo expediente creado y guardado como borrador. Juan José queda cargado como técnico por defecto.');
    return saved;
  }
  selectRecord(record, { openDetail: true });
  return record;
}

function normalizeRecord(record) {
  const data = Object.assign({}, record.data || {});
  Object.keys(DEFAULT_TECHNICIAN).forEach(path => {
    if (!hasValue(data[path])) data[path] = DEFAULT_TECHNICIAN[path];
  });
  migrateLegacy(record, data);
  Object.keys(DEFAULT_CLIENT).forEach(path => {
    if (!hasValue(data[path])) data[path] = DEFAULT_CLIENT[path];
  });
  if (normalizeReference(data['admin.localizacion.referenciaCatastral']) === CASA37_REFERENCE) {
    Object.entries(CEX37_DEFAULTS).forEach(([path, value]) => {
      if (!hasValue(data[path])) data[path] = clone(value);
    });
  }
  Object.keys(DEFAULT_GENERAL).forEach(path => {
    if (!hasValue(data[path])) data[path] = DEFAULT_GENERAL[path];
  });
  const normativa = normativaVigenteDesdeAnio(data['generales.datos.anioConstruccion']);
  if (normativa) data['generales.datos.normativaVigente'] = normativa;
  const next = Object.assign({}, record, { data });
  next.estado = inferStatus(next);
  return next;
}

function updateNormativaFromConstructionYear(event) {
  if (event.target?.name !== 'generales.datos.anioConstruccion') return;
  const normativa = normativaVigenteDesdeAnio(event.target.value);
  const select = detailForm.elements['generales.datos.normativaVigente'];
  if (normativa && select) select.value = normativa;
}

function mergeDefaults(record, defaults) {
  const next = clone(record);
  next.data = Object.assign({}, next.data || {});
  Object.entries(defaults).forEach(([path, value]) => {
    if (!hasValue(next.data[path])) next.data[path] = clone(value);
  });
  return next;
}

function migrateLegacy(record, data) {
  const legacy = {
    referenciaCatastral: 'admin.localizacion.referenciaCatastral',
    direccion: 'admin.localizacion.direccion',
    municipio: 'admin.localizacion.localidad',
    provincia: 'admin.localizacion.provincia',
    codigoPostal: 'admin.localizacion.codigoPostal',
    anioConstruccion: 'generales.datos.anioConstruccion',
    superficieUtil: 'generales.definicion.superficieUtilHabitable',
    plantas: 'generales.definicion.numeroPlantasHabitables',
    tipoEdificio: 'generales.datos.tipoEdificio',
  };

  Object.entries(legacy).forEach(([oldKey, path]) => {
    if (record[oldKey] && !hasValue(data[path])) data[path] = record[oldKey];
  });
}

function renderAll() {
  renderStorageMode();
  renderRightView();
  renderRecords();
  renderActiveSelector();
  renderTabs();
  renderDetail();
}

function renderStorageMode() {
  const usingSheet = Boolean(state.config.apiUrl);
  storageMode.textContent = usingSheet ? 'Google Sheet' : 'Config pendiente';
  storageMode.className = 'storage-mode ' + (usingSheet ? 'sheet' : 'local');
  storageMode.title = usingSheet
    ? 'Los expedientes se guardan en Google Sheets mediante Apps Script.'
    : 'Configura Apps Script: la app no guarda expedientes en local.';
}

function showSyncAlert(text) {
  syncAlert.textContent = text;
  syncAlert.hidden = false;
}

function clearSyncAlert() {
  syncAlert.textContent = '';
  syncAlert.hidden = true;
}

function sheetErrorHelp(error) {
  const message = String(error && error.message ? error.message : error);
  if (/No autorizado/i.test(message)) {
    return 'Google Sheet responde, pero dice “No autorizado”. Revisa que el APP_SECRET de Config coincida exactamente con el del Apps Script y, si cambiaste el código, publica una nueva versión de la implementación web.';
  }
  if (/Apps Script no devolvio JSON|Apps Script devolvio respuesta vacia|Content-Type=/i.test(message)) {
    return 'Apps Script ha respondido al servidor, pero no con JSON válido. Casi seguro es URL/despliegue/permisos de Google. Detalle técnico: ' + message;
  }
  if (/Failed to fetch|NetworkError|Load failed|CORS|JSONP|Apps Script no respondió|formulario/i.test(message)) {
    return 'No puedo confirmar el guardado en Google Sheet desde este navegador. No hay copia local persistente; revisa que Apps Script esté actualizado, publicado como nueva versión y que la URL acabe en /exec.';
  }
  return 'No se pudo sincronizar con Google Sheet: ' + message;
}

function renderRightView() {
  const detailOpen = state.rightView === 'detail';
  listView.hidden = detailOpen;
  detailView.hidden = !detailOpen;
}

function renderActiveSelector() {
  activeRecordSelect.innerHTML = '';
  const chatRecords = state.records;
  chatRecords.forEach(record => {
    const option = document.createElement('option');
    option.value = record.id;
    option.textContent = `${recordLabel(record)} - ${recordPlace(record)}`;
    activeRecordSelect.appendChild(option);
  });
  if (chatRecords.length) {
    if (!chatRecords.some(record => record.id === state.activeChatId)) {
      state.activeChatId = chatRecords[0].id;
    }
    activeRecordSelect.value = state.activeChatId;
    activeRecordSelect.disabled = false;
  } else {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'No hay expedientes';
    activeRecordSelect.appendChild(option);
    activeRecordSelect.disabled = true;
    state.activeChatId = '';
  }
}

function renderRecords() {
  const records = getFilteredRecords();
  summary.textContent = records.length === state.records.length
    ? `${records.length} expedientes`
    : `${records.length} de ${state.records.length} expedientes`;
  expedientList.innerHTML = '';

  if (!records.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-list';
    empty.textContent = state.records.length
      ? 'No hay expedientes con este filtro. Prueba “Todos los estados”.'
      : 'No hay expedientes guardados todavía.';
    expedientList.appendChild(empty);
    return;
  }

  records.forEach(record => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'expedient-card' + (record.id === state.selectedId ? ' active' : '');
    const status = inferStatus(record);
    button.innerHTML = `
      <div class="expedient-main">
        <strong>${escapeHtml(recordLabel(record))}</strong>
        <span>${escapeHtml(valueAt(record, 'admin.localizacion.referenciaCatastral') || 'Sin referencia catastral')}</span>
      </div>
      <div class="expedient-meta">
        <span>${escapeHtml(recordPlace(record))}</span>
        <span>${escapeHtml(valueAt(record, 'admin.cliente.nombreRazonSocial') || 'Cliente pendiente')}</span>
        <span>${escapeHtml(valueAt(record, 'generales.definicion.superficieUtilHabitable') ? `${valueAt(record, 'generales.definicion.superficieUtilHabitable')} m2` : 'Superficie pendiente')}</span>
      </div>
      <div><span class="badge ${escapeHtml(status)}">${escapeHtml(statusLabel(status))}</span></div>
      <div class="section-status">${renderSectionStatus(record)}</div>
    `;
    button.addEventListener('click', () => selectRecord(record, { openDetail: true }));
    expedientList.appendChild(button);
  });
}

function renderSectionStatus(record) {
  return SECTIONS.map(sectionItem => {
    const status = sectionCompletion(record, sectionItem.id);
    return `<span class="section-pill ${status.state}">${escapeHtml(sectionItem.label)}: ${escapeHtml(completionLabel(status))}</span>`;
  }).join('');
}

function renderTabs() {
  sectionTabs.innerHTML = '';
  SECTIONS.forEach(sectionItem => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tab' + (sectionItem.id === state.activeSection ? ' active' : '');
    button.textContent = sectionItem.label;
    button.addEventListener('click', () => {
      state.activeSection = sectionItem.id;
      renderAll();
      detailForm.scrollTop = 0;
    });
    sectionTabs.appendChild(button);
  });
}

function renderDetail() {
  const record = selectedRecord();
  const chatRecord = activeChatRecord();
  const data = record ? record.data : {};
  const sectionItem = SECTIONS.find(item => item.id === state.activeSection) || SECTIONS[0];

  recordTitle.textContent = record ? recordLabel(record) : 'Detalle del expediente';
  recordSubtitle.textContent = record ? recordPlace(record) : 'Selecciona o crea una referencia.';
  activeRecordText.textContent = chatRecord ? `Chat sobre: ${recordLabel(chatRecord)}` : 'No hay expediente seleccionado para el chat.';
  const status = record ? inferStatus(record) : 'BORRADOR';
  recordBadge.textContent = statusLabel(status);
  recordBadge.className = 'badge ' + status;

  const catastroMapBtn = document.querySelector('#catastroMapBtn');
  const catastroUrl = record ? catastroCartographyUrl(record) : '';
  catastroMapBtn.title = catastroUrl
    ? 'Abrir la cartografía del Catastro para este expediente'
    : 'Falta una referencia catastral válida';

  sectionFields.innerHTML = '';
  sectionItem.groups.forEach(groupItem => {
    const fieldset = document.createElement('fieldset');
    if (groupItem.fields.some(item => item.type === 'table')) fieldset.classList.add('table-fieldset');
    fieldset.innerHTML = `<legend>${escapeHtml(groupItem.label)}</legend>`;
    groupItem.fields.forEach(item => {
      const path = `${sectionItem.id}.${groupItem.id}.${item.id}`;
      const wrapper = document.createElement('label');
      wrapper.className = item.type === 'table' ? 'table-label' : '';
      const value = data[path];
      wrapper.innerHTML = `<span>${escapeHtml(item.label)}</span>${inputHtml(item, path, value)}`;
      fieldset.appendChild(wrapper);
    });
    sectionFields.appendChild(fieldset);
  });
}

function openCatastroCartography() {
  const currentRecord = selectedRecordWithCurrentReference();
  const url = currentRecord ? catastroCartographyUrl(currentRecord) : '';
  if (!url) {
    addChatMessage('assistant', 'No puedo abrir la cartografía: el expediente no tiene una referencia catastral válida.');
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}

function openCatastro3d() {
  const currentRecord = selectedRecordWithCurrentReference();
  const url = currentRecord ? catastro3dUrl(currentRecord) : '';
  if (!url) {
    addChatMessage('assistant', 'No puedo abrir el Visor 3D: el expediente no tiene una referencia catastral válida.');
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}

function selectedRecordWithCurrentReference() {
  const record = selectedRecord();
  const currentReference = detailForm.querySelector('[name="admin.localizacion.referenciaCatastral"]')?.value?.trim();
  if (!record || !currentReference) return record;
  return Object.assign({}, record, { data: Object.assign({}, record.data, {
    'admin.localizacion.referenciaCatastral': currentReference,
  }) });
}

function inputHtml(item, path, value) {
  if (item.type === 'table') return tableHtml(item, path, value);
  if (item.type === 'textarea') return `<textarea name="${escapeHtml(path)}" rows="5">${escapeHtml(value)}</textarea>`;
  if (item.type === 'select') return selectHtml(path, value, SELECT_OPTIONS[item.optionsKey] || []);
  if (item.type === 'image') return imageInputHtml(path, value);
  const type = item.type === 'number' ? 'text' : item.type;
  const unit = item.unit ? `<small>${escapeHtml(item.unit)}</small>` : '';
  return `<span class="input-with-unit"><input type="${type}" name="${escapeHtml(path)}" value="${escapeHtml(value)}" autocomplete="off">${unit}</span>`;
}

function imageInputHtml(path, value) {
  const text = String(value || '').trim();
  const preview = imagePreviewHtml(text);
  return `
    <div class="image-field" data-image-field="${escapeHtml(path)}">
      <input type="hidden" name="${escapeHtml(path)}" value="${escapeHtml(text)}">
      ${preview}
      <input type="file" accept="image/png,image/jpeg" data-image-upload="${escapeHtml(path)}">
    </div>
  `;
}

function imagePreviewHtml(value) {
  if (value.startsWith('data:image/')) {
    return `<img class="image-preview" src="${escapeHtml(value)}" alt="Vista previa">`;
  }
  if (/^https?:\/\//i.test(value)) {
    return `<a class="image-link" href="${escapeHtml(value)}" target="_blank" rel="noopener">Abrir plano</a>`;
  }
  return '<span class="image-empty">Sin imagen</span>';
}

function selectHtml(path, value, options) {
  const current = String(value || '');
  const allOptions = current && !options.includes(current) ? [current].concat(options) : options;
  return `<select name="${escapeHtml(path)}">${allOptions.map(option => {
    const selected = option === current ? ' selected' : '';
    return `<option value="${escapeHtml(option)}"${selected}>${escapeHtml(option)}</option>`;
  }).join('')}</select>`;
}

function tableHtml(item, path, value) {
  const rows = readTableRows(value, item.columns);
  return `
    <div class="table-wrap" data-table="${escapeHtml(path)}">
      <table>
        <thead>
          <tr>
            <th><input type="checkbox" data-select-all-rows aria-label="Seleccionar todas las filas"></th>
            <th></th>
            ${item.columns.map(column => `<th>${escapeHtml(column.label)}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map((rowItem, index) => tableRowHtml(item.columns, rowItem, index)).join('')}
        </tbody>
      </table>
      <div class="table-actions">
        <button type="button" class="secondary add-row-btn" data-add-row="${escapeHtml(path)}">Añadir fila</button>
        <button type="button" class="danger delete-row-btn" data-delete-rows="${escapeHtml(path)}" disabled>Eliminar fila</button>
      </div>
    </div>
  `;
}

function tableRowHtml(columns, rowItem, index) {
  return `<tr>
    <td><input type="checkbox" data-row-select aria-label="Seleccionar fila ${index + 1}"></td>
    <td data-row-number>${index + 1}</td>
    ${columns.map((column, colIndex) => {
    const value = rowItem[column.id] ?? rowItem.values?.[colIndex] ?? '';
    const name = `data-col="${escapeHtml(column.id)}"`;
    if (column.type === 'select') return `<td>${selectCellHtml(name, value, SELECT_OPTIONS[column.optionsKey] || [])}</td>`;
    return `<td><input ${name} value="${escapeHtml(value)}" autocomplete="off"></td>`;
  }).join('')}</tr>`;
}

function selectCellHtml(attrs, value, options) {
  const current = String(value || '');
  const selectedValue = options.includes(current) ? current : (options[0] || '');
  const allOptions = options.length ? options : (current ? [current] : []);
  return `<select ${attrs}>${allOptions.map(option => {
    const selected = option === selectedValue ? ' selected' : '';
    return `<option value="${escapeHtml(option)}"${selected}>${escapeHtml(option)}</option>`;
  }).join('')}</select>`;
}

sectionFields.addEventListener('click', event => {
  const addButton = event.target.closest('[data-add-row]');
  if (addButton) {
    const path = addButton.dataset.addRow;
    const fieldItem = FLAT_FIELDS.find(item => item.path === path);
    const table = addButton.closest('[data-table]');
    const tbody = table.querySelector('tbody');
    tbody.insertAdjacentHTML('beforeend', tableRowHtml(fieldItem.columns, {}, tbody.children.length));
    updateTableSelectionState(table);
    return;
  }

  const deleteButton = event.target.closest('[data-delete-rows]');
  if (deleteButton) {
    const table = deleteButton.closest('[data-table]');
    const selectedRows = Array.from(table.querySelectorAll('tbody tr'))
      .filter(row => row.querySelector('[data-row-select]')?.checked);
    if (!selectedRows.length) {
      addChatMessage('assistant', 'Selecciona una o varias filas antes de pulsar Eliminar fila.');
      return;
    }
    selectedRows.forEach(row => row.remove());
    renumberTableRows(table);
    updateTableSelectionState(table);
  }
});

sectionFields.addEventListener('change', event => {
  const imageUpload = event.target.closest('[data-image-upload]');
  if (imageUpload) {
    handleImageUpload(imageUpload);
    return;
  }

  const selectAll = event.target.closest('[data-select-all-rows]');
  if (selectAll) {
    const table = selectAll.closest('[data-table]');
    table.querySelectorAll('[data-row-select]').forEach(checkbox => {
      checkbox.checked = selectAll.checked;
    });
    updateTableSelectionState(table);
    return;
  }

  const rowSelect = event.target.closest('[data-row-select]');
  if (rowSelect) updateTableSelectionState(rowSelect.closest('[data-table]'));
});

sectionFields.addEventListener('input', event => {
  const percentageInput = event.target.closest('[data-col="demandaCubierta"]');
  if (!percentageInput) return;

  const table = percentageInput.closest('[data-table]');
  const supportedTables = new Set([
    'instalaciones.calefaccion.items',
    'instalaciones.refrigeracion.items',
  ]);
  if (!table || !supportedTables.has(table.dataset.table)) return;

  const row = percentageInput.closest('tr');
  const surfaceInput = row?.querySelector('[data-col="m2Cubiertos"]');
  if (!surfaceInput) return;

  const record = selectedRecord();
  const data = record?.data || {};
  const usefulSurface = data['generales.definicion.superficieUtilHabitable']
    || data.superficieCatastral
    || record?.superficieUtil
    || record?.superficieCatastral;
  const coveredSurface = coveredSurfaceForPercentage(usefulSurface, percentageInput.value);
  if (coveredSurface !== '') surfaceInput.value = coveredSurface;
});

function handleImageUpload(input) {
  const file = input.files?.[0];
  if (!file) return;
  if (!/^image\/(?:png|jpeg)$/.test(file.type)) {
    addChatMessage('assistant', 'Elige una imagen PNG o JPEG para CE3X.');
    input.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const field = input.closest('[data-image-field]');
    const hidden = field?.querySelector('input[type="hidden"]');
    if (!field || !hidden) return;
    hidden.value = String(reader.result || '');
    const previous = field.querySelector('.image-preview, .image-link, .image-empty');
    if (previous) previous.outerHTML = imagePreviewHtml(hidden.value);
  };
  reader.readAsDataURL(file);
}

function renumberTableRows(table) {
  table.querySelectorAll('tbody tr').forEach((row, index) => {
    const numberCell = row.querySelector('[data-row-number]');
    if (numberCell) numberCell.textContent = String(index + 1);
    const checkbox = row.querySelector('[data-row-select]');
    if (checkbox) checkbox.setAttribute('aria-label', `Seleccionar fila ${index + 1}`);
  });
}

function updateTableSelectionState(table) {
  const rowCheckboxes = Array.from(table.querySelectorAll('[data-row-select]'));
  const selectedCount = rowCheckboxes.filter(checkbox => checkbox.checked).length;
  const selectAll = table.querySelector('[data-select-all-rows]');
  if (selectAll) {
    selectAll.checked = rowCheckboxes.length > 0 && selectedCount === rowCheckboxes.length;
    selectAll.indeterminate = selectedCount > 0 && selectedCount < rowCheckboxes.length;
  }
  const deleteButton = table.querySelector('[data-delete-rows]');
  if (deleteButton) {
    deleteButton.disabled = selectedCount === 0;
    deleteButton.textContent = selectedCount > 1 ? `Eliminar ${selectedCount} filas` : 'Eliminar fila';
  }
}

function getFilteredRecords() {
  const query = normalizeText(searchInput.value);
  const status = statusFilter.value;
  return state.records.filter(record => {
    const matchesText = !query || normalizeText(JSON.stringify(record)).includes(query);
    const matchesStatus = status === 'all' || inferStatus(record) === status;
    return matchesText && matchesStatus;
  });
}

function selectRecord(record, options = {}) {
  if (!record) {
    state.selectedId = '';
    state.draft = null;
    renderAll();
    return;
  }
  const normalized = normalizeRecord(record);
  state.selectedId = normalized.id || '';
  state.draft = normalized.id ? null : normalized;
  if (normalized.id) state.activeChatId = normalized.id;
  if (options.openDetail) state.rightView = 'detail';
  renderAll();
}

function showListView() {
  state.rightView = 'list';
  renderAll();
}

function selectedRecord() {
  return state.records.find(record => record.id === state.selectedId) || state.draft || null;
}

function selectedRecordWithCurrentFormData() {
  const record = selectedRecord();
  if (!record) return null;
  if (detailView.hidden) return record;
  const data = Object.assign({}, record.data);
  Array.from(new FormData(detailForm).entries()).forEach(([path, value]) => {
    data[path] = String(value || '').trim();
  });
  collectTables(data);
  return Object.assign({}, record, { data });
}

function activeChatRecord() {
  return state.records.find(record => record.id === state.activeChatId) || null;
}

function selectInitialChatRecord() {
  const current = activeChatRecord();
  if (current) return;
  state.activeChatId = state.records[0]?.id || '';
}

async function saveDetail(event) {
  event.preventDefault();
  const record = selectedRecord();
  if (!record) return;

  const data = Object.assign({}, record.data);
  Array.from(new FormData(detailForm).entries()).forEach(([path, value]) => {
    data[path] = String(value || '').trim();
  });
  collectTables(data);
  try {
    const saved = await persistRecordPatch(Object.assign({}, record, { data }), activeSectionPaths());
    addChatMessage('assistant', `Guardado ${recordLabel(saved)}.`);
  } catch (error) {
    showSyncAlert(sheetErrorHelp(error));
    addChatMessage('assistant', 'No he podido guardar en Google Sheet: ' + sheetErrorHelp(error));
  }
}

function openCopyDataDialog() {
  const target = selectedRecord();
  if (!target) {
    alert('Abre primero el expediente destino.');
    return;
  }
  const sources = state.records.filter(record => record.id !== target.id);
  if (!sources.length) {
    alert('No hay otros expedientes desde los que copiar.');
    return;
  }

  copySourceSelect.innerHTML = sources.map(record => {
    return `<option value="${escapeHtml(record.id)}">${escapeHtml(recordLabel(record))} - ${escapeHtml(recordPlace(record))}</option>`;
  }).join('');
  copyDataDialog.showModal();
}

async function copyDataFromSelectedSource(event) {
  event.preventDefault();
  const target = selectedRecord();
  const source = state.records.find(record => record.id === copyDataForm.elements.sourceId.value);
  if (!target || !source || target.id === source.id) return;

  const data = Object.assign({}, target.data);
  if (!detailView.hidden) {
    Array.from(new FormData(detailForm).entries()).forEach(([path, value]) => {
      data[path] = String(value || '').trim();
    });
    collectTables(data);
  }

  copySectionsData(source, data);
  copyDataDialog.close();

  try {
    state.activeSection = 'envolvente';
    const changedPaths = copySectionPaths();
    const saved = await persistRecordPatch(Object.assign({}, target, { data }), changedPaths);
    addChatMessage('assistant', `Copiados Envolvente térmica e Instalaciones desde ${recordLabel(source)} a ${recordLabel(saved)}.`);
  } catch (error) {
    showSyncAlert(sheetErrorHelp(error));
    addChatMessage('assistant', 'No he copiado esos datos porque Google Sheet no ha confirmado el guardado: ' + sheetErrorHelp(error));
  }
}

function copySectionsData(source, targetData) {
  const sourceData = source.data || {};
  copySectionFields().forEach(item => {
    targetData[item.path] = Object.prototype.hasOwnProperty.call(sourceData, item.path)
      ? clone(sourceData[item.path])
      : emptyFieldValue(item);
  });
}

function copySectionFields() {
  return FLAT_FIELDS.filter(item => COPY_SECTION_IDS.includes(item.sectionId));
}

function copySectionPaths() {
  return copySectionFields().map(item => item.path);
}

function activeSectionPaths() {
  return FLAT_FIELDS
    .filter(item => item.sectionId === state.activeSection)
    .map(item => item.path);
}

function emptyFieldValue(item) {
  return item.type === 'table' ? [] : '';
}

function collectTables(data) {
  detailForm.querySelectorAll('[data-table]').forEach(table => {
    const path = table.dataset.table;
    const columns = FLAT_FIELDS.find(item => item.path === path)?.columns || [];
    const rows = Array.from(table.querySelectorAll('tbody tr')).map(tr => {
      const item = {};
      columns.forEach(column => {
        item[column.id] = tr.querySelector(`[data-col="${column.id}"]`)?.value?.trim() || '';
      });
      return item;
    }).filter(item => Object.values(item).some(Boolean));
    data[path] = rows;
  });
}

async function autocompleteEnvelopeForSelected() {
  const record = selectedRecordWithCurrentFormData();
  if (!record) return;
  const data = Object.assign({}, record.data, estimatedEnvelopePatch(record.data || {}));
  await persistAutocompletePatch(record, data, envelopeDataPaths(), 'Envolvente térmica autocompletada con valores estimados revisables.');
  state.activeSection = 'envolvente';
}

async function autocompleteSystemsForSelected() {
  const record = selectedRecordWithCurrentFormData();
  if (!record) return;
  const data = Object.assign({}, record.data, estimatedSystemsPatch(record.data || {}));
  await persistAutocompletePatch(record, data, systemsDataPaths(), 'Instalaciones autocompletadas con una plantilla básica revisable.');
  state.activeSection = 'instalaciones';
}

async function persistAutocompletePatch(record, data, paths, message) {
  const optimistic = normalizeRecord(Object.assign({}, record, { data, updatedAt: new Date().toISOString() }));
  addSummaryFields(optimistic);
  upsertRecord(optimistic);
  state.selectedId = optimistic.id;
  state.activeChatId = optimistic.id;
  state.rightView = 'detail';
  renderAll();
  try {
    const saved = await persistRecordPatch(optimistic, paths);
    addChatMessage('assistant', message + ' Guardado en Google Sheet.');
    upsertRecord(saved);
    renderAll();
  } catch (error) {
    showSyncAlert(sheetErrorHelp(error));
    addChatMessage('assistant', message + ' Lo he aplicado en pantalla, pero Google Sheet no ha guardado: ' + sheetErrorHelp(error));
  }
}

function envelopeDataPaths() {
  return [
    'envolvente.cerramientos.items',
    'envolvente.huecos.items',
    'envolvente.puentesTermicos.items',
  ];
}

function systemsDataPaths() {
  return [
    'instalaciones.acs.items',
    'instalaciones.calefaccion.items',
    'instalaciones.refrigeracion.items',
    'instalaciones.contribuciones.items',
  ];
}

function estimatedEnvelopePatchLegacy(data) {
  const noShadow = SELECT_OPTIONS.patronSombras[0] || 'Sin patrón';
  const surface = Math.max(1, Number(cexDecimal(data['generales.definicion.superficieUtilHabitable'] || data.superficieCatastral || 100)));
  const floors = Math.max(1, Math.round(Number(cexDecimal(data['generales.definicion.numeroPlantasHabitables'] || 1))));
  const height = Math.max(2.2, Number(cexDecimal(data['generales.definicion.alturaLibrePlanta'] || 2.7)));
  const footprint = surface / floors;
  const side = Math.sqrt(footprint);
  const perimeter = side * 4;
  const facadeArea = perimeter * height * floors;
  const openingArea = facadeArea * 0.22;
  const wallArea = Math.max(1, (facadeArea - openingArea) / 4);
  const openingPerOrientation = Math.max(0.8, openingArea / 4);
  const orientationRows = [
    ['NO', 'Muro de fachada NO'],
    ['SE', 'Muro de fachada SE'],
    ['SO', 'Muro de fachada SO'],
    ['NE', 'Muro de fachada NE'],
  ];
  const cerramientos = [
    { nombre: 'Cubierta estimada', tipoCerramiento: 'Cubierta', superficie: decimalForApp(footprint), u: '0.65', peso: '300', posicion: 'Techo', modoDefinicion: 'Por defecto', patronSombras: noShadow },
    { nombre: 'Suelo estimado', tipoCerramiento: 'Suelo', superficie: decimalForApp(footprint), u: '0.80', peso: '750', posicion: 'Suelo', modoDefinicion: 'Por defecto', patronSombras: noShadow },
  ].concat(orientationRows.map(([orientation, name]) => ({
    nombre: name,
    tipoCerramiento: 'Fachada',
    superficie: decimalForApp(wallArea),
    u: '1.20',
    peso: '200',
    posicion: orientation,
    modoDefinicion: 'Por defecto',
    patronSombras: noShadow,
  })));
  const huecos = orientationRows.map(([orientation, wallName], index) => ({
    nombre: `Hueco estimado ${orientation}`,
    cerramientoAsociado: wallName,
    longitud: decimalForApp(Math.sqrt(openingPerOrientation)),
    altura: decimalForApp(Math.sqrt(openingPerOrientation)),
    multiplicador: '1',
    superficie: decimalForApp(openingPerOrientation),
    uVidrio: '3.30',
    gVidrio: '0.75',
    uMarco: '4.00',
    porcMarco: '20',
    absortividadMarco: '0.65',
    modoDefinicion: 'Estimadas',
    permeabilidad: '50',
    orientacion: orientation,
    patronSombras: noShadow,
  }));
  const puentes = [
    { nombre: 'PT fachada-cubierta estimado', cerramientoAsociado: 'Cubierta estimada', tipoPuenteTermico: 'Encuentro de fachada con cubierta', fi: '0.82', longitud: decimalForApp(perimeter) },
    { nombre: 'PT fachada-suelo estimado', cerramientoAsociado: 'Suelo estimado', tipoPuenteTermico: 'Encuentro de fachada con solera', fi: '0.14', longitud: decimalForApp(perimeter) },
  ].concat(orientationRows.map(([orientation, wallName]) => ({
    nombre: `PT pilares ${orientation} estimado`,
    cerramientoAsociado: wallName,
    tipoPuenteTermico: 'Pilar integrado en fachada',
    fi: '1.05',
    longitud: decimalForApp(height * floors),
  })));
  return {
    'envolvente.cerramientos.items': cerramientos,
    'envolvente.huecos.items': huecos,
    'envolvente.puentesTermicos.items': puentes,
  };
}

function estimatedEnvelopePatch(data) {
  const noShadow = SELECT_OPTIONS.patronSombras[0] || 'Sin patron';
  const surface = Math.max(1, Number(cexDecimal(data['generales.definicion.superficieUtilHabitable'] || data.superficieCatastral || 100)));
  const floors = Math.max(1, Math.round(Number(cexDecimal(data['generales.definicion.numeroPlantasHabitables'] || 1))));
  const height = Math.max(2.2, Number(cexDecimal(data['generales.definicion.alturaLibrePlanta'] || 2.7)));
  const lowestFloorSurface = Number(cexDecimal(data['catastro.superficiePlantaInferior'] || 0));
  const largestFloorSurface = Number(cexDecimal(data['catastro.superficiePlantaMayor'] || 0));
  const floorAreas = estimatedFloorAreas(surface, floors, lowestFloorSurface, largestFloorSurface);
  const soilSurface = floorAreas[0] || surface / floors;
  const roofSurface = Math.max(...floorAreas, soilSurface);
  const hasCatastroFacadeEstimate = Number(cexDecimal(data['catastro.fachadasExpuestas'] || 0)) >= 2;
  const hasCatastroFloorEstimate = lowestFloorSurface > 0 || largestFloorSurface > 0;
  const facadeCount = hasCatastroFacadeEstimate
    ? Math.min(4, Math.max(2, Math.round(Number(cexDecimal(data['catastro.fachadasExpuestas'])))))
    : 4;
  const perimeter = floorAreas.reduce((total, floorSurface) => total + Math.sqrt(Math.max(1, floorSurface)) * 4, 0);
  const exposedPerimeter = perimeter * (facadeCount / 4);
  const facadeArea = exposedPerimeter * height;
  const openingArea = facadeArea * 0.22;
  const baseSurface = Number(cexDecimal(CEX37_DEFAULTS['generales.definicion.superficieUtilHabitable'])) || 149.4;
  const areaScale = Math.max(0.05, surface / baseSurface);
  const lengthScale = Math.sqrt(areaScale);

  const cerramientos = normalizeEstimatedFacadeTopology(
    normalizeCexRows(CEX37_DEFAULTS['envolvente.cerramientos.items'], [
      'nombre', 'tipoCerramiento', 'superficie', 'u', 'peso', 'posicion', 'modoDefinicion', 'patronSombras',
    ]),
    facadeCount,
    hasCatastroFacadeEstimate,
  );
  const selectedFacadeRows = cerramientos.filter(rowItem => rowItem.tipoCerramiento === 'Fachada');
  const defaultFacadeArea = selectedFacadeRows.reduce((sum, rowItem) => sum + (Number(cexDecimal(rowItem.superficie)) || 0), 0) || 1;
  const adjustedWallArea = Math.max(1, facadeArea - openingArea);
  cerramientos.forEach(rowItem => {
    rowItem.modoDefinicion = 'Por defecto';
    rowItem.patronSombras = noShadow;
    if (rowItem.tipoCerramiento === 'Cubierta') {
      rowItem.superficie = decimalForApp(roofSurface);
    } else if (rowItem.tipoCerramiento === 'Suelo') {
      rowItem.superficie = decimalForApp(soilSurface);
    } else if (rowItem.tipoCerramiento === 'Fachada') {
      const defaultArea = Number(cexDecimal(rowItem.superficie)) || (defaultFacadeArea / selectedFacadeRows.length);
      rowItem.superficie = decimalForApp(adjustedWallArea * defaultArea / defaultFacadeArea);
    }
  });

  let huecos = normalizeCexRows(CEX37_DEFAULTS['envolvente.huecos.items'], [
    'nombre', 'cerramientoAsociado', 'longitud', 'altura', 'multiplicador', 'superficie', 'uVidrio', 'gVidrio', 'uMarco', 'porcMarco', 'absortividadMarco', 'modoDefinicion', 'permeabilidad', 'orientacion', 'patronSombras',
  ]);
  if (hasCatastroFacadeEstimate || hasCatastroFloorEstimate) {
    huecos = estimateHuecosByFacadeAndFloor(selectedFacadeRows, floorAreas, height, noShadow);
  } else {
    const defaultOpeningArea = huecos.reduce((sum, rowItem) => sum + (Number(cexDecimal(rowItem.superficie)) || 0), 0) || 1;
    huecos.forEach(rowItem => {
      const defaultSurface = Number(cexDecimal(rowItem.superficie)) || (defaultOpeningArea / huecos.length);
      const nextSurface = Math.max(0.25, openingArea * defaultSurface / defaultOpeningArea);
      const defaultLength = Math.max(0.1, Number(cexDecimal(rowItem.longitud)) || 1);
      const defaultHeight = Math.max(0.1, Number(cexDecimal(rowItem.altura)) || 1);
      const shapeScale = Math.sqrt(nextSurface / Math.max(0.1, defaultLength * defaultHeight));
      rowItem.longitud = decimalForApp(defaultLength * shapeScale);
      rowItem.altura = decimalForApp(defaultHeight * shapeScale);
      rowItem.superficie = decimalForApp(nextSurface);
      rowItem.modoDefinicion = 'Estimadas';
      rowItem.patronSombras = noShadow;
    });
  }

  let puentes = normalizeCexRows(CEX37_DEFAULTS['envolvente.puentesTermicos.items'], [
    'nombre', 'cerramientoAsociado', 'tipoPuenteTermico', 'fi', 'longitud',
  ]);
  if (hasCatastroFacadeEstimate) {
    const validNames = new Set(cerramientos.map(rowItem => rowItem.nombre));
    puentes = puentes.filter(rowItem => validNames.has(rowItem.cerramientoAsociado));
  }
  puentes.forEach(rowItem => {
    const defaultLength = Number(cexDecimal(rowItem.longitud)) || perimeter;
    rowItem.longitud = decimalForApp(Math.max(0.1, defaultLength * lengthScale));
  });

  return {
    'envolvente.cerramientos.items': cerramientos,
    'envolvente.huecos.items': huecos,
    'envolvente.puentesTermicos.items': puentes,
  };
}

function normalizeEstimatedFacadeTopology(cerramientos, facadeCount, useCatastroEstimate) {
  if (!useCatastroEstimate) return cerramientos;
  const orientations = [
    ['NO', 'Muro de fachada NO'],
    ['SE', 'Muro de fachada SE'],
    ['SO', 'Muro de fachada SO'],
    ['NE', 'Muro de fachada NE'],
  ].slice(0, facadeCount);
  const existing = cerramientos.filter(rowItem => rowItem.tipoCerramiento === 'Fachada');
  const byPosition = new Map(existing.map(rowItem => [String(rowItem.posicion || '').toUpperCase(), rowItem]));
  const template = existing[0] || {
    nombre: 'Muro de fachada NO', tipoCerramiento: 'Fachada', superficie: '1', u: '0.38', peso: '200', posicion: 'NO', modoDefinicion: 'Por defecto', patronSombras: 'Sin patron',
  };
  const selected = orientations.map(([position, name]) => Object.assign({}, byPosition.get(position) || template, {
    nombre: name,
    tipoCerramiento: 'Fachada',
    posicion: position,
  }));
  return cerramientos.filter(rowItem => rowItem.tipoCerramiento !== 'Fachada').concat(selected);
}

function estimateHuecosByFacadeAndFloor(facadeRows, floorAreas, height, noShadow) {
  const totalFloorArea = floorAreas.reduce((sum, value) => sum + Math.max(1, value), 0) || 1;
  const windowHeight = Math.min(1.50, Math.max(1.10, height * 0.45));
  const openingsRatio = 0.22;
  const rows = [];
  facadeRows.forEach(facade => {
    const wallSurface = Math.max(1, Number(cexDecimal(facade.superficie)) || 1);
    const facadeOpeningSurface = wallSurface * openingsRatio / (1 - openingsRatio);
    floorAreas.forEach((floorSurface, floorIndex) => {
      const floorOpeningSurface = facadeOpeningSurface * Math.max(1, floorSurface) / totalFloorArea;
      const windowsOnFloor = Math.max(1, Math.min(4, Math.ceil(floorOpeningSurface / (2.5 * windowHeight))));
      const windowSurface = floorOpeningSurface / windowsOnFloor;
      for (let windowIndex = 0; windowIndex < windowsOnFloor; windowIndex += 1) {
        rows.push({
          nombre: `Hueco estimado ${facade.posicion} P${floorIndex + 1}${windowsOnFloor > 1 ? `-${windowIndex + 1}` : ''}`,
          cerramientoAsociado: facade.nombre,
          longitud: decimalForApp(windowSurface / windowHeight),
          altura: decimalForApp(windowHeight),
          multiplicador: '1',
          superficie: decimalForApp(windowSurface),
          uVidrio: '3.30',
          gVidrio: '0.75',
          uMarco: '4.00',
          porcMarco: '20',
          absortividadMarco: '0.65',
          modoDefinicion: 'Estimadas',
          permeabilidad: '50',
          orientacion: facade.posicion,
          patronSombras: noShadow,
        });
      }
    });
  });
  return rows;
}

function estimatedFloorAreas(surface, floors, lowestFloorSurface, largestFloorSurface) {
  const count = Math.max(1, Math.round(Number(floors) || 1));
  const total = Math.max(1, Number(surface) || 1);
  const lowest = lowestFloorSurface > 0 ? lowestFloorSurface : total / count;
  const largest = largestFloorSurface > 0 ? largestFloorSurface : total / count;
  if (count === 1) return [Math.max(1, largestFloorSurface || lowestFloorSurface || total)];
  if (count === 2) return [Math.max(1, lowest), Math.max(1, largest)];

  const middleTotal = Math.max(0, total - lowest - largest);
  const middle = middleTotal > 0 ? middleTotal / (count - 2) : total / count;
  return [Math.max(1, lowest), ...Array.from({ length: count - 2 }, () => Math.max(1, middle)), Math.max(1, largest)];
}

function estimatedSystemsPatch(data) {
  const estimatedBySystem = SELECT_OPTIONS.modoDefinicion[3] || 'Estimado según Instalación';
  const electric = SELECT_OPTIONS.combustible[0] || 'Electricidad';
  const buildingZone = SELECT_OPTIONS.zona[0] || 'Edificio Objeto';
  const yes = SELECT_OPTIONS.acumulacion[0] || 'Sí';
  const surface = decimalForApp(Math.max(1, Number(cexDecimal(data['generales.definicion.superficieUtilHabitable'] || data.superficieCatastral || 100))));
  return {
    'instalaciones.acs.items': [{
      nombre: 'ACS estimado',
      tipoEquipo: 'ACS',
      modoDefinicion: estimatedBySystem,
      tipoGenerador: 'Caldera Estándar',
      combustible: electric,
      rendimientoEstacional: '100',
      m2Cubiertos: surface,
      demandaCubierta: '100',
      zona: buildingZone,
      acumulacion: yes,
    }],
    'instalaciones.calefaccion.items': [{
      nombre: 'Calefacción estimada',
      tipoEquipo: 'Calefacción',
      modoDefinicion: estimatedBySystem,
      tipoGenerador: 'Bomba de Calor',
      combustible: electric,
      rendimientoEstacional: '180',
      m2Cubiertos: surface,
      demandaCubierta: '100',
      zona: buildingZone,
    }],
    'instalaciones.refrigeracion.items': [{
      nombre: 'Refrigeración estimada',
      tipoEquipo: 'Refrigeración',
      modoDefinicion: estimatedBySystem,
      tipoGenerador: 'Bomba de Calor',
      combustible: electric,
      rendimientoEstacional: '150',
      m2Cubiertos: surface,
      demandaCubierta: '100',
      zona: buildingZone,
    }],
    'instalaciones.contribuciones.items': [{
      nombre: 'Sin contribuciones renovables',
      zona: buildingZone,
      acsRenovable: '0',
      calefaccionRenovable: '0',
      refrigeracionRenovable: '0',
      calorRecuperadoAcs: '0',
      calorRecuperadoCalefaccion: '0',
      frioRecuperado: '0',
      energiaConsumidaGeneracionElectricidad: '0',
      combustible: electric,
    }],
  };
}

function decimalForApp(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '';
  return String(Math.round(number * 100) / 100);
}

function coveredSurfaceForPercentage(usefulSurface, percentage) {
  const surfaceText = String(usefulSurface ?? '').trim();
  const percentageText = String(percentage ?? '').trim();
  if (!surfaceText || !percentageText) return '';
  const surface = Number(surfaceText.replace(',', '.'));
  const percent = Number(percentageText.replace(',', '.'));
  if (!Number.isFinite(surface) || !Number.isFinite(percent)) return '';
  return decimalForApp(surface * percent / 100);
}

async function handleChatSubmit(event) {
  event.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = '';
  addChatMessage('user', text);
  try {
    await processChatText(text);
  } catch (error) {
    addChatMessage('assistant', 'No he podido aplicar el cambio: ' + error.message);
  }
}

function handleChatInputKeydown(event) {
  if (event.key !== 'Enter' || event.shiftKey) return;
  event.preventDefault();
  submitChatForm();
}

function submitChatForm() {
  if (typeof chatForm.requestSubmit === 'function') {
    chatForm.requestSubmit();
    return;
  }
  chatForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

async function processChatText(text) {
  if (state.pendingMatches.length) {
    const selected = resolvePendingSelection(text);
    if (!selected) {
      addChatMessage('assistant', 'No he pillado cuál. Responde con el número del expediente.');
      return;
    }
    const patch = state.pendingPatch || {};
    state.pendingMatches = [];
    state.pendingPatch = null;
    await applyChatPatch(selected, patch);
    return;
  }

  const patch = parseDictation(text);
  const target = findChatTarget(text, patch);

  if (target.status === 'multiple') {
    state.pendingMatches = target.matches;
    state.pendingPatch = patch;
    addChatMessage('assistant', buildMultipleMatchesMessage(target.matches));
    return;
  }

  if (target.status === 'none') {
    addChatMessage('assistant', 'Selecciona un expediente vivo arriba o dime una referencia catastral antes de dictar datos.');
    return;
  }

  await applyChatPatch(target.record, patch);
}

async function applyChatPatch(record, patch, options = {}) {
  const current = normalizeRecord(record || {});
  const data = Object.assign({}, current.data);

  const effectivePatch = Object.assign({}, patch);
  const currentReference = normalizeReference(data['admin.localizacion.referenciaCatastral']);
  const dictatedReference = normalizeReference(effectivePatch['admin.localizacion.referenciaCatastral']);
  if (currentReference && dictatedReference && currentReference !== dictatedReference) {
    delete effectivePatch['admin.localizacion.referenciaCatastral'];
  }

  const changes = Object.entries(effectivePatch)
    .filter(([path, value]) => !isTechnicianPath(path) && hasValue(value));

  if (!changes.length) {
    addChatMessage('assistant', 'No he encontrado ningún campo editable en ese mensaje. Prueba con “nombre cliente…”, “teléfono…”, “superficie útil…”, etc.');
    return;
  }

  changes.forEach(([path, value]) => {
    data[path] = mergeFieldValue(data[path], value, path);
  });

  const optimistic = normalizeRecord(Object.assign({}, current, { data }));
  optimistic.updatedAt = new Date().toISOString();
  addSummaryFields(optimistic);
  upsertRecord(optimistic);
  state.selectedId = optimistic.id;
  state.activeChatId = optimistic.id;
  state.rightView = 'detail';
  renderAll();

  let saved = optimistic;
  try {
    saved = await persistRecordPatch(optimistic, changes.map(([path]) => path));
  } catch (error) {
    showSyncAlert(sheetErrorHelp(error));
    addChatMessage('assistant', 'Lo he aplicado en pantalla, pero Google Sheet no ha guardado. Al refrescar se perderá: ' + sheetErrorHelp(error));
    if (options.throwOnError) throw error;
    return;
  }

  const changedSections = [...new Set(changes.map(([path]) => sectionLabel(path.split('.')[0])))].join(', ');
  addChatMessage('assistant', `Actualizado ${changedSections || 'expediente'} en ${recordLabel(saved)}. Faltan: ${missingSections(saved).join(', ') || 'nada importante'}.`);
  return saved;
}

function mergeFieldValue(oldValue, newValue, path = '') {
  if (!hasValue(oldValue)) return newValue;
  if (Array.isArray(oldValue)) return Array.isArray(newValue) ? oldValue.concat(newValue) : oldValue;
  if (String(oldValue).includes(newValue)) return oldValue;
  if (!isTextareaField(path)) return newValue;
  return `${oldValue}\n${newValue}`;
}

function isTextareaField(path) {
  return FLAT_FIELDS.find(item => item.path === path)?.type === 'textarea';
}

async function persistRecord(record) {
  const now = new Date().toISOString();
  const next = normalizeRecord(Object.assign({}, record));
  next.id = next.id || createId();
  next.createdAt = next.createdAt || now;
  next.updatedAt = now;
  next.estado = inferStatus(next);
  addSummaryFields(next);

  if (!state.config.apiUrl) {
    throw new Error('Configura Google Sheet antes de guardar. Esta app ya no guarda expedientes en local.');
  }

  const saved = (await api({ action: 'save', item: next })).item;

  const normalized = normalizeRecord(saved);
  upsertRecord(normalized);
  state.selectedId = normalized.id;
  state.activeChatId = normalized.id;
  state.draft = null;
  renderAll();
  return normalized;
}

async function persistRecordPatch(record, changedPaths) {
  const now = new Date().toISOString();
  const next = normalizeRecord(Object.assign({}, record));
  next.id = next.id || createId();
  next.createdAt = next.createdAt || now;
  next.updatedAt = now;
  next.estado = inferStatus(next);
  addSummaryFields(next);

  if (!state.config.apiUrl) {
    throw new Error('Configura Google Sheet antes de guardar. Esta app ya no guarda expedientes en local.');
  }

  const dataPatch = {};
  changedPaths.forEach(path => {
    dataPatch[path] = clone(next.data[path]);
  });

  const saved = (await api({
    action: 'patch',
    id: next.id,
    referenciaCatastral: next.referenciaCatastral,
    item: compactRecordForPatch(next, dataPatch),
    dataPatch,
  })).item;

  const verified = await verifyPatchSaved(next.id, dataPatch);
  const normalized = normalizeRecord(verified || saved);
  upsertRecord(normalized);
  state.selectedId = normalized.id;
  state.activeChatId = normalized.id;
  state.draft = null;
  renderAll();
  return normalized;
}

async function verifyPatchSaved(id, dataPatch) {
  if (!id || !dataPatch || !Object.keys(dataPatch).length) return null;
  const response = await api({ action: 'get', id });
  const item = response.item;
  if (!item) throw new Error('Google Sheet no devolvió el expediente tras guardar');
  const record = normalizeRecord(item);
  const missing = Object.entries(dataPatch).filter(([path, expected]) => {
    return !sameStoredValue(storedValueForPatchPath(record, path), expected);
  });
  if (missing.length) {
    throw new Error('Google Sheet respondió, pero no devolvió confirmados estos campos: ' + missing.map(([path]) => path).join(', '));
  }
  return record;
}

function storedValueForPatchPath(record, path) {
  if (path.includes('.')) return record?.data?.[path];
  return record?.[path] ?? record?.data?.[path];
}

function sameStoredValue(actual, expected) {
  if (Array.isArray(actual) || Array.isArray(expected) || typeof actual === 'object' || typeof expected === 'object') {
    return JSON.stringify(actual ?? '') === JSON.stringify(expected ?? '');
  }
  return normalizeStoredScalar(actual) === normalizeStoredScalar(expected);
}

function normalizeStoredScalar(value) {
  return String(value ?? '').trim();
}

function compactRecordForPatch(record, dataPatch) {
  return {
    id: record.id,
    referenciaCatastral: record.referenciaCatastral,
    estado: record.estado,
    gestor: record.gestor,
    direccion: record.direccion,
    municipio: record.municipio,
    provincia: record.provincia,
    codigoPostal: record.codigoPostal,
    uso: record.uso,
    superficieUtil: record.superficieUtil,
    superficieCatastral: record.superficieCatastral,
    anioConstruccion: record.anioConstruccion,
    plantas: record.plantas,
    orientacionPrincipal: record.orientacionPrincipal,
    tipoEdificio: record.tipoEdificio,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    data: dataPatch,
  };
}

async function deleteSelectedRecord() {
  const record = selectedRecord();
  if (!record || !record.id) return;
  if (!state.config.apiUrl) {
    addChatMessage('assistant', 'Configura Google Sheet antes de eliminar. Esta app ya no borra expedientes locales.');
    return;
  }
  const label = recordLabel(record);
  const confirmed = window.confirm(`Vas a eliminar el expediente "${label}" de Google Sheet. ¿Seguimos?`);
  if (!confirmed) return;

  try {
    const deleteRequest = {
      action: 'delete',
      id: record.id,
      referenciaCatastral: valueAt(record, 'admin.localizacion.referenciaCatastral'),
    };
    try {
      await api(deleteRequest);
    } catch (error) {
      const confirmed = await recoverConfirmedDelete(deleteRequest);
      if (!confirmed) throw error;
    }

    state.records = state.records.filter(item => item.id !== record.id);
    state.selectedId = state.records[0]?.id || '';
    state.activeChatId = state.records.find(item => inferStatus(item) !== 'COMPLETA')?.id || '';
    state.rightView = 'list';
    window.location.reload();
  } catch (error) {
    showSyncAlert(sheetErrorHelp(error));
    addChatMessage('assistant', 'No he podido eliminar el expediente: ' + error.message);
  }
}

async function recoverConfirmedDelete(request) {
  try {
    const response = await jsonpAppsScript(state.config.apiUrl, {
      action: 'list',
      secret: state.config.secret,
    });
    const reference = normalizeReference(request.referenciaCatastral);
    const stillExists = (response.items || []).some(item => {
      const sameId = request.id && String(item.id || '') === String(request.id);
      const sameReference = reference && normalizeReference(item.referenciaCatastral) === reference;
      return sameId || sameReference;
    });
    return !stillExists;
  } catch (error) {
    return false;
  }
}

function cleanupLocalDataStorage() {
  LOCAL_DATA_KEYS.forEach(key => localStorage.removeItem(key));
}

function upsertRecord(record) {
  const index = state.records.findIndex(item => item.id === record.id);
  if (index >= 0) state.records[index] = record;
  else state.records.unshift(record);
}

function addSummaryFields(record) {
  record.referenciaCatastral = valueAt(record, 'admin.localizacion.referenciaCatastral');
  record.direccion = valueAt(record, 'admin.localizacion.direccion');
  record.municipio = valueAt(record, 'admin.localizacion.localidad');
  record.provincia = valueAt(record, 'admin.localizacion.provincia');
  record.codigoPostal = valueAt(record, 'admin.localizacion.codigoPostal');
  record.uso = valueAt(record, 'uso') || record.uso || '';
  record.tipoEdificio = valueAt(record, 'generales.datos.tipoEdificio');
  record.superficieUtil = valueAt(record, 'generales.definicion.superficieUtilHabitable');
  record.superficieCatastral = valueAt(record, 'superficieCatastral') || record.superficieCatastral || '';
  record.anioConstruccion = valueAt(record, 'generales.datos.anioConstruccion');
  record.plantas = valueAt(record, 'generales.definicion.numeroPlantasHabitables') || record.plantas || '';
}

function parseDictation(text) {
  const patch = {};
  const source = String(text || '').replace(/\s+/g, ' ').trim();
  const normalized = normalizeSpeech(source);
  const matches = [];
  const technicianOnlyRequest = isTechnicianOnlyRequest(normalized);

  aliasMap.forEach(({ path, pattern }) => {
    const regex = new RegExp(`(?:^|[\\s,;.])${pattern}\\s*(?:es|son|:|=)?\\s*`, 'giu');
    let match = regex.exec(normalized);
    while (match) {
      const valueStart = match.index + match[0].length;
      if (!technicianOnlyRequest && !isTechnicianPath(path) && !hasTechnicianContext(normalized, match.index, valueStart)) {
        matches.push({ path, start: match.index, valueStart });
      }
      match = regex.exec(normalized);
    }
  });

  matches.sort((a, b) => a.start - b.start || b.valueStart - a.valueStart);
  const filteredMatches = [];
  matches.forEach(match => {
    const previous = filteredMatches[filteredMatches.length - 1];
    if (previous && match.start < previous.valueStart) return;
    if (previous && previous.path === match.path) return;
    filteredMatches.push(match);
  });

  filteredMatches.forEach((match, index) => {
    const end = index + 1 < filteredMatches.length ? filteredMatches[index + 1].start : source.length;
    const rawValue = source.slice(match.valueStart, end).replace(/^[\s,;.:=-]+|[\s,;.:=-]+$/g, '');
    const value = cleanFieldValue(match.path, rawValue);
    if (value) patch[match.path] = value;
  });

  const reference = extractReference(text);
  if (reference) patch['admin.localizacion.referenciaCatastral'] = reference;
  return Object.assign(patch, parseTableDictation(source, normalized));
}

function parseTableDictation(source, normalized) {
  if (isTechnicianOnlyRequest(normalized)) return {};
  const patch = {};
  const tableParsers = [
    ['envolvente.cerramientos.items', /\b(cerramiento|muro|cubierta|suelo|medianera)\b/i, parseCerramientoRow],
    ['envolvente.huecos.items', /\b(hueco|ventana|puerta|lucernario)\b/i, parseHuecoRow],
    ['envolvente.puentesTermicos.items', /\b(puente termico|puente térmico|pilar en fachada|forjado|solera)\b/i, parsePuenteTermicoRow],
    ['instalaciones.acs.items', /\b(equipo acs|agua caliente|termo|caldera)\b/i, parseAcsRow],
    ['instalaciones.calefaccion.items', /\b(calefaccion|calefacción|radiador|bomba de calor)\b/i, parseCalefaccionRow],
    ['instalaciones.refrigeracion.items', /\b(refrigeracion|refrigeración|aire acondicionado|frio|frío)\b/i, parseRefrigeracionRow],
    ['instalaciones.contribuciones.items', /\b(contribucion|contribución|renovable|solar|fotovoltaica)\b/i, parseContribucionRow],
  ];

  tableParsers.forEach(([path, trigger, parser]) => {
    if (!trigger.test(source)) return;
    if (path === 'envolvente.cerramientos.items' && /\b(hueco|ventana|puerta|lucernario)\b/i.test(source)) return;
    if ((path === 'instalaciones.calefaccion.items' || path === 'instalaciones.refrigeracion.items') && /\b(contribucion|contribución|renovable|solar|fotovoltaica)\b/i.test(source)) return;
    const rowItem = parser(source);
    if (rowItem && Object.values(rowItem).some(Boolean)) patch[path] = [rowItem];
  });
  return patch;
}

function parseCerramientoRow(text) {
  const tipo = firstMatch(text, [
    ['Cubierta', /\bcubierta\b/i],
    ['Suelo', /\bsuelo\b/i],
    ['Medianera', /\bmedianera\b/i],
    ['Fachada', /\b(fachada|muro)\b/i],
  ]);
  const posicion = normalizeOrientation(extractAfter(text, ['orientacion', 'orientación', 'posicion', 'posición']) || firstOrientation(text));
  return compactObject({
    nombre: extractAfter(text, ['cerramiento', 'fachada', 'muro', 'cubierta', 'suelo']) || tipo || 'Cerramiento',
    tipoCerramiento: tipo,
    superficie: extractNumberAfter(text, ['superficie', 'metros cuadrados', 'm2']),
    u: extractNumberAfter(text, ['u', 'transmitancia']),
    peso: extractNumberAfter(text, ['peso']),
    posicion,
    modoDefinicion: extractAfter(text, ['modo definicion', 'modo definición']) || 'Por defecto',
    patronSombras: extractAfter(text, ['patron sombras', 'patrón sombras']) || 'Sin patrón',
  });
}

function parseHuecoRow(text) {
  return compactObject({
    nombre: extractAfter(text, ['hueco', 'ventana', 'puerta', 'lucernario']) || 'Hueco',
    cerramientoAsociado: extractAfter(text, ['cerramiento asociado', 'cerramiento', 'fachada asociada', 'fachada']),
    longitud: extractNumberAfter(text, ['longitud', 'ancho', 'anchura']),
    altura: extractNumberAfter(text, ['altura', 'alto']),
    multiplicador: extractNumberAfter(text, ['multiplicador', 'cantidad', 'unidades']) || '1',
    superficie: extractNumberAfter(text, ['superficie']),
    uVidrio: extractNumberAfter(text, ['u vidrio', 'transmitancia vidrio']),
    gVidrio: extractNumberAfter(text, ['g vidrio', 'factor solar']),
    uMarco: extractNumberAfter(text, ['u marco', 'transmitancia marco']),
    porcMarco: extractNumberAfter(text, ['porcentaje marco', 'porc marco', '% marco']),
    absortividadMarco: extractNumberAfter(text, ['absortividad marco', 'absortividad']),
    modoDefinicion: extractAfter(text, ['modo definicion', 'modo definición']) || 'Estimadas',
    permeabilidad: extractNumberAfter(text, ['permeabilidad']),
    orientacion: normalizeOrientation(extractAfter(text, ['orientacion', 'orientación']) || firstOrientation(text)),
    patronSombras: extractAfter(text, ['patron sombras', 'patrón sombras']) || 'Sin patrón',
  });
}

function parsePuenteTermicoRow(text) {
  return compactObject({
    nombre: extractAfter(text, ['puente termico', 'puente térmico']) || 'Puente térmico',
    cerramientoAsociado: extractAfter(text, ['cerramiento asociado', 'cerramiento', 'fachada']),
    tipoPuenteTermico: extractAfter(text, ['tipo puente termico', 'tipo puente térmico', 'tipo']),
    fi: extractNumberAfter(text, ['fi', 'psi']),
    longitud: extractNumberAfter(text, ['longitud']),
  });
}

function parseAcsRow(text) {
  return compactObject({
    nombre: extractAfter(text, ['acs', 'agua caliente', 'equipo']) || 'Equipo ACS',
    tipoEquipo: 'ACS',
    modoDefinicion: extractAfter(text, ['modo definicion', 'modo definición']) || 'Estimado según Instalación',
    tipoGenerador: generatorFromText(text),
    combustible: fuelFromText(text),
    rendimientoEstacional: extractNumberAfter(text, ['rendimiento estacional', 'rendimiento']),
    m2Cubiertos: extractNumberAfter(text, ['m2 cubiertos', 'metros cubiertos', 'superficie cubierta']),
    demandaCubierta: extractNumberAfter(text, ['demanda cubierta', 'porcentaje demanda', '% demanda']),
    zona: extractAfter(text, ['zona']) || 'Edificio Objeto',
    acumulacion: firstMatch(text, [
      ['Sí', /\b(si|sí|con acumulacion|con acumulación)\b/i],
      ['No', /\b(no|sin acumulacion|sin acumulación)\b/i],
    ]),
  });
}

function parseCalefaccionRow(text) {
  return compactObject({
    nombre: extractAfter(text, ['calefaccion', 'calefacción', 'equipo']) || 'Equipo calefacción',
    tipoEquipo: 'Calefacción',
    modoDefinicion: extractAfter(text, ['modo definicion', 'modo definición']) || 'Estimado según Instalación',
    tipoGenerador: generatorFromText(text),
    combustible: fuelFromText(text),
    rendimientoEstacional: extractNumberAfter(text, ['rendimiento estacional', 'rendimiento']),
    m2Cubiertos: extractNumberAfter(text, ['m2 cubiertos', 'metros cubiertos', 'superficie cubierta']),
    demandaCubierta: extractNumberAfter(text, ['demanda cubierta', 'porcentaje demanda', '% demanda']),
    zona: extractAfter(text, ['zona']) || 'Edificio Objeto',
  });
}

function parseRefrigeracionRow(text) {
  return compactObject({
    nombre: extractAfter(text, ['refrigeracion', 'refrigeración', 'aire acondicionado', 'equipo']) || 'Equipo refrigeración',
    tipoEquipo: 'Refrigeración',
    modoDefinicion: extractAfter(text, ['modo definicion', 'modo definición']) || 'Estimado según Instalación',
    tipoGenerador: generatorFromText(text),
    combustible: fuelFromText(text),
    rendimientoEstacional: extractNumberAfter(text, ['rendimiento estacional', 'rendimiento']),
    m2Cubiertos: extractNumberAfter(text, ['m2 cubiertos', 'metros cubiertos', 'superficie cubierta']),
    demandaCubierta: extractNumberAfter(text, ['demanda cubierta', 'porcentaje demanda', '% demanda']),
    zona: extractAfter(text, ['zona']) || 'Edificio Objeto',
  });
}

function parseContribucionRow(text) {
  return compactObject({
    nombre: extractAfter(text, ['contribucion', 'contribución', 'renovable', 'solar']) || 'Contribuciones energéticas',
    zona: extractAfter(text, ['zona']) || 'Edificio Objeto',
    acsRenovable: extractNumberAfter(text, ['acs renovable', 'demanda acs', 'acs']),
    calefaccionRenovable: extractNumberAfter(text, ['calefaccion renovable', 'calefacción renovable', 'calefaccion']),
    refrigeracionRenovable: extractNumberAfter(text, ['refrigeracion renovable', 'refrigeración renovable', 'refrigeracion']),
    calorRecuperadoAcs: extractNumberAfter(text, ['calor recuperado acs', 'calor recuperado para acs']),
    calorRecuperadoCalefaccion: extractNumberAfter(text, ['calor recuperado calefaccion', 'calor recuperado calefacción', 'calor recuperado para calefaccion', 'calor recuperado para calefacción']),
    frioRecuperado: extractNumberAfter(text, ['frio recuperado', 'frío recuperado']),
    energiaConsumidaGeneracionElectricidad: extractNumberAfter(text, ['energia consumida generacion electricidad', 'energía consumida generación electricidad', 'energia consumida en generacion de electricidad', 'energía consumida en generación de electricidad']),
    combustible: fuelFromText(text),
  });
}

function findChatTarget(text, patch) {
  const explicitReference = patch['admin.localizacion.referenciaCatastral'] || extractReference(text);
  const selected = activeChatRecord();

  if (explicitReference) {
    const matches = findRecordsByReference(explicitReference);
    if (matches.length === 1) return { status: 'one', record: matches[0] };
    if (matches.length > 1) return { status: 'multiple', matches };
    return { status: 'one', record: normalizeRecord({ data: Object.assign({}, DEFAULT_TECHNICIAN, { 'admin.localizacion.referenciaCatastral': explicitReference }) }) };
  }

  if (selected) return { status: 'one', record: selected };
  return { status: 'none' };
}

function findRecordsByReference(reference) {
  const needle = normalizeReference(reference);
  return state.records.filter(record => {
    const candidate = normalizeReference(valueAt(record, 'admin.localizacion.referenciaCatastral'));
    return candidate && (candidate === needle || candidate.includes(needle) || needle.includes(candidate));
  });
}

function resolvePendingSelection(text) {
  const number = Number((text.match(/\d+/) || [])[0]);
  if (number >= 1 && number <= state.pendingMatches.length) return state.pendingMatches[number - 1];
  const matches = findRecordsByReference(text);
  return matches.length === 1 ? matches[0] : null;
}

function buildMultipleMatchesMessage(matches) {
  const options = matches.map((record, index) => `${index + 1}. ${recordLabel(record)} - ${recordPlace(record)}`).join('\n');
  return `Hay más de un expediente que encaja. Dime el número:\n${options}`;
}

async function loadCatastroForSelected() {
  return loadCatastroForRecord(selectedRecord());
}

async function loadCatastroForRecord(sourceRecord, options = {}) {
  let record = sourceRecord;
  if (!record) return;
  if (!state.config.apiUrl) {
    addChatMessage('assistant', 'Configura Google Sheet antes de consultar Catastro. Esta app ya no trabaja con expedientes locales.');
    return;
  }
  const data = Object.assign({}, record.data);
  if (record.id === state.selectedId && !detailView.hidden) {
    Array.from(new FormData(detailForm).entries()).forEach(([path, value]) => {
      data[path] = String(value || '').trim();
    });
    collectTables(data);
  }
  record = Object.assign({}, record, { data });
  const reference = normalizeReference(valueAt(record, 'admin.localizacion.referenciaCatastral'));
  if (!reference || reference.length !== 20) {
    addChatMessage('assistant', 'Necesito una referencia catastral de 20 caracteres para consultar Catastro.');
    return;
  }

  addChatMessage('assistant', 'Consulto Catastro desde Apps Script para evitar bloqueos CORS del navegador.');
  try {
    const rawPatch = await fetchCatastroPatch(reference);
    const patch = emptyOnlyPatch(record, rawPatch);
    if (!Object.keys(patch).length) throw new Error('Catastro no devolvió datos útiles');
    const saved = await applyChatPatch(record, patch, options);
    if (!saved && options.throwOnError) throw new Error('Catastro no pudo guardar los datos del expediente.');
    return saved || record;
  } catch (error) {
    addChatMessage('assistant', 'No he podido consultar Catastro: ' + error.message);
    if (options.throwOnError) throw error;
    return null;
  }
}

async function fetchCatastroPatch(reference) {
  const catastroItem = (await api({ action: 'catastro', reference })).item || {};
  if (!hasUsefulCatastroData(catastroItem)) {
    throw new Error(catastroItem.error || 'Catastro no ha devuelto datos del inmueble.');
  }
  const rawPatch = catastroPatchFromData(catastroItem);
  await addGeneratedSituationPlan(rawPatch);
  if (!Object.keys(rawPatch).length) throw new Error('Catastro no devolvio datos utiles');
  return rawPatch;
}

function hasUsefulCatastroData(item) {
  if (!item || item.error) return false;
  if (hasValue(item.direccion) || hasValue(item.codigoPostal) || hasValue(item.uso) || hasValue(item.anioConstruccion)) return true;
  if (hasValue(item.superficieCatastral)) return true;
  return Array.isArray(item.construcciones) && item.construcciones.some(row => hasValue(row.destino) || hasValue(row.superficie));
}

async function browserCatastroPatch(reference) {
  const url = 'https://ovc.catastro.meh.es/OVCServWeb/OVCSWLocalizacionRC/OVCCallejero.asmx/Consulta_DNPRC?Provincia=&Municipio=&RC=' + encodeURIComponent(reference);
  const response = await fetch(url);
  const xml = await response.text();
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  const text = tag => doc.querySelector(tag)?.textContent?.trim() || '';
  const coordinates = await browserCatastroCoordinates(reference).catch(() => ({}));
  return catastroPatchFromData({
    referenciaCatastral: reference,
    direccion: text('ldt'),
    localidad: text('nm'),
    provincia: titleCase(text('np')),
    codigoPostal: text('dp'),
    uso: text('luso'),
    superficieCatastral: text('sfc'),
    anioConstruccion: text('ant'),
    construcciones: Array.from(doc.querySelectorAll('cons')).map(item => ({
      destino: item.querySelector('lcd')?.textContent?.trim() || '',
      superficie: item.querySelector('stl')?.textContent?.trim() || '',
      planta: item.querySelector('pt')?.textContent?.trim() || '',
    })),
    x: coordinates.x,
    y: coordinates.y,
    srs: coordinates.srs,
  });
}

async function browserCatastroCoordinates(reference) {
  const parcelReference = normalizeReference(reference).slice(0, 14);
  if (parcelReference.length !== 14) return {};
  const url = 'https://ovc.catastro.meh.es/OVCServWeb/OVCSWLocalizacionRC/OVCCoordenadas.asmx/Consulta_CPMRC?Provincia=&Municipio=&SRS=EPSG:4326&RC=' + encodeURIComponent(parcelReference);
  const response = await fetch(url);
  const xml = await response.text();
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  const text = tag => doc.querySelector(tag)?.textContent?.trim() || '';
  return { x: text('xcen'), y: text('ycen'), srs: text('srs') };
}

function catastroPatchFromData(item) {
  const reference = normalizeReference(item.referenciaCatastral || '');
  const address = item.direccion || '';
  const provincia = titleCase(item.provincia || '');
  const localidad = item.localidad || '';
  const codigoPostal = item.codigoPostal || '';
  const x = String(item.x || '').trim();
  const y = String(item.y || '').trim();
  const srs = String(item.srs || '').trim() || (x && y ? 'EPSG:4326' : '');
  const situationMapUrl = catastroMapUrlFromData({ reference, x, y, srs });
  const viviendaSurface = surfaceForUse(item.construcciones, 'VIVIENDA');
  const viviendaFloors = floorsForUse(item.construcciones, 'VIVIENDA');
  const floorSurfaces = floorSurfaceSummary(item.construcciones, 'VIVIENDA');
  const builtSurface = item.superficieCatastral || viviendaSurface || '';
  const residentialUse = String(item.uso || '').toLowerCase().includes('residencial');
  return compactPatch({
    'admin.localizacion.referenciaCatastral': reference,
    'admin.localizacion.nombreEdificio': address,
    'admin.localizacion.direccion': address,
    'admin.localizacion.provincia': provincia,
    'admin.localizacion.localidad': localidad,
    'admin.localizacion.codigoPostal': codigoPostal,
    'admin.cliente.direccion': address,
    'admin.cliente.provincia': provincia,
    'admin.cliente.localidad': localidad,
    'admin.cliente.codigoPostal': codigoPostal,
    'generales.datos.anioConstruccion': item.anioConstruccion || '',
    'generales.datos.normativaVigente': normativaVigenteDesdeAnio(item.anioConstruccion),
    'generales.datos.tipoEdificio': residentialUse ? 'Vivienda individual' : '',
    'generales.datos.provincia': provincia,
    'generales.datos.localidad': localidad,
    'generales.definicion.superficieUtilHabitable': viviendaSurface || builtSurface,
    'generales.definicion.numeroPlantasHabitables': viviendaFloors,
    'generales.definicion.alturaLibrePlanta': residentialUse ? '2.70' : '',
    'generales.definicion.ventilacionInmueble': residentialUse ? '0.63' : '',
    'generales.definicion.demandaDiariaACS': residentialUse ? '120' : '',
    'generales.definicion.masaParticionesInternas': 'Ligera',
    'generales.definicion.imagenEdificio': item.imagenEdificio || item.streetViewImage || '',
    'generales.definicion.planoSituacion': item.planoSituacion || item.situationPlanImage || situationMapUrl || (reference ? `Catastro: ${reference}` : ''),
    'catastro.x': x,
    'catastro.y': y,
    'catastro.srs': srs,
    'catastro.reference': reference,
    'catastro.superficiePlantaInferior': floorSurfaces.lowest,
    'catastro.superficiePlantaMayor': floorSurfaces.largest,
    'catastro.parcelasColindantes': item.parcelasColindantes || '',
    'catastro.fachadasExpuestas': item.fachadasExpuestas || '',
    uso: item.uso || '',
    superficieCatastral: builtSurface,
  });
}

function catastroMapUrlFromData({ reference, x, y, srs }) {
  if (!reference || !x || !y) return '';
  const params = new URLSearchParams({
    refcat: reference,
    x,
    y,
    srs: srs || 'EPSG:4326',
  });
  return `https://www1.sedecatastro.gob.es/Cartografia/mapa.aspx?${params.toString()}`;
}

const CATASTRO_PROVINCE_CODES = {
  almeria: '04',
  cadiz: '11',
  cordoba: '14',
  granada: '18',
  huelva: '21',
  jaen: '23',
  malaga: '29',
  sevilla: '41',
};

const CATASTRO_MUNICIPALITY_CODES = {
  'sevilla|dos hermanas': '38',
  'sevilla|sevilla': '15',
};

function catastroCartographyUrl(record) {
  const reference = normalizeReference(valueAt(record, 'admin.localizacion.referenciaCatastral'));
  if (reference.length !== 20) return '';

  const x = valueAt(record, 'catastro.x');
  const y = valueAt(record, 'catastro.y');
  const coordinateReference = normalizeReference(valueAt(record, 'catastro.reference'));
  if (x && y && (!coordinateReference || coordinateReference === reference)) return catastroMapUrlFromData({
    reference,
    x,
    y,
    srs: valueAt(record, 'catastro.srs') || 'EPSG:4326',
  });

  const params = catastroLocationParams(record);
  params.set('refcat', reference);
  params.set('final', '');
  params.set('ZV', 'NO');
  params.set('anyoZV', '');
  return `https://www1.sedecatastro.gob.es/Cartografia/mapa.aspx?${params.toString()}`;
}

function catastro3dUrl(record) {
  const reference = normalizeReference(valueAt(record, 'admin.localizacion.referenciaCatastral'));
  if (reference.length !== 20) return '';
  const params = catastroLocationParams(record);
  params.set('refcat', reference);
  params.set('final', '');
  return `https://www1.sedecatastro.gob.es/Cartografia/FXCC/Visor3D.aspx?${params.toString()}`;
}

function catastroLocationParams(record) {
  const province = normalizeText(valueAt(record, 'admin.localizacion.provincia'));
  const locality = normalizeText(valueAt(record, 'admin.localizacion.localidad'));
  const params = new URLSearchParams();
  const provinceCode = CATASTRO_PROVINCE_CODES[province];
  const municipalityCode = CATASTRO_MUNICIPALITY_CODES[`${province}|${locality}`];
  if (provinceCode) params.set('del', provinceCode);
  if (municipalityCode) params.set('mun', municipalityCode);
  return params;
}

async function addGeneratedSituationPlan(patch) {
  const currentPlan = String(patch?.['generales.definicion.planoSituacion'] || '').trim();
  if (currentPlan.startsWith('data:image/')) return patch;
  const model = catastroSituationPlanModel(patch);
  if (!model.x || !model.y) return patch;
  const image = catastroSituationPlanPng(model);
  if (image) patch['generales.definicion.planoSituacion'] = image;
  return patch;
}

function catastroSituationPlanModel(source) {
  const reference = String(source?.['admin.localizacion.referenciaCatastral'] || source?.reference || '').trim();
  const address = String(source?.['admin.localizacion.direccion'] || source?.address || '').trim();
  const locality = String(source?.['admin.localizacion.localidad'] || source?.locality || '').trim();
  const subtitle = [address, locality].filter(Boolean).join(', ');
  return {
    title: 'Plano de situación',
    reference,
    subtitle,
    x: String(source?.['catastro.x'] || source?.x || '').trim(),
    y: String(source?.['catastro.y'] || source?.y || '').trim(),
    srs: String(source?.['catastro.srs'] || source?.srs || 'EPSG:4326').trim(),
  };
}

function catastroSituationPlanPng(model) {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  if (!canvas || !canvas.getContext) return '';
  canvas.width = 900;
  canvas.height = 620;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = '#fffdf8';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#d7cfc2';
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 28, canvas.width - 56, canvas.height - 56);

  ctx.fillStyle = '#111827';
  ctx.font = 'bold 34px Arial, sans-serif';
  ctx.fillText(model.title, 52, 82);
  ctx.font = '20px Arial, sans-serif';
  wrapCanvasText(ctx, model.subtitle || model.reference, 52, 118, 760, 26);

  ctx.strokeStyle = '#e8d8bf';
  ctx.lineWidth = 1;
  for (let x = 80; x < 840; x += 76) {
    ctx.beginPath();
    ctx.moveTo(x, 170);
    ctx.lineTo(x + 90, 540);
    ctx.stroke();
  }
  for (let y = 190; y < 540; y += 58) {
    ctx.beginPath();
    ctx.moveTo(70, y);
    ctx.lineTo(830, y - 28);
    ctx.stroke();
  }

  ctx.strokeStyle = '#b9a889';
  ctx.lineWidth = 9;
  [[80, 450, 810, 220], [120, 245, 780, 420], [420, 175, 390, 540]].forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  });

  ctx.fillStyle = 'rgba(45, 107, 83, 0.16)';
  ctx.strokeStyle = '#0f6b4d';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(412, 294);
  ctx.lineTo(510, 278);
  ctx.lineTo(545, 364);
  ctx.lineTo(440, 386);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#d81e1e';
  ctx.beginPath();
  ctx.arc(480, 332, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = '#111827';
  ctx.font = 'bold 18px Arial, sans-serif';
  ctx.fillText('Parcela catastral', 516, 326);
  ctx.font = '16px Arial, sans-serif';
  ctx.fillText(`Ref. ${model.reference}`, 516, 351);
  ctx.fillText(`${model.srs}: ${model.x}, ${model.y}`, 52, 574);

  ctx.font = 'bold 20px Arial, sans-serif';
  ctx.fillText('N', 810, 105);
  ctx.beginPath();
  ctx.moveTo(818, 116);
  ctx.lineTo(802, 152);
  ctx.lineTo(834, 152);
  ctx.closePath();
  ctx.fill();

  return canvas.toDataURL('image/png');
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  let line = '';
  words.forEach(word => {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      y += lineHeight;
      line = word;
    } else {
      line = testLine;
    }
  });
  if (line) ctx.fillText(line, x, y);
}

function emptyOnlyPatch(record, patch) {
  const current = normalizeRecord(record || {});
  return Object.fromEntries(Object.entries(patch || {}).filter(([path, value]) => {
    if (!hasValue(value)) return false;
    const currentValue = path.includes('.') ? valueAt(current, path) : (current[path] ?? current.data?.[path]);
    if (isImageFieldPath(path) && isDataImageValue(value) && !isDataImageValue(currentValue)) return true;
    if (path.includes('.')) return !hasValue(valueAt(current, path));
    return !hasValue(current[path]) && !hasValue(current.data?.[path]);
  }));
}

function isImageFieldPath(path) {
  return path === 'generales.definicion.imagenEdificio' || path === 'generales.definicion.planoSituacion';
}

function isDataImageValue(value) {
  return String(value || '').trim().startsWith('data:image/');
}

function surfaceForUse(items, useName) {
  const normalizedUse = normalizeText(useName);
  const total = (items || [])
    .filter(item => normalizeText(item.destino).includes(normalizedUse))
    .reduce((sum, item) => sum + numericCatastroSurface(item.superficie), 0);
  return total > 0 ? String(total) : '';
}

function floorsForUse(items, useName) {
  const normalizedUse = normalizeText(useName);
  const matchingRows = (items || []).filter(item => normalizeText(item.destino).includes(normalizedUse));
  const floors = new Set(matchingRows.map(item => String(item.planta || '').trim()).filter(Boolean));
  const count = floors.size || matchingRows.length;
  return count ? String(count) : '';
}

function floorSurfaceSummary(items, useName) {
  const normalizedUse = normalizeText(useName);
  const byFloor = new Map();
  (items || []).forEach((item, index) => {
    if (!normalizeText(item.destino).includes(normalizedUse)) return;
    const surface = numericCatastroSurface(item.superficie);
    if (surface <= 0) return;
    const rawFloor = String(item.planta || '').trim();
    const floor = rawFloor || `__row_${index}`;
    byFloor.set(floor, (byFloor.get(floor) || 0) + surface);
  });
  const floors = [...byFloor.entries()].map(([floor, surface]) => ({ floor, surface }));
  floors.sort((left, right) => {
    const leftNumber = Number(String(left.floor).replace(',', '.'));
    const rightNumber = Number(String(right.floor).replace(',', '.'));
    if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) return leftNumber - rightNumber;
    if (Number.isFinite(leftNumber)) return -1;
    if (Number.isFinite(rightNumber)) return 1;
    return left.floor.localeCompare(right.floor);
  });
  const lowest = floors[0]?.surface || 0;
  const largest = floors.reduce((max, item) => Math.max(max, item.surface), 0);
  return {
    lowest: lowest > 0 ? decimalForApp(lowest) : '',
    largest: largest > 0 ? decimalForApp(largest) : '',
  };
}

function numericCatastroSurface(value) {
  const parsed = Number(String(value || '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function compactPatch(patch) {
  return Object.fromEntries(Object.entries(patch).filter(([, value]) => value));
}

function sectionCompletion(record, sectionId) {
  const sectionItem = SECTIONS.find(item => item.id === sectionId);
  const requiredPaths = sectionItem.groups.flatMap(groupItem => groupItem.required.map(id => `${sectionItem.id}.${groupItem.id}.${id}`));
  const completed = requiredPaths.filter(path => hasValue(record?.data?.[path])).length;
  const done = completed === requiredPaths.length;
  const stateName = done ? 'done' : completed > 0 ? 'partial' : 'missing';
  return { completed, total: requiredPaths.length, done, state: stateName };
}

function completionLabel(status) {
  if (status.done) return 'completado';
  if (status.completed > 0) return 'en curso';
  return 'pendiente';
}

function statusLabel(status) {
  if (status === 'COMPLETA') return 'Completado';
  if (status === 'PENDIENTE_DATOS') return 'En curso';
  return 'Pendiente';
}

function missingSections(record) {
  return SECTIONS.filter(sectionItem => !sectionCompletion(record, sectionItem.id).done).map(sectionItem => sectionItem.label);
}

function inferStatus(record) {
  const missing = missingSections(record);
  if (!valueAt(record, 'admin.localizacion.referenciaCatastral')) return 'BORRADOR';
  return missing.length ? 'PENDIENTE_DATOS' : 'COMPLETA';
}

function recordLabel(record) {
  return valueAt(record, 'admin.localizacion.nombreEdificio')
    || valueAt(record, 'admin.localizacion.referenciaCatastral')
    || 'Sin referencia';
}

function recordPlace(record) {
  return [valueAt(record, 'admin.localizacion.direccion'), valueAt(record, 'admin.localizacion.localidad')]
    .filter(Boolean)
    .join(', ') || 'Pendiente de localización';
}

function valueAt(record, path) {
  const value = record && record.data ? record.data[path] : '';
  if (Array.isArray(value)) return value.length ? JSON.stringify(value) : '';
  return String(value || '').trim();
}

function sectionLabel(sectionId) {
  return SECTIONS.find(sectionItem => sectionItem.id === sectionId)?.label || sectionId;
}

function cleanFieldValue(path, value) {
  let next = String(value || '')
    .replace(/^(?:del?|de la|cliente|del cliente|de cliente)\s+/i, '')
    .replace(/\b(?:y|tambien|ademas|también|además)$/i, '')
    .trim();
  if (path.endsWith('referenciaCatastral')) next = normalizeReference(next);
  if (path.endsWith('codigoPostal')) next = (next.match(/\d{5}/) || [next])[0];
  if (/superficie|altura|ventilacion|demanda/i.test(path)) next = next.replace(',', '.');
  if (/anio|ano/i.test(path)) next = (next.match(/\d{4}/) || [next])[0];
  return next;
}

function extractAfter(text, labels) {
  const source = String(text || '');
  const normalized = normalizeSpeech(source);
  const keys = tableValueLabels();
  const matches = labels
    .map(label => {
      const pattern = new RegExp(`(?:^|[\\s,;.])${aliasToPattern(label)}\\s*(?:es|son|:|=)?\\s*`, 'iu');
      const match = pattern.exec(normalized);
      return match ? { index: match.index, valueStart: match.index + match[0].length } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.index - b.index);
  if (!matches.length) return '';

  const match = matches[0];
  const stop = keys
    .filter(key => !labels.some(label => normalizeSpeech(label) === normalizeSpeech(key)))
    .map(key => {
      const pattern = new RegExp(`(?:^|[\\s,;.])${aliasToPattern(key)}\\s*(?:es|son|:|=)?\\s*`, 'iu');
      pattern.lastIndex = 0;
      const found = pattern.exec(normalized.slice(match.valueStart));
      return found ? match.valueStart + found.index : -1;
    })
    .filter(index => index > match.valueStart)
    .sort((a, b) => a - b)[0] || source.length;

  return source.slice(match.valueStart, stop).replace(/^[\s,;.:=-]+|[\s,;.:=-]+$/g, '').trim();
}

function extractNumberAfter(text, labels) {
  const raw = extractAfter(text, labels);
  const match = raw.match(/-?\d+(?:[,.]\d+)?/);
  return match ? match[0].replace(',', '.') : '';
}

function tableValueLabels() {
  return [
    'cerramiento', 'fachada', 'muro', 'cubierta', 'suelo', 'hueco', 'ventana', 'puerta',
    'puente termico', 'puente térmico', 'acs', 'agua caliente', 'calefaccion', 'calefacción',
    'refrigeracion', 'refrigeración', 'contribucion', 'contribución', 'renovable', 'solar',
    'nombre', 'tipo', 'tipo de equipo', 'tipo generador', 'combustible', 'superficie',
    'metros cuadrados', 'm2', 'u', 'transmitancia', 'peso', 'orientacion', 'orientación',
    'posicion', 'posición', 'modo definicion', 'modo definición', 'patron sombras',
    'patrón sombras', 'cerramiento asociado', 'fachada asociada', 'longitud', 'ancho',
    'anchura', 'altura', 'alto', 'multiplicador', 'cantidad', 'unidades', 'u vidrio',
    'transmitancia vidrio', 'g vidrio', 'factor solar', 'u marco', 'transmitancia marco',
    'porcentaje marco', 'porc marco', 'marco', 'absortividad marco', 'absortividad',
    'permeabilidad', 'tipo puente termico', 'tipo puente térmico',
    'fi', 'psi', 'rendimiento estacional', 'rendimiento', 'm2 cubiertos', 'metros cubiertos',
    'superficie cubierta', 'demanda cubierta', 'porcentaje demanda', 'acumulacion', 'acumulación',
    'zona', 'acs renovable', 'demanda acs', 'calefaccion renovable',
    'calefacción renovable', 'refrigeracion renovable', 'refrigeración renovable',
    'calor recuperado acs', 'calor recuperado para acs', 'calor recuperado calefaccion',
    'calor recuperado calefacción', 'calor recuperado para calefaccion',
    'calor recuperado para calefacción', 'frio recuperado', 'frío recuperado',
    'energia consumida generacion electricidad', 'energía consumida generación electricidad',
    'energia consumida en generacion de electricidad', 'energía consumida en generación de electricidad',
  ];
}

function firstMatch(text, candidates) {
  const found = candidates.find(([, pattern]) => pattern.test(text));
  return found ? found[0] : '';
}

function firstOrientation(text) {
  const match = normalizeSpeech(text).match(/\b(no|ne|se|so|norte|sur|este|oeste|n|s|e|o)\b/);
  return match ? match[1] : '';
}

function normalizeOrientation(value) {
  const normalized = normalizeSpeech(value);
  const map = {
    norte: 'N',
    sur: 'S',
    este: 'E',
    oeste: 'O',
    n: 'N',
    s: 'S',
    e: 'E',
    o: 'O',
    no: 'NO',
    ne: 'NE',
    se: 'SE',
    so: 'SO',
  };
  return map[normalized] || String(value || '').toUpperCase();
}

function generatorFromText(text) {
  return firstMatch(text, [
    ['Bomba de Calor', /\bbomba de calor\b/i],
    ['Caldera Estándar', /\bcaldera\b/i],
    ['Efecto Joule', /\b(joule|electrico directo|eléctrico directo|termo electrico|termo eléctrico)\b/i],
    ['Equipo autónomo', /\b(equipo autonomo|equipo autónomo|split|aire acondicionado)\b/i],
  ]);
}

function fuelFromText(text) {
  return firstMatch(text, [
    ['Gas Natural', /\bgas natural\b/i],
    ['Gasóleo-C', /\b(gasoleo|gasóleo)\b/i],
    ['GLP', /\bglp\b/i],
    ['Biomasa', /\bbiomasa\b/i],
    ['Electricidad', /\b(electricidad|electrico|eléctrico|bomba de calor|termo)\b/i],
  ]);
}

function compactObject(item) {
  return Object.fromEntries(Object.entries(item).filter(([, value]) => hasValue(value)));
}

function isTechnicianPath(path) {
  return String(path || '').startsWith(TECHNICIAN_PATH_PREFIX);
}

function hasTechnicianContext(text, start, valueStart) {
  const before = text.slice(Math.max(0, start - 40), start);
  const afterAlias = text.slice(valueStart, valueStart + 28);
  return /\b(tecnico|certificador)\b/i.test(before)
    || /^\s*(?:del?\s+)?(?:tecnico|certificador)\b/i.test(afterAlias);
}

function isTechnicianOnlyRequest(text) {
  return /^\s*(?:datos\s+(?:del?\s+)?)?(?:tecnico|certificador)\b/i.test(text);
}

function extractReference(text) {
  const explicit = text.match(/\b(?:referencia catastral|referencia|ref\.?)\b\s*(?:es|:|=)?\s*([a-z0-9][a-z0-9-]{5,24})/i);
  if (explicit) {
    const reference = normalizeReference(explicit[1]);
    return reference.length === 20 ? reference : '';
  }
  const compact = text.match(/\b([0-9]{7}[a-z0-9]{13})\b/i);
  return compact ? normalizeReference(compact[1]) : '';
}

function startVoiceDictation() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    addChatMessage('assistant', 'Este navegador no trae dictado de voz. En Chrome/Edge suele funcionar.');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'es-ES';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  voiceBtn.disabled = true;
  voiceBtn.textContent = 'Escuchando';
  recognition.onresult = event => {
    chatInput.value = event.results[0][0].transcript;
    submitChatForm();
  };
  recognition.onerror = () => addChatMessage('assistant', 'No he podido escuchar el dictado. Escríbelo y tiramos millas.');
  recognition.onend = () => {
    voiceBtn.disabled = false;
    voiceBtn.textContent = 'Dictar';
  };
  recognition.start();
}

function addChatMessage(role, text) {
  const message = document.createElement('div');
  message.className = `chat-message ${role}`;
  message.textContent = text;
  chatLog.appendChild(message);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function downloadJson() {
  const record = selectedRecordWithCurrentFormData();
  if (!record) return;
  const name = fileSafe(recordLabel(record)) + '.json';
  downloadBlob(new Blob([JSON.stringify(record, null, 2)], { type: 'application/json' }), name);
}

async function downloadCex() {
  const record = selectedRecordWithCurrentFormData();
  if (!record) return;
  const criticalIssues = criticalCexIssues(record);
  if (criticalIssues.length && !window.confirm('Faltan datos críticos para CE3X:\n\n- ' + criticalIssues.join('\n- ') + '\n\n¿Descargar .cex de todos modos?')) {
    addChatMessage('assistant', 'Descarga cancelada. Revisa los datos críticos antes de generar el .cex.');
    return;
  }

  try {
    const response = await fetch('templates/base.cex');
    if (!response.ok) throw new Error('No hay plantilla .cex publicada');
    const buffer = await response.arrayBuffer();
    if (isRawCexDiagnosticMode()) {
      const filename = fileSafe(recordLabel(record)) + '-BASE-SIN-PARCHAR.cex';
      downloadBlob(new Blob([buffer], { type: 'application/octet-stream' }), filename);
      return;
    }
    let text = new TextDecoder('iso-8859-1').decode(buffer);
    text = applyCexReplacements(text, record);
    text = normalizeCexLineEndings(text);
    const filename = fileSafe(recordLabel(record)) + '.cex';
    downloadBlob(new Blob([latin1Encode(text)], { type: 'application/octet-stream' }), filename);
  } catch (error) {
    alert('Generación .cex pendiente: ' + error.message);
  }
}

function criticalCexIssues(record) {
  const data = record.data || {};
  const issues = [];
  if (!hasValue(data['generales.datos.tipoEdificio'])) issues.push('Tipo de edificio');
  if (!hasValue(data['generales.definicion.superficieUtilHabitable'])) issues.push('Superficie útil habitable');
  if (!hasValue(data['generales.definicion.alturaLibrePlanta'])) issues.push('Altura libre de planta');
  if (!hasValue(data['generales.definicion.numeroPlantasHabitables'])) issues.push('Número de plantas habitables');
  if (!hasValue(data['generales.definicion.masaParticionesInternas'])) issues.push('Masa de las particiones internas');
  if (!tableHasRows(data['envolvente.cerramientos.items'])) issues.push('Envolvente: cerramientos');
  if (!tableHasRows(data['envolvente.huecos.items'])) issues.push('Envolvente: huecos');
  if (!tableHasRows(data['envolvente.puentesTermicos.items'])) issues.push('Envolvente: puentes térmicos');
  if (!tableHasRows(data['instalaciones.acs.items'])) issues.push('Instalaciones: equipo ACS');
  if (!tableHasRows(data['instalaciones.calefaccion.items']) && !tableHasRows(data['instalaciones.refrigeracion.items'])) {
    issues.push('Instalaciones: calefacción o refrigeración');
  }
  return issues;
}

function tableHasRows(value) {
  return readTableRows(value, [{ id: 'x' }]).some(rowItem => {
    return Object.values(rowItem).some(Boolean) || rowItem.values?.some(Boolean);
  });
}

function isRawCexDiagnosticMode() {
  return cexPatchMode() === 'base';
}

async function generateCexOnServer(record) {
  if (!window.location || window.location.protocol === 'file:') return null;
  const filename = fileSafe(recordLabel(record)) + '.cex';
  const response = await fetch('/api/cex', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ record, filename }),
  });
  if (response.status === 404 || response.status === 405) return null;
  if (!response.ok) {
    let detail = '';
    try {
      detail = (await response.json()).error || '';
    } catch {
      detail = await response.text();
    }
    throw new Error(detail || 'No se pudo generar el .cex en servidor');
  }
  return await response.blob();
}

function applyCexReplacements(text, record) {
  const mode = cexPatchMode();
  if (mode === 'envelope') return applyCexEnvelopeStreamReplacement(text, record);
  if (mode.startsWith('envelope-')) return applyCexEnvelopeDiagnosticReplacement(text, record, mode);
  if (mode.startsWith('systems-')) return applyCexSystemsDiagnosticReplacement(text, record, mode);
  if (mode === 'admin') return applyCexAdminReplacements(text, record);
  if (mode === 'general') return applyCexGeneralReplacements(applyCexAdminReplacements(text, record), record);
  let next = text;
  next = applyCexAdminReplacements(next, record);
  next = applyCexGeneralReplacements(next, record);
  next = applyCexEmbeddedImageReplacements(next, record);
  next = applyCexEnvelopeStreamReplacement(next, record);
  if (mode !== 'stable' && mode !== 'full') next = applyCexSystemsStreamReplacement(next, record);
  return stripCexImprovements(next);
}

function stripCexImprovements(text) {
  const lineEnding = text.includes('\r\n') ? '\r\n' : '\n';
  const improvementsStart = text.indexOf(`.(lp0${lineEnding}(iMedidasDeMejora.objetoGrupoMejoras${lineEnding}`);
  if (improvementsStart < 0) return text;

  // Streams 5-9 hold improvement objects, their summaries, and shadow data.
  // Keep their pickle positions but start them empty so the base certificate
  // can be qualified before the user creates improvement packages in CE3X.
  const stream10Start = text.lastIndexOf(`.(lp0${lineEnding}VSin`);
  if (stream10Start < 0) return text;
  const emptyList = serializeCexList([]);
  const blankValues = serializeCexList(Array.from({ length: 10 }, () => cexPickleString('')));
  const emptySummary = serializeCexList([
    serializeCexList([]),
    blankValues,
    serializeCexList([]),
    'N',
  ]);
  const emptyStreams = [emptyList, emptySummary, emptyList, emptyList, emptyList]
    .map(value => `${value}.`)
    .join('');
  let next = `${text.slice(0, improvementsStart)}.${emptyStreams}${text.slice(stream10Start + 1)}`;

  const nextStream10Start = next.indexOf(`(lp0${lineEnding}VSin`);
  const metadataStart = next.indexOf(`(lp0${lineEnding}VCONJUNTO DE MEJORAS 1`, nextStream10Start);
  if (metadataStart < 0) return next;
  const metadataEnd = next.indexOf(`(dp0${lineEnding}`, metadataStart);
  if (metadataEnd < 0) return next;
  const emptyMetadata = serializeCexList([
    cexPickleString(''), cexPickleString(''), cexPickleString(''),
    cexPickleString(''), cexPickleString(''), serializeCexList([]), serializeCexList([]),
  ]);
  return `${next.slice(0, metadataStart)}${emptyMetadata}.${next.slice(metadataEnd)}`;
}

function applyCexEmbeddedImageReplacements(text, record) {
  const data = record.data || {};
  const image = embeddedImageBase64(data['generales.definicion.imagenEdificio']);
  const plan = embeddedImageBase64(data['generales.definicion.planoSituacion']);
  let next = text;
  next = replaceCexTopLevelImageCopies(next, image, plan);
  next = replaceCexPickleStringAfterKey(next, 'imagen', image);
  next = replaceCexPickleStringAfterKey(next, 'plano', plan);
  return next;
}

function embeddedImageBase64(value) {
  const text = String(value || '').trim();
  const match = text.match(/^data:image\/(?:png|jpeg|jpg);base64,([A-Za-z0-9+/=]+)$/i);
  const base64 = match ? match[1] : text;
  if (!/^[A-Za-z0-9+/=]+$/.test(base64)) return '';
  if (!/^(?:iVBORw0KGgo|\/9j\/)/.test(base64)) return '';
  return base64;
}

function replaceCexPickleStringAfterKey(text, key, value) {
  if (!value) return text;
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(S'${escapedKey}'\\r?\\np\\d+\\r?\\nS')([^']*)(')`);
  return text.replace(pattern, `$1${value}$3`);
}

function replaceCexTopLevelImageCopies(text, image, plan) {
  let index = 0;
  return text.replace(/S'((?:iVBORw0KGgo|\/9j\/)[A-Za-z0-9+/=]{1000,})'/g, match => {
    index += 1;
    if (index === 1 && image) return `S'${image}'`;
    if (index === 2 && plan) return `S'${plan}'`;
    return match;
  });
}

function cexPatchMode() {
  return new URLSearchParams(window.location.search).get('cexMode') || 'all';
}

function applyCexAdminReplacements(text, record) {
  const data = record.data || {};
  let next = text;
  next = replaceFirstMemoValue(next, 'p6', cexAppendString(data['admin.cliente.nombreRazonSocial']));
  next = replaceFirstMemoValue(next, 'p8', cexAppendString(data['admin.cliente.telefono']));
  next = replaceFirstMemoValue(next, 'p9', cexAppendString(data['admin.cliente.email']));
  next = replaceFirstMemoValue(next, 'p11', cexAppendString(data['admin.tecnico.nombre']));
  next = replaceFirstMemoValue(next, 'p12', cexAppendString(data['admin.tecnico.telefono']));
  next = replaceFirstMemoValue(next, 'p13', cexAppendString(data['admin.tecnico.email']));

  const scalarReplacements = [
    ['VPL SEN-1 ENTRENUCLEOS 40(D) ', cexString(data['admin.localizacion.nombreEdificio'])],
    ['V0128501TG4302N0037ZI', cexString(data['admin.localizacion.referenciaCatastral'])],
    ['VC/ JOSÉ MEJIAS SALGUERO Nº4, CASA 37', cexString(data['admin.localizacion.direccion'])],
    ['VDos Hermanas', cexString(titleCase(data['admin.localizacion.localidad']))],
    ['VDOS HERMANAS', cexString(data['admin.localizacion.localidad']).toUpperCase()],
    ['VSevilla', cexString(titleCase(data['admin.localizacion.provincia']))],
    ['V41704', cexString(data['admin.localizacion.codigoPostal'])],
    ['aVJUAN JOSÉ MORENO FRESNO\np6', cexAppendString(data['admin.cliente.nombreRazonSocial']) + '\np6'],
    ['aV.\np9', cexAppendString(data['admin.cliente.email']) + '\np9'],
    ['aVJUAN JOSÉ MORENO FRESNO\np11', cexAppendString(data['admin.tecnico.nombre']) + '\np11'],
    ['aV665379127\np8', cexAppendString(data['admin.cliente.telefono']) + '\np8'],
    ['aV665379127\np12', cexAppendString(data['admin.tecnico.telefono']) + '\np12'],
    ['aVjuanjmf8@gmail.com\np13', cexAppendString(data['admin.tecnico.email']) + '\np13'],
  ].filter(([, to]) => to !== 'V' && to !== 'aV' && to !== 'F0');

  return scalarReplacements.reduce((current, [from, to]) => replaceAll(current, from, to), next);
}

function applyCexGeneralReplacements(text, record) {
  const data = record.data || {};
  let next = text;
  const buildingType = cexBuildingType(data['generales.datos.tipoEdificio']);
  const generalReplacements = [
    ['VCTE 2013', cexString(data['generales.datos.normativaVigente'])],
    ['VUnifamiliar', cexString(buildingType)],
    ['VB4', cexString(data['generales.datos.zonaClimaticaHE1'])],
    ['aVV\np6', cexAppendString(data['generales.datos.zonaClimaticaHE4']) + '\np6'],
    ['V2021', cexString(data['generales.datos.anioConstruccion'])],
    ['V149.40', cexString(cexDecimal(data['generales.definicion.superficieUtilHabitable']))],
    ['V2.60', cexString(cexDecimal(data['generales.definicion.alturaLibrePlanta']))],
    ['aV3\np9', cexAppendString(cexDecimal(data['generales.definicion.numeroPlantasHabitables'])) + '\np9'],
    ['aV3\np5527', cexAppendString(cexDecimal(data['generales.definicion.numeroPlantasHabitables'])) + '\np5527'],
    ['aV120\np10', cexAppendString(cexDecimal(data['generales.definicion.demandaDiariaACS'])) + '\np10'],
    ['aV120\np5528', cexAppendString(cexDecimal(data['generales.definicion.demandaDiariaACS'])) + '\np5528'],
    ['VMedia', cexString(data['generales.definicion.masaParticionesInternas'])],
    ['V0.63', cexString(cexDecimal(data['generales.definicion.ventilacionInmueble']))],
    ['F0.63', cexFloat(data['generales.definicion.ventilacionInmueble'])],
    ["F0.0\nsS'tasaVentilacion'", "F0.0\nsS'tasaVentilacion'"],
    ["F120.0\nsS'sistemasMixto3'", cexFloat(data['generales.definicion.demandaDiariaACS']) + "\nsS'sistemasMixto3'"],
    ["F3.0\nsS'tasaEqVentilacionNeta'", cexFloat(data['generales.definicion.numeroPlantasHabitables']) + "\nsS'tasaEqVentilacionNeta'"],
  ].filter(([, to]) => to !== 'V' && to !== 'aV' && to !== 'F0');

  next = generalReplacements.reduce((current, [from, to]) => replaceAll(current, from, to), next);
  next = applyCexInputGeneralReplacements(next, record);
  next = applyCexStructuredGeneralReplacements(next, record);
  return next;
}

function applyCexInputGeneralReplacements(text, record) {
  const data = record.data || {};
  const marker = 'VCTE 2013';
  let next = text;
  [
    ['p2', cexString(cexBuildingType(data['generales.datos.tipoEdificio']))],
    ['p7', cexString(cexDecimal(data['generales.definicion.superficieUtilHabitable']))],
    ['p8', cexString(cexDecimal(data['generales.definicion.alturaLibrePlanta']))],
    ['p9', cexString(cexDecimal(data['generales.definicion.numeroPlantasHabitables']))],
    ['p10', cexString(cexDecimal(data['generales.definicion.demandaDiariaACS']))],
    ['p11', cexString(data['generales.definicion.masaParticionesInternas'])],
    ['p15', cexString(cexDecimal(data['generales.definicion.ventilacionInmueble']))],
  ].forEach(([memo, value]) => {
    next = replacePickleMemoValueAfterMarker(next, marker, memo, value);
  });
  return next;
}

function applyCexStructuredGeneralReplacements(text, record) {
  const data = record.data || {};
  let next = text;
  const replacements = [
    ['tipoEdificio', cexString(cexBuildingType(data['generales.datos.tipoEdificio']))],
    ['tasaVentilacion', cexFloat(data['generales.definicion.ventilacionInmueble'])],
    ['numeroPlantas', cexFloat(data['generales.definicion.numeroPlantasHabitables'])],
    ['Q_ACS', cexFloat(data['generales.definicion.demandaDiariaACS'])],
    ['masaParticiones', cexString(data['generales.definicion.masaParticionesInternas'])],
  ];
  replacements.forEach(([key, value]) => {
    next = replacePickleValueAfterKey(next, key, value);
  });
  return next;
}

function applyCexTableReplacements(text, record) {
  const tableSpecs = [
    tableSpec('envolvente.cerramientos.items', ['nombre', 'tipoCerramiento', 'superficie', 'u', 'peso', 'posicion', 'patronSombras', 'modoDefinicion']),
    tableSpec('envolvente.huecos.items', ['nombre', 'cerramientoAsociado', 'longitud', 'altura', 'multiplicador', 'superficie', 'uVidrio', 'gVidrio', 'uMarco', 'porcMarco', 'absortividadMarco', 'modoDefinicion', 'permeabilidad', 'orientacion', 'patronSombras']),
    tableSpec('envolvente.puentesTermicos.items', ['nombre', 'cerramientoAsociado', 'tipoPuenteTermico', 'fi', 'longitud']),
    tableSpec('instalaciones.acs.items', ['nombre', 'tipoEquipo', 'modoDefinicion', 'tipoGenerador', 'combustible', 'rendimientoEstacional', 'm2Cubiertos', 'demandaCubierta', 'zona', 'acumulacion']),
    tableSpec('instalaciones.calefaccion.items', ['nombre', 'tipoEquipo', 'modoDefinicion', 'tipoGenerador', 'combustible', 'rendimientoEstacional', 'm2Cubiertos', 'demandaCubierta', 'zona']),
    tableSpec('instalaciones.refrigeracion.items', ['nombre', 'tipoEquipo', 'modoDefinicion', 'tipoGenerador', 'combustible', 'rendimientoEstacional', 'm2Cubiertos', 'demandaCubierta', 'zona']),
    tableSpec('instalaciones.contribuciones.items', ['nombre', 'zona', 'acsRenovable', 'calefaccionRenovable', 'refrigeracionRenovable', 'calorRecuperadoAcs', 'calorRecuperadoCalefaccion', 'frioRecuperado', 'energiaConsumidaGeneracionElectricidad', 'combustible']),
  ];

  return tableSpecs.reduce((current, spec) => {
    const defaults = normalizeCexRows(CEX37_DEFAULTS[spec.path], spec.columns);
    const rows = normalizeCexRows(record.data?.[spec.path], spec.columns);
    let next = current;
    rows.forEach((rowItem, rowIndex) => {
      const defaultRow = defaults[rowIndex];
      if (!defaultRow) return;
      spec.columns.forEach(column => {
        const from = cexValue(defaultRow[column]);
        const to = cexValue(rowItem[column]);
        if (!from || !to || from === to || !isSpecificCexToken(from)) return;
        const maxCount = spec.path.startsWith('envolvente.') ? 50 : 3;
        next = replaceCexToken(next, from, to, maxCount);
      });
    });
    return next;
  }, text);
}

function applyCexCompactListReplacements(text, record) {
  const cerramientos = normalizeCexRows(record.data?.['envolvente.cerramientos.items'], [
    'nombre', 'tipoCerramiento', 'superficie', 'u', 'peso', 'posicion', 'modoDefinicion', 'patronSombras',
  ]);
  const huecos = normalizeCexRows(record.data?.['envolvente.huecos.items'], [
    'nombre', 'cerramientoAsociado', 'longitud', 'altura', 'multiplicador', 'superficie', 'uVidrio',
    'gVidrio', 'uMarco', 'porcMarco', 'absortividadMarco', 'modoDefinicion', 'permeabilidad',
    'orientacion', 'patronSombras',
  ]);
  const puentes = normalizeCexRows(record.data?.['envolvente.puentesTermicos.items'], [
    'nombre', 'cerramientoAsociado', 'tipoPuenteTermico', 'fi', 'longitud',
  ]);
  const contribuciones = normalizeCexRows(record.data?.['instalaciones.contribuciones.items'], [
    'nombre', 'zona', 'acsRenovable', 'calefaccionRenovable', 'refrigeracionRenovable',
    'calorRecuperadoAcs', 'calorRecuperadoCalefaccion', 'frioRecuperado',
    'energiaConsumidaGeneracionElectricidad', 'combustible',
  ]).filter(isUsefulCexContribution);

  let next = text;
  if (cerramientos.length || huecos.length || puentes.length) {
    next = replaceEnvelopeInputStream(
      next,
      cerramientos.length ? cerramientos : normalizeCexRows(CEX37_DEFAULTS['envolvente.cerramientos.items'], [
        'nombre', 'tipoCerramiento', 'superficie', 'u', 'peso', 'posicion', 'modoDefinicion', 'patronSombras',
      ]),
      huecos.length ? huecos : normalizeCexRows(CEX37_DEFAULTS['envolvente.huecos.items'], [
        'nombre', 'cerramientoAsociado', 'longitud', 'altura', 'multiplicador', 'superficie', 'uVidrio',
        'gVidrio', 'uMarco', 'porcMarco', 'absortividadMarco', 'modoDefinicion', 'permeabilidad',
        'orientacion', 'patronSombras',
      ]),
      puentes.length ? puentes : normalizeCexRows(CEX37_DEFAULTS['envolvente.puentesTermicos.items'], [
        'nombre', 'cerramientoAsociado', 'tipoPuenteTermico', 'fi', 'longitud',
      ]),
    );
  }
  if (contribuciones.length) {
    next = replaceInputSublistInSection(
      next,
      '(lp0\n(lp1\n(lp2\nVEquipo ACS',
      '(lp0\n(iMedidasDeMejora.objetoGrupoMejoras',
      '(lp56',
      'VContribuciones energéticas',
      '(lp69\na',
      serializeCexContribucionesInput(contribuciones),
    );
  }
  return next;
}

function applyCexEnvelopeStreamReplacement(text, record) {
  const cerramientos = normalizeCexRows(record.data?.['envolvente.cerramientos.items'], [
    'nombre', 'tipoCerramiento', 'superficie', 'u', 'peso', 'posicion', 'modoDefinicion', 'patronSombras',
  ]);
  const huecos = normalizeCexRows(record.data?.['envolvente.huecos.items'], [
    'nombre', 'cerramientoAsociado', 'longitud', 'altura', 'multiplicador', 'superficie', 'uVidrio',
    'gVidrio', 'uMarco', 'porcMarco', 'absortividadMarco', 'modoDefinicion', 'permeabilidad',
    'orientacion', 'patronSombras',
  ]);
  const puentes = normalizeCexRows(record.data?.['envolvente.puentesTermicos.items'], [
    'nombre', 'cerramientoAsociado', 'tipoPuenteTermico', 'fi', 'longitud',
  ]);
  if (!cerramientos.length && !huecos.length && !puentes.length) return text;
  return replaceEnvelopeInputStream(text, cerramientos, huecos, puentes);
}

function applyCexEnvelopeDiagnosticReplacement(text, record, mode) {
  const defaultCerramientos = cexEnvelopeRows(CEX37_DEFAULTS, 'envolvente.cerramientos.items', [
    'nombre', 'tipoCerramiento', 'superficie', 'u', 'peso', 'posicion', 'modoDefinicion', 'patronSombras',
  ]);
  const defaultHuecos = cexEnvelopeRows(CEX37_DEFAULTS, 'envolvente.huecos.items', [
    'nombre', 'cerramientoAsociado', 'longitud', 'altura', 'multiplicador', 'superficie', 'uVidrio',
    'gVidrio', 'uMarco', 'porcMarco', 'absortividadMarco', 'modoDefinicion', 'permeabilidad',
    'orientacion', 'patronSombras',
  ]);
  const defaultPuentes = cexEnvelopeRows(CEX37_DEFAULTS, 'envolvente.puentesTermicos.items', [
    'nombre', 'cerramientoAsociado', 'tipoPuenteTermico', 'fi', 'longitud',
  ]);
  const recordCerramientos = cexEnvelopeRows(record.data || {}, 'envolvente.cerramientos.items', [
    'nombre', 'tipoCerramiento', 'superficie', 'u', 'peso', 'posicion', 'modoDefinicion', 'patronSombras',
  ]);
  const recordHuecos = cexEnvelopeRows(record.data || {}, 'envolvente.huecos.items', [
    'nombre', 'cerramientoAsociado', 'longitud', 'altura', 'multiplicador', 'superficie', 'uVidrio',
    'gVidrio', 'uMarco', 'porcMarco', 'absortividadMarco', 'modoDefinicion', 'permeabilidad',
    'orientacion', 'patronSombras',
  ]);
  const recordPuentes = cexEnvelopeRows(record.data || {}, 'envolvente.puentesTermicos.items', [
    'nombre', 'cerramientoAsociado', 'tipoPuenteTermico', 'fi', 'longitud',
  ]);

  const cerramientos = mode === 'envelope-cerramientos' ? recordCerramientos : defaultCerramientos;
  const huecos = mode === 'envelope-huecos' ? recordHuecos : defaultHuecos;
  const puentes = mode === 'envelope-puentes' ? recordPuentes : defaultPuentes;
  return replaceEnvelopeInputStream(text, cerramientos, huecos, puentes);
}

function cexEnvelopeRows(source, path, columns) {
  return normalizeCexRows(source[path], columns);
}

function applyCexSystemsStreamReplacement(text, record) {
  const acs = normalizeCexRows(record.data?.['instalaciones.acs.items'], [
    'nombre', 'tipoEquipo', 'modoDefinicion', 'tipoGenerador', 'combustible',
    'rendimientoEstacional', 'm2Cubiertos', 'demandaCubierta', 'zona', 'acumulacion',
  ]);
  const calefaccion = normalizeCexRows(record.data?.['instalaciones.calefaccion.items'], [
    'nombre', 'tipoEquipo', 'modoDefinicion', 'tipoGenerador', 'combustible',
    'rendimientoEstacional', 'm2Cubiertos', 'demandaCubierta', 'zona',
  ]);
  const refrigeracion = normalizeCexRows(record.data?.['instalaciones.refrigeracion.items'], [
    'nombre', 'tipoEquipo', 'modoDefinicion', 'tipoGenerador', 'combustible',
    'rendimientoEstacional', 'm2Cubiertos', 'demandaCubierta', 'zona',
  ]);
  const contribuciones = normalizeCexRows(record.data?.['instalaciones.contribuciones.items'], [
    'nombre', 'zona', 'acsRenovable', 'calefaccionRenovable', 'refrigeracionRenovable',
    'calorRecuperadoAcs', 'calorRecuperadoCalefaccion', 'frioRecuperado',
    'energiaConsumidaGeneracionElectricidad', 'combustible',
  ]).filter(isUsefulCexContribution);
  if (!acs.length && !calefaccion.length && !refrigeracion.length && !contribuciones.length) return text;
  return replaceSystemsInputStream(text, acs, calefaccion, refrigeracion, contribuciones);
}

function applyCexSystemsDiagnosticReplacement(text, record, mode) {
  const defaultAcs = cexEnvelopeRows(CEX37_DEFAULTS, 'instalaciones.acs.items', [
    'nombre', 'tipoEquipo', 'modoDefinicion', 'tipoGenerador', 'combustible',
    'rendimientoEstacional', 'm2Cubiertos', 'demandaCubierta', 'zona', 'acumulacion',
  ]);
  const defaultCalefaccion = cexEnvelopeRows(CEX37_DEFAULTS, 'instalaciones.calefaccion.items', [
    'nombre', 'tipoEquipo', 'modoDefinicion', 'tipoGenerador', 'combustible',
    'rendimientoEstacional', 'm2Cubiertos', 'demandaCubierta', 'zona',
  ]);
  const defaultRefrigeracion = cexEnvelopeRows(CEX37_DEFAULTS, 'instalaciones.refrigeracion.items', [
    'nombre', 'tipoEquipo', 'modoDefinicion', 'tipoGenerador', 'combustible',
    'rendimientoEstacional', 'm2Cubiertos', 'demandaCubierta', 'zona',
  ]);
  const defaultContribuciones = cexEnvelopeRows(CEX37_DEFAULTS, 'instalaciones.contribuciones.items', [
    'nombre', 'zona', 'acsRenovable', 'calefaccionRenovable', 'refrigeracionRenovable',
    'calorRecuperadoAcs', 'calorRecuperadoCalefaccion', 'frioRecuperado',
    'energiaConsumidaGeneracionElectricidad', 'combustible',
  ]);
  const recordAcs = cexEnvelopeRows(record.data || {}, 'instalaciones.acs.items', [
    'nombre', 'tipoEquipo', 'modoDefinicion', 'tipoGenerador', 'combustible',
    'rendimientoEstacional', 'm2Cubiertos', 'demandaCubierta', 'zona', 'acumulacion',
  ]);
  const recordCalefaccion = cexEnvelopeRows(record.data || {}, 'instalaciones.calefaccion.items', [
    'nombre', 'tipoEquipo', 'modoDefinicion', 'tipoGenerador', 'combustible',
    'rendimientoEstacional', 'm2Cubiertos', 'demandaCubierta', 'zona',
  ]);
  const recordRefrigeracion = cexEnvelopeRows(record.data || {}, 'instalaciones.refrigeracion.items', [
    'nombre', 'tipoEquipo', 'modoDefinicion', 'tipoGenerador', 'combustible',
    'rendimientoEstacional', 'm2Cubiertos', 'demandaCubierta', 'zona',
  ]);
  const recordContribuciones = cexEnvelopeRows(record.data || {}, 'instalaciones.contribuciones.items', [
    'nombre', 'zona', 'acsRenovable', 'calefaccionRenovable', 'refrigeracionRenovable',
    'calorRecuperadoAcs', 'calorRecuperadoCalefaccion', 'frioRecuperado',
    'energiaConsumidaGeneracionElectricidad', 'combustible',
  ]);

  const useRecord = mode === 'systems-full';
  const acs = useRecord || mode === 'systems-acs' ? recordAcs : defaultAcs;
  const calefaccion = useRecord || mode === 'systems-climate' ? recordCalefaccion : defaultCalefaccion;
  const refrigeracion = useRecord || mode === 'systems-climate' ? recordRefrigeracion : defaultRefrigeracion;
  const contribuciones = useRecord || mode === 'systems-contribuciones' ? recordContribuciones : defaultContribuciones;
  return replaceSystemsInputStream(text, acs, calefaccion, refrigeracion, contribuciones);
}

function replaceEnvelopeInputStream(text, cerramientos, huecos, puentes) {
  const aligned = alignCexEnvelopeReferences(cerramientos, huecos, puentes);
  cerramientos = aligned.cerramientos;
  huecos = aligned.huecos;
  puentes = aligned.puentes;

  const startPattern = '(lp0\n(l';
  const nextStreamPattern = '.(lp0\n(lp1\n(lp2\nVEquipo ACS';
  const marker = indexOfLinePattern(text, nextStreamPattern);
  const start = marker < 0 ? -1 : lastIndexOfLinePattern(text, startPattern, marker);
  if (start < 0) return text;
  const nextStream = indexOfLinePattern(text, nextStreamPattern, start + startPattern.length);
  if (nextStream < 0) return text;
  const replacement = [
    '(lp0\n',
    serializeCexCerramientosInput(cerramientos), 'a',
    serializeCexHuecosInput(huecos), 'a',
    serializeCexPuentesInput(puentes), 'a',
    '(l', 'a',
    '.',
  ].join('');
  return text.slice(0, start) + replacement + text.slice(nextStream + 1);
}

function alignCexEnvelopeReferences(cerramientos, huecos, puentes) {
  const safeCerramientos = cerramientos.map(rowItem => Object.assign({}, rowItem));
  const names = new Set(safeCerramientos.map(rowItem => cexValue(rowItem.nombre)).filter(Boolean));
  const fallbackName = safeCerramientos.map(rowItem => cexValue(rowItem.nombre)).find(Boolean);
  const alignAssociatedEnclosure = rowItem => {
    const next = Object.assign({}, rowItem);
    const associated = cexValue(next.cerramientoAsociado);
    if (associated && names.has(associated)) return next;
    if (fallbackName) next.cerramientoAsociado = fallbackName;
    return next;
  };
  return {
    cerramientos: safeCerramientos,
    huecos: huecos.map(alignAssociatedEnclosure),
    puentes: puentes.map(alignAssociatedEnclosure),
  };
}

function replaceSystemsInputStream(text, acs, calefaccion, refrigeracion, contribuciones) {
  const endPattern = '.(lp0\n(iMedidasDeMejora.objetoGrupoMejoras';
  const end = indexOfLinePattern(text, endPattern);
  const start = end < 0 ? -1 : lastIndexOfLinePattern(text, '(lp0\n(l', end);
  if (start < 0 || end < 0) return text;
  const replacement = serializeCexSystemsStream(acs, calefaccion, refrigeracion, contribuciones);
  return text.slice(0, start) + replacement + text.slice(end + 1);
}

function applyCexInternalObjectReplacements(text, record) {
  let next = text;
  const cerramientos = normalizeCexRows(record.data?.['envolvente.cerramientos.items'], [
    'nombre', 'tipoCerramiento', 'superficie', 'u', 'peso', 'posicion', 'modoDefinicion', 'patronSombras',
  ]);
  const huecos = normalizeCexRows(record.data?.['envolvente.huecos.items'], [
    'nombre', 'cerramientoAsociado', 'longitud', 'altura', 'multiplicador', 'superficie', 'uVidrio',
    'gVidrio', 'uMarco', 'porcMarco', 'absortividadMarco', 'modoDefinicion', 'permeabilidad',
    'orientacion', 'patronSombras',
  ]);
  const puentes = normalizeCexRows(record.data?.['envolvente.puentesTermicos.items'], [
    'nombre', 'cerramientoAsociado', 'tipoPuenteTermico', 'fi', 'longitud',
  ]);
  const contribuciones = normalizeCexRows(record.data?.['instalaciones.contribuciones.items'], [
    'nombre', 'zona', 'acsRenovable', 'calefaccionRenovable', 'refrigeracionRenovable',
    'calorRecuperadoAcs', 'calorRecuperadoCalefaccion', 'frioRecuperado',
    'energiaConsumidaGeneracionElectricidad', 'combustible',
  ]).filter(isUsefulCexContribution);

  next = replaceCerramientoObjects(next, cerramientos);
  next = replaceHuecoObjects(next, huecos);
  next = replacePuenteObjects(next, puentes);
  next = replaceContribucionesObject(next, contribuciones[0]);
  return next;
}

function tableSpec(path, columns) {
  return { path, columns };
}

function replaceHuecoObjects(text, rows) {
  let next = text;
  if (rows.length === 1) {
    return replaceEveryObjectBlock(next, 'HuecoEstimadas', block => replaceHuecoObjectBlock(block, rows[0]));
  }
  rows.forEach((rowItem, index) => {
    next = replaceNthObjectBlock(next, 'HuecoEstimadas', index, block => replaceHuecoObjectBlock(block, rowItem));
  });
  return next;
}

function replaceCerramientoObjects(text, rows) {
  if (!rows.length) return text;
  let index = 0;
  return replaceEveryClassRegion(text, 'datosEdificio\nCerramiento', block => {
    const rowItem = rows[index % rows.length];
    index += 1;
    let updated = block;
    [
      ['nombre', cexString(rowItem.nombre)],
      ['tipo', cexString(rowItem.tipoCerramiento)],
      ['superficieBruta', cexFloat(rowItem.superficie)],
      ['superficieNeta', cexFloat(rowItem.superficie)],
      ['U', cexFloat(rowItem.u)],
      ['masaM2', cexFloat(rowItem.peso)],
      ['orientacion', cexString(cexWallOrientation(rowItem.posicion))],
      ['modoObtencion', cexString(rowItem.modoDefinicion || 'Conocidas')],
      ['patronSombras', cexString(rowItem.patronSombras || 'Sin patrón')],
      ['enContactoCon', cexAsciiString(rowItem.tipoCerramiento === 'Suelo' ? 'terreno' : 'aire')],
    ].forEach(([key, value]) => {
      updated = replacePickleValueAfterKey(updated, key, value);
    });
    return updated;
  });
}

function replacePuenteObjects(text, rows) {
  if (!rows.length) return text;
  let index = 0;
  return replaceEveryClassRegion(text, 'datosEdificio\nPuenteTermico', block => {
    const rowItem = rows[index % rows.length];
    index += 1;
    let updated = block;
    [
      ['nombre', cexString(rowItem.nombre)],
      ['tipo', cexString(rowItem.tipoPuenteTermico)],
      ['fi', cexFloat(rowItem.fi)],
      ['longitud', cexFloat(rowItem.longitud)],
      ['cerramientoAsociado', cexString(rowItem.cerramientoAsociado)],
    ].forEach(([key, value]) => {
      updated = replacePickleValueAfterKey(updated, key, value);
    });
    return updated;
  });
}

function replaceHuecoObjectBlock(block, rowItem) {
  let updated = block;
  const orientation = cexWallOrientation(rowItem.orientacion);
  [
    ['descripcion', cexString(rowItem.nombre)],
    ['cerramientoAsociado', cexString(rowItem.cerramientoAsociado)],
    ['longitud', cexString(cexDecimal(rowItem.longitud))],
    ['altura', cexString(cexDecimal(rowItem.altura))],
    ['multiplicador', cexString(cexDecimal(rowItem.multiplicador))],
    ['superficie', cexString(cexDecimal(rowItem.superficie))],
    ['Uvidrio', cexFloat(rowItem.uVidrio)],
    ['Gvidrio', cexFloat(rowItem.gVidrio)],
    ['Umarco', cexFloat(rowItem.uMarco)],
    ['porcMarco', cexString(cexDecimal(rowItem.porcMarco))],
    ['absortividadValor', cexString(cexDecimal(rowItem.absortividadMarco))],
    ['permeabilidadValor', cexString(cexDecimal(rowItem.permeabilidad))],
    ['orientacion', cexString(orientation)],
    ['correctorSolar', cexString(orientation)],
    ['patronSombras', cexString(rowItem.patronSombras || 'Sin patrón')],
  ].forEach(([key, value]) => {
    updated = replacePickleValueAfterKey(updated, key, value);
  });
  return updated;
}

function replaceContribucionesObject(text, rowItem) {
  if (!rowItem) return text;
  const energy = rowItem.energiaConsumidaGeneracionElectricidad;
  let next = replaceNthObjectBlock(text, 'ContribucionesEnergeticas', 0, block => {
    let updated = block;
    [
      ['nombre', cexString(rowItem.nombre)],
      ['porcACS', cexFloat(rowItem.acsRenovable)],
      ['porcCal', cexFloat(rowItem.calefaccionRenovable)],
      ['porcRef', cexFloat(rowItem.refrigeracionRenovable)],
      ['calorRecupACS', cexFloat(rowItem.calorRecuperadoAcs)],
      ['calorRecupCal', cexFloat(rowItem.calorRecuperadoCalefaccion)],
      ['calorRecupRef', cexFloat(rowItem.frioRecuperado)],
      ['electricidadGen', cexFloat(energy)],
      ['enConsum', cexFloat(energy)],
      ['combustible', cexString(rowItem.combustible)],
    ].forEach(([key, value]) => {
      updated = replacePickleValueAfterKey(updated, key, value);
    });
    return updated;
  });
  [
    ['porcACSTotal', cexFloat(rowItem.acsRenovable)],
    ['porcCalTotal', cexFloat(rowItem.calefaccionRenovable)],
    ['porcRefTotal', cexFloat(rowItem.refrigeracionRenovable)],
    ['calorRecupACSTotal', cexFloat(rowItem.calorRecuperadoAcs)],
    ['calorRecupCalTotal', cexFloat(rowItem.calorRecuperadoCalefaccion)],
    ['calorRecupRefTotal', cexFloat(rowItem.frioRecuperado)],
    ['electricidadGenTotal', cexFloat(energy)],
  ].forEach(([key, value]) => {
    next = replacePickleValueAfterKey(next, key, value);
  });
  next = replaceEnergyByFuel(next, rowItem.combustible, energy);
  return next;
}

function replaceEnergyByFuel(text, fuel, energy) {
  const fuelKey = normalizeText(fuel).replace(/\s+/g, '');
  const keyByFuel = {
    electricidad: 'enConsum_Electricidad',
    gasnatural: 'enConsum_GasNatural',
    gasoleoc: 'enConsum_Gasoil',
    gasoil: 'enConsum_Gasoil',
    glp: 'enConsum_GLP',
    biomasa: 'enConsum_BiomasaDens',
    carbon: 'enConsum_Carbon',
    biocarburante: 'enConsum_Biocarburante',
  };
  let next = text;
  Object.values(keyByFuel).forEach(key => {
    next = replacePickleValueAfterKey(next, key, cexFloat('0'));
  });
  return replacePickleValueAfterKey(next, keyByFuel[fuelKey] || 'enConsum_Electricidad', cexFloat(energy));
}

function replaceNthObjectBlock(text, className, occurrenceIndex, replacer) {
  let cursor = 0;
  for (let index = 0; index <= occurrenceIndex; index += 1) {
    cursor = text.indexOf(className, cursor);
    if (cursor < 0) return text;
    cursor += className.length;
  }
  const blockStart = text.lastIndexOf('(i', cursor);
  const blockEnd = text.indexOf('sba', cursor);
  if (blockStart < 0 || blockEnd < 0) return text;
  const end = blockEnd + 3;
  return text.slice(0, blockStart) + replacer(text.slice(blockStart, end)) + text.slice(end);
}

function replaceEveryObjectBlock(text, className, replacer) {
  let next = text;
  let cursor = 0;
  while (true) {
    const classIndex = indexOfLinePattern(next, className, cursor);
    if (classIndex < 0) return next;
    const blockStart = next.lastIndexOf('(i', classIndex);
    const blockEnd = next.indexOf('sba', classIndex);
    if (blockStart < 0 || blockEnd < 0) return next;
    const end = blockEnd + 3;
    const replacement = replacer(next.slice(blockStart, end));
    next = next.slice(0, blockStart) + replacement + next.slice(end);
    cursor = blockStart + replacement.length;
  }
}

function replaceEveryClassRegion(text, className, replacer) {
  let next = text;
  let cursor = 0;
  while (true) {
    const classIndex = indexOfLinePattern(next, className, cursor);
    if (classIndex < 0) return next;
    const nextClassIndex = indexOfLinePattern(next, className, classIndex + className.length);
    const fallbackEnd = next.indexOf('sba', classIndex);
    const end = nextClassIndex >= 0 ? nextClassIndex : (fallbackEnd >= 0 ? fallbackEnd + 3 : next.length);
    const start = next.lastIndexOf('(i', classIndex);
    const regionStart = start >= 0 ? start : classIndex;
    const replacement = replacer(next.slice(regionStart, end));
    next = next.slice(0, regionStart) + replacement + next.slice(end);
    cursor = regionStart + replacement.length;
  }
}

function replacePickleValueAfterKey(text, key, replacement) {
  if (!replacement) return text;
  const pattern = new RegExp(`((?:S|V)'?${escapeRegExp(key)}'?\\r?\\np\\d+\\r?\\n|S'${escapeRegExp(key)}'\\r?\\n)(?:g\\d+|V[^\\r\\n]*|F[-+0-9.eE]+|I\\d+|S'[^']*')`, 'm');
  return text.replace(pattern, `$1${replacement}`);
}

function replacePickleMemoValueAfterMarker(text, marker, memo, replacement) {
  if (!replacement) return text;
  const markerIndex = text.indexOf(marker);
  if (markerIndex < 0) return text;
  const nextStreamIndex = text.indexOf('\n.(', markerIndex + marker.length);
  const end = nextStreamIndex < 0 ? text.length : nextStreamIndex;
  const before = text.slice(0, markerIndex);
  const section = text.slice(markerIndex, end);
  const after = text.slice(end);
  const pattern = new RegExp(`(\\r?\\n)(a?)(?:g\\d+|V[^\\r\\n]*|F[-+0-9.eE]+|I\\d+|S'[^']*')(\\r?\\n${escapeRegExp(memo)}\\r?\\n)`);
  return before + section.replace(pattern, `$1$2${replacement}$3`) + after;
}

function replaceInputSublist(text, startPattern, marker, nextListPattern, serializedList, keepAppendCount = 1) {
  const markerIndex = text.indexOf(marker);
  if (markerIndex < 0 || !serializedList) return text;
  const start = lastIndexOfLinePattern(text, startPattern, markerIndex);
  const nextList = indexOfLinePattern(text, nextListPattern, markerIndex);
  if (start < 0 || nextList < 0 || nextList <= start) return text;
  const replaceStart = startPattern.startsWith('\n') ? start + 1 : start;
  const replaceEnd = Math.max(replaceStart, nextList - keepAppendCount);
  return text.slice(0, replaceStart) + serializedList + text.slice(replaceEnd);
}

function replaceInputSublistInSection(text, sectionStartPattern, sectionEndPattern, startPattern, marker, nextListPattern, serializedList, keepAppendCount = 1) {
  const sectionStart = indexOfLinePattern(text, sectionStartPattern);
  if (sectionStart < 0) return text;
  const sectionEnd = indexOfLinePattern(text, sectionEndPattern, sectionStart + sectionStartPattern.length);
  if (sectionEnd < 0) return text;
  const before = text.slice(0, sectionStart);
  const section = text.slice(sectionStart, sectionEnd);
  const after = text.slice(sectionEnd);
  return before + replaceInputSublist(section, startPattern, marker, nextListPattern, serializedList, keepAppendCount) + after;
}

function indexOfLinePattern(text, pattern, fromIndex = 0) {
  const direct = text.indexOf(pattern, fromIndex);
  if (direct >= 0) return direct;
  return text.indexOf(pattern.replace(/\n/g, '\r\n'), fromIndex);
}

function lastIndexOfLinePattern(text, pattern, fromIndex) {
  const direct = text.lastIndexOf(pattern, fromIndex);
  const crlf = text.lastIndexOf(pattern.replace(/\n/g, '\r\n'), fromIndex);
  return Math.max(direct, crlf);
}

function serializeCexCerramientosInput(rows) {
  return serializeCexList(rows.map(serializeCexCerramientoInput));
}

function serializeCexCerramientoInput(rowItem) {
  const type = cexValue(rowItem.tipoCerramiento);
  const orientation = cexWallOrientation(rowItem.posicion);
  const dimensions = cexCerramientoDimensions(rowItem);
  const common = [
    cexPickleString(rowItem.nombre),
    cexPickleAscii(type),
    cexPickleString(cexDecimal(rowItem.superficie)),
    cexPickleFloat(rowItem.u),
    cexPickleFloat(rowItem.peso),
    cexPickleString(orientation),
    cexPickleString(''),
    cexPickleString(rowItem.patronSombras || 'Sin patrón'),
    cexPickleString(rowItem.modoDefinicion || 'Por defecto'),
  ];
  if (type === 'Suelo') {
    return serializeCexList(common.concat([
      cexPickleBool(true),
      cexPickleString(''),
      serializeCexList([]),
      cexPickleString(''),
      cexPickleString(''),
      cexPickleString('1'),
      cexPickleString('Edificio Objeto'),
      cexPickleAscii('terreno'),
    ]));
  }
  return serializeCexList(common.concat([
    type === 'Cubierta' ? serializeCexList([cexPickleString('Cubierta plana')]) : serializeCexList([]),
    cexPickleString(dimensions.longitud),
    cexPickleString(dimensions.altura),
    cexPickleString('1'),
    cexPickleString('Edificio Objeto'),
    cexPickleAscii('aire'),
  ]));
}

function cexWallOrientation(value) {
  const normalizedValue = cexValue(value);
  const normalized = normalizedValue.toUpperCase();
  if (normalized === 'TECHO') return 'Techo';
  if (normalized === 'SUELO') return 'Suelo';
  const map = {
    N: 'NO',
    S: 'SO',
    E: 'SE',
    O: 'NO',
    W: 'NO',
  };
  return map[normalized] || normalized;
}

function cexCerramientoDimensions(rowItem) {
  if (hasValue(rowItem.longitud) || hasValue(rowItem.altura)) {
    return {
      longitud: cexDecimal(rowItem.longitud),
      altura: cexDecimal(rowItem.altura),
    };
  }
  if (cexValue(rowItem.tipoCerramiento) !== 'Fachada') return { longitud: '', altura: '' };
  const surface = Number(cexDecimal(rowItem.superficie));
  const height = Number(cexDecimal(rowItem.alturaCerramiento || 2.6));
  if (!Number.isFinite(surface) || !Number.isFinite(height) || height <= 0) return { longitud: '', altura: '' };
  return {
    longitud: decimalForApp(surface / height),
    altura: decimalForApp(height),
  };
}

function serializeCexPuentesInput(rows) {
  return serializeCexList(rows.map(rowItem => serializeCexList([
    cexPickleString(rowItem.nombre),
    cexPickleString('PT'),
    cexPickleAscii(rowItem.tipoPuenteTermico),
    cexPickleFloat(rowItem.fi),
    cexPickleFloat(rowItem.longitud),
    cexPickleAscii('defecto_fi'),
    cexPickleAscii('defecto'),
    cexPickleString(rowItem.cerramientoAsociado),
    cexPickleString('Edificio Objeto'),
  ])));
}

function serializeCexHuecosInput(rows) {
  return `(l${rows.map(serializeCexHuecoEstimadasObject).join('')}`;
}

function serializeCexHuecoEstimadasObject(rowItem) {
  const orientation = cexWallOrientation(rowItem.orientacion);
  const protection = serializeCexList([
    cexPickleString(''), cexPickleString(''), cexPickleString(''),
    cexPickleString(cexDecimal(rowItem.altura)), cexPickleString(cexDecimal(rowItem.longitud)),
    cexPickleString('0.20'),
    serializeCexList([cexPickleString(''), cexPickleInteger('0'), cexPickleInteger('0')]),
    serializeCexList([cexPickleString(''), cexPickleInteger('0'), cexPickleInteger('0')]),
    cexPickleString(''), cexPickleBool(false), cexPickleBool(false),
    cexPickleString(''), cexPickleBool(false), cexPickleBool(false),
    cexPickleString(''), cexPickleString(''), cexPickleString(''),
    cexPickleBool(false), cexPickleBool(true), cexPickleBool(false),
    cexPickleBool(false), cexPickleBool(false), cexPickleBool(false), cexPickleBool(false),
    serializeCexList([cexPickleString(''), cexPickleString('')]),
  ]);
  const attrs = [
    ['elementosProteccionSolar', protection],
    ['correctorFSCTE', cexFloat('0.66')],
    ['permeabilidadValor', cexPickleString(cexDecimal(rowItem.permeabilidad))],
    ['tieneProteccionSolar', cexPickleBool(true)],
    ['superficie', cexPickleString(cexDecimal(rowItem.superficie))],
    ['descripcion', cexPickleString(rowItem.nombre)],
    ['absortividadValor', cexPickleString(cexDecimal(rowItem.absortividadMarco))],
    ['tipo', cexPickleString('Hueco')],
    ['multiplicador', cexPickleString(cexDecimal(rowItem.multiplicador))],
    ['subgrupo', cexPickleString('Edificio Objeto')],
    ['cerramientoAsociado', cexPickleString(rowItem.cerramientoAsociado)],
    ['correctorSolar', cexPickleString(orientation)],
    ['Umarco', cexFloat(rowItem.uMarco)],
    ['porcMarco', cexPickleString(cexDecimal(rowItem.porcMarco))],
    ['__tipo__', cexPickleString('HuecoEstimadas')],
    ['correctorFSInvierno', cexFloat('0.71')],
    ['permeabilidadChoice', cexPickleString('Estanco')],
    ['orientacion', cexPickleString(orientation)],
    ['tipoMarco', cexPickleString('Metálico con RPT')],
    ['absortividadPosiciones', serializeCexList([cexPickleInteger('7'), cexPickleInteger('1')])],
    ['dobleVentana', cexPickleBool(false)],
    ['longitud', cexPickleString(cexDecimal(rowItem.longitud))],
    ['Uvidrio', cexFloat(rowItem.uVidrio)],
    ['patronSombras', cexPickleString(rowItem.patronSombras || 'Sin patrón')],
    ['Gvidrio', cexFloat(rowItem.gVidrio)],
    ['correctorFSVerano', cexFloat('0.66')],
    ['tipoVidrio', cexPickleString('Doble')],
    ['altura', cexPickleString(cexDecimal(rowItem.altura))],
  ];
  return `(iEnvolvente.objetosEnvolvente\nHuecoEstimadas\n(d${attrs.map(([key, value]) => `${cexPickleAscii(key)}${cexPickleToken(value)}s`).join('')}ba`;
}

function serializeCexSystemsStream(acsRows, calefaccionRows, refrigeracionRows, contribucionRows) {
  const acsRowsForStream = acsRows.length ? acsRows : normalizeCexRows(CEX37_DEFAULTS['instalaciones.acs.items'], [
    'nombre', 'tipoEquipo', 'modoDefinicion', 'tipoGenerador', 'combustible',
    'rendimientoEstacional', 'm2Cubiertos', 'demandaCubierta', 'zona', 'acumulacion',
  ]);
  const calefaccionRowsForStream = calefaccionRows.length ? calefaccionRows : normalizeCexRows(CEX37_DEFAULTS['instalaciones.calefaccion.items'], [
    'nombre', 'tipoEquipo', 'modoDefinicion', 'tipoGenerador', 'combustible',
    'rendimientoEstacional', 'm2Cubiertos', 'demandaCubierta', 'zona',
  ]);
  const refrigeracionRowsForStream = refrigeracionRows.length ? refrigeracionRows : normalizeCexRows(CEX37_DEFAULTS['instalaciones.refrigeracion.items'], [
    'nombre', 'tipoEquipo', 'modoDefinicion', 'tipoGenerador', 'combustible',
    'rendimientoEstacional', 'm2Cubiertos', 'demandaCubierta', 'zona',
  ]);
  // Contributions are optional. Falling back to the Casa 37 template here
  // silently exported its solar/PV system into unrelated projects.
  const contribucionRowsForStream = contribucionRows;

  return serializeCexList([
    serializeCexAcsInput(acsRowsForStream),
    serializeCexList([]),
    serializeCexList([]),
    serializeCexClimateInput(calefaccionRowsForStream, refrigeracionRowsForStream),
    serializeCexList([]),
    serializeCexList([]),
    serializeCexContribucionesInput(contribucionRowsForStream),
    serializeCexList([]),
    serializeCexList([]),
    serializeCexList([]),
    serializeCexList([]),
    serializeCexList([]),
  ]) + '.';

  const acs = acsRows[0] || normalizeCexRows(CEX37_DEFAULTS['instalaciones.acs.items'], [
    'nombre', 'tipoEquipo', 'modoDefinicion', 'tipoGenerador', 'combustible',
    'rendimientoEstacional', 'm2Cubiertos', 'demandaCubierta', 'zona', 'acumulacion',
  ])[0] || {};
  const heat = calefaccionRows[0] || normalizeCexRows(CEX37_DEFAULTS['instalaciones.calefaccion.items'], [
    'nombre', 'tipoEquipo', 'modoDefinicion', 'tipoGenerador', 'combustible',
    'rendimientoEstacional', 'm2Cubiertos', 'demandaCubierta', 'zona',
  ])[0] || {};
  const cool = refrigeracionRows[0] || normalizeCexRows(CEX37_DEFAULTS['instalaciones.refrigeracion.items'], [
    'nombre', 'tipoEquipo', 'modoDefinicion', 'tipoGenerador', 'combustible',
    'rendimientoEstacional', 'm2Cubiertos', 'demandaCubierta', 'zona',
  ])[0] || {};
  const contribution = contribucionRows[0] || normalizeCexRows(CEX37_DEFAULTS['instalaciones.contribuciones.items'], [
    'nombre', 'zona', 'acsRenovable', 'calefaccionRenovable', 'refrigeracionRenovable',
    'calorRecuperadoAcs', 'calorRecuperadoCalefaccion', 'frioRecuperado',
    'energiaConsumidaGeneracionElectricidad', 'combustible',
  ])[0] || {};
  const climateBase = Object.keys(heat).some(key => hasValue(heat[key])) ? heat : cool;

  return [
    '(lp0\n',
    '(lp1\n',
    '(lp2\n',
    cexPickleString(acs.nombre || 'Equipo ACS'), 'p3\n', 'a',
    cexPickleAscii('ACS'), 'p4\n', 'a',
    '(lp5\n',
    cexPickleFloat(acs.rendimientoEstacional), 'a',
    "S''\np6\n", 'ag6\n', 'aa',
    cexPickleString(acs.tipoGenerador || 'Caldera Estándar'), 'p7\n', 'a',
    cexPickleString(acs.combustible || 'Electricidad'), 'p8\n', 'a',
    '(lp9\n',
    '(lp10\n', cexPickleAscii(cexDecimal(acs.m2Cubiertos)), 'p11\n', 'a', cexPickleString(cexDecimal(acs.demandaCubierta)), 'p12\n', 'aa',
    '(lp13\n', 'g6\n', 'ag6\n', 'aa',
    '(lp14\n', 'g6\n', 'ag6\n', 'aaa',
    cexPickleString(acs.modoDefinicion || 'Estimado según Instalación'), 'p15\n', 'a',
    '(lp16\n',
    '(lp17\n', cexPickleString(cexDecimal(acs.rendimientoEstacional)), 'p18\n', 'ag6\n', 'ag6\n', 'aa',
    '(lp19\n', cexPickleBool(false), 'a', cexPickleBool(false), 'a', cexPickleBool(true), 'aa',
    '(lp20\n', cexPickleBool(false), 'a', cexPickleString('1.0'), 'p21\n', 'a', cexPickleString('0.0'), 'p22\n', 'aaa',
    '(lp23\n',
    cexPickleBool(isTruthy(acs.acumulacion)), 'a',
    cexPickleString('80'), 'p24\n',
    'a', cexPickleString('80'), 'p25\n',
    'a', cexPickleString('60'), 'p26\n',
    'a', cexPickleString('4.1'), 'p27\n',
    'a', cexPickleString('Por defecto'), 'p28\n',
    'a', cexPickleString('1'), 'p29\n',
    'aa',
    cexPickleString(acs.zona || 'Edificio Objeto'), 'p30\n',
    'aaa',
    '(lp31\n', 'a',
    '(lp32\n', 'a',
    '(lp33\n',
    '(lp34\n',
    cexPickleString(climateBase.nombre || 'Calefacción y refrigeración'), 'p35\n', 'a',
    cexPickleAscii('climatizacion'), 'p36\n', 'a',
    '(lp37\n',
    'g6\n', 'a', cexPickleFloat(heat.rendimientoEstacional), 'a', cexPickleFloat(cool.rendimientoEstacional), 'aa',
    cexPickleString(climateBase.tipoGenerador || 'Bomba de Calor'), 'p38\n',
    'a', cexPickleString(climateBase.combustible || 'Electricidad'), 'p39\n',
    'a',
    '(lp40\n',
    '(lp41\n', 'g6\n', 'ag6\n', 'aa',
    '(lp42\n', cexPickleAscii(cexDecimal(heat.m2Cubiertos)), 'p43\n', 'a', cexPickleString(cexDecimal(heat.demandaCubierta)), 'p44\n', 'aa',
    '(lp45\n', cexPickleAscii(cexDecimal(cool.m2Cubiertos)), 'p46\n', 'a', cexPickleString(cexDecimal(cool.demandaCubierta)), 'p47\n', 'aaa',
    cexPickleString(climateBase.modoDefinicion || 'Estimado según Instalación'), 'p48\n', 'a',
    '(lp49\n',
    '(lp50\n', 'g6\n', 'a', cexPickleString('270.0'), 'p51\n', 'a', cexPickleString('250.0'), 'p52\n', 'aa',
    '(lp53\n', cexPickleBool(true), 'a', cexPickleBool(false), 'a', cexPickleBool(false), 'aa',
    '(lp54\n', 'aa',
    cexPickleString(climateBase.zona || 'Edificio Objeto'), 'p55\n',
    'aaa',
    '(lp56\n', 'a',
    '(lp57\n', 'a',
    '(lp58\n',
    '(lp59\n',
    cexPickleString(contribution.nombre || 'Contribuciones energéticas'), 'p60\n', 'a',
    cexPickleAscii('renovable'), 'p61\n', 'a',
    '(lp62\n',
    cexPickleString(cexDecimal(contribution.acsRenovable)), 'p63\n',
    'a', cexPickleString(cexDecimal(contribution.calefaccionRenovable)), 'p64\n',
    'a', cexPickleString(cexDecimal(contribution.refrigeracionRenovable)), 'p65\n',
    'a', cexPickleBool(false), 'aa',
    '(lp66\n',
    cexPickleString(cexDecimal(contribution.energiaConsumidaGeneracionElectricidad)), 'p67\n',
    'a', cexPickleString(cexDecimal(contribution.calorRecuperadoAcs)), 'p68\n',
    'a', cexPickleString(cexDecimal(contribution.calorRecuperadoCalefaccion)), 'p69\n',
    'a', cexPickleString(cexDecimal(contribution.frioRecuperado)), 'p70\n',
    'a', cexPickleString(cexDecimal(contribution.energiaConsumidaGeneracionElectricidad)), 'p71\n',
    'a', cexPickleString(contribution.combustible || 'Electricidad'), 'p72\n',
    'aa',
    '(lp73\n', cexPickleBool(true), 'a', cexPickleBool(true), 'aa',
    cexPickleString(contribution.zona || 'Edificio Objeto'), 'p74\n',
    'aaa',
    '(lp75\n', 'a',
    '(lp76\n', 'a',
    '(lp77\n', 'a',
    '(lp78\n', 'a',
    '(lp79\n', 'a',
    '.',
  ].join('');
}

function serializeCexAcsInput(rows) {
  return serializeCexList(rows.map(rowItem => serializeCexList([
    cexPickleString(rowItem.nombre),
    cexPickleAscii('ACS'),
    serializeCexList([
      cexPickleFloat(rowItem.rendimientoEstacional),
      cexPickleString(''),
      cexPickleString(''),
    ]),
    cexPickleString(rowItem.tipoGenerador),
    cexPickleString(rowItem.combustible),
    serializeCexList([
      serializeCexList([cexPickleString(cexDecimal(rowItem.m2Cubiertos)), cexPickleString(cexDecimal(rowItem.demandaCubierta))]),
      serializeCexList([cexPickleString(''), cexPickleString('')]),
      serializeCexList([cexPickleString(''), cexPickleString('')]),
    ]),
    cexPickleString(cexOption(rowItem.modoDefinicion, 'modoDefinicion', 'Estimado según Instalación')),
    serializeCexList([
      serializeCexList([cexPickleString(cexDecimal(rowItem.rendimientoEstacional)), cexPickleString(''), cexPickleString('')]),
      serializeCexList([cexPickleBool(false), cexPickleBool(false), cexPickleBool(true)]),
      serializeCexList([cexPickleBool(false), cexPickleString('1.0'), cexPickleString('0.0')]),
    ]),
    serializeCexList([
      cexPickleBool(isTruthy(rowItem.acumulacion)),
      cexPickleString('80'),
      cexPickleString('80'),
      cexPickleString('60'),
      cexPickleString('4.1'),
      cexPickleString('Por defecto'),
      cexPickleString('1'),
    ]),
    cexPickleString(cexOption(rowItem.zona, 'zona', 'Edificio Objeto')),
  ])));
}

function serializeCexClimateInput(calefaccionRows, refrigeracionRows) {
  const count = Math.max(calefaccionRows.length, refrigeracionRows.length);
  const rows = Array.from({ length: count }, (_, index) => {
    const heat = calefaccionRows[index] || {};
    const cool = refrigeracionRows[index] || {};
    const base = Object.keys(heat).length ? heat : cool;
    return { heat, cool, base };
  });
  return serializeCexList(rows.map(({ heat, cool, base }) => serializeCexList([
    cexPickleString(base.nombre || 'Calefacción y refrigeración'),
    cexPickleAscii('climatizacion'),
    serializeCexList([
      cexPickleString(''),
      cexPickleFloat(heat.rendimientoEstacional),
      cexPickleFloat(cool.rendimientoEstacional),
    ]),
    cexPickleString(base.tipoGenerador),
    cexPickleString(base.combustible),
    serializeCexList([
      serializeCexList([cexPickleString(''), cexPickleString('')]),
      serializeCexList([cexPickleString(cexDecimal(heat.m2Cubiertos)), cexPickleString(cexDecimal(heat.demandaCubierta))]),
      serializeCexList([cexPickleString(cexDecimal(cool.m2Cubiertos)), cexPickleString(cexDecimal(cool.demandaCubierta))]),
    ]),
    cexPickleString(cexOption(base.modoDefinicion, 'modoDefinicion', 'Estimado según Instalación')),
    serializeCexList([
      serializeCexList([cexPickleString(''), cexPickleString('270.0'), cexPickleString('250.0')]),
      serializeCexList([cexPickleBool(true), cexPickleBool(false), cexPickleBool(false)]),
      serializeCexList([]),
    ]),
    cexPickleString(cexOption(base.zona, 'zona', 'Edificio Objeto')),
  ])));
}

function serializeCexContribucionesInput(rows) {
  return serializeCexList(rows.map(rowItem => serializeCexList([
    cexPickleString(rowItem.nombre),
    cexPickleAscii('renovable'),
    serializeCexList([
      cexPickleString(cexDecimal(rowItem.acsRenovable)),
      cexPickleString(cexDecimal(rowItem.calefaccionRenovable)),
      cexPickleString(cexDecimal(rowItem.refrigeracionRenovable)),
      cexPickleBool(false),
    ]),
    serializeCexList([
      cexPickleString(cexDecimal(rowItem.energiaConsumidaGeneracionElectricidad)),
      cexPickleString(cexDecimal(rowItem.calorRecuperadoAcs)),
      cexPickleString(cexDecimal(rowItem.calorRecuperadoCalefaccion)),
      cexPickleString(cexDecimal(rowItem.frioRecuperado)),
      cexPickleString(cexDecimal(rowItem.energiaConsumidaGeneracionElectricidad)),
      cexPickleString(rowItem.combustible),
    ]),
    serializeCexList([cexPickleBool(true), cexPickleBool(true)]),
    cexPickleString(cexOption(rowItem.zona, 'zona', 'Edificio Objeto')),
  ])));
}

function isUsefulCexContribution(rowItem) {
  return [
    'acsRenovable',
    'calefaccionRenovable',
    'refrigeracionRenovable',
    'calorRecuperadoAcs',
    'calorRecuperadoCalefaccion',
    'frioRecuperado',
    'energiaConsumidaGeneracionElectricidad',
  ].some(key => Number(cexDecimal(rowItem[key])) > 0);
}

function cexOption(value, optionsKey, fallback) {
  const options = SELECT_OPTIONS[optionsKey] || [];
  const text = cexValue(value);
  return options.includes(text) ? text : fallback;
}

function isTruthy(value) {
  const normalized = normalizeText(value);
  return normalized === 'si' || normalized === 'sí' || normalized === 'true' || normalized === '1';
}

function serializeCexList(items) {
  return items.length ? `(l${items.join('a')}a` : '(l';
}

function cexPickleString(value) {
  return `V${cexValue(value)}\n`;
}

function cexPickleAscii(value) {
  return cexAsciiString(value) + '\n';
}

function cexPickleFloat(value) {
  return cexFloat(value) + '\n';
}

function cexPickleInteger(value) {
  return cexInteger(value) + '\n';
}

function cexPickleBool(value) {
  return value ? 'I01\n' : 'I00\n';
}

function cexPickleToken(value) {
  const token = String(value || '');
  if (token.startsWith('(')) return token;
  return token.endsWith('\n') ? token : token + '\n';
}

function normalizeCexRows(value, columns) {
  return readTableRows(value, columns.map(id => ({ id })))
    .filter(rowItem => rowItem && Object.values(rowItem).some(hasValue))
    .map(rowItem => rowItem.values
      ? Object.fromEntries(columns.map((column, index) => [column, rowItem.values[index] || '']))
      : rowItem);
}

function replaceCexToken(text, from, to, maxCount = 3) {
  const replacements = [
    ['V' + from, cexString(to)],
    ["S'" + from + "'", cexAsciiString(to)],
    ['F' + from, cexFloat(to)],
    ['I' + from, cexInteger(to)],
  ];
  const numeric = Number(cexDecimal(from));
  if (Number.isFinite(numeric)) {
    replacements.push(['F' + numeric.toFixed(1), cexFloat(to)]);
    replacements.push(['F' + String(numeric), cexFloat(to)]);
  }
  return replacements.reduce((current, [needle, replacement]) => replacePickleTokenOccurrences(current, needle, replacement, maxCount), text);
}

function replacePickleTokenOccurrences(text, token, replacement, maxCount = 1) {
  if (!token || token === replacement) return text;
  const pattern = new RegExp(`(^|\\r?\\n)(a?)${escapeRegExp(token)}(?=\\r?\\n)`);
  let count = 0;
  return text.replace(new RegExp(pattern.source, 'g'), (match, lineBreak, appendPrefix) => {
    if (count >= maxCount) return match;
    count += 1;
    return `${lineBreak}${appendPrefix}${replacement}`;
  });
}

function isSpecificCexToken(value) {
  return value.length > 1 || /[.,]/.test(value) || /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(value);
}

function replaceAll(text, from, to) {
  if (!from || from === to) return text;
  return text.split(from).join(to);
}

function replaceFirst(text, from, to) {
  if (!from || from === to) return text;
  const index = text.indexOf(from);
  if (index < 0) return text;
  return text.slice(0, index) + to + text.slice(index + from.length);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceFirstMemoValue(text, memo, replacement) {
  if (!replacement || replacement === 'aV') return text;
  return text.replace(new RegExp(`^a?V.*\\r?\\n${memo}\\r?$`, 'm'), `${replacement}\n${memo}`);
}

function cexString(value) {
  return 'V' + cexValue(value);
}

function cexAppendString(value) {
  return 'a' + cexString(value);
}

function cexAsciiString(value) {
  return "S'" + cexValue(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
}

function cexFloat(value) {
  const number = Number(cexDecimal(value));
  return 'F' + (Number.isFinite(number) ? String(number) : '0');
}

function cexInteger(value) {
  const number = Number.parseInt(cexDecimal(value), 10);
  return 'I' + (Number.isFinite(number) ? String(number) : '0');
}

async function api(payload) {
  return apiWithConfig(state.config, payload);
}

async function apiWithConfig(config, payload) {
  const request = Object.assign({ secret: config.secret }, payload);
  try {
    return await proxyAppsScript(config.apiUrl, request);
  } catch (proxyError) {
    if (!canUseDirectAppsScriptFallback(proxyError)) throw proxyError;
  }

  if (WRITE_ACTIONS.includes(request.action)) {
    if (request.action === 'patch') {
      try {
        return await jsonpAppsScript(config.apiUrl, request);
      } catch (jsonpError) {
        return await formMessageAppsScript(config.apiUrl, request);
      }
    }
    try {
      return await formMessageAppsScript(config.apiUrl, request, request.action === 'save' ? 6000 : 20000);
    } catch (error) {
      return await recoverConfirmedWrite(config.apiUrl, request, error);
    }
  }
  try {
    return await postAppsScript(config.apiUrl, request);
  } catch (error) {
    if (!isNetworkFetchError(error)) throw error;
    return await jsonpAppsScript(config.apiUrl, request);
  }
}

async function recoverConfirmedWrite(apiUrl, request, originalError) {
  if (request.action !== 'save' || !request.item || !request.item.id) throw originalError;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    if (attempt > 0) await sleep(750);
    const response = await jsonpAppsScript(apiUrl, {
      action: 'get',
      secret: request.secret,
      id: request.item.id,
    });
    const item = response.item;
    if (item && String(item.updatedAt || '') === String(request.item.updatedAt || '')) {
      return response;
    }
  }
  throw originalError;
}

function sleep(ms) {
  return new Promise(resolve => window.setTimeout(resolve, ms));
}

async function proxyAppsScript(apiUrl, request) {
  if (!window.location || window.location.protocol === 'file:') {
    throw new Error('Proxy no disponible desde archivo local');
  }
  const response = await fetch('/api/apps-script', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiUrl, payload: request }),
  });
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (error) {
    const preview = text.trim().slice(0, 500) || 'respuesta vacía';
    throw new Error(`El proxy local no devolvió JSON válido: ${preview}`);
  }
  if (!response.ok || !data.ok) throw new Error(data.error || 'Error proxy Apps Script');
  return data;
}

function canUseDirectAppsScriptFallback(error) {
  return /Proxy no disponible|Failed to fetch|NetworkError|Load failed|404|405/i.test(String(error && error.message ? error.message : error));
}

async function postAppsScript(apiUrl, request) {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(request),
  });
  const data = await response.json();
  if (!data.ok) throw new Error(data.error || 'Error Apps Script');
  return data;
}

function jsonpAppsScript(apiUrl, request) {
  return new Promise((resolve, reject) => {
    const callbackName = `ce3xAppsScript${Date.now()}${Math.random().toString(36).slice(2)}`;
    const script = document.createElement('script');
    const cleanup = () => {
      script.remove();
      delete window[callbackName];
    };
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('Apps Script no respondió por JSONP'));
    }, 15000);

    window[callbackName] = data => {
      window.clearTimeout(timeout);
      cleanup();
      if (!data || !data.ok) {
        reject(new Error(data?.error || 'Error Apps Script'));
        return;
      }
      resolve(data);
    };

    const url = new URL(apiUrl);
    url.searchParams.set('payload', JSON.stringify(request));
    url.searchParams.set('callback', callbackName);
    script.src = url.toString();
    script.onerror = () => {
      window.clearTimeout(timeout);
      cleanup();
      reject(new Error('No se pudo cargar Apps Script por JSONP'));
    };
    document.body.appendChild(script);
  });
}

function formMessageAppsScript(apiUrl, request, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    const requestId = `ce3xForm${Date.now()}${Math.random().toString(36).slice(2)}`;
    const iframe = document.createElement('iframe');
    const form = document.createElement('form');
    const input = document.createElement('input');

    const cleanup = () => {
      window.removeEventListener('message', onMessage);
      iframe.remove();
      form.remove();
    };
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('Apps Script no confirmó el guardado por formulario'));
    }, timeoutMs);
    const onMessage = event => {
      const data = event.data || {};
      if (data.source !== 'ce3x-apps-script' || data.requestId !== requestId) return;
      window.clearTimeout(timeout);
      cleanup();
      const payload = data.payload || {};
      if (!payload.ok) {
        reject(new Error(payload.error || 'Error Apps Script'));
        return;
      }
      resolve(payload);
    };

    iframe.name = requestId;
    iframe.hidden = true;
    form.hidden = true;
    form.method = 'POST';
    form.action = apiUrl;
    form.target = requestId;
    input.type = 'hidden';
    input.name = 'payload';
    input.value = JSON.stringify(Object.assign({}, request, {
      transport: 'formMessage',
      requestId,
    }));

    form.appendChild(input);
    document.body.appendChild(iframe);
    document.body.appendChild(form);
    window.addEventListener('message', onMessage);
    form.submit();
  });
}

function isNetworkFetchError(error) {
  return /Failed to fetch|NetworkError|Load failed|CORS/i.test(String(error && error.message ? error.message : error));
}

function openConfig() {
  configForm.elements.apiUrl.value = state.config.apiUrl || '';
  configForm.elements.secret.value = state.config.secret || '';
  configDialog.showModal();
}

function saveConfig(event) {
  event.preventDefault();
  state.config = {
    apiUrl: configForm.elements.apiUrl.value.trim(),
    secret: configForm.elements.secret.value.trim(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.config));
  configDialog.close();
  renderStorageMode();
  loadRecords();
}

async function testConfigConnection() {
  const config = {
    apiUrl: configForm.elements.apiUrl.value.trim(),
    secret: configForm.elements.secret.value.trim(),
  };
  if (!config.apiUrl || !config.secret) {
    alert('Rellena Apps Script URL y APP_SECRET antes de probar.');
    return;
  }
  try {
    const response = await apiWithConfig(config, { action: 'list' });
    alert(`Conexión OK. Google Sheet devuelve ${response.items?.length || 0} expediente(s).`);
  } catch (error) {
    alert(sheetErrorHelp(error));
  }
}

function loadConfig() {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  const params = new URLSearchParams(window.location.search);
  const configFromUrl = {
    apiUrl: params.get('configUrl') || '',
    secret: params.get('configSecret') || '',
  };
  if (configFromUrl.apiUrl && configFromUrl.secret) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configFromUrl));
    stripConfigFromUrl(params);
    return configFromUrl;
  }
  return stored;
}

function stripConfigFromUrl(params) {
  params.delete('configUrl');
  params.delete('configSecret');
  const query = params.toString();
  const nextUrl = window.location.pathname + (query ? `?${query}` : '') + window.location.hash;
  window.history.replaceState({}, document.title, nextUrl);
}

async function copyConfigLink() {
  const config = {
    apiUrl: configForm.elements.apiUrl.value.trim(),
    secret: configForm.elements.secret.value.trim(),
  };
  if (!config.apiUrl || !config.secret) {
    alert('Rellena Apps Script URL y APP_SECRET antes de copiar el enlace.');
    return;
  }
  const url = new URL(window.location.href);
  url.searchParams.set('configUrl', config.apiUrl);
  url.searchParams.set('configSecret', config.secret);
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    await navigator.clipboard.writeText(url.toString());
    alert('Enlace de configuración copiado. Ábrelo una vez en el móvil y quedará guardado allí.');
    return;
  }
  window.prompt('Copia este enlace y ábrelo una vez en el móvil:', url.toString());
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function readTableRows(value, columns) {
  let rows = Array.isArray(value) ? value : [];
  if (typeof value === 'string' && value.trim().startsWith('[')) {
    try {
      rows = JSON.parse(value);
    } catch {
      rows = [];
    }
  }
  return rows.length ? rows : [Object.fromEntries(columns.map(column => [column.id, '']))];
}

function hasValue(value) {
  if (Array.isArray(value)) return value.length > 0;
  return String(value || '').trim() !== '';
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function latin1Encode(text) {
  const bytes = new Uint8Array(text.length);
  for (let index = 0; index < text.length; index += 1) bytes[index] = text.charCodeAt(index) & 0xff;
  return bytes;
}

function normalizeCexLineEndings(text) {
  return String(text || '').replace(/\r?\n/g, '\r\n');
}

function cexValue(value) {
  return String(value || '').replace(/[\r\n]+/g, ' ').trim();
}

function cexDecimal(value) {
  return cexValue(value).replace(',', '.') || '0';
}

function cexBuildingType(value) {
  const normalized = normalizeText(value);
  if (normalized.includes('bloque')) return 'Bloque de Viviendas';
  if (normalized.includes('vivienda individual') || normalized.includes('unifamiliar')) return 'Unifamiliar';
  return cexValue(value) || 'Unifamiliar';
}

function fileSafe(value) {
  return String(value || '').normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'ce3x';
}

function titleCase(value) {
  return cexValue(value).toLocaleLowerCase('es-ES').replace(/\b\p{L}/gu, char => char.toLocaleUpperCase('es-ES'));
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));
}

function normalizeReference(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function normativaVigenteDesdeAnio(value) {
  const match = String(value || '').match(/(?:19|20)\d{2}/);
  if (!match) return '';
  const year = Number(match[0]);
  if (year < 1981) return 'Anterior';
  if (year < 2007) return 'NBE-CT-79';
  if (year < 2014) return 'CTE 2006';
  return 'CTE 2013';
}

function normalizeText(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function normalizeSpeech(value) {
  return normalizeText(value).replace(/\s+/g, ' ').trim();
}

function aliasToPattern(value) {
  return normalizeText(value).replace(/\s+/g, '\\s+');
}
