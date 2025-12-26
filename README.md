# Hotel System

A full-stack application built with Node.js, Express, React, and Vite.

## Project Structure

```
hotel-system/
├── server/           # Backend Express server
│   ├── index.js     # Server entry point
│   └── routes/      # API routes
├── client/          # Frontend React app
│   ├── src/         # React source files
│   └── vite.config.js
├── .env             # Environment variables
└── package.json     # Root package.json with scripts
```

## Installation

Install dependencies for both backend and frontend:

```bash
npm install
cd client && npm install
```

## Development

Run both frontend and backend concurrently:

```bash
npm run dev
```

Or run them separately:

```bash
npm run server  # Backend on http://localhost:5000
npm run client  # Frontend on http://localhost:3000
```

## Available Scripts

- `npm run dev` - Run both frontend and backend
- `npm run server` - Run backend only
- `npm run client` - Run frontend only
- `npm run build` - Build frontend for production

## Configuration

- Backend runs on port 5000 (configurable in .env)
- Frontend runs on port 3000
- API requests from frontend are proxied to backend via Vite proxy
