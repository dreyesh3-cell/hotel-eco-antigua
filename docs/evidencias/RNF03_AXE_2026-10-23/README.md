# Evidencia RNF-03: análisis de contraste con axe

- Fecha: 2026-10-23
- URL probada: `https://hotel-eco-antigua.dreyesh3.workers.dev/#mi-reserva`
- Viewport emulado: 360 × 800
- Herramienta: axe DevTools, axe-core 4.13.0
- Resultado observado: 38 incidencias automáticas de contraste, todas clasificadas como graves; 0 críticas, 0 moderadas y 0 leves.
- Estado: fallido; requiere corrección y un nuevo escaneo.

Las capturas muestran incidencias repetidas en textos secundarios de distintas secciones de la página. Algunos ejemplos son:

| Selector reportado | Texto / elemento | Colores y contraste reportado |
|---|---|---|
| `.section-intro > p` | «Consulta disponibilidad en pocos pasos.» | `#70796f` sobre `#eeece3`, 3.81:1 |
| `.search-field:nth-child(1) > span` | Etiqueta de búsqueda | `#758075` sobre `#fffefa`, 4.07:1 |
| `.guests-field > span` | Etiqueta de huéspedes | `#758075` sobre `#fffefa`, 4.07:1 |
| `.date-summary` | Resumen de fechas | `#6f786e` sobre `#eeece3`, 3.86:1 |
| `.room-card:nth-child(1) .room-content > p` | Descripción de habitación | `#70796f` sobre `#fffefa`, 4.47:1 |
| `.room-price small` | Texto «/ noche» | `#7c8278` sobre `#fffefa`, 3.91:1 |
| `.guest-form label:nth-child(5) small` | Texto «(Opcional)» | `#83887f` sobre `#fffefa`, 3.59:1 |
| `.promise-strip small` | Texto auxiliar | `#7b8177` sobre `#f7f5ef`, 3.66:1 |
| `.place-meta` | Etiqueta de lugar | `#8c755b` sobre `#fdfcf7`, 4.24:1 |
| `.place-body p` | Descripción de lugar | `#73796f` sobre `#fdfcf7`, 4.35:1 |

Se guardaron las capturas originales en `axe-contraste-01.png` a `axe-contraste-12.png`. Las capturas 07 y 08 son duplicadas.
