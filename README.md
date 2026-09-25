# Hotel Eco Antigua

Aplicación de reservas para un hotel conceptual en Antigua Guatemala. El producto permite buscar habitaciones para fechas y tamaño de grupo, crear una reserva, consultarla con su código y correo, cancelarla hasta 48 horas antes de la llegada y explorar una guía de Antigua y Sacatepéquez.

## Ejecutarla

Requisitos: Node.js 22.13 o posterior, Git y pnpm 11.25.0. La guía para instalar y abrir el proyecto está en [`docs/INICIO_PASO_A_PASO.md`](docs/INICIO_PASO_A_PASO.md).

```bash
pnpm install --frozen-lockfile
pnpm run test
pnpm run test:coverage
pnpm run typecheck
pnpm run build
```

Aplica las migraciones locales, inicia la API en una terminal y el frontend en otra. La guía describe esos pasos y las direcciones que debes abrir.

## Carpetas principales

| Carpeta o archivo | Para qué sirve |
| --- | --- |
| `frontend/` | React, Vite, guía de turismo y formularios; se construye con `pnpm run build:frontend`. |
| `backend/` | Worker/API y reglas de fechas, capacidad, precios, disponibilidad y estados; se construye con `pnpm run build:backend`. |
| `db/` y `drizzle/` | Modelo relacional y migraciones de reservas en D1. |
| `api/` | Colección Postman para comprobar la API. |
| `k6/` | Escenario de carga de cinco minutos a 50 usuarios. |
| `.github/workflows/` | Pipeline inicial de calidad e integración continua. |
| `docs/` | Entregables de análisis, trazabilidad, arquitectura y guía del equipo. |
| `azure/` y `azure-server.js` | Adaptador de PostgreSQL y servidor para ejecutar la aplicación en Azure App Service. |
| `output/pdf/` | PDF de fase 1 generado desde la documentación del proyecto. |
| `output/newman-report.json` | Reporte de ejecución local de la colección API. |

La ejecución local se encuentra documentada en [`docs/EVIDENCIA_EJECUCIONES_LOCALES.md`](docs/EVIDENCIA_EJECUCIONES_LOCALES.md). La nube, las cuentas del equipo, la revisión formal de casos y la defensa todavía requieren configurarse por el grupo; consulta [`docs/INICIO_PASO_A_PASO.md`](docs/INICIO_PASO_A_PASO.md).

Para publicar la aplicación completa en Azure, sigue [`docs/DESPLIEGUE_AZURE_PASO_A_PASO.md`](docs/DESPLIEGUE_AZURE_PASO_A_PASO.md). Configura las variables y credenciales en Azure y GitHub; no subas contraseñas al repositorio.

Para actualizar el PDF y volver a crear el ZIP después de completar la información del equipo y las evidencias, haz doble clic en `PREPARAR_ENTREGA.bat`.

Los diagramas de arquitectura y diagramas funcionales editables están en [`docs/DIAGRAMAS.md`](docs/DIAGRAMAS.md). El PDF de fase 1 incluye un anexo gráfico de cuatro páginas.

## Información del producto

La habitación, los precios, el inventario, la política de cancelación y el nombre son valores de demostración del proyecto. Confírmalos y cámbialos con el hotel antes de aceptar reservas reales. No se procesa ningún pago. La aplicación guarda nombre, correo, teléfono opcional y fechas en la base de datos para administrar la reserva; el código y correo deben coincidir para consultar o cancelar.

## Línea base y alcance

La aplicación fue generada con ayuda de ChatGPT/Codex para este proyecto. No había repositorio de origen ni pruebas heredadas: la línea base inicial es **0 pruebas del proyecto de origen**. Las pruebas del equipo están en `backend/domain.test.js` y `frontend/booking-form.test.js`; se distinguen de la línea base. Declara esta procedencia en tu registro, crea commits graduales con la participación de cada integrante y añade el enlace al repositorio académico.

Las pruebas unitarias ejecutan las reglas puras con `node:test`. Las pruebas de API son una colección Postman separada y no se deben contar como pruebas unitarias. Las respuestas de defectos, carga, análisis estático, pipeline y despliegue solo se registran después de ejecutarlos y conservar evidencia.

## Despliegue

El prototipo local usa Cloudflare Workers y D1. Para publicar la aplicación completa con la cuenta Azure for Students del equipo, sigue [`docs/DESPLIEGUE_AZURE_PASO_A_PASO.md`](docs/DESPLIEGUE_AZURE_PASO_A_PASO.md). La URL pública queda pendiente de registrar después de que Azure complete la publicación.

## Fuentes de la guía local

- [Mapa turístico de Antigua Guatemala, INGUAT](https://inguat.gob.gt/es/descargas-inguat-guatemala/41-mapas.html?download=1165%3Amapa-turistico-de-antigua-guatemala-espanol-marzo-2026)
- [Guía turística de Sacatepéquez 2026, INGUAT](https://inguat.gob.gt/es/descargas-inguat-guatemala/46-guias-turisticas.html?download=1148%3Aguia-turistica-de-sacatepequez-2026)
- [Sitio del Centro del Patrimonio Mundial de UNESCO para Antigua Guatemala](https://whc.unesco.org/en/list/65/)

La guía no publica horarios, precios de entrada ni condiciones de acceso, porque pueden cambiar. Verifica esa información directamente antes del viaje.
