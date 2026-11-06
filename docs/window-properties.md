# Propiedades térmicas de huecos en CE³X 3.2

## Problemas corregidos

El exportador creaba todos los huecos nuevos como `HuecoEstimadas`, con vidrio Doble y marco Metálico con RPT, aunque se hubieran introducido otras propiedades. Además, al editar un hueco conocido importado solo actualizaba `Uvidrio`, `Gvidrio` y `Umarco`; CE³X recalcula esos campos desde `UvidrioConocido`, `GvidrioConocido` y `UmarcoConocido`, por lo que podía recuperar valores anteriores.

La app ahora incorpora un editor en **Envolvente térmica → Huecos → Propiedades térmicas**. Permite elegir:

- Conocidas: U del vidrio, g del vidrio y U del marco, que el técnico debe respaldar con documentación o ensayos.
- Estimadas: vidrio Simple, Doble o Doble bajo emisivo; marco Metálico sin RPT, Metálico con RPT, PVC o Madera.
- Doble ventana: dos ventanas paralelas, distinto de un acristalamiento doble. En modo conocido se introducen los valores antes de aplicar esa corrección.

La tabla muestra los valores efectivos y el modo como campos de solo lectura; su edición se realiza desde el diálogo para conservar coherencia. Porcentaje de marco y absortividad se introducen en la tabla. El editor valida números y límites, admite coma decimal y muestra una vista previa de U del hueco y su factor solar sin protecciones.

Elegir «Conocidas» indica el método de entrada, no una comprobación documental automática. La revisión de los datos sigue usando el panel de origen y revisión; cambiar las propiedades deja sin vigencia una comprobación anterior de la tabla.

## Almacenamiento y exportación

Los parámetros se guardan en `propiedadesTermicas`, dentro de cada fila del JSON `envolvente.huecos.items`. Las 104 columnas de Sheets y Apps Script v27 admiten ese atributo; no requiere otra migración. Las pruebas usan los conversores reales de filas de Apps Script. No se han cambiado expedientes reales para esta validación.

La exportación escribe `HuecoConocidas` o `HuecoEstimadas` y su `__tipo__` coherentes. En el modo conocido sincroniza también las tres entradas `*Conocido`; con doble ventana conserva por separado valores originales y efectivos para evitar aplicar dos veces la corrección. Al cambiar de modo retira únicamente los parámetros exclusivos del anterior. Conserva dimensiones, protección solar y demás entradas nativas del hueco.

Los huecos importados sin cambios térmicos conservan sus datos. Los nuevos deben definirse en el editor; también se admiten filas completas con modo Conocidas explícito. Una fila antigua sin entradas nativas ni tipos de vidrio/marco necesita revisión en el editor antes de exportar. No se intenta deducir un tipo físico a partir de una U. Los borradores autocompletados mantienen la propuesta Doble/Metálico con RPT, ahora con parámetros explícitos y editables; siguen siendo estimaciones pendientes de revisión.

La exportación rechaza discrepancias entre el borrador térmico y los valores efectivos de la tabla. Al editar porcentaje de marco o absortividad en la tabla se actualizan sus propiedades efectivas con las entradas del editor o del CEX importado. En el límite de 100 % de marco, CE³X anula U y g del vidrio. Las modificaciones externas sin parámetros coherentes requieren revisión en el editor antes de exportar.

## Contraste reproducible

```powershell
python scripts/generate-solar-reference.py --kind window --output tests/fixtures/window-ce3x32.json
node --test --test-reporter=dot tests/*.test.mjs
```

`window_reference_worker.py` invoca los constructores y métodos de propiedades de las clases instaladas en CE³X 3.2. No carga CEX, no modifica verificaciones del programa y no distribuye sus binarios. El JSON contiene resultados numéricos y huellas SHA-256 del runtime usado.

Se contrastan 96 casos: combinaciones de vidrio/marco estimados, entradas conocidas, doble ventana activada/desactivada y porcentajes de marco 0, 20 y 100. Se comparan U del vidrio, g, U del marco, U del hueco y factor solar con tolerancia absoluta 1e-12.

Comprobado en Chrome local con un expediente sintético: cambiar de Estimadas a Conocidas, introducir 1,4 / 0,52 / 2,2, activar doble ventana, guardar, recargar, recuperar las entradas originales, bloquear g=1,2 y guardar con viewport 390×844. El parser seguro confirma clase y campos de la descarga, manteniendo los factores solares de la prueba anterior. Al suministrar esas entradas JSON al constructor nativo y recalcular las propiedades dos veces se reproducen los valores efectivos: 1,1182108626198082 / 0,4264 / 1,5759312320916905.

Las pruebas de copia entre expedientes, almacenamiento y revisión cubren este nuevo atributo. Posteriormente se abrió el CEX térmico en CE³X, se verificaron sus entradas y se recalculó una variante de un ejemplo completo, con salida XML/PDF local. Ver [la validación de escritorio](validation-building-3.2.md). Los resultados de componentes siguen sin calcular demanda, consumo, emisiones ni calificación en la web, y no permiten todavía generar su XML directamente desde las entradas de la app.

Como referencia conceptual se ha consultado el [manual de usuario de IDAE, edición 2012, apartado de huecos y doble ventana](https://www.gobiernodecanarias.org/energia/descargas/oecan/Manual_usuario_CE3X_05.pdf). Ese manual describe conceptos generales; el contraste específico de esta implementación procede del runtime 3.2 instalado.
