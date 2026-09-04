#!/usr/bin/env python3
"""
Bad & Energie · Kostenschätzung rendern

Aufruf in der Mappe:
    python "00 Vorlagen/render.py" datenblatt.json .
    python "00 Vorlagen/render.py" datenblatt.json . --erinnerung

Erzeugt im Zielordner:
    Kostenschaetzung.html / .pdf     DIN A4, druckstabil
    Mail.html / Mail.txt             Erstkontakt
    Annahmen.md                      internes Blatt für die Freigabe
    mit --erinnerung nur:  Erinnerung.html / Erinnerung.txt

Versendet wird nichts. Das ist Absicht.

PDF-Erzeugung, in dieser Reihenfolge:
    1. Playwright (pip install playwright; playwright install chromium)
    2. Microsoft Edge headless (auf jedem Windows vorhanden)
    3. Google Chrome headless
    Klappt keines, bleibt die HTML liegen. Dann in Edge öffnen und als PDF drucken.
"""

import base64
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

HIER = Path(__file__).resolve().parent
TPL_PDF = HIER / "kostenschaetzung-template.html"
TPL_MAIL = HIER / "erstkontakt-mail.html"
TPL_TXT = HIER / "erstkontakt-mail.txt"
TPL_ERI = HIER / "erinnerung-mail.html"
TPL_ERI_TXT = HIER / "erinnerung-mail.txt"
LOGO = HIER / "logo-bad-energie.jpg"
ICONS = {k: HIER / f"icon_{k}.png" for k in ("flamme", "wasser", "sonne", "luft")}
GEWERK_ICON = {"heizung": "flamme", "bad": "wasser", "wasser": "wasser", "waermepumpe": "sonne",
               "solar": "sonne", "pv": "sonne", "klima": "luft", "lueftung": "luft"}
GEWERK_FARBE = {"flamme": "#EE6C1F", "wasser": "#1FA0DC", "sonne": "#F0C000", "luft": "#8E959E"}
GEWERK_LABEL = {"flamme": "Heizung", "wasser": "Bad und Wasser", "sonne": "Wärmepumpe und Solar", "luft": "Klima und Lüftung"}


def b64(path):
    return base64.b64encode(path.read_bytes()).decode("ascii") if path.exists() else ""


def euro(n):
    if n is None or n == "":
        return ""
    return f"{int(round(float(n))):,}".replace(",", ".")


def fill(text, mapping):
    return re.sub(r"\{\{(\w+)\}\}", lambda m: str(mapping.get(m.group(1), "")), text)


def block(text, name, keep):
    pat = re.compile(rf"<!--\s*{name}\s*-->(.*?)<!--\s*/{name}\s*-->", re.S)
    return pat.sub((lambda m: m.group(1)) if keep else "", text)


def rows_html(text, rows):
    pat = re.compile(r"<!--\s*ROW\s*-->(.*?)<!--\s*/ROW\s*-->", re.S)

    def icon_tag(r):
        key = GEWERK_ICON.get(str(r.get("gewerk", "")).lower())
        return f'<img src="data:image/png;base64,{b64(ICONS[key])}" alt="">' if key else ""

    def build(m):
        return "".join(fill(m.group(1), {
            "row_icon": icon_tag(r),
            "row_titel": r.get("titel", ""),
            "row_text": r.get("text", ""),
            "row_von": euro(r.get("von")),
            "row_bis": euro(r.get("bis")),
        }) for r in rows)
    return pat.sub(build, text)


def chips_html(rows):
    seen, out = set(), []
    for r in rows:
        key = GEWERK_ICON.get(str(r.get("gewerk", "")).lower())
        if not key or key in seen:
            continue
        seen.add(key)
        out.append(
            '<td style="padding:0 13px 0 0; white-space:nowrap;">'
            f'<span style="display:inline-block; width:10px; height:10px; border-radius:5px; background-color:{GEWERK_FARBE[key]}; vertical-align:middle; margin-right:6px;"></span>'
            f"<span style=\"font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:14px; line-height:21px; color:#4A4F5C; vertical-align:middle;\">{GEWERK_LABEL[key]}</span></td>"
        )
    return "".join(out)


def pdf_playwright(html, out_pdf, nr):
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page()
        pg.set_content(html, wait_until="load")
        pg.pdf(path=str(out_pdf), format="A4", print_background=True, prefer_css_page_size=True,
               display_header_footer=True, header_template="<div></div>",
               footer_template=("<div style='width:100%;font-family:Arial,sans-serif;font-size:7.5pt;color:#4A4F5C;"
                                f"text-align:right;padding:0 16mm 0 0;'>{nr} · Seite <span class='pageNumber'></span> von <span class='totalPages'></span></div>"),
               margin={"top": "14mm", "right": "16mm", "bottom": "16mm", "left": "16mm"})
        b.close()


