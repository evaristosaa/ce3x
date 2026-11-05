document.addEventListener('DOMContentLoaded',()=>{
  const dialog=document.querySelector('#referencesDialog'),form=document.querySelector('#referencesForm');
  const input=document.querySelector('#referenceListInput'),status=document.querySelector('#referencesStatus');
  const save=document.querySelector('#saveReferencesBtn'),close=document.querySelector('#closeReferencesBtn');
  let current=null,busy=false;
  document.querySelector('#sectionFields').addEventListener('click',event=>{
    if(!event.target.closest('[data-open-references]'))return;
    try {
      current=selectedRecordWithCurrentFormData();if(!current)return;
      input.value=cex32ReferenceList(current.data).join('\n');status.textContent='';dialog.showModal();
    } catch(error){alert(error.message);}
  });
  close.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('cancel',event=>{if(busy)event.preventDefault();});
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(busy)return;
    try {
      let references=input.value.replace(/\r/g,'').split('\n').map(value=>value.trim());
      while(references.length&&!references[references.length-1])references.pop();
      // Keep leading/intermediate blanks for validation; never promote an extra implicitly.
      if(!input.value.trim())references=[];
      busy=true;save.disabled=true;close.disabled=true;input.disabled=true;
      status.textContent='Guardando referencias del expediente…';
      if(state.config.apiUrl) {
        const schema=await api({action:'schemaStatus'});
        if(schema.result?.referenceWriteVersion!==1)throw new Error('Actualiza el servicio de guardado con el Code.gs de esta versión antes de cambiar las referencias.');
      }
      const template=current.data['cex.nativeInputs']?'':await loadCex32Template();
      const data=cex32SetReferences(current.data,references,template);
      if(selectedRecord()?.id!==current.id)throw new Error('El expediente seleccionado ha cambiado. Vuelve a abrir sus referencias.');
      const paths=Array.from(new Set(activeSectionPaths().concat('cex.nativeInputs','admin.localizacion.referenciaCatastral')));
      const saved=await persistRecordPatch({...current,data},paths);
      addChatMessage('assistant','Guardadas '+references.length+' referencias en '+recordLabel(saved)+'.');
      dialog.close();
    } catch(error){status.textContent='No se ha confirmado el guardado: '+sheetErrorHelp(error);}
    finally{busy=false;save.disabled=false;close.disabled=false;input.disabled=false;}
  });
});
