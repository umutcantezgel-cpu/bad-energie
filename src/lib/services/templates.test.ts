import { describe, expect, it } from 'vitest';

import { dossierAus, eingabeAus } from '../../../test/fixtures/eingabe';
import { anredeZeile } from '../dokumente/datenblatt';
import {
  betreffSicher,
  escapeHtml,
  expandRows,
  fillTokens,
  fillTokensText,
  renderAbschlussberichtMd,
  renderAnnahmenMd,
  renderDossierMail,
  renderEingangsbestaetigung,
  renderErinnerungMail,
  renderErstkontaktMail,
  renderKostenschaetzungHtml,
  renderTerminmail,
  ROH_TOKENS,
  stripBlock,
} from './templates';

const XSS_SKRIPT = '<script>alert(1)</script>';
const XSS_ATTRIBUT = '"><img src=x onerror=alert(1)>';

/** Inhalt der Legendetabelle des PDF-HTML, ohne die Piktogramme. */
function legendeAus(html: string): string {
  const treffer = html.match(/<table class="legende">([\s\S]*?)<\/table>/);
  return (treffer?.[1] ?? '').replace(/<svg[\s\S]*?<\/svg>/g, '');
}

/** HTML ohne Kommentare und CSS-Kommentare: nur der Text, den ein Leser sieht. */
function ohneKommentare(html: string): string {
  return html.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
}

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

describe('Template-Engine', () => {
  it('rollt den ROW-Block je Zeile aus', () => {
    const vorlage = 'A<!-- ROW --><li>{{row_titel}}</li><!-- /ROW -->B';
    expect(expandRows(vorlage, [{ row_titel: 'eins' }, { row_titel: 'zwei' }])).toBe('A<li>eins</li><li>zwei</li>B');
  });

  it('entfernt den ROW-Block ganz, wenn es keine Zeilen gibt', () => {
    expect(expandRows('A<!-- ROW -->x<!-- /ROW -->B', [])).toBe('AB');
  });

  it('behält oder entfernt einen benannten Block', () => {
    const vorlage = 'A<!-- FOERDERUNG -->F<!-- /FOERDERUNG -->B';
    expect(stripBlock(vorlage, 'FOERDERUNG', true)).toBe('AFB');
    expect(stripBlock(vorlage, 'FOERDERUNG', false)).toBe('AB');
  });

  it('ersetzt unbekannte Tokens durch Leerstring', () => {
    expect(fillTokens('[{{gibtsnicht}}]', {})).toBe('[]');
  });

  it('hält die Reihenfolge ein: Zeilen vor Block vor Tokens', () => {
    // Der Förderblock steht innerhalb des ROW-Blocks; nur die richtige Reihenfolge
    // erzeugt je Zeile einen Wert und entfernt danach den Block.
    const vorlage = '<!-- ROW -->{{row_titel}}<!-- FOERDERUNG -->[{{foerder_satz}}]<!-- /FOERDERUNG --><!-- /ROW -->{{ks_nummer}}';
    let html = expandRows(vorlage, [{ row_titel: 'a' }, { row_titel: 'b' }]);
    html = stripBlock(html, 'FOERDERUNG', false);
    html = fillTokens(html, { ks_nummer: 'KS-2026-0031' });
    expect(html).toBe('abKS-2026-0031');
  });

  it('escaped alle Werte außer der Allow-Liste', () => {
    expect(fillTokens('{{titel}}', { titel: XSS_SKRIPT })).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(fillTokens('{{row_icon}}', { row_icon: '<svg></svg>' })).toBe('<svg></svg>');
    expect(escapeHtml(XSS_ATTRIBUT)).toBe('&quot;&gt;&lt;img src=x onerror=alert(1)&gt;');
  });

  it('führt genau die vorgegebenen Tokens auf der Roh-Allow-Liste', () => {
    for (const name of [
      'row_icon',
      'gewerk_chips',
      'annahmen_liste',
      'vorbehalte_liste',
      'legende',
      'logo_base64',
      'icon_flamme',
      'icon_wasser',
      'icon_sonne',
      'icon_luft',
      'icon_elektro',
      'font_base64',
    ]) {
      expect(ROH_TOKENS.has(name)).toBe(true);
    }
    // Werte aus Kundendaten stehen nie auf der Liste.
    for (const name of ['persoenlicher_satz', 'row_titel', 'row_text', 'nachname', 'terminvorschlag', 'objekt_adresse']) {
      expect(ROH_TOKENS.has(name)).toBe(false);
    }
  });

  it('vereinheitlicht CR/LF in Textvorlagen', () => {
    expect(fillTokensText('a\r\nb{{x}}', { x: 'y\r\nz' })).toBe('a\nby\nz');
  });

  it('hält Betreffzeilen frei von CR und LF', () => {
    expect(betreffSicher('Zeile\r\nBcc: opfer@example.de', 'Ersatz')).toBe('Zeile Bcc: opfer@example.de');
    expect(betreffSicher('   ', 'Ersatz')).toBe('Ersatz');
    expect(betreffSicher('x'.repeat(200), 'Ersatz')).toHaveLength(120);
  });
});

