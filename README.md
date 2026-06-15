# LP Finance

## Private environment variables

Configure these variables in Vercel for Production, Preview, and Development:

- `MONGO_URI`: MongoDB connection string used for all persisted application data
- `BOOTSTRAP_USERNAME`: username used only to create the first database user
- `BOOTSTRAP_PASSWORD`: password used only to create the first database user;
  it must contain between 12 and 256 characters

Do not prefix any of these with `VITE_`. Vite exposes every `VITE_*` value in
the browser bundle.

On the first login, the app creates a user in MongoDB with a scrypt password
hash. After that first user exists, the bootstrap variables are no longer used
for authentication and can be removed. Passwords can be changed from Settings.

Transactions previously stored by an upstream `API_BASE_URL` are not migrated
automatically. Export them to CSV from the old deployment and import that CSV
after deploying this version.

MongoDB collections:

- `transactions`: transaction records
- `dashboardsettings`: profile and notification settings
- `dashboardconfigurations`: operator/pipeline and currency lists
- `users`: usernames and password hashes
- `sessions`: active login sessions with automatic expiration

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

State-changing API requests also reject cross-site origins.
Direct browser navigation to `/api/transactions` is rejected; authenticated
dashboard requests continue to use the endpoint normally.

For local development with Vercel functions:

```sh
cp .env.example .env.local
vercel dev
```
