# URL Shortener

A simple full-stack URL shortener built with **Node.js, Express and MongoDB Atlas**. Paste a long link, get a short one, and track how many times it has been opened.

## Features

- Shorten any valid `http` / `https` URL
- Redirect from the short link to the original URL
- Click counter for every short link
- Stats lookup (clicks, creation date, original URL) without increasing the click count
- Random 7-character codes generated with Node's `crypto` module
- Input validation: only `http`/`https`, maximum 2048 characters, and links pointing to the app itself are rejected (prevents redirect loops)
- Duplicate-code handling: a new code is generated automatically if a collision happens
- Simple responsive web UI with a Copy button

## Tech Stack

| Part | Technology |
|---|---|
| Runtime | Node.js |
| Web framework | Express 5 |
| Database | MongoDB Atlas (cloud) |
| ODM | Mongoose 9 |
| Config | dotenv |
| Dev tool | nodemon |
| Frontend | HTML, CSS, vanilla JavaScript |

## Project Structure

```
url-shortener/
├── config/
│   └── db.js          # MongoDB connection
├── models/
│   └── Url.js         # Mongoose schema (code, original, clicks, createdAt)
├── routes/
│   └── url.js         # API routes: shorten, stats, redirect
├── public/
│   └── index.html     # Frontend (served statically by Express)
├── server.js          # App entry point
├── .env.example       # Template for environment variables
├── .gitignore
├── package.json
└── README.md
```

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- A free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- Git

## Setup

### 1. Clone and install

```bash
git clone https://github.com/Bhoomika-Goswami/url-shortener.git
cd url-shortener
npm install
```

### 2. Configure MongoDB Atlas

1. Create a free cluster on MongoDB Atlas.
2. **Database Access** → add a database user (username + password).
3. **Network Access** → allow your IP address (use `0.0.0.0/0` only for testing).
4. **Connect → Drivers** → copy the connection string.

### 3. Create the `.env` file

Copy the template and fill in your own values:

```bash
# Windows (PowerShell / CMD)
copy .env.example .env
```

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port the server listens on | `3000` |
| `MONGO_URI` | Atlas connection string (include database name `urlshortener`) | `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/urlshortener?retryWrites=true&w=majority` |
| `BASE_URL` | Public base URL used to build short links | `http://localhost:3000` |

> If your password contains special characters (`@ : / ? # %`), URL-encode them (for example `@` becomes `%40`). Never commit your `.env` file.

### 4. Run the app

```bash
# Development (auto-restart on file changes)
npm run dev

# Production
npm start
```

Expected output:

```
MongoDB connected
Server running on http://localhost:3000
```

Open `http://localhost:3000` in your browser.

## Usage

### Web UI

1. Open `http://localhost:3000`.
2. Paste a long URL and click **Shorten**.
3. Open or copy the generated short link.
4. Use **Check clicks** with the short code (or the full short URL) to see its stats.

### API

#### `POST /shorten`

Creates a short link.

Request body:

```json
{ "url": "https://example.com/some/very/long/path" }
```

Success response (`201 Created`):

```json
{
  "code": "aB3xYz9",
  "shortUrl": "http://localhost:3000/aB3xYz9"
}
```

Error responses (`400 Bad Request`):

```json
{ "error": "url is required" }
{ "error": "Enter a valid http/https URL" }
```

Example (PowerShell):

```powershell
curl.exe -X POST http://localhost:3000/shorten -H "Content-Type: application/json" -d "{\"url\":\"https://example.com\"}"
```

#### `GET /:code`

Redirects (HTTP 302) to the original URL and increases the click count by 1.
Returns `404 Not found` if the code does not exist.

#### `GET /api/stats/:code`

Returns details of a short link **without** changing the click count.

Success response (`200 OK`):

```json
{
  "code": "aB3xYz9",
  "original": "https://example.com/some/very/long/path",
  "clicks": 5,
  "createdAt": "2026-10-21T09:30:00.000Z"
}
```

Returns `404` with `{ "error": "Not found" }` if the code does not exist.

## How It Works

1. `server.js` loads the environment variables, connects to MongoDB, and only then starts the Express server.
2. `POST /shorten` validates the URL, generates a random code, and saves `{ code, original }` in MongoDB. If the code already exists (unique index error `11000`), it retries up to 5 times.
3. `GET /:code` finds the document and increments `clicks` in a single atomic operation (`findOneAndUpdate` with `$inc`), then redirects.
4. `GET /api/stats/:code` only reads the document, so checking stats never affects the count.
5. The static frontend in `public/` talks to these endpoints using `fetch`. User-visible output is inserted with `textContent` to avoid XSS.

## Database Schema

Collection: `urls`

| Field | Type | Notes |
|---|---|---|
| `code` | String | Required, unique (indexed) |
| `original` | String | Required, the original URL |
| `clicks` | Number | Default `0` |
| `createdAt` | Date | Default: current date/time |

## Troubleshooting

| Problem | Fix |
|---|---|
| `querySrv ECONNREFUSED ...mongodb.net` | Your local DNS cannot resolve the Atlas SRV record. `server.js` already sets Google/Cloudflare DNS for Node; if it still fails, try another network or disable VPN/antivirus DNS filtering. |
| `bad auth` / `Authentication failed` | Wrong username or password in `MONGO_URI`. Re-check it (and URL-encode special characters). |
| Connection timeout / IP not allowed | Add your current IP in Atlas → Network Access. |
| `.env` changes not applied | Restart the server (nodemon does not watch `.env`). |
| Short link shows wrong domain | Set `BASE_URL` in `.env` to your public domain when deploying. |

## Future Improvements

- Security hardening: `helmet` headers and rate limiting on `/shorten`
- Centralized error handling for malformed JSON
- Automated tests (Node test runner + supertest)
- Custom aliases and link expiry
- QR code generation
- Deployment on Render / Railway with a production `BASE_URL`

## Author

**Bhoomika Goswami** — Bhoomika-Goswami # Git Username

## License

This project is licensed under the ISC License.


# Short Summary URL Shortener

A simple full-stack URL shortener built with **Node.js, Express and MongoDB Atlas**.
Paste a long link, get a short one, and track how many times it has been opened.

The project includes a REST API for creating and resolving short links, a click counter
for every link, a stats endpoint, and a lightweight web interface served by the same
Express server. Links are stored in MongoDB Atlas, so they remain available after the
server restarts.
