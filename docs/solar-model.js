/* Local browser calculation for overhangs and recesses, contrasted against CE3X 3.2. */
function solarNumber(value,label,positive=false) {
  const text=String(value??'').trim().replace(',','.');
  const n=Number(text);
  if(typeof value==='boolean'||!text||!Number.isFinite(n)||n<0||(positive&&n===0))throw new Error('Revisa '+label+'.');
  return n;
}

function solarGroup(orientation) {
  const value=cexWallOrientation(orientation);
  if(['Norte','NE','NO'].includes(value))return 'north';
  if(value==='Sur')return 'Sur';
  if(['SE','SO'].includes(value))return 'SE';
  if(['Este','Oeste'].includes(value))return 'Este';
  throw new Error('Las protecciones de voladizo y retranqueo necesitan una orientación de fachada válida.');
}

function solarBin(value,limits) {
  const index=limits.findIndex(limit=>value<=limit);
  return index<0?limits.length:index;
}

function solarComponent(kind,parameters,orientation) {
  const group=solarGroup(orientation);
  let row,column;
  if(kind==='overhang') {
    const L=solarNumber(parameters.L,'la longitud L del voladizo'),H=solarNumber(parameters.H,'la altura H del voladizo',true),D=solarNumber(parameters.D,'la distancia D del voladizo');
    if(group==='north'||L/H<.2)return [1,1,1];
    row=solarBin(D/H,[.2,.5]);column=solarBin(L/H,[.5,1,2]);
  }else if(kind==='recess') {
    const R=solarNumber(parameters.R,'la profundidad R del retranqueo'),H=solarNumber(parameters.H,'la altura H del retranqueo',true),W=solarNumber(parameters.W,'la anchura W del retranqueo',true);
    if(group==='north'||R/H<=.05||R/W<=.05)return [1,1,1];
    row=solarBin(R/H,[.1,.2,.5]);column=solarBin(R/W,[.1,.2,.5]);
  }else throw new Error('Protección solar no compatible con este cálculo.');
  return SOLAR_TABLES[kind][group][row][column].slice();
}

function solarCalculate(settings,orientation) {
  if(!settings||settings.schema!==1)throw new Error('Revisa el formato de las protecciones solares.');
  const parts=[];
  for(const kind of ['overhang','recess']) {
    const p=settings[kind];
    if(!p||typeof p.enabled!=='boolean')throw new Error('Indica qué protecciones solares están activas.');
    if(p.enabled)parts.push(solarComponent(kind,p,orientation));
  }
  return {cte:parts.reduce((value,p)=>value*p[0],1),winter:parts.reduce((value,p)=>value*p[1],1),summer:Math.min(1,...parts.map(p=>p[2]))};
}

function solarBlank() {
  return {schema:1,overhang:{enabled:false,L:'',H:'',D:''},recess:{enabled:false,R:'',H:'',W:''}};
}

function solarNativeSettings(item) {
  const p=item?.elementosProteccionSolar;
  if(!Array.isArray(p)||![25,28].includes(p.length))throw new Error('La protección importada necesita revisión en CE³X antes de editarla aquí.');
  if(p.slice(19,24).some(value=>!!value)||p.length===28&&p[25])throw new Error('Este hueco tiene lamas, toldos, lucernarios, correctores personalizados o persianas. Se conservan sus datos; su edición aún requiere CE³X.');
  if(!Array.isArray(p[6])||!Array.isArray(p[7])||!Array.isArray(p[24]))throw new Error('La protección importada no tiene el formato esperado.');
  if(!p[17]&&p.slice(0,3).some(value=>String(value??'').trim())||!p[18]&&p.slice(3,6).some(value=>String(value??'').trim()))throw new Error('Hay geometrías solares importadas sin activación coherente. Revísalas en CE³X antes de cambiarlas.');
  // Inactive devices with stored geometry are also protected: the native function reads dimensions.
  if(p[6][0]!==''||p[7][0]!==''||p.slice(8,17).some(value=>value!==''&&value!==0&&value!==false)||p[24].some(value=>String(value??'').trim()))throw new Error('Hay parámetros solares adicionales importados que deben revisarse en CE³X.');
  return {schema:1,overhang:{enabled:!!p[17],L:p[0],D:p[1],H:p[2]},recess:{enabled:!!p[18],H:p[3],W:p[4],R:p[5]}};
}

