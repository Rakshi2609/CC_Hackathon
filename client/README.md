# CivicPlus — Frontend

> React 19 + Vite 7 + Tailwind CSS 4 single-page application for the CivicPlus civic issue reporting platform.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Pages & Routes](#-pages--routes)
- [Components](#-components)
- [Context Providers](#-context-providers)
- [API Layer](#-api-layer)
- [Real-time Notifications](#-real-time-notifications)
- [Getting Started](#-getting-started)
- [Environment](#-environment)
- [Build & Deploy](#-build--deploy)
- [Scripts](#-scripts)

---

## 🌟 Overview

The CivicPlus frontend is a fully client-side React SPA that provides two distinct user experiences:

- **Citizens** — report civic issues with GPS + photo, track status, receive real-time notifications, and see nearby clusters on a live map.
- **Government officials** — manage all issues, explore hotspot clusters, cascade-resolve duplicates, and view live heatmaps.

Authentication is handled via JWT stored in `localStorage`. Protected routes redirect unauthenticated users to `/login` and unauthorised roles to their home dashboard.

---

## 🛠️ Tech Stack

| Library          | Version | Purpose                           |
| ---------------- | ------- | --------------------------------- |
| React            | 19      | UI component framework            |
| Vite             | 7.x     | Build tool, dev server, HMR       |
| Tailwind CSS     | 4.x     | Utility-first CSS styling         |
| React Router DOM | 6.x     | Client-side SPA routing           |
| Axios            | 1.x     | HTTP client with JWT interceptor  |
| Leaflet          | 1.9.x   | Open-source map engine            |
| React-Leaflet    | 5.x     | React wrapper for Leaflet         |
| Socket.IO Client | 4.x     | WebSocket real-time notifications |
| ESLint           | 9.x     | Linting with React hooks plugin   |

---

## 🗂️ Project Structure

```
client/
├── index.html
├── vite.config.js
├── eslint.config.js
├── package.json
└── src/
    ├── main.jsx                  # ReactDOM.createRoot + BrowserRouter
    ├── App.jsx                   # Route definitions + protected route wrappers
    ├── App.css
    ├── index.css                 # Tailwind base styles
    │
    ├── api/
    │   └── axios.js              # Axios instance — baseURL + JWT Bearer interceptor
    │
    ├── assets/                   # Static assets (images, icons)
    │
    ├── context/
    │   ├── AuthContext.jsx       # Auth state, login(), logout(), token persistence
    │   └── SocketContext.jsx     # Socket.IO init, join_room on login, disconnect on logout
    │
    ├── components/
    │   ├── CameraCapture.jsx     # Camera / file picker for photo capture
    │   ├── ClusterView.jsx       # Govt-only: hotspot cluster explorer panel
    │   ├── IssueCard.jsx         # Issue card with status badge + cluster indicator
    │   ├── IssueMap.jsx          # Leaflet map with status markers + hotspot circles
    │   ├── Navbar.jsx            # Responsive top navigation bar
    │   └── StatusBadge.jsx       # Colour-coded status pill (pending/in-progress/resolved)
    │
    └── pages/
        ├── Login.jsx             # Login form
        ├── Register.jsx          # Citizen registration form
        ├── CitizenDashboard.jsx  # My issues list + filters + map view
        ├── GovernmentDashboard.jsx # All issues board + hotspot clusters tab + stats
        ├── IssueDetail.jsx       # Full issue view with cluster panel (role-aware)
        └── ReportIssue.jsx       # New issue submission form
```

---

## 🗺️ Pages & Routes

| Path             | Component             | Access          | Description                      |
| ---------------- | --------------------- | --------------- | -------------------------------- |
| `/login`         | `Login`               | Public          | Email + password login           |
| `/register`      | `Register`            | Public          | Citizen account creation         |
| `/dashboard`     | `CitizenDashboard`    | Citizen only    | My issues, filters, map          |
| `/report`        | `ReportIssue`         | Citizen only    | Submit a new civic issue         |
| `/issues/:id`    | `IssueDetail`         | Authenticated   | Full issue detail + cluster info |
| `/gov-dashboard` | `GovernmentDashboard` | Government only | Manage all issues + clusters     |

**Route protection:**

- Unauthenticated users are redirected to `/login`.
- Citizens accessing `/gov-dashboard` are redirected to `/dashboard`.
- Government users accessing citizen-only routes are redirected to `/gov-dashboard`.

---

## 🧩 Components

### `CameraCapture`

A photo input component supporting:

- **Camera capture** via `<input type="file" accept="image/*" capture="environment">` for mobile.
- **File upload** fallback for desktop.
- Inline preview of the selected image before submission.

Used in `ReportIssue.jsx`.

---

### `ClusterView`

Government-only hotspot explorer panel. Features:

- Fetches all cluster primaries from `GET /api/issues/clusters`.
- Renders expandable cards sorted by reporter count.
- Each card shows the full reporter table: name, email, phone, submission date.
- One-click navigation to the cluster primary's `IssueDetail` page.
- Loading skeleton + empty state handling.

---

### `IssueCard`

Compact issue card displaying:

- Title, category, status badge, upvote count, submission date.
- **Cluster badges:**
  - 🔥 _"N people reported this nearby"_ — shown on cluster primaries.
  - 📍 _"Part of a nearby cluster"_ — shown on cluster members.
- Click navigates to `/issues/:id`.

---

### `IssueMap`

Interactive Leaflet map component:

- **Colour-coded markers:** 🔴 Pending · 🟡 In Progress · 🟢 Resolved.
- **Orange oversized circles** for cluster hotspot primaries (radius scales with `clusterMembers.length`).
- Popup on each marker shows title, category, status, and cluster count.
- Used in both `CitizenDashboard` and `GovernmentDashboard`.

---

### `Navbar`

Responsive top navigation bar:

- Shows **CivicPlus** logo + role-aware navigation links.
- Citizen links: Dashboard, Report Issue.
- Government links: Dashboard (with issue count badge).
- Logout button clears auth context and redirects to `/login`.

---

### `StatusBadge`

Reusable status pill component:

- `pending` → yellow badge
- `in-progress` → blue badge
- `resolved` → green badge

---

## 🔑 Context Providers

### `AuthContext`

Provides throughout the app:

```js
const { user, token, login, logout, isAuthenticated } = useAuth();
```

- On mount, reads `token` from `localStorage` and decodes the user.
- `login(token)` — saves to `localStorage`, updates state.
- `logout()` — clears `localStorage`, resets state, disconnects socket.

### `SocketContext`

Provides throughout the app:

```js
const socket = useSocket();
```

- Connects to the backend Socket.IO server on mount.
- Automatically emits `join_room` with the current user's ID on connection.
- Disconnects when the user logs out.
- Components can attach event listeners: `socket.on('issue_updated', handler)`.

---

## 🌐 API Layer

`src/api/axios.js` exports a pre-configured Axios instance:

```js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

Import and use anywhere:

```js
import api from "../api/axios";
const res = await api.get("/issues/my");
```

---

## ⚡ Real-time Notifications

When a government official updates an issue status, the backend emits `issue_updated` to the affected citizen's Socket.IO room. The frontend handles it in the component that needs it:

```js
import { useSocket } from "../context/SocketContext";

const socket = useSocket();

useEffect(() => {
  socket.on("issue_updated", ({ issueId, status, governmentRemarks }) => {
    // show toast, refresh issue list, etc.
    toast.success(`Issue status updated to: ${status}`);
    refetchIssues();
  });
  return () => socket.off("issue_updated");
}, [socket]);
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- Backend API running at `http://localhost:5000` (see `backend/README.md`)

### Install & Run

```bash
cd client
npm install
npm run dev
# → http://localhost:5173
```

---

## ⚙️ Environment

The API base URL is hardcoded in `src/api/axios.js`. To change it:

```js
// src/api/axios.js
baseURL: "https://your-production-api.example.com/api";
```

For a proper `.env` setup, you can switch to:

```js
baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api";
```

And create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📦 Build & Deploy

```bash
# Production build
npm run build
# Output: dist/

# Preview the production build locally
npm run preview
```

Deploy the `dist/` folder to any static host:

- **Netlify** — drag & drop or connect Git repo.
- **Vercel** — `vercel deploy`.
- **Firebase Hosting** — `firebase deploy`.
- **Nginx** — serve `dist/` with `try_files $uri /index.html`.

> Make sure to set the `VITE_API_URL` environment variable (or update `axios.js`) to point to your production backend URL before building.

---

## 📜 Scripts

```bash
npm run dev      # Vite dev server with HMR at http://localhost:5173
npm run build    # Production build → dist/
npm run preview  # Serve dist/ locally for inspection
npm run lint     # ESLint with React hooks + react-refresh rules
```
