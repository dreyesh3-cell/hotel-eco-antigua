# LEE ESTO PRIMERO: qué hacer para entregar

Esta guía separa **lo que ya está hecho** de **lo que todavía debes hacer tú con tu equipo**. No entregues el ZIP actual sin completar los pendientes de fase 1.

## Fechas

- **Fase 1: viernes 25 de septiembre de 2026, 23:59, hora de Guatemala.**
- **Fase 2: viernes 30 de octubre de 2026, 23:59, hora de Guatemala.**

## 1. Esto ya está preparado

- La aplicación de reservas y la guía turística de Antigua y alrededores.
- El documento de análisis, arquitectura y ocho casos de uso.
- Diagramas de contexto y arquitectura, y cuatro diagramas funcionales: flujo de reserva, casos de uso, secuencia y estados.
- 36 casos de prueba diseñados y una tabla para relacionar pruebas con requisitos.
- Código con pruebas automatizadas, colección de pruebas de API, pipeline inicial y escenario de carga.
- Un PDF base y un ZIP con el proyecto.

Las pruebas locales que ya corrimos están resumidas en [`EVIDENCIA_EJECUCIONES_LOCALES.md`](EVIDENCIA_EJECUCIONES_LOCALES.md). **No equivalen** a una ejecución formal del equipo en el repositorio, herramienta de pruebas o nube del curso.

## 2. Pendientes para poder entregar la fase 1

1. **Revisa los datos del equipo.** Los nombres y carnés ya están en [`FASE1_DESCRIPCION_Y_DISENO.md`](FASE1_DESCRIPCION_Y_DISENO.md) y en la portada del PDF. Completa la fecha y el enlace GitHub cuando los tengas. Cada integrante llena su propia [`bitacora_individual.md`](bitacora_individual.md).
2. **GitHub ya está publicado.** La captura que compartiste muestra el repositorio público `dreyesh3-cell/hotel-eco-antigua`, en la rama `main`, con dos commits. No pulses **Publish repository** ni **Push origin** desde esta carpeta todavía: la copia local no tiene commits y puede no coincidir con la versión subida desde la web. Usa el enlace del repositorio en la entrega. Más adelante, sincroniza ambas copias desde GitHub Desktop o solicita ayuda antes de enviar cambios desde la computadora.
3. **Prueba la aplicación y registra los resultados.** Sigue la sección 3 para abrirla. Recorre los 36 casos de [`matriz_casos_prueba.csv`](matriz_casos_prueba.csv) y anota el resultado real en [`registro_ejecucion.csv`](registro_ejecucion.csv). No dejes todos los casos como aprobados sin probarlos.
4. **Registra las pruebas en la herramienta pedida por el curso.** Importa la matriz en TestLink, Xray/Zephyr o Azure Test Plans, según lo que el equipo pueda usar. Guarda capturas o exportaciones de la corrida. La matriz CSV por sí sola es el diseño; no demuestra que las pruebas se ejecutaron.
5. **Documenta defectos reales.** La tarea pide diez hallazgos con pasos y evidencia. Usa [`defectos.csv`](defectos.csv) y [`EVIDENCIA_Y_DEFECTOS.md`](EVIDENCIA_Y_DEFECTOS.md). No inventes fallos: si no encuentran diez, documenten los que sí pudieron reproducir y consulten al catedrático cómo proceder.
6. **Publica la aplicación en una cuenta de nube del equipo.** La dirección local `localhost` solo funciona en tu computadora; no sirve como enlace público. Como el equipo dispone de Azure for Students, sigan [`DESPLIEGUE_AZURE_PASO_A_PASO.md`](DESPLIEGUE_AZURE_PASO_A_PASO.md), que publica la página, la API y la base de datos. Abre el enlace publicado en una ventana privada y completa una reserva de prueba.
7. **Graba el video de defensa.** Para dos integrantes, máximo diez minutos: hasta cinco minutos por persona. Cada quien se presenta con nombre y carné, mantiene la cámara encendida y muestra la aplicación en vivo. Incluyan tres casos de prueba, uno fallido.
8. **Actualiza los documentos con los resultados verdaderos.** Añade URL del repositorio, URL pública, commit, herramienta, ambiente, fechas, resultados, métricas, defectos y enlaces a las evidencias.
9. **Regenera el PDF y el ZIP.** Después de llenar nombres y añadir evidencia, haz doble clic en `PREPARAR_ENTREGA.bat` dentro de la carpeta del proyecto y espera el mensaje “Terminado”. Si Windows pregunta si permites ejecutarlo, confirma. Esto actualiza el PDF y vuelve a crear el ZIP sin carpetas grandes de instalación. Los archivos aparecen en la carpeta `output`.
10. **Entrega en la plataforma del curso.** Adjunta un ZIP único actualizado. En el texto de la entrega pega tres enlaces: repositorio GitHub, aplicación pública y video. Comprueba que abren desde una sesión distinta.

### Orden exacto de lo que se entrega en fase 1

