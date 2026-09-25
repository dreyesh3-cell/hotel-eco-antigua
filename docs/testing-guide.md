# Guía de pruebas unitarias y dobles de prueba

Ejecuta `pnpm run test`. Node muestra cuántas pruebas pasaron y si hubo errores. Estas pruebas ejercitan funciones pequeñas sin iniciar el sitio ni hacer llamadas HTTP.

## Dobles utilizados

1. `clock` sustituye la hora real por 10 de abril de 2026 para comprobar llegada pasada, futura y el límite de cancelación de 48 horas de modo repetible.
2. `id` y `code` sustituyen generadores aleatorios para comprobar que la creación produce un registro identificable sin depender de valores variables.
3. `reservationsForRoom` en `calculateAvailability` es un repositorio falso pequeño de reservas que permite simular un cruce, una salida consecutiva y una cancelación sin abrir la base de datos.

Los dobles aíslan reloj, aleatoriedad y persistencia; si se conectaran a D1, la hora, las claves y los datos de prueba harían la ejecución menos determinista y más lenta. Los tests de API comprueban la conexión HTTP y D1 por separado.

## Reparto en módulos críticos

| Módulo | Archivo | Enfoque |
| --- | --- | --- |
| Validación de disponibilidad del navegador | `frontend/booking-form.test.js` | Fechas, huéspedes, noches máximas, calendario inválido y presentación de moneda. |
| Reglas de dominio del servidor | `backend/domain.test.js` | Datos, tarifa, capacidad, inventario, estados y cancelación. |
| Persistencia/API | `api/Hotel-Eco-Antigua.postman_collection.json` | Requests reales contra rutas y D1. |

## Medir cobertura

Línea base del repositorio de origen: 0 pruebas, 0 % reportado. Para presentar cobertura, añade un runner compatible con cobertura para JavaScript/TypeScript (por ejemplo, Vitest + V8), activa `coverage` y anota en la entrega la versión/configuración. Compara cobertura **por módulo crítico** con la misma herramienta y configuración en ambos commits. El incremento requerido es de 20 puntos porcentuales en los módulos críticos; no presentes el total de pruebas como porcentaje de cobertura.
