# Single-Port Deployment (Nginx Front Door)

This guide deploys all public traffic through one port (`443`) while keeping app ports private.

## Target topology

- Public: `https://your-domain.com` on `443`
- Private app ports:
  - API (NestJS): `127.0.0.1:5017`
  - Web (Next.js): `127.0.0.1:5018`
  - Admin (Vite build): static files under `/home/apps/checkravyuh/apps/admin/dist`

## Why this works

- Browser calls same-origin routes (`/api`) in production.
- Nginx proxies `/api/*` to API.
- Nginx proxies `/` to Next.js web server.
- Nginx serves `/admin` as static files.
- No internal port is exposed publicly.

## Production env values

Set these values in your deployment environment:

- Web: `NEXT_PUBLIC_API_BASE_URL=/api`
- Admin: `VITE_API_BASE_URL=/api`
- API: `PORT=5017`

## Build and run

```bash
# API
cd /home/apps/checkravyuh/apps/api
npm ci
npm run build
pm2 start dist/main.js --name checkravyuh-api

# Web
cd /home/apps/checkravyuh/apps/web
npm ci
npm run build
pm2 start "npm --workspace apps/web run start" --name checkravyuh-web --cwd /home/apps/checkravyuh

# Admin (static)
cd /home/apps/checkravyuh/apps/admin
npm ci
npm run build
```

## Nginx server block

Use a dedicated site file (for example `/etc/nginx/sites-available/checkravyuh`):

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;

    # Admin static build mounted under /admin
    location ^~ /admin/ {
        alias /home/apps/checkravyuh/apps/admin/dist/;
        try_files $uri $uri/ /admin/index.html;
    }

    # API proxy under /api
    # NOTE: trailing slash on proxy_pass strips "/api/" prefix before forwarding.
    location /api/ {
        proxy_pass http://127.0.0.1:5017/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Optional direct health route
    location = /health {
        proxy_pass http://127.0.0.1:5017/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Web app (Next.js)
    location / {
        proxy_pass http://127.0.0.1:5018;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/checkravyuh /etc/nginx/sites-enabled/checkravyuh
sudo nginx -t
sudo systemctl reload nginx
```

## SSL

After DNS is pointed and HTTP works:

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## Validation checklist

- `https://your-domain.com` opens learner web app.
- `https://your-domain.com/admin` opens admin app.
- `https://your-domain.com/api/catalog/preview` returns API JSON.
- `https://your-domain.com/health` returns API health.
- `pm2 status` shows API and web online.
