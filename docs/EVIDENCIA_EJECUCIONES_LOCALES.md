# Evidencia de ejecución local

**Proyecto:** Hotel Eco Antigua  
**Fecha local:** 24 de septiembre de 2026  
**Ambiente:** Windows, Node.js 24.19.0, D1 local de Wrangler, frontend Vite en `http://127.0.0.1:5173` y API en `http://127.0.0.1:8787`.

| Actividad | Resultado | Alcance |
| --- | --- | --- |
| Pruebas unitarias | 53 aprobadas, 0 fallidas | Reglas de reserva y formulario de búsqueda. |
| Cobertura nativa de Node | 97.00 % líneas; 94.20 % ramas; 82.35 % funciones | `backend/domain.js` y `frontend/booking-form.js`; no representa toda la aplicación. |
| Verificación de tipos | Aprobada | `tsconfig.frontend.json`. |
| Compilación | Aprobada | Builds independientes de frontend y Worker. |
| Migración D1 local | Aplicada | `0000_hotel_reservations.sql`, 5 sentencias. |
| Newman | 19 solicitudes y 29 aserciones aprobadas; 0 fallos | Flujo API local: salud, disponibilidad, reserva, consulta, acceso denegado y cancelación. |

## Reproducir

1. Sigue [`INICIO_PASO_A_PASO.md`](INICIO_PASO_A_PASO.md) para instalar dependencias y arrancar backend y frontend.
2. Con ambos procesos abiertos, ejecuta `pnpm run test`, `pnpm run test:coverage`, `pnpm run typecheck`, `pnpm run build` y `pnpm run test:api`.
3. Conserva la salida y agrega URL, commit, fecha y navegador de tu propio ambiente. La colección crea una reserva de demostración en la base local.

## Pendiente del equipo

Estos resultados locales no reemplazan una corrida en TestLink/Xray/Azure Test Plans, SonarCloud, el pipeline del repositorio académico, el escenario k6 de cinco minutos, evidencia de despliegue o los videos de exposición. Registra por separado esos resultados cuando los ejecutes. Los 36 casos de `matriz_casos_prueba.csv` siguen pendientes de ejecución formal y las plantillas DEF-01 a DEF-10 no son defectos encontrados.
