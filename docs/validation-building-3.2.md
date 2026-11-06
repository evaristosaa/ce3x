# Apertura, recálculo y salida documental en CE³X 3.2

Validación local del 6 de noviembre de 2026. Los resultados corresponden a un ejemplo de la instalación y una variante controlada; no son resultados de un motor de cálculo web ni un certificado de un cliente.

## Apertura de los editores nuevos

CE³X abrió el CEX sintético descargado desde Chrome tras las PR #10 y #11. Su formulario mostró orientación SO, propiedades Conocidas con entradas 1,4 / 0,52 / 2,2 y doble ventana activada. En los diálogos solares se leyeron voladizo L=1, H=2, D=0,2 y retranqueo H=2, W=1, R=0,2, con ambos dispositivos activados.

Se resolvió el bloqueo de activación de la ventana mediante la acción de accesibilidad Raise. Esta evidencia amplía la validación anterior de componentes y serialización a la apertura real en el programa.

## Conservación y recálculo de un edificio completo

Se prepararon tres archivos locales a partir de `1 Bloque de viviendas.cex`, distribuido con la instalación de CE³X 3.2:

1. Referencia: copia del ejemplo, sin cambios de entradas.
2. Reexportación: importación y exportación de sus datos mediante las mismas funciones que utiliza la app, sin editar valores.
3. Variante: misma reexportación, cambiando únicamente el primer hueco a propiedades Conocidas 1,4 / 0,52 / 2,2 con doble ventana, y añadiendo voladizo L=0,8, D=0,2, H=1,3 y retranqueo H=1,3, W=1,2, R=0,2. Orientación Oeste; se conserva el 10 % de marco original. Sus factores solares son CTE 0,6314, invierno 0,6545 y verano 0,7.

Antes de abrir los archivos, los cuatro bloques de entradas de la referencia y la reexportación eran idénticos. Se abrió cada archivo, se pulsó «Califica el proyecto» y se guardó desde CE³X. Tras esos guardados, los cuatro bloques siguen siendo idénticos entre referencia y reexportación. Las diferencias de entradas de la variante se limitan a las propiedades térmicas y solares del primer hueco.

Resultados observados en la interfaz, con su precisión de una cifra decimal:

| Indicador por m² | Referencia | Reexportación | Variante |
|---|---:|---:|---:|
| Demanda de calefacción, kWh/m² | 112,0 | 112,0 | 112,8 |
| Demanda de refrigeración, kWh/m² | 18,4 | 18,4 | 16,6 |
| Emisiones de calefacción, kg CO₂/m² | 42,1 | 42,1 | 42,4 |
| Emisiones de refrigeración, kg CO₂/m² | 3,0 | 3,0 | 2,7 |
| Emisiones de ACS, kg CO₂/m² | 12,9 | 12,9 | 12,9 |
| Emisiones globales, kg CO₂/m² | 58,0 E | 58,0 E | 58,0 E |

La coincidencia de los resultados visibles se refiere a esa precisión; no se afirma una comparación de todos los resultados con su precisión interna. El aumento de calefacción de la variante se registra tal como lo devuelve CE³X: no se presupone que combinar mejoras de U y sombreado reduzca todos los indicadores.

## XML y PDF de la variante

CE³X generó el XML de la variante con raíz `DatosEnergeticosDelEdificio`, versión de formato 3.0. Sus indicadores incluyen demanda de calefacción 112,75, refrigeración 16,59, emisiones globales 58,03 (E) y energía primaria no renovable 311,76 (F).

El servicio local `app/report_service.py`, sin modificaciones, convirtió ese XML usando el generador oficial instalado. Produjo un PDF A4 de 14 páginas y 411.395 bytes. Se extrajo texto, se renderizaron todas las páginas y se revisaron visualmente. Se verificó que contiene la nota explícita de prueba de software y que no hubo visita ni certificado válido; las fechas introducidas son datos sintéticos exigidos para probar esa salida.

No se enviaron estos archivos al servicio de Render para esta comprobación. No se cambiaron expedientes de Sheets, bases de datos ni datos de clientes. Los CEX, XML, PDF y capturas quedan en `diagnostics/`, excluidos de la publicación.

## Reproducción y auditoría

```powershell
node scripts/prepare-building-validation.mjs --source "C:/Program Files (x86)/CE3Xv3.2/Ejemplos/1 Bloque de viviendas.cex" --output diagnostics/nueva-validacion --assert-preserved
```

El script solo interpreta datos CEX con el parser seguro; no ejecuta pickle. Genera los tres archivos y una auditoría de entradas con hashes. Rechaza sobrescribir sus archivos existentes. El cálculo requiere abrirlos y calificarlos en CE³X; ejecutar el script no valida la calificación.

Se ha ejecutado dos veces en directorios distintos. La segunda reproducción volvió a confirmar igualdad de entradas antes del cálculo. El [registro numérico y las huellas](validation-building-3.2.json) documentan esta comprobación concreta. El generador sintético `create-cex32-test.mjs --complete` también se ha actualizado para declarar de forma explícita las propiedades conocidas de su hueco.

## Lo que sigue pendiente

El recorrido contrastado es **app → CEX → cálculo en CE³X de escritorio → XML → PDF local**. No demuestra que la web calcule el edificio o produzca su XML sin CE³X, ni sustituye la revisión técnica de un expediente. Continúa pendiente el contrato admitido de integración del motor completo, la comparación con más tipologías y expedientes y la validación independiente de todos sus resultados. Ver [estado del motor](full-engine-integration.md).
