document.addEventListener('DOMContentLoaded', () => {
  const dialog = document.getElementById('reportDialog');
  const form = document.getElementById('reportForm');
  const status = document.getElementById('reportStatus');
  const submit = document.getElementById('generateReportBtn');
  const close = document.getElementById('closeReportBtn');
  let busy = false;
  const staticSite = location.hostname === 'evaristosaa.github.io';
  const cloudEndpoint = 'https://ce3x-pdf-prueba.onrender.com/api/report';
  document.getElementById('reportBtn').addEventListener('click', async () => {
    form.reset(); submit.disabled = true; status.textContent = 'Comprobando el generador…'; dialog.showModal();
    document.getElementById('cloudReportLink').hidden = !staticSite;
    document.getElementById('cloudReportHelp').hidden = !staticSite;
    document.getElementById('cloudReportKey').hidden = !staticSite;
    form.elements.accessKey.required = staticSite;
    if (staticSite) {
      status.textContent = 'Selecciona el XML e introduce la clave para generar el PDF.';
      submit.disabled = false;
      return;
    }
    try {
      const response = await fetch('/api/report/status');
      if (!response.ok) throw new Error('Para generar el PDF, abre la app con su servidor local. Esta función no está disponible en la web estática.');
      const result = await response.json(); status.textContent = result.message;
      submit.disabled = !result.available;
    } catch (error) { status.textContent = error.message; }
  });
  dialog.addEventListener('close', () => { form.elements.accessKey.value = ''; });
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
      const headers = {'Content-Type': 'application/xml'};
      if (staticSite) headers.Authorization = 'Bearer ' + form.elements.accessKey.value.trim();
      const response = await fetch(staticSite ? cloudEndpoint : '/api/report', {
        method: 'POST', headers, body: file, redirect: 'error',
        signal: AbortSignal.timeout(240000)
      });
      if (!response.ok) {
        let message = 'No se ha podido generar el informe.';
        try { message = (await response.json()).error || message; } catch {}
        throw new Error(message);
      }
      const pdf = await response.blob();
      if (await pdf.slice(0, 5).text() !== '%PDF-') {
        throw new Error('El generador no ha devuelto un PDF válido.');
      }
      const name = file.name.replace(/\.xml$/i,'') + '.pdf';
      downloadBlob(pdf,name);
      status.textContent = 'PDF generado y descargado: ' + name + '. Se ha utilizado el módulo oficial de CE3X.';
    } catch (error) {
      status.textContent = staticSite && error instanceof TypeError
        ? 'No se pudo conectar con Render. Puedes reintentar o abrir el generador web.'
        : error.message;
    }
    finally { busy = false; submit.disabled = false; close.disabled = false; }
  });
});
