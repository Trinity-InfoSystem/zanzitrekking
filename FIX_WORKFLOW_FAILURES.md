# Fix Workflow Failures - Quick Guide

## ❌ Problem: Workflows Show "Failure" or "Successful but Nothing Happens"

### Root Cause: Missing GitHub Secrets

The workflows need FTP credentials to deploy. If secrets are missing, workflows will fail.

---

## ✅ Solution: Add GitHub Secrets

### Step 1: Get FTP Credentials from cPanel

1. Log into cPanel
2. Go to **"FTP Accounts"**
3. Find your FTP account (or create one)
4. Note down:
   - **FTP Host:** Usually `ftp.zanzisafaris.com` or your server IP
   - **FTP Username:** Your FTP username
   - **FTP Password:** Your FTP password

### Step 2: Add Secrets to GitHub

1. Go to: https://github.com/aliaoua/zanzitrekking-deployment/settings/secrets/actions
2. Click **"New repository secret"**
3. Add these 3 secrets:

   **Secret 1:**
   - Name: `CPANEL_FTP_HOST`
   - Value: `ftp.zanzisafaris.com` (or your FTP host)
   - Click **"Add secret"**

   **Secret 2:**
   - Name: `CPANEL_FTP_USERNAME`
   - Value: Your FTP username
   - Click **"Add secret"**

   **Secret 3:**
   - Name: `CPANEL_FTP_PASSWORD`
   - Value: Your FTP password
   - Click **"Add secret"**

### Step 3: Test the Workflow

1. Go to: https://github.com/aliaoua/zanzitrekking-deployment/actions
2. Click **"Deploy Backend to cPanel"**
3. Click **"Run workflow"** → **"Run workflow"**
4. Watch the logs - it should now show:
   - ✅ "FTP secrets are configured"
   - ✅ Files being uploaded
   - ✅ "Backend deployed successfully"

---

## 🔍 How to Check if Secrets Are Set

1. Go to: https://github.com/aliaoua/zanzitrekking-deployment/settings/secrets/actions
2. You should see:
   - ✅ `CPANEL_FTP_HOST`
   - ✅ `CPANEL_FTP_USERNAME`
   - ✅ `CPANEL_FTP_PASSWORD`

If any are missing, add them!

---

## 📋 What Each Workflow Needs

### Deploy Backend:
- ✅ `CPANEL_FTP_HOST`
- ✅ `CPANEL_FTP_USERNAME`
- ✅ `CPANEL_FTP_PASSWORD`

### Deploy Frontend:
- ✅ `CPANEL_FTP_HOST`
- ✅ `CPANEL_FTP_USERNAME`
- ✅ `CPANEL_FTP_PASSWORD`

### Deploy Dashboard:
- ✅ `CPANEL_FTP_HOST`
- ✅ `CPANEL_FTP_USERNAME`
- ✅ `CPANEL_FTP_PASSWORD`

### Sync Public Folder:
- ✅ FTP secrets (for push)
- ✅ SSH secrets (for pull - optional)

### Cleanup Backend:
- ✅ SSH secrets (recommended)
- OR manual cleanup via File Manager

---

## 🎯 Quick Fix Steps

1. **Get FTP credentials** from cPanel
2. **Add 3 secrets** to GitHub (see Step 2 above)
3. **Run workflow** again
4. **Check logs** - should see files uploading
5. **Verify on cPanel** - files should appear in `/api.zanzisafaris.com/`

---

## 🆘 Still Not Working?

### Check Workflow Logs:

1. Click on the failed workflow run
2. Expand each step
3. Look for error messages like:
   - "FTP connection failed"
   - "Authentication failed"
   - "Path not found"

### Common Issues:

**"FTP connection failed"**
- Check `CPANEL_FTP_HOST` - try with/without `ftp.` prefix
- Try using server IP instead of hostname
- Check if FTP port is 21 (default)

**"Authentication failed"**
- Verify username/password are correct
- Check for typos
- Try connecting with FTP client to test

**"Path not found"**
- Verify `/api.zanzisafaris.com/` exists on server
- Check if path needs to be `/home/safariszanzico/api.zanzisafaris.com/`
- Create directory in cPanel if it doesn't exist

---

## ✅ Success Indicators

When workflow works correctly, you'll see:
- ✅ "FTP secrets are configured"
- ✅ "Deploying files..."
- ✅ "Uploaded X files"
- ✅ "Backend deployed successfully to cPanel"

And files will appear in cPanel File Manager at:
- `/home/safariszanzico/api.zanzisafaris.com/`

---

## 📝 Summary

**Problem:** Workflows failing because secrets are missing

**Solution:** Add 3 FTP secrets to GitHub

**Test:** Run workflow again and check logs

**Verify:** Check cPanel File Manager for deployed files

---

**Next:** Once secrets are added, workflows will work! 🚀
