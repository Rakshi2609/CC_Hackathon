# CivicPlus — Frontend

React 19 + Vite 6 + Tailwind CSS 4 SPA for the CivicPlus civic issue reporting platform.

## Stack

| Library | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 6 | Build tool & dev server |
| Tailwind CSS | 4 | Utility-first styling |
| React Router | 6 | Client-side routing |
| Axios | 1.x | HTTP API client |
| React-Leaflet | 5 | Interactive maps |
| Socket.IO Client | 4.x | Real-time push notifications |

## Pages

| Path | Component | Access |
|---|---|---|
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/dashboard` | CitizenDashboard | Citizen |
| `/report` | ReportIssue | Citizen |
| `/issues/:id` | IssueDetail | Any |
| `/gov-dashboard` | GovernmentDashboard | Government |

## Key Components

### `ClusterView` (NEW)
Government-only panel rendering all hotspot clusters. Expandable cards reveal the full reporter list (name, email, phone) for each cluster. Includes a one-click link to the cluster primary's detail page.

### `IssueCard`
Issue card with optional cluster badges:
- 🔥 *"N people reported this issue nearby"* — cluster primary
- 📍 *"Part of a nearby cluster"* — cluster member

### `IssueMap`
Leaflet map with:
- 🔴🟡🟢 Colour-coded status markers
- **Orange oversized circles** for cluster hotspots (radius scales with reporter count)
- Cluster count shown in popup

### `IssueDetail`
- **Citizen view**: Anonymous cluster alert — count only, no names.
- **Government view**: Full reporter table with status badges + cascade hint on the update form.

## Development

```bash
npm install
npm run dev     # http://localhost:5173
```

## Environment

The API base URL defaults to `http://localhost:5000/api`.
To override, edit `src/api/axios.js`.
