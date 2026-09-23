# Ludus Release Checklist

## Production deployment

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
```

## Verify production app

```bash
curl https://YOUR_FLY_APP.fly.dev/health
curl -X POST https://YOUR_FLY_APP.fly.dev/narrative \
  -H "Content-Type: application/json" \
  -d '{"role":"Warrior"}'
curl -X POST https://YOUR_FLY_APP.fly.dev/api/assistant \
  -H "Content-Type: application/json" \
  -d '{"message":"Describe a peaceful opening scene","contextPack":{}}'
```

Expected results:
- health returns `200` with `{"status":"ok"...}`
- narrative returns JSON with a narrative string
- assistant returns JSON with a text or response payload

## Release notes

```text
Ludus v2.0.0

- backend-first AI architecture
- secure GWDG Arcana integration
- Fly.io deployment
- production health checks passed
- provider credentials kept in server secrets only
- previously exposed credentials revoked
- frontend never stores or embeds provider keys
- backend validates all requests before calling the AI provider
```

## Create tag and GitHub release

```bash
git checkout main
git pull origin main
git tag v2.0.0
git push origin v2.0.0

gh release create v2.0.0 \
  --title "Ludus v2.0.0" \
  --notes "Ludus v2.0.0

- backend-first AI architecture
- secure GWDG Arcana integration
- Fly.io deployment
- production health checks passed
- provider credentials kept in server secrets only
- previously exposed credentials revoked
- frontend never stores or embeds provider keys
- backend validates all requests before calling the AI provider"
```

If `gh` is not available, create the release in the GitHub web UI using the same notes.

## Final warning

Do not publish the release until:
- the backend health check returns `200`
- the narrative endpoint works
- the provider secret is not present in source or app bundle
- any previously exposed key has been revoked
