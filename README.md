# CivicPlus — Smart Civic Issue Reporting & Resolution Platform

<p align="center">
  <strong>Empowering citizens. Empowering government. Fixing cities — faster.</strong>
</p>

> CivicPlus is a production-grade, full-stack web application built for a hackathon that reimagines how citizens interact with local government. It allows any citizen to report civic infrastructure problems with a photo and GPS location, automatically clusters duplicate nearby reports into hotspots, ranks them by urgency, and gives government officials a real-time command-centre dashboard to manage, prioritise, and cascade resolutions — notifying every affected citizen the moment their issue is resolved.

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Solution Overview](#solution-overview)
3. [Tech Stack](#tech-stack)
4. [System Architecture](#system-architecture)
5. [Feature Deep Dive](#feature-deep-dive)
   - [Authentication & Roles](#authentication--roles)
   - [Reporting an Issue](#reporting-an-issue)
   - [Citizen Dashboard](#citizen-dashboard)
   - [Issue Detail Page](#issue-detail-page)
   - [Government Command Centre](#government-command-centre)
   - [Smart Geo-Clustering](#smart-geo-clustering)
   - [Real-Time Notification System](#real-time-notification-system)
   - [IoT Sensor Simulation](#iot-sensor-simulation)
   - [AI Vision Verification](#ai-vision-verification)
   - [Transparency & Audit Trail](#transparency--audit-trail)
6. [User Flows](#user-flows)
7. [Pages & Routes](#pages--routes)
8. [API Reference](#api-reference)
9. [Data Models](#data-models)
10. [Component Reference](#component-reference)
11. [Design System](#design-system)
12. [Getting Started](#getting-started)
13. [Environment Variables](#environment-variables)
14. [Project Structure](#project-structure)
15. [Key Design Decisions](#key-design-decisions)

---

## Problem Statement

Civic infrastructure in Indian cities degrades silently. A pothole that injures commuters, a broken streetlight that darkens an entire lane, a clogged drain that floods after rain — these problems persist for months because:

1. **No easy reporting channel** — citizens have no simple way to officially log a complaint with evidence.
2. **Duplicate reports go unnoticed** — 50 people may report the same pothole, but the government sees 50 unrelated tickets.
3. **No feedback loop** — once reported, citizens rarely hear back. They don't know if the issue is being worked on, was assigned, or was even seen.
4. **No prioritisation intelligence** — all complaints land in the same inbox with no sense of urgency or geographic clustering.
5. **No accountability** — there is no audit trail of who changed what and when.

---

## Solution Overview

CivicPlus tackles all five problems in one integrated platform:

| Problem              | CivicPlus Solution                                                                        |
| -------------------- | ----------------------------------------------------------------------------------------- |
| No reporting channel | Mobile-friendly photo + GPS report form, works from any browser                           |
| Duplicate reports    | Automatic geo-clustering: reports within 100m of the same category merge into one hotspot |
| No feedback loop     | Real-time Socket.IO push notifications + confetti animation on resolution                 |
| No prioritisation    | Computed urgency score based on cluster size, upvotes, and age                            |
| No accountability    | SHA-256 audit hash on every status change, full public timeline                           |

The platform has two distinct portals sharing one codebase:

- **Citizen Portal** — report, track, upvote, and receive live updates on issues.
- **Government Command Centre** — manage all issues across 4 dynamic views, see live map intelligence, resolve clusters in one click, and track performance analytics.

---

## Tech Stack

### Frontend

| Library                 | Version | Purpose                                            |
| ----------------------- | ------- | -------------------------------------------------- |
| React                   | 19      | UI framework with concurrent rendering             |
| Vite                    | 7       | Lightning-fast build tool & HMR dev server         |
| Tailwind CSS            | 4       | Utility-first CSS with design tokens               |
| React Router DOM        | 6       | Declarative client-side routing with auth guards   |
| Axios                   | 1.x     | HTTP API client with JWT interceptor               |
| React-Leaflet + Leaflet | 5 / 1.9 | Interactive live map with custom markers           |
| Socket.IO Client        | 4.x     | Bidirectional real-time WebSocket communication    |
| lucide-react            | 0.57x   | 1000+ clean SVG icons, tree-shakeable              |
| react-compare-image     | 3.x     | Draggable before/after photo comparison slider     |
| canvas-confetti         | 1.9     | Celebratory confetti animation on issue resolution |

### Backend

| Library                | Version   | Purpose                                      |
| ---------------------- | --------- | -------------------------------------------- |
| Node.js + Express      | 18+ / 4.x | REST API server with ESM modules             |
| MongoDB + Mongoose     | 8.x       | Document database with 2dsphere geo indexing |
| Socket.IO              | 4.x       | Real-time bidirectional event system         |
| JSON Web Token         | 9.x       | Stateless auth — 7-day token expiry          |
| bcryptjs               | 2.x       | Async password hashing (salt rounds: 12)     |
| Multer                 | 1.x       | Multipart image upload to disk storage       |
| dotenv                 | 16.x      | Twelve-factor environment configuration      |
| crypto (Node built-in) | —         | SHA-256 audit hash generation                |

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     Browser — React SPA (Vite :5173)             │
│                                                                  │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐  │
│  │  AuthContext     │  │  SocketContext   │  │  React Router  │  │
│  │  (user, token,  │  │  (socket, notifs,│  │  (protected    │  │
│  │   login/logout) │  │   iotAlerts)     │  │   routes)      │  │
│  └─────────────────┘  └──────────────────┘  └────────────────┘  │
│                                                                  │
│  Pages: Login · Register · CitizenDashboard · ReportIssue        │
│         IssueDetail · GovernmentDashboard                        │
│                                                                  │
│  Components: Navbar · IssueCard · IssueMap · StatusBadge         │
│              ClusterView · IotAlertBanner · TransparencyLoop     │
└──────────────┬────────────────────────┬─────────────────────────┘
               │  Axios (REST + JWT)    │  Socket.IO (WS)
               ▼                        ▼
┌──────────────────────────────────────────────────────────────────┐
│              Node.js / Express Server (:5000)                    │
│                                                                  │
│  Middleware Stack:                                               │
│  cors → express.json → jwtProtect → roleGuard → multerUpload    │
│                                                                  │
│  Routes:                                                         │
│  /api/auth/*   ← register, login, getMe, create-gov             │
│  /api/issues/* ← CRUD + upvote + cluster + stats + map          │
│                                                                  │
│  Socket.IO Rooms: per-user private rooms (userId as room name)  │
│  IoT Simulator: setInterval 30s → iot_ghost_report broadcast    │
│                                                                  │
│  req.io injected by middleware → controllers can emit events     │
└──────────────────────────┬───────────────────────────────────────┘
                           │  Mongoose ODM
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                   MongoDB (Atlas or Local)                       │
│                                                                  │
│  Collections:                                                    │
│  users   — name, email, password (hashed), role, phone          │
│  issues  — full issue doc with 2dsphere index on location        │
│            statusHistory[], clusterMembers[], upvotedBy[]        │
└──────────────────────────────────────────────────────────────────┘
```

**Data flow for a status update:**

1. Government submits form → `PUT /api/issues/:id/status`
2. Controller updates primary issue, computes SHA-256 hash, appends `statusHistory` entry
3. If `clusterMembers.length > 0` → iterates every member, applies same status/remark, appends `[Cluster update]` history entry
4. `req.io.to(citizenId).emit('issue_updated', {...})` fires for every affected citizen
5. Browser receives event → if on that issue's detail page, re-fetches immediately → UI updates live
6. Bell notification added to drawer in Navbar regardless of current page
7. If `status === 'resolved'` and it's the citizen's own issue → confetti fires

---

## Feature Deep Dive

### Authentication & Roles

The platform uses **JWT-based stateless authentication** with two roles:

**Citizen**

- Self-registers at `/register` with name, email, password, phone.
- Role is locked to `citizen` on self-registration — the API strips any attempt to self-assign `government` role.
- JWT stored in `localStorage`, attached to every request via an Axios request interceptor (`Authorization: Bearer <token>`).
- On login, `AuthContext` hydrates the `user` object and persists the session across page refreshes by reading `localStorage` on mount.

**Government**

- Accounts are seeded via a protected `/api/auth/create-gov` endpoint (not accessible through the UI by design).
- Same login flow — JWT payload contains `role: 'government'`.
- Accessing `/gov-dashboard` or any government-only API endpoint without the correct role returns 403.

**Route guards in React Router:**

- `<ProtectedRoute>` wraps all citizen pages — redirects to `/login` if no token is found.
- `<GovRoute>` wraps all government pages — redirects if `user.role !== 'government'`.
- `<PublicRoute>` wraps login/register — redirects to the appropriate dashboard if already logged in (smart redirect based on role).

---

### Reporting an Issue

The `ReportIssue` page is the core citizen-facing submission form. Here is what happens step by step:

1. **Category selection** — citizen picks from 6 categories: Pothole, Streetlight, Garbage, Drainage, Water Leakage, Others. The selection determines the auto-assigned department via `DEPARTMENT_MAP` on the server.

2. **GPS capture** — `navigator.geolocation.getCurrentPosition()` fires on load. Coordinates are stored as `[longitude, latitude]` (GeoJSON order, not the intuitive lat/lng order). A small Leaflet preview map shows the pin.

3. **Photo capture** — `CameraCapture` component offers camera (mobile native, `capture="environment"`) and file picker (desktop) inputs. The image is attached as `multipart/form-data`. Multer saves it to `backend/uploads/issues/<originalname>` and the controller stores the relative URL.

4. **Address field** — optional free-text address stored alongside coordinates and displayed in the detail view.

5. **Submit** — `POST /api/issues` with `multipart/form-data`. The server:
   - Validates lat/lng are numeric and present.
   - Builds `newIssueData`, runs the **geo-clustering query** (see Smart Clustering section).
   - Creates the issue document, optionally joins or creates a cluster.
   - Returns `{ issue, meta: { wasClustered, clusterCount } }`.
   - Emits `new_issue` to all connected government clients.

6. **Feedback** — if `meta.wasClustered === true`, the client shows: _"Your report joined a hotspot — N people have reported this issue too."_

---

### Citizen Dashboard

The `CitizenDashboard` page is the citizen's personal issue tracker.

**Stat cards (top row):**

- **Total Reports** — all issues ever submitted by this citizen.
- **Pending** — unresolved, awaiting assignment.
- **In Progress** — officially being worked on.
- **Resolved** — completed, with resolution photo if uploaded.

Each card has a distinct colour-coded left border (gray / red / amber / green) for at-a-glance status.

**Filter bar:**

- Dropdown for status: All / Pending / In Progress / Resolved.
- Dropdown for category: All + 6 category options.
- Filters are applied server-side via `GET /api/issues/my?status=pending&category=Pothole&page=1&limit=10`.

**Issue list:**

- Each issue rendered as an `IssueCard` component.
- Cards display: title, category dot + label, status badge, upvote count, timestamp, cluster badge if part of a hotspot.
- Clicking any card navigates to `/issues/:id`.

**Pagination:**

- Server returns `{ issues, total, page, pages }`.
- Client renders numbered page buttons and prev/next controls.
- Current page highlighted in blue.

**Geofence banner:**

- `useGeofenceAlerts` hook watches `navigator.geolocation` continuously and checks whether the user's current coordinates are within 500m of any pending hotspot cluster (fetched from `GET /api/issues/clusters`).
- If near a hotspot: `GeofenceBanner` renders a dismissible amber strip at the top: _"You are near a reported hotspot — [Category] issue at ~Xm away."_

**Real-time updates:**

- `SocketContext` listens for `issue_updated` events and appends to `notifications[]` state.
- Bell icon in `Navbar` shows an unread count badge.
- Clicking the bell opens a dropdown drawer listing all notifications with links to affected issues.

---

### Issue Detail Page

`IssueDetail` (`/issues/:id`) is the richest page in the app. It adapts its available actions based on whether the viewer is a citizen or a government official.

#### Shared Elements (all viewers)

**Header photo section:**

- If both `imageUrl` (before photo) and `resolutionPhotoUrl` (after photo) exist → `react-compare-image` renders a draggable left/right slider comparing the issue before and after resolution. This is the strongest proof of fix.
- If only the before photo exists → `TransparencyLoop` renders it with an animated blue scan-bar overlay (CSS `@keyframes` gradient crawl), conveying that the issue is under active monitoring.
- No photo → skeleton gray placeholder.

**Issue metadata card:**

- Title + `StatusBadge` pill displayed side by side in the header.
- Description in full below the title.
- 6-field responsive grid: Category, Department, Reported By (name), Reported At (formatted date), Location (address string or decimal lat/lng), Upvotes.

**Status Timeline:**

- Every entry in `statusHistory[]` rendered as a vertical connected timeline.
- Array is reversed so the most recent change appears at top.
- Each node shows: `StatusBadge`, official remark text, SHA-256 audit hash (first 16 chars, full 64-char hash on tooltip/hover), formatted timestamp, and who made the change.
- Most recent node: coloured filled circle. Older nodes: hollow gray circle.

**Official Remarks:**

- If `issue.governmentRemarks` is populated, a green-tinted `bg-green-50 border-green-200` box displays the latest remark beneath the metadata grid.

#### Citizen-Specific Elements

**Upvote button:**

- Shown only when `user.role === 'citizen'`.
- `POST /api/issues/:id/upvote` toggles the upvote.
- Button turns solid blue when the current user has upvoted; outline style when not.
- Upvote count shown beside the button and reflected in the metadata grid.
- Upvote count feeds into the server-side priority score formula.

**Cluster awareness banner:**

- If `cluster.isInCluster && cluster.totalReports > 1`:
- Amber `bg-amber-50 border-amber-200` banner appears: _"N other people have reported the same issue nearby · HOTSPOT DETECTED · AUTHORITY NOTIFIED."_
- Reporter identities remain anonymous from citizens (privacy by design — only government sees the full reporter list).

**Confetti on resolution:**

- When `issue_updated` socket event arrives with `status === 'resolved'`:
- `canvas-confetti` fires: 120 particles, 80° spread, launching from y=0.7 of the viewport.
- Fires only once per page load, guarded by a `useRef` boolean flag.

#### Government-Specific Elements

**Cluster reporter table:**

- If `cluster.isInCluster === true` and `cluster.reporters` array is populated (the government API route includes reporter details, the citizen route does not):
- Amber banner shows reporter count.
- Table lists each reporter: name, email, report date, current `StatusBadge` for their issue.
- Lets the official confirm the cascade applied correctly to all cluster members.

**Update form (sidebar):**

- Status dropdown: PENDING / IN-PROGRESS / RESOLVED.
- Department dropdown: Roads & Infrastructure, Electrical, Sanitation, Water Management, Public Safety.
- Remark textarea: official message visible to all reporters in their timeline.
- **CASCADE notice**: if `issue.clusterMembers.length > 0`, shows amber banner — _"CASCADE: N REPORTS WILL BE UPDATED"_ — so the official knows the action affects multiple citizens.
- Submit button label changes to _"UPDATE ALL (N)"_ for cluster primaries.

**Delete button:**

- `window.confirm` guard prevents accidental deletion.
- `DELETE /api/issues/:id` hard-deletes the document, then navigates back to `/gov-dashboard`.

---

### Government Command Centre

`GovernmentDashboard` is a full-screen enterprise sidebar layout with four live views. It is designed for prolonged daily use by duty officers.

#### Persistent Sidebar

- CivicPlus brand mark + **GOV PORTAL** subtitle in monospace caps.
- Navigation items: Overview / Reports / Map View / Analytics. Active item: solid blue background + white text.
- **At-a-Glance** stats mini-panel (live counts refreshed on each fetch): Pending, In Progress, Resolved with colour circles.
- Signed-in user info: avatar circle (initials), name, role badge.
- REFRESH button that spins the icon while data is reloading.
- Sign Out.

#### View 1 — Overview

The overview is the "war room" — everything a duty officer needs without switching views.

**Top stat cards (4 across):**

- Total Reports / Pending / In Progress / Resolved.
- Resolution rate shown as a sub-label below the Resolved count (e.g. _"72% rate"_).
- Consistent left-border colour coding (red = pending, amber = in-progress, green = resolved, blue = total).

**Split panel layout (below stats):**

_Left panel — Priority Intelligence (fixed `w-72`):_

- **Category Breakdown**: top 5 categories with colour dot, label, count, and proportional fill bar.
- **Priority Queue**: cluster hotspots sorted by `priorityScore` (descending). Each row shows:
  - Row prefix `#01`, `#02`, etc. for scanning order.
  - Truncated title + category label.
  - Reporter count badge.
  - **URGENT** amber badge if `priorityScore > 5`.
  - Clicking any row navigates directly to that issue's detail page.

_Right panel — Live Civic Intelligence Map:_

- Full `IssueMap` component in the remaining width.
- Plots all issues as coloured circular markers in real-time.

**Recent Reports table (below split panel):**

- Latest 10 issues: #, Title, Category, Status, Upvotes, Citizen name, Reported date.
- Alternating row backgrounds for scanability.
- Clicking any row → navigates to `/issues/:id`.
- "View All" link switches to the Reports view.

#### View 2 — Reports

Full paginated data table with filtering controls.

- Fetch: `GET /api/issues?limit=200` loads all issues with computed priority scores.
- **Client-side pagination**: 20 rows per page with numbered page buttons.
- **Filters**: Status dropdown + Category dropdown, applied client-side with instant results.
- Columns: #, Title, Category (dot + label), Status badge, Upvotes, Citizen name, Reported date.
- Clicking any row opens the issue detail page.

#### View 3 — Map View

Full-height interactive map filling the main content area.

- Colour-coded `CircleMarker`: red (pending), amber (in-progress), green (resolved).
- Cluster hotspot circles: larger semi-transparent orange circles scaled by reporter count.
- Tile layer: OpenStreetMap (open licence, no API key needed).
- Popup on marker click: title, category label, status badge, upvote count, reporter name.

#### View 4 — Analytics

Performance metrics and pattern recognition for reporting to city leadership.

- **Resolution Rate**: large percentage figure + full-width progress bar (green fill proportion).
- **Status Distribution**: three horizontal proportion bars showing pending/in-progress/resolved share of total.
- **Category Distribution**: table of all 6 categories with count and proportional fill bar.
- **Top Hotspots by Priority**: top 5 clusters ranked by priorityScore, with score, cluster size count, and status badge.
- **Average Upvotes per Issue**: total system-wide upvotes divided by total issues.

---

### Smart Geo-Clustering

This is the core intelligence of CivicPlus. The clustering engine runs entirely server-side on every `POST /api/issues`.

**The algorithm step by step:**

```
On new issue submission:
  Find ONE unresolved Issue WHERE:
    - category = new issue's category
    - location is within 100m of new issue's coordinates  ($near + 2dsphere index)

  CASE 1 — No match found:
    → Standalone: save new issue as-is (isCluster: false, clusterMembers: [])

  CASE 2 — Match found, match.clusterMembers.length > 0:
    → The match is already a cluster primary
    → newIssue.clusterId = match._id
    → match.clusterMembers.push(newIssue._id)
    → match.priorityScore += 1
    → save both

  CASE 3 — Match found, match.clusterMembers.length === 0:
    → The match is a standalone being promoted to primary
    → match.isCluster = true
    → match.clusterMembers = [newIssue._id]
    → newIssue.clusterId = match._id
    → match.priorityScore += 1
    → save both
```

**Why MongoDB `$near`:**
MongoDB's 2dsphere index enables sub-millisecond geospatial queries even at scale. `$near` returns the single closest matching document, so new reports always join the nearest existing cluster rather than spawning their own. The 100m radius covers a typical city block — close enough that two reporters definitely see the same pothole/light/drain, far enough to capture reports from both sides of the same street.

**Priority Score Formula (computed at query time):**

```
priorityScore = (upvotes × 0.4 + clusterSize × 0.6) / max(1, daysPending)
```

- `clusterSize = clusterMembers.length + 1` — cluster scale weighted at 0.6 (community scale is the strongest urgency signal)
- `upvotes` — social validation weighted at 0.4
- `daysPending` — time denominator prevents old, low-activity issues from permanently dominating the queue
- The score stored on the document is only the cluster-size increment counter; the full formula is computed in JS per request using live data

**Cascade on status update:**

When government resolves (or updates) a cluster primary:

```
For each _id in primary.clusterMembers:
  memberIssue.status      = newStatus
  memberIssue.governmentRemarks  = remark
  memberIssue.assignedDepartment = department
  memberIssue.statusHistory.push({
    status,
    remark: '[Cluster update] ' + remark,
    auditHash: SHA256(id:status:remark:timestamp),
    updatedAt: now,
    updatedBy: govUserId
  })
  memberIssue.save()
  req.io.to(member.citizen._id.toString()).emit('issue_updated', {
    issueId: member._id,
    status,
    remark,
    clusterUpdate: true
  })
```

Then the primary issue's citizen is also notified. Every citizen whose browser is open on any of the affected issue detail pages receives a live UI update without any manual refresh.

---

### Real-Time Notification System

Built on Socket.IO with **per-user private rooms** using each user's MongoDB `_id` as the room name, ensuring targeted delivery with no cross-user leakage.

**Connection lifecycle:**

1. `SocketContext` mounts when `user` state is non-null (post-login).
2. `io('http://localhost:5000')` establishes the WebSocket connection.
3. Client immediately emits `join_room` with `user._id`.
4. Server's `join_room` handler calls `socket.join(userId)` — that user's private room is now live.
5. On logout, `AuthContext.logout()` clears the token and `SocketContext` cleans up all event listeners.

**Event catalogue:**

| Event              | Direction             | Trigger                         | Payload                                                             |
| ------------------ | --------------------- | ------------------------------- | ------------------------------------------------------------------- |
| `join_room`        | Client → Server       | On mount / login                | `userId: string`                                                    |
| `new_issue`        | Server → All          | Citizen creates issue           | Full issue object                                                   |
| `issue_updated`    | Server → Citizen room | Gov updates primary             | `{ issueId, status, remark }`                                       |
| `issue_updated`    | Server → Citizen room | Cascade to cluster member       | `{ issueId, status, remark, clusterUpdate: true }`                  |
| `status_updated`   | Server → All          | Cluster-wide status broadcast   | `{ clusterId, status }`                                             |
| `iot_ghost_report` | Server → All          | IoT simulator fires (every 30s) | `{ id, sensor, category, title, description, location, timestamp }` |

**Client-side handling:**

- `issue_updated` → appends to `notifications[]` in `SocketContext`, increments unread badge on bell icon.
- `iot_ghost_report` → appends to `iotAlerts[]` (capped at 20 most recent).
- `Navbar` subscribes to `notifications` and renders the count badge + drawer.
- `IotAlertBanner` subscribes to `iotAlerts` and renders the live sensor strip.
- If the user is currently viewing the affected issue's detail page → `fetchIssue()` is called immediately so the entire page updates live.

---

### IoT Sensor Simulation

CivicPlus includes an IoT simulation layer to demonstrate future smart-city integration — sensors autonomously detecting and reporting civic issues without human input.

**How it works:**

Every 30 seconds, the server's `startIoTSimulation()` function:

1. Randomly selects one of 5 pre-configured virtual sensors.
2. Adds ±0.005° coordinate noise (simulates real sensor GPS variance).
3. Constructs a `ghostReport` object with an auto-generated description matching the sensor's fault type.
4. Broadcasts `iot_ghost_report` to **all connected clients** via `io.emit()` (not targeted — government and citizens both see IoT alerts).

**Pre-configured virtual sensors:**

| Sensor ID        | Category    | City      | Fault Message                                        |
| ---------------- | ----------- | --------- | ---------------------------------------------------- |
| Smart Lamp #A12  | Streetlight | New Delhi | Automated fault detected: lamp not responding        |
| Smart Lamp #B07  | Streetlight | Mumbai    | Automated fault detected: lamp not responding        |
| Drain Sensor #D3 | Drainage    | Bengaluru | Water level threshold exceeded                       |
| Road Monitor #R9 | Pothole     | Chennai   | Surface anomaly detected by road sensor              |
| Bin Sensor #G2   | Garbage     | Kolkata   | Bin capacity at 90%+ — requires immediate collection |

**UI presentation:**

`IotAlertBanner` renders a live dismissible alert strip:

- Sensor name and category icon.
- Auto-generated fault description.
- Per-alert dismiss button (removes just that alert from state).
- Persists across page navigation (rendered inside `Navbar`).

In a production deployment, this entire layer would be replaced by actual MQTT or HTTP webhook callbacks from physical city sensors — the frontend contract (`iot_ghost_report` event + payload shape) requires no changes.

---

### AI Vision Verification

`backend/services/aiService.js` provides a plug-in image validation layer powered by **Google Gemini Vision API**.

**What it does:**

- Accepts the uploaded image buffer and the reported category string.
- Sends both to Gemini Pro Vision with the prompt: _"Is this image a real-world photo of a [category] civic issue? Respond strictly with JSON: `{ isReal: boolean, confidence: number, description: string }`."_
- Parses the structured JSON verdict.
- Returns `{ isReal, confidence, description }` to the `createIssue` controller.

**What the controller does with it:**

- Sets `issue.aiVerified = (isReal === true && confidence > 0.75)`.
- Stores the description as `issue.aiDescription` (optional, useful for audit).
- The `aiVerified` field is returned in the API response and shown as a green **"AI VFD"** badge on `IssueCard` components when `true`.

**Why it matters:**

- Prevents spam: a leaking tap photo submitted for category "Pothole" would be rejected or marked unverified.
- Confidence threshold: only marks `aiVerified: true` if Gemini is >75% confident, reducing false positives.
- Non-blocking: if `GEMINI_API_KEY` is absent, the controller skips AI validation and creates the issue normally with `aiVerified: false`.

---

### Transparency & Audit Trail

Every status change is cryptographically logged using SHA-256.

**Hash computation:**

```js
const auditHash = crypto
  .createHash("sha256")
  .update(`${issue._id}:${newStatus}:${remark}:${Date.now()}`)
  .digest("hex");
```

This hash is appended to the `statusHistory` entry. It provides:

- **Tamper evidence** — the hash encodes the exact issue ID, new status, remark text, and Unix timestamp. Any post-hoc modification of the record would make the hash un-reproducible.
- **Public verifiability** — any citizen or third-party auditor can independently re-compute the hash from the 4 visible fields and verify it matches the stored value.
- **Immutable paper trail** — `statusHistory` is append-only; the server never modifies or deletes existing entries.

In the Issue Detail page's status timeline, the first 16 characters of each hash are displayed beneath each status entry. Hovering shows the full 64-character hex string so technically inclined citizens can verify authenticity.

---

## User Flows

### Citizen — Report & Be Notified

```
Register → Login → Report Issue
  ├─ Pick category
  ├─ Allow GPS (browser prompt)
  ├─ Capture/upload photo
  ├─ Submit
  └─ Dashboard shows new Pending issue

                ... time passes ...

Government updates status → Socket fires
  → Notification badge appears on bell icon
  → Open Issue Detail → See new status in timeline + remark
  → If Resolved → Confetti animation fires
```

### Citizen — Discover a Nearby Hotspot

```
Login → CitizenDashboard loads
  → useGeofenceAlerts detects user is ~40m from a Pothole cluster
  → GeofenceBanner renders at top: "You are near a Pothole hotspot ~40m away"
  → Click issue linking to the hotspot primary
  → Issue Detail shows: "2 other people reported this nearby · HOTSPOT DETECTED"
  → Upvote to signal urgency → priorityScore increases on next gov dashboard refresh
```

### Government — Resolve a Cluster

```
Login → GovernmentDashboard → Overview view
  → Priority Queue panel shows: "#01 | Pothole on MG Road | 3 reporters | URGENT"
  → Click → Issue Detail page
  → Cluster reporter table: 3 rows, 2 still Pending
  → Fill: Status=Resolved, Remark="Road repaired - BBMP Zone 4", Department=Roads
  → CASCADE banner: "CASCADE: 2 REPORTS WILL BE UPDATED"
  → Click "UPDATE ALL (3)"
  → All 3 citizens receive socket push notification instantly
  → Analytics view: resolution rate increases
```

---

## Pages & Routes

### Frontend Routes

| Path             | Component           | Requires Auth | Role       | Description                                             |
| ---------------- | ------------------- | ------------- | ---------- | ------------------------------------------------------- |
| `/login`         | Login               | No            | Any        | Email/password login form                               |
| `/register`      | Register            | No            | Any        | Citizen self-registration (role locked to citizen)      |
| `/dashboard`     | CitizenDashboard    | Yes           | Citizen    | Personal issue tracker with stats, filters, pagination  |
| `/report`        | ReportIssue         | Yes           | Citizen    | Submit new issue — GPS, photo, category, address        |
| `/issues/:id`    | IssueDetail         | Yes           | Any        | Full issue view — adapts for citizen vs government role |
| `/gov-dashboard` | GovernmentDashboard | Yes           | Government | 4-view command centre                                   |

---

## API Reference

Full base URL: `http://localhost:5000/api`

### Auth Endpoints

#### `POST /auth/register`

Register a new citizen account.

**Request body:**

```json
{
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "password": "mypassword123",
  "phone": "9876543210"
}
```

**Response `201`:**

```json
{
  "token": "<jwt>",
  "user": {
    "_id": "...",
    "name": "Priya Sharma",
    "email": "...",
    "role": "citizen"
  }
}
```

---

#### `POST /auth/login`

Login with existing credentials.

**Request body:**

```json
{ "email": "priya@example.com", "password": "mypassword123" }
```

**Response `200`:**

```json
{
  "token": "<jwt>",
  "user": { "_id": "...", "name": "Priya Sharma", "role": "citizen" }
}
```

---

#### `GET /auth/me`

Fetch the currently authenticated user's profile.

**Headers:** `Authorization: Bearer <token>`

**Response `200`:**

```json
{
  "_id": "...",
  "name": "Priya Sharma",
  "email": "...",
  "role": "citizen",
  "phone": "..."
}
```

---

#### `POST /auth/create-gov`

Seed a government user (admin tool — not exposed in UI).

**Request body:**

```json
{ "name": "City Admin", "email": "admin@gov.in", "password": "admin@123" }
```

---

### Issue Endpoints

#### `POST /issues`

Create a new issue. Multipart form data.

**Form fields:** `title`, `description`, `category`, `lat`, `lng`, `address`
**File field:** `image` (optional JPG/PNG)

**Response `201`:**

```json
{
  "issue": { "_id": "...", "title": "...", "status": "pending", ... },
  "meta": { "wasClustered": true, "clusterCount": 3 }
}
```

---

#### `GET /issues/my`

Get the authenticated citizen's own issues.

**Query params:** `status`, `category`, `page` (default 1), `limit` (default 10)

**Response `200`:**

```json
{
  "issues": [...],
  "total": 15,
  "page": 1,
  "pages": 2
}
```

---

#### `GET /issues`

Get all issues (government only) with computed priority scores.

**Query params:** `status`, `category`, `department`, `lat`, `lng`, `radius`, `page`, `limit`

**Response `200`:** Array of issue objects, each with `computedScore` field.

---

#### `GET /issues/clusters`

Get all cluster primaries with populated cluster members. Government only.

---

#### `GET /issues/map`

Lightweight issue list for map rendering. Returns `_id`, `title`, `status`, `category`, `location`, `upvotes` only.

---

#### `GET /issues/stats`

Aggregated statistics. Government only.

**Response `200`:**

```json
{
  "total": 120,
  "pending": 45,
  "inProgress": 30,
  "resolved": 45,
  "byCategory": { "Pothole": 30, "Streetlight": 20, ... }
}
```

---

#### `GET /issues/:id`

Full issue document with populated citizen user.

---

#### `GET /issues/:id/cluster`

Cluster context for an issue.

- **Citizen response:** `{ isInCluster: true, totalReports: 3 }` (count only, no identities)
- **Government response:** `{ isInCluster: true, totalReports: 3, reporters: [...], primaryIssue: {...} }`

---

#### `PUT /issues/:id/status`

Update an issue's status. Cascades to all cluster members. Emits Socket.IO events.

**Request body:**

```json
{
  "status": "resolved",
  "remark": "Road repaired by BBMP Zone 4 team",
  "department": "Roads & Infrastructure"
}
```

**Response `200`:**

```json
{
  "issue": { "status": "resolved", "governmentRemarks": "...", ... },
  "cascadeCount": 2
}
```

---

#### `POST /issues/:id/upvote`

Toggle upvote on an issue.

**Response `200`:**

```json
{ "upvotes": 7, "upvotedBy": ["userId1", "userId2", ...] }
```

---

#### `DELETE /issues/:id`

Hard delete an issue. Government only.

---

## Data Models

### User Model (`backend/models/User.js`)

```js
{
  name:      String,  required, trimmed
  email:     String,  required, unique, lowercase, trimmed
  password:  String,  required, bcrypt hashed (salt rounds: 12), select: false
  role:      String,  enum: ['citizen', 'government'], default: 'citizen'
  phone:     String,  optional

  comparePassword(candidatePassword): Boolean  // async bcrypt.compare instance method
}
```

Timestamps: `createdAt`, `updatedAt` managed by Mongoose.

---

### Issue Model (`backend/models/Issue.js`)

```js
{
  // Core content
  title:              String, required, trimmed
  description:        String, required, trimmed
  category:           enum ['Pothole','Streetlight','Garbage','Drainage','Water Leakage','Others']
  imageUrl:           String, default ''       // before-photo relative path
  resolutionPhotoUrl: String, default ''       // after-photo relative path

  // GeoJSON location — 2dsphere index enables $near queries
  location: {
    type:        'Point',
    coordinates: [Number]   // [longitude, latitude]  ← GeoJSON order (lng first)
  }

  // Status
  status:             enum ['pending', 'in-progress', 'resolved'], default 'pending'
  priority:           enum ['low', 'medium', 'high'], default 'medium'

  // Government fields
  governmentRemarks:  String
  assignedDepartment: String

  // Ownership
  citizen:            ObjectId ref 'User', required

  // Append-only audit trail
  statusHistory: [{
    status:    String
    remark:    String
    updatedBy: ObjectId ref 'User'
    updatedAt: Date, default: Date.now
    auditHash: String    // SHA-256('issueId:status:remark:timestamp')
  }]

  // Social signals
  upvotes:            Number, default 0
  upvotedBy:          [ObjectId ref 'User']

  // AI verification
  aiVerified:         Boolean, default false

  // Clustering
  clusterId:          ObjectId ref 'Issue', default null
                      // null = this IS the primary (or standalone)
                      // non-null = this is a member; points to primary
  clusterMembers:     [ObjectId ref 'Issue']
                      // populated only on the primary issue
  isCluster:          Boolean, default false
                      // true when at least one member has been linked
  priorityScore:      Number, default 0
                      // incremented by +1 each time a new member joins
}
```

**Index:** `{ location: '2dsphere' }` — mandatory for `$near` geo-proximity queries.

---

## Component Reference

| Component           | File                               | Detailed Description                                                                                                                                                                                                                                                                                                                                                           |
| ------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Navbar`            | `components/Navbar.jsx`            | Sticky `bg-white border-b border-gray-200` top bar. Left: CivicPlus brand + current page title. Right: `IotAlertBanner` (inline strip before icons), bell icon with animated red unread count badge, user avatar (name initial in blue circle) + dropdown with user info + logout. On mobile collapses gracefully.                                                             |
| `IssueCard`         | `components/IssueCard.jsx`         | Issue summary card with white background, gray border, hover shadow. Shows: title, category dot (colour per category constant) + label, `StatusBadge` right-aligned, upvote count + thumbs-up icon, formatted age timestamp. If `isCluster: true`: amber **HOTSPOT** badge. If `clusterId` (member): gray **IN CLUSTER** badge. If `aiVerified: true`: green **AI VFD** badge. |
| `IssueMap`          | `components/IssueMap.jsx`          | `MapContainer` with OpenStreetMap tiles. Per issue: `CircleMarker` (radius 8, colour by status: red/amber/green). Per cluster primary: additional larger `Circle` (radius 150, orange 30% opacity) representing the ~100m cluster zone. `Popup` on click shows title, category, status badge, upvotes, reporter name.                                                          |
| `StatusBadge`       | `components/StatusBadge.jsx`       | Flat pill badge. Color map: `pending` → `bg-red-100 text-red-700 border-red-200`, `in-progress` → `bg-amber-100 text-amber-700 border-amber-200`, `resolved` → `bg-green-100 text-green-700 border-green-200`. `.mono` font class. `rounded-sm`.                                                                                                                               |
| `ClusterView`       | `components/ClusterView.jsx`       | Government-only expandable cluster cards. Each card: category header, cluster size, priorityScore, expand/collapse toggle. Expanded: table of all reporters (name, email, report date, current status badge). Link button to primary issue detail.                                                                                                                             |
| `GeofenceBanner`    | `components/GeofenceBanner.jsx`    | Amber `bg-amber-50 border-amber-200` banner. Shows category, issue title, approximate distance in metres. Has an × dismiss button that removes it from DOM for this session. Rendered at top of `CitizenDashboard`.                                                                                                                                                            |
| `IotAlertBanner`    | `components/IotAlertBanner.jsx`    | Live IoT sensor alert strip. Each alert: sensor name, category, fault description, dismiss ×. Subscribes to `iotAlerts` from `useSocket()`. Max 20 alerts retained. Displayed inline in Navbar right section.                                                                                                                                                                  |
| `TransparencyLoop`  | `components/TransparencyLoop.jsx`  | Single-photo display. The photo fills the container, and a CSS-animated blue linear-gradient rectangle crawls vertically (repeating `@keyframes` scan) over it as an overlay. Conveys "under active surveillance" status for open issues.                                                                                                                                      |
| `CameraCapture`     | `components/CameraCapture.jsx`     | Two-button interface: **Camera** (`<input accept="image/*" capture="environment">` — opens device camera on mobile) and **Upload** (standard file picker). Both accept JPG/PNG. Selected image previewed in a `<img>` tag below the buttons. Exposes `onCapture(file)` prop.                                                                                                   |
| `ResolveIssueModal` | `components/ResolveIssueModal.jsx` | Modal overlay for quick resolution: status dropdown (defaults to Resolved), remark textarea, department dropdown. Posts to `PUT /api/issues/:id/status` and calls `onSuccess()` prop to refresh parent. Has an × close button and a Cancel button.                                                                                                                             |

---

## Design System

CivicPlus uses a **Flat Enterprise Light Mode** design language — inspired by IBM Carbon Design System and GitHub's enterprise UI. The priority is information density, legibility over extended sessions, and zero visual ambiguity.

### Colour Palette

| Token             | Value                | Usage                                           |
| ----------------- | -------------------- | ----------------------------------------------- |
| Primary blue      | `#0f62fe`            | Primary buttons, active nav, links, focus rings |
| Pending red       | `#da1e28`            | Pending status badges, error states             |
| Resolved green    | `#198038`            | Resolved status badges, success states          |
| In-progress amber | `#f59e0b`            | In-progress badges, warnings, hotspot alerts    |
| Page background   | `#f3f4f6` (gray-100) | All page root backgrounds                       |
| Card surface      | `#ffffff`            | Cards, modals, sidebar                          |
| Border            | `#e5e7eb` (gray-200) | All card and input borders                      |
| Text primary      | `#111827` (gray-900) | Headings, important values                      |
| Text secondary    | `#374151` (gray-700) | Body text                                       |
| Text muted        | `#6b7280` (gray-500) | Timestamps, captions, hints                     |

### Typography

- **`.mono`** — `font-family: ui-monospace, 'Cascadia Code', monospace; letter-spacing: 0.1em; text-transform: uppercase; font-size: 10px` — used for ALL labels, badges, codes, status text, section headers, and identifiers.
- Body text — `text-sm text-gray-700` for content, `text-xs text-gray-500` for metadata/captions.
- Page headings — `text-base font-semibold text-gray-900` (no H1 large headers in-app; enterprise tools prefer density over scale).

### Component Patterns

```
Card:       bg-white border border-gray-200 rounded-sm shadow-none
Panel:      bg-gray-50 border-r border-gray-200 (sidebar panels)
Badge:      bg-[color]-100 text-[color]-700 border border-[color]-200 rounded-sm px-2 py-0.5
Input:      border border-gray-200 bg-white text-sm focus:border-blue-400 focus:outline-none rounded-sm p-2
Btn-primary:     bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-sm px-3 py-1.5
Btn-secondary:   border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs rounded-sm px-3 py-1.5
Btn-destructive: border border-red-200 hover:bg-red-50 text-red-600 text-xs rounded-sm px-3 py-1.5
```

### Design Rules (strictly enforced)

- **No gradients** — solid colours only. Background images limited to photos.
- **No glassmorphism** — no `backdrop-filter`, no `bg-white/50`, no `opacity` tricks.
- **No emojis in UI** — every icon is a `lucide-react` SVG component.
- **No `rounded-lg`** — `rounded-sm` (2px) only for enterprise crispness. `rounded-full` only for avatar circles.
- **No decorative box-shadows** — `shadow-sm` only on hover states to indicate interactivity.
- **Icons are 14–16px** — `size={14}` or `size={16}` to match the `text-xs` / `text-sm` body scale.

### Animations

| Class / Effect    | Description                                                 | Used In                                 |
| ----------------- | ----------------------------------------------------------- | --------------------------------------- |
| `.fade-in`        | opacity 0→1, translateY 4px→0, 300ms ease                   | New cards, toasts, banners appearing    |
| `.skeleton`       | shimmer pulse `bg-gray-200` background-position animation   | Loading placeholders                    |
| `.scan-bar`       | A blue semi-transparent strip crawling vertically in a loop | `TransparencyLoop` photo overlay        |
| `animate-spin`    | Tailwind spin rotation                                      | REFRESH button icon, loading indicators |
| `canvas-confetti` | 120 coloured particles, 80° spread, `startVelocity: 45`     | Resolution celebration                  |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18 (ESM `import`/`export` syntax used throughout backend)
- **MongoDB** — local `mongod` or [MongoDB Atlas](https://cloud.mongodb.com) free tier
- **npm** ≥ 9

### 1. Clone the repository

```bash
git clone https://github.com/Rakshi2609/CC_Hackathon.git
cd CC_Hackathon
```

### 2. Configure backend environment

```bash
cd backend
cp .env.example .env
# Edit .env with your MONGO_URI, JWT_SECRET, etc.
```

### 3. Start the backend

```bash
cd backend
npm install
npm run dev
```

Expected output:

```
[nodemon] starting...
Server running on port 5000
MongoDB connected
IoT Simulation started ← fires every 30 seconds
```

### 4. Start the frontend

```bash
cd client
npm install
npm run dev
```

Expected output:

```
  VITE v7.x.x  ready in NNNms
  → Local:   http://localhost:5173/
```

### 5. Create a government account (required for gov portal)

```bash
curl -X POST http://localhost:5000/api/auth/create-gov \
  -H "Content-Type: application/json" \
  -d '{"name":"City Admin","email":"admin@gov.in","password":"admin@123"}'
```

### 6. Open the application

- **Citizen portal**: open [http://localhost:5173/register](http://localhost:5173/register) — create a citizen account.
- **Government portal**: open [http://localhost:5173/login](http://localhost:5173/login) — log in with the seeded government account.

### Troubleshooting

| Symptom                         | Likely cause                             | Fix                                                                                 |
| ------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------- |
| `MongoServerError: bad auth`    | Wrong MONGO_URI credentials              | Check `backend/.env` MONGO_URI value                                                |
| `CORS error` in browser console | CLIENT_URL mismatch                      | Set `CLIENT_URL=http://localhost:5173` in `backend/.env`                            |
| Socket.IO not connecting        | Port mismatch                            | Confirm backend is on `:5000` and `SocketContext` points to same port               |
| Image upload fails (500)        | Missing uploads directory                | `mkdir -p backend/uploads/issues`                                                   |
| Map shows no tiles              | Leaflet CSS not loaded                   | Ensure `import 'leaflet/dist/leaflet.css'` is in `IssueMap.jsx`                     |
| Cluster not forming             | Old DB data has `isClusterPrimary` field | Run `db.issues.updateMany({}, { $unset: { isClusterPrimary: '' } })` in Mongo shell |

---

## Environment Variables

Create `backend/.env`:

```env
# ── Database ───────────────────────────────────────────────────────────
MONGO_URI=mongodb://localhost:27017/civicplus
# MongoDB Atlas: mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/civicplus

# ── Authentication ─────────────────────────────────────────────────────
JWT_SECRET=replace_with_a_long_random_secret_min_64_chars
JWT_EXPIRES_IN=7d

# ── Server ─────────────────────────────────────────────────────────────
PORT=5000
CLIENT_URL=http://localhost:5173

# ── AI Vision (optional — leave blank to skip AI validation) ───────────
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent
GEMINI_API_KEY=your_google_gemini_api_key_here
```

---

## Project Structure

```
CC_Hackathon/
│
├── README.md                        ← You are here (full documentation)
│
├── backend/                         ← Express + Socket.IO REST API
│   ├── server.js                    Entry point: Express app init, Socket.IO attach,
│   │                                CORS config, static /uploads, IoT simulation start
│   ├── seed.js                      One-off DB seeding script
│   │
│   ├── controllers/
│   │   ├── authController.js        register · login · getMe · createGovAccount
│   │   └── issueController.js       createIssue (geo-clustering)
│   │                                getMyIssues (citizen) · getAllIssues (gov, scored)
│   │                                getIssueById · updateIssueStatus (cascade + socket)
│   │                                deleteIssue · upvoteIssue
│   │                                getStats · getMapIssues
│   │                                getClusters · getGovtClusters · getIssueCluster
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js        Verifies JWT → attaches req.user
│   │   ├── roleMiddleware.js        restrictTo('government') → 403 if wrong role
│   │   └── uploadMiddleware.js      Multer: disk storage → backend/uploads/issues/
│   │
│   ├── models/
│   │   ├── User.js                  Mongoose schema + comparePassword() method
│   │   └── Issue.js                 Full issue schema; 2dsphere index on location
│   │
│   ├── routes/
│   │   ├── authRoutes.js            POST /register · POST /login · GET /me · POST /create-gov
│   │   └── issueRoutes.js           All /api/issues/* routes
│   │
│   ├── services/
│   │   └── aiService.js             validateIssueImage(buffer, category) → Gemini API
│   │
│   ├── utils/
│   │   └── socketHelpers.js         notifyClusterMembers(io, memberIds, payload)
│   │
│   └── uploads/
│       └── issues/                  Multer upload destination (git-ignored)
│
└── client/                          ← React 19 SPA (Vite 7)
    ├── index.html                   HTML entry point
    ├── vite.config.js               Plugins: @vitejs/plugin-react, @tailwindcss/vite
    ├── eslint.config.js
    │
    └── src/
        ├── main.jsx                 ReactDOM.createRoot → <App/>
        ├── App.jsx                  BrowserRouter + all route definitions + auth guards
        ├── index.css                CSS custom properties, .mono, .card, .skeleton,
        │                           .scan-bar, .fade-in, light Leaflet overrides
        │
        ├── api/
        │   └── axios.js             Axios instance: baseURL http://localhost:5000/api
        │                           Request interceptor: Authorization: Bearer <token>
        │
        ├── context/
        │   ├── AuthContext.jsx      useAuth() → { user, token, login, logout }
        │   │                       Persists token/user in localStorage across reloads
        │   └── SocketContext.jsx    useSocket() → { socket, notifications, iotAlerts, markAllRead }
        │                           Handles join_room, issue_updated, iot_ghost_report
        │
        ├── hooks/
        │   └── useGeofenceAlerts.js Polls navigator.geolocation + checks against
        │                           cluster hotspot coordinates → returns nearest alert
        │
        ├── pages/
        │   ├── Login.jsx            Email/password form → AuthContext.login()
        │   ├── Register.jsx         Name/email/password/phone → POST /auth/register
        │   ├── CitizenDashboard.jsx Stats cards · Filter bar · Paginated IssueCard list
        │   │                       GeofenceBanner · Socket notification bell
        │   ├── GovernmentDashboard.jsx  Enterprise sidebar layout, 4 views:
        │   │                           OverviewView (stats+map+priority queue)
        │   │                           ReportsView (full paginated table + filters)
        │   │                           MapView (full-screen IssueMap)
        │   │                           AnalyticsView (charts + metrics)
        │   ├── ReportIssue.jsx      GPS auto-capture · CameraCapture · Category/address form
        │   └── IssueDetail.jsx      Photo comparison/scan · Metadata grid · Status timeline
        │                           Upvote · Cluster banners · Gov update+cascade form
        │                           Confetti on resolution · Socket live-update
        │
        └── components/
            ├── Navbar.jsx            Sticky header · Bell notification drawer · User dropdown
            ├── IssueCard.jsx         Issue summary card with status, cluster, AI badges
            ├── IssueMap.jsx          React-Leaflet map: coloured markers + cluster circles
            ├── StatusBadge.jsx       Flat coloured status pill (3 states)
            ├── ClusterView.jsx       Gov-only expandable cluster reporter cards
            ├── GeofenceBanner.jsx    Dismissible "near hotspot" amber banner
            ├── IotAlertBanner.jsx    Live dismissible IoT sensor alert strip
            ├── ResolveIssueModal.jsx Quick-resolve modal for government users
            ├── CameraCapture.jsx     Camera + file picker input with inline preview
            └── TransparencyLoop.jsx  Single photo + animated blue scan overlay
```

---

## Key Design Decisions

| Decision                                         | Rationale & Trade-offs                                                                                                                                                                                                                                                                             |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **100m cluster radius**                          | Covers a city block without merging distinct problems on different streets. 10m would split same-pothole reports from both sides of the road; 500m would merge entirely different issues across an entire neighbourhood. 100m is the sweet spot for Indian urban density.                          |
| **Flat `clusterMembers[]` array on primary**     | Avoids recursive graph traversal. The primary is the canonical source of truth — cascade is a single `find({ _id: { $in: clusterMembers } })`. Denormalised for read speed; primary must be found first, then members updated, which is predictable and auditable.                                 |
| **Priority score computed at query time**        | Prevents stale priority orderings. Every `GET /api/issues` recomputes using live upvote count and current timestamp. The stored `priorityScore` is only the cluster-increment counter; the full ranking formula uses fresh data.                                                                   |
| **Per-user socket rooms using userId**           | Citizens only receive events for their own issues — no information leakage between users. Government events are broadcast to the `government` room (all gov users). Socket rooms are named by MongoDB `_id` strings — globally unique, no collision risk.                                          |
| **SHA-256 audit hash (no signing key)**          | Provides integrity checking verifiable by any citizen with basic tooling (sha256sum, any online hash tool). Not cryptographically signed (no PKI infrastructure), but sufficient for civic accountability in a hackathon context. Upgradeable to HMAC-SHA256 with a server secret for production.  |
| **Multer disk storage → static middleware**      | Memory storage buffers images in RAM — unsuitable for concurrent uploads in a civic platform. Disk storage is bounded by filesystem, files are accessible via Express `static()`, and URL paths are portable to CDN migration later.                                                               |
| **Role locked on self-registration**             | Prevents privilege escalation. The registration controller strips any `role` field from the request body. Government accounts are seeded by an operator via a direct API call — in production, this endpoint would require a secret header or IP whitelist.                                        |
| **`react-compare-image` before/after slider**    | Visual proof of resolution is more convincing than a text remark. The draggable slider is intuitive on both desktop (mouse drag) and mobile (touch drag). Citizens can independently verify the fix matches their original complaint photo.                                                        |
| **canvas-confetti on resolution**                | Deliberate delight mechanic. Civic issue reporting is inherently frustrating and slow. A small celebration when an issue is actually resolved provides positive reinforcement, encouraging citizens to keep reporting rather than giving up.                                                       |
| **Flat Enterprise light mode UI**                | Government tools are used for long hours on bright monitors alongside printed documents — dark mode causes eye strain in that environment. High-contrast borders, monospace labels, and small text mimic enterprise operations tools (IBM Carbon, Jira, Grafana) that officials are familiar with. |
| **IoT as Socket.IO broadcast vs stored records** | IoT ghost reports are broadcast-only signals — not stored in MongoDB — to keep the demonstration clean. In production, sensor readings would create real issue documents via the same `POST /api/issues` flow, requiring no frontend changes beyond swapping the source.                           |
