# Environment Switching Script

This script automatically switches API URLs between development and production modes.

## How It Works

The script updates the following files:
- `zanzitrekking-frontend/src/api/api.js`
- `zanzitrekking-dashboard/src/api/api.js`
- `zanzitrekking-frontend/src/utils/constants.js`
- `zanzitrekking-dashboard/src/utils/constants.js`

## Automatic Switching (Git Hooks)

**You don't need to run this manually!** Git hooks are set up to automatically:

1. **Before commit** (pre-commit hook): Switches to PRODUCTION mode
   - Your commits will always have production URLs
   - Files are automatically staged

2. **After commit** (post-commit hook): Switches back to DEVELOPMENT mode
   - You can continue working locally with localhost URLs

## Manual Usage

If you need to manually switch modes:

```bash
# Switch to development (localhost)
node scripts/switch-env.js dev

# Switch to production
node scripts/switch-env.js prod
```

## Workflow

1. Work locally with development URLs (localhost:5000)
2. When you commit, the pre-commit hook automatically:
   - Switches files to production URLs
   - Stages the changed files
   - Commits with production URLs
3. After commit, the post-commit hook automatically:
   - Switches files back to development URLs
   - You can continue working locally

**Note:** Your `.env` files are already in `.gitignore` and won't be committed.
