# Updated Setup Steps - Complete Guide

## Your Repository
- **GitHub URL**: `https://github.com/aliaoua/zanzitrekking-deployment.git`
- **SSH URL**: `git@github.com:aliaoua/zanzitrekking-deployment.git`

---

## ✅ Step 1: Push Code to GitHub (DONE ✅)

You've already completed this step! Your code is on GitHub.

**Next:** Make sure your `.env` file is in `zanzitrekking-backend/` directory - it will be deployed automatically!

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

### Recommended for SSH (Better for Public Folder Sync & Cleanup):

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
3. Click **"Create Application"** (or edit existing)
4. Configure:
   - **Node.js Version**: `18.x`
   - **Application Root**: `/api.zanzisafaris.com`
   - **Application URL**: `https://api.zanzisafaris.com`
   - **Application Startup File**: `server.js`
5. Click **"Create"** (or **"Save"**)

---

## ✅ Step 4: Cleanup Backend on cPanel (IMPORTANT!)

**⚠️ Before deploying, you need to clean up the backend directory on cPanel.**

**Goal:** Delete ALL files and folders EXCEPT the `public` folder (which contains your images).

### Method 1: Using GitHub Actions (Easiest - Requires SSH)

1. Go to: https://github.com/aliaoua/zanzitrekking-deployment/actions
2. Click **"Cleanup Backend on cPanel (Delete All Except Public)"**
3. Click **"Run workflow"**
4. In the confirmation field, type: **`DELETE`** (all caps, exactly)
5. Click **"Run workflow"**

**What it does:**
- ✅ Backs up `public` folder temporarily
- ✅ Deletes all files/folders except `public`
- ✅ Restores `public` folder
- ✅ Only `public` folder remains

### Method 2: Manual Cleanup via cPanel File Manager

1. Log into cPanel
2. Go to **"File Manager"**
3. Navigate to: `/home/safariszanzico/api.zanzisafaris.com/`
4. **Select all files and folders EXCEPT `public`**
   - Hold `Ctrl` (Windows) or `Cmd` (Mac) and click each item
   - OR select all, then deselect `public` folder
5. Right-click → **"Delete"**
6. Confirm deletion
7. **Verify:** Only `public` folder should remain

**Files to DELETE:**
- `server.js`
- `package.json`
- `package-lock.json`
- `.htaccess`
- `.env` (will be redeployed)
- `controllers/`
- `models/`
- `routes/`
- `utilities/`
- `middlewares/`
- `validators/`
- `workers/`
- `node_modules/` (if exists)
- Any other files/folders

**Files to KEEP:**
- ✅ `public/` folder (with all subfolders: `uploads/`, `pdfs/`, `newsletter/`)

📚 **Detailed guide:** See `CLEANUP_BACKEND_STEPS.md`

---

## ✅ Step 5: Ensure .env File is in Repository

**Important:** The `.env` file will be deployed automatically!

1. Check if `.env` exists in `zanzitrekking-backend/` directory locally
2. If it doesn't exist, create it with all required environment variables
3. Commit it to repository:

```bash
cd C:\Users\ali\Desktop\Deployment
git add zanzitrekking-backend/.env
git commit -m "Add .env file for deployment"
git push origin main
```

**Note:** `.env` is now included in deployment (no longer excluded).

---

## ✅ Step 6: Deploy Backend

1. Go to: https://github.com/aliaoua/zanzitrekking-deployment/actions
2. Click **"Deploy Backend to cPanel"**
3. Click **"Run workflow"** → **"Run workflow"**
4. Watch it execute

**What gets deployed:**
- ✅ All code files (`server.js`, `controllers/`, `models/`, `routes/`, etc.)
- ✅ `.env` file (automatically included)
- ✅ `package.json`
- ✅ `.htaccess` file
- ❌ `public` folder is excluded (your images stay safe!)

**After deployment:**
- If SSH is configured: Dependencies install automatically
- If not: Install manually (see Step 7)

---

## ✅ Step 7: Install Dependencies (If Not Automatic)

If the deployment doesn't install dependencies automatically:

### Via SSH:
```bash
ssh safariszanzico@your-server.com
cd /home/safariszanzico/api.zanzisafaris.com
npm install --production
```

### Via cPanel Terminal:
1. Go to cPanel → **Terminal**
2. Run:
   ```bash
   cd /home/safariszanzico/api.zanzisafaris.com
   npm install --production
   ```

---

## ✅ Step 8: Restart Application

### Via SSH:
```bash
touch /home/safariszanzico/api.zanzisafaris.com/tmp/restart.txt
```

### Via cPanel:
1. Go to **Node.js Selector**
2. Find your application
3. Click **"Restart"**

---

## ✅ Step 9: Verify Deployment

1. **Check API:** `https://api.zanzisafaris.com/api/home`
2. **Check images:** `https://api.zanzisafaris.com/public/uploads/` (should show your images)
3. **Check logs:** cPanel → Node.js Selector → View Logs (if errors)

---

## ✅ Step 10: Test Public Folder Sync (Pull Images)

1. Go to: https://github.com/aliaoua/zanzitrekking-deployment/actions
2. Click **"Sync Backend Public Folder from cPanel"**
3. Click **"Run workflow"**
4. Select **"pull"** from dropdown
5. Click **"Run workflow"**

This downloads latest images from cPanel and commits them to your repository.

**Requirements:** SSH secrets must be configured (see Step 2)

---

## ✅ Step 11: Test Frontend Deployment

1. Go to: https://github.com/aliaoua/zanzitrekking-deployment/actions
2. Click **"Deploy Frontend to cPanel"**
3. Click **"Run workflow"** → **"Run workflow"**
4. Check: `https://booking.zanzisafaris.com`

---

## ✅ Step 12: Test Dashboard Deployment

1. Go to: https://github.com/aliaoua/zanzitrekking-deployment/actions
2. Click **"Deploy Dashboard to cPanel"**
3. Click **"Run workflow"** → **"Run workflow"**
4. Check: `https://admin.zanzisafaris.com`

---

## 🎯 Summary of Changes

### What's New:

1. ✅ **`.env` file is now deployed** - No longer excluded!
2. ✅ **Cleanup workflow added** - Easy way to clean backend on cPanel
3. ✅ **Public folder protected** - Still excluded from deployment
4. ✅ **Automatic dependency installation** - If SSH is configured

### Workflow Overview:

1. **Cleanup Backend** (Step 4) - Delete all except `public`
2. **Deploy Backend** (Step 6) - Deploy code + `.env`
3. **Install Dependencies** (Step 7) - If not automatic
4. **Restart** (Step 8) - Restart application
5. **Verify** (Step 9) - Test everything works

---

## 📚 Documentation Files

- **SETUP_STEPS.md** - Original setup steps
- **UPDATED_SETUP_STEPS.md** - This file (updated with cleanup)
- **CLEANUP_BACKEND_STEPS.md** - Detailed cleanup guide
- **GITHUB_ACTIONS_SETUP.md** - Complete GitHub Actions setup
- **SYNC_PUBLIC_FOLDER.md** - Public folder sync guide

---

## 🔐 Security Notes

- ✅ `.env` is now in repository (make sure it's correct)
- ✅ Repository should be Private
- ✅ Use SSH instead of FTP when possible
- ✅ Rotate credentials regularly

---

## ✨ You're Ready!

After completing these steps:
- ✅ Backend is clean and ready
- ✅ `.env` will be deployed automatically
- ✅ Public folder is protected
- ✅ Everything deploys automatically on push

**Next:** Just push code and it deploys! 🚀
