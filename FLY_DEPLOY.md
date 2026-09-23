# Fly.io deployment

## Prerequisites

Install `flyctl`, sign in with `fly auth login`, and make sure the Fly.io app name in `fly.toml` is available. Fly app names are globally unique; change `app = "ludus-backend"` if necessary.

## Create and deploy

From the repository root:

```bash
fly launch --no-deploy
fly secrets set OPENAI_API_KEY='YOUR_REPLACEMENT_KEY' ALLOWED_ORIGINS='https://YOUR-FRONTEND-ORIGIN'
fly deploy
```

Do not put the key in `fly.toml`, `.env`, GitHub, the Flutter repository, or the built app. Revoke any previously exposed key before setting its replacement.

## Verify

```bash
fly status
curl https://YOUR_FLY_APP.fly.dev/health
curl -X POST https://YOUR_FLY_APP.fly.dev/narrative \
  -H 'Content-Type: application/json' \
  -d '{"role":"Warrior"}'
```

The backend listens on port `3000`, and Fly's health check uses `/health`. Set `ALLOWED_ORIGINS` to the exact deployed web origin; for mobile-only clients, configure an appropriate value for the clients in use.

## Logs and rollback

```bash
fly logs
fly releases
fly deploy --image <known-good-image>
```
