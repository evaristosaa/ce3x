# Adaptador experimental del módulo de instalaciones CE³X 3.2

Este adaptador ejecuta el módulo oficial de rendimientos estacionales que ya está instalado en Windows. Está conectado al formulario mediante el servidor local. No está conectado al servicio de Render y no calcula demandas, consumos, emisiones, letras ni XML.

## Uso desde el expediente

1. Abrir la app con su servidor local de Windows e importar un CEX residencial 3.2.
2. En Instalaciones, pulsar **Parámetros y rendimiento** y seleccionar un equipo importado.
3. Revisar los parámetros disponibles. **Guardar parámetros** conserva un borrador; **Recalcular y guardar** invoca el módulo instalado y actualiza los servicios correspondientes.
4. Guardar o recargar el expediente y exportar el CEX. Los borradores modificados sin recálculo, resultados que no coinciden y cambios posteriores de zona climática o tipo de edificio bloquean la exportación hasta recalcular.

El primer bloque permite revisar combustión, potencia, carga y aislamiento de calderas estándar importadas, y nominales de bombas de calor importadas con la configuración contrastada. Conserva características de caldera, acumulación, antigüedad, potencias y otros parámetros nativos. Las variantes todavía no contrastadas muestran una explicación y no habilitan la edición.

Los borradores y los datos que identifican el cálculo se almacenan dentro del JSON de las tablas de instalaciones existentes en Sheets. No requieren nuevas columnas. El guardado local, la transformación a las celdas de Apps Script y la exportación se verifican por separado.

En GitHub Pages se pueden guardar borradores, pero el recálculo requiere el servidor local. El endpoint solo admite peticiones desde el equipo local y el mismo origen de la app; no publica el runtime de CE³X en la red.

## Requisitos

- Windows con CE³X 3.2 instalado mediante su distribución oficial.
- Python 3 para el coordinador y .NET Framework 4 con su compilador C#.
- El Python 2.7 y los módulos de CE³X se cargan desde esa instalación; el repositorio no los redistribuye.

La ruta por defecto es `C:\Program Files (x86)\CE3Xv3.2`. Se puede configurar `CE3X_ENGINE_ROOT` o pasar `--root`. No se modifican la instalación, el registro, los controles de integridad ni los archivos CEX. El host temporal se elimina al terminar.

## Comprobación reproducible

```powershell
python scripts/estimate-systems.py --probe
python scripts/estimate-systems.py --check-building-runtime
python -m unittest discover -s tests -p test_estimate_systems.py -v
```

La prueba compara tres resultados de referencia: ACS 77,2 %, calefacción 153,0 % y refrigeración 113,9 %. Otra prueba modifica rendimientos nominales y verifica que cambian los resultados correspondientes. Se registran los SHA-256 del ejecutable y del módulo de rendimientos instalados para identificar el runtime utilizado.

## Contrato JSON inicial

El coordinador acepta JSON por la entrada estándar. Un caso mínimo de caldera es:

```json
{
  "context": {"zone": "B4", "buildingType": "Unifamiliar"},
  "systems": [{
    "id": "acs-1", "service": "ACS",
    "generator": "Caldera Estándar", "fuel": "GLP",
    "parameters": {
      "aislanteCaldera": "Bien aislada y mantenida",
      "rendCombCaldera": 90, "potenciaCaldera": 24,
      "cargaMediaCaldera": 0.2,
      "vectorTipoCaldera": [0, 0, 1, 0, 0, 1, 0]
    }
  }]
}
```

La potencia de caldera se expresa en kW, la combustión en porcentaje y la carga como fracción de 0 a 1. Las características de caldera siguen el vector nativo y no se proponen automáticamente. Solo se admiten servicios y parámetros enumerados; no se interpretan instrucciones, código ni pickle. El tamaño se limita a 64 KiB y la ejecución a 30 segundos.

## Límites de validación

Los casos comprobados no cubren todas las instalaciones ni sustituyen la comparación con el programa completo. Antigüedad, degradación, escalonamiento y demás variantes necesitan casos adicionales antes de habilitar su edición general. Los valores por defecto del módulo tampoco sustituyen una comprobación técnica del equipo.

La carga de la biblioteca gráfica y del módulo completo ya funciona con el contexto de dependencias de la instalación. El diagnóstico `--check-building-runtime` no carga expedientes ni produce calificaciones: comprueba esos requisitos y conserva la respuesta original de verificación del motor. En la prueba independiente, `contextVerified` es `false` y `buildingCalculationValidated` sigue siendo `false`.

Falta un contrato admitido para inicializar el contexto completo de CE³X y validar sus resultados. No se sustituye la verificación por una respuesta positiva ni se presentan objetos vacíos como cálculos válidos. Ver [hallazgos y requisito pendiente](full-engine-integration.md).

Para alojarlo en un servidor deben resolverse las condiciones de uso y redistribución, el contexto de ejecución admitido, el aislamiento de trabajos y la equivalencia de resultados. Este adaptador no convierte el servicio Linux Free existente en un motor energético.