// ---------------------------------------------------------------------------
// Golden-Tests gegen die Altsystem-Datenblätter
// ---------------------------------------------------------------------------

describe('Kostenschätzung KS-2026-0031 (Klima und Bad, ohne Förderung)', () => {
  const eingabe = eingabeAus('0031');
  const html = renderKostenschaetzungHtml(eingabe);

  it('zeigt die Bruttospanne 25.466 bis 33.677', () => {
    expect(html).toContain('25.466');
    expect(html).toContain('33.677');
  });

  it('zeigt die Nettospanne 21.400 bis 28.300', () => {
    expect(html).toContain('21.400');
    expect(html).toContain('28.300');
  });

  it('lässt den Förderblock weg', () => {
    expect(html).not.toContain('Voraussichtliche Förderung');
    expect(html).not.toContain('Ihr voraussichtlicher Eigenanteil');
  });

  it('lässt den Block Nicht enthalten und bauseits ohne Vorbehalte weg', () => {
    expect(html).not.toContain('Nicht enthalten und bauseits');
  });

  it('zeigt den Block Nicht enthalten und bauseits mit Vorbehalten vor So geht es weiter', () => {
    const mitVorbehalt = renderKostenschaetzungHtml(eingabeAus('0031', { vorbehalte: ['Fliesenarbeiten', 'Malerarbeiten'] }));
    expect(mitVorbehalt).toContain('Nicht enthalten und bauseits');
    expect(mitVorbehalt).toContain('<li>Fliesenarbeiten</li>');
    expect(mitVorbehalt.indexOf('Nicht enthalten und bauseits')).toBeLessThan(mitVorbehalt.indexOf('So geht es weiter'));
  });

  it('nutzt die Anrede-Zeile statt Anrede plus Nachname', () => {
    expect(html).toContain('Guten Tag Frau Musterfrau,');
    expect(anredeZeile(eingabe.kunde)).toBe('Frau Musterfrau');
  });

  it('zeigt eine Legende ohne Elektro und ohne Sonne', () => {
    const legende = legendeAus(html);
    expect(legende).toContain('Heizung');
    expect(legende).toContain('Bad und Wasser');
    expect(legende).toContain('Klima und Lüftung');
    expect(legende).not.toContain('Elektro');
    expect(legende).not.toContain('Wärmepumpe und Solar');
  });

  it('zeichnet die Piktogramme vektoriell und bettet die Schrift ein', () => {
    expect(html).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
    expect(html).toContain("@font-face{font-family:'Liberation Sans'");
  });
});

