# Reporte de pruebas de carga E14

**Fecha y hora:** [completar]  
**Commit:** [SHA]  
**URL desplegada / proveedor / región / plan:** [completar]  
**Versión Node, k6, sistema de ejecución:** [completar]  
**Datos:** reservas activas de prueba; no adjuntar correo/código reales.  
**Escenario:** 0→50 VU en 1 minuto, 50 VU sostenidos 5 minutos, rampa de salida de 30 segundos.  
**Endpoints:** `/api/availability` y `/api/reservations` (consulta por código/correo).

| Métrica | Resultado medido | RNF | ¿Cumple? |
| --- | --- | --- | --- |
| Tiempo promedio | [ms] | Informar | [sí/no] |
| Percentil 95 | [ms] | < 2,000 ms | [sí/no] |
| Throughput | [req/s] | Informar | [sí/no] |
| Tasa de error | [%] | < 1 % | [sí/no] |

### Interpretación y decisión

[Explica el comportamiento de las dos rutas, si hubo arranque en frío, qué RNF se cumple, posibles cuellos de botella y una acción priorizada. Adjunta el resumen original de k6 y no inventes resultados.]
