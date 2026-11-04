document.addEventListener('DOMContentLoaded', () => {
  const dialog = document.getElementById('reportDialog');
  const form = document.getElementById('reportForm');
  const status = document.getElementById('reportStatus');
  const submit = document.getElementById('generateReportBtn');
  const close = document.getElementById('closeReportBtn');
  let busy = false;
  document.getElementById('reportBtn').addEventListener('click', async () => {
    form.reset(); submit.disabled = true; status.textContent = 'Comprobando el generador…'; dialog.showModal();
    const staticSite = location.hostname.endsWith('.github.io');
    document.getElementById('cloudReportLink').hidden = !staticSite;
    document.getElementById('cloudReportHelp').hidden = !staticSite;
    form.elements.xmlFile.closest('label').hidden = staticSite;
    submit.hidden = staticSite;
    if (staticSite) {
      status.textContent = 'Utiliza el generador web para convertir tu XML en PDF. El archivo se seleccionará en esa página.';
      return;
    }
    try {
      const response = await fetch('/api/report/status');
      if (!response.ok) throw new Error('Para generar el PDF, abre la app con su servidor local. Esta función no está disponible en la web estática.');
      const result = await response.json(); status.textContent = result.message;
      submit.disabled = !result.available;
    } catch (error) { status.textContent = error.message; }
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('cancel', event => { if (busy) event.preventDefault(); });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const file = form.elements.xmlFile.files[0];
    if (!file) { status.textContent = 'Selecciona el XML generado por CE3X.'; return; }
    if (file.size > 12 * 1024 * 1024) { status.textContent = 'El XML supera el límite de 12 MB.'; return; }
    busy = true; submit.disabled = true; close.disabled = true;
    status.textContent = 'Validando el XML y generando el PDF. Puede tardar hasta dos minutos…';
    try {
      const response = await fetch('/api/report', {method:'POST',headers:{'Content-Type':'application/xml'},body:await file.arrayBuffer()});
      if (!response.ok) {
        let message = 'No se ha podido generar el informe.';
        try { message = (await response.json()).error || message; } catch {}
        throw new Error(message);
      }
      const pdf = await response.blob();
      const name = file.name.replace(/\.xml$/i,'') + '.pdf';
      downloadBlob(pdf,name);
      status.textContent = 'PDF generado y descargado: ' + name + '. Se ha utilizado el módulo oficial de CE3X.';
    } catch (error) { status.textContent = error.message; }
    finally { busy = false; submit.disabled = false; close.disabled = false; }
  });
});
