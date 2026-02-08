# How to Sync Public Folder with cPanel

The `public` folder contains uploaded images, PDFs, and other files that are managed on the cPanel server. This guide explains how to sync these files.

## Important Notes

- ✅ **Deployment excludes `public` folder** - Your images on cPanel are safe and won't be overwritten
- ✅ **Pull from cPanel** - Get latest uploaded images to your repository
- ⚠️ **Push to cPanel** - Only use if you need to upload new images via git

---

## Method 1: GitHub Actions Workflow (Recommended)

### Pull Latest Images from cPanel

1. Go to GitHub repository: https://github.com/aliaoua/zanzitrekking-deployment
2. Click **"Actions"** tab
3. Click **"Sync Backend Public Folder from cPanel"**
4. Click **"Run workflow"**
5. Select **"pull"** from dropdown
6. Click **"Run workflow"**

**Requirements:**
- SSH secrets must be configured (`CPANEL_SSH_HOST`, `CPANEL_SSH_USERNAME`, `CPANEL_SSH_KEY`)
- If SSH is not available, see Method 2 below

**What happens:**
- Downloads `public` folder from cPanel
- Commits changes to repository
- Pushes to GitHub

### Push Images to cPanel (Rare - Usually Not Needed)

1. Go to GitHub → **Actions** tab
2. Click **"Sync Backend Public Folder from cPanel"**
3. Click **"Run workflow"**
4. Select **"push"** from dropdown
5. Click **"Run workflow"**

**Note:** This is rarely needed since images are usually uploaded directly via the application.

---

## Method 2: Manual FTP/SFTP Sync

If SSH is not available, use an FTP client:

### Pull from cPanel (Download Images)

1. **Connect via FTP Client** (FileZilla, WinSCP, etc.)
   - Host: `ftp.zanzisafaris.com` (or your FTP host)
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: `21` (FTP) or `22` (SFTP)

2. **Navigate to server:**
   - Remote: `/api.zanzisafaris.com/public/`

3. **Navigate to local:**
   - Local: `C:\Users\ali\Desktop\Deployment\zanzitrekking-backend\public\`

4. **Download files:**
   - Select all files in `public/uploads/`
   - Select all files in `public/pdfs/`
   - Select all files in `public/newsletter/`
   - Drag and drop to local directory

5. **Commit to git:**
   ```bash
   cd C:\Users\ali\Desktop\Deployment
   git add zanzitrekking-backend/public/
   git commit -m "Sync: Pull latest public folder from cPanel"
   git push
   ```

### Push to cPanel (Upload Images)

1. **Connect via FTP Client**
2. **Upload files:**
   - Local: `C:\Users\ali\Desktop\Deployment\zanzitrekking-backend\public\`
   - Remote: `/api.zanzisafaris.com/public/`
   - Drag and drop files to server

---

## Method 3: SSH Command Line

If you have SSH access:

### Pull from cPanel

```bash
# Connect via SSH
ssh safariszanzico@your-server.com

# Create a tar archive of public folder
cd /home/safariszanzico/api.zanzisafaris.com
tar -czf ~/public-backup.tar.gz public/

# Download to local (from your local machine)
scp safariszanzico@your-server.com:~/public-backup.tar.gz ./

# Extract locally
cd C:\Users\ali\Desktop\Deployment\zanzitrekking-backend
tar -xzf ../../public-backup.tar.gz

# Commit changes
cd ../..
git add zanzitrekking-backend/public/
git commit -m "Sync: Pull latest public folder from cPanel"
git push
```

### Push to cPanel

```bash
# Create tar archive locally
cd C:\Users\ali\Desktop\Deployment\zanzitrekking-backend
tar -czf ../public-upload.tar.gz public/

# Upload to server
scp ../public-upload.tar.gz safariszanzico@your-server.com:~/

# Extract on server (via SSH)
ssh safariszanzico@your-server.com
cd /home/safariszanzico/api.zanzisafaris.com
tar -xzf ~/public-upload.tar.gz
rm ~/public-upload.tar.gz
```

---

## When to Sync

### Pull from cPanel (Most Common)

Do this when:
- ✅ You want to backup production images
- ✅ You need latest images for local development
- ✅ You want to keep repository in sync with production
- ✅ After bulk image uploads on production

### Push to cPanel (Rare)

Only do this when:
- ⚠️ You have new images in repository that need to be on server
- ⚠️ You're restoring from backup
- ⚠️ You're doing initial setup

**Note:** Usually images are uploaded directly via the application, so pushing is rarely needed.

---

## File Structure

```
zanzitrekking-backend/public/
├── uploads/          # User uploaded images
│   ├── .gitkeep      # Keeps directory in git
│   └── [image files] # Ignored by git
├── pdfs/             # PDF documents
│   ├── .gitkeep      # Keeps directory in git
│   └── [pdf files]   # Ignored by git
└── newsletter/       # Newsletter files
    ├── .gitkeep      # Keeps directory in git
    └── [files]       # Ignored by git
```

---

## Troubleshooting

### "SSH connection failed"

1. Verify SSH secrets in GitHub:
   - `CPANEL_SSH_HOST`
   - `CPANEL_SSH_USERNAME`
   - `CPANEL_SSH_KEY`
   - `CPANEL_SSH_PORT`

2. Test SSH connection manually:
   ```bash
   ssh -i ~/.ssh/cpanel_deploy safariszanzico@your-server.com
   ```

### "FTP pull not supported"

The GitHub Actions FTP action only supports pushing, not pulling. Use:
- SSH method (recommended)
- Manual FTP client
- SSH command line

### "Files not syncing"

1. Check file permissions on server
2. Verify directory paths are correct
3. Ensure you have read/write access
4. Check if files exist on server

---

## Best Practices

1. ✅ **Regular backups** - Pull from cPanel weekly/monthly
2. ✅ **Before major changes** - Pull latest images before deploying
3. ✅ **After bulk uploads** - Pull to keep repository in sync
4. ⚠️ **Don't push often** - Images should be uploaded via application
5. ✅ **Use SSH** - More secure than FTP

---

## Quick Reference

**GitHub Actions:**
- Pull: `Actions` → `Sync Backend Public Folder` → `pull`
- Push: `Actions` → `Sync Backend Public Folder` → `push`

**FTP Client:**
- Server: `/api.zanzisafaris.com/public/`
- Local: `C:\Users\ali\Desktop\Deployment\zanzitrekking-backend\public\`

**SSH:**
- Host: Your SSH host
- User: `safariszanzico`
- Path: `/home/safariszanzico/api.zanzisafaris.com/public/`
