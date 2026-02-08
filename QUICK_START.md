# Quick Start Guide - cPanel Deployment Setup

## 🚀 Quick Setup Steps

### 1. Create GitHub Repository (5 minutes)

1. Go to https://github.com/new
2. Repository name: `zanzitrekking-deployment`
3. Set to **Private** (recommended)
4. **DO NOT** check any initialization options
5. Click **"Create repository"**
6. Copy the repository URL

### 2. Push Code to GitHub (2 minutes)

```bash
# In your project root (C:\Users\ali\Desktop\Deployment)
git init
git add .
git commit -m "Initial commit: Zanzitrekking monorepo"
git remote add origin https://github.com/YOUR_USERNAME/zanzitrekking-deployment.git
git branch -M main
git push -u origin main
```

**If authentication fails:**
- Use Personal Access Token as password
- Generate token: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
- Select `repo` scope

### 3. Get cPanel FTP Credentials (3 minutes)

1. Log into cPanel
2. Go to **"FTP Accounts"**
3. Create new FTP account:
   - Username: `deploy`
   - Password: (create strong password)
   - Directory: `/home/safariszanzico/`
4. **Note down:**
   - FTP Host: (usually `ftp.zanzisafaris.com` or your server IP)
   - Username: `deploy`
   - Password: (the one you created)
   - Port: `21`

### 4. Add GitHub Secrets (5 minutes)

1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"** and add:

```
CPANEL_FTP_HOST = ftp.zanzisafaris.com (or your FTP host)
CPANEL_FTP_USERNAME = deploy (your FTP username)
CPANEL_FTP_PASSWORD = your_ftp_password
```

### 5. Verify cPanel Directories Exist

In cPanel File Manager, ensure these directories exist:
- `/home/safariszanzico/api.zanzisafaris.com/` (Backend)
- `/home/safariszanzico/booking.zanzisafaris.com/` (Frontend)
- `/home/safariszanzico/admin.zanzisafaris.com/` (Dashboard)

### 6. Set Up Backend Node.js (5 minutes)

1. In cPanel, go to **"Node.js Selector"**
2. Click **"Create Application"**
3. Configure:
   - **Node.js Version**: 18.x
   - **Application Root**: `/api.zanzisafaris.com`
   - **Application URL**: `https://api.zanzisafaris.com`
   - **Application Startup File**: `server.js`
4. Click **"Create"**

### 7. First Manual Backend Setup (via SSH or Terminal)

```bash
# Connect via SSH or use cPanel Terminal
cd /home/safariszanzico/api.zanzisafaris.com
npm install --production
```

### 8. Test Deployment (2 minutes)

1. Go to GitHub repo → **Actions** tab
2. Click **"Deploy Backend to cPanel"** workflow
3. Click **"Run workflow"** → **"Run workflow"**
4. Watch it deploy!

### 9. Deploy Frontend & Dashboard

The workflows will automatically deploy when you push changes, or you can trigger them manually from the Actions tab.

---

## ✅ Checklist

- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] FTP credentials obtained from cPanel
- [ ] GitHub Secrets configured
- [ ] cPanel directories verified
- [ ] Backend Node.js application created in cPanel
- [ ] Backend dependencies installed (first time)
- [ ] Test deployment successful

---

## 🎯 What Happens Next?

After setup:
- **Automatic**: Every push to `main` branch triggers deployment
- **Manual**: You can trigger workflows from GitHub Actions tab
- **Selective**: Only changed parts deploy (backend/frontend/dashboard)

---

## 📚 Full Documentation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions and troubleshooting.

---

## 🆘 Common Issues

**"FTP connection failed"**
- Check FTP host, username, and password in GitHub Secrets
- Verify FTP account is active in cPanel

**"Backend not starting"**
- Check Node.js version in cPanel (should be 18.x)
- Verify `server.js` exists in backend directory
- Check `.env` file has all required variables

**"Frontend/Dashboard not loading"**
- Verify `dist/` folder contents were deployed
- Check if `index.html` is in the root of the subdomain directory

---

## 🔐 Security Notes

- Never commit `.env` files
- Use GitHub Secrets for all sensitive data
- Keep FTP credentials secure
- Consider using SSH instead of FTP for better security