1. **Un ZIP actualizado** con el código de la aplicación, PDF con nombres y resultados, matrices, defectos encontrados y evidencias.
2. **Enlace al repositorio GitHub** accesible para el catedrático.
3. **Enlace a la aplicación pública** que abre fuera de tu computadora.
4. **Enlace al video de defensa**.

El PDF y las matrices ya están preparados como base, pero **el PDF y el ZIP actuales todavía son borradores** mientras no se completen datos y evidencias reales.

## 3. Cómo abrir la aplicación en tu computadora

Haz esto si necesitas probar la aplicación o grabar el video antes de publicarla.

### Primera vez

1. Instala **Node.js 22.13 o posterior** desde [nodejs.org](https://nodejs.org/) y **GitHub Desktop** desde [desktop.github.com](https://desktop.github.com/).
2. Abre la carpeta `hotel-eco-antigua` en Visual Studio Code.
3. En el menú, selecciona **Terminal → Nueva terminal**.
4. Copia y pega estas líneas, una a la vez, esperando que termine cada una:

   ```powershell
   corepack enable
   corepack prepare pnpm@11.25.0 --activate
   pnpm install --frozen-lockfile
   pnpm run build
   pnpm run db:migrate:local
   ```

### Cada vez que quieras iniciar la aplicación

1. En Visual Studio Code abre **Terminal → Nueva terminal** y escribe `pnpm run dev:backend`. Déjala abierta.
2. Abre una segunda terminal desde **Terminal → Nueva terminal**, escribe `pnpm run dev:frontend` y déjala abierta.
3. Abre [http://localhost:5173](http://localhost:5173) en el navegador.
4. Para detenerla, vuelve a cada terminal y pulsa **Ctrl+C**.

`localhost` es solo para trabajar en tu computadora. Para que el catedrático pueda ver la aplicación necesitas el enlace público de nube del paso 6 de la fase 1.

### Cómo hacer la prueba manual de cada caso

1. Abre `docs/matriz_casos_prueba.csv` con Excel. Busca el primer caso, por ejemplo `CP-01`.
2. Lee `datos_de_prueba` y escribe esos valores en la aplicación o en Postman si los pasos del caso dicen que es una prueba de API.
3. Sigue exactamente `pasos` y compara lo que pasó con `resultado_esperado`.
4. En `docs/registro_ejecucion.csv`, encuentra el mismo ID y llena: fecha, tu nombre, resultado observado y estado. Usa **APROBADO** si coincide con lo esperado, **FALLIDO** si no coincide y **BLOQUEADO** si no pudiste correrlo; explica por qué.
5. Guarda una captura por cada fallo y escribe el nombre del archivo en la columna `evidencia`. No muestres nombres, teléfonos ni correos reales.
6. Si encontraste un fallo reproducible, anótalo también en `docs/defectos.csv` y asígnale el mismo ID de defecto.

### Pruebas automáticas ya preparadas

- Para correr las **53 pruebas unitarias**, abre una terminal en la carpeta `hotel-eco-antigua` y escribe `pnpm run test`. No necesitas abrir la página para estas pruebas.
- Para repetir las **pruebas de API**, primero inicia el backend y aplica la base local como se indica en “Primera vez”; con el backend abierto, en otra terminal escribe `pnpm run test:api`.
- Estos comandos comprueban el código. No sustituyen el registro manual de los 36 casos ni la evidencia que solicita el curso.

## 4. Lo que falta para la fase 2

La fecha límite es el 30 de octubre. No confundas los materiales preparados con las evidencias que debe producir el equipo.

1. Crear ramas de trabajo `dev`, `qa` y `main` en GitHub; bloquear cambios directos a `qa` y `main`.
2. Abrir tres pull requests, obtener revisiones reales de otra persona y guardar evidencia.
3. Ejecutar el pipeline de GitHub y SonarCloud, corregir los problemas graves y guardar los resultados antes y después.
4. Completar el mínimo de **30 pruebas frontend y 30 backend**. Ahora hay 17 de frontend y 36 de backend, así que faltan 13 pruebas frontend como mínimo.
5. Ejecutar la colección de API: localmente ya aprobó 19 solicitudes y 29 aserciones; el equipo debe guardar también el resultado de su propia ejecución.
6. Ejecutar el escenario k6 en la nube con rampa de 0 a 50 usuarios y cinco minutos sostenidos; guardar el reporte de latencia, solicitudes y errores.
7. Grabar el video de fase 2, actualizar el informe y entregar el ZIP y enlaces de esa fase.

## 5. Si algo no funciona

- Si una fecha o formulario falla, anota lo que escribiste y el mensaje que aparece.
- Si no sabes si un archivo se debe entregar, incluye los informes y CSV del equipo dentro del ZIP; no incluyas la carpeta `node_modules`.
- Si no tienes cuenta de GitHub, nube o herramienta de pruebas, pide al integrante responsable que la configure con su cuenta y te comparta el enlace. No compartan contraseñas ni tokens.
- No marques una tarea como terminada hasta tener el enlace, captura o reporte que lo compruebe.
