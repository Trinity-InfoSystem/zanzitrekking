# Achievements, Impact Stats, and Clients Migration

This migration seeds the database with initial data for achievements, impact stats, and clients.

## How to Run the Migration

1. Make sure your MongoDB connection is configured in `.env`
2. Navigate to the backend directory:
   ```bash
   cd zanzitrekking-backend
   ```
3. Run the migration:
   ```bash
   node migrations/seedAchievementsData.js
   ```

## What This Migration Does

- Seeds **5 certifications** (TATO, KGA, TTGA, TGS, KPAP)
- Seeds **3 awards** (TripAdvisor Excellence, Best Safari Operator, Safety Excellence)
- Seeds **7 impact statistics** (donations, taxes, carbon offset, etc.)
- Seeds **15 client companies** (Google, Microsoft, Amazon, etc.)

## Note

The migration will insert data into the database. If you want to clear existing data first, uncomment the delete lines in the migration file.

## After Migration

1. The data will be available via API endpoints:
   - `/api/achievements-active` - Get all active achievements
   - `/api/impact-stats-active` - Get all active impact stats
   - `/api/clients-active` - Get all active clients

2. You can manage this data through the dashboard (once dashboard pages are created)

