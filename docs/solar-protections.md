# Protecciones solares de huecos

## Alcance

La web permite editar voladizos (L, D, H) y retranqueos (H, W, R) en metros por hueco, calcular sus tres factores solares en el navegador y exportarlos en el CEX residencial 3.2. No necesita ejecutar Windows para este cálculo parcial. No calcula demanda, consumo, emisiones ni calificación del edificio.

El botón «Protecciones solares» está en Envolvente térmica → Huecos. Las medidas se guardan como `proteccionSolar` dentro del JSON de la tabla `envolvente.huecos.items`. Se conservan identidad de fila y parámetros importados. Las 104 columnas actuales de Sheets y Apps Script v27 permiten guardar este atributo sin migración adicional. La prueba de almacenamiento usa el conversor real de filas de Apps Script; no se han modificado expedientes reales para probarlo.

La edición o cambio de orientación rechaza protecciones nativas complejas que todavía no expone este editor: lamas, toldos, lucernarios, correctores personalizados y persianas. Si no se modifican sus datos ni orientación, se conservan. También se rechazan formatos desconocidos y geometrías almacenadas con activación incoherente. Los vectores nativos admitidos tienen 25 o 28 posiciones; se conserva su longitud.

Las alturas y anchuras deben ser positivas; vuelos, distancias y profundidades deben ser números no negativos. Se admite coma decimal. Desactivar una protección borra sus dimensiones en el CEX exportado. No se inventan medidas ni protecciones en huecos nuevos.

## Orientaciones

La conversión anterior podía transformar N/S/E/O en diagonales. Se corrige a Norte/Sur/Este/Oeste, que son las denominaciones nativas; se mantienen NE/NO/SE/SO. Los alias W/NW/SW se convierten en Oeste/NO/SO. Un cambio de orientación recalcula las protecciones compatibles para evitar conservar factores de otra orientación.

Los archivos ya exportados con una diagonal incorrecta necesitan revisión de su orientación física. No es posible deducir automáticamente si una diagonal antigua era real o procedía del defecto. No se cambian masivamente los expedientes de Sheets.

## Referencias y contraste

Las tablas anuales corresponden a las tablas 12 (voladizos) y 13 (retranqueos) del [DA DB-HE/1 de febrero de 2015 del CTE](https://www.codigotecnico.org/pdf/Documentos/HE/DAAnteriores/DA-DB-HE-1-Calculo_de_parametros_caracteristicos_feb_2015.pdf). Si hay retranqueo, L se mide desde el centro del acristalamiento.

Los factores estacionales, límites de intervalos y combinación se contrastan con funciones numéricas de CE³X 3.2 instalado. El generador no carga proyectos ni modifica funciones de verificación del programa. Se guardan únicamente resultados numéricos de referencia, sin distribuir módulos binarios del fabricante.

```powershell
python scripts/generate-solar-reference.py --output tests/fixtures/solar-ce3x32.json
node --test --test-reporter=dot tests/cex-32.test.mjs
```

La batería incluye 1.296 casos con las ocho orientaciones, límites de tablas y combinaciones. Los tres factores coinciden con tolerancia absoluta de 1e-12. El comportamiento de CE³X incluye L/H = 0,2 en el primer intervalo; para retranqueos con R/H o R/W ≤ 0,05 devuelve 1. Al combinar estas dos protecciones se multiplican los factores CTE e invierno y se toma el mínimo para verano.

Ejemplo: Sur, voladizo L=1, D=0,2, H=2; retranqueo H=2, W=1, R=0,2 → CTE 0,6068, invierno 0,8004 y verano 0,65.

Huellas SHA-256 del runtime usado en el contraste:

- `ce3xv3.2.exe`: `4e4a80660ff62fcd6a1bdd6f27af17287f399073e77219ea94f7182934e4f5d6`
- `Calculos/funcionFactorSombra.pyd`: `bcf85126a292fbe22d9028b4a10bc5863813cc1feabe9c53b843f93f093b6c4b`
- `Envolvente/tablasValores.pyd`: `daa0e9e095de7f541beb0d650789526e94c4dff28b55799af42ca50458cc3841`

## Validación de interfaz y límites pendientes

Comprobado en Chrome local con expediente sintético: editar ambas protecciones, guardar, recargar, recuperar medidas, bloquear H=0 y descargar CEX. También se ha accionado Guardar con viewport de 390×844. Las dimensiones y factores del archivo descargado se revisan mediante el parser seguro de datos.

La activación de la ventana de CE³X falló en esta sesión; la apertura de este CEX solar en su interfaz y el recálculo completo del edificio siguen pendientes. Las pruebas numéricas y de serialización no equivalen a esa validación ni a una certificación energética.
