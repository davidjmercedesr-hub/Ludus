# Ludus

Secure narrative-generation backend for the Ludus app. The OpenAI key is used only on the server and must never be placed in Flutter, source control, or a built client.

## Local backend

```bash
cd backend
cp .env.example .env
# Set OPENAI_API_KEY in .env (never commit it)
npm install
npm start
```

Verify the service:

```bash
curl http://localhost:3000/health
curl -X POST http://localhost:3000/narrative \
  -H 'Content-Type: application/json' \
  -d '{"role":"Warrior"}'
```

Run tests with `npm test`. The narrative endpoint returns `503` when the provider secret is not configured, rather than exposing or accepting a client-side key.

## Deploying

This repository includes a `Dockerfile` and `render.yaml`. Configure `OPENAI_API_KEY` and `ALLOWED_ORIGINS` as production secrets/environment variables in the hosting provider. Do not put them in GitHub, Flutter `--dart-define`, or the image source. After deployment, check `/health` and then make a real narrative request.

If a key was previously exposed, revoke it before creating the production secret.
