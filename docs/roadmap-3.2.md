# Hoja de ruta CE³X 3.2

Estado del bloque de conservación: 5 de noviembre de 2026.

## Implementado

- Escritorio de expedientes y captura secundaria.
- Adaptador residencial 2.3/3.2 y plantilla nativa de 15 bloques.
- Esquema Sheets de 103 columnas, migración con copia previa y almacenamiento fragmentado de entradas nativas.
- Identidad de filas conservada al renombrar o reordenar.
- Edición por equipo y servicio, detección de cambios contradictorios y eliminación parcial de equipos compartidos.
- Conservación de parámetros importados que el formulario todavía no expone.
- Copia entre expedientes que incluye los parámetros nativos, sombras y auxiliares de las secciones copiadas, conserva la identidad del destino y detecta cambios de contexto de cálculo.
- Selecciones vacías y localidades fuera del catálogo conservadas al guardar.
- Conversión de XML calculado a PDF mediante la prueba en Render.
- Adaptador experimental de rendimientos estacionales conectado al formulario mediante el servidor local Windows. Permite borradores de parámetros, recálculo, persistencia y exportación con resultados actualizados en los equipos importados contrastados. Ver [alcance y ejecución](engine-adapter.md). No calcula la calificación del edificio ni está conectado a Render.

## Entrada energética completa

1. Modelar parámetros de estimación de instalaciones: potencia, antigüedad, aislamiento, rendimiento nominal, acumulación y equipos mixtos. Incorporarlos conjuntamente al formulario, JSON de Sheets y serialización.
2. Añadir edición de todas las referencias catastrales y parámetros avanzados de envolvente, sombras y puentes térmicos.
3. Marcar el origen de los datos y cuáles requieren comprobación técnica.
4. Validar apertura y recálculo de los CEX exportados en CE³X 3.2 con casos de referencia. Las pruebas de serialización no sustituyen esta validación.

## Cálculo y salida XML

La carga del runtime completo está corregida. La ejecución independiente no supera la verificación de contexto y no produce resultados del edificio; hace falta aclarar el protocolo de integración admitido. Ver [evidencia y consulta técnica](full-engine-integration.md). Esto no impide continuar con los campos y almacenamiento pendientes.

1. Confirmar un contrato admitido de inicialización del motor completo y sus condiciones de integración en servidor. El conversor XML/PDF no realiza ese cálculo.
2. Definir entradas, resultados, errores y trazabilidad del motor y versión empleados.
3. Comparar demandas, consumos, emisiones y calificaciones con casos de CE³X 3.2 antes de activar la emisión de resultados.
4. Construir el XML desde resultados verificados y validarlo contra el esquema oficial correspondiente.
5. Integrar generación y descarga del PDF dentro del expediente, manteniendo claves del servicio únicamente en servidor.

El servicio Free permite probar la conversión. Deben verificarse disponibilidad, arranque y tratamiento de archivos antes de usarlo habitualmente con expedientes reales.
