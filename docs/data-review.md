# Origen y revisión de datos

La opción **Origen y revisión de datos** del expediente muestra los campos y tablas con valores. Distingue los datos importados de CEX, los consultados en Catastro, las estimaciones de la app, las copias entre expedientes y las ediciones manuales registradas a partir de esta versión. Los expedientes anteriores sin esa evidencia muestran **Origen no registrado**: no se les atribuye una procedencia ni una comprobación retroactiva.

Para comprobar un campo o una tabla, el usuario selecciona la entrada, indica su nombre y la referencia documental o de cálculo, y confirma que ha contrastado los datos. La declaración se guarda con fecha y una huella SHA-256. Si cambia el valor, la comprobación anterior deja de aparecer como vigente. Los parámetros nativos de envolvente y sus sombras forman parte de la huella de las tablas de envolvente; los de instalaciones y su contexto forman parte de la huella de sus tablas. También se puede marcar explícitamente una entrada como pendiente.

La unidad de comprobación es el campo o la tabla completa, no cada celda de una tabla. La persona declarada no se autentica como técnico ni constituye una firma electrónica. La app no comprueba por sí misma el documento citado ni genera una calificación energética al marcar los datos como comprobados. Estas declaraciones son organización y trazabilidad del expediente, no una certificación.

Se conserva el estado actual de procedencia y comprobación, no un historial inmutable de todas las ediciones anteriores.

El almacenamiento usa la columna CZ `revision.campos`, añadida mediante migración con respaldo. No se reescriben los datos antiguos. El cliente exige `reviewWriteVersion: 1` antes de guardar conectado a Sheets, para evitar que un servicio antiguo descarte la revisión. La huella se comprueba de nuevo al mostrar el estado: una edición externa o concurrente de los valores no convierte una declaración anterior en comprobación del valor nuevo.

## Comprobación de integración del 6 de noviembre de 2026

Se creó una ficha sintética desde Chrome conectado a Google Sheets. Se guardó un nombre, se comprobó declarando un revisor y documento de prueba, y la recarga recuperó una entrada comprobada. Tras cambiar el nombre y guardar, la columna de revisión dejó de contener aquella comprobación y una nueva recarga mostró cero entradas comprobadas. También se verificaron los controles del diálogo a 390 × 844 píxeles y se restauró la vista de escritorio.

La migración creó `referencias_backup_20261106-083115` antes de añadir CZ. Las celdas de las 103 columnas anteriores y los cinco expedientes existentes se compararon sin cambios. La única ficha de prueba se retiró al terminar. El backend privado quedó en la versión 27 con la misma URL y permisos. Las pruebas de código comprueban además almacenamiento, procedencias mixtas, pérdida de vigencia por parámetros nativos, rechazo de servicios antiguos, migración idempotente y ausencia de cambios en el CEX al registrar una revisión.
