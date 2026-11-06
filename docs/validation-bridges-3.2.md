# Puentes térmicos: validación de edición y apertura

Comprobación local del 6 de noviembre de 2026 con CE³X 3.2 instalado.

## Caso contrastado

Se generó un expediente residencial sintético con un cerramiento, un hueco, un puente térmico y equipos de rendimiento conocido. En el puente, Ψ era 0,8 W/mK y la longitud 2 m; ambos tenían marcas nativas de valor por defecto para comprobar la edición independiente.

1. Chrome importó el CEX en una sesión local aislada de Google Sheets.
2. Se cambió Ψ a `0,67` y se añadió una justificación documental de prueba.
3. Al guardar y recargar, el formulario recuperó Ψ, longitud y justificación. El origen de Ψ figuraba como introducido y el de longitud seguía siendo por defecto.
4. Se descargó `PRUEBA_PUENTES_TERMICOS.cex`. Aunque la espera automática del evento de descarga no lo detectó, el archivo apareció en Descargas y se analizó directamente.
5. El archivo tenía 15 bloques y cabecera `CE3Xv3.2 Residencial`. Su puente contenía Ψ numérico `0.67`, longitud `2`, origen `usuario_fi` y origen de longitud `defecto`.
6. El programa CE³X abrió ese mismo archivo. En Envolvente térmica → Fachada de prueba → Puente de prueba, su formulario mostró Ψ `0.67`, longitud `2` y el cerramiento asociado correcto.

Las 99 pruebas Node cubren además formatos decimales equivalentes, marcas nativas no estándar, cambios independientes de ambos valores, valores de Ψ negativos, rechazo de números inválidos, almacenamiento en el JSON de Sheets y copia entre expedientes. La prueba de Sheets de este bloque ejercita los serializadores; no se añadieron ni modificaron expedientes reales en la hoja durante esta comprobación.

## Límites de esta evidencia

La apertura de este caso sintético no demuestra compatibilidad con todos los CEX, ni valida la calificación energética, el recálculo completo del edificio o la generación de XML desde entradas. El expediente de prueba no es un certificado. La justificación documental queda en la app y Sheets: el CEX conserva los valores y marcas nativas, sin añadir campos fuera de su formato.
