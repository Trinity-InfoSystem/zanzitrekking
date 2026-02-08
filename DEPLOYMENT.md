# Deployment Guide for cPanel

This guide will walk you through setting up automated deployment from GitHub to cPanel for all three parts of the Zanzitrekking project.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Create GitHub Repository](#step-1-create-github-repository)
3. [Step 2: Initialize Git and Push Code](#step-2-initialize-git-and-push-code)
4. [Step 3: Configure cPanel FTP/SSH Access](#step-3-configure-cpanel-ftpssh-access)
5. [Step 4: Set Up GitHub Secrets](#step-4-set-up-github-secrets)
6. [Step 5: Configure cPanel Directories](#step-5-configure-cpanel-directories)
7. [Step 6: Test Deployment](#step-6-test-deployment)
8. [Manual Deployment (Alternative)](#manual-deployment-alternative)

---

## Prerequisites

- GitHub account
- cPanel access with FTP or SSH credentials
- Node.js 18+ installed locally (for building)
- Git installed locally

---

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Repository settings:
   - **Name**: `zanzitrekking-deployment` (or your preferred name)
   - **Description**: "Zanzitrekking monorepo - Backend, Frontend, and Dashboard"
   - **Visibility**: Private (recommended) or Public
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click **"Create repository"**
5. **Copy the repository URL** (you'll need it in the next step)

---

## Step 2: Initialize Git and Push Code

### 2.1 Initialize Git Repository

Open terminal in the project root directory (`C:\Users\ali\Desktop\Deployment`):

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Zanzitrekking monorepo setup"

# Add remote repository (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/zanzitrekking-deployment.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Note**: If you get authentication errors, you may need to:
- Use a Personal Access Token instead of password
- Or set up SSH keys for GitHub

### 2.2 Create Personal Access Token (if needed)

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click **"Generate new token (classic)"**
3. Give it a name: "cPanel Deployment"
4. Select scopes: `repo` (full control)
5. Click **"Generate token"**
6. **Copy the token** (you won't see it again!)
7. Use this token as your password when pushing

---

## Step 3: Configure cPanel FTP/SSH Access

### Option A: FTP Access (Easier)

1. Log into cPanel
2. Go to **"FTP Accounts"** or **"File Manager"**
3. Create an FTP account (if you don't have one):
   - **Username**: `deploy` (or your choice)
   - **Password**: Create a strong password
   - **Directory**: `/home/safariszanzico/` (or leave default)
4. **Note down**:
   - FTP Host: Usually `ftp.yourdomain.com` or your server IP
   - FTP Username: The username you created
   - FTP Password: The password you set
   - FTP Port: Usually `21` (or `21` for FTP, `22` for SFTP)

### Option B: SSH Access (More Secure - Recommended)

1. Log into cPanel
2. Go to **"SSH Access"** (in Security section)
3. If SSH is not enabled, enable it
4. Generate SSH key pair:
   ```bash
   # On your local machine
   ssh-keygen -t rsa -b 4096 -C "cpanel-deploy" -f ~/.ssh/cpanel_deploy
   ```
5. Copy the **public key** (`~/.ssh/cpanel_deploy.pub`)
6. In cPanel → SSH Access → **"Manage SSH Keys"** → **"Import Key"**
   - Paste your public key
   - Authorize the key
7. **Note down**:
   - SSH Host: Your server hostname or IP
   - SSH Username: Your cPanel username (usually `safariszanzico`)
   - SSH Port: Usually `22`
   - SSH Key: The **private key** content (`~/.ssh/cpanel_deploy`)

---

## Step 4: Set Up GitHub Secrets

1. Go to your GitHub repository
2. Click **"Settings"** → **"Secrets and variables"** → **"Actions"**
3. Click **"New repository secret"** and add the following:

### Required Secrets for FTP Deployment:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `CPANEL_FTP_HOST` | FTP server hostname | `ftp.zanzisafaris.com` or IP address |
| `CPANEL_FTP_USERNAME` | FTP username | `deploy` or your FTP username |
| `CPANEL_FTP_PASSWORD` | FTP password | Your FTP password |

### Optional Secrets for SSH Deployment:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `CPANEL_SSH_HOST` | SSH server hostname | `ssh.zanzisafaris.com` or IP |
| `CPANEL_SSH_USERNAME` | SSH username | `safariszanzico` |
| `CPANEL_SSH_KEY` | SSH private key | Content of `~/.ssh/cpanel_deploy` |
| `CPANEL_SSH_PORT` | SSH port | `22` (default) |

### Additional Secrets (if needed):

| Secret Name | Description | Example |
|------------|-------------|---------|
| `VITE_API_URL` | Frontend API URL | `https://api.zanzisafaris.com` |

**Important**: 
- Never commit secrets to the repository
- Use GitHub Secrets for all sensitive information
- SSH key should be the **private key** content (entire content including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`)

---

## Step 5: Configure cPanel Directories

### 5.1 Backend Setup (api.zanzisafaris.com)

1. In cPanel File Manager, navigate to `/home/safariszanzico/api.zanzisafaris.com/`
2. Ensure the directory exists (create if needed)
3. Upload or ensure these files exist:
   - `server.js` (main entry point)
   - `package.json`
   - `.htaccess` (for Passenger configuration)
   - `.env` file with your environment variables

4. **Create/Update `.htaccess`** in the backend directory:
   ```apache
   # Passenger configuration for Node.js application
   PassengerEnabled on
   PassengerAppType node
   PassengerStartupFile server.js
   PassengerNodejs /home/safariszanzico/nodevenv/api.zanzisafaris.com/18/bin/node
   
   # Trust proxy for correct protocol detection
   # Express app.set('trust proxy', true) will use these headers
   ```

5. **Set up Node.js version** in cPanel:
   - Go to **"Node.js Selector"** in cPanel
   - Select `api.zanzisafaris.com`
   - Choose Node.js version: **18.x**
   - Set Application Root: `/api.zanzisafaris.com`
   - Set Application URL: `https://api.zanzisafaris.com`
   - Set Application Startup File: `server.js`
   - Click **"Save"**

6. **Install dependencies** (first time only):
   ```bash
   # Via SSH or Terminal in cPanel
   cd /home/safariszanzico/api.zanzisafaris.com
   npm install --production
   ```

### 5.2 Frontend Setup (booking.zanzisafaris.com)

1. In cPanel File Manager, navigate to `/home/safariszanzico/booking.zanzisafaris.com/`
2. This directory should contain the **built** files from `zanzitrekking-frontend/dist/`
3. Ensure `index.html` is in the root
4. The GitHub Action will automatically build and deploy the `dist/` folder contents

### 5.3 Dashboard Setup (admin.zanzisafaris.com)

1. In cPanel File Manager, navigate to `/home/safariszanzico/admin.zanzisafaris.com/`
2. This directory should contain the **built** files from `zanzitrekking-dashboard/dist/`
3. Ensure `index.html` is in the root
4. The GitHub Action will automatically build and deploy the `dist/` folder contents

---

## Step 6: Test Deployment

### 6.1 Trigger Manual Deployment

1. Go to your GitHub repository
2. Click **"Actions"** tab
3. You'll see three workflows:
   - Deploy Backend to cPanel
   - Deploy Frontend to cPanel
   - Deploy Dashboard to cPanel
4. Click on any workflow → **"Run workflow"** → **"Run workflow"**

### 6.2 Test Automatic Deployment

1. Make a small change to any file (e.g., update README.md)
2. Commit and push:
   ```bash
   git add .
   git commit -m "Test deployment"
   git push origin main
   ```
3. Go to GitHub → **"Actions"** tab
4. Watch the workflows run automatically
5. Check your cPanel directories to verify files were deployed

### 6.3 Verify Deployment

**Backend:**
- Visit `https://api.zanzisafaris.com/api/home` (or your health check endpoint)
- Check cPanel → Node.js Selector → Application Status

**Frontend:**
- Visit `https://booking.zanzisafaris.com`
- Verify the site loads correctly

**Dashboard:**
- Visit `https://admin.zanzisafaris.com`
- Verify the admin panel loads correctly

---

## Manual Deployment (Alternative)

If GitHub Actions doesn't work, you can deploy manually:

### Backend Manual Deployment:

```bash
# 1. Build/Prepare (on local machine)
cd zanzitrekking-backend
npm install --production

# 2. Upload via FTP/SFTP to:
# /home/safariszanzico/api.zanzisafaris.com/

# 3. SSH into server and install dependencies
cd /home/safariszanzico/api.zanzisafaris.com
npm install --production

# 4. Restart Passenger (if needed)
touch tmp/restart.txt
```

### Frontend Manual Deployment:

```bash
# 1. Build (on local machine)
cd zanzitrekking-frontend
npm install
npm run build

# 2. Upload dist/ folder contents via FTP/SFTP to:
# /home/safariszanzico/booking.zanzisafaris.com/
```

### Dashboard Manual Deployment:

```bash
# 1. Build (on local machine)
cd zanzitrekking-dashboard
npm install
npm run build

# 2. Upload dist/ folder contents via FTP/SFTP to:
# /home/safariszanzico/admin.zanzisafaris.com/
```

---

## Troubleshooting

### GitHub Actions Failures

1. **Check Secrets**: Ensure all required secrets are set correctly
2. **Check FTP Credentials**: Verify FTP host, username, and password
3. **Check Paths**: Ensure server directories exist and are writable
4. **Check Logs**: Review GitHub Actions logs for specific errors

### Backend Issues

1. **Node.js Version**: Ensure Node.js 18 is selected in cPanel
2. **Dependencies**: Run `npm install --production` in the backend directory
3. **Environment Variables**: Ensure `.env` file exists with all required variables
4. **Passenger**: Check Passenger logs in cPanel → Node.js Selector → View Logs

### Frontend/Dashboard Issues

1. **Build Errors**: Check build logs in GitHub Actions
2. **Missing Files**: Ensure all files from `dist/` are uploaded
3. **Routing Issues**: Check if `.htaccess` is needed for React Router

---

## Next Steps

1. ✅ Set up monitoring and error tracking
2. ✅ Configure domain SSL certificates (if not already done)
3. ✅ Set up database backups
4. ✅ Configure environment-specific variables
5. ✅ Set up staging environment (optional)

---

## Support

For issues or questions:
- Check GitHub Actions logs
- Review cPanel error logs
- Contact your hosting provider
