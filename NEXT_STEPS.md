# Next Steps - Complete Deployment Guide

## ✅ What You've Done So Far

- ✅ Code pushed to GitHub
- ✅ GitHub Secrets configured (FTP credentials)
- ✅ Workflow syntax fixed
- ✅ Ready to deploy!

---

## 🚀 Step-by-Step Next Steps

### Step 1: Test the Workflow (5 minutes)

**Goal:** Verify the workflow works and files deploy correctly

1. Go to: https://github.com/aliaoua/zanzitrekking-deployment/actions
2. Click **"Deploy Backend to cPanel"** (left sidebar)
3. Click **"Run workflow"** button (top right)
4. Make sure branch is **"main"**
5. Click **"Run workflow"** (green button)
6. **Watch the logs:**
   - Click on the running workflow
   - Expand each step to see progress
   - Look for "✅ FTP secrets are configured"
   - Check "Deploy to cPanel via FTP" step

**Expected Result:**
- ✅ All steps show green checkmarks
- ✅ "Uploaded X files" message
- ✅ "Backend deployed successfully"

**If it fails:**
- Click on failed step (red X)
- Read error message
- Share the error with me and I'll help fix it

---

### Step 2: Verify Files on cPanel (2 minutes)

**Goal:** Confirm files were deployed

1. Log into cPanel
2. Go to **File Manager**
3. Navigate to: `/home/safariszanzico/api.zanzisafaris.com/`
4. **Check for these files:**
   - ✅ `server.js`
   - ✅ `package.json`
   - ✅ `.env` file
   - ✅ `controllers/` folder
   - ✅ `models/` folder
   - ✅ `routes/` folder
   - ✅ `public/` folder (should still exist with your images!)

**If files don't appear:**
- Check workflow logs for errors
- Verify FTP path is correct
- May need to adjust `server-dir` in workflow

---

### Step 3: Clean Up Backend (If Needed) (5 minutes)

**Goal:** Remove old files, keep only `public` folder

**Only do this if:**
- You have old/duplicate files on cPanel
- This is your first deployment
- You want a clean start

**Option A: Manual Cleanup (Recommended for first time)**

1. In cPanel File Manager
2. Navigate to `/home/safariszanzico/api.zanzisafaris.com/`
3. **Select all files/folders EXCEPT `public`**
4. Right-click → **Delete**
5. Verify only `public` folder remains

**Option B: GitHub Actions Cleanup (If SSH is configured)**

1. Go to GitHub Actions
2. Click **"Cleanup Backend on cPanel"**
3. Type `DELETE` and run
4. (Requires SSH secrets)

**After cleanup:**
- Run deployment workflow again (Step 1)
- Files will be fresh and clean

---

### Step 4: Install Dependencies (3 minutes)

**Goal:** Install Node.js packages on server

**Option A: Via SSH (Recommended)**

1. Connect via SSH:
   ```bash
   ssh safariszanzico@your-server.com
   ```
2. Navigate and install:
   ```bash
   cd /home/safariszanzico/api.zanzisafaris.com
   npm install --production
   ```

**Option B: Via cPanel Terminal**

1. Log into cPanel
2. Go to **Terminal** (in Advanced section)
3. Run:
   ```bash
   cd /home/safariszanzico/api.zanzisafaris.com
   npm install --production
   ```

**Option C: Automatic (If SSH secrets are configured)**

- The workflow will install dependencies automatically
- Check workflow logs to confirm

---

### Step 5: Set Up Node.js Application in cPanel (5 minutes)

**Goal:** Configure Node.js to run your application

1. Log into cPanel
2. Go to **"Node.js Selector"**
3. **If application doesn't exist:**
   - Click **"Create Application"**
   - Configure:
     - **Node.js Version:** `18.x`
     - **Application Root:** `/api.zanzisafaris.com`
     - **Application URL:** `https://api.zanzisafaris.com`
     - **Application Startup File:** `server.js`
   - Click **"Create"**

