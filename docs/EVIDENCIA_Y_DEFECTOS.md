# Ejecución de casos y documentación de defectos

## Registrar una corrida

En TestLink, Jira/Xray/Zephyr o Azure DevOps Test Plans crea un plan llamado `Hotel Eco Antigua — Regresión`. Importa `matriz_casos_prueba.csv` o copia sus campos y conserva estos IDs: CP-01 a CP-36. Añade una ejecución por caso. Para cada una registra resultado, fecha, ambiente, navegador, versión/commit y evidencia sin datos personales. Actualiza `trazabilidad.csv` con APROBADO, FALLIDO o BLOQUEADO, y el ID de defecto relacionado.

Tasa de aprobación = casos aprobados ÷ casos ejecutados × 100. Reporta aparte bloqueados y no ejecutados. Densidad por módulo = defectos válidos del módulo ÷ casos ejecutados del módulo. No uses como numerador una hipótesis, un duplicado o un error de configuración sin confirmar.

## Plantilla de defecto

Completa un archivo o work item separado por cada defecto confirmado:

```text
ID:
Título claro:
Módulo / requerimiento / caso de prueba:
Severidad (Blocker / Critical / Major / Minor / Trivial):
Prioridad (P1 / P2 / P3 / P4):
Ambiente, versión/commit, navegador y fecha:
Precondiciones:
Pasos exactos para reproducir:
Datos de prueba sin datos reales:
Resultado esperado:
Resultado obtenido:
Frecuencia (n de n intentos):
Evidencia adjunta y nombre de archivo:
Estado y responsable:
```

## Diez registros pendientes

`defectos.csv` contiene DEF-01 a DEF-10 vacíos para captura durante la prueba. Cada ID se debe asignar una sola vez a un hallazgo reproducible. Completa severidad, prioridad, pasos y evidencia. Si dos casos muestran el mismo fallo en la misma causa, vincula ambos casos al mismo DEF; no cuentes copias como hallazgos distintos.

No publiques la base de datos, correo del huésped, teléfono, token, secreto, captura del proveedor con datos de cuenta ni clave de reserva activa. Usa datos sintéticos.
