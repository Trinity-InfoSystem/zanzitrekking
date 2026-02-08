# Cleanup Backend on cPanel - Step by Step Guide

This guide will help you clean up the backend directory on cPanel, keeping only the `public` folder with all your images.

## ⚠️ Important Warning

**This will delete ALL files and folders except the `public` folder!**

Make sure you:
- ✅ Have a backup of your `.env` file (if it has important values)
- ✅ Have committed all code to GitHub
- ✅ Are ready to redeploy everything

---

## Method 1: Using GitHub Actions (Recommended - Requires SSH)

### Step 1: Run Cleanup Workflow

1. Go to: https://github.com/aliaoua/zanzitrekking-deployment/actions
2. Click **"Cleanup Backend on cPanel (Delete All Except Public)"**
3. Click **"Run workflow"**
4. In the confirmation field, type: **`DELETE`** (all caps)
5. Click **"Run workflow"**

**What it does:**
- Backs up `public` folder temporarily
- Deletes all files and folders except `public`
- Restores `public` folder
- Only `public` folder remains

**Requirements:**
- SSH secrets must be configured in GitHub

---

## Method 2: Manual Cleanup via cPanel File Manager

### Step 1: Log into cPanel

1. Log into your cPanel account
2. Go to **"File Manager"**

### Step 2: Navigate to Backend Directory

1. Navigate to: `/home/safariszanzico/api.zanzisafaris.com/`
2. You should see files like:
   - `server.js`
   - `package.json`
   - `controllers/`
   - `models/`
   - `public/` ← **KEEP THIS!**
   - etc.

### Step 3: Select Files to Delete

1. **Select all files and folders EXCEPT `public`**
   - Click on each file/folder while holding `Ctrl` (Windows) or `Cmd` (Mac)
   - OR select all, then deselect `public` folder
   
2. **Files to DELETE:**
   - `server.js`
   - `package.json`
   - `package-lock.json`
   - `.htaccess`
   - `.env` (if you want to redeploy it)
   - `controllers/`
   - `models/`
   - `routes/`
   - `utilities/`
   - `middlewares/`
   - `validators/`
   - `workers/`
   - `node_modules/` (if exists)
   - Any other folders/files
   - **BUT NOT `public/`**

3. **Files to KEEP:**
   - ✅ `public/` folder (with all subfolders: `uploads/`, `pdfs/`, `newsletter/`)

### Step 4: Delete Selected Files

1. Right-click on selected files
2. Click **"Delete"**
3. Confirm deletion
4. Verify only `public` folder remains

---

## Method 3: Manual Cleanup via SSH/Terminal

### Step 1: Connect via SSH

```bash
ssh safariszanzico@your-server.com
```

### Step 2: Navigate and Backup

```bash
cd /home/safariszanzico/api.zanzisafaris.com

# Backup public folder (safety measure)
cp -r public public_backup_$(date +%Y%m%d_%H%M%S)
```

### Step 3: Remove Everything Except Public

```bash
# Remove all files and folders except public
find . -maxdepth 1 ! -name '.' ! -name 'public' ! -name 'public_backup_*' -exec rm -rf {} +
```

### Step 4: Verify

```bash
# List remaining files
ls -la

# Should only show:
# . (current directory)
# .. (parent directory)
# public/ (your images folder)
# public_backup_* (backup folder - can delete this later)
```

### Step 5: Clean Up Backup (Optional)

```bash
# Remove backup folder if everything looks good
rm -rf public_backup_*
```

---

## Method 4: Using FTP Client

### Step 1: Connect via FTP

1. Open FTP client (FileZilla, WinSCP, etc.)
2. Connect to your server
3. Navigate to: `/api.zanzisafaris.com/`

### Step 2: Delete Files

1. Select all files and folders
2. **Deselect `public` folder** (important!)
3. Delete selected items
4. Verify only `public` remains

---

## After Cleanup - Next Steps

### Step 1: Verify Public Folder

Make sure `public` folder still contains:
- `public/uploads/` - All your images
- `public/pdfs/` - PDF files
- `public/newsletter/` - Newsletter files

### Step 2: Deploy Backend

1. Go to: https://github.com/aliaoua/zanzitrekking-deployment/actions
2. Click **"Deploy Backend to cPanel"**
3. Click **"Run workflow"** → **"Run workflow"**

This will:
- Deploy all code files
- Deploy `.env` file
- Install dependencies
- **Keep `public` folder untouched**

### Step 3: Install Dependencies (if needed)

If the deployment doesn't install dependencies automatically:

```bash
# Via SSH
cd /home/safariszanzico/api.zanzisafaris.com
npm install --production
```

### Step 4: Restart Application

```bash
# Via SSH - restart Passenger
touch /home/safariszanzico/api.zanzisafaris.com/tmp/restart.txt

# OR via cPanel Node.js Selector
# Go to Node.js Selector → Your app → Restart
```

### Step 5: Verify

1. Check API: `https://api.zanzisafaris.com/api/home`
2. Verify images still work: `https://api.zanzisafaris.com/public/uploads/`
3. Check application logs if needed

---

## Checklist

Before cleanup:
- [ ] Code is committed to GitHub
- [ ] `.env` file is in repository (or backed up)
- [ ] You have access to cPanel/SSH
- [ ] You understand what will be deleted

During cleanup:
- [ ] Only `public` folder is kept
- [ ] All other files/folders are deleted
- [ ] `public` folder contents are intact

After cleanup:
- [ ] Deploy backend via GitHub Actions
- [ ] Verify dependencies are installed
- [ ] Restart application
- [ ] Test API endpoints
- [ ] Verify images are accessible

---

## Troubleshooting

### "Public folder was deleted"

If you accidentally deleted `public` folder:
1. Check if you have a backup
2. Restore from backup if available
3. If no backup, you'll need to re-upload images

### "Application not starting"

1. Check if `.env` file exists
2. Verify Node.js application is configured in cPanel
3. Check dependencies: `npm install --production`
4. Review error logs in cPanel

### "Images not loading"

1. Verify `public` folder exists
2. Check file permissions: `chmod -R 755 public/`
3. Verify `.htaccess` allows access to public folder

---

## Quick Reference

**Cleanup Methods:**
1. GitHub Actions (requires SSH) - Easiest
2. cPanel File Manager - Visual, safe
3. SSH/Terminal - Fast, command-line
4. FTP Client - Familiar interface

**After Cleanup:**
- Deploy backend via GitHub Actions
- `.env` will be deployed automatically
- `public` folder stays untouched
- Dependencies will be installed

---

## Safety Tips

1. ✅ **Always backup `public` folder** before cleanup
2. ✅ **Verify `public` folder exists** after cleanup
3. ✅ **Test deployment** before going live
4. ✅ **Keep `.env` in repository** (now included in deployment)
5. ✅ **Document your `.env` variables** (backup)

---

## Summary

1. **Cleanup**: Delete all files except `public` folder
2. **Deploy**: Run GitHub Actions deployment
3. **Verify**: Check API and images work
4. **Done**: Your backend is clean and redeployed!
