/* Component properties only, contrasted with installed CE3X 3.2 classes. */
const WINDOW_GLASS={'Simple':[5.7,.82],'Doble':[3.3,.75],'Doble bajo emisivo':[2.7,.65]};
const WINDOW_FRAME={'Metálico sin RPT':5.7,'Metálico con RPT':4,'PVC':2.2,'Madera':2.2};
function windowNumber(value,label,max=Infinity,positive=false) {
  const text=String(value??'').trim().replace(',','.'),n=Number(text);
  if(typeof value==='boolean'||!text||!Number.isFinite(n)||n<0||n>max||(positive&&n===0))throw new Error('Revisa '+label+'.');
  return n;
}
function windowCalculate(settings,percent=20,absorption=.3) {
  if(settings?.schema!==1||typeof settings.dobleVentana!=='boolean')throw new Error('Revisa el formato de las propiedades térmicas.');
  let ug,g,uf;
  if(settings.mode==='Estimadas') {
    if(!Object.hasOwn(WINDOW_GLASS,settings.tipoVidrio)||!Object.hasOwn(WINDOW_FRAME,settings.tipoMarco))throw new Error('Selecciona el tipo de vidrio y marco en Propiedades térmicas.');
    [ug,g]=WINDOW_GLASS[settings.tipoVidrio];uf=WINDOW_FRAME[settings.tipoMarco];
  }else if(settings.mode==='Conocidas') {
    ug=windowNumber(settings.uVidrio,'U del vidrio',Infinity,true);g=windowNumber(settings.gVidrio,'g del vidrio',1);uf=windowNumber(settings.uMarco,'U del marco',Infinity,true);
  }else throw new Error('Elige propiedades Conocidas o Estimadas para el hueco.');
  if(settings.dobleVentana){ug=1/(1/ug+.18);uf=1/(1/uf+.18);g*=.82;}
  const p=windowNumber(percent,'el porcentaje de marco',100)/100,a=windowNumber(absorption,'la absortividad del marco',1);
  if(p===1){ug=0;g=0;}
  return {uVidrio:ug,gVidrio:g,uMarco:uf,uHueco:(1-p)*ug+p*uf,fsHueco:(1-p)*g+.04*uf*p*a};
}
function windowNativeSettings(item) {
  const known=/\.HuecoConocidas$/.test(item?.__cexClass||''),estimated=/\.HuecoEstimadas$/.test(item?.__cexClass||'');
  if(!known&&!estimated)throw new Error('El formato térmico importado necesita revisión en CE³X.');
  return {schema:1,mode:known?'Conocidas':'Estimadas',dobleVentana:!!item.dobleVentana,
    uVidrio:item.UvidrioConocido??(item.dobleVentana?'':item.Uvidrio),gVidrio:item.GvidrioConocido??(item.dobleVentana?'':item.Gvidrio),uMarco:item.UmarcoConocido??(item.dobleVentana?'':item.Umarco),
    tipoVidrio:item.tipoVidrio||'',tipoMarco:item.tipoMarco||''};
}
function windowRowSettings(data,row) {
  if(row.propiedadesTermicas){try{return JSON.parse(row.propiedadesTermicas);}catch{throw new Error('No se pueden recuperar las propiedades térmicas guardadas.');}}
  const item=solarNativeItem(data,row);
  if(item)return windowNativeSettings(item);
  return {schema:1,mode:/^estimad/i.test(row.modoDefinicion||'')?'Estimadas':'Conocidas',dobleVentana:false,uVidrio:row.uVidrio??'',gVidrio:row.gVidrio??'',uMarco:row.uMarco??'',tipoVidrio:'',tipoMarco:''};
}
function windowApply(item,settings,row) {
  const values=windowCalculate(settings,row.porcMarco,row.absortividadMarco),next=structuredClone(item);
  next.__cexClass='Envolvente.objetosEnvolvente.Hueco'+settings.mode;next.__tipo__='Hueco'+settings.mode;next.dobleVentana=settings.dobleVentana;
  Object.assign(next,{Uvidrio:values.uVidrio,Gvidrio:values.gVidrio,Umarco:values.uMarco});
  if(settings.mode==='Conocidas') {
    for(const [key,value] of [['UvidrioConocido',settings.uVidrio],['GvidrioConocido',settings.gVidrio],['UmarcoConocido',settings.uMarco]])next[key]=String(value).trim().replace(',','.');
    next.vidrioSeleccionado='';next.marcoSeleccionado='';delete next.tipoVidrio;delete next.tipoMarco;
  }else {
    next.tipoVidrio=settings.tipoVidrio;next.tipoMarco=settings.tipoMarco;
    for(const key of ['UvidrioConocido','GvidrioConocido','UmarcoConocido','vidrioSeleccionado','marcoSeleccionado'])delete next[key];
  }
  return next;
}
function windowStore(data,rowIndex,settings) {
  const next=structuredClone(data),rows=cex32Table({data:next},'envolvente.huecos.items'),row=rows[rowIndex];
  if(!row)throw new Error('No se puede identificar el hueco.');
  const values=windowCalculate(settings,row.porcMarco,row.absortividadMarco);
  Object.assign(row,{propiedadesTermicas:JSON.stringify(settings),modoDefinicion:settings.mode,uVidrio:String(values.uVidrio),gVidrio:String(values.gVidrio),uMarco:String(values.uMarco)});
  next['envolvente.huecos.items']=rows;return next;
}
function windowOverlay(data,items,rows,originals) {
  rows.forEach((row,index)=>{
    const original=originals?.find(old=>row.__cexSource&&old.__cexSource===row.__cexSource);
    const keys=['uVidrio','gVidrio','uMarco','modoDefinicion','porcMarco','absortividadMarco'];
    const changed=!original||keys.some(key=>row[key]!==undefined&&String(row[key])!==String(original[key]??''));
    if(!row.propiedadesTermicas&&!changed)return;
    if(!original&&!row.propiedadesTermicas&&row.modoDefinicion!=='Conocidas')throw new Error('Define los huecos nuevos desde Propiedades térmicas antes de exportar.');
    const settings=windowRowSettings(data,row);
    if(!row.propiedadesTermicas&&original) {
      if(settings.mode==='Estimadas'||settings.dobleVentana||row.modoDefinicion!==original.modoDefinicion||['porcMarco','absortividadMarco'].some(key=>cex32NumericChanged(row[key],original[key])))throw new Error('Edita el tipo de vidrio, marco, doble ventana y modo desde Propiedades térmicas.');
      settings.uVidrio=row.uVidrio;settings.gVidrio=row.gVidrio;settings.uMarco=row.uMarco;
    }
    if(row.propiedadesTermicas) {
      const v=windowCalculate(settings,row.porcMarco,row.absortividadMarco);
      if(row.modoDefinicion!==settings.mode||['uVidrio','gVidrio','uMarco'].some(key=>Math.abs(windowNumber(row[key],key)-v[key])>1e-10))throw new Error('Las propiedades del hueco han cambiado fuera del editor. Revisa Propiedades térmicas antes de exportar.');
    }
    items[index]=windowApply(items[index],settings,row);
  });
}
