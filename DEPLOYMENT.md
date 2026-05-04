# HepatoScan Deployment

This repository is split into two deployable projects:

- `Backend/`: Express API using Render Postgres through `DATABASE_URL`
- `Frontend-Web/`: Vercel frontend build that outputs static files to `dist/`

## Backend

Render provides both the Node web service and the Postgres database.

1. Create or open the Render Postgres database.
2. Copy the Render database connection string into the backend web service `DATABASE_URL`.
3. Deploy `Backend/` as the service root.
4. Use:
   - Build command: `npm install`
   - Start command: `npm start`
5. Add environment variables:
   - `DATABASE_URL`: Render Postgres connection string
   - `JWT_SECRET`: long random secret
   - `JWT_EXPIRES_IN`: `7d`
   - `GEMINI_API_KEY`: Google Gemini API key
   - `CORS_ORIGIN`: `https://w2-h-app22.vercel.app`
   - `FRONTEND_URL`: `https://w2-h-app22.vercel.app`
   - `PGSSLMODE`: `require`

For the current Render database, use the username `postgres` exactly. If the copied URL starts with `postgresql://postgress:...`, correct it to `postgresql://postgres:...` before saving it.

The API creates the `users` table automatically on first startup.

## Frontend-Web

Deploy `Frontend-Web/` to Vercel.

Vercel settings:

- Framework preset: Other
- Root directory: `Frontend-Web`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `HSA_API_BASE_URL=https://w2happ22.onrender.com`

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
