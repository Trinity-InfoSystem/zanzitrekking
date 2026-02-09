# Debug Sync Workflow Error

## 🔍 How to Find the Actual Error

The workflow failed with "exit code 1". Let's find out why:

### Step 1: Check the Workflow Logs

1. Go to: https://github.com/aliaoua/zanzitrekking-deployment/actions
2. Click **"Sync Backend Public Folder from cPanel"**
3. Click on the **failed run** (most recent, red X)
4. Click on **"Pull Public Folder from cPanel via FTP"** step
5. **Scroll to the bottom** - the error message will be there

### Step 2: Common Errors

**Error: "cd: Access failed"**
- FTP path is wrong
- Try: `./api.zanzisafaris.com/public` or `/api.zanzisafaris.com/public`

**Error: "Login failed"**
- FTP credentials are wrong
- Check username/password in secrets

**Error: "Connection failed"**
- FTP host is wrong
- Check if `ftp.zanzisafaris.com` is correct

**Error: "No such file or directory"**
- The `public` folder doesn't exist on server
- Or path is incorrect

---

## 🔧 Quick Fix: Check FTP Path

The workflow tries to `cd` to: `api.zanzisafaris.com/public`

**Possible correct paths:**
- `./api.zanzisafaris.com/public` (relative)
- `/api.zanzisafaris.com/public` (absolute)
- `/home/safariszanzico/api.zanzisafaris.com/public` (full path)

**To find the correct path:**
1. Connect via FTP client
2. Navigate to the `public` folder
3. Note the exact path shown
4. Share it with me and I'll update the workflow

---

## 📋 What to Share

When you check the logs, please share:
1. **Which step failed** (should be "Pull Public Folder from cPanel via FTP")
2. **The error message** (last few lines of the log)
3. **Any FTP path errors**

Then I can fix it immediately!

---

## 💡 Alternative: Manual Sync (Works Now)

While we debug, you can sync manually:

1. **FTP Client** → Connect to cPanel
2. **Download** `public/` folder
3. **Save** to local `zanzitrekking-backend/public/`
4. **Commit & Push**

This works immediately while we fix the automated sync.

---

**Please check the workflow logs and share the error message!** 🔍
