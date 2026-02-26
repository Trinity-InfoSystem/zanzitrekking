# Git Branch Workflow

This document outlines the branching strategy and workflow for the Zanzitrekking project.

## Branch Structure

### Main Branches

- **`main`** → Production branch
  - This branch contains production-ready code
  - Only merged code that has been tested in staging should be merged here
  - Protected branch - requires PR review before merging
  - Deploys directly to production environment

- **`staging`** → Stable testing branch
  - This branch contains stable code ready for testing
  - All feature branches should be merged here first for testing
  - Used for staging/testing environment deployments
  - Should be kept stable and deployable at all times

### Feature Branches

All development work should be done in feature branches following these naming conventions:

- **`feat/feature-name`** - New features
  - Example: `feat/user-authentication`, `feat/payment-integration`
  - Use for implementing new functionality

- **`update/update-name`** - Updates to existing features
  - Example: `update/chat-ui-improvements`, `update/dashboard-layout`
  - Use for enhancing or modifying existing features

- **`fix/bug-name`** - Bug fixes
  - Example: `fix/socket-connection-error`, `fix/login-validation`
  - Use for fixing bugs and issues

## Workflow Process

### 1. Starting New Work

```bash
# Always start from staging branch
git checkout staging
git pull origin staging

# Create your feature branch
git checkout -b feat/your-feature-name
# or
git checkout -b update/your-update-name
# or
git checkout -b fix/your-bug-name
```

### 2. Development

To setup development environment, run `docker compose up -d` to start necessary local containers. For development credentials, lookup in the docker-compose.yml file. The .secrets file in project root, is to test workflow using `act` locally. It must not be commited. If you're testing workflows, make sure you export `PUBLIC_KEY` variable before starting the containers.


- Make your changes
- Commit frequently with clear, descriptive commit messages
- Push your branch to remote

```bash
git add .
git commit -m "feat: add socket authentication middleware"
git push origin feat/your-feature-name
```

### 3. Creating Pull Requests

**Step 1: PR to Staging**
- Create a Pull Request from your feature branch → `staging`
- Request code review from team members
- Address review comments
- Once approved, merge to `staging`

**Step 2: Testing in Staging**
- After merge to `staging`, test thoroughly in staging environment
- Verify all functionality works as expected
- Check for any regressions

**Step 3: PR to Main (Production)**
- Once tested and stable in staging, create PR from `staging` → `main`
- This PR should be reviewed carefully
- Only merge when code is production-ready
- After merge to `main`, deploy to production

### 4. Merge Process

```
Feature Branch → staging (via PR) → main (via PR)
```

**Important Rules:**
- ❌ **NEVER** push directly to `main` or `staging` branches
- ✅ **ALWAYS** use Pull Requests for code review
- ✅ **ALWAYS** test in staging before merging to main
- ✅ **ALWAYS** ensure staging is stable before merging to main

## Pull Request Guidelines

### PR Title Format
- Use descriptive titles: `feat: Add socket authentication`
- Include ticket/issue number if applicable: `fix: Resolve chat connection issue (#123)`

### PR Description Should Include:
- What changes were made
- Why the changes were necessary
- How to test the changes
- Any breaking changes
- Screenshots (for UI changes)

### Code Review Checklist:
- [ ] Code follows project conventions
- [ ] No console.logs or debug code left behind
- [ ] Error handling is implemented
- [ ] Security considerations addressed
- [ ] Tests pass (if applicable)
- [ ] Documentation updated (if needed)

## Branch Naming Examples

### Good Branch Names:
- `feat/socket-authentication`
- `feat/user-profile-page`
- `update/chat-ui-redesign`
- `update/dashboard-performance`
- `fix/message-persistence-bug`
- `fix/login-error-handling`

### Bad Branch Names:
- `feature` (too vague)
- `fix` (not descriptive)
- `update` (not specific)
- `new-stuff` (unclear)
- `test` (confusing)

## Emergency Hotfixes

For critical production bugs that need immediate fixing:

1. Create branch from `main`: `git checkout -b fix/critical-bug-name main`
2. Fix the issue
3. Create PR to `main` (bypass staging for urgent fixes)
4. After merge to `main`, also merge `main` back to `staging` to keep them in sync

## Keeping Branches Updated

Regularly sync your feature branch with staging:

```bash
git checkout feat/your-feature-name
git fetch origin
git merge origin/staging
# Resolve any conflicts
git push origin feat/your-feature-name
```

## Best Practices

1. **Keep branches small**: One feature/fix per branch
2. **Commit often**: Small, logical commits with clear messages
3. **Pull before push**: Always pull latest changes before pushing
4. **Delete merged branches**: Clean up branches after they're merged
5. **Communicate**: Let team know when you're working on shared files
6. **Test locally**: Test your changes before creating PR

## Branch Protection Rules

### Staging Branch
- Require PR reviews (at least 1 approval)
- Require status checks to pass
- No force push allowed

### Main Branch
- Require PR reviews (at least 1 approval)
- Require status checks to pass
- No force push allowed
- Require branches to be up to date before merging

## Questions?

If you have questions about the workflow, ask your team lead or refer to this document.

---

**Last Updated**: February 2026
