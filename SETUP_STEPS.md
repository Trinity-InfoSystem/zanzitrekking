# Complete Setup Steps for GitHub Actions

## Your Repository
- **GitHub URL**: `https://github.com/aliaoua/zanzitrekking-deployment.git`
- **SSH URL**: `git@github.com:aliaoua/zanzitrekking-deployment.git`

---

## ✅ Step 1: Push Code to GitHub

```bash
# In C:\Users\ali\Desktop\Deployment
git add .
git commit -m "Initial commit: Setup GitHub Actions for cPanel deployment"
git remote add origin https://github.com/aliaoua/zanzitrekking-deployment.git
git branch -M main
git push -u origin main
```

**If authentication fails:**
- Generate Personal Access Token: GitHub → Settings → Developer settings → Personal access tokens
- Use token as password when pushing

**Important:** Make sure your `.env` file is in `zanzitrekking-backend/` directory - it will be deployed automatically!

---

## ✅ Step 2: Configure GitHub Secrets

Go to: https://github.com/aliaoua/zanzitrekking-deployment/settings/secrets/actions

Click **"New repository secret"** and add:

### Required for FTP Deployment:

1. **CPANEL_FTP_HOST**
   - Value: `ftp.zanzisafaris.com` (or your FTP server IP)
   - Get from: cPanel → FTP Accounts → Your account → Host

2. **CPANEL_FTP_USERNAME**
   - Value: Your FTP username (e.g., `deploy`)
   - Get from: cPanel → FTP Accounts

3. **CPANEL_FTP_PASSWORD**
   - Value: Your FTP password
   - Get from: The password you set for FTP account

### Recommended for SSH (Better for Public Folder Sync):

4. **CPANEL_SSH_HOST**
   - Value: `ssh.zanzisafaris.com` or your server IP
   - Get from: cPanel → SSH Access

5. **CPANEL_SSH_USERNAME**
   - Value: Your cPanel username (usually `safariszanzico`)
   - Get from: cPanel → SSH Access