def pdf_browser(html_path, out_pdf):
    """Edge oder Chrome headless. Seitenzahlen entfallen, Layout bleibt gleich."""
    kandidaten = [
        shutil.which("msedge"), shutil.which("microsoft-edge"), shutil.which("chrome"),
        shutil.which("google-chrome"), shutil.which("chromium"), shutil.which("chromium-browser"),
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    ]
    for exe in kandidaten:
        if not exe or not Path(exe).exists():
            continue
        cmd = [exe, "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
               f"--print-to-pdf={out_pdf.resolve()}", html_path.resolve().as_uri()]
        try:
            subprocess.run(cmd, check=True, timeout=90, capture_output=True)
            if out_pdf.exists() and out_pdf.stat().st_size > 1000:
                return exe
        except Exception:
            continue
    return None


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    daten = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    out = Path(sys.argv[2])
    out.mkdir(parents=True, exist_ok=True)
    nur_erinnerung = "--erinnerung" in sys.argv
    nr = daten.get("ks_nummer", "KS")

    rows = daten.get("rows", [])
    fehlende = [r.get("titel") for r in rows if r.get("von") in (None, "") or r.get("bis") in (None, "")]
    if fehlende and not nur_erinnerung:
        print("BLOCKIERT: Spanne fehlt bei:", ", ".join(fehlende))
        (out / "Annahmen.md").write_text(
            f"# Freigabe {nr}\n\nStatus: blockiert, Matrix fehlt\n\nOhne Spanne: " + ", ".join(fehlende) + "\n", encoding="utf-8")
        sys.exit(2)

    netto_von = daten.get("summe_netto_von") or sum(float(r.get("von", 0)) for r in rows)
    netto_bis = daten.get("summe_netto_bis") or sum(float(r.get("bis", 0)) for r in rows)
    haupt = GEWERK_ICON.get(str(daten.get("gewerk_haupt", "")).lower()) or (
        GEWERK_ICON.get(str(rows[0].get("gewerk", "")).lower()) if rows else None)

    m = dict(daten)
    m.update({
        "logo_base64": b64(LOGO),
        "icon_flamme": b64(ICONS["flamme"]), "icon_wasser": b64(ICONS["wasser"]),
        "icon_sonne": b64(ICONS["sonne"]), "icon_luft": b64(ICONS["luft"]),
        "gewerk_farbe": GEWERK_FARBE.get(haupt, "#1B3A8C"),
        "gewerk_chips": chips_html(rows),
        "summe_netto_von": euro(netto_von), "summe_netto_bis": euro(netto_bis),
        "summe_brutto_von": euro(netto_von * 1.19), "summe_brutto_bis": euro(netto_bis * 1.19),
        "annahmen_liste": "\n".join(f"<li>{a}</li>" for a in daten.get("annahmen", [])),
        "annahmen_text": "\n".join(f"- {a}" for a in daten.get("annahmen", [])),
    })
    f = daten.get("foerderung")
    if f:
        m.update({"foerder_kosten": euro(f.get("kosten")), "foerder_satz": f.get("satz", ""),
                  "foerder_zuschuss": euro(f.get("zuschuss")),
                  "eigenanteil_von": euro(f.get("eigenanteil_von")), "eigenanteil_bis": euro(f.get("eigenanteil_bis"))})

    if nur_erinnerung:
        (out / "Erinnerung.html").write_text(fill(block(TPL_ERI.read_text(encoding="utf-8"), "FOERDERUNG", bool(f)), m), encoding="utf-8")
        (out / "Erinnerung.txt").write_text(fill(TPL_ERI_TXT.read_text(encoding="utf-8"), m), encoding="utf-8")
        print("Erinnerung:", out)
        return

    html = fill(block(rows_html(TPL_PDF.read_text(encoding="utf-8"), rows), "FOERDERUNG", bool(f)), m)
    html_path = out / "Kostenschaetzung.html"
    html_path.write_text(html, encoding="utf-8")
    pdf_path = out / "Kostenschaetzung.pdf"
    try:
        pdf_playwright(html, pdf_path, nr)
        print("PDF über Playwright:", pdf_path)
    except Exception as e:
        exe = pdf_browser(html_path, pdf_path)
        if exe:
            print("PDF über Browser:", exe, "->", pdf_path)
        else:
            print("PDF nicht erzeugt. HTML in Edge öffnen und als PDF drucken:", html_path)
            print("  Playwright-Fehler:", e)

    (out / "Mail.html").write_text(fill(block(TPL_MAIL.read_text(encoding="utf-8"), "FOERDERUNG", bool(f)), m), encoding="utf-8")
    (out / "Mail.txt").write_text(fill(block(TPL_TXT.read_text(encoding="utf-8"), "FOERDERUNG", bool(f)), m), encoding="utf-8")

    offen = [k for k in ("anrede", "telefon", "email", "terminvorschlag", "objekt_adresse") if not daten.get(k)]
    (out / "Annahmen.md").write_text("\n".join([
        f"# Freigabe {nr}", "",
        f"Kunde: {daten.get('anrede','')} {daten.get('vorname','')} {daten.get('nachname','')}, {daten.get('email','')}",
        f"Objekt: {daten.get('objekt_adresse','')}",
        f"Vorhaben: {daten.get('vorhaben_kurz','')}",
        f"Vorlage: {daten.get('vorlage','')}",
        f"Spanne netto: {m['summe_netto_von']} bis {m['summe_netto_bis']} €",
        f"Spanne brutto: {m['summe_brutto_von']} bis {m['summe_brutto_bis']} €",
        f"Terminvorschlag: {daten.get('terminvorschlag','')}", "",
        "## Annahmen, die im PDF stehen", m["annahmen_text"], "",
        "## Fehlende Angaben", ("\n".join(f"- {k}" for k in offen) if offen else "- keine"), "",
        "## Entscheidung (Mappe verschieben)",
        "- nach 03 Freigegeben: senden",
        "- in 02 Geplant lassen und Sprachnotiz dazu: anpassen",
        "- nach 99 Verworfen: nicht senden", "",
    ]), encoding="utf-8")
    print("Fertig:", out)


if __name__ == "__main__":
    main()
