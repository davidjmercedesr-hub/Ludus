# Ludus

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

#OS
