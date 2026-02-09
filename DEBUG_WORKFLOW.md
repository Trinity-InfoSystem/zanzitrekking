# Debug Workflow Failures - Step by Step

## 🔍 How to Find the Actual Error

### Step 1: Open the Failed Workflow Run

1. Go to: https://github.com/aliaoua/zanzitrekking-deployment/actions
2. Click **"Deploy Backend to cPanel"** (left sidebar)
3. Click on the **MOST RECENT** failed run (top of the list)
   - Should say "Fix: Remove invalid secrets check..." or similar
   - Has red X icon

### Step 2: Expand Failed Steps

1. You'll see a list of steps on the left
2. Look for steps with **red X** (failed)
3. **Click on each failed step** to expand it
4. **Scroll down** to see the error message

### Step 3: Find the Error Message

Common failed steps:
- **"Check FTP Secrets"** - Will show if secrets are missing
- **"Deploy to cPanel via FTP"** - Will show FTP connection errors
- **"Install dependencies"** - Will show npm errors

**Look for error messages like:**
- "FTP connection failed"
- "Authentication failed"
- "Path not found"
- "Unable to connect"
- etc.

---

## 📸 What to Share With Me

When you find the error, please share:
1. **Which step failed** (e.g., "Deploy to cPanel via FTP")
2. **The error message** (copy the exact text)
3. **Any red error lines** in the logs

---

## 🔧 Common Issues & Fixes

### Issue 1: "FTP connection failed" or "Unable to connect"

**Possible causes:**
- FTP host is wrong
- FTP port is wrong (should be 21)
- Firewall blocking connection

**Fix:**
- Try using server IP instead of `ftp.zanzisafaris.com`
- Check if FTP is enabled in cPanel
- Verify FTP account is active

### Issue 2: "Authentication failed"

**Possible causes:**
- Wrong username or password
- Username format is wrong

**Fix:**
- Verify username: `safariszanzico` (not `safariszanzico@zanzisafaris.com`)
- Check password is correct
- Try resetting FTP password in cPanel

### Issue 3: "Path not found" or "Directory does not exist"

**Possible causes:**
- FTP path is wrong
- Directory doesn't exist on server

**Fix:**
- The path might need to be `/home/safariszanzico/api.zanzisafaris.com/` instead of `/api.zanzisafaris.com/`
- Create the directory in cPanel File Manager first
- We may need to update the workflow path

### Issue 4: "Permission denied"

**Possible causes:**
- FTP user doesn't have write permissions
- Directory permissions are wrong

**Fix:**
- Check FTP account permissions in cPanel
- Verify directory permissions (should be 755)

---

## 🎯 Quick Debug Steps

1. **Click on most recent failed run**
2. **Expand "Deploy to cPanel via FTP" step** (or whichever step has red X)
3. **Scroll to bottom** - error message is usually at the end
4. **Copy the error message**
5. **Share it with me** so I can help fix it

---

## 💡 Alternative: Test FTP Connection Manually

To verify FTP credentials work:

1. **Use FTP client** (FileZilla, WinSCP, etc.)
2. **Connect with:**
   - Host: `ftp.zanzisafaris.com`
   - Username: `safariszanzico`
   - Password: `*2024@ZanSaF#66`
   - Port: `21`
3. **Try to connect**
   - If it works → Credentials are correct, issue is in workflow
   - If it fails → Credentials are wrong, fix them first

---

## 🆘 Still Can't Find the Error?

1. **Take a screenshot** of the failed step
2. **Or copy the entire log** from the failed step
3. **Share it with me** and I'll help identify the issue

---

## 📋 Checklist

- [ ] Opened the most recent failed workflow run
- [ ] Expanded the failed step (red X)
- [ ] Found the error message
- [ ] Copied the error message
- [ ] Ready to share with me for help!

---

**Next:** Click on the failed run and find the error message, then share it with me! 🔍
