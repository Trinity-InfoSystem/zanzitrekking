# Sync Public Folder - Pull Latest Images from cPanel

## 🎯 Goal: Get Latest Images from cPanel → Repository

You want to pull the latest `public` folder (with all uploaded images) from cPanel to your local repository.

---

## ✅ Step-by-Step: Sync Public Folder

### Step 1: Go to GitHub Actions

1. Go to: https://github.com/aliaoua/zanzitrekking-deployment/actions
2. Click **"Sync Backend Public Folder from cPanel"** (left sidebar)

### Step 2: Run the Workflow

1. Click **"Run workflow"** button (top right)
2. In the dropdown, select: **"pull"** (this downloads from cPanel)
3. Click **"Run workflow"** (green button)

### Step 3: Watch It Sync

The workflow will:
1. Connect to cPanel via SSH (or show instructions if SSH not configured)
2. Download the `public` folder from `/home/safariszanzico/api.zanzisafaris.com/public/`
3. Commit the changes to your repository
4. Push to GitHub

### Step 4: Pull to Local

After the workflow completes:

```bash
cd C:\Users\ali\Desktop\Deployment
git pull origin main
```

This will download the latest images to your local repository.

---

## ⚠️ Important: SSH Secrets Required

The sync workflow requires SSH secrets to pull from cPanel.

**Required secrets:**
- `CPANEL_SSH_HOST`
- `CPANEL_SSH_USERNAME`
- `CPANEL_SSH_KEY`
- `CPANEL_SSH_PORT` (optional, default 22)

**If SSH secrets are not configured:**
- The workflow will show instructions
- You'll need to use manual FTP method (see below)

---

## 🔧 Alternative: Manual Sync via FTP

If SSH is not configured, you can sync manually:

### Step 1: Download via FTP Client

1. Open FTP client (FileZilla, WinSCP, etc.)
2. Connect to:
   - Host: `ftp.zanzisafaris.com`
   - Username: `safariszanzico`
   - Password: `*2024@ZanSaF#66`
   - Port: `21`

3. Navigate to: `/api.zanzisafaris.com/public/`
4. Download entire `public` folder to: `C:\Users\ali\Desktop\Deployment\zanzitrekking-backend\public\`

### Step 2: Commit Changes

```bash
cd C:\Users\ali\Desktop\Deployment
git add zanzitrekking-backend/public/
git commit -m "Sync: Pull latest public folder from cPanel"
git push origin main
```

---

## ✅ What Gets Synced

The sync will pull:
- `public/uploads/` - All uploaded images
- `public/pdfs/` - PDF files
- `public/newsletter/` - Newsletter files

**Note:** `.gitkeep` files are preserved, but actual image files are ignored by git (they're in `.gitignore`). However, the sync workflow will commit them.

---

## 🎯 Quick Steps Summary

1. **GitHub Actions** → "Sync Backend Public Folder from cPanel"
2. **Run workflow** → Select **"pull"**
3. **Wait for completion**
4. **Pull to local:** `git pull origin main`

---

## 🆘 If Sync Fails

**Check workflow logs:**
- Click on the failed run
- Expand the failed step
- Read error message

**Common issues:**
- SSH secrets not configured → Add them or use manual FTP
- SSH connection failed → Check SSH credentials
- Path not found → Verify public folder exists on server

---

**Ready to sync? Go to GitHub Actions and run the sync workflow with "pull" option!** 🚀
