# GitHub Actions Workflows - What Each One Does

## ✅ All Workflows Are Needed - Don't Delete Any!

Each workflow serves a different purpose. Here's what each one does:

---

## 1. **deploy-backend.yml** - Deploy Backend Code
**Purpose:** Deploy your Node.js backend to cPanel

**When it runs:**
- Automatically when you push changes to `zanzitrekking-backend/**`
- Manually when you click "Run workflow"

**What it does:**
- Installs dependencies
- Deploys code files to `/api.zanzisafaris.com/`
- Excludes `public` folder (keeps your images safe)
- Includes `.env` file

**Required Secrets:**
- `CPANEL_FTP_HOST`
- `CPANEL_FTP_USERNAME`
- `CPANEL_FTP_PASSWORD`

---

## 2. **deploy-frontend.yml** - Deploy Frontend Website
**Purpose:** Build and deploy your React frontend to cPanel

**When it runs:**
- Automatically when you push changes to `zanzitrekking-frontend/**`
- Manually when you click "Run workflow"

**What it does:**
- Builds React app (`npm run build`)
- Deploys `dist/` folder to `/booking.zanzisafaris.com/`

**Required Secrets:**
- `CPANEL_FTP_HOST`
- `CPANEL_FTP_USERNAME`
- `CPANEL_FTP_PASSWORD`

---

## 3. **deploy-dashboard.yml** - Deploy Admin Dashboard
**Purpose:** Build and deploy your React admin dashboard to cPanel

**When it runs:**
- Automatically when you push changes to `zanzitrekking-dashboard/**`
- Manually when you click "Run workflow"

**What it does:**
- Builds React app (`npm run build`)
- Deploys `dist/` folder to `/admin.zanzisafaris.com/`

**Required Secrets:**
- `CPANEL_FTP_HOST`
- `CPANEL_FTP_USERNAME`
- `CPANEL_FTP_PASSWORD`

---

## 4. **sync-backend-public.yml** - Sync Public Folder (Images)
**Purpose:** Download or upload images from/to cPanel

**When it runs:**
- Manual only (click "Run workflow")

**What it does:**
- **Pull:** Download latest images from cPanel → Repository
- **Push:** Upload images from repository → cPanel (rarely needed)

**Required Secrets:**
- For Pull: SSH secrets (`CPANEL_SSH_HOST`, `CPANEL_SSH_USERNAME`, `CPANEL_SSH_KEY`)
- For Push: FTP secrets (same as above)

---

## 5. **cleanup-backend-cpanel.yml** - Clean Backend Directory
**Purpose:** Delete all files on cPanel except `public` folder

**When it runs:**
- Manual only (click "Run workflow")
- Requires typing `DELETE` to confirm

**What it does:**
- Backs up `public` folder
- Deletes all other files/folders
- Restores `public` folder
- Only `public` folder remains

**Required Secrets:**
- SSH secrets (recommended) OR manual cleanup via File Manager

---

## 🎯 Which Workflow to Use When?

### For Backend Deployment (Step 6):
👉 Use **"Deploy Backend to cPanel"** (`deploy-backend.yml`)

### For Frontend Deployment:
👉 Use **"Deploy Frontend to cPanel"** (`deploy-frontend.yml`)

### For Dashboard Deployment:
👉 Use **"Deploy Dashboard to cPanel"** (`deploy-dashboard.yml`)

### To Get Latest Images:
👉 Use **"Sync Backend Public Folder"** → Select "pull"

### To Clean Backend Before First Deploy:
👉 Use **"Cleanup Backend on cPanel"** → Type `DELETE`

---

## ❌ Why Workflows Are Failing

The workflows are failing because **GitHub Secrets are missing**!

### Required Secrets (Minimum):
1. `CPANEL_FTP_HOST` - Your FTP server address
2. `CPANEL_FTP_USERNAME` - Your FTP username
3. `CPANEL_FTP_PASSWORD` - Your FTP password

### How to Add Secrets:
1. Go to: https://github.com/aliaoua/zanzitrekking-deployment/settings/secrets/actions
2. Click **"New repository secret"**
3. Add each secret one by one
4. Save

---

## ✅ How to Fix "Successful but Nothing Happens"

If the workflow says "successful" but nothing deploys:

1. **Check if secrets are set:**
   - Go to Settings → Secrets and variables → Actions
   - Verify all 3 FTP secrets exist

2. **Check workflow logs:**
   - Click on the workflow run
   - Expand each step
   - Look for error messages

3. **Common issues:**
   - ❌ Secrets not configured → Add them
   - ❌ Wrong FTP credentials → Check in cPanel
   - ❌ FTP path wrong → Verify `/api.zanzisafaris.com/` exists
   - ❌ Connection timeout → Check FTP host/port

---

## 📋 Quick Checklist

- [ ] All 5 workflows exist (don't delete any!)
- [ ] FTP secrets configured (`CPANEL_FTP_HOST`, `CPANEL_FTP_USERNAME`, `CPANEL_FTP_PASSWORD`)
- [ ] SSH secrets configured (optional, for sync workflow)
- [ ] Test "Deploy Backend" workflow
- [ ] Check workflow logs for errors
- [ ] Verify files appear on cPanel

---

## 🆘 Troubleshooting

### "Workflow successful but no files deployed"
- Check FTP credentials in secrets
- Verify FTP path is correct
- Check cPanel File Manager to see if files arrived

### "FTP connection failed"
- Verify `CPANEL_FTP_HOST` is correct (try with/without `ftp.` prefix)
- Check FTP username/password
- Try connecting with FTP client to test credentials

### "Workflow fails immediately"
- Check if secrets are set
- Look at workflow logs for specific error
- Verify workflow file syntax is correct

---

## Summary

**Don't delete any workflows!** They all serve different purposes:
- 3 deployment workflows (backend, frontend, dashboard)
- 1 sync workflow (for images)
- 1 cleanup workflow (for initial setup)

**The issue:** Missing GitHub Secrets. Add them and workflows will work!
