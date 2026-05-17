# Architectural Patterns

Patterns that appear across multiple files in this codebase.

## 1. React Query — Paired Cache Invalidation

Mutations that affect chores always invalidate both `['chores']` and `['calendar']` together, because the calendar view derives from chore data.

See `client/src/components/ChoresPage.jsx` (add/edit/delete mutations) and `client/src/components/CalendarPage.jsx` (completion toggle mutation). Any new mutation touching chore or completion data should follow the same dual-invalidation pattern.

## 2. Modal State via Single `useState`

Pages use a single state variable that is either `null` (closed), a string sentinel (`'add'`), or a record object (edit mode). The modal renders conditionally based on this value.

See `client/src/components/ChoresPage.jsx` — `modalChore` state drives the `<ChoreForm>` modal. Follow this pattern for any new modal dialogs rather than separate `isOpen` + `selectedItem` states.

## 3. Recurrence Serialization at the Route Boundary

`recurrence_days` is a JavaScript array (weekly) or number (monthly) in API responses, but stored as a JSON string or plain string in SQLite. Conversion happens at the route layer on every read and write — not in `db.js` and not on the client.

See `server/routes/chores.js` (serialize on POST/PUT, deserialize on GET) and `server/routes/calendar.js` (deserialize before expansion). Any route that reads `chores` rows must deserialize `recurrence_days` before using it.

## 4. Generator-Based Recurrence Expansion

The calendar route uses a `function*` generator to lazily yield chore occurrence dates for a given window, rather than building an array upfront.

See `server/routes/calendar.js` — `generateOccurrences(chore, windowStart, windowEnd)`. This keeps memory flat regardless of date range size. New recurrence types should be added as a case inside this generator.

## 5. Constraint-Driven HTTP Error Codes

Route handlers inspect SQLite error messages for known constraint names and return specific HTTP status codes rather than generic 500s.

- `FOREIGN KEY constraint` → 409 (e.g., deleting a member with assigned chores)
- `UNIQUE constraint` → 409 (e.g., duplicate member name, duplicate completion)

See `server/routes/members.js` (DELETE handler), `server/routes/chores.js`, `server/routes/completions.js`. Follow this pattern: catch the error, check `err.message`, return 409 with a descriptive message before falling through to the generic 500 handler.

## 6. Centralized API Client

All client-side fetch calls go through a single `request()` helper that sets `Content-Type`, handles JSON parsing, and throws on non-OK responses.

See `client/src/api.js`. Add new API functions here rather than calling `fetch` directly in components. The helper signature is `request(path, options?)`.

## 7. Vite Dev Proxy

In development, Vite proxies `/api/*` to `http://localhost:3001`, so the client can call relative paths like `/api/chores` without CORS issues. In production the Express server serves the built client bundle directly.

See `client/vite.config.js:~8-12` and `server/index.js` (static serving of `../client/dist`).
