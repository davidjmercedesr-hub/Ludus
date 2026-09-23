# Ludus

Ludus is built on the PeaceGPT-compatible architecture from [ITAGGROECONOMICS](https://github.com/davidjmercedesr-hub/ITAGGROECONOMICS): an offline/local-first client boundary with a trusted backend AI adapter. The client never receives provider credentials.

## Architecture

```text
Flutter / React / Capacitor client
        │  HTTPS: /api/assistant or /narrative
        ▼
Ludus Node backend
        │  GWDG OpenAI-compatible gateway + Arcana context
        ▼
GWDG AI / RAG provider
```

The backend uses the GWDG Arcana adapter by default and supports the same provider settings as the source project:

- `GWDG_API_KEY`
- `GWDG_ARCANA_ID`
- `GWDG_BASE_URL`
- `GWDG_MODEL`

## Local run

```bash
cd backend
cp .env.example .env
# Set secrets in .env or your shell; never commit .env
npm install
npm start
```

Check the service:

```bash
curl http://localhost:3000/health
curl -X POST http://localhost:3000/api/assistant \
  -H 'Content-Type: application/json' \
  -d '{"message":"Describe a peaceful opening scene","contextPack":{}}'
```

`POST /narrative` remains available for the original Ludus client contract and maps a `role` into an assistant request.

## Fly.io

Fly terminates public HTTPS, so the container serves plain HTTP on port 3000. Set secrets with Fly rather than committing them:

```bash
fly secrets set GWDG_API_KEY='YOUR_KEY' GWDG_ARCANA_ID='YOUR_ARCANA_ID' \
  GWDG_BASE_URL='https://chat-ai.academiccloud.de/v1' \
  GWDG_MODEL='qwen3-30b-a3b-instruct-2507' \
  ALLOWED_ORIGINS='https://YOUR-FRONTEND-ORIGIN'
fly deploy
```

Revoke any previously exposed credential before setting its replacement. Do not place provider keys in Flutter, `--dart-define`, or the built app.
