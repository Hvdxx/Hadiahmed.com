# hadiahmed.com Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Hadi's personal site and blog as a static Astro site with a typed entry index, a featured latest post, photos, contact, a Pages CMS editor, and an accessibility-gated GitHub Pages deploy.

**Architecture:** Astro 5 static output. Content is files: Markdown entries in an Astro content collection (`posts`), YAML data for profile and photos. Pure logic (reading time, relative time, sorting, featured pick) lives in `src/lib/` and is unit-tested with Vitest. Pages and the a11y gate are tested with Playwright + axe against the built site.

**Tech Stack:** Node 22, Astro 5.18.2, @astrojs/rss, @astrojs/sitemap, @fontsource/ibm-plex-sans + ibm-plex-mono, Vitest, Playwright (preinstalled Chromium) + @axe-core/playwright, Pages CMS (`.pages.yml`), GitHub Actions + GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-11-09-hadiahmed-site-design.md`. The visual reference is the approved preview: `docs/design/preview.html`, a copy of artifact version 5 committed in Task 1. Port its CSS tokens and markup and don't redesign.

## Global Constraints

- `astro.config.mjs`: `site: 'https://hvdxx.github.io'`, `base: '/hadiahmed.com'`, `trailingSlash: 'ignore'`, `output: 'static'`. Every internal URL goes through `url(path)` from `src/lib/url.ts`. No hard-coded leading `/` in links or `src` attributes.
- Entry types are exactly `personal | writing | project | work`. Labels: Personal, Writing, Project, Work. Type pages: `/personal`, `/writing`, `/projects`, `/work`.
- Colors, copied exactly:
  - Dark: bg `#0c1726`, panel `#13223a`, raise `#182b47`, fg `#eaf1f9`, muted `#9fb0c6`, line `#24395a`. Types: project `#7cc4fa`, writing `#ffc266`, work `#6fdcae`, personal `#ff9a9a`. Glows: `rgba(84,166,255,.34)`, `rgba(84,166,255,.16)`, card `rgba(84,166,255,.30)`.
  - Light (4000K): bg `#f7f3ec`, panel `#fcfaf6`, raise `#f0ebe2`, fg `#16202c`, muted `#5b5f63`, line `#e2dbcf`. Types: project `#0b5c9c`, writing `#8a5200`, work `#166e49`, personal `#a92f3a`. Glows: `rgba(255,196,128,.34)`, `rgba(255,204,150,.22)`, card `rgba(140,100,50,.20)`.
- Theme: no stored choice → follow `prefers-color-scheme`. Toggle stores `'light'|'dark'` in `localStorage['theme']` (wrapped in try/catch) and sets `data-theme` on `<html>`. An inline script in `<head>` applies it before paint.
- Reading time = `max(1, ceil(words / 220))` minutes.
- Dates are date-only and are formatted in UTC, so a post dated 2026-11-04 shows "Nov 4, 2026" in every timezone.
- Contact (public): phone `(281) 965-5448` / `tel:+12819655448`; email `Hadiahmed350@gmail.com`; LinkedIn `https://linkedin.com/in/hadi-ahmed-mis`; Instagram `https://instagram.com/_hadi.ahmed_` (`@_hadi.ahmed_`); resume `url('resume.pdf')`.
- Intro copy, exact: "Hey! I'm Hadi. I'm studying Management Information Systems at the University of Houston, and I want to use technology to help businesses run better and make smarter decisions. I'm looking for a summer internship to take the next step in my career. At The Home Depot I work as a Flooring Specialist, scoping projects, building cost estimates, and turning technical specs into clear recommendations for customers. Outside of work I build with Azure, SQL and Python."
- No made-up posts. Every entry's content comes from the resume or the old page.
- Motion only under `@media (prefers-reduced-motion: no-preference)`.
- JS budget: only the theme script, the filter script and the time-ago script. No framework runtime.

## Review Focus

