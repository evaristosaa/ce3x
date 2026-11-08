/* Workspace navigation stays independent of capture/export logic. */
function updateWorkspaceSummary(records) {
  const counts = {all:records.length,PENDIENTE_DATOS:0,COMPLETA:0,CERTIFICADO_GENERADO:0};
  records.forEach(record => { const status = displayRecordStatus(record); counts[status] = (counts[status] || 0) + 1; });
  for (const [id, key] of Object.entries({totalCount:'all',progressCount:'PENDIENTE_DATOS',completeCount:'COMPLETA',pdfCount:'CERTIFICADO_GENERADO'})) {
    const element = document.getElementById(id); if (element) element.textContent = counts[key];
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('captureToggle');
  toggle.addEventListener('click', () => {
    const open = document.body.classList.toggle('capture-open');
    toggle.setAttribute('aria-expanded', String(open));
    if (open) document.getElementById('activeRecordSelect').focus();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && document.body.classList.contains('capture-open')) {
      document.body.classList.remove('capture-open'); toggle.setAttribute('aria-expanded','false'); toggle.focus();
    }
  });
  document.getElementById('workspaceHome').addEventListener('click', () => document.getElementById('backToListBtn').click());
  document.getElementById('workspaceSettings').addEventListener('click', () => document.getElementById('configBtn').click());
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    const filter = document.getElementById('statusFilter'); filter.value = button.dataset.filter;
    filter.dispatchEvent(new Event('change', {bubbles:true}));
    document.getElementById('expedientList').scrollIntoView({behavior:'smooth',block:'nearest'});
  }));
});

function loadLocalWorkspace() {
  const raw = localStorage.getItem(LOCAL_KEY);
  if (!raw) return [];
  const records = JSON.parse(raw);
  if (!Array.isArray(records)) throw new Error('Los datos locales no tienen un formato reconocido. Se conservan sin modificar.');
  return records.map(normalizeRecord);
}

function saveLocalWorkspace(record) {
  const records = state.records.filter(item=>item.id !== record.id);
  records.unshift(record);
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(records)); }
  catch { throw new Error('El navegador no ha podido guardar el expediente. Libera espacio o exporta tus datos antes de continuar.'); }
  upsertRecord(record);
  state.selectedId = record.id; state.activeChatId = record.id; state.draft = null;
  renderAll();
  return record;
}
