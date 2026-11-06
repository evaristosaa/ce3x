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
- Gestión de la lista completa de referencias catastrales: añadir, ordenar, cambiar la principal o vaciarla; búsqueda también por referencias adicionales. El guardado identifica el expediente por su ID, aunque comparta referencia con otro.
- Puentes térmicos con origen independiente de Ψ y longitud y justificación documental. Editar un valor cambia su marca nativa a introducido, conservando las marcas del otro valor. La justificación queda en la app y en Sheets; el CEX conserva los valores y marcas que admite su formato.
- Origen y revisión de datos por campo o tabla: distingue importación CEX, Catastro, estimación, copia y edición manual. Guarda la persona y el documento declarados para la comprobación. Un cambio de valor deja esa comprobación sin vigencia; los datos antiguos sin trazabilidad conservan origen no registrado. Ver [alcance](docs/data-review.md).
- Copia de envolvente e instalaciones con sus datos nativos y sombras, conservando los datos administrativos del destino. Los equipos estimados mantienen su contexto climático de origen para detectar cuándo hace falta recalcular.
- Conversión de XML energético ya calculado a PDF mediante el servicio de prueba enlazado desde Generar PDF.

La app todavía no calcula la calificación energética ni genera el XML de certificación desde los datos capturados o desde un CEX. Exportar CEX y convertir XML a PDF son funciones distintas del cálculo.

El [adaptador experimental de rendimientos de instalaciones](docs/engine-adapter.md) ejecuta el módulo de una instalación Windows de CE³X 3.2 desde el formulario mediante el servidor local. Permite guardar parámetros y recalcular los equipos importados contrastados. En la web estática permite guardar borradores, con recálculo pendiente.

## Desarrollo local

Desde `app`, ejecutar `python server.py` y abrir http://127.0.0.1:5177/.

Pruebas: `node --test tests/*.test.mjs`.

El frontend de `app/` se refleja en `docs/` para GitHub Pages. `python scripts/prepare-release.py --meta` sincroniza los archivos públicos y verifica que Apps Script conserva la configuración de ejemplo sin secretos reales.

## Google Sheets

`google-apps-script/Code.gs` contiene el backend con valores de configuración vacíos/de ejemplo. Configurar el documento y las credenciales en el despliegue privado. `migrateSchema32()` conserva las columnas anteriores y crea una copia antes de añadir las columnas 3.2. Ver [esquema](docs/sheet-schema.md).

Las tablas conservan la identidad de cada elemento original dentro de su JSON; no requieren columnas nuevas por cada parámetro nativo. Los expedientes nuevos no heredan identidades reales de técnicos ni clientes.

## Límites

Ver [hoja de ruta](docs/roadmap-3.2.md). Las propuestas de Catastro requieren revisión. Los equipos nuevos con rendimiento estimado necesitan sus parámetros de cálculo; el exportador no los convierte silenciosamente en rendimientos conocidos. Revisar y recalcular el CEX en CE³X 3.2 antes de emitir un certificado.

### Recogida local de XML con CE³X 3.2 (experimental)

En Windows, crea una carpeta local privada para los intercambios. Inicia el asistente desde el repositorio:

```powershell
python scripts/collect-ce3x-xml.py --watch "C:\ruta\carpeta-privada"
```

En la app, abre un expediente, pulsa **Recoger XML de CE³X** y selecciona esa misma carpeta. La app crea una subcarpeta nueva. El asistente abre el CEX cuando la escritura termina. En CE³X, califica el proyecto, pulsa el botón XML y revisa las fechas y mejoras antes de exportar. La app espera hasta cinco minutos y descarga el XML resultante. El original queda junto al CEX. Para detener el asistente, pulsa Ctrl+C en la terminal.

Usa una carpeta que solo controles tú y reserva el asistente a CEX de confianza. El arranque desde la carpeta se comprobó con CE³X 3.2 y un ejemplo de la instalación. El cálculo y la revisión del informe se hacen en CE³X.

En la prueba del 6 de noviembre, el CEX abierto por el asistente se recalculó en CE³X 3.2 y mostró 58,0 kg CO₂/m² (E). La exportación desde Ctrl+J, con una fecha sintética y una nota explícita de prueba, produjo un XML de 146.352 bytes en la carpeta del trabajo. El conversor local lo procesó y devolvió un PDF de 411.163 bytes. Esta comprobación cubre la salida real de escritorio; la descarga automática en el navegador sigue pendiente de una prueba integrada.

Para solicitar también el cálculo al abrir cada trabajo, añade `--auto-rate` al comando anterior. Se comprobó con CE³X 3.2 en Windows sobre un CEX de ejemplo nuevo: la ventana mostró 58,0 kg CO₂/m² (E) sin pulsar Calificar. Revisa el resultado y confirma las opciones del informe en CE³X antes de exportar el XML.
