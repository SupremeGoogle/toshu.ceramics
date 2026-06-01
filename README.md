# Toshu Ceramics

Нежный интернет-магазин и бренд-сайт для мастерской ручной керамики:
каталог, о мастерской, подарочные сертификаты, изделия на заказ,
мастер-классы, сотрудничество и контакты.

## Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn-style structure: `src/components/ui`, `src/lib/utils`
- Framer Motion
- Vercel Serverless Functions

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Content

Основной контент сайта хранится в:

```txt
public/content/site.json
```

Админка доступна по `/admin`. На production она сохраняет изменения в GitHub
через Vercel API `/api/save-content`.

## Deploy

Подробности по Vercel, GitHub token, Google Sheets и Apps Script:

[docs/deploy-and-admin.md](docs/deploy-and-admin.md)

## Environment Variables

```txt
ADMIN_PASSWORD=
GITHUB_TOKEN=
GITHUB_REPO=SupremeGoogle/toshu.ceramics
GITHUB_BRANCH=main
GOOGLE_SCRIPT_URL=
```

Never commit real tokens into the repository.
