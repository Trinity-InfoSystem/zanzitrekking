# Prerender server (self-hosted)

Headless Chrome prerender service for the Vite/React SPA. **Normal visitors** hit static files on cPanel; **crawlers** are proxied here from Apache (`.htaccess`) so they receive fully rendered HTML.

Uses the [`prerender`](https://www.npmjs.com/package/prerender) npm package. The app signals readiness with `window.prerenderReady` (see frontend `tripReducer` + `main.jsx`).

## Prerequisites

- Ubuntu 24.04 (or similar) VPS with a public IP  
- Firewall: allow inbound **TCP 3000** (or whatever `PORT` you use) from your **cPanel origin IP** only, if possible — not the whole internet.  
- Chromium: `CHROME_PATH` must point to the Chromium/Chrome binary (set in `setup-vps.sh`).

## Local testing

Point the prerender server at your **Vite dev** origin so Chrome loads `http://localhost:5173`:

```bash
cd prerender-server
export CHROME_PATH=/path/to/chrome   # optional on Windows/macOS if auto-detect fails
export PORT=3000
npm install
npm start
```

Request format (same as production):

```bash
curl "http://localhost:3000/http://localhost:5173/trips"
```

Your **middleware / .htaccess** in production uses `https://yourdomain.com/...` instead of `localhost`.

## Deploy to the VPS

### 1. Upload this folder

From your machine (replace user and server IP):

```bash
scp -r prerender-server/ user@YOUR_VPS_IP:/home/user/prerender-server
```

### 2. Run the setup script (once)

```bash
ssh user@YOUR_VPS_IP
chmod +x /home/user/prerender-server/setup-vps.sh
cd /home/user/prerender-server
./setup-vps.sh
```

If `chromium-browser` is not available on your distro, install `chromium` and set `CHROME_PATH` to the real binary (e.g. `/usr/bin/chromium`).

### 3. Hetzner Cloud firewall

In the [Hetzner Cloud Console](https://console.hetzner.cloud/) → your server → **Firewalls** (or server firewall tab):

- Add inbound rule: **TCP port 3000**, source **your cPanel hosting IP** (or the IP that runs Apache in front of the site).  
- Do **not** expose 3000 to `0.0.0.0/0` unless you add another layer of auth.

### 4. Align Apache with this service

On cPanel, set `.htaccess` placeholders:

- `# REPLACE YOUR_VPS_IP` → your Hetzner VPS public IP  
- `# REPLACE yourdomain.com` → production hostname (no `https://` in the placeholder — the template uses `https://yourdomain.com` in the proxy URL)

### 5. Whitelist paths

Allowed URL paths are defined in `plugins/pathWhitelist.js` and must match `.htaccess`.  

**Important:** The React app uses **`/about-us`** and **`/contact-us`**, while the default whitelist uses **`/about`** and **`/contact`**. If you need those pages prerendered, add the real paths in **both** places.

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `3000` | HTTP listen port |
| `CHROME_PATH` | OS default | Path to Chromium/Chrome |
| `PAGE_LOAD_TIMEOUT` | `20000` | Page load timeout (ms); set before `require('prerender')` in `server.js` |
| `PRERENDER_NUM_WORKERS` | `2` | Documented for parity with older prerender; v5 uses a single Chrome — safe to ignore if unused |

## PM2

```bash
pm2 status
pm2 logs prerender
pm2 restart prerender
```

Config: `ecosystem.config.js` (app name `prerender`).
