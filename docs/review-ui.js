document.addEventListener('DOMContentLoaded',()=>{
  const dialog=document.querySelector('#reviewDialog'),list=document.querySelector('#reviewList');
  const form=document.querySelector('#reviewCheckForm'),status=document.querySelector('#reviewStatus');
  const by=document.querySelector('#reviewBy'),documentInput=document.querySelector('#reviewDocument'),attested=document.querySelector('#reviewAttested');
  let current=null,selectedPath='',busy=false,items=[];
  const label=item=>item.sectionLabel+' · '+item.groupLabel+' · '+item.label;
  async function render() {
    const statuses=await Promise.all(items.map(async item=>({item,info:await reviewStatus(current.data,item.path)})));
    document.querySelector('#reviewSummary').textContent=statuses.filter(row=>row.info.checked).length+' de '+statuses.length+' campos o tablas comprobados para sus valores actuales.';
    list.innerHTML=statuses.map(({item,info})=>'<button type="button" class="review-entry" data-review-path="'+escapeHtml(item.path)+'"><strong>'+escapeHtml(label(item))+'</strong><span>'+escapeHtml(REVIEW_SOURCES[info.source])+'</span><span class="review-state">'+(info.checked?'Comprobado':'Pendiente de comprobación')+'</span></button>').join('');
  }
  document.querySelector('#reviewDataBtn').addEventListener('click',async()=>{
    try {
      const record=selectedRecordWithCurrentFormData();if(!record)return;
      current=normalizeRecord(record);
      items=FLAT_FIELDS.filter(item=>hasValue(current.data[item.path])&&(!Array.isArray(current.data[item.path])||current.data[item.path].length));
      selectedPath='';form.hidden=true;status.textContent='';dialog.showModal();await render();
    }catch(error){status.textContent=error.message;}
  });
  list.addEventListener('click',async event=>{
    const button=event.target.closest('[data-review-path]');if(!button||busy)return;
    try {
      selectedPath=button.dataset.reviewPath;const item=items.find(item=>item.path===selectedPath);
      const info=await reviewStatus(current.data,selectedPath),value=current.data[selectedPath];
      document.querySelector('#reviewFieldTitle').textContent=label(item);
      document.querySelector('#reviewValuePreview').textContent=item.type==='image'?'Imagen del expediente':Array.isArray(value)?value.length+' filas. Revisa la tabla completa en su sección.':String(value).slice(0,400);
      document.querySelector('#reviewFieldEvidence').textContent=info.checked?'Comprobado por '+info.review.by+' el '+info.review.at+'. Referencia: '+info.review.document:REVIEW_SOURCES[info.source]+(info.detail?' · '+info.detail:'')+(info.at?' · '+info.at:'')+'. Pendiente de comprobación.';
      by.value=info.review?.by||by.value;documentInput.value=info.review?.document||'';attested.checked=false;form.hidden=false;status.textContent='';
    }catch(error){status.textContent=error.message;}
  });
  async function save(check) {
    if(busy||!selectedPath)return;
    const path=selectedPath;
    try {
      busy=true;dialog.querySelectorAll('button,input').forEach(el=>el.disabled=true);status.textContent='Guardando revisión…';
      if(selectedRecord()?.id!==current.id)throw new Error('El expediente ha cambiado. Vuelve a abrir su revisión.');
      const data=structuredClone(current.data),paths=activeSectionPaths();
      await reviewStamp(data,selectedRecord().data,paths);
      const reviewed=check?await reviewCheck(data,path,by.value,documentInput.value):reviewUncheck(data,path);
      const saved=await persistRecordPatch({...current,data:reviewed},paths.concat(REVIEW_DATA_KEY),{reviewPrepared:true});
      current=saved;await render();form.hidden=true;selectedPath='';status.textContent=check?'Comprobación guardada para el valor actual.':'El dato vuelve a estar pendiente de comprobación.';
    }catch(error){status.textContent='No se ha confirmado el guardado: '+sheetErrorHelp(error);}
    finally{busy=false;dialog.querySelectorAll('button,input').forEach(el=>el.disabled=false);}
  }
  form.addEventListener('submit',event=>{event.preventDefault();if(attested.checked)save(true);});
  document.querySelector('#reviewUncheckBtn').addEventListener('click',()=>save(false));
  document.querySelector('#closeReviewBtn').addEventListener('click',()=>{if(!busy)dialog.close();});
  dialog.addEventListener('cancel',event=>{if(busy)event.preventDefault();});
});
