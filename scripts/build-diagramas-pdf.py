from __future__ import annotations

from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas
from pypdf import PdfReader, PdfWriter


ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "output" / "pdf" / "Hotel_Eco_Antigua_Fase_1.pdf"
ANNEX = ROOT / "output" / "pdf" / "Hotel_Eco_Antigua_Diagramas_Anexo.pdf"
MERGED = ROOT / "output" / "pdf" / "Hotel_Eco_Antigua_Fase_1_con_anexo.pdf"
GREEN = colors.HexColor("#174E45")
INK = colors.HexColor("#22312E")
MINT = colors.HexColor("#E8F1EB")
CLAY = colors.HexColor("#C76B46")
PALE = colors.HexColor("#F6F8F6")
MUTED = colors.HexColor("#63716C")
WHITE = colors.white


def wrapped(c, text, x, y, width, size=9, leading=12, color=INK, font="Helvetica"):
    words = text.split()
    lines, line = [], ""
    for word in words:
        trial = f"{line} {word}".strip()
        if stringWidth(trial, font, size) > width and line:
            lines.append(line)
            line = word
        else:
            line = trial
    if line:
        lines.append(line)
    c.setFont(font, size)
    c.setFillColor(color)
    for item in lines:
        c.drawCentredString(x, y, item)
        y -= leading
    return len(lines)


def box(c, cx, cy, w, h, text, fill=MINT, stroke=GREEN, size=9):
    c.setFillColor(fill)
    c.setStrokeColor(stroke)
    c.setLineWidth(1.2)
    c.roundRect(cx-w/2, cy-h/2, w, h, 8, fill=1, stroke=1)
    lines = text.split("\n")
    start = cy + (len(lines)-1) * (size+2) / 2 - size * .32
    for idx, line in enumerate(lines):
        wrapped(c, line, cx, start - idx*(size+2), w-16, size=size, leading=size+2)


def diamond(c, cx, cy, w, h, text, size=8.5):
    p = c.beginPath()
    p.moveTo(cx, cy+h/2)
    p.lineTo(cx+w/2, cy)
    p.lineTo(cx, cy-h/2)
    p.lineTo(cx-w/2, cy)
    p.close()
    c.setFillColor(PALE)
    c.setStrokeColor(GREEN)
    c.setLineWidth(1.2)
    c.drawPath(p, fill=1, stroke=1)
    wrapped(c, text, cx, cy+3, w*.58, size=size, leading=size+1)


def arrow(c, x1, y1, x2, y2, label=None, lx=None, ly=None, dashed=False):
    c.saveState()
    c.setStrokeColor(MUTED)
    c.setFillColor(MUTED)
    c.setLineWidth(1.2)
    if dashed:
        c.setDash(3, 2)
    c.line(x1, y1, x2, y2)
    import math
    angle = math.atan2(y2-y1, x2-x1)
    side = .32
    length = 7
    p = c.beginPath()
    p.moveTo(x2, y2)
    p.lineTo(x2-length*math.cos(angle-side), y2-length*math.sin(angle-side))
    p.lineTo(x2-length*math.cos(angle+side), y2-length*math.sin(angle+side))
    p.close()
    c.drawPath(p, fill=1, stroke=0)
    if label:
        c.setDash()
        c.setFont("Helvetica-Bold", 7.5)
        c.drawCentredString(lx if lx is not None else (x1+x2)/2, ly if ly is not None else (y1+y2)/2+4, label)
    c.restoreState()


def association(c, x1, y1, x2, y2):
    c.saveState()
    c.setStrokeColor(MUTED)
    c.setLineWidth(1)
    c.line(x1, y1, x2, y2)
    c.restoreState()


def header(c, title, subtitle, page):
    c.setFillColor(GREEN)
    c.setFont("Helvetica-Bold", 19)
    c.drawString(42, 750, title)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 9)
    c.drawString(42, 720, subtitle)
    c.setStrokeColor(colors.HexColor("#D5DED8"))
    c.line(42, 25, 570, 25)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 8)
    c.drawString(42, 14, "Hotel Eco Antigua | Anexo E | Diagramas funcionales")
    c.drawRightString(570, 14, f"E-{page}")


