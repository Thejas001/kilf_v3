# TODO before launch

## 1. Placeholders

`[PLACEHOLDERS]` are highlighted in yellow in `npm run dev`.

| Placeholder | Where it shows | Where to fix |
|---|---|---|
| `[@HANDLE]` social handle | Footer, Contact page | `src/lib/site.ts` → `socialHandle` **and** `socialUrl` (the link appears once both are set) |
| `[LAT]`, `[LNG]` for Sreenarayana Guru Cultural Centre | Plan your visit | `src/lib/site.ts` → `venues[0]` |
| `[LAT]`, `[LNG]` for 8 Point Art Cafe | Plan your visit | `src/lib/site.ts` → `venues[1]` |
| `[LAT]`, `[LNG]` for Ashramam Maidan | Plan your visit | `src/lib/site.ts` → `venues[2]` |
| `[PROPOSAL PDF]` partnership proposal | Partners page | Add `public/downloads/kilf-2027-partnership-proposal.pdf` |

The maps and "Get directions" links already work from the venue names. Coordinates just make them exact.

### Configuration (environment variables, see README §5)

- [ ] `SITE_URL`: the real domain. Canonical URLs, sitemap, Open Graph and the footer QR code use it. It currently defaults to `https://kilf.vercel.app`.
- [ ] `PUBLIC_FORM_ENDPOINT`: **required**, otherwise forms show an error in production.
- [ ] `PUBLIC_GA4_ID` or `PUBLIC_PLAUSIBLE_DOMAIN`: optional analytics.
- [ ] `PUBLIC_PARTNER_CALL_URL`: optional booking link for "Book a partnership call" (it falls back to email).
- [ ] `PUBLIC_WHATSAPP_URL`: optional WhatsApp channel/community link.

## 2. Assets to drop into `kilf-assets/`

The site currently shows on-brand **stand-ins** because the assets were not in the repository.

