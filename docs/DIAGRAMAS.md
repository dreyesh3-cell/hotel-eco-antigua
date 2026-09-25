# Diagramas funcionales — Hotel Eco Antigua

Estos diagramas acompañan los diagramas de arquitectura de contexto y contenedores en `FASE1_DESCRIPCION_Y_DISENO.md`. Las versiones gráficas también están en el anexo E del PDF de fase 1.

## E-01. Flowchart del proceso de reserva

```mermaid
flowchart TD
  A([Inicio]) --> B[Ingresar llegada, salida y huéspedes]
  B --> C{¿Fechas y grupo válidos?}
  C -- No --> B
  C -- Sí --> D[Consultar disponibilidad]
  D --> E{¿Hay habitación disponible?}
  E -- No --> F[Mostrar aviso y permitir otras fechas]
  F --> B
  E -- Sí --> G[Elegir habitación]
  G --> H[Ingresar nombre, correo y teléfono opcional]
  H --> I{¿Formulario válido?}
  I -- No --> H
  I -- Sí --> J[Verificar y reservar inventario de forma atómica]
  J --> K{¿Sigue disponible?}
  K -- No --> F
  K -- Sí --> L[Guardar reserva y generar código]
  L --> M([Mostrar confirmación])
```

## E-02. Diagrama de casos de uso

```mermaid
flowchart LR
  V[Visitante] --- U1((Explorar guía turística))
  V --- U2((Buscar disponibilidad))
  V --- U3((Elegir habitación))
  V --- U4((Crear reserva))
  H[Huésped] --- U5((Consultar reserva))
  H --- U6((Cancelar reserva))
  H --- U7((Consultar política de cancelación))
  U2 --> U3
  U3 --> U4
  U6 --> U5
```

## E-03. Diagrama de secuencia de reserva

```mermaid
sequenceDiagram
  actor H as Huésped
  participant W as Web Hotel Eco Antigua
  participant A as API Worker
  participant D as Base D1
  H->>W: Ingresa fechas y huéspedes
  W->>A: GET /api/availability
  A->>D: Consultar reservas que se cruzan
  D-->>A: Inventario disponible
  A-->>W: Habitaciones y tarifas
  H->>W: Elige habitación y envía datos
  W->>A: POST /api/reservations
  A->>A: Validar fechas, capacidad y datos
  A->>D: Reservar unidad y guardar registro atómicamente
  D-->>A: Reserva confirmada
  A-->>W: Código de confirmación
  W-->>H: Mostrar detalles de la reserva
```

## E-04. Diagrama de estados de una reserva

```mermaid
stateDiagram-v2
  [*] --> Confirmada: reserva creada y guardada
  Confirmada --> Cancelada: solicitud válida con 48 h o más
  Confirmada --> Confirmada: solicitud fuera del plazo, rechazada
  Cancelada --> [*]
```

Los resultados de pruebas y defectos no aparecen en estos diagramas: deben documentarse a partir de ejecuciones reales del equipo.
