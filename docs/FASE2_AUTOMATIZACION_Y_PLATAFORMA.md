# Fase 2 — automatización y plataforma

Esta guía deja preparado el código fuente de pruebas, el pipeline y el escenario de carga. Verificación local del prototipo: **53/53 pruebas unitarias aprobadas**, **97.00 % de líneas, 94.20 % de ramas y 82.35 % de funciones** en los dos módulos puros cubiertos, compilación de frontend/backend y verificación de tipos aprobadas; la colección Newman completó **19 solicitudes y 29 aserciones sin fallos** contra D1 local. Esta evidencia corresponde solo a la corrida local de trabajo; SonarCloud, revisiones de GitHub, pipeline del repositorio académico, k6, despliegue del equipo y sus videos siguen pendientes.

## Pipeline incluido

`.github/workflows/quality.yml` se ejecuta en cada push y pull request a `dev`, `qa` y `main`. Encadena instalación reproducible, pruebas unitarias, cobertura, tipos, compilación de ambos proyectos, migración D1 local, API local y Newman. La migración versionada está en `drizzle/`; genera otra solo cuando cambies el esquema. Si configuras `SONAR_TOKEN`, también ejecuta el análisis en SonarCloud. Sin esa configuración, el resto del pipeline sigue y Sonar queda omitido.

En GitHub agrega el secreto `SONAR_TOKEN` y la variable `SONAR_ENABLED=true` en **Settings → Secrets and variables → Actions**. En `sonar-project.properties` sustituye `sonar.projectKey` y `sonar.organization` por los valores de tu proyecto SonarCloud. El archivo nunca lleva tokens.

## Flujo de pull requests

1. Crea `dev`, `qa` y `main` desde el repositorio académico.
2. Configura reglas para `qa` y `main`: exigir pull request, una revisión de otro integrante y el check `quality`; bloquear push directo.
3. Abre tres pull requests con cambios reales y comentarios de revisión. El historial de GitHub es la evidencia. Una rama o un comentario generado por una plantilla no cuenta como revisión.
4. Adjunta salida del pipeline, mediciones Sonar antes y después y resultados reales de Newman/k6 al informe de fase 2.

## Cuentas de nube

El prototipo usa Cloudflare Workers con D1. Para el despliegue académico del grupo con Azure for Students, sigue [`DESPLIEGUE_AZURE_PASO_A_PASO.md`](DESPLIEGUE_AZURE_PASO_A_PASO.md): el adaptador Azure ejecuta la misma API sobre Azure App Service y PostgreSQL, y el flujo `.github/workflows/azure-deploy.yml` publica desde GitHub Actions. Guarda el perfil de publicación como secreto de GitHub y `DATABASE_URL` en la configuración privada de App Service. No subas credenciales al código. Revisa la cuota gratuita y el costo estimado en Azure antes de crear cada recurso.

Si el equipo usa Cloudflare, conserva el flujo indicado en las secciones siguientes. No mezcles credenciales ni bases entre proveedores.

La primera migración aplicada está versionada en `drizzle/0000_hotel_reservations.sql`. Para cambios futuros del esquema, genera una migración nueva con `pnpm run db:generate`; no edites el historial que ya se aplicó.

## Entregables preparados

- **E9 Ramas y cambios:** estrategia `dev → qa → main`, tres PR con revisión de otro integrante y reglas para bloquear merge en falla, pendientes en GitHub.
- **E10 Unitarias:** 36 casos automatizados de backend y 17 de frontend con Node `node:test`; son reglas aisladas y no solicitudes HTTP. `pnpm run test:coverage` calcula cobertura nativa de Node para esos módulos; compara los módulos críticos con la línea base de cero pruebas y confirma un aumento mínimo de 20 puntos porcentuales.
- **E11 API:** 19 solicitudes Postman con 29 aserciones de estado y contenido, incluyendo búsqueda, validaciones, reserva, consulta, acceso denegado y cancelación. Newman se ejecuta desde el pipeline.
- **E12 Análisis estático:** archivo `sonar-project.properties`, job SonarCloud condicionado a secretos configurados y plantilla para comparar bugs, vulnerabilidades, code smells, duplicación y deuda técnica.
- **E13 CI:** `.github/workflows/quality.yml` construye frontend y Worker con procesos separados, ejecuta unitarias/cobertura, analiza Sonar, migra D1 localmente y corre la colección Newman. Con secretos de Cloudflare configurados, el job de despliegue publica `main` en el Worker. Un check de Sonar debe quedar requerido en las reglas de rama.
- **E14 Carga:** `k6/hotel-eco-antigua.js` ejecuta 50 VU con 1 min de rampa, 5 min sostenidos y 30 s de rampa de salida en búsqueda y consulta de reserva. Se debe ejecutar contra nube pública.

