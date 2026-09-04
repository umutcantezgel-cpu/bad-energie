# Design System: Bad & Energie GmbH

Umfassende Dokumentation der Design-Tokens, Glasflächen-Architektur, Typografie, Modi und Sicherheitsrichtlinien für die Website und das native Vertriebsmodul.

---

## 1. Farb-Tokens & Paletten

### 1.1 Öffentliche Markenpalette (Corporate Brand)
Die öffentliche Marketing-Präsenz nutzt die etablierte Meisterbetrieb-Farbwelt:

- **Primärblau**: `#0C3A87` (Tiefes Vertrauensblau für Headlines, Primärelemente und Akzente)
- **Akzentrot**: `#E4040E` / `#B91C1C` (Signal- & Aktionsrot für prominente Buttons, Badges und Dringlichkeiten)
- **Cyan / Lichtblau**: `#35A7E9` / `#0284C7` (Technologie- und Lüftungsakzent)
- **Smaragdgrün**: `#059669` / `#10B981` (Erfolgsmeldungen, Förderzusagen, positive Validierung)
- **Neutraltöne**: Slate-Skala von `#0F172A` (Slate-900) über `#475569` (Slate-600) bis `#F8FAFC` (Slate-50)

### 1.2 Briefbogen- und Gewerkepalette (Modul- und Dokumentenbereich)
Für interne Berechnungen, PDF-Kostenschätzungen, E-Mail-Templates und Gewerk-Zuordnungen gilt die verbindliche Farbwelt des Meister-Briefbogens:

| Gewerk | Icon-Schlüssel | HEX-Farbcode | Semantische Bedeutung |
|---|---|---|---|
| **Heizung** | `flamme` | `#EE6C1F` | Warmorange: Gas-, Öl-, Pellet- und Biomasseheizungen |
| **Bad & Wasser** | `wasser` | `#1FA0DC` | Sanitärblau: Badsanierung, Trinkwasserhygiene, Entkalkung |
| **Wärmepumpe & Solar** | `sonne` | `#F0C000` | Sonnengelb/Gold: NIBE Wärmepumpen, PV, Solarthermie, Förderungen |
| **Klima & Lüftung** | `luft` | `#8E959E` | Silbergrau: Wohnraumlüftung, Split-Klimageräte |
| **Elektro & Technik** | `elektro` | `#475569` | Schiefer: Zählerschrank, Regelungstechnik, Vorwand |

---

## 2. Glasflächen-Architektur (Frosted Glass & Double Bezel)

Die Benutzeroberfläche setzt auf moderne, haptische Glasflächen mit Tiefenwirkung:

### 2.1 Double-Bezel Glass
- **Äußerer Rahmen (`glass-bezel-outer`)**: `p-1.5 rounded-[2.5rem] bg-gradient-to-b from-white/90 via-white/60 to-white/30 border border-white/80 shadow-[0_25px_60px_rgba(12,58,135,0.12)] backdrop-blur-2xl`
- **Innerer Kern (`glass-bezel-inner`)**: `rounded-[calc(2.5rem-6px)] bg-white/90 backdrop-blur-xl p-6 sm:p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]`

### 2.2 Oberflächen-Hierarchie
- **Standard Glass Surface (`glass-surface`)**: `bg-white/80 backdrop-blur-xl border border-white/70 shadow-sm rounded-3xl`
- **Dark Luxury Glass (`glass-surface-dark`)**: `bg-gradient-to-br from-[#0C3A87] via-[#0E1C76] to-[#0A1556] text-white backdrop-blur-2xl border border-white/15 shadow-2xl`
- **Ambient Glow Orbs**: Subtile Lichtkegel im Hintergrund (`ambient-glow-blue`, `ambient-glow-cyan`, `ambient-glow-red`) mit `pointer-events-none` und `blur-3xl`.

---

## 3. Typografie-Skala

Verwendet wird das moderne System-Schriftbild (`Inter`, `sans-serif`):

