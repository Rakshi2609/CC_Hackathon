# CivicPlus — Frontend

React 19 + Vite 7 + Tailwind CSS 4 SPA for the CivicPlus platform.

See the **[full project README](../README.md)** for complete documentation including all features, pages, components, design system, and setup instructions.

## Quick start

```bash
npm install
npm run dev   # Vite dev server on :5173
```

## Pages

| Path             | Component           | Access     |
| ---------------- | ------------------- | ---------- |
| `/login`         | Login               | Public     |
| `/register`      | Register            | Public     |
| `/dashboard`     | CitizenDashboard    | Citizen    |
| `/report`        | ReportIssue         | Citizen    |
| `/issues/:id`    | IssueDetail         | Any        |
| `/gov-dashboard` | GovernmentDashboard | Government |

## Key Components

### `ClusterView` (NEW)

Government-only panel rendering all hotspot clusters. Expandable cards reveal the full reporter list (name, email, phone) for each cluster. Includes a one-click link to the cluster primary's detail page.

### `IssueCard`

Issue card with optional cluster badges:

- 🔥 _"N people reported this issue nearby"_ — cluster primary
- 📍 _"Part of a nearby cluster"_ — cluster member

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
