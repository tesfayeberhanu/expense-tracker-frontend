# LP Finance

## Private environment variables

Configure these variables in Vercel for Production, Preview, and Development:

- `API_BASE_URL`: upstream API base URL, without `/transactions`
- `LOGIN_USERNAME`: operator username
- `LOGIN_PASSWORD`: a new strong password
- `SESSION_SECRET`: at least 32 random bytes, used to sign session cookies

Do not prefix any of these with `VITE_`. Vite exposes every `VITE_*` value in
the browser bundle.

The old hardcoded login is already present in Git history. Rotate that password
before deploying this version. The upstream API should also require its own
authentication or restrict traffic to the serverless proxy; hiding its URL alone
does not secure a publicly reachable API.

## Public and protected routes

Public:

- `GET /` and static assets required to render the sign-in page
- `POST /api/login`

Requires a valid signed session:

- `GET /api/session`
- `POST /api/logout`
- `GET /api/transactions`
- `POST /api/transactions`

State-changing API requests also reject cross-site origins.

For local development with Vercel functions:

```sh
cp .env.example .env.local
vercel dev
```
