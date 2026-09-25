from __future__ import annotations

import csv
import html
import re
import subprocess
import sys
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Flowable,
    Frame,
    KeepTogether,
    PageBreak,
    PageTemplate,
    NextPageTemplate,
    Paragraph,
    Preformatted,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.platypus.tableofcontents import TableOfContents


ROOT = Path(__file__).resolve().parents[1]
DOC = ROOT / "docs" / "FASE1_DESCRIPCION_Y_DISENO.md"
CASES = ROOT / "docs" / "matriz_casos_prueba.csv"
TRACE = ROOT / "docs" / "trazabilidad.csv"
EXECUTION = ROOT / "docs" / "registro_ejecucion.csv"
DEFECTS = ROOT / "docs" / "defectos.csv"
OUT = ROOT / "output" / "pdf" / "Hotel_Eco_Antigua_Fase_1.pdf"
GREEN = colors.HexColor("#174E45")
MINT = colors.HexColor("#E8F1EB")
CLAY = colors.HexColor("#C76B46")
INK = colors.HexColor("#22312E")
MUTED = colors.HexColor("#63716C")
RULE = colors.HexColor("#D5DED8")


class NumberedDocTemplate(BaseDocTemplate):
    def __init__(self, filename: str):
        super().__init__(filename, pagesize=A4, title="Hotel Eco Antigua - Fase 1")
        self._portrait = Frame(18 * mm, 17 * mm, A4[0] - 36 * mm, A4[1] - 35 * mm, id="portrait", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        wide = landscape(A4)
        self._landscape = Frame(14 * mm, 15 * mm, wide[0] - 28 * mm, wide[1] - 30 * mm, id="landscape", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates([
            PageTemplate(id="portrait", frames=[self._portrait], onPage=self._draw_footer),
            PageTemplate(id="landscape", pagesize=wide, frames=[self._landscape], onPage=self._draw_footer),
        ])
        self.toc = TableOfContents()
        self.toc.levelStyles = [
            ParagraphStyle("TOCLevel0", fontName="Helvetica-Bold", fontSize=10, leading=16, textColor=GREEN, leftIndent=0, spaceBefore=4),
            ParagraphStyle("TOCLevel1", fontName="Helvetica", fontSize=9, leading=13, textColor=INK, leftIndent=14, spaceBefore=1),
        ]

    def _draw_footer(self, canvas, doc):
        if doc.page == 1:
            return
        width, _ = doc.pagesize
        canvas.saveState()
        canvas.setStrokeColor(RULE)
        canvas.setLineWidth(0.6)
        canvas.line(18 * mm, 12 * mm, width - 18 * mm, 12 * mm)
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(MUTED)
        canvas.drawString(18 * mm, 7.5 * mm, "Hotel Eco Antigua | Aseguramiento de la Calidad | Fase 1")
        canvas.drawRightString(width - 18 * mm, 7.5 * mm, f"Página {doc.page}")
        canvas.restoreState()

    def afterFlowable(self, flowable):
        if isinstance(flowable, Paragraph) and flowable.style.name in ("H1", "H2"):
            level = 0 if flowable.style.name == "H1" else 1
            label = flowable.getPlainText()
            if label.strip().lower() == "índice":
                return
            self.notify("TOCEntry", (level, label, self.page))


def clean_text(value: str) -> str:
    value = value.replace("—", "-").replace("–", "-").replace("→", "->").replace("·", "|")
    value = value.replace("’", "'").replace("“", '"').replace("”", '"')
    return value


def inline(value: str) -> str:
    value = html.escape(clean_text(value), quote=False)
    value = re.sub(r"\[([^\]]+)\]\((https?://[^)]+)\)", r'<link href="\2" color="#174E45">\1</link>', value)
    value = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", value)
    value = re.sub(r"`([^`]+)`", r'<font name="Courier" color="#174E45">\1</font>', value)
    value = re.sub(r"(?<!\*)\*([^*]+)\*", r"<i>\1</i>", value)
    return value


def para(text: str, style: ParagraphStyle) -> Paragraph:
    return Paragraph(inline(text), style)


def make_table(rows, widths, font_size=7.5, header=True):
    cell = ParagraphStyle("TableCell", fontName="Helvetica", fontSize=font_size, leading=font_size + 2, textColor=INK, spaceAfter=0)
    head = ParagraphStyle("TableHead", parent=cell, fontName="Helvetica-Bold", textColor=colors.white)
    data = [[Paragraph(inline(str(v)), head if header and r == 0 else cell) for v in row] for r, row in enumerate(rows)]
    table = Table(data, colWidths=widths, repeatRows=1 if header else 0, hAlign="LEFT", splitByRow=1)
    commands = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LINEBELOW", (0, 0), (-1, -1), 0.35, RULE),
    ]
    if header:
        commands += [("BACKGROUND", (0, 0), (-1, 0), GREEN), ("LINEBELOW", (0, 0), (-1, 0), 0.8, GREEN)]
    for row_index in range(1 if header else 0, len(rows)):
        if (row_index - (1 if header else 0)) % 2 == 1:
            commands.append(("BACKGROUND", (0, row_index), (-1, row_index), colors.HexColor("#F6F8F6")))
    table.setStyle(TableStyle(commands))
    return table


def read_csv(path: Path):
    with path.open(encoding="utf-8-sig", newline="") as file:
        return list(csv.reader(file))


def execution_totals():
    rows = read_csv(EXECUTION)
    headers = {name: idx for idx, name in enumerate(rows[0])}
    counts = {"APROBADO": 0, "FALLIDO": 0, "BLOQUEADO": 0}
    for row in rows[1:]:
        if "estado" in headers and headers["estado"] < len(row):
            status = row[headers["estado"]].strip().upper()
            if status in counts:
                counts[status] += 1
    designed = len(rows) - 1
    executed = sum(counts.values())
    pending = max(0, designed - executed)
    rate_base = counts["APROBADO"] + counts["FALLIDO"]
    rate = f"{(counts['APROBADO'] / rate_base * 100):.1f}%" if rate_base else "Pendiente"
    return designed, executed, counts, pending, rate


def team_member(letter: str):
    source = DOC.read_text(encoding="utf-8")
    pattern = rf"\*\*Integrante {letter}:\*\*\s*([^|\n]+)\s*\|\s*\*\*Carné {letter}:\*\*\s*([^\n]+)"
    match = re.search(pattern, source)
    if not match:
        return "Nombre completo: ______________________________", "Carné: ______________"
    name, student_id = (value.strip().strip("[]") for value in match.groups())
    if "Escribe aquí" in name:
        name = "Nombre completo: ______________________________"
    if "Escribe aquí" in student_id:
        student_id = "Carné: ______________"
    return name, student_id


def build_document():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle("CoverKicker", fontName="Helvetica-Bold", fontSize=10, leading=14, textColor=CLAY, alignment=TA_CENTER, tracking=1.1))
    styles.add(ParagraphStyle("CoverTitle", fontName="Helvetica-Bold", fontSize=29, leading=34, textColor=GREEN, alignment=TA_CENTER, spaceAfter=9))
    styles.add(ParagraphStyle("CoverSub", fontName="Helvetica", fontSize=13, leading=19, textColor=INK, alignment=TA_CENTER))
    styles.add(ParagraphStyle("H1", fontName="Helvetica-Bold", fontSize=17, leading=21, textColor=GREEN, spaceBefore=12, spaceAfter=7, keepWithNext=True))
    styles.add(ParagraphStyle("H2", fontName="Helvetica-Bold", fontSize=12, leading=16, textColor=CLAY, spaceBefore=10, spaceAfter=5, keepWithNext=True))
    styles.add(ParagraphStyle("H3", fontName="Helvetica-Bold", fontSize=10, leading=13, textColor=INK, spaceBefore=7, spaceAfter=3, keepWithNext=True))
    styles.add(ParagraphStyle("Body", fontName="Helvetica", fontSize=9.2, leading=13.4, textColor=INK, spaceAfter=6, alignment=TA_LEFT))
    styles.add(ParagraphStyle("BulletBody", parent=styles["Body"], leftIndent=13, firstLineIndent=-8, spaceAfter=3))
    styles.add(ParagraphStyle("Quote", fontName="Helvetica-Oblique", fontSize=8.7, leading=13, textColor=GREEN, leftIndent=12, rightIndent=12, borderColor=CLAY, borderWidth=1.5, borderPadding=7, backColor=MINT, spaceBefore=4, spaceAfter=8))
    styles.add(ParagraphStyle("CodeLabel", fontName="Helvetica-Bold", fontSize=8, leading=11, textColor=MUTED, spaceBefore=2, spaceAfter=3))
    styles.add(ParagraphStyle("Small", fontName="Helvetica", fontSize=8, leading=11, textColor=MUTED))

    doc = NumberedDocTemplate(str(OUT))
    story = []
    story.extend([Spacer(1, 32 * mm), para("ASEGURAMIENTO DE LA CALIDAD DE SOFTWARE", styles["CoverKicker"]), Spacer(1, 12 * mm), para("Hotel Eco Antigua", styles["CoverTitle"]), para("Descripción, arquitectura y diseño de pruebas", styles["CoverSub"]), Spacer(1, 16 * mm)])
    member_a = team_member("A")
    member_b = team_member("B")
    cover_rows = [
        ["Curso", "Aseguramiento de la Calidad de Software | Proyecto Final 2026"],
        ["Universidad", "Universidad Mariano Gálvez de Guatemala"],
        ["Integrante A", f"{member_a[0]} | {member_a[1]}"],
        ["Integrante B", f"{member_b[0]} | {member_b[1]}"],
        ["Versión", "1.0 | Fecha: __________________"],
    ]
    cover_table = Table([[Paragraph(f"<b>{inline(a)}</b>", styles["Body"]), Paragraph(inline(b), styles["Body"])] for a, b in cover_rows], colWidths=[35 * mm, 120 * mm])
    cover_table.setStyle(TableStyle([("BACKGROUND", (0, 0), (0, -1), MINT), ("BOX", (0, 0), (-1, -1), 0.6, RULE), ("INNERGRID", (0, 0), (-1, -1), 0.35, RULE), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8), ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 7)]))
    story.extend([cover_table, Spacer(1, 20 * mm), para("Documento de trabajo del equipo. Completa los nombres, carné, repositorio, URL y resultados reales antes de entregar.", styles["Small"]), PageBreak()])
    story.extend([Paragraph("Índice", styles["H1"]), doc.toc, PageBreak()])

    lines = DOC.read_text(encoding="utf-8").splitlines()
    designed, executed, totals, pending, pass_rate = execution_totals()
    for line_no, source_line in enumerate(lines):
        if "**Casos diseñados:**" in source_line:
            lines[line_no] = (f"**Casos diseñados:** {designed}. **Ejecutados:** {executed}. "
                              f"**Aprobados:** {totals['APROBADO']}. **Fallidos:** {totals['FALLIDO']}. "
                              f"**Bloqueados:** {totals['BLOQUEADO']}. **Pendientes:** {pending}.")
        elif "**Tasa de aprobación:**" in source_line:
            lines[line_no] = f"**Tasa de aprobación:** {totals['APROBADO']} aprobados ÷ {totals['APROBADO'] + totals['FALLIDO']} ejecutados = {pass_rate}."
    in_fence = False
    fence_lines = []
    i = 0
    skip_cover = True
    while i < len(lines):
        line = lines[i].rstrip()
        if skip_cover:
            if line.startswith("## 1."):
                skip_cover = False
            else:
                i += 1
                continue
        if line.startswith("```"):
            if not in_fence:
                in_fence = True
                fence_lines = []
            else:
                block = "\n".join(clean_text(s) for s in fence_lines)
                story.append(Paragraph("Diagrama de arquitectura (representación fuente)", styles["CodeLabel"]))
                story.append(Preformatted(block, ParagraphStyle("Code", fontName="Courier", fontSize=7.1, leading=9.1, textColor=INK, backColor=MINT, borderColor=RULE, borderWidth=0.5, borderPadding=7, leftIndent=4, rightIndent=4, spaceAfter=8)))
                in_fence = False
            i += 1
            continue
        if in_fence:
            fence_lines.append(line)
            i += 1
            continue
        if not line.strip():
            i += 1
            continue
        if line.startswith("| "):
            table_lines = []
            while i < len(lines) and lines[i].lstrip().startswith("|"):
                table_lines.append(lines[i])
                i += 1
            rows = []
            for raw in table_lines:
                cells = [c.strip() for c in raw.strip().strip("|").split("|")]
                if all(re.fullmatch(r":?-{2,}:?", c) for c in cells):
                    continue
                rows.append(cells)
            if rows:
                count = len(rows[0])
                usable = A4[0] - 36 * mm
                proportions = [1.0 / count] * count
                if count == 3:
                    proportions = [0.16, 0.60, 0.24]
                elif count == 2:
                    proportions = [0.22, 0.78]
                story.append(make_table(rows, [usable * p for p in proportions], font_size=7.4))
                story.append(Spacer(1, 7))
            continue
        if line.startswith("# "):
            story.append(Paragraph(inline(line[2:]), styles["H1"]))
        elif line.startswith("## "):
            if line.startswith("## 8. Fuentes"):
                story.append(PageBreak())
            story.append(Paragraph(inline(line[3:]), styles["H1"]))
        elif line.startswith("### "):
            story.append(Paragraph(inline(line[4:]), styles["H2"]))
        elif line.startswith("> "):
            story.append(para(line[2:], styles["Quote"]))
        elif re.match(r"^\d+\.\s", line):
            story.append(para("• " + re.sub(r"^\d+\.\s", "", line), styles["BulletBody"]))
        elif line.startswith("- "):
            story.append(para("• " + line[2:], styles["BulletBody"]))
        else:
            story.append(para(line, styles["Body"]))
        i += 1

    story.extend([NextPageTemplate("landscape"), PageBreak(), Paragraph("Anexo A. Matriz de casos de prueba", styles["H1"]), para("Casos diseñados para ejecución en TestLink, Xray, Zephyr o Azure Test Plans. La columna de ejecución se completa cuando el equipo ejecute cada caso en su ambiente.", styles["Body"])])
    cases = read_csv(CASES)
    wide = landscape(A4)[0] - 28 * mm
    case_widths = [wide * p for p in [0.055, 0.055, 0.105, 0.115, 0.14, 0.16, 0.31, 0.06]]
    story.append(make_table(cases, case_widths, font_size=6.3))
    story.extend([NextPageTemplate("portrait"), PageBreak(), Paragraph("Anexo B. Trazabilidad requisito-prueba", styles["H1"]), para("Los casos cubren los requisitos funcionales; la ejecución, el defecto asociado y el estado permanecen pendientes de la corrida del equipo.", styles["Body"]), make_table(read_csv(TRACE), [26 * mm, 72 * mm, 27 * mm, 25 * mm, 27 * mm], font_size=7.2)])
    story.extend([Spacer(1, 8), Paragraph("Anexo C. Registro de defectos observados", styles["H1"]), para("Se muestra lo que el equipo haya capturado en defectos.csv. Completa este archivo solo con fallos reproducibles; deja pendiente lo que no hayas observado.", styles["Body"])])
    raw_defects = read_csv(DEFECTS)
    defect_index = {name: idx for idx, name in enumerate(raw_defects[0])}
    defect_rows = [["ID", "Título", "Caso", "Severidad", "Prioridad", "Estado"]]
    for row in raw_defects[1:]:
        def get(field):
            value = row[defect_index[field]].strip() if field in defect_index and defect_index[field] < len(row) else ""
            return value or "Pendiente"
        defect_rows.append([get("id"), get("titulo"), get("caso"), get("severidad"), get("prioridad"), get("estado")])
    story.append(make_table(defect_rows, [15 * mm, 52 * mm, 20 * mm, 24 * mm, 24 * mm, 27 * mm], font_size=6.8))
    story.extend([Spacer(1, 8), para("Los pasos para reproducir, resultados, ambiente y evidencia completa permanecen en defectos.csv y en los archivos enlazados dentro del ZIP.", styles["Small"])])

    story.extend([NextPageTemplate("landscape"), PageBreak(), Paragraph("Anexo D. Registro de ejecución de los casos", styles["H1"]), para("Esta tabla se completa desde registro_ejecucion.csv cuando el equipo prueba cada caso. El estado no se da por aprobado automáticamente.", styles["Body"])])
    execution = read_csv(EXECUTION)
    exec_index = {name: idx for idx, name in enumerate(execution[0])}
    def exec_get(row, field):
        value = row[exec_index[field]].strip() if field in exec_index and exec_index[field] < len(row) else ""
        return value or "Pendiente"
    exec_data = [["ID", "Fecha", "Ejecutor", "Estado", "Resultado observado", "Defecto", "Evidencia"]]
    for row in execution[1:]:
        exec_data.append([exec_get(row, "id"), exec_get(row, "fecha"), exec_get(row, "ejecutor"), exec_get(row, "estado"), exec_get(row, "resultado_obtenido"), exec_get(row, "defecto"), exec_get(row, "evidencia")])
    counts = {"APROBADO": 0, "FALLIDO": 0, "BLOQUEADO": 0}
    for row in execution[1:]:
        status = exec_get(row, "estado").upper()
        if status in counts:
            counts[status] += 1
    pending = max(0, len(execution)-1-sum(counts.values()))
    story.append(para(f"Resumen actual: {counts['APROBADO']} aprobados | {counts['FALLIDO']} fallidos | {counts['BLOQUEADO']} bloqueados | {pending} pendientes.", styles["Body"]))
    page_width = landscape(A4)[0] - 28 * mm
    story.append(make_table(exec_data, [page_width * p for p in [0.07, 0.11, 0.14, 0.11, 0.27, 0.13, 0.17]], font_size=6.6))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc.multiBuild(story)


if __name__ == "__main__":
    build_document()
    subprocess.run([sys.executable, str(ROOT / "scripts" / "build-diagramas-pdf.py")], check=True)
