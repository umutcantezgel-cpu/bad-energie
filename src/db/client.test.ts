import { describe, expect, it } from 'vitest';
import { brauchtDatenOrdner } from './client';

/**
 * Der Elternordner darf nur für die festen lokalen Ablagen angelegt werden. Ein berechneter
 * Pfad an dieser Stelle würde beim Deployment das ganze Arbeitsverzeichnis in das
 * Function-Bundle ziehen; die Grenze liegt bei 250 MB entpackt.
 */
describe('brauchtDatenOrdner', () => {
  it('legt data für die lokalen Ablagen an', () => {
    expect(brauchtDatenOrdner('./data/pglite')).toBe(true);
    expect(brauchtDatenOrdner('data/pglite')).toBe(true);
    expect(brauchtDatenOrdner('./data/e2e')).toBe(true);
  });

  it('legt nichts an für den Speicherbetrieb und fremde Ziele', () => {
    expect(brauchtDatenOrdner('memory')).toBe(false);
    expect(brauchtDatenOrdner('/var/lib/pglite')).toBe(false);
    expect(brauchtDatenOrdner('./tmp/pglite')).toBe(false);
    expect(brauchtDatenOrdner('./data/unter/tiefer')).toBe(false);
    expect(brauchtDatenOrdner('./data/')).toBe(false);
    expect(brauchtDatenOrdner('./data/..')).toBe(false);
  });
});
