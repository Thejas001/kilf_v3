# KILF 2027 website

Official website for the **Kollam International Literature Festival (KILF) 2027**: 31 December 2026 – 4 January 2027, Kollam, Kerala.

Built with [Next.js](https://nextjs.org) (App Router) and Tailwind CSS. It builds to fully static pages: fast, SEO-friendly and hostable anywhere. The calm lake animations run on [Motion](https://motion.dev) (formerly Framer Motion) inside small React client components; everything else is server-rendered HTML with a few tiny client-side scripts (menu, speaker filters, map loader, forms).

- **English** at `/` (default), **Malayalam** at `/ml/`. Home and About are translated; other `/ml/` pages show the English content with a notice.
- Content (speakers, FAQs, passes, strands, programme, sponsors) lives in `src/content/` and can be edited without touching code.

---

## 1. Run it locally

Requires **Node 22.12+**.

```bash
npm install
cp .env.example .env.local   # optional: fill in the form endpoint etc.
npm run dev                 # http://localhost:3000
```

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server with hot reload. `[PLACEHOLDERS]` are highlighted in yellow. |
| `npm run build` | Production build into `.next/` (statically generated where possible). |
| `npm run start` | Serve the production build locally. |
| `npm run lint` | Lint content and components. |
| `npm run assets` | Regenerate stand-in images and the share image (also runs before `dev`/`build`). |
| `npm run screenshots` | After a build: screenshots of key pages at mobile + desktop into `screenshots/`. |

## 2. Artwork and photos: `kilf-assets/`

Put the brochure artwork here, using these names:

```
kilf-assets/
  logos/kilf-logo.svg            # main logo (cobalt), used in the header
  logos/kilf-logo-white.svg      # logo for dark backgrounds (footer)
  illustrations/p4_stage.jpg     # Khasakkinte Ithihasam stage (home band, /khasak)
  illustrations/cover.jpg        # optional: replaces the art in the social share image
  speakers/<file>.jpg            # duotone speaker photos, e.g. m-mukundan.jpg
  reference-brochure.pdf         # design reference (not published)
```

Until a file is present, the site uses an on-brand **stand-in**: flat SVG illustrations in `src/placeholders/`, and initials for speakers. A real file with the same name (any of `.jpg .png .webp .avif`) replaces its stand-in automatically on the next build. Images are resized and served as AVIF/WebP with `<picture>`.

The lake illustrations (`src/assets/art/lake-hero.jpg`, the open book on the jetty, and `lake-jetty.jpg`, the wide jetty scene) are part of the design: the home hero and the About, Visit and Partners pages draw them with live water (see Motion below). Both were upscaled 4× from 1241 px originals with Real-ESRGAN; higher-resolution originals of the same scenes can replace them. If you change their composition, update the water outlines (`mask`) in `src/components/LakeArt.tsx`.

The home hero is full-bleed on desktop (the illustration covers the whole section, with a soft "mist" behind the words) and stacked on phones and tablets (words on the cream sky, the lake below). Its crop at each screen size is set with `object-[…]` classes on the hero's `LakeArt` in `src/views/Home.tsx`; the live water follows the same crop automatically.

The 1200×630 social share image (`public/og-image.jpg`) is built on every build from the lake-and-book art (or `kilf-assets/illustrations/cover.jpg`, if present).

## 3. Editing content

All content is validated at build time, so a typo in a field name fails the build with a clear message.

| What | Where |
|---|---|
| Festival facts (dates, venues, email, social handle, organiser) | `src/lib/site.ts` |
| Speakers | `src/content/speakers/*.md` |
| FAQs | `src/content/faqs.json` |
| Passes | `src/content/passes.json` |
| The nine strands (EN + ML) | `src/content/strands.json` |
| Programme teasers | `src/content/teasers.json` |
| Programme, day by day (proposed) | `src/content/schedule.json` |
| Sponsors / partner logos | `src/content/sponsors.json` |
| Partnership page (why, audience, tiers, benefits) | `src/data/partnership.json` |
| UI text + Malayalam translations | `src/i18n/ui.ts`, `src/i18n/about-qa.ts` |

### Add a speaker

1. Put the duotone photo in `kilf-assets/speakers/`, e.g. `kilf-assets/speakers/k-r-meera.jpg`.
2. Create `src/content/speakers/k-r-meera.md`:

   ```md
   ---
   name: "K. R. Meera"
   role: "Novelist · Malayalam literature"
   photo: k-r-meera.jpg
   categories: [literature]          # any of: literature, cinema, music, history-ideas
   order: 175                        # lower = earlier in the grid
   featured: false                   # true = eligible for the 12 on the home page
   status: proposed                  # change to "confirmed" once confirmed
   ---

   Optional bio in Markdown. If you write one, the speaker gets a page at /speakers/k-r-meera.
   ```

3. Commit. The speakers page, filters and home preview update automatically.

To remove a speaker, delete their `.md` file.

### The programme

`src/content/schedule.json` holds the day-by-day programme (a proposed one for now: 31 December to 4 January, 45 sessions). The Programme page shows it as tabs, one per day, with a strand filter; with `[]` it falls back to the six teasers and a "Notify me" banner.

Each day has a `theme` ("First light."), a `blurb` and `allDay` lines (book fair, food festival, exhibition). Each session has `start`/`end`, `title`, `description`, `venue` (`sngcc`, `8point` or `ashramam`), `strand` (an id from `strands.json`, or `youth`), `format` (conversation, panel, reading, workshop, performance, screening, walk or ceremony), `speakers` (speaker file names), `guests` (other participants as text, e.g. "Malayalam poets (invited)"), `language`, `highlight` (a ★ must-see) and an optional `link` (e.g. theatre tickets). Speaker chips link to the speaker's note on `/speakers`.

```json
[
  {
    "id": "2027-01-01",
    "date": "2027-01-01",
    "label": "Day 2",
    "theme": "First light.",
    "blurb": "One or two sentences about the day.",
    "allDay": ["Book fair · Ashramam Maidan · 10:00–21:00"],
    "sessions": [
      {
        "start": "10:00",
        "end": "11:00",
        "title": "The Malayali in the mirror",
        "description": "Optional one-liner.",
        "venue": "sngcc",
        "strand": "literature",
        "format": "conversation",
        "speakers": ["subhash-chandran"],
        "guests": ["A moderator (to be announced)"],
        "language": "Malayalam",
        "highlight": true
      }
    ]
  }
]
```

- `venue` is one of `sngcc` (Sreenarayana Guru Cultural Centre), `8point` (8 Point Art Cafe) or `ashramam` (Ashramam Maidan). Venues are defined in `src/lib/site.ts`.
- `speakers` are speaker file names without `.md`.
- `language` (optional) is one of `Malayalam`, `English`, `Tamil` or `Bilingual`.

(The build prints a harmless "No items found" warning while `sponsors.json` is empty.)

### Open ticketing

Prices are already in `src/content/passes.json` (`"price"`, with `"priceNote"` saying what it covers). When sales open, add `"buyUrl"` to each pass and the "Notify me" button becomes a "Buy" button. Theatre ticket prices and dates for Khasakkinte Ithihasam are in `src/components/motion/TicketCard.tsx` and `src/views/Khasak.tsx`.

### Translate another page into Malayalam

1. Move the page's English strings into `src/i18n/ui.ts` (the `en` block) and add the Malayalam strings to the `ml` block, as Home and About do. Use `t('key')` in the view in `src/views/`.
2. Add the path (e.g. `'/programme'`) to `translatedPaths` in `src/i18n/ui.ts`.
3. Add the path to the Malayalam list in `src/app/sitemap.ts`.

Untranslated `/ml/` pages show a notice, are `noindex`, and point their canonical URL at the English page.

## 4. Forms

Every form (Register, Volunteer, Exhibit, College, Partner enquiry, Contact, newsletter and the "Notify me" banners) sends a JSON POST to **`NEXT_PUBLIC_FORM_ENDPOINT`**. Each submission carries a `form` field naming the form (`register`, `volunteer`, `exhibit`, `partner`, `contact`, `newsletter`, `programme-notify`, `passes-notify`, `khasak-seats`, `college`) and the `page` it came from.

- **Formspree** (simplest): create a form, then set `NEXT_PUBLIC_FORM_ENDPOINT=https://formspree.io/f/xxxxxxx`.
- **Google Sheets**: deploy an Apps Script web app whose `doPost(e)` appends `JSON.parse(e.postData.contents)` to a sheet, then set the endpoint to its `https://script.google.com/macros/s/…/exec` URL. The site sends a CORS-safe request for Apps Script automatically.
- Optional overrides: `NEXT_PUBLIC_FORM_ENDPOINT_PARTNER` and `NEXT_PUBLIC_FORM_ENDPOINT_NEWSLETTER`.

Spam protection: a hidden honeypot field (`_gotcha`) and a minimum fill time. Bots see a fake success and nothing is sent. In `npm run dev` with no endpoint set, forms simulate success. In production with no endpoint, forms show an error with the festival email.

## 5. Environment variables

See `.env.example`. Set them in Vercel/Netlify under *Settings → Environment variables*.

| Variable | Purpose |
|---|---|
| `SITE_URL` | Public URL, used for canonical links, sitemap, Open Graph and the footer QR code. **Set this once the domain is known.** |
| `NEXT_PUBLIC_FORM_ENDPOINT` | Form backend (see above). |
| `NEXT_PUBLIC_GA4_ID` *or* `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Analytics. Nothing loads if both are empty. The privacy page adapts automatically. |
| `NEXT_PUBLIC_PARTNER_CALL_URL` | Link for "Book a partnership call" (Calendly, Cal.com…). Falls back to an email link. |
| `NEXT_PUBLIC_WHATSAPP_URL` | WhatsApp channel/community link; shows a "Join on WhatsApp" button in the signup block. |

## 6. Deploy

**Vercel**: import the repo. `vercel.json` sets the framework to Next.js. Add the env variables and deploy.

**Netlify**: import the repo. `netlify.toml` uses `@netlify/plugin-nextjs`.

**Node host**: run `npm run build` then `npm run start`.

The partnership proposal PDF: put it at `public/downloads/kilf-2027-partnership-proposal.pdf` and the Partners page shows a download link.

## 7. What's where

```
src/
  components/     Header, Footer, ChapterLabel, Headline, LimeButton, TextLink,
                  SpeakerCard, LakeArt, Section, Form/Field, MotionToggle, Icon …
  components/motion/  Animated React islands: TicketCard, RippleField, Marquee,
                  Countdown (Motion), and water.ts, the lake's wave engine
  components/blocks/  Larger reusable sections (ways in, strands grid, notify banner,
                  schedule…)
  assets/art/     The lake illustrations used across the site
  views/          Page bodies, shared by the English and /ml/ routes
  pages/          Routes (thin wrappers around views) + robots.txt
  layouts/        BaseLayout: SEO, Open Graph, JSON-LD, fonts, analytics
  content/        Editable content collections
  i18n/           Translations
  lib/            Site facts, image lookup
  scripts/        Scroll reveals and count-ups (Motion's vanilla API), and
                  lake-water.ts, the live water on the lake illustrations
  styles/         Brand tokens (colours, type) in global.css
  placeholders/   Stand-in SVG illustrations
scripts/          Asset preparation and screenshots
kilf-assets/      Real artwork (see section 2)
```

### Motion

All animation is calm and water-like, and all of it can be stopped:

| Where | What moves | Component |
|---|---|---|
| Home hero; About, Visit and Partners illustrations | The drawn lake comes alive: a small wave simulation bends the illustration's water through WebGL. Drops fall now and then, the cursor leaves a gentle wake, a tap sends out a ring; the jetty, the book and the shore stay still | `src/components/LakeArt.tsx`, `src/scripts/lake-water.ts` (plain script, no framework: it is on the first screen), `motion/water.ts` |
| Page heroes, statement band, New Year's Eve, theatre and notify bands, footer | Rings widening slowly across still water; a faint ripple trails the mouse | `motion/RippleField.tsx` (Motion) |
| Home "ways in" blocks | A ring spreads across the block on hover; the music waveform breathes | `blocks/WaysIn.tsx` |
| Khasakkinte Ithihasam tickets | Ticket type and preview transitions | `motion/TicketCard.tsx` (Motion) |
| Khasakkinte Ithihasam (home) | A book opens as you scroll: the cover swings open, pages turn, and the spread shows the title page and the stage, lit by a spotlight. On wide screens the section holds still while it opens; with reduced motion it is shown open | `src/components/art/KhasakBook.tsx`, script in `src/views/Home.tsx` |
| New Year's Eve (home) | A night graphic: the horizon is a live sound equaliser with palms, the moon a turning record, sound spreads over the water and notes drift up | `src/components/art/NyeMusic.tsx` |
| Home "The festival" and "Youth" | Five paper boats (one per day) bob on the lake; a microphone sends out rings of sound among speech bubbles | `src/components/art/PaperBoats.tsx`, `src/components/art/YouthStage.tsx` |
| Strand ribbon (home) | The nine strands drift across the full width; scrolling the page pushes them left (down) or right (up); they ease to a stop on hover | `motion/Marquee.tsx` (Motion) |
| New Year's Eve | Countdown digits roll as they change | `motion/Countdown.tsx` (Motion) |
| Everywhere | Sections rise into place as you scroll, numbers count up, buttons send out a ring on hover | `src/scripts/reveal.ts` (Motion), `global.css` |

- **Pause motion** buttons (hero and footer) stop every loop and remember the choice (WCAG 2.2.2). The operating system's *reduce motion* setting shows still water instead.
- Animations stop automatically when they scroll off screen.
- Without WebGL, with reduced motion, or before the script loads, the illustrations are shown as ordinary still images. The live water also steps aside on computers that draw WebGL without a graphics chip (virtual machines, some test tools) and on devices that can't keep it smooth; add `?water` to the address to preview it there anyway.

### Layout and colour

- Clean and square: cream pages, full-width colour bands (bright blue hero, coral, blue, lime, navy footer), square boxes that share 1 px hairlines, and generous white space.
- Section labels read "01 / THE FESTIVAL" (`ChapterLabel`); headlines are two lines, the second in bright blue (`Headline`).
- **Gradient text** marks the key words: page-hero accents and a few headlines (`accentStyle="gradient"` on `Headline`, or the `text-grad`, `text-grad-warm` and `text-grad-ink` classes). Each class is tuned for the surface it sits on.
- Buttons are square. Primary buttons are blue on light surfaces and turn lime on blue or navy bands automatically (`LimeButton` with the default `primary` variant). Secondary actions are underlined text links with a ↗ (`TextLink`).
- Speaker portraits are 4:5 rounded rectangles (`Portrait.tsx`); until a photo arrives, a quiet blue tint with the speaker's initials stands in.

### Brand notes

- **Type:** Plus Jakarta Sans (headlines and numbers), Manrope (text, labels and buttons), Anek Malayalam for Malayalam. All self-hosted.
- Colours are Tailwind tokens (`bg-navy`, `text-coral`, `bg-lime`, …) defined in `src/styles/global.css`.
- For WCAG AA: text on coral and lime is navy or ink; small coral text on light surfaces uses `coral-deep`; the warm gradient (coral to lime) is only used for large text on blue.