- **Hero Display**: `text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08]`
- **Section Headlines (H2)**: `text-3xl sm:text-4xl font-black text-slate-900 tracking-tight`
- **Card Headlines (H3)**: `text-xl font-black text-slate-900`
- **Sub-Headlines / Labels (H4)**: `text-sm sm:text-base font-bold text-slate-900`
- **Fließtext**: `text-sm sm:text-base text-slate-600 leading-relaxed font-normal`
- **Metadaten & Hilfstexte**: `text-xs text-slate-500 font-medium`
- **Zahlenwerte & Preise**: `tabular-nums font-mono font-bold` zur exakten Spaltenausrichtung bei Währungs- und Maßangaben.

---

## 4. Das Betriebs-Tripel: Modi & Oberflächen

### 4.1 Kunden-Modus (`modus: 'kunde'`)
- Öffentliche geführte Journeys (Bad, Heizung, Wärmepumpe).
- Beträge werden **ausschließlich als gerundete Bruttospanne** (inkl. Material, Montage und 19 % MwSt.) aus der Serverantwort dargestellt.
- Keine Einzelpositionspreise, keine internen Kalkulationsfaktoren, keine Stundensätze.
- Wiederaufnahme erhaltener Eingaben ohne Übermittlung sensibler Kontaktdaten.

### 4.2 Meister-Modus (`modus: 'intern'`)
- Optimiert für Meister und Bauleiter im Außendienst und Büro (`/intern`).
- Schnelle Baustein-Aktivierung, Mengen-Stepper, Varianten-Segmented-Controls, Audio-Diktat/Notizfeld je Position.
- Live-Kalkulationsleiste (`LiveCalcBar`): Netto-Spanne, Brutto-Spanne, Förderungszuschuss (gold hervorgehoben), Blockiert-Zähler.
- Sofort-Versand oder Entwurfsablage mit automatischem 18:00-Uhr-Versandpuffer.

### 4.3 Baustellen-Modus (`data-baustelle="true"`)
- Aktivierbar manuell in der Toolbar oder automatisch bei Touchscreen (`pointer: coarse`) mit aktivierter Kontrastpräferenz (`prefers-reduced-transparency`).
- **Opake Oberflächen**: Alle Glasflächen schalten auf `rgba(255,255,255,0.98)` ohne Blur um (blendfrei bei Sonnenlicht).
- **Vergrößerte Touch-Ziele**: Mindestens 56 px für Handschuhbedienung.
- **Größere Schriftgrößen** und deaktivierte Ambient-Glows für maximale Akkulaufzeit und Lesbarkeit.

---

## 5. Kundenansicht & Deny-List im DOM

Für Beratungsgespräche auf dem Tablet mit Kunden schaltet der Meister in die **Kundenansicht**:

- **Strikte Filterung**: Folgende Felder werden vollständig aus dem DOM entfernt (verifiziert per Test):
  - `stundensatz`
  - `material_zuschlag_prozent`
  - `rabatt_prozent`
  - `marge_hinweis`
  - Positionsnotizen (`notizIntern`)
  - Interne Vermerke & Triage-Einstufungen
- Sichtbar bleiben lediglich Leistungsbeschreibungen, Bruttospannen und Förderungsblöcke.

---

## 6. Barrierefreiheit & Animationen (WCAG 2.2 AA)

- **Bewegungsreduktion**: Volle Unterstützung für `prefers-reduced-motion`. Alle Übergänge fallen verzögerungsfrei aus.
- **Kontraste**: Alle Textfarben erfüllen ein Kontrastverhältnis von mindestens 4.5:1 (Normaltext) bzw. 7:1 (High-Contrast).
- **Fokus-Ringe**: Tastaturnavigation über sichtbare Fokusringe mit `focus:ring-2 focus:ring-[#0C3A87]`.
- **Screenreader**: Vollständige ARIA-Attribute (`aria-live="polite"`, `aria-hidden="true"`, aussagekräftige Labels auf allen Icon-Buttons).
