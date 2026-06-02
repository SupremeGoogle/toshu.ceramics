# AGENTS.md

## Project

Toshu Ceramics is a warm, minimal React/Vite brand site and lightweight shop
for a handmade ceramics studio. The production target is Vercel.

Keep the site gentle, tactile, editorial, and easy for a client to maintain.
Avoid visible implementation language for customers: no GitHub, Supabase,
Google Sheets, tokens, or deployment text on public pages.

## Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn-style folders: `src/components/ui` and `src/lib`
- Framer Motion
- Vercel Serverless Functions
- Supabase for editable site content
- Google Apps Script for lead form submissions

## Commands

Run these before finishing frontend/code changes:

```bash
npm run build
npm run lint
```

For local visual checks:

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

## Modern Web Guidance

Before HTML/CSS/client-side JS changes, run:

```bash
npx -y modern-web-guidance@latest search "<task summary>" --skill-version 2026_05_16-c5e7870
```

Use the result when relevant. If it is not relevant, keep the change minimal and
document the reason in the working notes.

## Content And Admin

The fallback static content file is:

```txt
public/content/site.json
```

Production content is read from Supabase table `site_content`, row `id = 1`.
The admin panel at `/admin` edits normal fields, not raw JSON. Keep it friendly:
text inputs, textareas, image URL fields, add/remove buttons, and previews.

The admin save API is `api/save-content.js`:

- Save to Supabase when `SUPABASE_URL` and a Supabase key are configured.
- Also commit to GitHub when `GITHUB_TOKEN` is present.
- Fall back to GitHub only if Supabase is not configured.

Do not expose storage or deployment details in public UI.

## Forms And Privacy

Lead forms submit through `api/submit-lead.js` to `GOOGLE_SCRIPT_URL`.

Every public form must:

- include a required personal-data consent checkbox;
- link to `/privacy`;
- show a clear success state after submission;
- provide a fallback contact message if submission fails.

The `/privacy` route must open at the top of the page and contain the consent
text in plain Russian.

## Favicon

The public site and admin must use the same favicon:

```txt
/favicon-32.png?v=6
```

The HTML favicon and the runtime `SiteFavicon` component both point to this PNG.
Keep this because Vercel may challenge or cache SVG/ICO assets differently.
If favicon changes, bump the query version in both `index.html` and
`SiteFavicon`.

## Design Notes

- Keep the public site in Russian.
- Use the real Toshu logo from `public/brand-logo.png`.
- Use the actual Instagram-style icon component, not a generic camera icon.
- Keep catalog cards scannable and tactile.
- On desktop, the home "Предметы для тихих ритуалов" section uses vertical page
  scroll to move cards horizontally. Do not replace it with a plain grid unless
  the user asks.
- The full catalog page should remain a grid.
- The gallery should preserve original photo proportions and avoid hard crops
  unless the user asks for a different composition.

## SEO

Keep route-specific metadata in `RouteSeo`. Public routes currently include:

- `/`
- `/catalog`
- `/about`
- `/certificate`
- `/contacts`
- `/privacy`

When adding a public route, update:

- `RouteSeo`
- `public/sitemap.xml`
- public navigation only if the route belongs in the customer-facing nav

## Environment Variables

Expected Vercel variables:

```txt
ADMIN_PASSWORD=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=
GOOGLE_SCRIPT_URL=
GITHUB_TOKEN=
GITHUB_REPO=SupremeGoogle/toshu.ceramics
GITHUB_BRANCH=main
```

Never commit real tokens or passwords.

## Git

Do not revert user changes. Keep commits scoped and push to `main` when the user
asks for GitHub updates or when the task is clearly a production-site change.
