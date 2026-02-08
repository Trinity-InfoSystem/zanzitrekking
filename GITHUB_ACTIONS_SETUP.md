# GitHub Actions Setup Guide

This guide will help you configure GitHub Actions for automated deployment to cPanel.

## Repository Information

- **Repository URL**: `https://github.com/aliaoua/zanzitrekking-deployment.git`
- **SSH URL**: `git@github.com:aliaoua/zanzitrekking-deployment.git`

---

## Step 1: Add Remote and Push Code

If you haven't already, connect your local repository to GitHub:

```bash
# In C:\Users\ali\Desktop\Deployment
git remote add origin https://github.com/aliaoua/zanzitrekking-deployment.git
git branch -M main
git push -u origin main
```

**If authentication fails:**
- Use a Personal Access Token as password
- Generate token: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
- Select `repo` scope

---

## Step 2: Configure GitHub Secrets

Go to your repository: https://github.com/aliaoua/zanzitrekking-deployment

1. Click **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"** and add the following:

### Required Secrets for FTP Deployment:

| Secret Name | Description | How to Get It |
|------------|-------------|---------------|
| `CPANEL_FTP_HOST` | FTP server hostname | cPanel → FTP Accounts → Your FTP account → Host |
| `CPANEL_FTP_USERNAME` | FTP username | cPanel → FTP Accounts → Your FTP account → Username |
| `CPANEL_FTP_PASSWORD` | FTP password | The password you set for FTP account |

**Example values:**
- `CPANEL_FTP_HOST`: `ftp.zanzisafaris.com` or your server IP
- `CPANEL_FTP_USERNAME`: `deploy` (or your FTP username)
- `CPANEL_FTP_PASSWORD`: `your_secure_password`

### Optional Secrets for SSH Deployment (More Secure):

| Secret Name | Description | How to Get It |
|------------|-------------|---------------|
| `CPANEL_SSH_HOST` | SSH server hostname | Usually same as FTP host or `ssh.zanzisafaris.com` |
| `CPANEL_SSH_USERNAME` | SSH username | Usually your cPanel username (e.g., `safariszanzico`) |
| `CPANEL_SSH_KEY` | SSH private key | Generate SSH key pair and paste private key here |
| `CPANEL_SSH_PORT` | SSH port | Usually `22` |

**To generate SSH key:**
```bash
ssh-keygen -t rsa -b 4096 -C "cpanel-deploy" -f ~/.ssh/cpanel_deploy
# Copy the content of ~/.ssh/cpanel_deploy (private key) to CPANEL_SSH_KEY secret
# Add ~/.ssh/cpanel_deploy.pub (public key) to cPanel → SSH Access → Manage SSH Keys
```

### Additional Secrets (if needed):

| Secret Name | Description | Example |
|------------|-------------|---------|
| `VITE_API_URL` | Frontend API URL | `https://api.zanzisafaris.com` |

---

## Step 3: Verify Workflows

After pushing code, you should see three workflows in the **Actions** tab:

1. **Deploy Backend to cPanel** - Deploys backend code (excludes `public` folder)
2. **Deploy Frontend to cPanel** - Builds and deploys frontend
3. **Deploy Dashboard to cPanel** - Builds and deploys dashboard
4. **Sync Backend Public Folder from cPanel** - Syncs public folder (pull/push)

---

## Step 4: Test Backend Deployment

1. Go to GitHub → **Actions** tab
2. Click **"Deploy Backend to cPanel"**
3. Click **"Run workflow"** → **"Run workflow"**
4. Watch the workflow execute
5. Check your cPanel directory: `/home/safariszanzico/api.zanzisafaris.com/`

