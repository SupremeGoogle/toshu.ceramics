# Deploy, Admin, Forms

## Supabase Content

Run this SQL in Supabase SQL Editor:

```sql
create table site_content (
  id int primary key,
  content jsonb not null
);

alter table site_content enable row level security;

create policy "read" on site_content for select using (true);
create policy "write" on site_content for insert with check (true);
create policy "update" on site_content for update using (true);
```

The same SQL is stored in `docs/supabase-site-content.sql`.

Set these in Vercel Environment Variables:

- `ADMIN_PASSWORD`: password for `/admin`
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key for server-side saves
- `SUPABASE_ANON_KEY`: optional fallback key for reads
- `GOOGLE_SCRIPT_URL`: deployed Google Apps Script Web App URL

`GITHUB_TOKEN`, `GITHUB_REPO`, and `GITHUB_BRANCH` are now only fallback options if Supabase is not configured.

## Google Sheets

1. Create a Google Sheet.
2. Open Extensions -> Apps Script.
3. Paste `docs/google-apps-script.js`.
4. Deploy -> New deployment -> Web app.
5. Execute as: Me.
6. Who has access: Anyone.
7. Copy the Web App URL to `GOOGLE_SCRIPT_URL` in Vercel.
8. Copy the Google Sheet URL into `/admin` -> `Бренд и контакты` -> `leadsSheetUrl`.

## Admin

Open `/admin`, enter `ADMIN_PASSWORD`, edit content blocks, then click
`Сохранить изменения`. The API writes the JSON to `site_content` row `id = 1`.

## Images

Put real photos into `public/images/` and reference them in admin as:

```txt
/images/photo-name.jpg
```
