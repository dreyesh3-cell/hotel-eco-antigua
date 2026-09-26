# Publicar Hotel Eco Antigua gratis en Cloudflare

Esta es la alternativa al App Service F1 de Azure. El proyecto ya tiene una API compatible con Cloudflare Workers, base de datos D1 y migración SQL. Workers sirve la página y la API; D1 almacena las reservas.

## Límites del plan gratis

Para una demostración académica de poco tráfico, el plan gratuito incluye hasta 100,000 solicitudes de Worker al día y D1 incluye hasta 5 millones de filas leídas y 100,000 filas escritas al día, con 5 GB de almacenamiento total. Los archivos estáticos se sirven gratis. Si se supera un límite diario, algunas solicitudes pueden dejar de funcionar hasta el reinicio del límite; no cambies a un plan de pago para esta tarea sin revisar primero el precio. Revisa los límites actuales en [Workers](https://developers.cloudflare.com/workers/platform/limits/), [precios de Workers](https://developers.cloudflare.com/workers/platform/pricing/) y [precios de D1](https://developers.cloudflare.com/d1/platform/pricing/).

## A. Crear la cuenta y base de datos

1. Entra a [dash.cloudflare.com](https://dash.cloudflare.com/) y crea una cuenta gratuita o inicia sesión.
2. Abre **Workers & Pages → D1 SQL Database** (puede aparecer bajo **Storage & databases → D1 SQL database**).
3. Pulsa **Create database** y escribe hotel-eco-antigua. Crea la base.
4. Abre la base recién creada y copia su **Database ID**. No copies ni compartas datos de reservas.
5. Para encontrar el **Account ID**, abre **Workers & Pages** y copia el ID de cuenta que aparece en la página de inicio o en **Account details**.

## B. Crear un token privado para GitHub Actions

1. En Cloudflare, abre tu avatar → **My Profile → API Tokens → Create Token → Create Custom Token**.
2. Ponle un nombre como GitHub Hotel Eco Antigua.
3. Agrega estos permisos de cuenta: **Workers Scripts — Edit**, **D1 — Edit** y **Account Settings — Read**. Limita el alcance a la cuenta que acabas de usar.
4. Crea el token y cópialo una sola vez. Guárdalo temporalmente en un lugar privado; nunca lo pongas en un archivo del repositorio.

## C. Guardar las conexiones en GitHub

1. En GitHub abre dreyesh3-cell/hotel-eco-antigua → **Settings → Secrets and variables → Actions**.
2. En **Variables**, crea estas dos variables (respeta las mayúsculas):

   - CLOUDFLARE_ACCOUNT_ID = el ID de la cuenta Cloudflare.
   - CLOUDFLARE_D1_DATABASE_ID = el ID de la base D1.

3. En **Secrets**, crea CLOUDFLARE_API_TOKEN y pega el token privado.

## D. Publicar

1. Descarga output/Actualizacion_Cloudflare_GitHub.zip y extráelo en la carpeta clonada del repositorio, la misma que contiene README.md y package.json. Si Windows pregunta, reemplaza los archivos.
2. Abre GitHub Desktop, revisa que aparezcan .github/workflows/cloudflare-deploy.yml y docs/DESPLIEGUE_CLOUDFLARE_PASO_A_PASO.md en **Changes / Cambios**.
3. Escribe Preparar publicación gratuita en Cloudflare, pulsa **Commit to main** y después **Push origin**. Asegúrate de haber guardado antes las variables y el secreto del paso C.
4. En GitHub abre **Actions → Publicar en Cloudflare**. Espera a que la ejecución termine en verde.
5. Cloudflare mostrará una dirección parecida a https://hotel-eco-antigua.tu-subdominio.workers.dev. Entra al enlace y añade /api/health; debe responder con el estado ok y database connected.
6. Prueba consultar disponibilidad y crea una reserva ficticia. No ingreses información personal real.

## Si aparece un error

- Si Actions dice que faltan variables, revisa los nombres exactos en **Settings → Secrets and variables → Actions**.
- Si Wrangler indica que no encuentra la base, confirma que el Database ID y el nombre hotel-eco-antigua correspondan a la misma base de D1.
- Si /api/health falla, abre el paso rojo **Publicar en Cloudflare** en Actions y revisa el registro. No compartas el token.
- Si Actions publica en verde pero la página no carga, confirma que estás usando la URL workers.dev del Worker hotel-eco-antigua.
- Si Cloudflare te pide habilitar workers.dev, acepta esa opción gratuita en el panel de Cloudflare y vuelve a ejecutar el flujo.

## Volver a usar Azure

El flujo de Azure queda disponible para iniciarlo manualmente desde **Actions → Publicar en Azure → Run workflow**. La cuota F1 de Azure puede detenerlo de nuevo; revisa la cuota y el costo antes de cambiar el plan.
