# AutoMock

AutoMock is a mock interview and resume analysis application with a React frontend and an Express/Prisma backend.

## Project Structure

```text
AutoMock.Final/
├── backend/
├── client/
├── README.md
└── .gitignore
```

## Local Development

### Backend

```powershell
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:4000` by default.

### Frontend

```powershell
cd client
npm install
npm run dev
```

Frontend runs on `http://localhost:5178`.

## API Wiring

- Frontend requests use `/api/...` paths.
- Backend routes are mounted under `/api`.
- The frontend defaults to `http://localhost:4000` when `VITE_API_URL` is not set.

Optional frontend env file:

```env
VITE_API_URL=http://localhost:4000
```

## Notes

- Backend environment values live in `backend/.env`.
- SQLite/Prisma configuration remains inside `backend/prisma`.
- Static upload files are served from `backend/src/uploads`.

## Author

**Ajoy Debnath**
- GitHub: https://github.com/andrew-garcia7
- LinkedIn: https://linkedin.com/in/ajoy-debnath-795774252
