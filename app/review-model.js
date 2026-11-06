/* Data review is a user declaration, not an energy calculation or signature. */
const REVIEW_DATA_KEY='revision.campos';
const REVIEW_SOURCES={unknown:'Origen no registrado',cex:'Importado de CEX',catastro:'Catastro',estimate:'Estimación de la app',manual:'Edición manual',copied:'Copiado de otro expediente'};

function reviewCanonical(value) {
  if(Array.isArray(value))return '['+value.map(reviewCanonical).join(',')+']';
  if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(key=>JSON.stringify(key)+':'+reviewCanonical(value[key])).join(',')+'}';
  return JSON.stringify(value??null);
}

function reviewValue(data,path) {
  const result={value:data[path]??null};
  if(path.startsWith('envolvente.')||path.startsWith('instalaciones.')) {
    const snapshot=data['cex.nativeInputs'];
    if(snapshot) {
      try {
        const native=JSON.parse(snapshot);
        result.native=path.startsWith('envolvente.')?{inputs:native.inputs?.[2],shadows:native.shadows}:{inputs:native.inputs?.[3],context:native.systemContext};
      } catch {result.native=String(snapshot);}
    }
  }
  return result;
}

async function reviewDigest(data,path) {
  if(!window.crypto?.subtle)throw new Error('La revisión de datos requiere HTTPS o un servidor local seguro.');
  const bytes=new TextEncoder().encode(reviewCanonical(reviewValue(data,path)));
  const digest=await window.crypto.subtle.digest('SHA-256',bytes);
  return Array.from(new Uint8Array(digest),value=>value.toString(16).padStart(2,'0')).join('');
}

function reviewMetadata(data) {
  let meta=data[REVIEW_DATA_KEY];
  if(typeof meta==='string') {try{meta=JSON.parse(meta);}catch{throw new Error('Los datos de revisión guardados no tienen un formato válido.');}}
  if(meta===undefined||meta===null||meta==='')return {schema:1,fields:{}};
  if(meta.schema!==1||!meta.fields||Array.isArray(meta.fields)||typeof meta.fields!=='object')throw new Error('Revisa el formato de la trazabilidad guardada.');
  return structuredClone(meta);
}

async function reviewStatus(data,path) {
  const entry=reviewMetadata(data).fields[path],hash=await reviewDigest(data,path);
  const current=entry?.hash===hash;
  const evidence=entry?.review,validEvidence=evidence&&typeof evidence.by==='string'&&evidence.by.trim()&&typeof evidence.document==='string'&&evidence.document.trim()&&typeof evidence.at==='string'&&Number.isFinite(Date.parse(evidence.at));
  return {hash,source:current&&REVIEW_SOURCES[entry.source]?entry.source:'unknown',
    detail:current?String(entry.detail||''):'',at:current?String(entry.at||''):'',
    checked:!!(current&&evidence?.hash===hash&&validEvidence),
    review:current?entry?.review:null};
}

async function reviewStamp(data,before,paths,sources={},now=new Date().toISOString()) {
  const meta=reviewMetadata(data);
  for(const path of new Set(paths)) {
    if(path===REVIEW_DATA_KEY)continue;
    const hash=await reviewDigest(data,path),oldHash=await reviewDigest(before||{},path),entry=meta.fields[path];
    if(hash===oldHash)continue;
    const proposed=typeof sources[path]==='string'?{source:sources[path]}:sources[path]||{source:'manual'};
    const source=REVIEW_SOURCES[proposed.source]?proposed.source:'unknown';
    meta.fields[path]={hash,source,detail:String(proposed.detail||'').slice(0,240),at:now};
  }
  if(JSON.stringify(meta).length>48000)throw new Error('La trazabilidad supera el espacio disponible. No se ha guardado.');
  data[REVIEW_DATA_KEY]=meta;
  return data;
}

async function reviewCheck(data,path,by,document,now=new Date().toISOString()) {
  by=String(by||'').trim();document=String(document||'').trim();
  if(!by||!document)throw new Error('Indica quién comprueba el dato y el documento o cálculo de referencia.');
  if(by.length>120||document.length>500)throw new Error('Acorta el nombre o la referencia documental.');
  const next=structuredClone(data),meta=reviewMetadata(next),status=await reviewStatus(next,path);
  meta.fields[path]={hash:status.hash,source:status.source,detail:status.detail,at:status.at,
    review:{hash:status.hash,by,document,at:now}};
  if(JSON.stringify(meta).length>48000)throw new Error('La trazabilidad supera el espacio disponible.');
  next[REVIEW_DATA_KEY]=meta;return next;
}

function reviewUncheck(data,path) {
  const next=structuredClone(data),meta=reviewMetadata(next);
  if(meta.fields[path])delete meta.fields[path].review;
  next[REVIEW_DATA_KEY]=meta;return next;
}
