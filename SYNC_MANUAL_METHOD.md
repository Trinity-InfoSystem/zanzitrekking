# Manual Sync - Pull Public Folder from cPanel

## 🎯 Quick Manual Method (No SSH Required)

Since the automatic sync requires SSH secrets, here's the manual method:

---

## Step 1: Download via FTP Client

### Using FileZilla (or any FTP client):

1. **Open FileZilla** (or WinSCP, etc.)
2. **Connect:**
   - Host: `ftp.zanzisafaris.com`
   - Username: `safariszanzico`
   - Password: `*2024@ZanSaF#66`
   - Port: `21`
   - Protocol: FTP

3. **Navigate on server (right side):**
   - Go to: `/api.zanzisafaris.com/public/`
   - You should see:
     - `uploads/` folder
     - `pdfs/` folder
     - `newsletter/` folder

4. **Navigate locally (left side):**
   - Go to: `C:\Users\ali\Desktop\Deployment\zanzitrekking-backend\public\`

5. **Download:**
   - Select all files/folders in `public/` on server
   - Drag and drop to local `public/` folder
   - OR right-click → Download

---

## Step 2: Commit to Repository

```bash
cd C:\Users\ali\Desktop\Deployment
git add zanzitrekking-backend/public/
git commit -m "Sync: Pull latest public folder from cPanel"
git push origin main
```

---

## ✅ What Gets Synced

- `public/uploads/` - All uploaded images
- `public/pdfs/` - PDF files  
- `public/newsletter/` - Newsletter files

---

## 🔧 Alternative: Set Up SSH for Automatic Sync

If you want automatic sync, you need to add SSH secrets:

1. **Generate SSH key:**
   ```bash
   ssh-keygen -t rsa -b 4096 -C "cpanel-sync" -f ~/.ssh/cpanel_sync
   ```

2. **Add public key to cPanel:**
   - cPanel → SSH Access → Manage SSH Keys
   - Import the public key (`~/.ssh/cpanel_sync.pub`)

3. **Add secrets to GitHub:**
   - `CPANEL_SSH_HOST` - Your SSH hostname
   - `CPANEL_SSH_USERNAME` - `safariszanzico`
   - `CPANEL_SSH_KEY` - Content of private key (`~/.ssh/cpanel_sync`)
   - `CPANEL_SSH_PORT` - `22`

Then the workflow will work automatically!

---

## 📋 Quick Steps Summary

1. **FTP Client** → Connect to cPanel
2. **Download** `public/` folder from server
3. **Save** to local `zanzitrekking-backend/public/`
4. **Commit & Push** to GitHub

**That's it!** 🚀
