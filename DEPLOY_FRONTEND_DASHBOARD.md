# Deploy Frontend & Dashboard - Complete Guide

## ✅ Good News: No Manual Cleanup Needed!

Both workflows have `dangerous-clean-slate: true`, which means:
- ✅ **Automatically deletes** all files in the target directory
- ✅ **Then deploys** fresh files
- ✅ **No manual cleanup required!**

---

## 🚀 Deploy Frontend (booking.zanzisafaris.com)

### Step 1: Run the Workflow

1. Go to: https://github.com/aliaoua/zanzitrekking-deployment/actions
2. Click **"Deploy Frontend to cPanel"** (left sidebar)
3. Click **"Run workflow"** → **"Run workflow"**

### Step 2: What Happens

The workflow will:
1. ✅ Checkout code
2. ✅ Setup Node.js
3. ✅ Install dependencies
4. ✅ Build React app (`npm run build`)
5. ✅ **Delete all files** in `/booking.zanzisafaris.com/` (automatic cleanup!)
6. ✅ Deploy fresh `dist/` folder contents
7. ✅ Show success notification

### Step 3: Verify

- Visit: `https://booking.zanzisafaris.com`
- Should show your React app

---

## 🚀 Deploy Dashboard (admin.zanzisafaris.com)

### Step 1: Run the Workflow

1. Go to: https://github.com/aliaoua/zanzitrekking-deployment/actions
2. Click **"Deploy Dashboard to cPanel"** (left sidebar)
3. Click **"Run workflow"** → **"Run workflow"**

### Step 2: What Happens

The workflow will:
1. ✅ Checkout code
2. ✅ Setup Node.js
3. ✅ Install dependencies
4. ✅ Build React app (`npm run build`)
5. ✅ **Delete all files** in `/admin.zanzisafaris.com/` (automatic cleanup!)
6. ✅ Deploy fresh `dist/` folder contents
7. ✅ Show success notification

### Step 3: Verify

- Visit: `https://admin.zanzisafaris.com`
- Should show your admin dashboard

---

## ❌ Do You Need to Delete Folders Manually?

### Answer: NO! ✅

**Why?**
- Both workflows have `dangerous-clean-slate: true`
- This **automatically deletes** all files before deploying
- You don't need to do anything manually

**What `dangerous-clean-slate: true` does:**
1. Connects to cPanel
2. **Deletes ALL files** in the target directory
3. **Deploys fresh files** from your build
4. Result: Clean, fresh deployment every time

---

## 📋 Deployment Checklist

### Frontend:
- [ ] Run "Deploy Frontend to cPanel" workflow
- [ ] Wait for build and deployment
- [ ] Verify: `https://booking.zanzisafaris.com` works

### Dashboard:
- [ ] Run "Deploy Dashboard to cPanel" workflow
- [ ] Wait for build and deployment
- [ ] Verify: `https://admin.zanzisafaris.com` works

---

## 🎯 Quick Steps

### Deploy Frontend:
1. GitHub Actions → "Deploy Frontend to cPanel"
2. Run workflow
3. Done! (No cleanup needed)

### Deploy Dashboard:
1. GitHub Actions → "Deploy Dashboard to cPanel"
2. Run workflow
3. Done! (No cleanup needed)

---

## ⚠️ Important Notes

### Automatic Cleanup:
- ✅ Frontend: Automatically cleans `/booking.zanzisafaris.com/`
- ✅ Dashboard: Automatically cleans `/admin.zanzisafaris.com/`
- ✅ No manual deletion needed

### What Gets Deployed:
- **Frontend:** Contents of `zanzitrekking-frontend/dist/` folder
- **Dashboard:** Contents of `zanzitrekking-dashboard/dist/` folder

### What Gets Deleted (Automatically):
- All existing files in the target directory
- Then fresh files are deployed

---

## 🆘 If Deployment Fails

1. **Check workflow logs:**
   - Click on failed run
   - Expand failed step
   - Read error message

2. **Common issues:**
   - FTP path wrong → We may need to adjust path
   - Build failed → Check build logs
   - FTP connection failed → Check credentials

---

## ✅ Summary

**Frontend & Dashboard:**
- ✅ **No manual cleanup needed** - workflows do it automatically
- ✅ **Just run the workflows** - they handle everything
- ✅ **Fresh deployment** every time

**Ready to deploy?** Just run the workflows! 🚀
