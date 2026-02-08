# Quick Reference - Updated Steps

## ✅ What Changed

1. **`.env` file is now deployed** - No longer excluded!
2. **Cleanup workflow added** - Easy way to clean backend on cPanel
3. **Public folder still protected** - Images won't be overwritten

---

## 🚀 Your Next Steps (In Order)

### Step 1: Configure GitHub Secrets ✅
Go to: https://github.com/aliaoua/zanzitrekking-deployment/settings/secrets/actions

Add:
- `CPANEL_FTP_HOST`
- `CPANEL_FTP_USERNAME`
- `CPANEL_FTP_PASSWORD`
- `CPANEL_SSH_HOST` (recommended)
- `CPANEL_SSH_USERNAME` (recommended)
- `CPANEL_SSH_KEY` (recommended)

### Step 2: Ensure .env is in Repository ✅
```bash
# Make sure .env exists in zanzitrekking-backend/
# If not, add it:
git add zanzitrekking-backend/.env
git commit -m "Add .env file"
git push
```

### Step 3: Cleanup Backend on cPanel ⚠️ IMPORTANT!

**Delete ALL files/folders EXCEPT `public` folder**

**Option A - GitHub Actions (Easiest):**
1. Go to: https://github.com/aliaoua/zanzitrekking-deployment/actions
2. Click "Cleanup Backend on cPanel"
3. Type `DELETE` and run

**Option B - cPanel File Manager:**
1. cPanel → File Manager
2. Navigate to `/home/safariszanzico/api.zanzisafaris.com/`
3. Select all EXCEPT `public` folder
4. Delete

### Step 4: Deploy Backend ✅
1. Go to: https://github.com/aliaoua/zanzitrekking-deployment/actions
2. Click "Deploy Backend to cPanel"
3. Run workflow

**What deploys:**
- ✅ All code files
- ✅ `.env` file (automatically!)
- ❌ `public` folder (excluded - images safe)

### Step 5: Install Dependencies (if needed)
```bash
cd /home/safariszanzico/api.zanzisafaris.com
npm install --production
```

### Step 6: Restart Application
```bash
touch /home/safariszanzico/api.zanzisafaris.com/tmp/restart.txt
```

### Step 7: Verify ✅
- API: `https://api.zanzisafaris.com/api/home`
- Images: `https://api.zanzisafaris.com/public/uploads/`

---

## 📋 Checklist

- [ ] GitHub Secrets configured
- [ ] `.env` file in repository
- [ ] Backend cleaned on cPanel (only `public` remains)
- [ ] Backend deployed via GitHub Actions
- [ ] Dependencies installed
- [ ] Application restarted
- [ ] API working
- [ ] Images accessible

---

## 📚 Full Documentation

- **UPDATED_SETUP_STEPS.md** - Complete updated steps
- **CLEANUP_BACKEND_STEPS.md** - Detailed cleanup guide
- **GITHUB_ACTIONS_SETUP.md** - GitHub Actions setup
- **SYNC_PUBLIC_FOLDER.md** - Public folder sync

---

## ⚡ Quick Commands

```bash
# Push changes
git add .
git commit -m "Your message"
git push

# Cleanup (via SSH)
cd /home/safariszanzico/api.zanzisafaris.com
find . -maxdepth 1 ! -name '.' ! -name 'public' -exec rm -rf {} +

# Install dependencies
npm install --production

# Restart
touch tmp/restart.txt
```

---

## 🎯 Summary

1. **Cleanup** → Delete all except `public`
2. **Deploy** → GitHub Actions deploys code + `.env`
3. **Install** → Dependencies (if not automatic)
4. **Restart** → Application
5. **Verify** → Test API and images

Done! 🚀
