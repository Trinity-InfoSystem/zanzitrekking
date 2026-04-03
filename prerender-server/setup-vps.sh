#!/usr/bin/env bash
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive

apt-get update
apt-get upgrade -y

apt-get install -y ca-certificates curl gnupg

curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

npm install -g pm2

apt-get install -y chromium-browser
export CHROME_PATH=/usr/bin/chromium-browser
echo "export CHROME_PATH=/usr/bin/chromium-browser" >> /etc/profile.d/chromium-prerender.sh
chmod +x /etc/profile.d/chromium-prerender.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
npm install

export CHROME_PATH=/usr/bin/chromium-browser
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "✅ Prerender server is running on port 3000"
