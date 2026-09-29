# CirEcon Data Manager

Private, read-only MongoDB visualization and CSV export console for the CirEcon game database.

## Setup

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

Open `http://localhost:3000`.

Required `.env` values:

```dotenv
ADMIN_USERNAME=admin
ADMIN_PASSWORD=strong-private-password
MONGODB_URI=<complete MongoDB URI>
MONGO_DB_NAME=CirEcon
SESSION_SECRET=<32+ random characters>
```

`MONGO_DB_PW` is not needed when `MONGODB_URI` is complete. Do not commit `.env`.

## Safety

- The application exposes read-only MongoDB operations only.
- Login creates an HttpOnly, signed, same-site session cookie.
- Collection names are verified against MongoDB before querying or exporting.
- CSV export streams records instead of loading the full collection into browser memory.
- Use a MongoDB read-only database user for this application.

## Docker

```powershell
docker build -t cirecon-data-manager .
docker run --rm --env-file .env -p 3000:3000 cirecon-data-manager
```
