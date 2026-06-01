# Deploy, Admin, Forms

## GitHub Token

Do not commit GitHub tokens into this repository or paste them into frontend code.
Set the token only in Vercel Environment Variables:

- `GITHUB_TOKEN`: fine-grained token with Contents Read/Write for `SupremeGoogle/toshu.ceramics`
- `GITHUB_REPO`: `SupremeGoogle/toshu.ceramics`
- `GITHUB_BRANCH`: `main`
- `ADMIN_PASSWORD`: password for `/admin`
- `GOOGLE_SCRIPT_URL`: deployed Google Apps Script Web App URL

If a token was pasted into chat or a public place, revoke it and create a new one.

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
`Сохранить в GitHub`. The API commits `public/content/site.json`, and Vercel
starts a new deployment from GitHub.

## Images

Put real photos into `public/images/` and reference them in admin as:

```txt
/images/photo-name.jpg
```
