import {readFileSync,writeFileSync} from 'node:fs';
import {loadHelpers,nativeFixture} from '../tests/cex-32.test.mjs';
const h=loadHelpers();
const template=readFileSync(new URL('../app/templates/base-3.2.cex',import.meta.url),'latin1');
const record={data:{
  'admin.localizacion.nombreEdificio':'PRUEBA TECNICA CE3X 3.2 - TEMPORAL',
  'admin.localizacion.referenciaCatastral':'00000000000000000000',
  'admin.localizacion.gradoProteccion':'Ninguna',
  'admin.localizacion.usoEdificio':'ResidencialPrivado',
  'admin.cliente.nif':'00000000T',
  'generales.datos.tipoEdificio':'Unifamiliar'
}};
if(process.argv.includes('--complete')) {
  Object.assign(record.data, {
    'generales.definicion.superficieUtilHabitable':'100',
    'generales.definicion.numeroPlantasHabitables':'1',
    'generales.definicion.alturaLibrePlanta':'2.7',
    'generales.definicion.masaParticionesInternas':'Media',
    'envolvente.cerramientos.items':[{nombre:'Fachada de prueba',tipoCerramiento:'Fachada',superficie:'30',u:'0.5',peso:'200',posicion:'S',modoDefinicion:'Conocidas',patronSombras:'Sin patrón'}],
    'envolvente.huecos.items':[{nombre:'Ventana de prueba',cerramientoAsociado:'Fachada de prueba',longitud:'1',altura:'1',multiplicador:'1',superficie:'1',uVidrio:'3.3',gVidrio:'.75',uMarco:'4',porcMarco:'20',absortividadMarco:'.3',permeabilidad:'50',orientacion:'S',patronSombras:'Sin patrón',modoDefinicion:'Conocidas'}],
    'envolvente.puentesTermicos.items':[{nombre:'Puente de prueba',tipoPuenteTermico:'Pilar integrado en fachada',fi:'.8',longitud:'2',cerramientoAsociado:'Fachada de prueba'}],
    'instalaciones.acs.items':[{nombre:'ACS de prueba',tipoGenerador:'Efecto Joule',combustible:'Electricidad',rendimientoEstacional:'100',m2Cubiertos:'100',demandaCubierta:'100',zona:'Edificio Objeto',acumulacion:'No'}],
    'instalaciones.calefaccion.items':[{nombre:'Calefacción de prueba',tipoGenerador:'Efecto Joule',combustible:'Electricidad',rendimientoEstacional:'100',m2Cubiertos:'100',demandaCubierta:'100',zona:'Edificio Objeto'}]
  });
  for(const path of ['instalaciones.acs.items','instalaciones.calefaccion.items']) record.data[path].forEach(row=>{row.modoDefinicion='Conocido';});
}
let source=process.argv.includes('--native')?nativeFixture(h):h.buildCex32(template,record);
if(process.argv.includes('--preservation') || process.argv.includes('--estimation')) {
  const blocks=h.cex32Blocks(nativeFixture(h)), values=blocks.map(b=>b.value);
  values[1][0]=process.argv.includes('--estimation')?'PRUEBA PARAMETROS CE3X 3.2':'PRUEBA CONSERVACION CE3X 3.2';
  values[1][15].push('11111111111111111111');
  values[4][12]=[['Auxiliar de prueba',['Parámetros que deben conservarse']]];
  source=blocks[0].text+values.slice(1).map(v=>h.cex32Serialize(v)+'.').join('');
  const data=h.parseCexRecordData(source);
  data['envolvente.puentesTermicos.items']=[{nombre:'Puente de prueba',tipoPuenteTermico:'Pilar integrado en fachada',fi:'.8',longitud:'2',cerramientoAsociado:'Cubierta'}];
  source=h.buildCex32(template,{data});
}
writeFileSync(new URL('../diagnostics/prueba-cex32-sintetica.cex',import.meta.url),source,'latin1');
