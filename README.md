<div align="center">

# 🏙️ CivicPlus

### Smarter Cities Through Connected Citizens

**A full-stack civic issue reporting platform** where citizens report local problems — potholes, broken streetlights, garbage, drainage — and government officials review, prioritise, and resolve them with the help of automatic geo-clustering of nearby duplicate reports.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-6%2B-brightgreen?logo=mongodb)](https://mongodb.com)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey?logo=express)](https://expressjs.com)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-black?logo=socket.io)](https://socket.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> Built for the **CC + Therthex Hackathon 2026**

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Clustering Algorithm](#-clustering-algorithm)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Data Models](#-data-models)
- [Real-time Events](#-real-time-events)
- [Privacy & Security](#-privacy--security)
- [Demo Accounts](#-demo-accounts)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

CivicPlus bridges the gap between citizens and local government by digitising the civic complaint lifecycle — from submission to resolution. Instead of isolated reports getting lost in bureaucracy, CivicPlus **automatically groups duplicate nearby complaints** into hotspot clusters, giving authorities a single merged view of high-impact issues and letting every affected citizen receive a resolution notification in real time.

**Problem it solves:**

- Citizens had no transparent way to track their complaints.
- Government departments were flooded with duplicate reports for the same pothole or broken light.
- No real-time feedback loop between resolution and citizens.

**How CivicPlus solves it:**

- Every new issue is geo-checked against existing reports. Duplicates are merged into a cluster hotspot automatically.
- Government resolves a cluster once → all member citizens are notified simultaneously via WebSocket.
- Citizens see live status updates and a live map of all issues in their city.

---

## ✨ Key Features

### 👤 For Citizens

| Feature                     | Details                                                                         |
| --------------------------- | ------------------------------------------------------------------------------- |
| **Report an Issue**         | Submit title, description, category, optional photo & GPS coordinates           |
| **Camera Capture**          | Snap a photo directly with the device camera or upload from gallery             |
| **My Dashboard**            | View all your submitted issues with status filters and a live interactive map   |
| **Real-time Notifications** | Socket.IO push alert the moment government updates your issue status            |
| **Upvote Issues**           | Vote up other citizens' issues to signal community priority                     |
| **Cluster Alert**           | Notified anonymously when 2+ others reported the same issue type within 100 m   |
| **Status Tracking**         | Follow the `Pending → In Progress → Resolved` lifecycle with government remarks |

### 🏛️ For Government Officials

| Feature                           | Details                                                                                 |
| --------------------------------- | --------------------------------------------------------------------------------------- |
| **All Issues Board**              | Paginated grid with filters — status, category, assigned department                     |
| **Hotspot Clusters Tab**          | All geo-clusters sorted by reporter count with full reporter details                    |
| **Single-Action Cascade Resolve** | Resolve the cluster primary → all linked reports auto-resolve + every reporter notified |
| **Cluster Reporter List**         | Full reporter table: name, email, phone, submission date                                |
| **Live Heatmap**                  | Leaflet map with colour-coded markers; cluster hotspots as oversized orange circles     |
| **Stats Dashboard**               | Counts for Total / Pending / In-Progress / Resolved + category breakdown                |
| **Department Assignment**         | Assign which department is responsible for each issue                                   |
| **Status History Log**            | Full audit trail of every status change with actor and timestamp                        |

---

## 🧠 Clustering Algorithm

When a citizen submits a new issue, the backend runs this logic automatically:

```
New Issue Submitted
        │
        ▼
$near geo-query (same category, within 100 m)
        │
   ┌────┴─────┐
   │          │
No match    Match found
   │          │
Standalone    ┌──────────────────────┐
issue         │                      │
         Already a cluster?     Standalone nearby?
              │                      │
         Link to existing       Make it the primary,
         cluster primary        add new issue as member
```

**Cluster primary fields set:**

- `isCluster: true`
- `clusterMembers: [ObjectId, ...]` — array of all duplicate issue IDs

**Member fields set:**

- `clusterId` → ObjectId pointing to the primary

**On government cascade resolve:**

1. Primary issue status + remarks updated in DB.
2. Bulk-update all `clusterMembers` with the same status and remarks.
3. Emit `issue_updated` Socket.IO event to every member citizen's personal room.
4. Citizens receive a real-time toast notification in their browser.

---

## 🗂️ Project Structure

```
CC_Hackathon/
│
├── backend/                          # Node.js + Express REST API
│   ├── controllers/
│   │   ├── authController.js         # register, login, /me
│   │   └── issueController.js        # CRUD + clustering + upvote + stats
│   ├── middleware/
│   │   ├── authMiddleware.js         # JWT verification
│   │   ├── roleMiddleware.js         # citizen / government role guard
│   │   └── uploadMiddleware.js       # Multer config for issue photos
│   ├── models/
│   │   ├── Issue.js                  # GeoJSON, cluster fields, status history
│   │   └── User.js                   # name, email, password (bcrypt), role, phone
│   ├── routes/
│   │   ├── authRoutes.js             # /api/auth/*
│   │   └── issueRoutes.js            # /api/issues/* + /clusters + /:id/cluster
│   ├── uploads/
│   │   └── issues/                   # Uploaded issue photos (static-served)
│   ├── seed.js                       # Sample issues + demo accounts seeder
│   ├── server.js                     # Express app, Socket.IO, DB connection
│   └── package.json
│
└── client/                           # React 19 + Vite SPA
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx                   # Router setup + protected routes
        ├── api/
        │   └── axios.js              # Axios instance with base URL + JWT interceptor
        ├── components/
        │   ├── CameraCapture.jsx     # Native camera / file-upload picker
        │   ├── ClusterView.jsx       # Government hotspot explorer panel
        │   ├── IssueCard.jsx         # Card with cluster 🔥 badge
        │   ├── IssueMap.jsx          # Leaflet map, hotspot orange circles
        │   ├── Navbar.jsx            # Responsive nav with role-aware links
        │   └── StatusBadge.jsx       # Colour-coded status pill
        ├── context/
        │   ├── AuthContext.jsx       # Auth state, login/logout, token persistence
        │   └── SocketContext.jsx     # Socket.IO connection + room join
        └── pages/
            ├── CitizenDashboard.jsx  # My issues + filters + map
            ├── GovernmentDashboard.jsx # All issues + hotspot tab + stats
            ├── IssueDetail.jsx       # Full issue view + cluster info (role-aware)
            ├── Login.jsx             # Email + password login
            ├── Register.jsx          # Citizen registration
            └── ReportIssue.jsx       # New issue form with GPS + photo
```

---

## 🛠️ Tech Stack

### Backend

| Technology   | Version | Purpose                            |
| ------------ | ------- | ---------------------------------- |
| Node.js      | ≥ 18    | JavaScript runtime                 |
| Express      | 4.x     | REST API framework                 |
| MongoDB      | ≥ 6     | Primary database                   |
| Mongoose     | 8.x     | ODM + schema validation            |
| Socket.IO    | 4.x     | Real-time bidirectional events     |
| jsonwebtoken | 9.x     | Stateless JWT auth tokens          |
| bcryptjs     | 2.x     | Password hashing (salt rounds: 12) |
| Multer       | 1.x     | Multipart file upload handling     |
| dotenv       | 16.x    | Environment variable loading       |
| nodemon      | 3.x     | Dev auto-restart                   |

### Frontend

| Technology              | Version     | Purpose                          |
| ----------------------- | ----------- | -------------------------------- |
| React                   | 19          | UI framework                     |
| Vite                    | 7.x         | Build tool and dev server        |
| Tailwind CSS            | 4.x         | Utility-first styling            |
| React Router DOM        | 6.x         | Client-side SPA routing          |
| Axios                   | 1.x         | HTTP client with JWT interceptor |
| React-Leaflet / Leaflet | 5.x / 1.9.x | Interactive maps                 |
| Socket.IO Client        | 4.x         | Real-time push notifications     |

### Infrastructure Choices

| Concern            | Solution                                       |
| ------------------ | ---------------------------------------------- |
| Geospatial queries | MongoDB `2dsphere` index + `$near` operator    |
| Authentication     | JWT Bearer token, 7-day expiry                 |
| File storage       | Local disk `uploads/issues/`, served as static |
| CORS               | Restricted to `CLIENT_URL` env variable        |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18 — [Download](https://nodejs.org)
- **MongoDB** ≥ 6 — [Local](https://www.mongodb.com/try/download/community) or [Atlas](https://cloud.mongodb.com)
- **Git** — [Download](https://git-scm.com)

### 1. Clone the repository

```bash
git clone https://github.com/your-org/civicplus.git
cd civicplus
```

### 2. Set up the Backend

```bash
cd backend

# Copy env template and fill in your values
cp .env.example .env

npm install
npm run dev
# → API running at http://localhost:5000
```

### 3. Set up the Frontend

Open a **new terminal**:

```bash
cd client
npm install
npm run dev
# → App running at http://localhost:5173
```

### 4. Seed Demo Data (recommended)

Populates 15+ realistic civic issues across Bengaluru, Mysuru, Mangaluru, Hubballi + a demo citizen account:

```bash
cd backend
node seed.js
```

### 5. Access the app

| URL                                           | Description      |
| --------------------------------------------- | ---------------- |
| `http://localhost:5173`                       | React frontend   |
| `http://localhost:5000`                       | Express REST API |
| `http://localhost:5000/uploads/issues/<file>` | Uploaded photos  |

---

## ⚙️ Environment Variables

Create `backend/.env`:

```env
# MongoDB connection string
MONGO_URI=mongodb://localhost:27017/civicplus

# Secret key for signing JWTs (use a long random string)
JWT_SECRET=your_super_secret_jwt_key_here

# Port for the Express server (default: 5000)
PORT=5000

# URL of the React frontend (for CORS + Socket.IO)
CLIENT_URL=http://localhost:5173
```

> **Never commit `.env` to source control.** It is already in `.gitignore`.

Frontend API base URL (edit for production):

```js
// client/src/api/axios.js
baseURL: "http://localhost:5000/api";
```

---

## 📡 API Reference

### Authentication

| Method | Endpoint             | Auth | Body                            | Description              |
| ------ | -------------------- | ---- | ------------------------------- | ------------------------ |
| `POST` | `/api/auth/register` | —    | `name, email, password, phone?` | Register a new citizen   |
| `POST` | `/api/auth/login`    | —    | `email, password`               | Login, returns JWT token |
| `GET`  | `/api/auth/me`       | JWT  | —                               | Get current user profile |

### Issues

| Method   | Endpoint                  | Auth    | Description                                                     |
| -------- | ------------------------- | ------- | --------------------------------------------------------------- |
| `POST`   | `/api/issues`             | Citizen | Create issue + auto-cluster detection                           |
| `GET`    | `/api/issues/my`          | Citizen | My own issues                                                   |
| `GET`    | `/api/issues`             | Govt    | All issues (`status`, `category`, `department`, `page` filters) |
| `GET`    | `/api/issues/stats`       | Govt    | Counts by status and category                                   |
| `GET`    | `/api/issues/map`         | Any     | Lightweight list for map rendering                              |
| `GET`    | `/api/issues/clusters`    | Govt    | All cluster primaries with member details                       |
| `GET`    | `/api/issues/:id`         | Any     | Single issue detail                                             |
| `GET`    | `/api/issues/:id/cluster` | Any     | Cluster info (reporters anonymised for citizens)                |
| `PUT`    | `/api/issues/:id/status`  | Govt    | Update status + remarks (cascades to cluster)                   |
| `POST`   | `/api/issues/:id/upvote`  | Any     | Toggle upvote                                                   |
| `DELETE` | `/api/issues/:id`         | Govt    | Delete issue                                                    |

#### Create Issue (multipart/form-data)

```http
POST /api/issues
Authorization: Bearer <citizen-token>
Content-Type: multipart/form-data

title       = "Deep pothole on Main Street"
description = "30 cm deep, causing accidents daily"
category    = "Pothole"
lat         = 12.9177
lng         = 77.6233
address     = "Main Street, City"
image       = <file>   (optional)
```

#### Update Issue Status

```http
PUT /api/issues/:id/status
Authorization: Bearer <govt-token>
Content-Type: application/json

{
  "status": "resolved",
  "governmentRemarks": "Pothole filled and road resurfaced.",
  "assignedDepartment": "Roads & Infrastructure"
}
```

### Issue Categories

```
Pothole | Streetlight | Garbage | Drainage | Water Leakage | Others
```

### Issue Statuses & Priority

```
Status:   pending → in-progress → resolved
Priority: low | medium | high
```

---

## 🗃️ Data Models

### User

```json
{
  "name": "string (required)",
  "email": "string (required, unique)",
  "password": "bcrypt hash (select: false)",
  "role": "citizen | government",
  "phone": "string (optional)",
  "avatar": "string URL (optional)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Issue

```json
{
  "title": "string (required)",
  "description": "string (required)",
  "category": "Pothole | Streetlight | Garbage | Drainage | Water Leakage | Others",
  "imageUrl": "string (relative upload path)",
  "location": {
    "type": "Point",
    "coordinates": "[longitude, latitude]  ← 2dsphere indexed",
    "address": "string"
  },
  "status": "pending | in-progress | resolved",
  "priority": "low | medium | high",
  "citizen": "ObjectId → User",
  "assignedDepartment": "string",
  "governmentRemarks": "string",
  "statusHistory": [
    {
      "status": "string",
      "remark": "string",
      "updatedBy": "ObjectId → User",
      "updatedAt": "Date"
    }
  ],
  "upvotes": "number",
  "upvotedBy": "[ObjectId → User]",
  "isCluster": "boolean  ← true = this is cluster primary",
  "clusterMembers": "[ObjectId → Issue]  ← only on primary",
  "clusterId": "ObjectId → Issue    ← only on members",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## ⚡ Real-time Events (Socket.IO)

### Client → Server

| Event       | Payload          | Description                                             |
| ----------- | ---------------- | ------------------------------------------------------- |
| `join_room` | `userId: string` | Citizen joins their personal notification room on login |

### Server → Client

| Event           | Payload                                  | Trigger                                                                                    |
| --------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------ |
| `issue_updated` | `{ issueId, status, governmentRemarks }` | Emitted when government updates an issue status (including cascade to all cluster members) |

#### Example usage

```js
// Join personal room after login (SocketContext.jsx)
socket.emit("join_room", user._id);

// Listen for government status updates
socket.on("issue_updated", ({ issueId, status, governmentRemarks }) => {
  showToast(`Your issue was marked: ${status}`);
  // optionally refresh issue list
});
```

---

## 🔒 Privacy & Security

| Concern               | Implementation                                                                   |
| --------------------- | -------------------------------------------------------------------------------- |
| **Password storage**  | bcrypt, salt rounds = 12; `select: false` on schema field                        |
| **Authentication**    | JWT Bearer token, 7-day expiry, verified through `authMiddleware.js`             |
| **Role enforcement**  | `roleMiddleware.js` checks `user.role` on every protected route                  |
| **Cluster anonymity** | Citizens receive **only the count** of nearby reporters — no names/emails/phones |
| **Government access** | Full reporter list available only to authenticated `government` users            |
| **File uploads**      | Multer restricts MIME types; stored server-locally                               |
| **CORS**              | Restricted to `CLIENT_URL` environment variable                                  |

---

## 🧑‍💻 Demo Accounts

After running `node seed.js`:

| Role    | Email              | Password   |
| ------- | ------------------ | ---------- |
| Citizen | `demo@citizen.com` | `demo1234` |

> Government accounts cannot be self-registered via the UI. Create them directly in the database or extend the seed script.

---

## 🗺️ Category → Department Mapping

| Category      | Assigned Department    |
| ------------- | ---------------------- |
| Pothole       | Roads & Infrastructure |
| Streetlight   | Electricity Department |
| Garbage       | Solid Waste Management |
| Drainage      | Water & Sanitation     |
| Water Leakage | Water & Sanitation     |
| Others        | General Administration |

---

## 🧪 Development Scripts

### Backend (`cd backend`)

```bash
npm run dev     # nodemon — auto-restart on file changes
npm start       # node server.js (production)
node seed.js    # seed demo issues + citizen account
```

### Frontend (`cd client`)

```bash
npm run dev     # Vite dev server with HMR at :5173
npm run build   # Production build → dist/
npm run preview # Preview production build locally
npm run lint    # ESLint check
```

---

## 🚢 Deployment Notes

### Backend

- Set `NODE_ENV=production`.
- Use a process manager: `pm2 start server.js --name civicplus-api`
- Point `MONGO_URI` to MongoDB Atlas.
- Set `CLIENT_URL` to your frontend production domain.

### Frontend

- Run `npm run build` in `client/` → static files in `dist/`.
- Deploy `dist/` to Netlify, Vercel, Firebase Hosting, or Nginx.
- Update `src/api/axios.js` `baseURL` to the production API URL.

### Nginx reverse proxy (example)

```nginx
location /api {
    proxy_pass http://localhost:5000;
}
location /uploads {
    proxy_pass http://localhost:5000;
}
location / {
    root /var/www/civicplus/dist;
    try_files $uri /index.html;
}
```

---

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request.

Please follow [Conventional Commits](https://www.conventionalcommits.org/).

---

## 📄 License

[MIT](LICENSE) — built with ❤️ for the **CC + Therthex Hackathon 2026**.
