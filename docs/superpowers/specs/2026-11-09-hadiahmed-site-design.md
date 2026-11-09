# hadiahmed.com: Site Design

Date: 2026-11-09
Status: Waiting for Hadi's approval

## Goal

A personal site and blog for Hadi Ahmed, an MIS student at the University of Houston looking for a summer internship. It replaces the single-page Claude artifact with a real website that:

- shows who Hadi is, what he's built and where he's worked
- makes it easy for recruiters to get in touch or download his resume
- lets Hadi post on his own, from a phone or computer, without writing code
- is accessible and works in both light and dark mode
- goes live at hadiahmed.com

Approved look: the "combined direction" preview (https://claude.ai/artifact/MrGyKCmvMRiPhh9M14kzf6), version 5.

## What Hadi asked for

- B's technical look with more color, and bigger images
- A's short index, where every entry has a type: Personal, Writing, Project or Work
- C's featured latest post with a photo and reading time, plus the date and how long ago it was posted
- A blue glow at the top that carries down the page
- Follows each visitor's light/dark setting. Light mode is a soft white of about 4000K.
- A "Let's talk" button at the very top, and full contact details at the bottom: phone (public), email, LinkedIn, Instagram
- Resume linked as a PDF
- An intro paragraph based on his LinkedIn summary, matched to his resume
- An editor so he can post himself

## Pages

| Address | What's on it |
|---|---|
| `/` | Header and menu (with the Let's talk button), intro with portrait, tags and quick links, the featured latest post, the index (newest first, filterable by type, short list with "View all"), a photo grid, the Let's talk section, and the footer |
| `/index` | Every entry, with the type filters |
| `/personal`, `/writing`, `/projects`, `/work` | Entries of one type only. These links work without JavaScript. |
| `/posts/<name>` | One entry: type, title, date, how long ago it was posted, reading time, main photo, the text, and links to the previous and next entries |
| `/photos` | All photos, larger, with captions |
| `/about` | Longer bio, experience, education, leadership, and skills from the resume |
| `/resume.pdf` | The resume file |
| `/rss.xml` | A feed so people can follow new posts |
| `/admin` | Forwards to the editor (see Editing) |
| 404 | A friendly "page not found" with links back to the site |

On the home page, the type filters are buttons that work without reloading. Without JavaScript, they fall back to the per-type pages.

## Content: everything is a file

Content lives in the repo as plain files, so Hadi, the editor and Claude all work with the same thing.

- **Entries:** `src/content/posts/*.md`. Each file has this header:
  - `title` (required)
  - `date` (required)
  - `type` (required): `personal`, `writing`, `project` or `work`
  - `image` and `imageAlt` (optional; `imageAlt` is required whenever there is an image)
  - `summary` (optional, one or two sentences)
  - `draft` (optional; drafts are never published)

  The text of the entry follows the header.
- **Site info:** `src/data/profile.yml` holds the intro paragraph, the tags, contact details, experience, education, skills and interests. Updating it updates every page.
- **Photos:** `src/data/photos.yml` lists each photo with its file, alt text, caption and place.
- **Images:** `public/images/`. The build resizes them and serves modern image formats.

**Worked out automatically:** reading time (word count ÷ 220, rounded up, at least 1 minute), the featured post (the newest entry that isn't a draft), "how long ago" (calculated in the visitor's browser so it stays current, with the date always shown next to it), the counts on the type filters, and the index order.

**First entries, all taken from the resume and the old page (no made-up posts):**
- Embedded Device Configuration (Project, Apr 2026)
- Azure Cloud Monitoring Automation (Project, Mar 2026)
- MISSO Operations Committee (Work, Spring 2025)
- Gen Z Ethics Competition with KPMG (Project, Fall 2024, with the team photo)
- Flooring Specialist at The Home Depot (Work, May 2024 to now)
- Houston photos (Personal, with the Hermann Park photos)

The placeholder "example" posts from the preview are not carried over. When the newest entry has no photo, the featured card uses a text-only layout.

## Editing

- **Editor:** Pages CMS (free, hosted at app.pagescms.org). Hadi signs in with GitHub and gets a form for each entry: title, a type dropdown, date, photo upload with an alt-text field, a summary, a writing box, and a draft toggle. Forms for site info and photos are included too. The repo contains a `.pages.yml` file that defines these forms. Publishing from the editor saves to the repo, and the site rebuilds automatically.
- **`/admin`** forwards to the editor.
- **Other ways to post:** add a file on github.com using `docs/post-template.md`, or ask Claude.
- **Guide:** a short `docs/how-to-post.md` written for a non-coder.

## Look

- **Fonts:** IBM Plex Sans for text, IBM Plex Mono for labels and dates. Served from the site itself, not loaded from Google.
- **Dark mode:** navy background `#0c1726`, with blue glows behind the header, the featured post, the index, the photos and the contact section.
- **Light mode:** warm 4000K paper `#f7f3ec`, with a warm, lamplight-style glow.
- **Type colors:**

  | Type | Dark | Light |
  |---|---|---|
  | Project | `#7cc4fa` | `#0b5c9c` |
  | Writing | `#ffc266` | `#8a5200` |
  | Work | `#6fdcae` | `#166e49` |
  | Personal | `#ff9a9a` | `#a92f3a` |

- **Theme:** follows the visitor's device setting by default. A small light/dark toggle in the menu overrides it and remembers the choice. The theme is set before the page draws, so it never flashes the wrong color.
- **Motion:** the photo hover zoom and a gentle fade-in when the page loads, both turned off when the visitor has reduced motion turned on. No animation library is used: Framer Motion would add a large download for effects CSS already covers.

## Accessibility (WCAG 2.2 AA)

- Proper headings and page landmarks, plus a "Skip to content" link
- Everything works by keyboard, with a visible focus outline everywhere
- Text contrast of at least 4.5:1 in both themes, type colors included
- Every image needs alt text. The build fails if it's missing.
- Filter buttons tell screen readers which one is selected, and the result count is read aloud when it changes
- Dates are marked up as dates
- Links that open another site say so to screen readers
- Pages still work at 200% zoom and at 320px wide
- Prefers-reduced-motion is respected
- An automated accessibility check (axe) runs on every page in every build. A serious problem stops the site from deploying.

## Build and hosting

- **Astro** builds the site into plain static pages, with almost no JavaScript (only the theme toggle, the filters and "how long ago").
- **GitHub Pages** hosts it, deployed by a GitHub Actions workflow on every push to `main`. Steps: install, build, accessibility check, deploy. This replaces the Cloudflare Pages idea from the earlier chat, because it doesn't need an extra account.
- **Free address first:** `hvdxx.github.io/hadiahmed.com`. Hadi turns Pages on once in the repo settings. Because this address sits inside a folder (`/hadiahmed.com/`), every link in the site is written relative to that folder. Switching to the custom domain only means changing that folder setting.
- **Custom domain later:** buy hadiahmed.com, add the DNS records, and add a `CNAME` file. This is a separate step.
- **Basics:** page titles and descriptions, link previews for social sites (Open Graph), a sitemap, and a favicon.

## Out of scope for now

Comments, analytics, a newsletter, search, tags beyond the four types, and buying or connecting the domain.

## Testing

- The build passes and the axe check finds no serious problems
- Spot checks at phone and desktop sizes, in both themes
- The editor's forms load and match the content files
- Making a test entry in the editor is a manual step for Hadi after launch