describe('Kostenschätzung KS-2026-0032 (Wärmepumpe mit Förderung)', () => {
  const html = renderKostenschaetzungHtml(eingabeAus('0032'));

  it('zeigt die Bruttospanne 31.416 bis 39.627', () => {
    expect(html).toContain('31.416');
    expect(html).toContain('39.627');
  });

  it('zeigt die Nettospanne 26.400 bis 33.300 aus den Zeilen', () => {
    expect(html).toContain('26.400');
    expect(html).toContain('33.300');
  });

  it('zeigt den Förderblock mit Zuschuss 16.500', () => {
    expect(html).toContain('Voraussichtliche Förderung');
    expect(html).toContain('16.500');
    expect(html).toContain('15.000');
    expect(html).toContain('23.000');
  });

  it('zeigt Elektro in der Legende', () => {
    expect(html).toContain('Elektro');
    expect(html).toContain('Wärmepumpe und Solar');
  });
});

// ---------------------------------------------------------------------------
// Escaping in echten Dokumenten
// ---------------------------------------------------------------------------

describe('Escaping', () => {
  const boese = eingabeAus('0031');
  const eingabe = {
    ...boese,
    persoenlicherSatz: `Hallo ${XSS_SKRIPT}`,
    annahmen: [`Annahme ${XSS_ATTRIBUT}`],
    vorbehalte: [`Vorbehalt ${XSS_SKRIPT}`],
    terminvorschlag: `Dienstag ${XSS_ATTRIBUT}`,
    positionen: boese.positionen.map((p, i) =>
      i === 0 ? { ...p, titel: `Titel ${XSS_SKRIPT}`, text: `Text ${XSS_ATTRIBUT}` } : p,
    ),
  };

  it('escaped Skript und Attributausbruch im PDF-HTML', () => {
    const html = renderKostenschaetzungHtml(eingabe);
    expect(html).not.toContain('<script');
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('&quot;&gt;&lt;img src=x onerror=alert(1)&gt;');
  });

  it('escaped in der Erstkontaktmail', () => {
    const mail = renderErstkontaktMail(eingabe);
    expect(mail.html).not.toContain('<script');
    expect(mail.html).not.toContain('<img src=x');
    expect(mail.html).toContain('&lt;script&gt;');
    // Die Textfassung ist kein HTML und wird nicht escaped.
    expect(mail.text).toContain(XSS_SKRIPT);
  });

  it('escaped Positionsnotizen im internen Dossier', () => {
    const dossier = renderDossierMail({
      ...dossierAus('0031'),
      positionenIntern: dossierAus('0031').positionenIntern.map((p) => ({ ...p, notizIntern: XSS_SKRIPT })),
    });
    expect(dossier.html).not.toContain('<script>');
    expect(dossier.html).toContain('&lt;script&gt;');
  });
});

// ---------------------------------------------------------------------------
// Vertragstests
// ---------------------------------------------------------------------------

const KUNDENMAILS = [
  ['Erstkontakt', renderErstkontaktMail(eingabeAus('0032'))],
  ['Erinnerung', renderErinnerungMail(eingabeAus('0032'))],
  ['Terminmail', renderTerminmail(eingabeAus('0032'))],
] as const;

describe('Vertrag: das Dokument heißt Kostenschätzung, nie Angebot', () => {
  it('nennt „Angebot“ im Kunden-HTML nur im § 145-Satz und im Ablaufschritt zum späteren Angebot', () => {
    const html = ohneKommentare(renderKostenschaetzungHtml(eingabeAus('0032')));
    const disclaimer =
      'Diese Kostenschätzung ist unverbindlich und kein Angebot im Sinne des § 145 BGB. Verbindlich sind allein die Preise des schriftlichen Angebots nach dem Termin vor Ort. Materialpreise mit Rohstoffbindung können sich bis dahin ändern.';
    expect(html).toContain(disclaimer);
    const ablaufschritt =
      '<li><strong>Verbindliches Angebot</strong>Danach erhalten Sie ein Angebot mit festen Preisen und allen Positionen im Detail, in der Regel innerhalb einer Woche.</li>';
    expect(html).toContain(ablaufschritt);
    const rest = html.replace(disclaimer, '').replace(ablaufschritt, '');
    expect(rest).not.toContain('Angebot');
    // Das Dokument selbst trägt durchgehend den Titel Kostenschätzung.
    expect(html).toContain('<h1>Kostenschätzung</h1>');
  });

  for (const [name, mail] of KUNDENMAILS) {
    it(`nennt „Angebot“ nicht in der ${name}-Mail`, () => {
      expect(mail.html).not.toContain('Angebot');
      expect(mail.text).not.toContain('Angebot');
    });

    it(`nennt „netto“ nicht in der ${name}-Mail`, () => {
      expect(mail.html.toLowerCase()).not.toContain('netto');
      expect(mail.text.toLowerCase()).not.toContain('netto');
    });
  }

  it('nennt „netto“ nicht in der Eingangsbestätigung', () => {
    const mail = renderEingangsbestaetigung({
      ksNummer: 'KS-2026-0031',
      anredeZeile: 'Frau Musterfrau',
      briefbogen: eingabeAus('0031').briefbogen,
      bearbeiter: eingabeAus('0031').bearbeiter,
      appUrl: 'https://bad-energie.de',
    });
    expect(mail.html.toLowerCase()).not.toContain('netto');
    expect(mail.text.toLowerCase()).not.toContain('netto');
    expect(mail.betreff).toBe('Ihre Anfrage ist eingegangen, KS-2026-0031');
    // Kein Freitext des Absenders, nur Nummer und fester Satz
    expect(mail.text).toContain('KS-2026-0031');
    expect(mail.text).toContain('Ihre Anfrage ist bei uns eingegangen');
  });
});

