import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { GRENZE_MB, mb, nftDateien, routenName, tabelle, vermesse } from './bundle-pruefen';

/**
 * Die Prüfung muss anschlagen, bevor Vercel das Deployment mit 250 MB entpackt abweist.
 * Getestet werden die reinen Teile: Fundstelle, Routenname, Summe und Tabellenmarke.
 */
describe('bundle-pruefen', () => {
  const wurzel = path.join(tmpdir(), `bundle-pruefen-test-${process.pid}`);
  const serverWurzel = path.join(wurzel, '.next', 'server');

  function baueBeispiel(): void {
    const routeVerzeichnis = path.join(serverWurzel, 'app', 'api', 'intern', '[...slug]');
    mkdirSync(routeVerzeichnis, { recursive: true });
    mkdirSync(path.join(wurzel, 'public'), { recursive: true });
    writeFileSync(path.join(wurzel, 'public', 'bild.bin'), Buffer.alloc(2048));
    writeFileSync(path.join(routeVerzeichnis, 'route.js'), 'x'.repeat(100));
    writeFileSync(
      path.join(routeVerzeichnis, 'route.js.nft.json'),
      JSON.stringify({
        version: 1,
        // Doppelter Eintrag und ein Verweis ohne Ziel: beides darf die Summe nicht verfälschen.
        files: ['route.js', 'route.js', '../../../../../../public/bild.bin', 'fehlt.js'],
      }),
    );
  }

  it('findet die Trace-Dateien und benennt die Route', () => {
    baueBeispiel();
    const gefunden = nftDateien(serverWurzel);
    expect(gefunden).toHaveLength(1);
    expect(routenName(gefunden[0], serverWurzel)).toBe('app/api/intern/[...slug]/route');
  });

  it('summiert jede Datei einmal und ordnet sie ihrem obersten Ordner zu', () => {
    baueBeispiel();
    const ergebnis = vermesse(path.join(serverWurzel, 'app', 'api', 'intern', '[...slug]', 'route.js.nft.json'), wurzel);
    expect(ergebnis.dateien).toBe(3);
    expect(ergebnis.bytes).toBe(2148);
    expect(ergebnis.anteile[0]).toEqual({ ordner: 'public', bytes: 2048 });
  });

  it('markiert nur Routen über der Grenze', () => {
    const zeilen = [
      { route: 'gross', dateien: 1, bytes: 260 * 1024 * 1024, anteile: [] },
      { route: 'klein', dateien: 1, bytes: 5 * 1024 * 1024, anteile: [] },
    ];
    const text = tabelle(zeilen, GRENZE_MB);
    expect(text).toContain('gross  <== über der Grenze');
    expect(text).not.toContain('klein  <==');
  });

  it('schreibt Größen in deutscher Schreibweise', () => {
    expect(mb(1024 * 1024)).toBe('1,0');
    expect(mb(250 * 1024 * 1024)).toBe('250,0');
  });
});