4. **If application exists:**
   - Click on your application
   - Verify settings are correct
   - Click **"Save"**

---

### Step 6: Restart Application (1 minute)

**Goal:** Apply changes and start the application

**Option A: Via cPanel**

1. Go to **Node.js Selector**
2. Find your application
3. Click **"Restart"** button

**Option B: Via SSH**

```bash
touch /home/safariszanzico/api.zanzisafaris.com/tmp/restart.txt
```

---

### Step 7: Verify Everything Works (2 minutes)

**Goal:** Test that API is running correctly

1. **Test API endpoint:**
   - Visit: `https://api.zanzisafaris.com/api/home`
   - Should return JSON data (not error)

2. **Test images:**
   - Visit: `https://api.zanzisafaris.com/public/uploads/`
   - Should show your uploaded images

3. **Check application logs:**
   - cPanel → Node.js Selector → View Logs
   - Look for "Database connected" or similar success messages

**If API doesn't work:**
- Check Node.js application status in cPanel
- Review error logs
- Verify `.env` file has correct values
- Check database connection

---

### Step 8: Deploy Frontend (When Ready) (5 minutes)

**Goal:** Deploy your React frontend

1. Go to: https://github.com/aliaoua/zanzitrekking-deployment/actions
2. Click **"Deploy Frontend to cPanel"**
3. Click **"Run workflow"** → **"Run workflow"**
4. Wait for build and deployment
5. Test: `https://booking.zanzisafaris.com`

---

### Step 9: Deploy Dashboard (When Ready) (5 minutes)

**Goal:** Deploy your admin dashboard

1. Go to: https://github.com/aliaoua/zanzitrekking-deployment/actions
2. Click **"Deploy Dashboard to cPanel"**
3. Click **"Run workflow"** → **"Run workflow"**
4. Wait for build and deployment
5. Test: `https://admin.zanzisafaris.com`

---

## 📋 Quick Checklist

### Immediate Next Steps:
- [ ] **Step 1:** Test backend deployment workflow
- [ ] **Step 2:** Verify files appear in cPanel
- [ ] **Step 3:** Clean up old files (if needed)
- [ ] **Step 4:** Install dependencies
- [ ] **Step 5:** Set up Node.js application
- [ ] **Step 6:** Restart application
- [ ] **Step 7:** Test API endpoints

### Later Steps:
- [ ] Deploy frontend
- [ ] Deploy dashboard
- [ ] Test complete system

---

## 🎯 Priority Order

**Do these first (critical):**
1. ✅ Test workflow (Step 1)
2. ✅ Verify files (Step 2)
3. ✅ Install dependencies (Step 4)
4. ✅ Set up Node.js (Step 5)
5. ✅ Restart & test (Steps 6-7)

**Do these after backend works:**
- Deploy frontend (Step 8)
- Deploy dashboard (Step 9)

---

## 🆘 If Something Fails

### Workflow Fails:
- Check workflow logs
- Look for error messages
- Verify secrets are correct
- Check FTP path

### Files Don't Appear:
- Verify FTP path in workflow
- Check file permissions
- Try manual FTP upload to test

### API Doesn't Work:
- Check Node.js application status
- Review error logs
- Verify `.env` file
- Check database connection

### Dependencies Won't Install:
- Check Node.js version (should be 18.x)
- Verify `package.json` exists
- Check disk space on server

---

## 📞 Need Help?

If you encounter any issues:
1. Check the error message
2. Review the relevant step above
3. Check workflow logs
4. Share the error and I'll help fix it!

---

## ✨ Summary

**Right now, do this:**
1. **Test the workflow** (Step 1) - Most important!
2. **Verify files deployed** (Step 2)
3. **Install dependencies** (Step 4)
4. **Set up Node.js** (Step 5)
5. **Restart & test** (Steps 6-7)

Once backend works, deploy frontend and dashboard!

**Start with Step 1 - Test the workflow!** 🚀