## Política de ramas

| Rama | Ambiente | Cómo llega el cambio | Control antes de promover |
| --- | --- | --- | --- |
| `dev` | Integración del equipo | Pull request de una rama de trabajo | Build y unitarias en verde. |
| `qa` | Calidad | Pull request desde `dev` | Aprobación de otro integrante, quality gate y pruebas API en verde; ejecutar casos de regresión. |
| `main` | Producción | Pull request desde `qa` | Aprobación independiente, checks obligatorios, despliegue y smoke test. |

La rúbrica acepta `DEV`, `QA` y `PROD` o `main`; el equipo puede renombrar ramas si documenta equivalencia. Bloquea push directo a `qa` y `main`. Tres PR deben incluir qué cambia, pruebas y revisión real; toma una captura del comentario/revisión.

## SonarCloud y GitHub

1. Crea un proyecto SonarCloud desde el repositorio y copia organización y clave de proyecto a `sonar-project.properties`.
2. En el repositorio abre **Settings → Secrets and variables → Actions → New repository secret**. Añade `SONAR_TOKEN`.
3. Asegura que la corrida de Sonar termina y que el quality gate está activo. Corrige todos los hallazgos Blocker/Critical que reporte el escaneo inicial, repite el escaneo y conserva evidencia anterior y posterior.
4. En **Settings → Branches/Rules**, exige los checks `quality` y `sonar` antes de permitir merge a `qa` y `main`. Si el nombre del check en Actions cambia, selecciona el que presenta el repositorio.

## Despliegue automatizado

El workflow de Cloudflare publica en Workers al integrar `main` solo si se crean estos secretos del propio equipo: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` y `CLOUDFLARE_D1_DATABASE_ID`. Crea D1 en la cuenta Cloudflare que el equipo administrará y conecta su ID al job. La base de publicación de Sites usa infraestructura de Sites; para un GitHub Actions independiente, despliega el mismo código/migraciones a una base que el equipo controle. Nunca copies el token de publicación de Codex/Sites a GitHub. Para Azure, sigue únicamente la guía enlazada arriba.

Configura el identificador real de D1 mediante el script `scripts/configure-cloudflare.mjs`; luego verifica en el resumen del job el commit desplegado. Si el equipo elige Render/Railway u otro proveedor, adapta solo el último job y describe la equivalencia de ambientes; no declares un despliegue hecho hasta abrir el enlace público.

## Newman y API

Importa la colección Postman, fija `baseUrl` a `http://localhost:8787` para la API local o a la URL pública de la API para la evidencia externa, y ejecuta completa. Newman genera un resumen en consola dentro de Actions. Guarda el job exitoso y captura los casos negativos esperados (por ejemplo 404 al usar correo equivocado): una respuesta de error esperada también es una prueba aprobada.

## k6

Necesita URL, código y correo de una reserva activa de prueba. Define `TARGET_URL`, `BOOKING_CODE` y `BOOKING_EMAIL` en variables de entorno de la terminal que ejecutará k6. El correo de prueba no debe ir en el repositorio ni en capturas públicas. El escenario realiza dos GET por iteración y valida ambos códigos de respuesta.

| Métrica obligatoria | Dónde aparece en k6 | Comparación |
| --- | --- | --- |
| Promedio | `http_req_duration` | Anotar valor real y configuración. |
| Percentil 95 | `http_req_duration p(95)` | Debe ser < 2,000 ms para RNF-01. |
| Throughput | `http_reqs` (solicitudes/s) | Reportar junto a VU y región. |
| Tasa de error | `http_req_failed` | Debe ser < 1 % para RNF-02. |

Completa `docs/reporte_carga.md` después de correrlo. Si el host gratuito se duerme o se inicia en frío, conserva la medición, separa el arranque en la interpretación y repite el escenario cuando esté estable.
