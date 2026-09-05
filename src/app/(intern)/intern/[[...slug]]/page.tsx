import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { asc, desc, eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import {
  anfrage as anfrageTabelle,
  anfrageZeile,
  benutzer,
  kunde as kundeTabelle,
  terminfenster,
  terminfensterReservierung,
} from '@/db/schema';
import { verifySession } from '@/lib/services/auth';
import {
  ladeEinstellungen,
  ladeFoerderRegeln,
  ladeMatrix,
  ladeVorbehalte,
  ladeVorlagen,
} from '@/lib/services/kalkulationsdaten';
import { ladeInternAnfrage, ladeEntwuerfe as ladeEntwuerfeService } from '@/lib/services/estimates';
import type { BoardKarte } from '../board/page-types';
import type { BenutzerEintrag } from '../benutzer/page-types';
import type { TerminfensterEintrag } from '../termine/page-types';
import BoardClient from '../board/BoardClient';
import EntwuerfeClient from '../entwuerfe/EntwuerfeClient';
import DispatchClient from '../dispatch/DispatchClient';
import MatrixClient from '../matrix/MatrixClient';
import TermineClient from '../termine/TermineClient';
import EinstellungenClient from '../einstellungen/EinstellungenClient';
import BenutzerClient from '../benutzer/BenutzerClient';
import MeisterModus from '@/components/calculator/MeisterModus';
import AnfrageDetailClient from '../anfragen/[id]/AnfrageDetailClient';
import InternAnmeldungClient from '../InternAnmeldungClient';
import { aktuelleSession } from '@/lib/services/auth';
import type { Rolle } from '@/lib/types';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!slug || slug.length === 0) {
    return { title: 'Anmeldung | Intern' };
  }
  const bereich = slug[0];
  const titel: Record<string, string> = {
    board: 'Vorgangs-Board',
    entwuerfe: 'Entwuerfe',
    dispatch: 'Mobile Dispatch',
    matrix: 'Richtpreis-Matrix & Regeln',
    termine: 'Terminfenster',
    einstellungen: 'Betriebseinstellungen',
    benutzer: 'Benutzerverwaltung',
    konfigurator: 'Konfigurator',
    anfragen: 'Vorgangsdetails',
  };
  return { title: titel[bereich] || 'Intern' };
}