1. Newest entry has no image → the featured card uses a text-only layout and has no broken `<img>`. Tested in Task 4.
2. Date-only post viewed from Houston (UTC−6) → shows the same calendar day as the file, not the day before. Tested in Task 2 (`formatDate`) and Task 6 (e2e with `timezoneId: 'America/Chicago'`).
3. `draft: true` → appears nowhere: not on the home page, not in the index, not on a type page or in RSS, and gets no post page. Tested in Task 2 (`publishedEntries`) and Task 6.
4. Entry with `image` but no `imageAlt` → the build fails with a clear message. Tested in Task 2 (schema test).
5. Site served under `/hadiahmed.com/` → every internal link and image resolves, with no 404s. Tested in Task 6 by a link crawl.

---

## File Map

```
astro.config.mjs, package.json, tsconfig.json, vitest.config.ts, playwright.config.ts
src/content.config.ts            posts collection schema
src/lib/url.ts                   url(path) with base
src/lib/entries.ts               types, readingTime, sort, publishedEntries, featured, counts
src/lib/time.ts                  formatDate, timeAgo
src/lib/*.test.ts                Vitest unit tests
src/data/profile.yml             intro, chips, contact, experience, education, skills
src/data/photos.yml              photo list
src/assets/images/*.webp         all images (optimized by astro:assets)
src/content/posts/*.md           entries
public/resume.pdf, public/favicon.svg
src/styles/global.css            tokens (both themes), base, utilities
src/layouts/Base.astro           head, theme init, skip link, header, footer
src/components/Header.astro, ThemeToggle.astro, Footer.astro
src/components/Hero.astro, Featured.astro, EntryIndex.astro, TypeTag.astro, PhotoGrid.astro, Contact.astro, TimeAgo.astro
src/scripts/filters.ts, src/scripts/time-ago.ts, src/scripts/theme.ts
src/pages/index.astro, index-all (/index), [type].astro, posts/[slug].astro, photos.astro, about.astro, 404.astro, rss.xml.ts, admin.astro
tests/e2e/*.spec.ts              Playwright + axe
.pages.yml                       Pages CMS config
docs/how-to-post.md, docs/post-template.md
.github/workflows/deploy.yml
```

---

