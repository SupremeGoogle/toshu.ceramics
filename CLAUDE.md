# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev -- --host 127.0.0.1 --port 5173   # local dev server
npm run build                                   # type-check + Vite build
npm run lint                                    # ESLint
```

Run `npm run build && npm run lint` before finishing any frontend or code change.

For HTML/CSS/client-side JS changes, also run:

```bash
npx -y modern-web-guidance@latest search "<task summary>" --skill-version 2026_05_16-c5e7870
```

## Architecture

This is a single-page React/Vite app deployed to Vercel. All public content is typed as `SiteContent` (defined at the top of `src/App.tsx`) and loaded once at startup by `SiteDataProvider`.

**Content loading priority** (`SiteDataProvider`):
1. `localStorage` draft (set by admin panel while editing)
2. `/api/get-content` → Supabase table `site_content`, row `id = 1`
3. Fallback static file `public/content/site.json`

**Routing** (`src/App.tsx`):
- `/admin` → `AdminPage` (password-gated content editor, stores password in `sessionStorage`)
- `/*` → `PublicSite` wrapping nested routes: `/`, `/catalog`, `/about`, `/certificate`, `/contacts`, `/privacy`

All pages receive the full `content: SiteContent` prop — no per-page data fetching.

**Vercel Serverless Functions** (`api/`):
- `get-content.js` — reads `site_content` from Supabase (GET)
- `save-content.js` — password-checked POST; saves to Supabase first, then optionally commits `public/content/site.json` to GitHub as a fallback
- `submit-lead.js` — proxies lead form data to `GOOGLE_SCRIPT_URL` (Google Apps Script → Google Sheets)

## Design System

All design tokens are CSS custom properties in `src/styles.css`, consumed by Tailwind via `tailwind.config.js`. Fonts: **Cormorant Garamond** (`font-display`) for headings, **Inter** for body.

Key utility classes (defined in `@layer components`):
- `.section-shell` — standard page section wrapper (`max-w-7xl`, horizontal padding, vertical padding)
- `.eyebrow` — small all-caps label above headings
- `.clay-button` — primary CTA (warm brown, rounded pill)
- `.soft-button` — secondary action (frosted glass, rounded pill)

## Key Behaviours to Preserve

- **Home catalog scroll**: On desktop (`lg`), the "Предметы для тихих ритуалов" section scrolls cards **horizontally** via scroll-linked `translate3d` (implemented in `ProductGrid` with `variant="scroll"`). Do not replace with a plain grid unless asked.
- **Gallery masonry**: `ImageGallery` uses CSS `columns` to preserve original photo proportions. Do not introduce hard-cropped grids unless asked.
- **Favicon**: The runtime `SiteFavicon` component and `index.html` both point to `/favicon-32.png?v=6`. If the favicon asset changes, bump the query string version in both places.
- **SEO**: Route-specific meta tags live in `RouteSeo`. When adding a public route, also update `public/sitemap.xml`.

## Forms and Privacy

Every public lead form must include a required consent checkbox that links to `/privacy`. The `LeadForm` component handles this and provides a fallback contact message if `/api/submit-lead` fails. Do not remove the consent flow.

## Admin Panel

`/admin` edits `SiteContent` fields in-browser and writes drafts to `localStorage`. Clicking "Сохранить изменения" POSTs to `/api/save-content` with the `x-admin-password` header. Do not expose Supabase, GitHub, or any backend details in the admin UI or public pages.

## Environment Variables

```
ADMIN_PASSWORD=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=
GOOGLE_SCRIPT_URL=
GITHUB_TOKEN=
GITHUB_REPO=SupremeGoogle/toshu.ceramics
GITHUB_BRANCH=main
```

See `docs/deploy-and-admin.md` for Supabase table setup and Google Apps Script deployment steps.

## Language

All public-facing UI is in Russian. Admin labels are also in Russian. Do not add English text to the public site.