export default async function InternCatchAllPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;

  if (!slug || slug.length === 0) {
    const session = await aktuelleSession();
    if (session) {
      redirect('/intern/board');
    }
    return <InternAnmeldungClient />;
  }

  const session = await verifySession();
  const bereich = slug[0];
  const db = await getDb();

  if (bereich === 'board') {
    const anfragen = await db
      .select({
        id: anfrageTabelle.id,
        ksNummer: anfrageTabelle.ksNummer,
        nachname: kundeTabelle.nachname,
        vorhabenKurz: anfrageTabelle.vorhabenKurz,
        status: anfrageTabelle.status,
        dringlichkeit: anfrageTabelle.dringlichkeit,
        gewerkHaupt: anfrageTabelle.gewerkHaupt,
        summeNettoVon: anfrageTabelle.summeNettoVon,
        summeNettoBis: anfrageTabelle.summeNettoBis,
        erstelltAm: anfrageTabelle.erstelltAm,
      })
      .from(anfrageTabelle)
      .innerJoin(kundeTabelle, eq(anfrageTabelle.kundeId, kundeTabelle.id))
      .orderBy(desc(anfrageTabelle.erstelltAm));

    const karten: BoardKarte[] = anfragen.map((a) => ({
      ...a,
      erstelltAm: a.erstelltAm ? a.erstelltAm.toISOString() : '',
    })) as BoardKarte[];

    return <BoardClient karten={karten} />;
  }

  if (bereich === 'entwuerfe') {
    const karten = await ladeEntwuerfeService(session);
    return (
      <>
        <h1 className="text-2xl font-semibold text-slate-900">Entwuerfe und Freigaben</h1>
        <p className="mt-1 text-base text-slate-600">
          Freigegebene Kostenschaetzungen gehen um 18:00 raus, sofern nicht sofort gesendet wird.
        </p>
        <div className="mt-6">
          <EntwuerfeClient karten={karten} />
        </div>
      </>
    );
  }

  if (bereich === 'dispatch') {
    return <DispatchClient />;
  }

  if (bereich === 'matrix') {
    const [matrix, foerderRegeln, vorbehalte, einstellungen] = await Promise.all([
      ladeMatrix(),
      ladeFoerderRegeln(),
      ladeVorbehalte(),
      ladeEinstellungen(),
    ]);

    const vorlagen = await ladeVorlagen(matrix);

    const blockierteZeilen = await db
      .select({ matrixNr: anfrageZeile.matrixNr })
      .from(anfrageZeile)
      .innerJoin(anfrageTabelle, eq(anfrageZeile.anfrageId, anfrageTabelle.id))
      .where(eq(anfrageTabelle.status, 'blockiert'));

    const blockiertZaehler: Record<number, number> = {};
    for (const b of blockierteZeilen) {
      if (b.matrixNr !== null) {
        blockiertZaehler[b.matrixNr] = (blockiertZaehler[b.matrixNr] || 0) + 1;
      }
    }

    return (
      <MatrixClient
        initialMatrix={matrix}
        initialFoerderRegeln={foerderRegeln}
        initialVorbehalte={vorbehalte}
        vorlagen={vorlagen}
        blockiertZaehler={blockiertZaehler}
        istChef={session.rolle === 'chef'}
        demoPreise={einstellungen.demoPreise}
      />
    );
  }

  if (bereich === 'termine') {
    const fenster = await db
      .select({
        id: terminfenster.id,
        beschriftung: terminfenster.beschriftung,
        beginn: terminfenster.beginn,
        ende: terminfenster.ende,
        ksNummer: anfrageTabelle.ksNummer,
        anfrageId: anfrageTabelle.id,
      })
      .from(terminfenster)
      .leftJoin(
        terminfensterReservierung,
        eq(terminfenster.id, terminfensterReservierung.terminfensterId),
      )
      .leftJoin(
        anfrageTabelle,
        eq(terminfensterReservierung.anfrageId, anfrageTabelle.id),
      )
      .orderBy(asc(terminfenster.beginn));

    const initialEintraege: TerminfensterEintrag[] = fenster.map((f) => ({
      id: f.id,
      beschriftung: f.beschriftung,
      beginn: f.beginn ? f.beginn.toISOString() : '',
      ende: f.ende ? f.ende.toISOString() : '',
      reserviertFuerKsNummer: f.ksNummer,
      reserviertFuerAnfrageId: f.anfrageId,
    }));

    return (
      <TermineClient
        initialEintraege={initialEintraege}
      />
    );
  }

  if (bereich === 'einstellungen') {
    const einstellungen = await ladeEinstellungen();
    return (
      <EinstellungenClient
        initialEinstellungen={einstellungen}
        istChef={session.rolle === 'chef'}
      />
    );
  }

  if (bereich === 'benutzer') {
    if (session.rolle !== 'chef') {
      redirect('/intern/board');
    }

    const liste = await db.select().from(benutzer).orderBy(desc(benutzer.erstelltAm));

    const eintraege: BenutzerEintrag[] = liste.map((b) => ({
      id: b.id,
      name: b.name,
      email: b.email,
      rolle: b.rolle as Rolle,
      funktion: b.funktion,
      aktiv: b.aktiv,
      fehlversuche: b.fehlversuche,
      gesperrtBis: b.gesperrtBis?.toISOString() || null,
      letzterLoginAm: b.letzterLoginAm?.toISOString() || null,
      erstelltAm: b.erstelltAm.toISOString(),
    }));

    return <BenutzerClient initialBenutzer={eintraege} />;
  }

  if (bereich === 'konfigurator') {
    if (slug.length === 1) {
      return <MeisterModus />;
    }
    const anfrageId = slug[1];
    const initial = await ladeInternAnfrage(anfrageId);
    if (!initial) notFound();
    return <MeisterModus anfrageId={anfrageId} initial={initial} />;
  }

  if (bereich === 'anfragen' && slug.length >= 2) {
    const id = slug[1];
    const dto = await ladeInternAnfrage(id);

    if (!dto) {
      notFound();
    }

    if (session.rolle === 'bauleiter' && dto.bearbeiter && dto.bearbeiter !== session.name) {
      notFound();
    }

    return <AnfrageDetailClient dto={dto} rolle={session.rolle} />;
  }

  notFound();
}
