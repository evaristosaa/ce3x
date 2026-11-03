# Prueba de generación PDF en Render Free

Este despliegue es independiente de la app publicada. No incluye expedientes,
datos del técnico, configuración de Google Sheets ni claves de la app.

## Estado

- El XML real de Joaquín Sorolla ya produjo un PDF de 16 páginas en Windows.
- Este contenedor Linux prueba los ejecutables oficiales Windows con Wine.
- Validado en Render Free el 3 de noviembre de 2026 con el ejemplo público
  del fabricante: HTTP 200, 299515 bytes, 15 páginas, 18 segundos. Se revisaron
  textos y escalas energéticas. Las peticiones sin clave reciben HTTP 401.
- Wine requiere fuentes en su carpeta Windows, incluidas las fuentes estándar
  de Microsoft para las escalas SVG. La construcción comprueba también sus cifras.
- No se han enviado XML de clientes. Falta validar cada expediente real y la
  integración con la app principal; esta web acepta XML, no calcula desde CEX.
- El paquete oficial solo publica binarios Windows; el repositorio de fuentes
  enlazado desde el IETcc pide iniciar sesión. Una compilación Linux nativa
  sería preferible cuando se consiga acceso a las fuentes.

## Creación en Render

Servicio de prueba: https://ce3x-pdf-prueba.onrender.com
Rama aislada: `codex/render-pdf-free-20261103` del repositorio `evaristosaa/ce3x`.
La rama principal y la app publicada no se han sustituido.
Usar `render.yaml`, que fija `plan: free`, región Frankfurt y autodespliegue
desactivado. No pasar a un plan de pago sin autorización de la usuaria.

La clave aleatoria `PDF_ACCESS_TOKEN` está en Environment del servicio en Render;
los usuarios autorizados la introducen en
el formulario. No se incluye en la URL, el código, localStorage ni los logs.

Probar primero el ejemplo oficial incluido en `/opt/xmlcert/examples/`.
Comprobar la construcción, `SMOKE_OK`, memoria del servicio, descarga, número
de páginas y renderizado antes de utilizar XML de expedientes reales.

## Recursos y límites

Un trabajador y dos hilos HTTP; solo una conversión simultánea. Heap de Java
limitado a 128 MB. Render Free tiene 512 MB de RAM y 0.1 CPU. El ejemplo
se ha convertido dentro de ese plan; esto no garantiza todos los expedientes.
Si se queda sin memoria o no funciona con Wine, la prueba habrá fallado y no
se activará ningún recurso de pago automáticamente.

## Procedencia

XmlCert 0.7.0 (2026-10-28), MIT, IETcc-CSIC:
https://energia.ietcc.csic.es/apps/#xmlcert

Temurin JRE 17.0.21+9 Windows x64:
https://adoptium.net/

Los archivos se descargan desde los distribuidores en la construcción;
`fetch_tools.py` comprueba sus SHA256 publicados. Se conservan sus licencias.
