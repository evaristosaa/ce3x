# CE3X Captura

MVP para capturar referencias catastrales, guardar historico en Google Sheets y preparar la descarga de ficheros `.cex` para abrirlos manualmente en CE3X.

## Estructura

- `app/`: aplicacion estatica para GitHub Pages.
- `google-apps-script/`: backend para publicar como Web App de Google Apps Script.
- `docs/sheet-schema.md`: columnas del Google Sheet.
- `templates/`: plantillas `.cex` cuando tengamos validada la sustitucion.

## Arquitectura

```text
GitHub Pages -> Apps Script -> Google Sheet
```

La app muestra en la cabecera donde esta guardando:

- `Google Sheet`: guarda y lee el historico mediante Apps Script.
- `Modo local`: guarda solo en el navegador/dispositivo con `localStorage`; es util para pruebas o emergencia, pero no sincroniza con otros moviles/navegadores.

Para uso real con Juanjo, Google Sheets debe ser la fuente principal y el modo local debe quedar como respaldo.

## Captura por chat y expedientes

La pantalla principal obliga a elegir primero un `Expediente vivo`. El chat actualiza siempre ese expediente, salvo que se dicte una referencia catastral distinta y la app encuentre una coincidencia clara. Debajo del chat aparece la lista de expedientes con el avance de cada bloque:

- Datos administrativos
- Datos generales
- Envolvente termica
- Instalaciones

Al seleccionar un expediente se abre el detalle editable por pestanas. El detalle usa nombres de campos alineados con CE3X y guarda la estructura de Casa 37: localizacion, cliente, tecnico certificador, datos generales, definicion del edificio, cerramientos, huecos, puentes termicos, ACS, calefaccion, refrigeracion y contribuciones energeticas.

La app precarga como primer expediente la Casa 37 (`0128501TG4302N0037ZI`) con los datos extraidos del `.cex` y de las capturas de CE3X:

- Datos administrativos completos: edificio, cliente y tecnico certificador.
- Datos generales: `CTE 2013`, `Unifamiliar`, `B4`, `HE-4 V`, ano `2021`.
- Definicion edificio: `149.40 m2`, altura `2.60 m`, `3` plantas, ventilacion `0.63 ren/h`, demanda ACS `120 l/dia`, masa `Media`.
- Envolvente en tablas editables: cerramientos, huecos y puentes termicos.
- Instalaciones en tablas editables: ACS, calefaccion, refrigeracion y contribuciones energeticas.

El chat:

- Usa el expediente vivo seleccionado si no se dicta otra referencia.
- Busca la referencia dictada en la tabla.
- Si encuentra una coincidencia, abre y actualiza esa ficha.
- Si encuentra varias, pregunta cual usar antes de guardar.
- Si no existe, crea una ficha nueva.
- Rellena campos concretos y tambien permite dictar bloques largos: fachadas, huecos, puentes termicos, ACS, calefaccion, refrigeracion, etc.
- Crea cada referencia con el tecnico de la Casa 37 como valor por defecto: Juan Jose Moreno Fresno.

Ejemplo:

```text
Referencia 0128501TG4302N0037ZI, direccion Calle Real 4, municipio Dos Hermanas, provincia Sevilla, codigo postal 41704, superficie util 92, ano 1980, fachada NO superficie 39.98, hueco 1 0.90 x 1.25 vidrio doble, ACS termo electrico
```

El boton `Dictar` usa el reconocimiento de voz del navegador cuando este lo permite. En navegadores que bloqueen microfono por no estar en HTTPS, el chat escrito sigue funcionando igual.

El boton `Catastro` intenta cargar localizacion, uso, superficie y ano de construccion desde la referencia catastral. Si el navegador bloquea la llamada por CORS, el mismo flujo se debera mover a Apps Script o al helper Python.

## Despliegue MVP

1. Crear un Google Sheet en Drive, por ejemplo `CE3X - Historico referencias`.
2. Abrir `Extensiones > Apps Script`.
3. Copiar el contenido de `google-apps-script/Code.gs`.
4. Ajustar `APP_SECRET` en Apps Script.
5. Ejecutar `setup()` una vez desde Apps Script para crear cabeceras.
6. Publicar como Web App:
   - Ejecutar como: `Yo`
   - Acceso: para MVP, quien tenga el enlace
7. Copiar la URL `/exec` del despliegue.
8. Abrir `app/index.html`, entrar en configuracion y pegar:
   - URL del Apps Script
   - `APP_SECRET`

## Siguiente paso tecnico

La generacion `.cex` queda pendiente de validar con un `.cex` real. El fichero CE3X no es XML simple; parece una serializacion textual en Latin-1. Hay que identificar campos sustituibles sin romper la estructura.
