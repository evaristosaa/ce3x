document.addEventListener('DOMContentLoaded',()=>{
  const dialog=document.querySelector('#estimationDialog'), form=document.querySelector('#estimationForm');
  const selector=document.querySelector('#estimationEquipment'), fields=document.querySelector('#estimationFields');
  const status=document.querySelector('#estimationStatus'), calculate=document.querySelector('#calculateEstimationBtn');
  const save=document.querySelector('#saveEstimationBtn'), close=document.querySelector('#closeEstimationBtn');
  let current=null, groups=[], available=false, busy=false, revision=0;
  const labels={rendCombCaldera:'Rendimiento de combustión (%)',potenciaCaldera:'Potencia nominal de caldera (kW)',cargaMediaCaldera:'Carga media (fracción de 0 a 1)',
    rendNominalACS:'Rendimiento nominal de ACS (%)',rendNominalCal:'Rendimiento nominal de calefacción (%)',rendNominalRef:'Rendimiento nominal de refrigeración (%)'};
  const selected=()=>groups.find(item=>item.id===selector.value);
  function showFields() {
    const group=selected();fields.innerHTML='';
    if(!group) {save.disabled=true;calculate.disabled=true;return;}
    save.disabled=!group.parameters;calculate.disabled=!available||!group.parameters;
    if(!group.parameters) {fields.textContent=group.reason;return;}
    const parameters=group.draft?.parameters || group.parameters;
    for(const [key,value] of Object.entries(parameters)) {
      if(key==='aislanteCaldera') {
        const options=['Sin aislamiento','Antigua con mal aislamiento','Antigua con aislamiento medio','Bien aislada y mantenida'];
        if(!options.includes(value)) options.unshift(value);
        fields.insertAdjacentHTML('beforeend','<label>Aislamiento de la caldera<select data-param="'+key+'">'+options.map(option=>'<option '+(option===value?'selected':'')+'>'+escapeHtml(option)+'</option>').join('')+'</select></label>');
      } else if(key in labels) fields.insertAdjacentHTML('beforeend','<label>'+labels[key]+'<input data-param="'+key+'" inputmode="decimal" value="'+escapeHtml(value)+'" required></label>');
    }
    const note=document.createElement('p');note.className='dialog-help';
    note.textContent=group.raw[3]==='Caldera Estándar'?'Se conservan las características y la acumulación de la caldera importada.':'Se conservan la antigüedad, las potencias y las características del equipo importado. Esta primera integración no modifica el escalonamiento.';
    fields.appendChild(note);
    const receipt=group.draft?.receipt;
    if(receipt) {
      const valid=receipt.signature===estimationSignature(current.data,group,parameters);
      const summary=document.createElement('p');summary.className='estimation-result';
      summary.textContent=valid?'Cálculo guardado: '+Object.entries(receipt.values).map(([name,value])=>name+' '+value+' %').join(' · '):'El cálculo guardado está desactualizado. Recalcula antes de exportar.';
      fields.appendChild(summary);
    } else if(group.draft) {
      const summary=document.createElement('p');summary.className='estimation-result';summary.textContent='Borrador de parámetros guardado. Los cambios necesitan recálculo antes de exportar.';fields.appendChild(summary);
    }
  }
  function readParameters() {
    const group=selected();if(!group?.parameters) throw new Error('Selecciona un equipo con parámetros disponibles.');
    const parameters=structuredClone(group.draft?.parameters || group.parameters);
    for(const input of fields.querySelectorAll('[data-param]')) {
      const key=input.dataset.param, text=input.value.trim();
      if(!text) throw new Error('Completa todos los parámetros antes de guardar.');
      parameters[key]=key==='aislanteCaldera'?text:Number(text.replace(',','.'));
      if(typeof parameters[key]==='number' && (!Number.isFinite(parameters[key])||parameters[key]<=0||(key==='cargaMediaCaldera'&&parameters[key]>1)||(key==='rendCombCaldera'&&parameters[key]>100))) throw new Error('Revisa '+labels[key].toLowerCase()+'.');
    }
    return parameters;
  }
  function lock(value) {busy=value;selector.disabled=value;fields.disabled=value;save.disabled=value||!selected()?.parameters;calculate.disabled=value||!available||!selected()?.parameters;close.disabled=value;}
  async function persist(data,message) {
    if(selectedRecord()?.id!==current.id) throw new Error('El expediente seleccionado ha cambiado. Vuelve a abrir sus parámetros.');
    const saved=await persistRecordPatch({...current,data},systemsDataPaths());
    current=saved;groups=estimationGroups(saved.data);renderAll();showFields();status.textContent=message;
  }
  document.querySelector('#sectionFields').addEventListener('click',async event=>{
    if(!event.target.closest('[data-open-estimation]')) return;
    try {
      current=selectedRecordWithCurrentFormData();if(!current) return;
      groups=estimationGroups(current.data);available=false;
      selector.innerHTML=groups.map(group=>'<option value="'+escapeHtml(group.id)+'">'+escapeHtml(group.members[0].row.nombre||group.raw[0])+' · '+escapeHtml(group.raw[3])+'</option>').join('');
      status.textContent=groups.length?'Comprobando disponibilidad del módulo local…':'No hay equipos estimados importados. La creación de instalaciones estimadas nuevas aún requiere completar sus parámetros en CE³X.';
      selector.disabled=!groups.length;
      showFields();dialog.showModal();
      const token=++revision;
      if(!groups.length) return;
      try {
        const response=await fetch('/api/estimation/status');
        if(!response.ok) throw new Error('El recálculo requiere abrir la app con su servidor local de Windows y CE³X 3.2 instalado. Puedes guardar los parámetros como borrador.');
        const result=await response.json();if(token!==revision)return;
        available=result.available===true;status.textContent=result.message;
      } catch(error) {if(token===revision)status.textContent=error.message;}
      calculate.disabled=!available||!selected()?.parameters;
    } catch(error) {status.textContent=error.message;if(!dialog.open)alert(error.message);}
  });
  selector.addEventListener('change',()=>{
    showFields();status.textContent=available?'Módulo oficial local disponible. Revisa los parámetros del equipo seleccionado.':'Puedes guardar los parámetros. El recálculo requiere el servidor local de Windows con CE³X 3.2.';
  });
  close.addEventListener('click',()=>{revision++;dialog.close();});
  dialog.addEventListener('cancel',event=>{if(busy)event.preventDefault();else revision++;});
  save.addEventListener('click',async()=>{
    try {const group=selected(),parameters=readParameters();lock(true);await persist(estimationStore(current.data,group.id,parameters),'Parámetros guardados. Recalcula los cambios antes de exportar.');}
    catch(error){status.textContent='No se ha confirmado el guardado: '+error.message;}
    finally{lock(false);}
  });
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    try {
      const group=selected(), parameters=readParameters(), request=estimationRequest(current.data,group,parameters);
      lock(true);status.textContent='Calculando rendimientos con el módulo oficial de CE³X 3.2…';
      const response=await fetch('/api/estimation',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(request)});
      const result=await response.json();if(!response.ok)throw new Error(result.error||'No se ha podido recalcular la instalación.');
      await persist(estimationStore(current.data,group.id,parameters,result),'Rendimientos recalculados y guardados. El cálculo completo y la calificación del edificio se realizan por separado.');
    }catch(error){status.textContent=error.message;}
    finally{lock(false);}
  });
});
