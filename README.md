# CivicPlus 🏙️

A full-stack civic issue reporting platform that lets citizens report local problems (potholes, streetlights, garbage, drainage, etc.) and allows government officials to review, prioritise, and resolve them — with **automatic geo-clustering** of nearby duplicate reports.

---

## ✨ Key Features

### For Citizens
| Feature | Details |
|---|---|
| **Report an Issue** | Submit title, description, category, photo & GPS location |
| **Dashboard** | View all your submitted issues with status filters + map |
| **Real-time Updates** | Socket.IO push notifications when govt updates your issue |
| **Upvote** | Support other citizens' issues to raise priority |
| **Cluster Alert** | If 2+ people report the same type of issue within 100 m, you'll see *"X other people reported this nearby"* |

### For Government
| Feature | Details |
|---|---|
| **All Issues** | Paginated grid + filters (status / category / department) |
| **Hotspot Clusters Tab** | See all geo-clusters sorted by reporter count |
| **Single-Action Resolve** | Mark a cluster primary → *all* linked reports resolve automatically + every reporter is notified |
| **Cluster Detail** | Full list of reporters (name, email, phone, date) for any cluster |
| **Live Heatmap** | Leaflet map with colour-coded markers; cluster primaries shown as large orange "hotspot" circles |
| **Stats Panel** | Total / Pending / In-Progress / Resolved counts + category breakdown |

---

## 🧠 Clustering Algorithm

When a citizen submits a new issue:

1. MongoDB `$near` geospatial query finds all existing issues of the **same category** within **100 metres**.
2. If any nearby issue is already a cluster-primary (`isCluster: true`), the new issue is linked to it.
3. Otherwise, the first found nearby issue becomes the primary and the new issue is added as a member.
4. The cluster primary gains:
   - `isCluster: true`
   - `clusterMembers: [ObjectId, ...]` — all duplicates
5. Each member stores `clusterId` pointing back to the primary.

When government resolves the cluster primary:
- Status + remark cascade to **all** `clusterMembers` in one DB operation.
- Every member's citizen receives a Socket.IO notification.

---

## 🗂️ Project Structure

```
CIVIC/
├── backend/                  Express + MongoDB API
│   ├── controllers/
│   │   ├── authController.js
│   │   └── issueController.js   ← cluster logic lives here
│   ├── middleware/
│   ├── models/
│   │   ├── Issue.js             ← clusterId / clusterMembers / isCluster fields
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── issueRoutes.js       ← /clusters + /:id/cluster endpoints
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
└── client/                   React + Vite + Tailwind 4 + Leaflet
    └── src/
        ├── components/
        │   ├── ClusterView.jsx  ← NEW: govt cluster explorer
        │   ├── IssueCard.jsx    ← cluster badge 🔥
        │   ├── IssueMap.jsx     ← orange hotspot markers
        │   ├── Navbar.jsx
        │   └── StatusBadge.jsx
        ├── pages/
        │   ├── CitizenDashboard.jsx
        │   ├── GovernmentDashboard.jsx  ← "Hotspot Clusters" tab
        │   ├── IssueDetail.jsx          ← cluster panel (citizen anon / govt full)
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   └── ReportIssue.jsx
        └── context/
            ├── AuthContext.jsx
            └── SocketContext.jsx
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS 4, React-Leaflet |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) with `2dsphere` geo-index |
| Auth | JWT (7-day expiry) + bcrypt |
| Real-time | Socket.IO |
| File uploads | Multer (local `uploads/issues/`) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB ≥ 6 running locally (or MongoDB Atlas URI)

### Backend

```bash
cd backend
cp .env.example .env      # fill in MONGO_URI, JWT_SECRET
npm install
npm run dev               # http://localhost:5000
```

### Frontend

```bash
cd client
npm install
npm run dev               # http://localhost:5173
```

### Seed government accounts

```bash
cd backend
node seed.js
```

---

## 📡 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register citizen |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/me` | JWT | Current user |

### Issues
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/issues` | citizen | Create + auto-cluster detection |
| GET | `/api/issues/my` | citizen | My issues |
| GET | `/api/issues` | govt | All issues (filterable) |
| GET | `/api/issues/stats` | govt | Dashboard stats |
| GET | `/api/issues/map` | any | All issues for map |
| **GET** | **`/api/issues/clusters`** | **govt** | **All cluster primaries** |
| **GET** | **`/api/issues/:id/cluster`** | **any** | **Cluster info for an issue** |
| GET | `/api/issues/:id` | any | Issue detail |
| PUT | `/api/issues/:id/status` | govt | Update status (cascades to cluster) |
| POST | `/api/issues/:id/upvote` | any | Toggle upvote |
| DELETE | `/api/issues/:id` | govt | Delete |

---

## 🔒 Privacy

- **Citizens** see only the *count* of other nearby reporters — **never names**.
- **Government** see the full reporter list (name, email, phone) for operational purposes.
- Civilian identities within a cluster are never exposed in public-facing API responses.

---

## 📄 License

MIT — built for the CC+Therthex Hackathon 2026.
# CC_Hackathon