**Important Notes:**
- The `public` folder is **excluded** from deployment (won't overwrite existing images)
- Only code files are deployed
- You'll need to install dependencies on server first time (see Step 5)

---

## Step 5: First-Time Backend Setup on cPanel

### 5.1 Set Up Node.js Application

1. Log into cPanel
2. Go to **"Node.js Selector"**
3. Click **"Create Application"**
4. Configure:
   - **Node.js Version**: `18.x`
   - **Application Root**: `/api.zanzisafaris.com`
   - **Application URL**: `https://api.zanzisafaris.com`
   - **Application Startup File**: `server.js`
5. Click **"Create"**

### 5.2 Install Dependencies (One-time)

Via SSH or cPanel Terminal:

```bash
cd /home/safariszanzico/api.zanzisafaris.com
npm install --production
```

### 5.3 Verify .env File

Ensure `.env` file exists in `/home/safariszanzico/api.zanzisafaris.com/` with all required environment variables.

---

## Step 6: Sync Public Folder (Pull Images from cPanel)

To get the latest uploaded images from cPanel to your local repository:

1. Go to GitHub → **Actions** tab
2. Click **"Sync Backend Public Folder from cPanel"**
3. Click **"Run workflow"**
4. Select **"pull"** from the dropdown
5. Click **"Run workflow"**

This will:
- Download the `public` folder from cPanel
- Commit the changes to your repository
- Push to GitHub

**Note:** The workflow will automatically commit and push changes with `[skip ci]` to prevent deployment loops.

---

## Step 7: Test Frontend & Dashboard Deployment

1. Go to GitHub → **Actions** tab
2. Click **"Deploy Frontend to cPanel"** → **"Run workflow"**
3. Click **"Deploy Dashboard to cPanel"** → **"Run workflow"**

These will:
- Build the React applications
- Deploy the `dist/` folder contents to cPanel

---

## How It Works

### Automatic Deployment

When you push code to the `main` branch:

- **Backend changes** → Only backend workflow runs (excludes `public` folder)
- **Frontend changes** → Only frontend workflow runs
- **Dashboard changes** → Only dashboard workflow runs

### Manual Deployment

- Go to **Actions** tab
- Select the workflow
- Click **"Run workflow"**

### Public Folder Sync

The `public` folder is handled separately:
- **Deployment**: `public` folder is excluded (won't overwrite server images)
- **Sync Pull**: Download latest images from cPanel to repository
- **Sync Push**: Upload local images to cPanel (if needed)

---

## Workflow Details

### Deploy Backend to cPanel

**Triggers:**
- Push to `main` when `zanzitrekking-backend/**` changes
- Manual trigger

**What it does:**
- Installs production dependencies
- Deploys code files (excludes `public` folder)
- Optionally installs dependencies on server via SSH

**Excludes:**
- `node_modules/`
- `.env*`
- `public/` folder (to preserve existing images)
- Log files

### Sync Backend Public Folder

**Triggers:**
- Manual only

**Options:**
- **Pull**: Download `public` folder from cPanel → Commit to repo
- **Push**: Upload `public` folder from repo → cPanel

**Use Cases:**
- **Pull**: Get latest uploaded images from production
- **Push**: Upload new images to production (rare)

---

## Troubleshooting

### "FTP connection failed"

1. Check `CPANEL_FTP_HOST` - should be `ftp.zanzisafaris.com` or server IP
2. Verify FTP credentials in cPanel
3. Check if FTP account is active
4. Try using SSH instead (more secure)

### "Backend not starting"

1. Check Node.js version in cPanel (should be 18.x)
2. Verify `server.js` exists
3. Check `.env` file has all required variables
4. Review Passenger logs in cPanel → Node.js Selector

### "Public folder sync failed"

1. Verify FTP/SSH credentials
2. Check if `public` folder exists on server
3. Ensure you have read/write permissions

### "Workflow not triggering"

1. Check if you pushed to `main` branch
2. Verify file paths match workflow triggers
3. Check GitHub Actions is enabled for the repository

---

## Security Best Practices

1. ✅ Use **Private** repository (already set)
2. ✅ Never commit `.env` files (already in `.gitignore`)
3. ✅ Use GitHub Secrets for all credentials
4. ✅ Consider SSH instead of FTP (more secure)
5. ✅ Rotate FTP/SSH credentials regularly

---

## Next Steps

1. ✅ Configure all GitHub Secrets
2. ✅ Test backend deployment
3. ✅ Set up Node.js application in cPanel
4. ✅ Install backend dependencies (first time)
5. ✅ Test public folder sync (pull)
6. ✅ Test frontend deployment
7. ✅ Test dashboard deployment

---

## Quick Reference

**Repository**: https://github.com/aliaoua/zanzitrekking-deployment

**Workflows:**
- Deploy Backend: `Actions` → `Deploy Backend to cPanel`
- Deploy Frontend: `Actions` → `Deploy Frontend to cPanel`
- Deploy Dashboard: `Actions` → `Deploy Dashboard to cPanel`
- Sync Public: `Actions` → `Sync Backend Public Folder from cPanel`

**Secrets Location**: `Settings` → `Secrets and variables` → `Actions`

---

## Support

If you encounter issues:
1. Check GitHub Actions logs for specific errors
2. Verify all secrets are set correctly
3. Review cPanel error logs
4. Check file permissions on server
