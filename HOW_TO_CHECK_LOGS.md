# How to Check GitHub Actions Workflow Logs

## 📍 Where to Find the Logs

### Step 1: Go to Actions Tab

1. Go to your repository: https://github.com/aliaoua/zanzitrekking-deployment
2. Click on the **"Actions"** tab (at the top navigation bar)

### Step 2: Select the Workflow

1. In the left sidebar, click on **"Deploy Backend to cPanel"** (or any workflow you want to check)
2. You'll see a list of all workflow runs

### Step 3: Click on a Failed Run

1. Find the workflow run you want to check (the one showing **"Failure"** with red X)
2. Click on the **commit message** or the workflow run (e.g., "Fix: Add FTP secrets validation...")

### Step 4: View the Logs

1. You'll see a page with the workflow run details
2. On the left, you'll see all the **steps** of the workflow:
   - ✅ Checkout code
   - ✅ Setup Node.js
   - ✅ Install dependencies
   - ✅ Deploy to cPanel via FTP
   - etc.

3. **Click on each step** to expand and see the logs
4. **Look for red X marks** - these indicate failed steps
5. **Click on the failed step** to see the error message

---

## 🔍 What to Look For

### Common Error Messages:

1. **"FTP secrets are missing!"**
   - **Fix:** Add `CPANEL_FTP_HOST`, `CPANEL_FTP_USERNAME`, `CPANEL_FTP_PASSWORD` to GitHub Secrets

2. **"FTP connection failed"**
   - **Fix:** Check FTP host, username, password in secrets

3. **"Authentication failed"**
   - **Fix:** Verify FTP credentials are correct

4. **"Path not found"**
   - **Fix:** Check if `/api.zanzisafaris.com/` directory exists on server

---

## 📸 Step-by-Step Visual Guide

### 1. Go to Actions Tab
```
Repository → Click "Actions" tab (top navigation)
```

### 2. Select Workflow
```
Left sidebar → Click "Deploy Backend to cPanel"
```

### 3. Click on Failed Run
```
Click on the commit message (e.g., "Fix: Add FTP secrets...")
```

### 4. Expand Failed Step
```
Click on the step with red X (usually "Deploy to cPanel via FTP")
```

### 5. Read Error Message
```
Scroll down to see the error details
```

---

## 🎯 Quick Path to Logs

**Direct URL format:**
```
https://github.com/aliaoua/zanzitrekking-deployment/actions/runs/[RUN_ID]
```

**To find RUN_ID:**
1. Go to Actions tab
2. Click on a workflow run
3. Look at the URL - it will have `/runs/` followed by a number

---

## 📋 Example: Checking Latest Run

1. **Go to:** https://github.com/aliaoua/zanzitrekking-deployment/actions
2. **Click:** "Deploy Backend to cPanel" (left sidebar)
3. **Click:** The top workflow run (most recent, showing "Failure")
4. **Expand:** The step that failed (usually "Deploy to cPanel via FTP" or "Check FTP Secrets")
5. **Read:** The error message at the bottom of that step

---

## 🔴 What You'll See

### If Secrets Are Missing:
```
❌ ERROR: FTP secrets are missing!
Please configure these secrets in GitHub:
  - CPANEL_FTP_HOST
  - CPANEL_FTP_USERNAME
  - CPANEL_FTP_PASSWORD

Go to: Settings → Secrets and variables → Actions
```

### If FTP Connection Fails:
```
Error: FTP connection failed
Unable to connect to ftp.zanzisafaris.com
```

### If Authentication Fails:
```
Error: Authentication failed
Invalid username or password
```

---

## ✅ Success Logs Look Like:

```
✅ FTP secrets are configured
Deploying files...
Uploaded 150 files
✅ Backend deployed successfully to cPanel
```

---

## 🆘 Still Can't Find Logs?

1. Make sure you're logged into GitHub
2. Make sure you're on the correct repository
3. Try refreshing the page
4. Check if the workflow run is still in progress (yellow circle = running)

---

## 📝 Summary

**Path to logs:**
1. Repository → **Actions** tab
2. Click workflow name (left sidebar)
3. Click failed run (commit message)
4. Expand failed step
5. Read error message

**Most common issue:** Missing GitHub Secrets - add them in Settings → Secrets and variables → Actions