### Task 1: Scaffold, tooling, and design reference

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`, `src/lib/url.ts`, `src/lib/url.test.ts`, `src/pages/index.astro` (placeholder), `docs/design/preview.html`, `README.md`

**Interfaces:**
- Produces: `url(path: string): string`. Joins `import.meta.env.BASE_URL` with the path, removing duplicate slashes. `url('')` is the base with a trailing `/`. Leaves absolute `http(s):`, `mailto:` and `tel:` untouched.
- npm scripts: `dev`, `build` (`astro check && astro build`), `preview`, `test` (vitest run), `test:e2e` (playwright test), `check:all` (test + build + test:e2e).

- [ ] **Step 1:** Write `package.json` with `astro@5.18.2` pinned exactly, and `@astrojs/rss`, `@astrojs/sitemap`, `@astrojs/check`, `typescript`, `@fontsource/ibm-plex-sans`, `@fontsource/ibm-plex-mono`, `vitest`, `@axe-core/playwright` and `@playwright/test`, choosing versions compatible with Astro 5 (if npm reports a peer conflict, pin the latest 5-compatible version). Run `npm install`. Expected: exit 0.
- [ ] **Step 2:** Write the failing test in `src/lib/url.test.ts`. Run vitest with `BASE_URL` stubbed to `/hadiahmed.com/` using `vi.stubEnv`, or read the base through a module-level getter so it can be stubbed. Cases: `url('about')` → `/hadiahmed.com/about`; `url('/about')` → `/hadiahmed.com/about`; `url('')` → `/hadiahmed.com/`; `url('https://x.com')` → unchanged; `url('mailto:a@b.c')` → unchanged.
- [ ] **Step 3:** Run `npx vitest run src/lib/url.test.ts`. Expected: FAIL (module missing).
- [ ] **Step 4:** Implement `url()`.
- [ ] **Step 5:** Run the same command. Expected: PASS.
- [ ] **Step 6:** Write `astro.config.mjs` per Global Constraints, with the sitemap integration. Add a placeholder index page. Run `npm run build`. Expected: `dist/index.html` exists.
- [ ] **Step 7:** Copy the approved preview HTML to `docs/design/preview.html`, and write a README with one paragraph plus the scripts.
- [ ] **Step 8:** Commit: `chore: scaffold Astro site with url helper`.

### Task 2: Content model and pure logic

**Files:**
- Create: `src/content.config.ts`, `src/lib/entries.ts`, `src/lib/time.ts`, `src/lib/entries.test.ts`, `src/lib/time.test.ts`, `src/lib/schema.test.ts`

**Interfaces:**
- Produces, in `entries.ts`:
  - `type EntryType = 'personal'|'writing'|'project'|'work'`
  - `TYPES: readonly { id: EntryType; label: string; path: string }[]`, with paths `personal`, `writing`, `projects`, `work`
  - `readingTime(markdown: string): number`, which counts words after removing code fences, markdown symbols and URLs
  - `interface EntryLike { id: string; data: { title: string; date: Date; type: EntryType; draft?: boolean; image?: unknown; imageAlt?: string; summary?: string }; body?: string }`
  - `publishedEntries<T extends EntryLike>(all: T[]): T[]`, which removes drafts and sorts newest first (ties broken by title A→Z)
  - `featured<T extends EntryLike>(sorted: T[]): T | undefined`, which returns `sorted[0]`
  - `countsByType(entries: EntryLike[]): Record<EntryType|'all', number>`
- Produces, in `time.ts`:
  - `formatDate(d: Date): string`, giving `"Nov 4, 2026"` (`Intl.DateTimeFormat('en-US', { month:'short', day:'numeric', year:'numeric', timeZone:'UTC' })`)
  - `isoDate(d: Date): string`, giving `"2026-11-04"`
  - `timeAgo(d: Date, now: Date): string`, using whole days between UTC midnights: `0` → "Today", `1` → "Yesterday", `<30` → "N days ago", `<365` → "N month(s) ago" (`round(days/30)`, at least 1), otherwise "N year(s) ago" (`round(days/365)`). A future date returns "Today".
  - The same algorithm must also exist in `src/scripts/time-ago.ts` (Task 4). Export `timeAgo` from `time.ts` and import it there, so there is one source.
- Produces, in `content.config.ts`: the `posts` collection with a glob loader on `src/content/posts/*.md`. Schema: `title` (string, min 1), `date` (coerce date), `type` (enum), `summary?` (string), `image?` (`image()`), `imageAlt?` (string), `draft` (boolean, default false). Add `.refine(d => !d.image || !!d.imageAlt?.trim(), { message: 'imageAlt is required when image is set', path: ['imageAlt'] })`. Export the base object schema as `postFields` and the refined one as `postSchema(image)` so it can be tested.

- [ ] **Step 1:** Write the failing tests.
  - `time.test.ts`:
    - `formatDate(new Date('2026-11-04'))` → `'Nov 4, 2026'`
    - `timeAgo(new Date('2026-11-04'), new Date('2026-11-09T03:00:00Z'))` → `'5 days ago'`
    - same day → `'Today'`; 1 day → `'Yesterday'`; 45 days → `'2 months ago'`; 31 days → `'1 month ago'`; 400 days → `'1 year ago'`; 800 days → `'2 years ago'`; future → `'Today'`
  - `entries.test.ts`:
    - `readingTime('word '.repeat(220))` → 1; `'word '.repeat(221)` → 2; `''` → 1
    - `publishedEntries` drops `draft: true`, sorts `[2024-05, 2026-04, 2026-03]` to `[2026-04, 2026-03, 2024-05]`, and breaks a same-date tie by title
    - `featured([])` → `undefined`
    - `countsByType` on 2 project + 1 work → `{ all:3, project:2, work:1, writing:0, personal:0 }`
  - `schema.test.ts`:
    - `postSchema(() => z.string())` (stub `image`) passes `{title:'a', date:'2026-01-01', type:'project'}` and gives `draft` false
    - fails `{…, image:'x.webp'}` with no `imageAlt`, with the message `imageAlt is required when image is set`
    - fails `type:'blog'`
- [ ] **Step 2:** Run `npx vitest run src/lib`. Expected: FAIL (modules missing).
- [ ] **Step 3:** Implement `time.ts`, `entries.ts` and `content.config.ts` per the Interfaces above.
- [ ] **Step 4:** Run `npx vitest run src/lib`. Expected: all PASS.
- [ ] **Step 5:** Commit: `feat: content schema and entry/time logic`.

### Task 3: Real content and data

**Files:**
- Create: `src/assets/images/{portrait,genz-team,fountain-dusk,stone-lantern,evening-pond,go-coogs,misso-1,misso-2}.webp`, `public/resume.pdf`, `public/favicon.svg`, `src/data/profile.yml`, `src/data/photos.yml`, `src/content/posts/{embedded-device-configuration,azure-cloud-monitoring-automation,misso-operations-committee,gen-z-ethics-competition,home-depot-flooring-specialist,houston-photos}.md`, `src/lib/data.ts`, `src/lib/data.test.ts`

**Interfaces:**
- Consumes: the `posts` schema (Task 2).
- Produces: `src/lib/data.ts` exporting `profile` and `photos`. Import the YAML with Vite's native YAML support if available; otherwise add `@rollup/plugin-yaml` to the Vite config. Types:
  - `Profile = { name; tagline; intro; location; chips: string[]; status: string; contact: { email; phone; phoneHref; linkedin; instagram; instagramHandle }; experience: {role, org, place, dates, bullets: string[]}[]; education: {school, detail, dates, gpa, coursework: string[]}[]; leadership: {role, org, dates, bullets: string[]}[]; skills: { technical: string[]; certifications: string[]; languages: string[]; interests: string[] } }`
  - `Photo = { image: string /* filename in src/assets/images */; alt: string; caption: string; place: string; featured?: boolean }`
- Images: the extracted files are at `/tmp/claude-0/-home-user-website-builder-setup/a3488693-9ba9-5677-9884-4c6393dd5907/scratchpad/assets/`. Use the alt text from the old page. Resume PDF is in the same folder.
- Entries, with front matter `date` and `type`:
  - embedded-device-configuration: 2026-04-01, project
  - azure-cloud-monitoring-automation: 2026-03-01, project
  - misso-operations-committee: 2025-01-15, work, image misso-1
  - gen-z-ethics-competition: 2024-09-01, project, image genz-team
  - home-depot-flooring-specialist: 2024-05-01, work
  - houston-photos: 2026-04-15, personal, image fountain-dusk, with the body showing the four Houston photos

  Bodies paraphrase the resume and old page, in first person and plainly written. Nothing new is invented.
- `photos.yml` contains all 8 images. Set `featured: true` on stone-lantern, go-coogs, evening-pond and genz-team, the home-page grid order from the preview.

- [ ] **Step 1:** Write the failing `data.test.ts`:
  - `profile.contact.phoneHref === 'tel:+12819655448'`
  - `profile.contact.instagram === 'https://instagram.com/_hadi.ahmed_'`
  - `profile.intro` equals the Global Constraints copy exactly
  - every `photos[i].alt` is non-empty
  - every `photos[i].image` exists on disk in `src/assets/images` (use `fs.existsSync`)
  - `photos.filter(p => p.featured).length === 4`
- [ ] **Step 2:** Run `npx vitest run src/lib/data.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Copy the assets in and write the YAML, entry files and `data.ts`.
- [ ] **Step 4:** Run `npx vitest run` and `npx astro build`. Expected: all unit tests PASS, and the build succeeds (the content schema validates all 6 entries).
- [ ] **Step 5:** Commit: `feat: add real content, photos, resume`.

