document.addEventListener('DOMContentLoaded',()=>{
  const dialog=document.querySelector('#solarDialog'),form=document.querySelector('#solarForm');
  const selector=document.querySelector('#solarWindow'),fields=document.querySelector('#solarFields');
  const status=document.querySelector('#solarStatus'),preview=document.querySelector('#solarPreview'),save=document.querySelector('#saveSolarBtn');
  let current=null,rows=[],busy=false,supported=false;
  const selected=()=>rows[Number(selector.value)];
  function read() {
    const settings=solarBlank();
    for(const kind of ['overhang','recess']) {
      settings[kind].enabled=fields.querySelector('[data-enabled="'+kind+'"]').checked;
      for(const input of fields.querySelectorAll('[data-kind="'+kind+'"]'))settings[kind][input.dataset.dimension]=input.value;
    }
    return settings;
  }
  function update() {
    if(!supported)return;
    for(const kind of ['overhang','recess']) {
      const enabled=fields.querySelector('[data-enabled="'+kind+'"]').checked;
      fields.querySelectorAll('[data-kind="'+kind+'"]').forEach(input=>{input.disabled=!enabled;});
    }
    try {
      const result=solarCalculate(read(),selected().orientacion);
      preview.textContent='Factores solares: CTE '+result.cte.toFixed(4)+' · invierno '+result.winter.toFixed(4)+' · verano '+result.summer.toFixed(4);
      save.disabled=busy;
    }catch(error){preview.textContent=error.message;save.disabled=true;}
  }
  function show() {
    fields.innerHTML='';preview.textContent='';supported=false;save.disabled=true;
    const row=selected();if(!row)return;
    document.querySelector('#solarOrientation').textContent='Orientación: '+(cexWallOrientation(row.orientacion)||'pendiente de indicar en la tabla');
    try {
      const native=solarNativeItem(current.data,row);if(native)solarNativeSettings(native);
      const settings=solarRowSettings(current.data,row);
      if(settings.schema!==1)throw new Error('Formato de protección solar desconocido.');
      for(const [kind,title,dimensions] of [['overhang','Voladizo',{L:'Longitud L',D:'Distancia vertical D',H:'Altura H'}],['recess','Retranqueo',{H:'Altura H',W:'Anchura W',R:'Profundidad R'}]]) {
        const p=settings[kind];if(!p||typeof p.enabled!=='boolean')throw new Error('Revisa el formato de las protecciones guardadas.');
        fields.insertAdjacentHTML('beforeend','<fieldset><legend>'+title+'</legend><label class="solar-enabled"><input type="checkbox" data-enabled="'+kind+'" '+(p.enabled?'checked':'')+'>Activar '+title.toLowerCase()+'</label><div class="solar-dimensions">'+Object.entries(dimensions).map(([key,label])=>'<label>'+label+' (m)<input inputmode="decimal" data-kind="'+kind+'" data-dimension="'+key+'" value="'+escapeHtml(p[key]??'')+'"></label>').join('')+'</div></fieldset>');
      }
      supported=true;update();
    }catch(error){fields.textContent=error.message;}
  }
  document.querySelector('#sectionFields').addEventListener('click',event=>{
    if(!event.target.closest('[data-open-solar]'))return;
    try {
      current=selectedRecordWithCurrentFormData();if(!current)return;
      rows=cex32Table(current,'envolvente.huecos.items');
      selector.innerHTML=rows.map((row,index)=>'<option value="'+index+'">'+escapeHtml(row.nombre||'Hueco '+(index+1))+'</option>').join('');
      status.textContent=rows.length?'':'Añade primero un hueco en la tabla.';show();dialog.showModal();
    }catch(error){alert(error.message);}
  });
  selector.addEventListener('change',()=>{status.textContent='';show();});fields.addEventListener('input',update);
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(busy||!supported)return;
    try {
      const settings=read();solarCalculate(settings,selected().orientacion);
      if(selectedRecord()?.id!==current.id)throw new Error('El expediente ha cambiado. Vuelve a abrir las protecciones.');
      busy=true;dialog.querySelectorAll('button,input,select').forEach(el=>{el.disabled=true;});status.textContent='Guardando protecciones…';
      const data=structuredClone(current.data),next=structuredClone(rows);
      next[Number(selector.value)].proteccionSolar=JSON.stringify(settings);
      data['envolvente.huecos.items']=next;
      current=await persistRecordPatch({...current,data},Array.from(new Set([...activeSectionPaths(),'envolvente.huecos.items'])));
      rows=cex32Table(current,'envolvente.huecos.items');renderAll();status.textContent='Protecciones guardadas. Sus factores se aplicarán al exportar el CEX.';
    }catch(error){status.textContent='No se ha confirmado el guardado: '+sheetErrorHelp(error);}
    finally{busy=false;dialog.querySelectorAll('button,input,select').forEach(el=>{el.disabled=false;});show();}
  });
  document.querySelector('#closeSolarBtn').addEventListener('click',()=>{if(!busy)dialog.close();});
  dialog.addEventListener('cancel',event=>{if(busy)event.preventDefault();});
});
