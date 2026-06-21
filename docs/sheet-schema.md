# Google Sheet Schema

Hoja principal: `referencias`

| Columna | Descripcion |
| --- | --- |
| id | Identificador interno UUID |
| referenciaCatastral | Referencia catastral |
| estado | BORRADOR, PENDIENTE_DATOS, COMPLETA, CEX_GENERADO, CERTIFICADO_GENERADO, ERROR |
| gestor | Persona que captura o actualiza la ficha |
| direccion | Direccion del inmueble |
| municipio | Municipio |
| provincia | Provincia |
| codigoPostal | Codigo postal |
| uso | Uso del inmueble |
| superficieUtil | Superficie util indicada para CE3X |
| superficieCatastral | Superficie de Catastro, si se conoce |
| anioConstruccion | Ano de construccion |
| plantas | Numero de plantas |
| orientacionPrincipal | Orientacion principal |
| tipoEdificio | Piso, unifamiliar, local, etc. |
| envolvente | Datos resumidos de envolvente |
| instalaciones | Datos resumidos de instalaciones |
| observaciones | Comentarios libres |
| cexGenerado | Nombre del ultimo fichero .cex generado |
| fechaCexGenerado | Fecha/hora de generacion .cex |
| createdAt | Fecha/hora de alta |
| updatedAt | Fecha/hora ultima modificacion |
| rawJson | JSON completo de la ficha para no perder campos futuros |

El campo `rawJson` permite evolucionar el formulario sin rehacer el Sheet cada vez.