### Task 4: Layout, theme, and home page

**Files:**
- Create: `src/styles/global.css`, `src/layouts/Base.astro`, `src/components/{Header,ThemeToggle,Footer,Hero,Featured,EntryIndex,TypeTag,PhotoGrid,Contact,TimeAgo}.astro`, `src/scripts/{theme,filters,time-ago}.ts`
- Modify: `src/pages/index.astro`
- Test: `tests/e2e/home.spec.ts`, `playwright.config.ts`

**Interfaces:**
- Consumes: `url`, `TYPES`, `publishedEntries`, `featured`, `countsByType`, `readingTime`, `formatDate`, `isoDate`, `timeAgo`, `profile`, `photos`.
- Produces:
  - `Base.astro`. Props: `{ title: string; description?: string; image?: ImageMetadata }`. Renders `<title>{title} · Hadi Ahmed</title>` (just "Hadi Ahmed" on the home page), the meta description, Open Graph tags, a canonical link, the RSS `<link rel="alternate">`, and the favicon. The inline theme script runs first in `<head>`. Then the skip link to `#main`, `<Header/>`, `<main id="main">`, slot, `<Footer/>`.
  - `TypeTag.astro`. Props: `{ type: EntryType }`. Renders `<span class="tag {type}">{label}</span>`.
  - `TimeAgo.astro`. Props: `{ date: Date }`. Renders `<time datetime={isoDate}>{formatDate}</time> <span data-ago={isoDate}>{timeAgo(date, buildTime)}</span>`. `time-ago.ts` rewrites every `[data-ago]` on load, using `timeAgo(new Date(iso), new Date())`.
  - `EntryIndex.astro`. Props: `{ entries; limit?: number; filters?: boolean }`. Renders a `<ul class="idx">` of rows: `date | linked title | TypeTag`, each `<li data-type>`. With `filters`, it also renders a `role="group"` of buttons with `aria-pressed` and counts, plus `<p aria-live="polite">`. When JavaScript is unavailable, each filter is an `<a>` to its type page; `filters.ts` upgrades them to buttons. With `limit`, it shows a "View all N entries" link to `url('index')`.
