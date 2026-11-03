# Prueba de generación PDF en Render Free

Este despliegue es independiente de la app publicada. No incluye expedientes,
datos del técnico, configuración de Google Sheets ni claves de la app.

## Estado

- El XML real de Joaquín Sorolla ya produjo un PDF de 16 páginas en Windows.
- Este contenedor Linux prueba los ejecutables oficiales Windows con Wine.
- No se ha validado todavía en Docker/Render: el equipo local no tiene Docker
  ni WSL instalado. La prueba de compilación genera el ejemplo público del
  fabricante y aborta si no funciona. No se usan datos de clientes para ello.
- El paquete oficial solo publica binarios Windows; el repositorio de fuentes
  enlazado desde el IETcc pide iniciar sesión. Una compilación Linux nativa
  sería preferible cuando se consiga acceso a las fuentes.

## Creación en Render

Conectar Render y autorizar el repositorio privado que contenga este paquete.
Usar `render.yaml`, que fija `plan: free`, región Frankfurt y autodespliegue
desactivado. No pasar a un plan de pago sin autorización de la usuaria.

Render genera `PDF_ACCESS_TOKEN`; los usuarios autorizados lo introducen en
el formulario. No se incluye en la URL, el código, localStorage ni los logs.

Probar primero el ejemplo oficial incluido en `/opt/xmlcert/examples/`.
Comprobar la construcción, `SMOKE_OK`, memoria del servicio, descarga, número
de páginas y renderizado antes de utilizar XML de expedientes reales.

## Recursos y límites

Un trabajador y dos hilos HTTP; solo una conversión simultánea. Heap de Java
limitado a 128 MB. Render Free tiene 512 MB de RAM y 0.1 CPU; todavía no se
ha confirmado que el proceso completo (Wine, Java, XmlCert) se ajuste a ellos.
Si se queda sin memoria o no funciona con Wine, la prueba habrá fallado y no
se activará ningún recurso de pago automáticamente.

## Procedencia

XmlCert 0.7.0 (2026-10-28), MIT, IETcc-CSIC:
https://energia.ietcc.csic.es/apps/#xmlcert

Temurin JRE 17.0.21+9 Windows x64:
https://adoptium.net/

Los archivos se descargan desde los distribuidores en la construcción;
`fetch_tools.py` comprueba sus SHA256 publicados. Se conservan sus licencias.