describe('Vertrag: interne Felder erreichen kein Kundendokument', () => {
  const dossier = dossierAus('0031');

  it('trägt weder Positionsnotiz noch Stundensatz noch interne Notiz', () => {
    // Bewusst die vollständige interne Eingabe in die Kundenrenderer geben:
    // sie dürfen nichts davon ausgeben, auch wenn es im Objekt steht.
    const sentinel = {
      ...dossier,
      kalkulation: { stundensatz: 999111, materialZuschlagProzent: 999222, rabattProzent: 7, margeHinweis: 'SENTINEL_MARGE' },
      notizen: { ...dossier.notizen, intern: 'SENTINEL_NOTIZ', montagehindernisse: 'SENTINEL_HINDERNIS' },
      positionenIntern: dossier.positionenIntern.map((p) => ({ ...p, notizIntern: 'SENTINEL_POSITIONSNOTIZ' })),
      triageVorschlag: 'SENTINEL_TRIAGE',
      csvZeile: 'SENTINEL_CSV',
      datenblattJson: 'SENTINEL_JSON',
    };
    const kundenAusgaben = [
      renderKostenschaetzungHtml(sentinel),
      renderErstkontaktMail(sentinel).html,
      renderErstkontaktMail(sentinel).text,
      renderErinnerungMail(sentinel).html,
      renderErinnerungMail(sentinel).text,
      renderTerminmail(sentinel).html,
      renderTerminmail(sentinel).text,
    ];
    const verboten = [
      'SENTINEL_POSITIONSNOTIZ',
      'SENTINEL_NOTIZ',
      'SENTINEL_HINDERNIS',
      'SENTINEL_MARGE',
      'SENTINEL_TRIAGE',
      'SENTINEL_CSV',
      'SENTINEL_JSON',
      '999111',
      '999222',
      'notizIntern',
      'stundensatz',
      'Stundensatz',
      'intern/anfragen',
    ];
    for (const ausgabe of kundenAusgaben) {
      for (const wert of verboten) {
        expect(ausgabe).not.toContain(wert);
      }
    }
  });

  it('nimmt genau diese Felder in das interne Dossier auf', () => {
    const mail = renderDossierMail(dossier);
    expect(mail.html).toContain('Stundensatz: 68 Euro');
    expect(mail.html).toContain('Notiz: Nur intern');
    expect(mail.html).toContain('Marge knapp, Bad mitrechnen');
    expect(mail.html).toContain('Enges Treppenhaus');
    expect(mail.text).toContain('Stundensatz: 68 Euro');
    expect(mail.text).toContain('netto 11.800 bis 14.600 Euro');
    expect(mail.text).toContain('brutto 14.042 bis 17.374 Euro');
    expect(mail.html).toContain('https://bad-energie.de/intern/anfragen/a-1');
    expect(mail.betreff).toBe('Dossier KS-2026-0031 Musterfrau, Heizungsersatz durch Multisplit Klimaanlage und Badumgestaltung');
    expect(mail.betreff).not.toMatch(/[\r\n]/);
  });
});

