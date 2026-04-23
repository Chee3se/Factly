<p align="center">
  <img src="./public/factly-logo-v2-white.png" width="110" alt="Factly">
</p>

<h1 align="center">Factly</h1>

<p align="center">
  Real-time party minigames you can play with friends in the browser.
</p>

<p align="center">
  <a href="https://factly.space">factly.space</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/PHP-8.3-777BB4?style=for-the-badge&logo=php&logoColor=white" alt="PHP 8.3">
  <img src="https://img.shields.io/badge/Laravel-12-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel 12">
  <img src="https://img.shields.io/badge/Inertia-2-9553E9?style=for-the-badge&logo=inertia&logoColor=white" alt="Inertia 2">
  <img src="https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind 4">
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 7">
  <img src="https://img.shields.io/badge/Pusher-300D4F?style=for-the-badge&logo=pusher&logoColor=white" alt="Pusher">
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite">
</p>

---

## Overview

Factly is a Laravel + Inertia/React app for playing short multiplayer minigames with friends. Lobbies, invites, chat, scoring and leaderboards are all realtime over Pusher. The client is a single React SPA served via Inertia; the server is a regular Laravel monolith with session auth.

### Games

| Slug             | Type    | Summary                                                              |
| ---------------- | ------- | -------------------------------------------------------------------- |
| `higher-or-lower`| Single  | Guess which item has the higher/lower value.                         |
| `quiz-ladder`    | Multi   | Climb a ladder by answering trivia; first to the top wins.           |
| `impact-auction` | Multi   | Bid on items with hidden impact scores; best-scoring hand wins.      |
| `factually`      | Single  | Sort claims as fact or fiction.                                      |
| `curators-test`  | Single  | AI-powered gallery challenge (OpenAI-compatible endpoint).           |

---

## Tech stack

**Backend** &mdash; PHP 8.3, Laravel 12, Pest 4, Pusher, Socialite (Google), Sanctum, Ziggy, Brevo SMTP.
**Frontend** &mdash; React 19, Inertia 2, TypeScript 5, Tailwind 4, Radix primitives, laravel-echo + pusher-js.
**Infra** &mdash; SQLite in dev, database-backed sessions/cache/queue, Vite 7 build.

---

## Prerequisites

- PHP **8.3+** with the usual extensions (`pdo_sqlite`, `mbstring`, `curl`, `gd`)
- Composer 2
- Node **20+** and npm
- A Pusher app (free tier works) &mdash; only needed for realtime features in dev

---

## Setup

```bash
# 1. clone
git clone https://github.com/Chee3se/factly.git
cd factly

# 2. install deps
composer install
npm install

# 3. env
cp .env.example .env
php artisan key:generate

# 4. database (sqlite by default)
php artisan migrate --seed

# 5. storage symlink (avatar uploads)
php artisan storage:link
```

### Environment variables

Minimum you'll want set in `.env` for a working dev build:

```dotenv
APP_URL=http://127.0.0.1:8000

# admin user is seeded with this password
ADMIN_PASSWORD=change-me

# pusher (realtime lobbies, invites, chat)
BROADCAST_CONNECTION=pusher
PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_APP_CLUSTER=eu

VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"

# google oauth (optional, only needed for "Sign in with Google")
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URL=http://127.0.0.1:8000/auth/google/callback

# curator's test AI (optional, any OpenAI-compatible endpoint)
OPEN_AI_URL=
OPEN_AI_KEY=
OPEN_AI_MODEL_ID=
```

If `BROADCAST_CONNECTION=log` (the default), events are written to `storage/logs/laravel.log` instead of broadcast &mdash; the app still works, but realtime lobby/invite/chat updates won't fire.

---

## Running it

Two terminals:

```bash
# terminal 1 &mdash; Laravel app
php artisan serve

# terminal 2 &mdash; Vite dev server / HMR
npm run dev
```

Open http://127.0.0.1:8000.

Default admin login after seeding:

```
email:    admin@example.com
password: $ADMIN_PASSWORD
```

### Production build

```bash
npm run build
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## Common commands

```bash
php artisan migrate            # apply new migrations
php artisan db:seed             # reseed data (see note below)
php artisan route:list          # inspect routes
php artisan tinker              # REPL
./vendor/bin/pest               # run tests
./vendor/bin/pint               # format PHP
```

> `db:seed` wipes `storage/app/public/avatars/` &mdash; don't run it against a populated prod db.

---

## Project layout

```
app/
  Events/                 broadcast events (lobby, friend, chat)
  Http/Controllers/       thin controllers, inline validation
  Http/Middleware/        admin, lobby, inertia share
  Models/                 User, Game, Lobby, Score, Friend, ...
  Notifications/          VerifyEmail
database/
  migrations/             schema
  seeders/                per-game seeders + DatabaseSeeder
resources/
  js/                     react/inertia SPA (pages, components, hooks)
  views/app.blade.php     single inertia root template
  views/emails/           transactional email templates
routes/
  web.php                 all user-facing + API routes (api.php is unused)
  channels.php            broadcast channel auth
tests/
  Feature/                pest feature tests
```

---

## License

MIT.