- Port markup and CSS from `docs/design/preview.html` (the `.m` mockup), renaming `.m`-scoped tokens to `:root` tokens. Themes follow the spec's three-block token pattern: `:root` light by default; `@media (prefers-color-scheme: dark) :root:not([data-theme="light"])`; and `:root[data-theme="dark"]`. Note that the preview is dark-first, while here the bare `:root` is light.
- Fonts: import `@fontsource/ibm-plex-sans/{400,500,600,700}.css` and `@fontsource/ibm-plex-mono/{400,500}.css` in `global.css`.
- Images: `astro:assets` `<Image>` with `widths` and `sizes`. The portrait is `loading="eager"` and `fetchpriority="high"`; all others are lazy.
- `Featured.astro`: if the entry has no `image`, add `class="latest no-image"` (single column, no `<img>`).
- `ThemeToggle`: a `<button aria-label="Switch to dark theme">` or the light equivalent, kept up to date.
- External links get `rel="noopener"` plus a visually hidden "(opens in new tab)" when `target="_blank"`. Keep external links in the same tab (no `target`) to avoid this unless the preview used `_blank`.

- [ ] **Step 1:** Write `playwright.config.ts`: `webServer: { command: 'npm run preview -- --port 4321', url: 'http://localhost:4321/hadiahmed.com/' }`, `use.baseURL` set to that URL, projects `chromium`, and `--trace off`. Write the failing `tests/e2e/home.spec.ts`:
  - the h1 text is `Hadi Ahmed`
  - the intro paragraph contains `Hey! I'm Hadi.`
  - the header has a link named `Let's talk` whose href ends with `#contact`
  - `#contact` contains `(281) 965-5448`, `Hadiahmed350@gmail.com` and `@_hadi.ahmed_`, plus a link with an href ending `resume.pdf`
  - the "Latest" region shows the title of the newest non-draft entry (`Embedded Device Configuration`), a `time[datetime="2026-04-01"]`, and text matching `/min read/`
  - since that entry has no image, `.latest img` has count 0
  - clicking the `Project` filter → every visible `li[data-type]` has `data-type="project"`, and the live region text matches `/Showing \d+ Project entries/`
  - with `colorScheme: 'light'`, the computed `body` background is `rgb(247, 243, 236)`; with `'dark'`, it is `rgb(12, 23, 38)`
  - clicking the theme toggle in dark → `html[data-theme="light"]`; after a reload it is still light
  - the skip link is the first focusable element (`page.keyboard.press('Tab')` → focused text `Skip to content`)
- [ ] **Step 2:** Run `npm run build && npx playwright test tests/e2e/home.spec.ts --trace off`. Expected: FAIL.
- [ ] **Step 3:** Implement the components, styles, scripts and `index.astro`. Section order: Hero, Featured, Index (limit 8, filters), Photos (featured photos, with a "View all" link to `url('photos')`), Contact.
- [ ] **Step 4:** Run the same command. Expected: PASS.
- [ ] **Step 5:** Take screenshots of the home page at 1280 and 390 px in both themes, and compare them against `docs/design/preview.html`. Fix visible differences only.
- [ ] **Step 6:** Commit: `feat: base layout, theming and home page`.