function solarNativeItem(data,row) {
  if(!data['cex.nativeInputs'])return null;
  const native=JSON.parse(data['cex.nativeInputs']),match=String(row.__cexSource||'').match(/^e:1:(\d+)$/);
  if(!match)return null;
  const item=native.inputs?.[2]?.[1]?.[Number(match[1])];
  if(!item)throw new Error('No se puede identificar el hueco nativo. Vuelve a importar el expediente.');
  return item;
}

function solarRowSettings(data,row) {
  if(row.proteccionSolar) {
    try{return JSON.parse(row.proteccionSolar);}catch{throw new Error('No se pueden recuperar las protecciones guardadas del hueco.');}
  }
  const native=solarNativeItem(data,row);
  return native?solarNativeSettings(native):solarBlank();
}

function solarTargetFactors(data,row,settings) {
  try {
    const native=solarNativeItem(data,row);
    if(native)solarNativeSettings(native);
    return solarCalculate(settings,row.orientacion);
  }catch(error){
    throw new Error((row.nombre||'Hueco sin nombre')+' / '+error.message);
  }
}

function solarStoreMany(data,rows,indices,settings) {
  for(const index of indices)solarTargetFactors(data,rows[index],settings);
  const next=structuredClone(rows);
  const value=JSON.stringify(settings);
  for(const index of indices)next[index].proteccionSolar=value;
  return {...data,'envolvente.huecos.items':next};
}

function solarApply(item,settings,orientation) {
  if(item.elementosProteccionSolar)solarNativeSettings(item);
  const factors=solarCalculate(settings,orientation),next=structuredClone(item);
  const p=Array.isArray(next.elementosProteccionSolar)?next.elementosProteccionSolar.slice():['','','','','','',['',0,0],['',0,0],'',0,0,'',0,0,'','','',false,false,false,false,false,false,false,['','']];
  if(![25,28].includes(p.length))throw new Error('No se pueden cambiar protecciones con formato nativo desconocido.');
  const a=settings.overhang,b=settings.recess;
  p[0]=a.enabled?String(solarNumber(a.L,'L')):'';p[1]=a.enabled?String(solarNumber(a.D,'D')):'';p[2]=a.enabled?String(solarNumber(a.H,'H',true)):'';
  p[3]=b.enabled?String(solarNumber(b.H,'H',true)):'';p[4]=b.enabled?String(solarNumber(b.W,'W',true)):'';p[5]=b.enabled?String(solarNumber(b.R,'R')):'';
  p[17]=a.enabled;p[18]=b.enabled;
  next.elementosProteccionSolar=p;next.tieneProteccionSolar=a.enabled||b.enabled;
  next.orientacion=cexWallOrientation(orientation);next.correctorSolar=next.orientacion;
  next.correctorFSCTE=factors.cte;next.correctorFSInvierno=factors.winter;next.correctorFSVerano=factors.summer;
  return next;
}

function solarOverlay(data,windows,rows,originals) {
  rows.forEach((row,index)=>{
    const item=windows[index],original=originals?.find(old=>old.__cexSource===row.__cexSource);
    const orientation=cexWallOrientation(row.orientacion??item.orientacion);
    const orientationChanged=orientation!==item.orientacion||original&&orientation!==original.orientacion;
    if(row.proteccionSolar||orientationChanged) {
      // Guard all unsupported imported devices before applying any new factors.
      if(solarNativeItem(data,row))solarNativeSettings(solarNativeItem(data,row));
      const settings=solarRowSettings(data,row);
      windows[index]=solarApply(item,settings,orientation);
    }
  });
}
