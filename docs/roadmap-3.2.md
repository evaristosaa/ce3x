# Hoja de ruta CE³X 3.2

Estado del bloque de conservación y revisión: 6 de noviembre de 2026.

## Implementado

- Escritorio de expedientes y captura secundaria.
- Adaptador residencial 2.3/3.2 y plantilla nativa de 15 bloques.
- Esquema Sheets de 103 columnas, migración con copia previa y almacenamiento fragmentado de entradas nativas.
- Extensión a 104 columnas para origen y revisión por campo o tabla, con copia previa y conservación de las 103 columnas anteriores. La revisión declarada deja de ser vigente si cambia el valor, incluyendo parámetros nativos de las tablas. Ver [alcance](data-review.md).
- Identidad de filas conservada al renombrar o reordenar.
- Edición por equipo y servicio, detección de cambios contradictorios y eliminación parcial de equipos compartidos.
- Conservación de parámetros importados que el formulario todavía no expone.
- Copia entre expedientes que incluye los parámetros nativos, sombras y auxiliares de las secciones copiadas, conserva la identidad del destino y detecta cambios de contexto de cálculo.
- Selecciones vacías y localidades fuera del catálogo conservadas al guardar.
- Edición de la lista completa de referencias catastrales, promoción de la principal y búsqueda por adicionales, con guardado por ID y rechazo de coincidencias ambiguas.
- Puentes térmicos con origen visible de Ψ y longitud, cambio coherente de las marcas nativas al editar y justificación documental conservada en la app y Sheets.
- Editor de voladizos y retranqueos por hueco con factores calculados en el navegador, contraste de 1.296 casos y conservación en Sheets/CEX. Corrección de orientaciones cardinales y eliminación de protecciones por defecto inventadas. Ver [alcance y validación](solar-protections.md); pendiente apertura de este caso solar y recálculo completo en CE³X.
- Editor de propiedades térmicas conocidas o estimadas de huecos, selección de vidrio/marco y doble ventana. Conserva entradas originales y propiedades efectivas, corrige la clase nativa y contrasta 96 casos con CE³X instalado. Ver [alcance](window-properties.md); no sustituye el cálculo del edificio.
- Caso sintético de puente editado: importación, guardado, recarga y exportación desde Chrome, y apertura con lectura de Ψ y longitud en CE³X 3.2. Ver [alcance de la validación](validation-bridges-3.2.md); no es una validación del cálculo energético completo.
- Conversión de XML calculado a PDF mediante la prueba en Render.
- Adaptador experimental de rendimientos estacionales conectado al formulario mediante el servidor local Windows. Permite borradores de parámetros, recálculo, persistencia y exportación con resultados actualizados en los equipos importados contrastados. Ver [alcance y ejecución](engine-adapter.md). No calcula la calificación del edificio ni está conectado a Render.

## Entrada energética completa

1. Modelar parámetros de estimación de instalaciones: potencia, antigüedad, aislamiento, rendimiento nominal, acumulación y equipos mixtos. Incorporarlos conjuntamente al formulario, JSON de Sheets y serialización.
2. Añadir edición de parámetros avanzados de envolvente, sombras y puentes térmicos.
3. Ampliar la revisión a los parámetros avanzados que se incorporen al formulario y contrastar su uso con expedientes reales. La revisión por campo o tabla ya distingue procedencia y comprobaciones pendientes.
4. Validar apertura y recálculo de los CEX exportados en CE³X 3.2 con casos de referencia. Las pruebas de serialización no sustituyen esta validación.

## Cálculo y salida XML

La carga del runtime completo está corregida. La ejecución independiente no supera la verificación de contexto y no produce resultados del edificio; hace falta aclarar el protocolo de integración admitido. Ver [evidencia y consulta técnica](full-engine-integration.md). Esto no impide continuar con los campos y almacenamiento pendientes.

1. Confirmar un contrato admitido de inicialización del motor completo y sus condiciones de integración en servidor. El conversor XML/PDF no realiza ese cálculo.
2. Definir entradas, resultados, errores y trazabilidad del motor y versión empleados.
3. Comparar demandas, consumos, emisiones y calificaciones con casos de CE³X 3.2 antes de activar la emisión de resultados.
4. Construir el XML desde resultados verificados y validarlo contra el esquema oficial correspondiente.
5. Integrar generación y descarga del PDF dentro del expediente, manteniendo claves del servicio únicamente en servidor.

El servicio Free permite probar la conversión. Deben verificarse disponibilidad, arranque y tratamiento de archivos antes de usarlo habitualmente con expedientes reales.