// ---------------------------------------------------------------------------
// Mails im Einzelnen
// ---------------------------------------------------------------------------

describe('Kundenmails', () => {
  it('trägt in der Erstkontaktmail Betreff, Kernzahl und Gewerke-Chips', () => {
    const mail = renderErstkontaktMail(eingabeAus('0032'));
    expect(mail.betreff).toBe('Ihre Kostenschätzung für die Wärmepumpe');
    expect(mail.html).toContain('31.416 bis 39.627 €');
    expect(mail.html).toContain('Wärmepumpe und Solar');
    expect(mail.html).toContain('Elektro');
    expect(mail.html).toContain('rund 16.500 €');
    expect(mail.text).toContain('31.416 bis 39.627 Euro');
  });

  it('nutzt in der Erinnerung den vorgegebenen Betreff und keine Kernzahl-Kachel', () => {
    const mail = renderErinnerungMail(eingabeAus('0032'));
    expect(mail.betreff).toBe('Kurze Nachfrage zu Ihrer Kostenschätzung KS-2026-0032');
    expect(mail.html).not.toContain('Voraussichtlich, inklusive Material, Montage und Mehrwertsteuer');
    expect(mail.html).toContain('Spanne 31.416 bis 39.627 €');
  });

  it('nennt in der Terminmail keinen Betrag', () => {
    const mail = renderTerminmail(eingabeAus('0032'));
    expect(mail.betreff).toBe('Ihre Anfrage, Terminvorschlag');
    for (const betrag of ['31.416', '39.627', '26.400', '33.300', '16.500']) {
      expect(mail.html).not.toContain(betrag);
      expect(mail.text).not.toContain(betrag);
    }
    expect(mail.text.startsWith('Betreff:')).toBe(false);
    expect(mail.text).toContain('Guten Tag Herr Mustermann,');
  });

  it('zeigt den Button ohne Bestätigungsurl auf mailto', () => {
    const mail = renderErstkontaktMail(eingabeAus('0031'));
    expect(mail.html).toContain('href="mailto:info@bad-energie.de?subject=Termin%20KS-2026-0031"');
    expect(mail.html).not.toContain('Oder antworten Sie einfach per Mail an');
  });

  it('zeigt den Button mit Bestätigungsurl auf die Seite und mailto als Textzeile', () => {
    const url = 'https://bad-energie.de/termin/bestaetigen/abc123';
    const mail = renderErstkontaktMail(eingabeAus('0031', { bestaetigungsUrl: url }));
    // href und VML-Variante zeigen auf dieselbe Adresse
    expect(mail.html.split(`href="${url}"`).length - 1).toBe(2);
    expect(mail.html).toContain('Oder antworten Sie einfach per Mail an');
    expect(mail.html).toContain('mailto:info@bad-energie.de?subject=Termin%20KS-2026-0031');
    expect(mail.text).toContain(`Termin bestätigen: ${url}`);
  });

  it('weist ein unsicheres Ziel ab', () => {
    const mail = renderErstkontaktMail(eingabeAus('0031', { bestaetigungsUrl: 'javascript:alert(1)' }));
    expect(mail.html).not.toContain('javascript:');
    expect(mail.html).toContain('href="mailto:info@bad-energie.de?subject=Termin%20KS-2026-0031"');
  });
});

// ---------------------------------------------------------------------------
// Interne Blätter
// ---------------------------------------------------------------------------

