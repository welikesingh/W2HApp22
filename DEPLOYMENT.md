# HepatoScan Deployment

This repository is split into two deployable projects:

- `Backend/`: Express API using Supabase Postgres through `DATABASE_URL`
- `Frontend-Web/`: Vercel frontend build that outputs static files to `dist/`

## Backend

Supabase provides the Postgres database. The Node API still needs to run on a web hosting service such as Render, Railway, Fly.io, or another Node-capable host.

1. Create a Supabase project.
2. Copy the Supabase pooled Postgres connection string into `DATABASE_URL`.
3. Deploy `Backend/` as the service root.
4. Use:
   - Build command: `npm install`
   - Start command: `npm start`
5. Add environment variables:
   - `DATABASE_URL`: Supabase Postgres connection string
   - `JWT_SECRET`: long random secret
   - `JWT_EXPIRES_IN`: `7d`
   - `GEMINI_API_KEY`: Google Gemini API key
   - `CORS_ORIGIN`: Vercel frontend URL, for example `https://your-app.vercel.app`
   - `PGSSLMODE`: `require`

The API creates the `users` table automatically on first startup.

## Frontend-Web

Deploy `Frontend-Web/` to Vercel.

Vercel settings:

- Framework preset: Other
- Root directory: `Frontend-Web`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `HSA_API_BASE_URL=https://your-backend-service.example.com`

You can also set the API URL from the app by clicking `API URL`.

## Routes

- `GET /api/health`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `POST /api/analyse`
- `POST /api/advice`
- `POST /api/hepato-analyze`
- `POST /api/hepato-advice`
