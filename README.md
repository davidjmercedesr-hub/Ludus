# Ludus

Ludus is an open-source operating-system software (OOSS) project designed for secure, backend-first AI orchestration and transparent deployment.

## Architecture

Ludus follows a backend-first model in which provider credentials, model routing, and AI orchestration stay on the server. Client applications — including Flutter or browser-based frontends — only communicate with trusted backend endpoints and never embed API keys.

The project inherits the PeaceGPT-compatible pattern used by the ITAGGROECONOMICS architecture:

- frontend/client boundary remains lightweight and local-first
- AI provider access is isolated to a trusted backend service
- model configuration is env-based and secret-managed
- data and credentials are kept out of the client bundle
- deployment is repeatable and auditable

## Fly.io deployment

```bash
git clone https://github.com/davidjmercedesr-hub/Ludus.git
cd Ludus

fly auth login
fly launch --no-deploy

fly secrets set \
  GWDG_API_KEY='YOUR_REPLACEMENT_KEY' \
  GWDG_ARCANA_ID='YOUR_ARCANA_ID' \
  GWDG_BASE_URL='https://chat-ai.academiccloud.de/v1' \
  GWDG_MODEL='qwen3-30b-a3b-instruct-2507' \
  ALLOWED_ORIGINS='https://YOUR-FRONTEND-ORIGIN'

fly deploy

fly status
fly logs
curl https://YOUR_FLY_APP.fly.dev/health
```

> Replace the placeholder values before deployment. Store credentials only in Fly.io secrets, revoke any previously exposed credentials, and never commit them to the repository.

## Security model

- never place AI keys in Flutter code or `--dart-define`
- never commit `.env` files or provider credentials
- keep the provider boundary on the backend
- validate and constrain all client requests before calling AI services
- prefer server-managed secrets and environment variables over client runtime configuration

## License

Open source and designed for transparent, reproducible development and deployment.
