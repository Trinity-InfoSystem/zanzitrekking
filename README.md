# Zanzitrekking Deployment

Monorepo for Zanzitrekking project containing:
- **Backend** (`zanzitrekking-backend/`) - Node.js/Express API server
- **Frontend** (`zanzitrekking-frontend/`) - React/Vite booking website
- **Dashboard** (`zanzitrekking-dashboard/`) - React/Vite admin dashboard

## Project Structure

```
.
├── zanzitrekking-backend/     # API server (api.zanzisafaris.com)
├── zanzitrekking-frontend/     # Booking website (booking.zanzisafaris.com)
├── zanzitrekking-dashboard/    # Admin dashboard (admin.zanzisafaris.com)
└── .github/
    └── workflows/             # GitHub Actions deployment workflows
```

## Deployment

This project uses GitHub Actions to automatically deploy to cPanel when code is pushed to the main branch.

### Deployment Targets

- **Backend**: `api.zanzisafaris.com` → `/home/safariszanzico/api.zanzisafaris.com/`
- **Frontend**: `booking.zanzisafaris.com` → `/home/safariszanzico/booking.zanzisafaris.com/`
- **Dashboard**: `admin.zanzisafaris.com` → `/home/safariszanzico/admin.zanzisafaris.com/`

## Setup Instructions

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Local Development

### Backend
```bash
cd zanzitrekking-backend
npm install
npm run server
```

### Frontend
```bash
cd zanzitrekking-frontend
npm install
npm run dev
```

### Dashboard
```bash
cd zanzitrekking-dashboard
npm install
npm run dev
```
