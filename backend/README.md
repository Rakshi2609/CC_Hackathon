# CivicPlus — Backend API

> Node.js + Express + MongoDB REST API with Socket.IO real-time events, JWT authentication, geo-clustering, and file uploads.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Data Models](#-data-models)
- [Geo-Clustering Logic](#-geo-clustering-logic)
- [Real-time (Socket.IO)](#-real-time-socketio)
- [Authentication & Middleware](#-authentication--middleware)
- [File Uploads](#-file-uploads)
- [Database Seeding](#-database-seeding)
- [Scripts](#-scripts)

---

## 🌟 Overview

This is the backend service for **CivicPlus** — a civic issue reporting platform. It exposes a RESTful JSON API consumed by the React frontend and pushes real-time status update notifications to connected citizens via Socket.IO.

Key responsibilities:

- **User auth** — JWT-based registration/login with bcrypt-hashed passwords.
- **Issue lifecycle** — CRUD, status transitions with history, upvoting.
- **Geo-clustering** — Automatic MongoDB `$near` grouping of nearby duplicate reports.
- **Real-time events** — Socket.IO rooms per user; emits `issue_updated` on cascade resolve.
- **File storage** — Multer saves uploaded photos to `uploads/issues/`, served as static files.

---

## 🛠️ Tech Stack

| Package      | Version | Purpose                             |
| ------------ | ------- | ----------------------------------- |
| Node.js      | ≥ 18    | Runtime                             |
| Express      | 4.x     | HTTP framework                      |
| MongoDB      | ≥ 6     | Database                            |
| Mongoose     | 8.x     | ODM + schema validation             |
| Socket.IO    | 4.x     | WebSocket real-time events          |
| jsonwebtoken | 9.x     | JWT creation & verification         |
| bcryptjs     | 2.x     | Password hashing (salt rounds: 12)  |
| Multer       | 1.x     | Multipart file upload               |
| dotenv       | 16.x    | `.env` environment variable loading |
| cors         | 2.x     | Cross-origin resource sharing       |
| nodemon      | 3.x     | Dev hot-reload (devDependency)      |

---

## 🗂️ Project Structure

```
backend/
├── controllers/
│   ├── authController.js       # register, login, getMe
│   └── issueController.js      # createIssue (cluster detect), getIssues,
│                               # getIssueById, updateStatus (cascade),
│                               # upvoteIssue, deleteIssue, getStats,
│                               # getMapIssues, getClusters, getClusterInfo
├── middleware/
│   ├── authMiddleware.js       # verifyToken — decodes JWT, attaches req.user
│   ├── roleMiddleware.js       # requireRole(...roles) — 403 if role mismatch
│   └── uploadMiddleware.js     # Multer config, diskStorage → uploads/issues/
├── models/
│   ├── Issue.js                # Mongoose schema with 2dsphere index
│   └── User.js                 # Mongoose schema with pre-save bcrypt hook
├── routes/
│   ├── authRoutes.js           # POST /register, POST /login, GET /me
│   └── issueRoutes.js          # All /api/issues/* endpoints
├── uploads/
│   └── issues/                 # Uploaded photos (git-ignored)
├── seed.js                     # Populates demo issues + citizen account
├── server.js                   # App entry — Express, Socket.IO, DB connect
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB ≥ 6 running locally **or** a MongoDB Atlas connection string

### Install & run

```bash
cd backend

# Copy env template
cp .env.example .env
# Edit .env with your MONGO_URI and JWT_SECRET

npm install
npm run dev
# → Server at http://localhost:5000
```

### Verify

```bash
curl http://localhost:5000
# {"message":"CivicPlus API running 🚀"}
```

---

## ⚙️ Environment Variables

| Variable     | Required | Default                               | Description                                              |
| ------------ | -------- | ------------------------------------- | -------------------------------------------------------- |
| `MONGO_URI`  | ✅       | `mongodb://localhost:27017/civicplus` | MongoDB connection string                                |
| `JWT_SECRET` | ✅       | —                                     | Secret for signing JWT tokens (use a long random string) |
| `PORT`       | —        | `5000`                                | Port the HTTP server listens on                          |
| `CLIENT_URL` | —        | `http://localhost:5173`               | Frontend origin — used for CORS + Socket.IO              |

Create `backend/.env`:

```env
MONGO_URI=mongodb://localhost:27017/civicplus
JWT_SECRET=replace_with_a_long_random_secret
PORT=5000
CLIENT_URL=http://localhost:5173
```

---

## 📡 API Reference

Base path: `/api`

### Auth routes (`/api/auth`)

| Method | Path        | Auth | Body                                | Response          |
| ------ | ----------- | ---- | ----------------------------------- | ----------------- |
| `POST` | `/register` | —    | `{ name, email, password, phone? }` | `{ token, user }` |
| `POST` | `/login`    | —    | `{ email, password }`               | `{ token, user }` |
| `GET`  | `/me`       | JWT  | —                                   | `{ user }`        |

### Issue routes (`/api/issues`)

| Method   | Path           | Auth        | Description                                                      |
| -------- | -------------- | ----------- | ---------------------------------------------------------------- |
| `POST`   | `/`            | Citizen JWT | Create issue + auto-clustering                                   |
| `GET`    | `/my`          | Citizen JWT | My submitted issues                                              |
| `GET`    | `/`            | Govt JWT    | All issues (filters: `status`, `category`, `department`, `page`) |
| `GET`    | `/stats`       | Govt JWT    | Summary counts by status + category                              |
| `GET`    | `/map`         | Any JWT     | Lightweight list for map rendering                               |
| `GET`    | `/clusters`    | Govt JWT    | All cluster primaries with populated members                     |
| `GET`    | `/:id`         | Any JWT     | Single issue detail                                              |
| `GET`    | `/:id/cluster` | Any JWT     | Cluster data for issue (anonymised for citizens)                 |
| `PUT`    | `/:id/status`  | Govt JWT    | Update status + cascade to cluster members                       |
| `POST`   | `/:id/upvote`  | Any JWT     | Toggle upvote                                                    |
| `DELETE` | `/:id`         | Govt JWT    | Delete issue                                                     |

#### Create Issue — multipart/form-data

```
POST /api/issues
Authorization: Bearer <token>

Fields:
  title        string (required)
  description  string (required)
  category     Pothole|Streetlight|Garbage|Drainage|Water Leakage|Others
  lat          number (required)
  lng          number (required)
  address      string
  image        file   (optional, image/*)
```

#### Update Status — JSON

```json
PUT /api/issues/:id/status
Authorization: Bearer <govt-token>

{
  "status": "resolved",
  "governmentRemarks": "Fixed by Roads dept.",
  "assignedDepartment": "Roads & Infrastructure"
}
```

---

## 🗃️ Data Models

### User

```js
{
  name:      String (required)
  email:     String (required, unique, lowercase)
  password:  String (bcrypt, select:false)
  role:      'citizen' | 'government'  (default: 'citizen')
  phone:     String
  avatar:    String
  timestamps: true
}
```

**Hooks:**

- `pre('save')` — bcrypt hashes the password if modified (salt rounds: 12).
- `methods.comparePassword(candidate)` — returns `bcrypt.compare(...)`.

### Issue

```js
{
  title:              String (required)
  description:        String (required)
  category:           enum['Pothole','Streetlight','Garbage','Drainage','Water Leakage','Others']
  imageUrl:           String
  location: {
    type:             'Point'               // GeoJSON
    coordinates:      [Number]              // [longitude, latitude]
    address:          String
  }
  status:             enum['pending','in-progress','resolved']  (default:'pending')
  priority:           enum['low','medium','high']               (default:'medium')
  citizen:            ObjectId → User (required)
  assignedDepartment: String
  governmentRemarks:  String
  statusHistory: [{
    status:    String
    remark:    String
    updatedBy: ObjectId → User
    updatedAt: Date
  }]
  upvotes:            Number  (default:0)
  upvotedBy:          [ObjectId → User]

  // Clustering fields
  isCluster:          Boolean  (default:false)
  clusterMembers:     [ObjectId → Issue]
  clusterId:          ObjectId → Issue  (default:null)

  timestamps: true
}

Index: { location: '2dsphere' }
```

---

## 🧠 Geo-Clustering Logic

Location: `controllers/issueController.js` → `createIssue`

```
1. After saving the new issue, run a $near query:
   Issue.find({
     location: { $near: { $geometry: newIssue.location, $maxDistance: 100 } },
     category: newIssue.category,
     _id: { $ne: newIssue._id }
   })

2. If no nearby issues → standalone issue. Done.

3. If nearby issues exist:
   a. Find the cluster primary among them (isCluster: true) — or use the first match.
   b. If an existing primary is found:
      - Add newIssue._id to primary.clusterMembers
      - Set newIssue.clusterId = primary._id
   c. If no primary yet:
      - Make the first nearby issue the primary (isCluster = true)
      - Add newIssue to its clusterMembers
      - Set newIssue.clusterId = that issue's _id
      - Set that issue's clusterId = null (it's now primary)

4. Save all modified documents.
```

**Cascade resolve** (`updateStatus`):

```
1. Update primary issue status + remarks + push to statusHistory.
2. Issue.updateMany({ _id: { $in: primary.clusterMembers }}, { status, governmentRemarks })
3. For each member issue's citizen, emit:
   io.to(citizenId).emit('issue_updated', { issueId, status, governmentRemarks })
```

---

## ⚡ Real-time (Socket.IO)

The `io` instance is created in `server.js` and attached to every request as `req.io`.

### Events

| Direction       | Event           | Payload                                  | Description                                 |
| --------------- | --------------- | ---------------------------------------- | ------------------------------------------- |
| Client → Server | `join_room`     | `userId: string`                         | Client joins personal notification room     |
| Server → Client | `issue_updated` | `{ issueId, status, governmentRemarks }` | Status changed on an issue the citizen owns |

### Room convention

Each citizen joins a room named after their MongoDB `_id`. The server emits `issue_updated` with `io.to(citizenId.toString()).emit(...)`.

---

## 🔐 Authentication & Middleware

### `authMiddleware.js` — `verifyToken`

```js
// Extracts JWT from Authorization: Bearer <token>
// Verifies with JWT_SECRET
// Attaches decoded payload to req.user
// Returns 401 if missing or invalid
```

### `roleMiddleware.js` — `requireRole(...roles)`

```js
// Checks req.user.role against allowed roles array
// Returns 403 Forbidden if role not permitted
// Used as: router.get('/stats', verifyToken, requireRole('government'), handler)
```

### `uploadMiddleware.js` — Multer

```js
// diskStorage: uploads/issues/<timestamp>-<random>-<originalname>
// fileFilter: accepts image/* MIME types only
// Field name: 'image'
// Max size: not restricted (configure as needed)
```

---

## 📁 File Uploads

Uploaded images are saved to `backend/uploads/issues/` and served as static files:

```js
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
```

Access uploaded files at:

```
http://localhost:5000/uploads/issues/<filename>
```

The `imageUrl` field in the Issue document stores the relative path (e.g., `uploads/issues/1234567890-photo.jpg`).

> The `uploads/issues/` directory is git-ignored. Ensure it exists before running in production or let Multer create it automatically.

---

## 🌱 Database Seeding

```bash
node seed.js
```

Creates:

- **Demo citizen**: `demo@citizen.com` / `demo1234`
- **15+ issues** across Bengaluru, Mysuru, Mangaluru, Hubballi with realistic titles, categories, coordinates, and statuses (pending/in-progress/resolved).

Seeder is idempotent — re-running skips already-existing records.

---

## 📜 Scripts

```bash
npm run dev    # nodemon server.js  — auto-restart on changes
npm start      # node server.js     — production start
node seed.js   # seed demo data
```

---

## 🚢 Production

1. Set `NODE_ENV=production`.
2. Use PM2: `pm2 start server.js --name civicplus-api`
3. Use MongoDB Atlas; set `MONGO_URI` in environment.
4. Set `CLIENT_URL` to your deployed frontend domain.
5. Use a reverse proxy (Nginx/Caddy) to terminate TLS and forward to port 5000.