- [ ] `logos/kilf-logo.svg` and `logos/kilf-logo-white.svg`
- [ ] `illustrations/p4_stage.jpg` for Khasakkinte Ithihasam (an abstract stage stands in until then).
- [ ] Higher-resolution originals of the two lake illustrations in `src/assets/art/` (the current files were AI-upscaled 4× from 1241 px). Keep the same composition, or update the water outlines in `src/components/LakeArt.tsx`.
- [ ] `speakers/*.jpg`: all 17 duotone photos (file names are listed in the README and in each speaker's `.md` file)
- [ ] Compare the built site side by side with `reference-brochure.pdf` and adjust spacing and type sizes.

## 3. Copy to check against the brochure or proposal

This copy was written to fit the brief, but the source documents were not available. Replace it or confirm it.

- [ ] **About** paragraph ("About KILF."): brief says "from the brochure's page 2". See `about.p1` and `about.p2` in `src/i18n/ui.ts`.
- [ ] **Malayalam Q&A** block (KILF എന്താണ്? …): copy from brochure page 2 into `src/i18n/about-qa.ts`.
- [ ] **FAQ answers**: brief says "copy from the brochure". See `src/content/faqs.json`. The session-language answer in particular needs confirming.
- [ ] **Partners page**: "why partner" wording, the six audience groups, tier descriptions and the whole **benefits matrix** (`src/data/partnership.json`) are drafts to check against the sponsorship proposal. No prices are shown.
- [ ] **Pass descriptions and inclusions** (`src/content/passes.json`) are indicative. Confirm them before ticketing.
- [ ] Strand one-liners (`src/content/strands.json`), youth activity one-liners (`src/views/Youth.tsx`) and the Khasak description (`src/views/Khasak.tsx`).
- [ ] "Getting here", "While you’re here", "Around Kollam" and "Good to know" on Plan your visit (`src/views/Visit.tsx`).
- [ ] New sections written for this version, to confirm with the organisers: About ("Why KILF", "What to expect", "What we believe", `about.vision.*`, `about.e*`, `about.v*` in `src/i18n/ui.ts`); the home "A day at KILF" (`home.day.*`); Programme ("A day at the festival", "Formats"); Speakers ("The line-up", "Suggest a voice"); Khasak ("The novel", "The director", "Good to know"); Passes ("Which pass is for me?", "Ticketing, answered"); Get involved (volunteer roles, "What happens next"); Youth ("Campus ambassadors", "How to take part"); Partners ("How it works"); Contact ("Write to us about"); and the eight new FAQ answers in `src/content/faqs.json`.
- [ ] **The proposed programme** (`src/content/schedule.json`): 45 sessions over five days, written to be viable with the proposed line-up. Every speaker appears once to three times with no clashes; other participants are described by role and marked "(invited)" or "(to be announced)" rather than named. Confirm titles, times, venues and pairings, and replace the invited roles with names as people confirm. Times for the three Khasakkinte Ithihasam evenings are placeholders (19:00, "to be confirmed").
- [ ] **Speaker notes** (the `note` line in each `src/content/speakers/*.md`, shown on `/speakers` only): short factual notes on each speaker's best-known work and awards. Check them, and ask each speaker's team to approve their line.
- [ ] **New Year's Eve running order** on the home page (`home.nye.*`: Shanka Tribe at 20:30, countdown at 23:45) matches 31 December in the programme; confirm both together.
- [ ] Privacy page (`src/views/Privacy.tsx`): have the organisers review it.

## 4. Malayalam

- [ ] Native-speaker review of all Malayalam strings in `src/i18n/ui.ts`, `src/i18n/about-qa.ts` and `src/content/strands.json` (including the new lines: `home.title`, `home.titleAccent`, `home.khasak.*`, `home.involved.attend.d`, `home.hero.*`, `home.live.*`, `home.ways.*`, `home.day.*`, `home.nye.*`, `home.dates.*`, `home.statement.*`, `about.vision.*`, `about.expect.*`, `about.e*`, `about.values.*`, `about.v*`, `footer.closing.*`, `nav.theatre` and `cta.volunteer`).
- [ ] Translate the remaining pages: Speakers, Programme, Khasak, Youth, Get involved, Passes, Visit, Partners, FAQ, Contact, Privacy and the 404 page. See README "Translate another page into Malayalam". Until then these `/ml/` pages show English with a notice (`TODO(i18n)` comments in the Malayalam page files under `src/app/ml/`).
- [ ] Optional: Malayalam speaker names (`name_ml` field in the speaker files).

## 5. Keep these "Proposed" / "subject to confirmation" labels until confirmed

| Item | Label | Where |
|---|---|---|
| Speaker line-up (all 17) | "Proposed line-up · participation subject to confirmation"; `status: proposed` | Home, `/speakers`, speaker files |
| Khasakkinte Ithihasam (O. V. Vijayan / Deepan Sivaraman) | "Proposed" | Home band, `/khasak` |
| Youth activities: Poetry Slam, Open Mic Nights, Reels & Short-Film Challenge, Indie & Rap Night, Meet Your Favourite Authors, Campus Ambassadors | "Proposed" | Home band, `/youth` |
| Programme | "Proposed programme · subject to confirmation" | `/programme` |
| Pass inclusions | "indicative" note | `/passes` |
| Partnership benefits | "indicative" note | `/partners` |

When a speaker confirms, set `status: confirmed` in their file. When everything is confirmed, remove the notes in `src/views/Speakers.tsx` and `src/i18n/ui.ts` (`home.voices.note`).

## 6. Later

- [ ] Confirmed schedule → `src/content/schedule.json` (README §3), then remove the "Proposed programme" badge in `src/views/Programme.tsx`.
- [ ] Ticketing: add `buyUrl` to each pass in `src/content/passes.json` (and a booking link for Khasakkinte Ithihasam) when sales open; prices are already shown.
- [ ] Ticket prices and links → `src/content/passes.json`.
- [ ] **Khasakkinte Ithihasam tickets**: the ticket card on `/khasak` is a preview only and sells nothing. When booking opens, add the date, venue and prices, and point the button at the ticketing page (`src/components/motion/TicketCard.tsx`). Confirm that Festival Passes do not include the play, as the Passes page, FAQ and ticket card now say.
- [ ] Confirmed sponsor logos → `src/content/sponsors.json` + `kilf-assets/logos/`. Sponsor logos are not rendered yet; add a logo strip to Partners and Footer when the first partner signs.
- [ ] Speaker bios. Adding a bio creates `/speakers/<slug>` automatically.
