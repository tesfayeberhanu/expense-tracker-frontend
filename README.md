# LP Finance

## Frontend and API

This repository is the Vite/React frontend only.

The backend API is hosted separately on DigitalOcean App Platform from the
`tesfayeberhanu/expense-tracker-backend` repository. The frontend sends all API
requests through `VITE_API_BASE_URL`.

`VITE_API_BASE_URL` is required for local development and production builds. For
example:

```sh
VITE_API_BASE_URL=https://lbk-finance-backend-og73n.ondigitalocean.app/api/
```

MongoDB credentials and other backend-only secrets belong in the DigitalOcean
backend app, never in Vercel for this frontend.

## Public and protected API routes

These paths are relative to `VITE_API_BASE_URL`.

Public:

- `GET /` and static assets required to render the sign-in page
- `POST login`

Requires a valid database-backed session:

- `GET session`
- `POST logout`
- `GET settings`
- `PUT settings`
- `GET configuration`
- `GET transactions`
- `POST transactions`
- `PUT password`
- `PUT username`

State-changing API requests also reject cross-site origins.
Direct browser navigation to the transaction endpoint is rejected; authenticated
dashboard requests continue to use it normally.

For local frontend development:

```sh
nvm use
npm install
npm run dev
```

The Vite npm scripts also read `.nvmrc` and use that Node version automatically
when it is installed through nvm.

For production builds, use the same Node version:

```sh
nvm use
npm run build
```