6. **CPANEL_SSH_KEY**
   - Value: Your SSH private key content
   - Generate: `ssh-keygen -t rsa -b 4096 -C "cpanel-deploy" -f ~/.ssh/cpanel_deploy`
   - Copy entire content of `~/.ssh/cpanel_deploy` (including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`)

7. **CPANEL_SSH_PORT** (Optional)
   - Value: `22` (default)
   - Only set if different

---

## ✅ Step 3: Set Up Backend Node.js in cPanel

1. Log into cPanel
2. Go to **"Node.js Selector"**
3. Click **"Create Application"**
4. Configure:
   - **Node.js Version**: `18.x`
   - **Application Root**: `/api.zanzisafaris.com`
   - **Application URL**: `https://api.zanzisafaris.com`
   - **Application Startup File**: `server.js`
5. Click **"Create"**

---

## ✅ Step 4: Cleanup Backend on cPanel (Delete All Except Public)

**⚠️ Important:** Before deploying, clean up the backend directory on cPanel to remove old files. Keep only the `public` folder with your images.

### Option A: Using GitHub Actions (Recommended - Requires SSH)

1. Go to: https://github.com/aliaoua/zanzitrekking-deployment/actions
2. Click **"Cleanup Backend on cPanel (Delete All Except Public)"**
3. Click **"Run workflow"**
4. Type **`DELETE`** in the confirmation field
5. Click **"Run workflow"**

This will automatically:
- Backup `public` folder
- Delete all files/folders except `public`
- Restore `public` folder
- Only `public` folder remains

### Option B: Manual Cleanup via cPanel File Manager

1. Log into cPanel → **File Manager**
2. Navigate to: `/home/safariszanzico/api.zanzisafaris.com/`
3. **Select all files and folders EXCEPT `public`**
4. Right-click → **Delete**
5. Verify only `public` folder remains

**Files to DELETE:**
- `server.js`, `package.json`, `.htaccess`, `.env`
- `controllers/`, `models/`, `routes/`, `utilities/`, etc.
- `node_modules/` (if exists)
- **Everything EXCEPT `public/` folder**

**Files to KEEP:**
- ✅ `public/` folder (with `uploads/`, `pdfs/`, `newsletter/`)

📚 **Detailed cleanup guide:** See `CLEANUP_BACKEND_STEPS.md`

---

## ✅ Step 5: Test Backend Deployment

1. Go to: https://github.com/aliaoua/zanzitrekking-deployment/actions
2. Click **"Deploy Backend to cPanel"**
3. Click **"Run workflow"** → **"Run workflow"**
4. Watch it execute
5. Check your API: `https://api.zanzisafaris.com/api/home`

**What gets deployed:**
- ✅ All code files (`server.js`, `controllers/`, `models/`, etc.)
- ✅ `.env` file (automatically included)
- ✅ `package.json` and dependencies
- ✅ `.htaccess` file
- ❌ `public` folder is excluded (your images stay safe!)

**After deployment:**
- Dependencies will be installed automatically (if SSH is configured)
- If not, install manually: `cd /home/safariszanzico/api.zanzisafaris.com && npm install --production`

---

## ✅ Step 6: Test Public Folder Sync (Pull)

1. Go to: https://github.com/aliaoua/zanzitrekking-deployment/actions
2. Click **"Sync Backend Public Folder from cPanel"**
3. Click **"Run workflow"**
4. Select **"pull"** from dropdown
5. Click **"Run workflow"**

This downloads latest images from cPanel and commits them to your repository.

**Requirements:** SSH secrets must be configured (see Step 2)

---

## ✅ Step 7: Test Frontend Deployment

1. Go to: https://github.com/aliaoua/zanzitrekking-deployment/actions
2. Click **"Deploy Frontend to cPanel"**
3. Click **"Run workflow"** → **"Run workflow"**
4. Check: `https://booking.zanzisafaris.com`

---

## ✅ Step 8: Test Dashboard Deployment

1. Go to: https://github.com/aliaoua/zanzitrekking-deployment/actions
2. Click **"Deploy Dashboard to cPanel"**
3. Click **"Run workflow"** → **"Run workflow"**
4. Check: `https://admin.zanzisafaris.com`

---

## 🎯 How It Works Now

### Automatic Deployment
- Push code to `main` branch` → GitHub Actions automatically deploys
- **Backend**: Deploys code (excludes `public` folder - images safe!)
- **Frontend**: Builds and deploys
- **Dashboard**: Builds and deploys

### Public Folder Handling
- ✅ **Deployment**: `public` folder is excluded (won't overwrite server images)
- ✅ **Sync Pull**: Download latest images from cPanel → Repository
- ✅ **Sync Push**: Upload images from repository → cPanel (rarely needed)

### Workflows Available

1. **Deploy Backend to cPanel**
   - Auto: When `zanzitrekking-backend/**` changes
   - Manual: Run from Actions tab
   - Includes: `.env` file (automatically deployed)
   - Excludes: `public` folder, `node_modules`

2. **Deploy Frontend to cPanel**
   - Auto: When `zanzitrekking-frontend/**` changes
   - Manual: Run from Actions tab
   - Builds: React app to production

3. **Deploy Dashboard to cPanel**
   - Auto: When `zanzitrekking-dashboard/**` changes
   - Manual: Run from Actions tab
   - Builds: React app to production

4. **Sync Backend Public Folder from cPanel**
   - Manual only
   - Options: `pull` (download from cPanel) or `push` (upload to cPanel)
   - Requires: SSH secrets configured

---

## 📚 Documentation Files

- **GITHUB_ACTIONS_SETUP.md** - Detailed GitHub Actions setup guide
- **SYNC_PUBLIC_FOLDER.md** - How to sync public folder
- **DEPLOYMENT.md** - Complete deployment guide
- **QUICK_START.md** - Quick 5-minute setup
- **SETUP_SUMMARY.md** - Overview of what's set up

---

## 🔐 Security Checklist

- [ ] Repository is Private
- [ ] All secrets configured in GitHub
- [ ] `.env` files not committed (already in `.gitignore`)
- [ ] SSH keys properly configured
- [ ] FTP credentials are secure

---

## ✨ You're Done!

After completing these steps:
- ✅ Code deploys automatically on push
- ✅ Public folder is protected (images won't be overwritten)
- ✅ You can sync images from cPanel anytime
- ✅ All three parts (backend, frontend, dashboard) deploy separately

**Next:** Just push code and it deploys automatically! 🚀
