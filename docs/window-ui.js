document.addEventListener('DOMContentLoaded',()=>{
  const dialog=document.querySelector('#windowDialog'),form=document.querySelector('#windowForm'),selector=document.querySelector('#windowSelector');
  const mode=document.querySelector('#windowMode'),double=document.querySelector('#windowDouble'),status=document.querySelector('#windowStatus'),preview=document.querySelector('#windowPreview'),save=document.querySelector('#saveWindowBtn');
  const glass=document.querySelector('#windowGlass'),frame=document.querySelector('#windowFrame');
  let current=null,rows=[],checked=[],busy=false,supported=false;
  const targets=()=>windowEditTargets(selector.value,rows,checked);
  const selected=()=>rows[targets()[0]];
  const rowLabel=index=>rows[index].nombre||'Hueco '+(index+1);
  glass.innerHTML='<option value="">Selecciona vidrio</option>'+Object.keys(WINDOW_GLASS).map(value=>'<option>'+escapeHtml(value)+'</option>').join('');
  frame.innerHTML='<option value="">Selecciona marco</option>'+Object.keys(WINDOW_FRAME).map(value=>'<option>'+escapeHtml(value)+'</option>').join('');
  function read() {
    const settings={schema:1,mode:mode.value,dobleVentana:double.checked,tipoVidrio:glass.value,tipoMarco:frame.value};
    for(const key of ['uVidrio','gVidrio','uMarco'])settings[key]=form.querySelector('[data-window-value="'+key+'"]').value;
    return settings;
  }
  function update() {
    if(!supported){save.disabled=true;return;}
    document.querySelector('#windowKnownFields').hidden=mode.value!=='Conocidas';document.querySelector('#windowEstimatedFields').hidden=mode.value!=='Estimadas';
    if(!selected()){save.disabled=true;return;}
    try {
      const indices=targets(),settings=read();
      const values=indices.map(index=>{
        const row=rows[index];
        try {return windowCalculate(settings,row.porcMarco,row.absortividadMarco);}
        catch(error) {throw new Error(rowLabel(index)+' / '+error.message);}
      });
      const v=values[0];
      if(indices.length>1) {
        preview.textContent='Se actualizarán '+indices.length+' huecos. Se conserva el porcentaje de marco y su absortividad en cada fila.';
        save.disabled=busy;
        return;
      }
      preview.textContent='Valores efectivos: U vidrio '+v.uVidrio.toFixed(4)+' · g vidrio '+v.gVidrio.toFixed(4)+' · U marco '+v.uMarco.toFixed(4)+'. U del hueco '+v.uHueco.toFixed(4)+' W/m²K; factor solar del hueco sin protecciones '+v.fsHueco.toFixed(4)+'.';save.disabled=busy;
    }catch(error){preview.textContent=error.message;save.disabled=true;}
  }
  function show() {
    supported=false;
    if(!selected()){save.disabled=true;preview.textContent='Añade primero un hueco en la tabla.';return;}
    try {
      const settings=windowRowSettings(current.data,selected());
      if(settings.schema!==1||typeof settings.dobleVentana!=='boolean')throw new Error('Revisa el formato de las propiedades térmicas guardadas.');
      mode.value=settings.mode;double.checked=settings.dobleVentana;glass.value=settings.tipoVidrio;frame.value=settings.tipoMarco;
      for(const key of ['uVidrio','gVidrio','uMarco'])form.querySelector('[data-window-value="'+key+'"]').value=settings[key]??'';
      supported=true;update();
    }catch(error){preview.textContent=error.message;save.disabled=true;}
  }
  document.querySelector('#sectionFields').addEventListener('click',event=>{
    const button=event.target.closest('[data-open-window]');
    if(!button)return;
    try {
      current=selectedRecordWithCurrentFormData();if(!current)return;
      rows=cex32Table(current,'envolvente.huecos.items');
      checked=setupWindowEditSelector(selector,button,rows);
      status.textContent='';show();dialog.showModal();
    }catch(error){alert(error.message);}
  });
  document.querySelector('#sectionFields').addEventListener('input',event=>{
    const input=event.target.closest('[data-col="porcMarco"], [data-col="absortividadMarco"]');
    if(input?.closest('[data-table]')?.dataset.table!=='envolvente.huecos.items')return;
    const tr=input.closest('tr'),row={__cexSource:tr.dataset.cexSource,propiedadesTermicas:tr.dataset.thermal};
    for(const field of tr.querySelectorAll('[data-col]'))row[field.dataset.col]=field.value;
    try {
      const settings=windowRowSettings(selectedRecord().data,row),values=windowCalculate(settings,row.porcMarco,row.absortividadMarco);
      tr.dataset.thermal=JSON.stringify(settings);
      for(const key of ['uVidrio','gVidrio','uMarco'])tr.querySelector('[data-col="'+key+'"]').value=String(values[key]);
      tr.querySelector('[data-col="modoDefinicion"]').value=settings.mode;
      input.title='';
    }catch(error){input.title=error.message;}
  });
  selector.addEventListener('change',()=>{status.textContent='';show();});
  form.addEventListener('input',event=>{if(event.target!==selector)update();});
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(busy||!selected()||!supported)return;
    let saved=false;
    try {
      const indices=targets();
      const data=windowStoreMany(current.data,indices,read());
      if(selectedRecord()?.id!==current.id)throw new Error('El expediente ha cambiado. Vuelve a abrir sus propiedades térmicas.');
      busy=true;dialog.querySelectorAll('button,input,select').forEach(el=>{el.disabled=true;});status.textContent='Guardando propiedades…';
      current=await persistRecordPatch({...current,data},Array.from(new Set([...activeSectionPaths(),'envolvente.huecos.items'])));
      rows=cex32Table(current,'envolvente.huecos.items');renderAll();saved=true;status.textContent=indices.length===1 ? 'Propiedades guardadas en un hueco.'
        : 'Propiedades guardadas en '+indices.length+' huecos.';
    }catch(error){status.textContent='No se ha confirmado el guardado: '+sheetErrorHelp(error);}
    finally{busy=false;dialog.querySelectorAll('button,input,select').forEach(el=>{el.disabled=false;});if(saved)show();else update();}
  });
  document.querySelector('#closeWindowBtn').addEventListener('click',()=>{if(!busy)dialog.close();});
  dialog.addEventListener('cancel',event=>{if(busy)event.preventDefault();});
});
