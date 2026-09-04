CREATE TYPE "public"."anfrage_status" AS ENUM('eingang', 'geplant', 'blockiert', 'versendet', 'erinnert', 'antwort', 'termin', 'verworfen');--> statement-breakpoint
CREATE TYPE "public"."anhang_art" AS ENUM('foto', 'skizze', 'foto_annotiert', 'sprachnotiz', 'pdf', 'sonstiges');--> statement-breakpoint
CREATE TYPE "public"."dokument_art" AS ENUM('kostenschaetzung_html', 'kostenschaetzung_pdf', 'mail_html', 'mail_txt', 'erinnerung_html', 'erinnerung_txt', 'terminmail_html', 'terminmail_txt', 'annahmen_md', 'abschlussbericht_md', 'dossier_html');--> statement-breakpoint
CREATE TYPE "public"."dringlichkeit" AS ENUM('sofort', 'wochen_4', 'monate_3', 'unklar');--> statement-breakpoint
CREATE TYPE "public"."einheit" AS ENUM('pauschal', 'je_stueck', 'je_lfm', 'je_tank');--> statement-breakpoint
CREATE TYPE "public"."gewerk" AS ENUM('heizung', 'bad', 'wasser', 'waermepumpe', 'solar', 'pv', 'klima', 'lueftung', 'elektro');--> statement-breakpoint
CREATE TYPE "public"."job_ausloeser" AS ENUM('cron', 'manuell');--> statement-breakpoint
CREATE TYPE "public"."quelle" AS ENUM('web_bad', 'web_budget', 'web_heizung', 'web_wp', 'termin', 'rueckruf', 'intern', 'schnellerfassung', 'dispatch');--> statement-breakpoint
CREATE TYPE "public"."rolle" AS ENUM('chef', 'bauleiter', 'buero');--> statement-breakpoint
CREATE TYPE "public"."versand_art" AS ENUM('erstkontakt', 'erinnerung', 'terminmail', 'dossier', 'eingangsbestaetigung');--> statement-breakpoint
CREATE TYPE "public"."versand_status" AS ENUM('entwurf', 'freigegeben', 'versendet', 'fehlgeschlagen', 'storniert');--> statement-breakpoint
CREATE TYPE "public"."zeile_quelle" AS ENUM('vorlage', 'manuell');--> statement-breakpoint
CREATE TABLE "anfrage" (
	"id" text PRIMARY KEY NOT NULL,
	"ks_nummer" text NOT NULL,
	"jahr" integer NOT NULL,
	"laufnr" integer NOT NULL,
	"status" "anfrage_status" DEFAULT 'eingang' NOT NULL,
	"bemerkung" text DEFAULT '' NOT NULL,
	"quelle" "quelle" NOT NULL,
	"kunde_id" text NOT NULL,
	"objekt_adresse" text DEFAULT '' NOT NULL,
	"objekt_plz" text DEFAULT '' NOT NULL,
	"entfernung_km" integer,
	"dringlichkeit" "dringlichkeit" DEFAULT 'unklar' NOT NULL,
	"vorhaben_kurz" text DEFAULT '' NOT NULL,
	"gewerk_haupt" "gewerk",
	"persoenlicher_satz" text DEFAULT '' NOT NULL,
	"annahmen" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"vorbehalte" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"ausfuehrung_satz" text DEFAULT '' NOT NULL,
	"mail_betreff" text DEFAULT '' NOT NULL,
	"mail_preheader" text DEFAULT '' NOT NULL,
	"konfigurator_antworten" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"triage_vorschlag" text DEFAULT '' NOT NULL,
	"grund_verworfen" text,
	"etage" integer,
	"aufzug" boolean,
	"montagehindernisse" text DEFAULT '' NOT NULL,
	"leitungswege" text DEFAULT '' NOT NULL,
	"interne_notizen" text DEFAULT '' NOT NULL,
	"kalkulation" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"foerderung" jsonb,
	"summe_netto_von" integer,
	"summe_netto_bis" integer,
	"wohneinheiten" integer DEFAULT 1 NOT NULL,
	"bestaetigungs_token_hash" text,
	"token_gueltig_bis" timestamp with time zone,
	"token_eingeloest_am" timestamp with time zone,
	"bearbeiter_id" text,
	"versendet_am" timestamp with time zone,
	"wiedervorlage_am" timestamp with time zone,
	"erinnert_am" timestamp with time zone,
	"antwort_am" timestamp with time zone,
	"termin_am" timestamp with time zone,
	"verworfen_am" timestamp with time zone,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	"geaendert_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "anfrage_ks_nummer_unique" UNIQUE("ks_nummer")
);
--> statement-breakpoint
CREATE TABLE "anfrage_vorlage" (
	"anfrage_id" text NOT NULL,
	"vorlage_id" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "anfrage_vorlage_anfrage_id_vorlage_id_pk" PRIMARY KEY("anfrage_id","vorlage_id")
);
--> statement-breakpoint
CREATE TABLE "anfrage_zeile" (
	"id" text PRIMARY KEY NOT NULL,
	"anfrage_id" text NOT NULL,
	"position" integer NOT NULL,
	"titel" text NOT NULL,
	"gewerk" "gewerk" NOT NULL,
	"text" text DEFAULT '' NOT NULL,
	"menge" numeric(10, 2) DEFAULT '1' NOT NULL,
	"einheit" "einheit" DEFAULT 'pauschal' NOT NULL,
	"von" integer,
	"bis" integer,
	"matrix_nr" integer,
	"vorlage_zeile_id" text,
	"variante_matrix_nr" integer,
	"zuschlag" boolean DEFAULT false NOT NULL,
	"aktiv" boolean DEFAULT true NOT NULL,
	"quelle" "zeile_quelle" DEFAULT 'vorlage' NOT NULL,
	"notiz_intern" text DEFAULT '' NOT NULL,
	"intern" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "anhang" (
	"id" text PRIMARY KEY NOT NULL,
	"anfrage_id" text NOT NULL,
	"art" "anhang_art" NOT NULL,
	"dateiname" text DEFAULT '' NOT NULL,
	"mime" text NOT NULL,
	"groesse" integer DEFAULT 0 NOT NULL,
	"blob_pfad" text NOT NULL,
	"thumb_blob_pfad" text,
	"breite" integer,
	"hoehe" integer,
	"beschreibung" text DEFAULT '' NOT NULL,
	"intern" boolean DEFAULT true NOT NULL,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "benutzer" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"pin_hash" text NOT NULL,
	"rolle" "rolle" DEFAULT 'buero' NOT NULL,
	"funktion" text DEFAULT 'Bad & Energie GmbH' NOT NULL,
	"signatur_mail" text DEFAULT 'info@bad-energie.de' NOT NULL,
	"aktiv" boolean DEFAULT true NOT NULL,
	"fehlversuche" integer DEFAULT 0 NOT NULL,
	"gesperrt_bis" timestamp with time zone,
	"letzter_login_am" timestamp with time zone,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "benutzer_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "dokument" (
	"id" text PRIMARY KEY NOT NULL,
	"anfrage_id" text NOT NULL,
	"art" "dokument_art" NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"blob_pfad" text NOT NULL,
	"sha256" text NOT NULL,
	"groesse" integer DEFAULT 0 NOT NULL,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "einstellung" (
	"key" text PRIMARY KEY NOT NULL,
	"wert" jsonb NOT NULL,
	"geaendert_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ereignis" (
	"id" serial PRIMARY KEY NOT NULL,
	"anfrage_id" text,
	"typ" text NOT NULL,
	"benutzer_id" text,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "foerder_regel" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"grund" integer DEFAULT 30 NOT NULL,
	"effizienz" integer DEFAULT 5 NOT NULL,
	"klimageschwindigkeit" integer DEFAULT 20 NOT NULL,
	"einkommen" integer DEFAULT 30 NOT NULL,
	"einkommen_grenze" integer DEFAULT 40000 NOT NULL,
	"deckel" integer DEFAULT 70 NOT NULL,
	"kosten_we1" integer DEFAULT 30000 NOT NULL,
	"kosten_je_weitere" integer DEFAULT 15000 NOT NULL,
	"max_we" integer DEFAULT 6 NOT NULL,
	"standardsatz" integer,
	"eigenanteil_rundung" integer DEFAULT 1000 NOT NULL,
	"geaendert_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_lauf" (
	"id" serial PRIMARY KEY NOT NULL,
	"job" text NOT NULL,
	"slot" text NOT NULL,
	"ausgeloest_durch" "job_ausloeser" NOT NULL,
	"gestartet" timestamp with time zone DEFAULT now() NOT NULL,
	"beendet" timestamp with time zone,
	"verarbeitet" integer DEFAULT 0 NOT NULL,
	"blockiert" integer DEFAULT 0 NOT NULL,
	"fehler" text,
	"zusammenfassung" text
);
--> statement-breakpoint
CREATE TABLE "kunde" (
	"id" text PRIMARY KEY NOT NULL,
	"anrede" text DEFAULT '' NOT NULL,
	"vorname" text DEFAULT '' NOT NULL,
	"nachname" text NOT NULL,
	"email" text NOT NULL,
	"telefon" text DEFAULT '' NOT NULL,
	"strasse" text DEFAULT '' NOT NULL,
	"plz_ort" text DEFAULT '' NOT NULL,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loeschprotokoll" (
	"id" serial PRIMARY KEY NOT NULL,
	"ks_nummer" text NOT NULL,
	"geloescht_am" timestamp with time zone DEFAULT now() NOT NULL,
	"grund" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plz_radius" (
	"plz_praefix" text PRIMARY KEY NOT NULL,
	"ort" text NOT NULL,
	"entfernung_km" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limit" (
	"schluessel" text PRIMARY KEY NOT NULL,
	"fenster_beginn" timestamp with time zone NOT NULL,
	"zaehler" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "richtpreis" (
	"nr" integer PRIMARY KEY NOT NULL,
	"leistung" text NOT NULL,
	"von" integer,
	"bis" integer,
	"einheit" "einheit" DEFAULT 'pauschal' NOT NULL,
	"hinweis" text,
	"geaendert_am" timestamp with time zone DEFAULT now() NOT NULL,
	"geaendert_von" text
);
--> statement-breakpoint
CREATE TABLE "sitzung" (
	"id_hash" text PRIMARY KEY NOT NULL,
	"benutzer_id" text NOT NULL,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	"laeuft_ab_am" timestamp with time zone NOT NULL,
	"letzte_nutzung_am" timestamp with time zone DEFAULT now() NOT NULL,
	"widerrufen_am" timestamp with time zone,
	"ip_hash" text,
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "terminfenster" (
	"id" text PRIMARY KEY NOT NULL,
	"beginn" timestamp with time zone,
	"ende" timestamp with time zone,
	"beschriftung" text NOT NULL,
	"aktiv" boolean DEFAULT true NOT NULL,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "terminfenster_reservierung" (
	"terminfenster_id" text PRIMARY KEY NOT NULL,
	"anfrage_id" text NOT NULL,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "versandauftrag" (
	"id" text PRIMARY KEY NOT NULL,
	"anfrage_id" text NOT NULL,
	"art" "versand_art" NOT NULL,
	"status" "versand_status" DEFAULT 'entwurf' NOT NULL,
	"faellig_am" timestamp with time zone,
	"naechster_versuch_am" timestamp with time zone,
	"freigegeben_von" text,
	"freigegeben_am" timestamp with time zone,
	"versendet_am" timestamp with time zone,
	"zugestellt_am" timestamp with time zone,
	"empfaenger" text DEFAULT '' NOT NULL,
	"betreff" text DEFAULT '' NOT NULL,
	"message_id" text,
	"in_reply_to" text,
	"resend_id" text,
	"fehler" text,
	"versuch" integer DEFAULT 0 NOT NULL,
	"dokument_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vorbehalt" (
	"id" serial PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"gewerk" "gewerk",
	"position" integer DEFAULT 0 NOT NULL,
	"aktiv" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vorlage" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"vorhaben_kurz" text NOT NULL,
	"mail_betreff" text NOT NULL,
	"mail_preheader" text DEFAULT '' NOT NULL,
	"foerderung_standard" boolean DEFAULT false NOT NULL,
	"hinweis" text,
	"annahmen_standard" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"vorbehalt_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"gewerk_haupt" "gewerk" DEFAULT 'heizung' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"aktiv" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vorlage_zeile" (
	"id" text PRIMARY KEY NOT NULL,
	"vorlage_id" text NOT NULL,
	"position" integer NOT NULL,
	"titel" text NOT NULL,
	"gewerk" "gewerk" NOT NULL,
	"text" text DEFAULT '' NOT NULL,
	"matrix_nr" integer,
	"zuschlag" boolean DEFAULT false NOT NULL,
	"menge_default" numeric(10, 2) DEFAULT '1' NOT NULL,
	"einheit" "einheit" DEFAULT 'pauschal' NOT NULL,
	"groessen_varianten" jsonb,
	"matrix_hinweis" text
);
--> statement-breakpoint
ALTER TABLE "anfrage" ADD CONSTRAINT "anfrage_kunde_id_kunde_id_fk" FOREIGN KEY ("kunde_id") REFERENCES "public"."kunde"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anfrage" ADD CONSTRAINT "anfrage_bearbeiter_id_benutzer_id_fk" FOREIGN KEY ("bearbeiter_id") REFERENCES "public"."benutzer"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anfrage_vorlage" ADD CONSTRAINT "anfrage_vorlage_anfrage_id_anfrage_id_fk" FOREIGN KEY ("anfrage_id") REFERENCES "public"."anfrage"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anfrage_vorlage" ADD CONSTRAINT "anfrage_vorlage_vorlage_id_vorlage_id_fk" FOREIGN KEY ("vorlage_id") REFERENCES "public"."vorlage"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anfrage_zeile" ADD CONSTRAINT "anfrage_zeile_anfrage_id_anfrage_id_fk" FOREIGN KEY ("anfrage_id") REFERENCES "public"."anfrage"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anhang" ADD CONSTRAINT "anhang_anfrage_id_anfrage_id_fk" FOREIGN KEY ("anfrage_id") REFERENCES "public"."anfrage"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dokument" ADD CONSTRAINT "dokument_anfrage_id_anfrage_id_fk" FOREIGN KEY ("anfrage_id") REFERENCES "public"."anfrage"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ereignis" ADD CONSTRAINT "ereignis_anfrage_id_anfrage_id_fk" FOREIGN KEY ("anfrage_id") REFERENCES "public"."anfrage"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "richtpreis" ADD CONSTRAINT "richtpreis_geaendert_von_benutzer_id_fk" FOREIGN KEY ("geaendert_von") REFERENCES "public"."benutzer"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sitzung" ADD CONSTRAINT "sitzung_benutzer_id_benutzer_id_fk" FOREIGN KEY ("benutzer_id") REFERENCES "public"."benutzer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "terminfenster_reservierung" ADD CONSTRAINT "terminfenster_reservierung_terminfenster_id_terminfenster_id_fk" FOREIGN KEY ("terminfenster_id") REFERENCES "public"."terminfenster"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "terminfenster_reservierung" ADD CONSTRAINT "terminfenster_reservierung_anfrage_id_anfrage_id_fk" FOREIGN KEY ("anfrage_id") REFERENCES "public"."anfrage"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "versandauftrag" ADD CONSTRAINT "versandauftrag_anfrage_id_anfrage_id_fk" FOREIGN KEY ("anfrage_id") REFERENCES "public"."anfrage"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "versandauftrag" ADD CONSTRAINT "versandauftrag_freigegeben_von_benutzer_id_fk" FOREIGN KEY ("freigegeben_von") REFERENCES "public"."benutzer"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vorlage_zeile" ADD CONSTRAINT "vorlage_zeile_vorlage_id_vorlage_id_fk" FOREIGN KEY ("vorlage_id") REFERENCES "public"."vorlage"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vorlage_zeile" ADD CONSTRAINT "vorlage_zeile_matrix_nr_richtpreis_nr_fk" FOREIGN KEY ("matrix_nr") REFERENCES "public"."richtpreis"("nr") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "anfrage_jahr_laufnr_uq" ON "anfrage" USING btree ("jahr","laufnr");--> statement-breakpoint
CREATE INDEX "anfrage_status_idx" ON "anfrage" USING btree ("status");--> statement-breakpoint
CREATE INDEX "anfrage_kunde_idx" ON "anfrage" USING btree ("kunde_id");--> statement-breakpoint
CREATE INDEX "anfrage_token_idx" ON "anfrage" USING btree ("bestaetigungs_token_hash");--> statement-breakpoint
CREATE INDEX "anfrage_zeile_anfrage_idx" ON "anfrage_zeile" USING btree ("anfrage_id");--> statement-breakpoint
CREATE INDEX "anhang_anfrage_idx" ON "anhang" USING btree ("anfrage_id");--> statement-breakpoint
CREATE UNIQUE INDEX "dokument_version_uq" ON "dokument" USING btree ("anfrage_id","art","version");--> statement-breakpoint
CREATE INDEX "ereignis_anfrage_idx" ON "ereignis" USING btree ("anfrage_id","erstellt_am");--> statement-breakpoint
CREATE UNIQUE INDEX "job_lauf_slot_uq" ON "job_lauf" USING btree ("job","slot");--> statement-breakpoint
CREATE INDEX "kunde_email_idx" ON "kunde" USING btree ("email");--> statement-breakpoint
CREATE INDEX "sitzung_benutzer_idx" ON "sitzung" USING btree ("benutzer_id");--> statement-breakpoint
CREATE INDEX "reservierung_anfrage_idx" ON "terminfenster_reservierung" USING btree ("anfrage_id");--> statement-breakpoint
CREATE UNIQUE INDEX "versandauftrag_aktiv_uq" ON "versandauftrag" USING btree ("anfrage_id","art") WHERE "versandauftrag"."status" <> 'storniert';--> statement-breakpoint
CREATE INDEX "versandauftrag_faellig_idx" ON "versandauftrag" USING btree ("status","faellig_am");--> statement-breakpoint
CREATE INDEX "vorlage_zeile_vorlage_idx" ON "vorlage_zeile" USING btree ("vorlage_id");