describe('Freigabeblatt und Abschlussbericht', () => {
  it('folgt dem Aufbau von render.py', () => {
    const md = renderAnnahmenMd(eingabeAus('0032'), { fehlendeAngaben: ['telefon'], warnungen: ['Anrede unsicher'] });
    expect(md.startsWith('# Freigabe KS-2026-0032')).toBe(true);
    expect(md).toContain('Kunde: Herr Max Mustermann, kundin@example.de');
    expect(md).toContain('Objekt: Beispielweg 4, 35576 Wetzlar');
    expect(md).toContain('Vorhaben: Luft/Wasser Wärmepumpe statt Gasheizung');
    expect(md).toContain('Vorlage: waermepumpe_gas');
    expect(md).toContain('Spanne netto: 26.400 bis 33.300 €');
    expect(md).toContain('Spanne brutto: 31.416 bis 39.627 €');
    expect(md).toContain('Terminvorschlag: Mittwoch, 10. September, ab 9 Uhr');
    expect(md).toContain('## Annahmen, die im PDF stehen');
    expect(md).toContain('## Fehlende Angaben\n- telefon');
    expect(md).toContain('## Entscheidung');
    expect(md).toContain('## Warnungen\n- Anrede unsicher');
  });

  it('schreibt den Abschlussbericht mit Versanddatum und Wiedervorlage', () => {
    const md = renderAbschlussberichtMd(eingabeAus('0031', { vorbehalte: ['Fliesenarbeiten'] }), {
      versandDatum: '04.09.2026',
      wiedervorlage: '09.09.2026',
    });
    expect(md).toContain('# Abschlussbericht KS-2026-0031');
    expect(md).toContain('Versendet am: 04.09.2026');
    expect(md).toContain('Wiedervorlage: 09.09.2026');
    expect(md).toContain('- Fliesenarbeiten');
  });
});


describe('Betriebskosten und Förderbausteine', () => {
  const betriebskosten = { energieartLabel: 'Gas', heuteJahr: 2420, wpJahr: 1510, wpMitPvJahr: null, ersparnisJahr: 910, proMonat: 125 };
  const bausteine = ['Grundförderung 30 %', 'Alte Gas- oder Ölheizung 20 %', 'Natürliches Kältemittel (R290) 5 %'];

  it('zeigt den Block nur, wenn Betriebskosten vorliegen', () => {
    const mit = renderKostenschaetzungHtml(eingabeAus('0032', { betriebskosten, foerderBausteine: bausteine }));
    expect(mit).toContain('Was Sie im Betrieb sparen können');
    expect(mit).toContain('etwa 2.420 € im Jahr');
    expect(mit).toContain('etwa 1.510 € im Jahr');
    expect(mit).toContain('rund 125 € im Monat');
    expect(mit).toContain('Darin enthalten: Grundförderung 30 %, Alte Gas- oder Ölheizung 20 %, Natürliches Kältemittel (R290) 5 %.');
    const ohne = renderKostenschaetzungHtml(eingabeAus('0032'));
    expect(ohne).not.toContain('Was Sie im Betrieb sparen können');
    expect(ohne).not.toContain('Darin enthalten');
    expect(ohne).not.toContain('{{betrieb_');
  });

  it('setzt den Satz in Erstkontakt und Dossier, nicht in die Terminmail', () => {
    const e = eingabeAus('0032', { betriebskosten, foerderBausteine: bausteine });
    const mail = renderErstkontaktMail(e);
    expect(mail.html).toContain('rund 125 € im Monat');
    expect(mail.text).toContain('rund 125 Euro im Monat');
    expect(mail.text).toContain('Darin enthalten: Grundförderung 30 %');
    const termin = renderTerminmail(e);
    expect(termin.html).not.toContain('125');
    expect(termin.text).not.toContain('Betrieb');
    const dossier = renderDossierMail(dossierAus('0032', { betriebskosten, foerderBausteine: bausteine }));
    expect(dossier.text).toContain('Betriebskosten (Kundendokument)');
  });

  it('Jahresarbeitszahl und Energiepreise erreichen das Kundendokument nie', () => {
    const html = renderKostenschaetzungHtml(eingabeAus('0032', { betriebskosten, foerderBausteine: bausteine }))
      .replace(/data:[a-z/+.-]+;base64,[A-Za-z0-9+/=]+/g, '');
    expect(html).not.toMatch(/Jahresarbeitszahl|JAZ|ct\/kWh|Cent/);
  });
});