### Task 5: Remaining pages, RSS, admin redirect

**Files:**
- Create: `src/pages/index/index.astro` (route `/index`), `src/pages/[type].astro`, `src/pages/posts/[slug].astro`, `src/pages/photos.astro`, `src/pages/about.astro`, `src/pages/404.astro`, `src/pages/rss.xml.ts`, `src/pages/admin.astro`
- Test: `tests/e2e/pages.spec.ts`

**Interfaces:**
- Consumes: everything from Task 4.
- `[type].astro`: `getStaticPaths` from `TYPES` (`params.type = path`). Lists that type's entries with `EntryIndex` (no limit), and the filters link to the other type pages with `aria-current="page"` on the active one. Empty type → "Nothing here yet."
- `posts/[slug].astro`: `getStaticPaths` from `publishedEntries`. Shows the TypeTag, an h1 title, TimeAgo, `N min read`, the hero image if present, the rendered body, and prev/next links (older/newer) by sorted order.
- `about.astro`: renders the profile's experience, education (with GPA), leadership, and skills groups.
- `rss.xml.ts`: `@astrojs/rss` over `publishedEntries`, with `link: url('posts/' + id)`.
- `admin.astro`: `<meta http-equiv="refresh" content="0; url=https://app.pagescms.org/">` plus a visible link with the same href, and `noindex`.
- `404.astro`: the message "That page doesn't exist." with links to Home and Index.

- [ ] **Step 1:** Write the failing `tests/e2e/pages.spec.ts`:
  - `/index` lists 6 entries
  - `/projects` lists exactly 3, all `data-type="project"`, and its "Project" link has `aria-current="page"`
  - `/writing` shows `Nothing here yet.`
  - `/posts/gen-z-ethics-competition` has h1 `Gen Z Ethics Competition with KPMG`, a figure img with a non-empty alt, and a previous/next nav
  - `/about` contains `3.5` and `Flooring Specialist`
  - `/photos` has 8 images, all with non-empty alt
  - `/rss.xml` returns 200, and its body contains `<item>` 6 times
  - `/admin` contains a link to `https://app.pagescms.org/`
  - `/does-not-exist` shows `That page doesn't exist.`
- [ ] **Step 2:** Run `npm run build && npx playwright test tests/e2e/pages.spec.ts --trace off`. Expected: FAIL.
- [ ] **Step 3:** Implement the pages.
- [ ] **Step 4:** Run the same command. Expected: PASS.
- [ ] **Step 5:** Commit: `feat: index, type, post, photos, about, rss, admin, 404 pages`.

### Task 6: Accessibility gate and site-wide checks

**Files:**
- Create: `tests/e2e/a11y.spec.ts`, `tests/e2e/integrity.spec.ts`, `tests/fixtures/draft-check.md` (see Step 1)

**Interfaces:**
- Consumes: the built site.
- Route list: `['', 'index', 'projects', 'work', 'personal', 'writing', 'photos', 'about', 'posts/gen-z-ethics-competition', 'posts/embedded-device-configuration']`.

- [ ] **Step 1:** Write the tests.
  - `a11y.spec.ts`: for each route × `colorScheme` `['light','dark']`, run `new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()`. Expect the violations with impact `serious` or `critical` to equal `[]`, and print their ids and targets on failure.
  - `integrity.spec.ts`:
    - (a) Crawl every same-origin `a[href]` and `img[src]` reachable from the home page, 2 levels deep. Each returns status < 400.
    - (b) With `timezoneId: 'America/Chicago'`, `/posts/gen-z-ethics-competition` shows `Sep 1, 2024`.
    - (c) Draft exclusion: the test writes `src/content/posts/zz-draft-test.md` (`draft: true`, date 2030-01-01, title `Draft Should Not Show`) before the build, using a `globalSetup` that runs only when `E2E_DRAFT_CHECK=1` and removes the file in teardown. It asserts the title appears on none of `/`, `/index` or `/rss.xml`, and that `/posts/zz-draft-test` returns 404. Add the npm script `test:drafts` (`E2E_DRAFT_CHECK=1 npm run build && E2E_DRAFT_CHECK=1 playwright test integrity`). The globalSetup must create the file before the build: make `test:drafts` do `node tests/fixtures/add-draft.mjs && npm run build && playwright test integrity; node tests/fixtures/remove-draft.mjs`.
    - (d) At 320px wide, `document.documentElement.scrollWidth <= 320` on `/` and on `/posts/gen-z-ethics-competition`.