def page_flow(c):
    header(c, "E-01 · Flujo de reserva", "Camino principal y respuestas ante datos inválidos o falta de inventario", 1)
    x = 306
    box(c, x, 700, 178, 34, "Inicio", fill=GREEN, stroke=GREEN, size=10)
    c.setFillColor(WHITE); c.setFont("Helvetica-Bold", 9); c.drawCentredString(x, 697, "Inicio")
    box(c, x, 642, 250, 42, "Ingresar llegada, salida y cantidad de huéspedes")
    diamond(c, x, 572, 190, 58, "¿Fechas y grupo\nson válidos?")
    box(c, 500, 572, 150, 48, "Corregir fechas o\ncantidad de huéspedes", fill=colors.HexColor("#FFF3EC"), stroke=CLAY, size=8)
    arrow(c, x, 680, x, 602)
    arrow(c, x+95, 572, 425, 572, "No", 410, 578)
    arrow(c, x, 543, x, 500, "Sí", x+15, 520)
    box(c, x, 478, 250, 42, "Consultar habitaciones disponibles")
    diamond(c, x, 410, 190, 58, "¿Hay una habitación\napta disponible?")
    box(c, 104, 410, 145, 48, "Informar falta de cupo\ny permitir otras fechas", fill=colors.HexColor("#FFF3EC"), stroke=CLAY, size=8)
    arrow(c, x, 457, x, 439)
    arrow(c, x-95, 410, 177, 410, "No", 195, 416)
    arrow(c, x, 381, x, 350, "Sí", x+15, 364)
    box(c, x, 329, 250, 42, "Elegir habitación y revisar tarifa")
    arrow(c, x, 308, x, 284)
    box(c, x, 260, 250, 46, "Ingresar nombre, correo y teléfono opcional")
    arrow(c, x, 237, x, 208)
    diamond(c, x, 178, 190, 58, "¿Formulario\ncompleto y válido?")
    box(c, 500, 178, 150, 48, "Corregir los campos\nseñalados", fill=colors.HexColor("#FFF3EC"), stroke=CLAY, size=8)
    arrow(c, x+95, 178, 425, 178, "No", 410, 184)
    arrow(c, x, 149, x, 119, "Sí", x+15, 132)
    box(c, x, 96, 270, 46, "Verificar inventario y guardar en una operación")
    arrow(c, x, 73, x, 67)
    box(c, x, 51, 205, 28, "Mostrar código de confirmación", fill=GREEN, stroke=GREEN, size=8)
    c.setFillColor(WHITE); c.setFont("Helvetica-Bold", 8); c.drawCentredString(x, 48, "Mostrar código de confirmación")
    c.setFillColor(MUTED); c.setFont("Helvetica-Oblique", 7)
    c.drawString(47, 370, "Si otra reserva ocupa la última unidad mientras se confirma, se informa el conflicto y se busca otra fecha.")


def actor(c, x, y, label):
    c.setStrokeColor(INK); c.setLineWidth(1.5)
    c.circle(x, y+25, 8, fill=0, stroke=1)
    c.line(x, y+17, x, y-5)
    c.line(x-13, y+9, x+13, y+9)
    c.line(x, y-5, x-11, y-20)
    c.line(x, y-5, x+11, y-20)
    c.setFillColor(INK); c.setFont("Helvetica-Bold", 9); c.drawCentredString(x, y-35, label)


def usecase(c):
    header(c, "E-02 · Casos de uso", "Acciones disponibles para visitantes y huéspedes", 2)
    actor(c, 95, 475, "Visitante")
    actor(c, 95, 250, "Huésped")
    ellipses = [
        (260, 600, "Explorar guía turística"),
        (260, 515, "Buscar disponibilidad"),
        (260, 430, "Elegir habitación"),
        (260, 345, "Crear reserva"),
        (475, 420, "Consultar reserva"),
        (475, 315, "Cancelar reserva"),
        (475, 210, "Consultar política"),
    ]
    for cx, cy, label in ellipses:
        c.setFillColor(MINT); c.setStrokeColor(GREEN); c.setLineWidth(1.2)
        c.ellipse(cx-82, cy-23, cx+82, cy+23, fill=1, stroke=1)
        c.setFillColor(INK); c.setFont("Helvetica", 8.5); c.drawCentredString(cx, cy-3, label)
    for yy in (600, 515, 430, 345):
        association(c, 110, 500, 178, yy)
    for yy in (420, 315, 210):
        association(c, 110, 260, 393, yy)
    c.setFillColor(MUTED); c.setFont("Helvetica-Oblique", 8)
    c.drawString(138, 105, "La política de cancelación indica el límite de 48 horas antes de la llegada.")


