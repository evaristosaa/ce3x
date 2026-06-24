# Catastro Autofill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand Catastro autofill so it completes only empty CE3X fields and prepares official Catastro-derived situation plan data.

**Architecture:** Keep the current browser/app-script split. Apps Script continues fetching Catastro XML, while `app/app.js` maps the returned data into CE3X paths and filters the patch against the current form values before saving.

**Tech Stack:** Plain JavaScript in `app/app.js`, Google Apps Script mirror in `docs/Code.gs.txt`, Node test runner in `tests/*.mjs`.

---

### Task 1: Test Catastro Patch Mapping

**Files:**
- Modify: `tests/cex-system-serialization.test.mjs`
- Modify: `app/app.js`

- [ ] **Step 1: Expose Catastro helpers in the test VM**

Add `catastroPatchFromData` and the empty-field filter helper to `globalThis.__cexHelpers`.

- [ ] **Step 2: Write failing tests**

Add tests that assert:

```js
const patch = catastroPatchFromData({
  referenciaCatastral: '0128501TG4302N0037ZI',
  direccion: 'Calle Real 1',
  provincia: 'SEVILLA',
  localidad: 'Dos Hermanas',
  codigoPostal: '41704',
  uso: 'Residencial',
  superficieCatastral: '120',
  anioConstruccion: '1998',
  construcciones: [
    { destino: 'VIVIENDA', superficie: '106' },
    { destino: 'ALMACEN', superficie: '14' },
  ],
});
assert.equal(patch['generales.definicion.superficieUtilHabitable'], '106');
assert.equal(patch.superficieCatastral, '120');
assert.equal(patch.uso, 'Residencial');
assert.doesNotHaveOwn(patch, 'generales.definicion.alturaLibrePlanta');
```

Add a second test where current record data already has `admin.localizacion.direccion`; the filtered patch must not include that path.

- [ ] **Step 3: Run the test**

Run: `node --test tests\cex-system-serialization.test.mjs`

Expected: FAIL until the helpers and mapping are implemented.

### Task 2: Implement Empty-Only Catastro Autofill

**Files:**
- Modify: `app/app.js`

- [ ] **Step 1: Add `emptyOnlyPatch(record, patch)`**

Implement a helper that returns only patch entries where `valueAt(record, path)` is empty. For flat summary fields such as `uso` and `superficieCatastral`, check `record[path]`.

- [ ] **Step 2: Use helper in `loadCatastroForSelected`**

Replace the special-case `nombreEdificio` deletion with the generic empty-only filter.

- [ ] **Step 3: Extend `catastroPatchFromData`**

Include `referenciaCatastral`, `uso`, `superficieCatastral`, and `generales.definicion.planoSituacion` when Catastro data provides enough context.

- [ ] **Step 4: Run tests**

Run: `node --test tests\cex-system-serialization.test.mjs`

Expected: PASS.

### Task 3: Sync Summary Fields

**Files:**
- Modify: `app/app.js`
- Modify: `docs/Code.gs.txt` if required by schema behavior

- [ ] **Step 1: Check `addSummaryFields`**

Ensure `uso`, `superficieCatastral`, and `plantas` are copied from data or preserved from Catastro response.

- [ ] **Step 2: Run tests**

Run: `node --test tests\cex-system-serialization.test.mjs`

Expected: PASS.

### Task 4: Verify Served App

**Files:**
- None

- [ ] **Step 1: Check local server**

Run:

```powershell
Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:5177/app.js?v=catastro-autofill'
```

Expected: response content contains `emptyOnlyPatch`.
