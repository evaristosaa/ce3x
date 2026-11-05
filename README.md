# CE3X Captura

Escritorio web de expedientes energéticos con Catastro, captura asistida y Google Sheets. Importa CEX residenciales 2.3 y 3.2 y exporta CEX nativos 3.2 para revisar y recalcular en CE³X.

Aplicación: https://evaristosaa.github.io/ce3x/

## Funciones disponibles

- Escritorio con búsqueda, filtros y detalle: administración, datos generales, envolvente e instalaciones.
- Consulta catastral, cartografía, imágenes y propuestas de autocompletado que requieren revisión técnica.
- Google Sheets como histórico compartido; almacenamiento local cuando no se configura la conexión.
- Importación de CEX sin ejecutar código Python del archivo.
- Campos 3.2 de protección, uso y NIF del cliente y conservación de las entradas nativas originales.
- Edición que conserva referencias catastrales adicionales, protecciones solares, potencias, acumulación, equipos compartidos y auxiliares importados. Los cambios incompatibles se rechazan con una explicación.
- Conversión de XML energético ya calculado a PDF mediante el servicio de prueba enlazado desde Generar PDF.

La app todavía no calcula la calificación energética ni genera el XML de certificación desde los datos capturados o desde un CEX. Exportar CEX y convertir XML a PDF son funciones distintas del cálculo.

## Desarrollo local

Desde `app`, ejecutar `python server.py` y abrir http://127.0.0.1:5177/.

Pruebas: `node --test tests/*.test.mjs`.

El frontend de `app/` se refleja en `docs/` para GitHub Pages. `python scripts/prepare-release.py --meta` sincroniza los archivos públicos y verifica que Apps Script conserva la configuración de ejemplo sin secretos reales.

## Google Sheets

`google-apps-script/Code.gs` contiene el backend con valores de configuración vacíos/de ejemplo. Configurar el documento y las credenciales en el despliegue privado. `migrateSchema32()` conserva las columnas anteriores y crea una copia antes de añadir las columnas 3.2. Ver [esquema](docs/sheet-schema.md).

Las tablas conservan la identidad de cada elemento original dentro de su JSON; no requieren columnas nuevas por cada parámetro nativo. Los expedientes nuevos no heredan identidades reales de técnicos ni clientes.

## Límites

Ver [hoja de ruta](docs/roadmap-3.2.md). Las propuestas de Catastro requieren revisión. Los equipos nuevos con rendimiento estimado necesitan sus parámetros de cálculo; el exportador no los convierte silenciosamente en rendimientos conocidos. Revisar y recalcular el CEX en CE³X 3.2 antes de emitir un certificado.
