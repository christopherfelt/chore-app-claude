# Chore App

Full-stack office chore management app — assign recurring/one-time chores to team members, track completions, view on a calendar.

## Tech Stack

| Layer | Tech |
|-------|------|
| Server | Node.js + Express ^4.18 |
| Database | SQLite via `node:sqlite` (Node 22 built-in) |
| Client | React 19 + Vite 8 |
| Routing | React Router v7 |
| Server state | TanStack React Query v5 |
| Styling | Tailwind CSS v3 |
| Calendar | FullCalendar v6 |
| Date math | dayjs |

## Project Structure

```
chore-app-claude/
├── server/
│   ├── index.js          Express entry point, mounts routers
│   ├── db.js             SQLite init, WAL mode, schema execution
│   ├── schema.sql        Table definitions (team_members, chores, chore_completions)
│   └── routes/
│       ├── members.js    CRUD for team members
│       ├── chores.js     CRUD for chores (handles recurrence serialization)
│       ├── completions.js Toggle chore complete/incomplete per date
│       └── calendar.js   Expands recurring chores into FullCalendar events
├── client/
│   ├── src/
│   │   ├── App.jsx       Root with React Router layout and nav
│   │   ├── api.js        Fetch wrapper, all API calls
│   │   └── components/
│   │       ├── CalendarPage.jsx
│   │       ├── ChoresPage.jsx + ChoreForm.jsx
│   │       └── MembersPage.jsx
│   └── vite.config.js    Dev proxy: /api/* → localhost:3001
└── data/
    └── chores.db         SQLite database (gitignored)
```

## Commands

```bash
# Dev (client :5173 + server :3001 in parallel)
npm run dev

# Production
npm run build   # Vite bundle → client/dist/
npm run start   # Server only

# Client only
cd client && npm run lint
cd client && npm run preview
```

## Data Model

Three tables — `team_members`, `chores`, `chore_completions`. See `server/schema.sql` for full definitions.

Key constraint: `recurrence_days` is stored as JSON in SQLite; routes serialize/deserialize on every read and write (`server/routes/chores.js:~30-50`, `server/routes/calendar.js`).

## Adding New Features or Fixing Bugs

> **Before writing any code, create a new git branch.** All work for the feature or fix stays on that branch for the duration of the session.
> ```bash
> git checkout -b <type>/<short-description>   # e.g. feat/add-priorities or fix/calendar-overlap
> ```

1. **Understand the scope.** Read the relevant route(s), component(s), and schema before touching anything. Check `.claude/docs/architectural_patterns.md` for conventions that apply.
2. **Plan the data layer first.** If the change requires a schema addition, update `server/schema.sql` (use `ALTER TABLE` or a new `CREATE TABLE IF NOT EXISTS` block so the migration is idempotent). Restart the server to apply.
3. **Implement server-side.** Add or modify the route in `server/routes/`. Follow existing patterns: serialize `recurrence_days` at the boundary, use constraint-based 409 errors, no logic in `db.js`.
4. **Implement client-side.** Add the API call to `client/src/api.js`, then update or add the component. Use React Query mutations with paired `['chores']` + `['calendar']` invalidation where chore data changes.
5. **Verify end-to-end.** Run `npm run dev` and exercise the feature manually in the browser — the golden path and at least one error case.
6. **Lint.** Run `cd client && npm run lint` and resolve any errors before committing.
7. **Commit.** Stage only the files you changed and write a clear commit message describing *why*, not just what.

## Additional Documentation

- [`.claude/docs/architectural_patterns.md`](.claude/docs/architectural_patterns.md) — recurring design patterns across the codebase (query invalidation, modal state, recurrence expansion, constraint-based error handling)
