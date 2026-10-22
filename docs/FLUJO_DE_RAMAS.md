# Flujo de ramas

Los cambios se preparan en ramas de trabajo y se integran a `dev` mediante Pull Request. La promoción a `qa` se realiza con un Pull Request desde `dev`, después de revisar los cambios y validar los checks. La promoción a `main` se realiza mediante otro Pull Request desde `qa`, después de la validación de calidad y regresión.
Los Pull Requests deben describir el cambio, las pruebas ejecutadas y sus resultados. No se integran cambios directamente a `qa` ni a `main`.
