# TinTức24h

Node.js news site: an admin panel (login, articles, categories, TikTok products,
site config) and a public frontend styled after gocvacham.com, including a
TikTok "gate" popup on article pages.

## Stack

Express + EJS + MongoDB (Mongoose), session-based admin auth, Multer for image
uploads.

## Setup

```bash
npm install
cp .env.example .env   # then edit .env
npm run dev             # http://localhost:3000
```

### Database

- Leave `MONGODB_URI` empty in `.env` for local development: the server
  auto-starts an **in-memory MongoDB** (via `mongodb-memory-server`). This is
  the fastest way to try the app, but **all data resets every restart** —
  fine for development, not for real content.
- For anything persistent (staging/production, or content you want to keep
  locally), set `MONGODB_URI` to a real MongoDB instance (local `mongod`,
  Docker, or a MongoDB Atlas connection string).

### Admin account bootstrap

On first startup (when no admin exists yet), the server creates one admin
account from `ADMIN_USERNAME` / `ADMIN_PASSWORD` in `.env`. This is idempotent
— it's skipped once an admin already exists. Change the password afterwards
from the admin panel ("Đổi mật khẩu"), not by editing `.env`.

**Do not commit `.env` or put a real password in any tracked file** — `.env`
is already gitignored.

## Structure

```
src/
  app.js            Express app, middleware, routes mount
  server.js         entrypoint: connects DB, bootstraps admin, listens
  config/db.js      Mongoose connection (+ in-memory fallback)
  models/           Admin, Category, Article, TiktokProduct, SiteConfig
  middleware/        auth guard, multer upload config
  controllers/admin/ CRUD logic for the admin panel
  controllers/site/  frontend page logic
  routes/            admin.js, site.js
  views/admin/...    EJS admin panel templates
  views/site/...     EJS frontend templates
  seed/              first-admin bootstrap logic (shared by server + npm run seed)
public/
  css/, js/, uploads/ (uploaded images land here, served statically)
```

## Frontend routes

- `/` — home: logo + hotline (from config), category menu, "Hot News" (2
  articles with `isTopNews=true`, highest IDs first), one `status=1` main
  article, then a list of `status=0` articles.
- `/danh-muc/:slug` — paginated article list for one category.
- `/tin-tuc/:slug` — article detail. If the article has a linked TikTok
  product, a popup appears 2s after load showing the TikTok product's image;
  the article content is blurred until the popup's button is clicked. That
  click opens the `tiktokLink` in a new tab and only then reveals the article.

## Admin routes

All under `/admin`, protected by session auth except `/admin/login`:

- `/admin/login`, `/admin/change-password`
- `/admin/articles` (list/new/edit/delete)
- `/admin/categories` (list/new/edit/delete)
- `/admin/tiktok` (list/new/edit/delete)
- `/admin/config` (logo + hotline)

## Article body model

Each article stores its body as fixed alternating fields, matching the spec:
`bodyParagraph1`, `bodyImage1`, `bodyParagraph2`, `bodyImage2`,
`bodyParagraph3`. Body images can be uploaded as files or pasted as a URL.

## Notes / things to revisit before production

- Sessions use the default in-memory session store — fine for a single admin
  and low traffic, but sessions won't survive a server restart or scale across
  multiple processes. Swap in `connect-mongo` (already compatible with the
  Mongoose connection) if that becomes a problem.
- The TikTok gate is a UX dark pattern (content is hidden until the user
  clicks through to an external TikTok link). It's implemented as requested,
  but it will hurt read-through/SEO and frustrate users who don't use TikTok
  — worth reconsidering (e.g. let users dismiss the popup without following
  the link, and just track the click separately) before going live.
