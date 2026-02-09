# Test Deployment - Next Steps

## ✅ Your Secrets Are Configured!

You've successfully added:
- ✅ `CPANEL_FTP_HOST` = `ftp.zanzisafaris.com`
- ✅ `CPANEL_FTP_USERNAME` = `safariszanzico`
- ✅ `CPANEL_FTP_PASSWORD` = (configured)

---

## 🚀 Now Test the Deployment

### Step 1: Run the Workflow

1. Go to: https://github.com/aliaoua/zanzitrekking-deployment/actions
2. Click **"Deploy Backend to cPanel"** (left sidebar)
3. Click **"Run workflow"** button (top right)
4. Make sure branch is set to **"main"**
5. Click **"Run workflow"** (green button)

### Step 2: Watch the Workflow Run

1. The workflow will start running (you'll see a yellow circle)
2. Click on the workflow run to see details
3. Watch each step:
   - ✅ Checkout code
   - ✅ Setup Node.js
   - ✅ Install dependencies
   - ✅ Check FTP Secrets (should show "✅ FTP secrets are configured")
   - ✅ Deploy to cPanel via FTP (this is the important one!)

### Step 3: Check for Success

**Success indicators:**
- ✅ All steps show green checkmarks
- ✅ "Deploy to cPanel via FTP" step shows "Uploaded X files"
- ✅ "Deployment Notification" shows "✅ Backend deployed successfully"

**If it fails:**
- Click on the failed step (red X)
- Read the error message
- Common issues:
  - FTP connection timeout → Check if FTP host is correct
  - Authentication failed → Verify username/password
  - Path not found → Check if `/api.zanzisafaris.com/` exists on server

---

## 📍 Verify Files on cPanel

After successful deployment:

1. Log into cPanel
2. Go to **File Manager**
3. Navigate to: `/home/safariszanzico/api.zanzisafaris.com/`
4. You should see:
   - `server.js`
   - `package.json`
   - `.env` file
   - `controllers/` folder
   - `models/` folder
   - `routes/` folder
   - etc.
   - `public/` folder (should already exist with your images)

---

## 🔧 If Deployment Succeeds But Files Don't Appear

### Check FTP Path

The workflow deploys to: `/api.zanzisafaris.com/`

If files don't appear, the path might need to be:
- `/home/safariszanzico/api.zanzisafaris.com/` (full path)

### Update Workflow Path (if needed)

If files don't appear, we may need to adjust the `server-dir` in the workflow.

---

## 📋 What Gets Deployed

✅ **Will be deployed:**
- All code files (`server.js`, `controllers/`, `models/`, etc.)
- `.env` file
- `package.json`
- `.htaccess`

❌ **Will NOT be deployed (excluded):**
- `public/` folder (your images stay safe!)
- `node_modules/` (will be installed on server)
- Log files

---

## 🎯 Next Steps After Successful Deployment

1. **Install dependencies** (if not automatic):
   ```bash
   cd /home/safariszanzico/api.zanzisafaris.com
   npm install --production
   ```

2. **Restart application**:
   ```bash
   touch /home/safariszanzico/api.zanzisafaris.com/tmp/restart.txt
   ```
   OR via cPanel → Node.js Selector → Restart

3. **Test API**:
   - Visit: `https://api.zanzisafaris.com/api/home`
   - Should return data (not error)

4. **Verify images**:
   - Visit: `https://api.zanzisafaris.com/public/uploads/`
   - Should show your images

---

## 🆘 Troubleshooting

### "FTP connection failed"
- Check if `ftp.zanzisafaris.com` is correct
- Try using server IP instead
- Check if FTP port is 21

### "Authentication failed"
- Verify username: `safariszanzico`
- Check password is correct
- Try connecting with FTP client to test

### "Path not found"
- Check if `/api.zanzisafaris.com/` directory exists
- Create it in cPanel File Manager if needed
- Or update workflow to use full path

### "Files uploaded but not visible"
- Check file permissions
- Verify you're looking in correct directory
- Refresh File Manager

---

## ✅ Success Checklist

- [ ] Workflow runs without errors
- [ ] "Deploy to cPanel via FTP" step succeeds
- [ ] Files appear in cPanel File Manager
- [ ] `.env` file is present
- [ ] `public/` folder still exists (with images)
- [ ] Dependencies installed (if needed)
- [ ] Application restarted
- [ ] API responds correctly

---

## 🚀 Ready to Test!

Go ahead and run the workflow now. It should work with your secrets configured!

If you encounter any errors, check the workflow logs and let me know what the error message says.
