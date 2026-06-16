# LP Finance

## Frontend and API

This repository is the Vite/React frontend only.

The backend API is hosted separately on DigitalOcean App Platform from the
`tesfayeberhanu/expense-tracker-backend` repository. Vercel rewrites `/api/*`
requests to that DigitalOcean backend, so the browser continues to call
same-origin URLs such as `/api/login` and `/api/transactions`.

No frontend environment variables are required. MongoDB credentials and other
backend-only secrets belong in the DigitalOcean backend app, never in Vercel for
this frontend.

## Public and protected routes

Public:

- `GET /` and static assets required to render the sign-in page
- `POST /api/login`

Requires a valid database-backed session:

- `GET /api/session`
- `POST /api/logout`
- `GET /api/settings`
- `PUT /api/settings`
- `GET /api/configuration`
- `GET /api/transactions`
- `POST /api/transactions`
- `PUT /api/password`
- `PUT /api/username`

State-changing API requests also reject cross-site origins.
Direct browser navigation to `/api/transactions` is rejected; authenticated
dashboard requests continue to use the endpoint normally.

For local frontend development:

```sh
npm install
npm run dev
```
