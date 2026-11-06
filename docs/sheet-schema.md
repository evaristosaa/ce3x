# Google Sheet Schema

Hoja principal: `referencias`

Actualización 3.2 (4 noviembre 2026): 103 columnas. Las 91 históricas conservan
sus posiciones. CN:CY añade versión de origen, entradas nativas, protección,
uso, NIF/NIE del cliente y siete continuaciones de las entradas nativas.
La migración `migrateSchema32()` añade columnas sin reescribir expedientes y
crea un respaldo. `verifySchema32()` comprueba el esquema y la fragmentación.
Extensión de revisión (6 noviembre 2026): columna 104, CZ `revision.campos`. Las 103 columnas anteriores conservan su posición. `migrateSchema32()` crea una copia antes de añadirla. Apps Script privado: versión 27, misma URL de conexión, con señales `referenceWriteVersion: 1` y `reviewWriteVersion: 1`.

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

La lista completa de referencias catastrales se conserva en `cex.nativeInputs` y sus continuaciones existentes. La columna `referenciaCatastral` refleja la primera referencia; una lista vacía mantiene ese campo vacío. No se añaden columnas. El formulario de referencias exige un backend compatible antes de guardar en Sheets. Los cambios con ID nunca usan la referencia como alternativa para seleccionar otra fila; sin ID, una coincidencia ambigua se rechaza.

Cada fila de `envolvente.puentesTermicos.items` admite `origenFi`, `origenLongitud` y `justificacion` dentro de su JSON existente. Los orígenes son informativos y se derivan de las entradas nativas al importar o normalizar un expediente; los cambios numéricos se exportan como `usuario_fi` o `usuario` de forma independiente. Un cambio de formato decimal no cambia el origen. `justificacion` se conserva al guardar y copiar secciones; no se añade al CEX porque su lista nativa de puente térmico no tiene un campo para ese texto. No requiere migración ni nueva implementación de Apps Script.

`revision.campos` contiene un objeto JSON con `schema: 1` y `fields` por ruta del formulario. Cada entrada guarda la huella SHA-256 del valor, procedencia, detalle y fecha. La comprobación opcional añade persona, documento, fecha y huella de los valores comprobados. El formulario vuelve a mostrar pendiente cuando la huella ya no corresponde a los datos actuales. La procedencia no se deduce retroactivamente para registros antiguos y no se incorporan estas declaraciones al CEX. Límite de la trazabilidad: 48.000 caracteres, con rechazo explícito si se supera.
# Parámetros y resultados de instalaciones

Las filas de `instalaciones.acs.items`, `instalaciones.calefaccion.items` e `instalaciones.refrigeracion.items` pueden incluir `estimacion`, una cadena JSON con `schema`, `parameters` y `receipt`. Se almacena dentro de la columna JSON existente, sin añadir columnas.

`receipt` identifica los valores y entradas usados, el módulo y runtime instalados y la fecha del cálculo. Un cambio de parámetros o contexto invalida ese resultado para exportación. Los servicios de un equipo compartido conservan el mismo borrador. El identificador `__cexSource` vincula cada fila con el elemento original del CEX.

El tamaño práctico máximo de cada celda JSON sigue siendo 49.000 caracteres; si se supera, el backend rechaza el guardado. No se trunca el contenido.

Al copiar envolvente e instalaciones, `cex.nativeInputs` conserva los bloques administrativos y generales del destino y sustituye los bloques nativos de las secciones copiadas, incluyendo sus sombras. `sectionVersions` identifica el formato de cada sección, `systemContext` conserva el contexto climático de origen de las instalaciones y `copiedSections` registra el expediente de procedencia. La copia guarda también este campo mediante su almacenamiento fragmentado existente.
