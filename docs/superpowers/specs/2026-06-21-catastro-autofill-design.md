# Catastro Autofill Design

## Objetivo

Ampliar la consulta de Catastro para completar automaticamente todos los campos CE3X que se puedan justificar, sin sobrescribir informacion ya introducida por el usuario.

## Principios

- Catastro completa solo campos vacios.
- Los datos oficiales se distinguen de los valores estimados.
- Las estimaciones tecnicas deben ser visibles y revisables.
- Google Maps y Street View quedan como fuente opcional porque requieren API key, facturacion y condiciones externas.
- El plano de situacion se prioriza desde Catastro por ser fuente oficial.

## Alcance Fase 1

La accion "Consultar Catastro" debe:

- Mantener cualquier campo que ya tenga valor.
- Completar datos administrativos vacios: referencia catastral, direccion, provincia, localidad, codigo postal y direccion del cliente.
- Completar datos generales vacios: anio de construccion, tipo de edificio, provincia, localidad y superficie util habitable.
- Guardar tambien superficie catastral y uso si la hoja o el modelo de expediente lo admiten.
- Preparar un campo de plano de situacion desde Catastro cuando haya URL o imagen generable por WMS.

## Reglas De Campo

- `superficieUtilHabitable`: usar superficie de construccion con destino vivienda si existe; si no, usar superficie catastral.
- `tipoEdificio`: si el uso catastral es residencial, proponer vivienda individual/unifamiliar solo cuando no haya un valor previo.
- `numeroPlantasHabitables`: rellenar solo si Catastro devuelve una fuente clara; si no, dejar vacio.
- `alturaLibrePlanta`: no sale de Catastro; se deja vacio en fase 1.
- `ventilacionInmueble`: no sale de Catastro; se deja vacio en fase 1.
- `demandaDiariaACS`: no sale de Catastro; se deja vacio en fase 1.
- `masaParticionesInternas`: no sale de Catastro; se deja vacio salvo que ya exista un default explicito del expediente.
- `imagenEdificio`: no se rellena en fase 1.
- `planoSituacion`: se genera o guarda desde Catastro si hay servicio disponible para la referencia.

## Alcance Fase 2

Anadir sugerencias tecnicas revisables:

- Altura libre por defecto.
- Ventilacion por defecto.
- Demanda ACS estimada desde superficie o ocupacion.
- Masa de particiones por defecto.

Estas sugerencias no deben presentarse como datos de Catastro.

## Alcance Fase 3

Anadir Google Maps/Street View opcional:

- Campo de configuracion para API key.
- Consulta de metadata de Street View para comprobar si hay imagen cercana.
- Descarga o referencia de imagen estatica del edificio.
- Fallback manual si Google no devuelve fachada util.

## Flujo De Datos

1. El usuario pulsa "Consultar Catastro".
2. La app lee los valores actuales del formulario y tablas.
3. Apps Script consulta Catastro con la referencia catastral.
4. La app transforma la respuesta en un patch.
5. El patch se filtra para conservar solo campos vacios.
6. Se aplica el patch al expediente y se guarda.

## Errores

- Si falta referencia catastral valida, mostrar aviso.
- Si Catastro no devuelve datos utiles, mostrar error sin modificar el expediente.
- Si falla el plano, conservar el resto de datos y avisar de que el plano queda pendiente.
- Si una fuente externa requiere API key no configurada, no bloquear Catastro.

## Verificacion

- Test unitario para confirmar que Catastro no sobrescribe campos existentes.
- Test unitario para superficie de vivienda frente a superficie catastral.
- Test unitario para campos tecnicos no rellenados por Catastro en fase 1.
- Prueba manual: consultar una referencia con campos vacios y otra con campos ya rellenos.