- [ ] **Step 2:** Run `npm run build && npx playwright test --trace off`, then `npm run test:drafts`. Expected: any failures are real problems.
- [ ] **Step 3:** Fix every reported violation in the components and CSS. Never disable axe rules.
- [ ] **Step 4:** Rerun both commands. Expected: all PASS.
- [ ] **Step 5:** Commit: `test: axe accessibility gate and site integrity checks`.

### Task 7: Editor (Pages CMS) and posting docs

**Files:**
- Create: `.pages.yml`, `docs/how-to-post.md`, `docs/post-template.md`, `src/lib/cms.test.ts`

**Interfaces:**
- `.pages.yml`:
  - `media`: input `src/assets/images`, output `../../assets/images`. Posts reference images relative to `src/content/posts/`.
  - `content`:
    - (1) `posts`: a collection at `src/content/posts`, format `yaml-frontmatter`, fields `title` (string, required), `date` (date, required), `type` (select: personal/writing/project/work, required), `summary` (text), `image` (image), `imageAlt` (string; its description says it's required when there's a photo), `draft` (boolean), `body` (rich-text), filename `{primary}.md` (slugified title)
    - (2) `profile`: a file at `src/data/profile.yml` with matching fields (objects and lists)
    - (3) `photos`: a file at `src/data/photos.yml`, as a list
  - Field names must exactly match the Task 2 schema and the Task 3 profile and photo keys.
- `docs/post-template.md`: a front matter example with all fields commented, plus the body.
- `docs/how-to-post.md`: for a non-coder, covering: sign in at app.pagescms.org with GitHub → pick `hvdxx/hadiahmed.com` → Entries → New → fill in the form → Save. The site updates in about 2 minutes. Also cover how to add a photo with a description, what each type means, drafts, editing or deleting an entry, the github.com fallback using the template, and that asking Claude works too.

- [ ] **Step 1:** Write the failing `cms.test.ts`. Parse `.pages.yml` with `js-yaml` (dev dependency). Assert:
  - the posts collection field names ⊇ the schema keys `{title,date,type,summary,image,imageAlt,draft}`
  - the `type` field options equal `['personal','writing','project','work']`
  - the media input is `src/assets/images`
  - the paths of the profile and photos entries exist on disk
- [ ] **Step 2:** Run `npx vitest run src/lib/cms.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Write `.pages.yml` and both docs.
- [ ] **Step 4:** Run `npx vitest run`. Expected: all PASS. Also check that an image path in Pages CMS's output format (`../../assets/images/x.webp`) resolves in the build: the migrated entries already use it, so `npm run build` passing is enough.
- [ ] **Step 5:** Commit: `feat: Pages CMS editor config and posting guide`.

### Task 8: Deploy workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- On push to `main`, plus `workflow_dispatch`. Permissions: `contents: read`, `pages: write`, `id-token: write`. Concurrency group `pages`.
- Job `build`: checkout → setup-node 22 with npm cache → `npm ci` → `npx playwright install --with-deps chromium` → `npm test` → `npm run build` → `npx playwright test --trace off` (this includes the axe gate) → `npm run test:drafts` → `actions/upload-pages-artifact` with `path: dist`.
- Job `deploy`: needs build, environment `github-pages`, `actions/deploy-pages`.
- Pin actions to major tags: `actions/checkout@v4`, `actions/setup-node@v4`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4`.

- [ ] **Step 1:** Write the workflow.
- [ ] **Step 2:** Validate it locally: `npx --yes @action-validator/cli .github/workflows/deploy.yml`. If that's unavailable, parse it with `js-yaml` and check that the jobs `build` and `deploy` exist. Then run the full local equivalent: `npm ci && npm test && npm run build && npx playwright test --trace off && npm run test:drafts`. Expected: all pass.
- [ ] **Step 3:** Commit: `ci: build, test and deploy to GitHub Pages`.
- [ ] **Step 4:** Push the branch. Note for Hadi: after merging to `main`, go to Settings → Pages → Source: "GitHub Actions" (one time).
