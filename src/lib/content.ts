import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkHtml from 'remark-html';
import { z } from 'zod';

// Replaces Astro's content collections (astro:content) with the same Zod
// schemas, read straight off disk. JSON collections carry an explicit `id`
// field alongside the data Astro's `file()` loader would have validated;
// speakers are Markdown files, one per file, id = filename without .md.

const contentDir = path.join(process.cwd(), 'src/content');

/** Filter chips on /speakers map onto these categories. */
export const speakerCategories = ['literature', 'cinema', 'music', 'history-ideas'] as const;
export const sessionFormats = [
  'conversation',
  'panel',
  'reading',
  'workshop',
  'performance',
  'screening',
  'walk',
  'ceremony',
] as const;

const speakerSchema = z.object({
  name: z.string(),
  name_ml: z.string().optional(),
  role: z.string(),
  /** File name inside kilf-assets/speakers/ */
  photo: z.string(),
  categories: z.array(z.enum(speakerCategories)).min(1),
  /** Lower numbers appear first. */
  order: z.number().default(100),
  /** Show on the home page preview (first 12 by order). */
  featured: z.boolean().default(true),
  /** "proposed" until participation is confirmed. */
  status: z.enum(['proposed', 'confirmed']).default('proposed'),
  /** One or two lines about the speaker, shown on the Speakers page only. */
  note: z.string().optional(),
});
export type SpeakerData = z.infer<typeof speakerSchema>;
export interface SpeakerEntry {
  id: string;
  data: SpeakerData;
  body: string;
}

let speakersCache: SpeakerEntry[] | null = null;

export function getSpeakers(): SpeakerEntry[] {
  if (speakersCache && process.env.NODE_ENV === 'production') return speakersCache;
  const dir = path.join(contentDir, 'speakers');
  speakersCache = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), 'utf8');
      const { data, content } = matter(raw);
      return { id: file.replace(/\.md$/, ''), data: speakerSchema.parse(data), body: content.trim() };
    });
  return speakersCache;
}

export function getSpeaker(id: string): SpeakerEntry | undefined {
  return getSpeakers().find((s) => s.id === id);
}

/** Renders a speaker's Markdown body to HTML, mirroring astro:content's render(). */
export async function renderMarkdown(body: string): Promise<string> {
  const result = await remark().use(remarkHtml).process(body);
  return result.toString();
}

function loadCollection<Schema extends z.ZodTypeAny>(file: string, schema: Schema) {
  const raw = JSON.parse(fs.readFileSync(path.join(contentDir, file), 'utf8')) as Array<
    { id: string } & Record<string, unknown>
  >;
  return raw.map(({ id, ...rest }) => ({ id, data: schema.parse(rest) as z.infer<Schema> }));
}

const faqSchema = z.object({
  question: z.string(),
  answer: z.string(),
  order: z.number(),
  group: z.enum(['festival', 'tickets', 'visiting', 'taking-part']).default('festival'),
});
export const getFaqs = () => loadCollection('faqs.json', faqSchema);

const passSchema = z.object({
  name: z.string(),
  audience: z.string(),
  description: z.string(),
  includes: z.array(z.string()),
  highlighted: z.boolean().default(false),
  order: z.number(),
  /** The organisers' price, e.g. "₹499". Never show invented prices. */
  price: z.string().optional(),
  /** What the price covers, e.g. "per person, all five days". */
  priceNote: z.string().optional(),
  /** Leave empty until ticketing opens: the card shows "Notify me" instead of "Buy". */
  buyUrl: z.string().optional(),
});
export const getPasses = () => loadCollection('passes.json', passSchema);

const strandSchema = z.object({
  name: z.string(),
  name_ml: z.string(),
  blurb: z.string(),
  blurb_ml: z.string(),
  icon: z.string(),
  order: z.number(),
});
export const getStrands = () => loadCollection('strands.json', strandSchema);

const sponsorSchema = z.object({
  name: z.string(),
  tier: z.enum(['title', 'presenting', 'associate', 'category', 'in-kind', 'media']),
  /** File name inside kilf-assets/logos/ */
  logo: z.string().optional(),
  url: z.url().optional(),
  order: z.number().default(100),
});
export const getSponsors = () => loadCollection('sponsors.json', sponsorSchema);

/**
 * Programme. Teasers are the fallback; once src/content/schedule.json has days
 * (days → sessions), the Programme page shows the day-by-day view instead.
 */
const teaserSchema = z.object({
  title: z.string(),
  line: z.string(),
  order: z.number(),
});
export const getTeasers = () => loadCollection('teasers.json', teaserSchema);

const sessionSchema = z.object({
  start: z.string(), // "18:30"
  end: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  venue: z.enum(['sngcc', '8point', 'ashramam']),
  strand: z.string().optional(), // strand id from strands.json, or "youth"
  format: z.enum(sessionFormats).optional(),
  speakers: z.array(z.string()).default([]), // speaker slugs
  /** Other participants, as text: invited guests or roles still to be announced. */
  guests: z.array(z.string()).default([]),
  language: z.enum(['Malayalam', 'English', 'Tamil', 'Bilingual']).optional(),
  /** A must-see: marked in the day's list. */
  highlight: z.boolean().default(false),
  /** An optional call to action, e.g. tickets for a separately ticketed event. */
  link: z.object({ href: z.string(), label: z.string() }).optional(),
});
const dayScheduleSchema = z.object({
  date: z.string(), // YYYY-MM-DD
  label: z.string(), // e.g. "Day 2"
  /** The day's title, e.g. "First light." */
  theme: z.string(),
  blurb: z.string(),
  /** Things that run all day, e.g. "Book fair · Ashramam Maidan · 10:00–21:00". */
  allDay: z.array(z.string()).default([]),
  sessions: z.array(sessionSchema),
});
export const getSchedule = () => loadCollection('schedule.json', dayScheduleSchema);
