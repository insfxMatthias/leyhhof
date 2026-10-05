import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const bild = (image: () => z.ZodTypeAny) =>
  z.object({
    src: image(),
    alt: z.string().min(1),
  });

const button = z.object({
  label: z.string(),
  href: z.string(),
  stil: z.enum(['wiese', 'mohn', 'sonne', 'rahmen']).default('wiese'),
});

/** Inhaltsseiten: ein Markdown-File pro Seite. */
const seiten = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/seiten' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      h1: z.string(),
      hero: z
        .object({
          bild: bild(image),
          unterzeile: z.string().optional(),
          buttons: z.array(button).default([]),
        })
        .optional(),
      // Nur Home:
      zahlen: z
        .array(z.object({ zahl: z.string(), label: z.string() }))
        .optional(),
      karten: z
        .object({
          ueberschrift: z.string(),
          eintraege: z.array(
            z.object({
              titel: z.string(),
              text: z.string(),
              bild: bild(image),
              button: button,
            }),
          ),
        })
        .optional(),
      // Nur Landwirtschaft: weiteres Bild im Text
      bild: bild(image).optional(),
      // Nur Buch: Cover
      cover: bild(image).optional(),
    }),
});

/** Angebotsseiten: ein JSON-File pro Bereich, gleiches Template. */
const angebote = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/angebote' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      reihenfolge: z.number(),
      farbe: z.enum(['wiese', 'sonne', 'himmel']),
      icon: z.string(),
      title: z.string(),
      description: z.string(),
      bild: bild(image),
      /** Optionales Kopfbild der Seite; ohne Angabe wird `bild` (die Kachel) verwendet. */
      heroBild: bild(image).optional(),
      teaser: z.string(),
      h1: z.string(),
      untertitel: z.string().optional(),
      einleitung: z.string(),
      angebote: z
        .array(
          z.object({
            icon: z.string(),
            titel: z.string(),
            text: z.string(),
            bild: bild(image).optional(),
          }),
        )
        .default([]),
      beachten: z.boolean().default(false),
      abschnitte: z
        .object({
          ueberschrift: z.string().optional(),
          eintraege: z.array(
            z.object({
              titel: z.string(),
              text: z.string(),
              preis: z.string().optional(),
              preisLabel: z.string().optional(),
              stil: z.enum(['karte', 'himmel']).default('karte'),
              badge: z.string().optional(),
            }),
          ),
        })
        .optional(),
      elternKindGruppeStatus: z.string().optional(),
      anmeldung: z.object({
        ueberschrift: z.string().default('Anmeldung bitte bei:'),
        name: z.string(),
        telefon: z.string(),
        telefonLink: z.string(),
        email: z.string().optional(),
        hinweis: z.string().optional(),
      }),
    }),
});

export const collections = { seiten, angebote };
