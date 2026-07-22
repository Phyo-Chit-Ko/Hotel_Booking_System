## Step 1 — Code changes needed before deploying

These are small but required — the code currently hardcodes local URLs.

### 1a. Frontend: stop hardcoding the API URL

`frontend/src/main.jsx` currently has:

```js
axios.defaults.baseURL = "http://127.0.0.1:8000";
```

Change it to read from an environment variable so it can point at whatever URL
Railway gives the backend:

```js
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
```

You will set `VITE_API_BASE_URL` as a Railway variable on the frontend service in Step 4.

### 1b. Backend: allow the deployed frontend origin through CORS

`backend/config/cors.php` currently only allows `localhost:5173` / `localhost:5174`.
Update the `allowed_origins` entry to read from an env var:

```php
'allowed_origins' => array_filter(explode(',', env('FRONTEND_URL', 'http://localhost:5173'))),
```

You will set `FRONTEND_URL` as a Railway variable on the backend service in Step 3.

Commit and push both changes before continuing.

### 1c. Done — the same hardcoded-URL problem existed everywhere else too

`main.jsx` and `cors.php` were only two spots of a project-wide pattern: most
pages/components hardcoded `http://localhost:8000` (or `127.0.0.1:8000`)
instead of reading it from config. Swept the whole frontend and fixed every
instance:

- **Added `apiUrl()` helper** in `frontend/src/utils/apiHeaders.js` — reads
  `import.meta.env.VITE_API_BASE_URL`. Needed because raw `fetch()` calls
  don't pick up `axios.defaults.baseURL`; they were using relative
  `"/api/..."` paths that only worked locally through Vite's dev proxy
  (`vite.config.js`'s `server.proxy['/api']`), which doesn't exist in a
  production build.
- **34 `fetch("/api/...")` call sites across 11 files** now go through
  `apiUrl(...)`: `addReservation.jsx`, `ReservationManagement.jsx`,
  `Payments.jsx`, `ReservationDetailModal.jsx`, `RecordPayment.jsx`,
  `MoveRoomModal.jsx`, `InvoiceView.jsx`, `ExtendStayModal.jsx`,
  `EditReservationModal.jsx`, `ChargesLedgerModal.jsx`, `AddPaymentModal.jsx`.
- **Named `BACKEND_URL`/`API_BASE_URL`/`API` constants (8 files)** now read
  `import.meta.env.VITE_API_BASE_URL` instead of a hardcoded string:
  `Rooms.jsx`, `RoomDetailModal.jsx`, `RestaurantManagement.jsx`,
  `RoomTypeManagement.jsx`, `AddRoomTypeModal.jsx`, `GuestManagement.jsx`,
  `Payments.jsx`, `UserManagement.jsx`.
- **Inline hardcoded axios calls** converted to relative paths (axios already
  gets its base from `main.jsx`'s `axios.defaults.baseURL`): `Register.jsx`,
  `MyBookings.jsx`, `GoogleSuccess.jsx`, `Account.jsx`, `Bookings.jsx`,
  `BookingDetailModal.jsx`, `RoomManagement.jsx`.
- **Inline hardcoded `fetch()`/`window.location.href` calls** (need the
  explicit origin — no axios default to fall back on) now use
  `import.meta.env.VITE_API_BASE_URL`: `AddBookingModal.jsx`,
  `makeWalkInReservation.jsx`, `Account.jsx` (both Google-login redirects).
- **Backend:** `GoogleController.php`'s OAuth callback redirect was
  hardcoded to `http://localhost:5173`; it now uses
  `env('FRONTEND_URL', 'http://localhost:5173')`, same variable as `cors.php`.

Left alone on purpose:
- `vite.config.js`'s dev-server proxy target — only used by `vite dev`
  locally, irrelevant to the production build Railway serves.
- `backend/config/sanctum.php`'s `SANCTUM_STATEFUL_DOMAINS` default — already
  reads from an env var with a localhost fallback, same pattern as `cors.php`.
- A commented-out fetch call in `Profile.jsx` (dead code, not executed).

Added `frontend/.env` (local dev value, gitignored) and `frontend/.env.example`
(committed template) so local dev keeps working with `VITE_API_BASE_URL` now
required instead of hardcoded.