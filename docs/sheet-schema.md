# Google Sheet Schema

Hoja principal: `referencias`

Actualización 3.2 (4 noviembre 2026): 103 columnas. Las 91 históricas conservan
sus posiciones. CN:CY añade versión de origen, entradas nativas, protección,
uso, NIF/NIE del cliente y siete continuaciones de las entradas nativas.
La migración `migrateSchema32()` añade columnas sin reescribir expedientes y
crea un respaldo. `verifySchema32()` comprueba el esquema y la fragmentación.
Apps Script publicado: versión 25, misma URL de conexión.

Validación de integración: CEX sintético importado por la app; NIF cambiado y
guardado; recarga recuperada desde Google y comprobación de las columnas nuevas.
Esto valida captura y persistencia; no sustituye el cálculo energético.

| Columna | Descripcion |
| --- | --- |
| id | Identificador interno UUID |
| referenciaCatastral | Referencia catastral |
| estado | BORRADOR, PENDIENTE_DATOS, COMPLETA, CEX_GENERADO, CERTIFICADO_GENERADO, ERROR |
| gestor | Persona que captura o actualiza la ficha |
| direccion | Direccion del inmueble |
| municipio | Municipio |
| provincia | Provincia |
| codigoPostal | Codigo postal |
| uso | Uso del inmueble |
| superficieUtil | Superficie util indicada para CE3X |
| superficieCatastral | Superficie de Catastro, si se conoce |
| anioConstruccion | Ano de construccion |
| plantas | Numero de plantas |
| orientacionPrincipal | Orientacion principal |
| tipoEdificio | Piso, unifamiliar, local, etc. |
| envolvente | Datos resumidos de envolvente |
| instalaciones | Datos resumidos de instalaciones |
| observaciones | Comentarios libres |
| cexGenerado | Nombre del ultimo fichero .cex generado |
| fechaCexGenerado | Fecha/hora de generacion .cex |
| createdAt | Fecha/hora de alta |
| updatedAt | Fecha/hora ultima modificacion |
| rawJson | JSON completo de la ficha para no perder campos futuros |

El campo `rawJson` permite evolucionar el formulario sin rehacer el Sheet cada vez.