def sequence(c):
    header(c, "E-03 · Secuencia de reserva", "Intercambio entre la persona usuaria, la web, la API y la base de datos", 3)
    xs = [90, 250, 410, 545]
    labels = ["Huésped", "Web", "API Worker", "D1"]
    for x, label in zip(xs, labels):
        box(c, x, 680, 104, 36, label, fill=MINT, size=9)
        c.setStrokeColor(MUTED); c.setDash(4, 3); c.line(x, 660, x, 105); c.setDash()
    messages = [
        (625, 0, 1, "Indica fechas y huéspedes", False),
        (580, 1, 2, "GET disponibilidad", False),
        (535, 2, 3, "Buscar reservas traslapadas", False),
        (490, 3, 2, "Inventario disponible", True),
        (445, 2, 1, "Habitaciones y tarifas", True),
        (400, 0, 1, "Elige habitación y envía datos", False),
        (355, 1, 2, "POST /api/reservations", False),
        (310, 2, 2, "Validar datos y capacidad", False),
        (265, 2, 3, "Guardar reserva atómicamente", False),
        (220, 3, 2, "Reserva y código", True),
        (175, 2, 1, "Confirmación", True),
        (130, 1, 0, "Muestra código y detalles", True),
    ]
    for y, a, b, label, reverse in messages:
        start, end = xs[a], xs[b]
        arrow(c, start, y, end, y, dashed=reverse)
        c.setFillColor(INK); c.setFont("Helvetica", 7.5)
        c.drawCentredString((start+end)/2, y+5, label)
    c.setFillColor(MUTED); c.setFont("Helvetica-Oblique", 8)
    c.drawString(42, 72, "Si la validación falla o no queda inventario, la API devuelve un error y la web permite corregir o buscar otras fechas.")


def state(c):
    header(c, "E-04 · Estados de una reserva", "La cancelación libera inventario y deja la reserva en estado terminal", 4)
    # Initial state
    c.setFillColor(GREEN); c.circle(95, 440, 9, fill=1, stroke=0)
    box(c, 255, 440, 170, 64, "CONFIRMADA\nReserva guardada", fill=MINT, size=10)
    box(c, 490, 550, 175, 64, "CANCELADA\nInventario liberado", fill=colors.HexColor("#FFF3EC"), stroke=CLAY, size=10)
    # Initial transition
    arrow(c, 104, 440, 168, 440, "reserva creada", 137, 451)
    # Valid cancel
    arrow(c, 325, 461, 407, 520, "≥ 48 h antes", 365, 505)
    # Too late self loop
    c.setStrokeColor(CLAY); c.setLineWidth(1.2)
    path = c.beginPath(); path.moveTo(220, 472); path.curveTo(195, 550, 315, 550, 290, 472); c.drawPath(path, stroke=1, fill=0)
    arrow(c, 290, 472, 286, 471, "< 48 h: rechazar", 252, 544)
    # terminal state marker
    c.setFillColor(INK); c.circle(490, 440, 6, fill=1, stroke=0)
    c.setStrokeColor(INK); c.circle(490, 440, 10, fill=0, stroke=1)
    arrow(c, 490, 515, 490, 451)
    c.setFillColor(INK); c.setFont("Helvetica-Bold", 10)
    c.drawString(75, 360, "Reglas del ciclo de vida")
    notes = [
        "La consulta requiere código de confirmación y correo coincidente.",
        "Una reserva cancelada no puede cancelarse de nuevo ni reactivarse.",
        "Si faltan menos de 48 horas, la solicitud se rechaza y el estado permanece confirmado.",
    ]
    y = 335
    for item in notes:
        c.setFillColor(CLAY); c.circle(82, y+3, 2.3, fill=1, stroke=0)
        wrapped(c, item, 325, y, 460, size=9, leading=13, color=INK)
        y -= 34


def create_annex():
    ANNEX.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(ANNEX), pagesize=letter, pageCompression=1)
    page_flow(c); c.showPage()
    usecase(c); c.showPage()
    sequence(c); c.showPage()
    state(c); c.showPage()
    c.save()


def append_to_phase1():
    reader = PdfReader(str(BASE))
    annex = PdfReader(str(ANNEX))
    writer = PdfWriter()
    for page in reader.pages:
        writer.add_page(page)
    for page in annex.pages:
        writer.add_page(page)
    with MERGED.open("wb") as f:
        writer.write(f)
    MERGED.replace(BASE)


if __name__ == "__main__":
    create_annex()
    append_to_phase1()
