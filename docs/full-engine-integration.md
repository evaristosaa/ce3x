# Integración del cálculo completo: hallazgos y requisito pendiente

Comprobación local: 5 de noviembre de 2026. Este documento registra una investigación de integración, no acredita un motor alternativo ni una calificación energética.

## Evidencia obtenida

- El módulo de instalaciones funciona con el runtime oficial instalado y reproduce las tres referencias verificadas.
- La importación de la biblioteca gráfica se bloqueaba al cargar el runtime C++ fuera de su contexto de dependencias. El host ahora activa el manifiesto de la propia instalación e inicializa ese runtime antes de cargar Python. No se cambian los DLL ni el registro.
- La biblioteca gráfica y el módulo `datosEdificio` ya se importan en un proceso independiente. La comprobación es reproducible con `python scripts/estimate-systems.py --check-building-runtime`.
- La verificación de contexto `getVG3()` devuelve `False` en esa ejecución independiente. En la prueba con los datos de un expediente, el constructor y la calificación consultan esa verificación y no generan datos de resultados. La observación se realizó conservando el resultado original de la función.
- No se ha determinado a partir de ese resultado si falta un estado de la aplicación, un protocolo de inicialización o una condición de integración adicional. No se atribuye el bloqueo a una licencia específica sin confirmación.

El diagnóstico devuelve por separado `contextVerified`, `projectLoaded`, `buildingRatingCompared` y `buildingCalculationValidated`. Que un módulo se importe no implica que el cálculo del edificio esté disponible. El host conserva su contexto de dependencias hasta terminar el proceso, porque la biblioteca gráfica activa contextos anidados.

## Información oficial consultada

[Efinovatic](https://efinova.es/CE3X) identifica CE³X 3.2 como versión actual, indica su distribución gratuita y la propiedad del IDAE. La página consultada describe complementos, pero no especifica un contrato para ejecutar el motor completo en un servidor independiente. La distribución gratuita no basta para deducir las condiciones de esa integración.

El [IDAE](https://www.idae.es/faq) publica un canal de asistencia para incidencias informáticas de CE3 y CE3X. [Efinovatic](https://efinova.es/asistenciaTecnica/0/) ofrece asistencia individualizada. No se ha enviado una consulta a terceros ni contratado un servicio.

## Consulta técnica necesaria

Se ha preparado un [texto de consulta](consulta-integracion-CE3X.md) para revisión. No se ha enviado a terceros.

Antes de basar la emisión de certificados en una llamada independiente al módulo completo, debe aclararse:

1. Si existe una API, SDK o modo de ejecución de cálculo de CE³X 3.2 admitido por sus responsables.
2. Cómo inicializar y validar el contexto completo del programa sin sustituir sus comprobaciones.
3. Si la integración debe ejecutarse como complemento dentro del programa y qué interfaz se admite para intercambiar entradas y resultados.
4. Qué condiciones se aplican al alojamiento en servidor, uso concurrente y distribución de los componentes necesarios.
5. Qué procedimiento y casos de referencia deben usarse para contrastar demanda, consumo, emisiones, calificación y XML generado.

Mientras falta esa información y la comparación de resultados, siguen disponibles la captura, los CEX, el recálculo local de instalaciones contrastadas y la conversión de un XML ya calculado a PDF. El cálculo completo y el XML desde datos de entrada siguen pendientes. Las mejoras independientes del formulario y su almacenamiento pueden continuar.
