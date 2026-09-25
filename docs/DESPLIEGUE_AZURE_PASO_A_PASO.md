# Publicar Hotel Eco Antigua en Azure (guía para principiantes)

Esta guía usa la suscripción **Azure for Students** que aparece en tus capturas. Allí se ve una cuota promocional para Azure Database for PostgreSQL durante 12 meses, con límites mensuales indicados por Azure. La oferta de tu portal muestra vencimiento el **29 de agosto de 2027**. Revisa el costo estimado en cada pantalla antes de crear recursos: el uso que supere una cuota puede consumir crédito o generar cargos.

## Qué vas a publicar

La publicación necesita tres piezas:

1. **Azure App Service:** entrega la página y atiende la API de reservas.
2. **Azure Database for PostgreSQL:** guarda las reservas.
3. **GitHub Actions:** copia los cambios de la rama `main` a App Service cuando se suben.

El proyecto ya incluye un adaptador de Azure, el esquema de PostgreSQL y el flujo de GitHub Actions. Azure creará las tablas al iniciar la aplicación. No subas contraseñas al repositorio.

## Parte A: crea la aplicación web

1. Entra a [portal.azure.com](https://portal.azure.com/) con la cuenta de estudiante.
2. En la barra superior busca **App Services** y ábrelo.
3. Selecciona **Crear** → **Aplicación web**.
4. Completa estos datos:

   - **Suscripción:** Azure for Students.
   - **Grupo de recursos:** pulsa **Crear nuevo** y escribe `rg-hotel-eco-antigua`.
   - **Nombre:** `hotel-eco-antigua-` seguido de números o letras. Azure exige que el nombre no esté usado por otra persona; por ejemplo, `hotel-eco-antigua-dreyes2026`.
   - **Publicar:** Código.
   - **Pila de tiempo de ejecución:** Node 22 LTS.
   - **Sistema operativo:** Linux.
   - **Región:** elige una disponible y anótala. Usa la misma para la base de datos.
   - **Plan de App Service:** elige **Free F1** si aparece disponible.

5. En **Revisar y crear**, mira el resumen de costos y confirma que el plan elegido sea **F1 (Free)**. Luego pulsa **Crear**.
6. Espera a que Azure termine. No cierres la pestaña mientras diga que la implementación está en curso.

## Parte B: crea la base de datos

1. En la barra superior busca **Azure Database for PostgreSQL flexible servers**.
2. Pulsa **Crear** y usa la misma suscripción y el grupo `rg-hotel-eco-antigua`.
3. Pon un nombre único, por ejemplo `hotel-eco-antigua-db-dreyes2026`.
4. Selecciona la misma región que App Service.
5. Elige PostgreSQL 16 o la versión estable que aparezca.
6. En cómputo, selecciona **Burstable B1ms** si el portal muestra esa opción como parte de la cuota gratuita. Deja el almacenamiento en **32 GiB o menos** y desactiva alta disponibilidad para esta demostración.
7. En **Método de autenticación**, selecciona **Autenticación de PostgreSQL**. La aplicación se conectará con usuario y contraseña. No selecciones “Solo Microsoft Entra” ni la opción combinada para esta configuración.
8. Crea un usuario administrador y una contraseña. Guárdalos en un lugar privado; no los pongas en GitHub ni en un documento público.
9. En **Redes**, activa el acceso público necesario para que App Service llegue a PostgreSQL. Para esta práctica puedes usar la opción de acceso desde servicios Azure si está disponible. Si el portal no la ofrece, crea reglas de firewall para las direcciones de salida que aparecen en la página **Información general** de tu App Service.
10. En **Revisar y crear**, verifica otra vez región, nivel B1ms, almacenamiento y costo estimado. Crea el servidor.
11. Cuando termine, abre la base de datos creada y copia el nombre del servidor, por ejemplo `hotel-eco-antigua-db-dreyes2026.postgres.database.azure.com`.

La oferta de Azure for Students muestra hasta **750 horas mensuales de B1ms**, **32 GB de almacenamiento** y **32 GB de respaldo** para PostgreSQL durante 12 meses. El estimado de precio de la pantalla puede mostrar la tarifa normal antes de aplicar la cuota. Confirma que el servidor usa exactamente el B1ms y revisa el consumo en **Suscripción → Servicios gratuitos** después de crearlo. La cuota no cubre tamaños mayores ni uso que exceda sus límites; el portal indica cargos para el exceso. [Detalles de Azure for Students](https://azure.microsoft.com/en-us/free/students) y [cómo evitar cargos por superar las cuotas](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/avoid-charges-free-account).

La oferta de App Service para estudiantes tiene límites de uso gratuito, entre ellos **1 GB de almacenamiento y una hora de cómputo al día**. Es apropiada para una demostración de bajo tráfico; revisa el uso en **Suscripción → Servicios gratuitos**. Si necesitas que la aplicación permanezca disponible con tráfico constante, consulta el costo del plan antes de ampliarlo. [Detalles de App Service para estudiantes](https://azure.microsoft.com/en-us/free/students).

## Parte C: conecta la app con PostgreSQL

1. En el recurso PostgreSQL, abre **Bases de datos** y crea una base llamada `hoteleco` si Azure no creó una por ti.
2. Regresa a **App Services**, abre tu aplicación y entra a **Configuración → Variables de entorno** (en algunas pantallas aparece como **Configuration → Application settings**).
3. Agrega una variable:

   - **Nombre:** `DATABASE_URL`
   - **Valor:** `postgresql://USUARIO:CONTRASEÑA@NOMBRE-SERVIDOR:5432/hoteleco?sslmode=require`

   Sustituye los tres valores en mayúsculas por los tuyos. Usa el formato de conexión que proporciona Azure si aparece el botón **Connection strings**. Si tu contraseña contiene caracteres especiales como `@`, `:`, `/` o `#`, usa la cadena que genera Azure o codifica esos caracteres para una URL.

4. Guarda los cambios. Azure reiniciará la aplicación.
5. En **Configuración → Configuración general**, verifica **Node 22 LTS** y coloca `npm start` como **comando de inicio** si el campo está disponible.

## Parte D: permite que GitHub publique los cambios

### 1. Copia el nombre exacto de la aplicación

En App Service → **Información general**, copia el valor **Nombre**. Lo necesitarás en GitHub.

### 2. Habilita la descarga del perfil de publicación

Azure muestra “La autenticación básica está deshabilitada” porque el flujo de este manual usa un perfil de publicación. El perfil requiere **SCM Basic Auth**.

1. En App Service, abre **Configuración → Configuración** y luego la pestaña **Configuración general**. En algunos diseños la opción está directamente bajo **Configuración → Configuración general**.
2. Busca **SCM Basic Auth Publishing Credentials** (Credenciales de publicación de autenticación básica de SCM), cámbiala a **On / Activado** y pulsa **Guardar**. No hace falta activar **FTP Basic Auth Publishing Credentials**.
3. Si tu aplicación es Linux y la descarga sigue deshabilitada, abre **Variables de entorno / Application settings**, agrega `WEBSITE_WEBDEPLOY_USE_SCM` con valor `true`, guarda y reinicia la app.

Este perfil es una credencial de despliegue. Guárdalo solo como secreto privado en GitHub y no lo compartas ni lo subas como archivo. El flujo actual de GitHub Actions necesita que SCM Basic Auth siga activado; si después lo desactivas, el despliegue automático dejará de autenticar hasta cambiar el flujo a OpenID Connect.

### 3. Guarda el perfil de publicación como secreto

1. En App Service, pulsa **Descargar perfil de publicación**. Azure descarga un archivo XML.
2. Abre el repositorio `hotel-eco-antigua` en GitHub.
3. Entra a **Settings → Secrets and variables → Actions → New repository secret**.
4. Nombre del secreto: `AZURE_WEBAPP_PUBLISH_PROFILE`.
5. Abre el XML descargado con el Bloc de notas, copia todo su contenido y pégalo en **Secret**. Pulsa **Add secret**.

El XML contiene credenciales privadas. No lo compartas ni lo subas como archivo al repositorio.

### 4. Guarda el nombre de App Service en GitHub

1. En la misma página, abre la pestaña **Variables** y pulsa **New repository variable**.
2. Nombre: `AZURE_WEBAPP_NAME`.
3. Valor: el nombre exacto de App Service que copiaste. Guarda.

### 5. Sube el flujo de publicación al repositorio

El archivo `.github/workflows/azure-deploy.yml` prepara la página, el backend y sus dependencias, y publica el resultado. Guarda los cambios del proyecto en la rama **main** y súbelos a GitHub. También puedes ejecutar el flujo manualmente en GitHub → **Actions → Publicar en Azure → Run workflow**.

## Parte E: comprueba que sí funciona

1. En GitHub, abre la pestaña **Actions** y entra al flujo **Publicar en Azure**. Espera a que el círculo quede verde.
2. En Azure App Service pulsa **Examinar**. La dirección termina en `.azurewebsites.net`.
3. Añade `/api/health` al final de la dirección. Debe responder algo parecido a `{"ok":true,"service":"hotel-eco-antigua-api","database":"connected"}`.
4. Abre la página en una ventana privada y prueba una búsqueda con fechas futuras.
5. Completa una reserva de prueba, anota su código, búscala y cancélala. Comprueba también que una búsqueda posterior muestre la habitación disponible.
6. Copia la URL pública en `docs/FASE2_AUTOMATIZACION_Y_PLATAFORMA.md` y registra fecha, resultado y evidencia en los archivos de la fase 2.

## Si algo falla

- **Azure dice que la región está prohibida o muestra `RequestDisallowedByAzure`:** no vuelvas a intentar con esa región. Busca **Policy** en Azure Portal → **Assignments** (Asignaciones), abre la regla llamada **Allowed resource deployment regions** o **Allowed locations**, y mira **Parameters** (Parámetros). Usa una región que aparezca en esa lista tanto para App Service como para PostgreSQL. Las suscripciones de estudiante pueden restringir regiones; la lista permitida depende de la suscripción. Si no puedes ver la regla o ninguna región permitida funciona para ambos servicios, abre el despliegue fallido desde **Grupo de recursos → Implementaciones → implementación fallida → Detalles del error** y comparte el código con el administrador de la suscripción o con soporte de Azure.
- **GitHub Actions queda rojo:** abre la ejecución y revisa el paso con una X roja. Si menciona `AZURE_WEBAPP_NAME` o el perfil, vuelve a revisar los nombres del secreto y la variable.
- **La página da error 503:** abre App Service → **Supervisión → Secuencia de registro**. Confirma que exista `DATABASE_URL`, que la base `hoteleco` esté creada y que el firewall permita la conexión desde App Service.
- **`/api/health` no responde como conectado:** revisa usuario, contraseña, host y nombre de la base en `DATABASE_URL`. Las tablas se crean automáticamente cuando arranca el servidor.
- **Azure muestra un costo diferente de cero:** pausa el proceso y revisa el plan elegido y las cuotas en **Suscripción → Servicios gratuitos** antes de continuar.

## Al terminar la demostración

En Azure puedes detener o eliminar los recursos del grupo `rg-hotel-eco-antigua` desde **Grupos de recursos**. Eliminar el grupo borra la aplicación y la base de datos junto con sus datos, así que guarda antes cualquier evidencia que necesites entregar. Revisa el costo de la suscripción periódicamente, sobre todo después del vencimiento de los servicios gratuitos que muestra el portal.
