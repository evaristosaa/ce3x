# Catastro Situation Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Store official Catastro parcel coordinates and use them to fill the CE3X situation plan field with a stable Catastro map reference.

**Architecture:** Apps Script enriches Catastro results with parcel coordinates from `Consulta_CPMRC` using the first 14 reference characters. The browser maps those coordinates into hidden summary fields and a `planoSituacion` value only when current fields are empty.

**Tech Stack:** Plain JavaScript in `app/app.js`, Google Apps Script in `google-apps-script/Code.gs`, Node test runner in `tests/cex-system-serialization.test.mjs`.

---

### Task 1: Test Situation Plan Mapping

**Files:**
- Modify: `tests/cex-system-serialization.test.mjs`

- [ ] Add assertions that `catastroPatchFromData` stores `catastro.x`, `catastro.y`, `catastro.srs`.
- [ ] Add assertion that `generales.definicion.planoSituacion` contains a Catastro map URL when coordinates are present.
- [ ] Run `node --test tests\cex-system-serialization.test.mjs` and confirm the new assertions fail before implementation.

### Task 2: Implement Browser Mapping

**Files:**
- Modify: `app/app.js`

- [ ] Add `catastroMapUrlFromData(item)` helper.
- [ ] Extend `catastroPatchFromData` with coordinate fields and `planoSituacion` URL.
- [ ] Extend `browserCatastroPatch` to parse coordinate XML only as fallback if Apps Script is not used.
- [ ] Run `node --test tests\cex-system-serialization.test.mjs`.

### Task 3: Implement Apps Script Coordinates

**Files:**
- Modify: `google-apps-script/Code.gs`
- Modify: `docs/Code.gs.txt`

- [ ] Add coordinate lookup in `getCatastro_`.
- [ ] Add helper to call `OVCCoordenadas.asmx/Consulta_CPMRC` with the first 14 reference characters.
- [ ] Do not throw if coordinates fail; return the rest of Catastro data.

### Task 4: Verify Local App

**Files:**
- None

- [ ] Run tests.
- [ ] Check local server content includes the new map helper.
