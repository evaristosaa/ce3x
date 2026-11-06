// Prepare private local comparison cases. Reads CEX as data; never executes pickle.
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {webcrypto,createHash} from 'node:crypto';
import vm from 'node:vm';

const args=process.argv.slice(2),option=name=>{
  const value=args[args.indexOf(name)+1];
  if(!value||value.startsWith('--'))throw new Error('Missing value for '+name);
  return value;
};
if(!args.includes('--source')||!args.includes('--output'))throw new Error('Use --source installed-example.cex --output private-directory');
const sourcePath=resolve(option('--source')),out=resolve(option('--output'));
const root=fileURLToPath(new URL('../',import.meta.url));
const noop={addEventListener(){},appendChild(){},close(){},querySelector(){return noop;},remove(){},showModal(){},style:{}};
const context=vm.createContext({structuredClone,Blob,TextDecoder,TextEncoder,URL,URLSearchParams,setTimeout,alert(){},
  document:{body:noop,createElement(){return noop;},querySelector(){return noop;}},localStorage:{getItem(){return null;},setItem(){},removeItem(){}},navigator:{},
  window:{addEventListener(){},crypto:webcrypto,location:{protocol:'http:',search:''},setTimeout}});
let app=readFileSync(join(root,'app/app.js'),'utf8');
for(const call of ['cleanupLocalDataStorage();','renderTabs();','renderStorageMode();','loadRecords();'])app=app.replace(call,'');
const modules=['ce3x-locations.js','cex-import.js','cex-32.js','estimation-model.js','review-model.js','solar-tables.js','solar-model.js','window-model.js'];
vm.runInContext(modules.map(name=>readFileSync(join(root,'app',name),'utf8')).join('\n')+'\n'+app+';globalThis.h={cex32Blocks,parseCexRecordData,buildCex32,windowStore,solarCalculate};',context);
const h=context.h,source=readFileSync(sourcePath,'latin1'),template=readFileSync(join(root,'app/templates/base-3.2.cex'),'latin1');
const original=h.cex32Blocks(source);
if(original[0]?.value!=='CE3Xv3.2 Residencial')throw new Error('Use a native CE3X 3.2 residential reference.');
const data=h.parseCexRecordData(source),roundtrip=h.buildCex32(template,{data:structuredClone(data)});
const first=data['envolvente.huecos.items'][0];
if(!first)throw new Error('The reference needs a window.');
const settings={schema:1,mode:'Conocidas',dobleVentana:true,uVidrio:'1.4',gVidrio:'.52',uMarco:'2.2'};
const modifiedData=h.windowStore(data,0,settings),solar={schema:1,overhang:{enabled:true,L:'.8',D:'.2',H:first.altura},recess:{enabled:true,R:'.2',H:first.altura,W:first.longitud}};
modifiedData['envolvente.huecos.items'][0].proteccionSolar=JSON.stringify(solar);
const modified=h.buildCex32(template,{data:modifiedData});
const outputs={'reference.cex':source,'roundtrip.cex':roundtrip,'modified.cex':modified};
if(Object.keys(outputs).concat('input-audit.json').some(name=>existsSync(join(out,name))))throw new Error('Output files already exist; choose a new directory.');
function differingPaths(a,b,path='') {
  if(JSON.stringify(a)===JSON.stringify(b))return [];
  if(a&&b&&typeof a==='object'&&typeof b==='object')return [...new Set([...Object.keys(a),...Object.keys(b)])].flatMap(key=>differingPaths(a[key],b[key],path+'/'+key));
  return [path];
}
const sha=text=>createHash('sha256').update(Buffer.from(text,'latin1')).digest('hex');
const audit={schema:1,referenceVersion:original[0].value,sourceSha256:sha(source),generatedHashes:Object.fromEntries(Object.entries(outputs).map(([name,text])=>[name,sha(text)])),roundtripInputDifferences:differingPaths(original.slice(1,5).map(b=>b.value),h.cex32Blocks(roundtrip).slice(1,5).map(b=>b.value)),
  modifiedWindow:first.nombre,orientation:first.orientacion,thermalSettings:settings,solarSettings:solar,solarFactors:h.solarCalculate(solar,first.orientacion),
  note:'Numerical inputs only. Calculate all three files in the CE3X desktop application and compare results; preparation is not validation.'};
mkdirSync(out,{recursive:true});for(const [name,text] of Object.entries(outputs))writeFileSync(join(out,name),text,{encoding:'latin1',flag:'wx'});
writeFileSync(join(out,'input-audit.json'),JSON.stringify(audit,null,2),{flag:'wx'});
console.log(JSON.stringify({directory:out,files:Object.keys(outputs),...audit}));
if(args.includes('--assert-preserved')&&audit.roundtripInputDifferences.length)throw new Error('Roundtrip inputs differ. Review input-audit.json before calculating.');
