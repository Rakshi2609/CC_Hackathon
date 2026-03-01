# CivicPlus — Smart Civic Issue Reporting Platform

> **Empower citizens. Empower government. Fix cities faster.**
>
> A production-ready civic issue reporting platform with smart geo-clustering, real-time notifications, transparent audit trails, and role-based dashboards for citizens and government officials.

---

## Quick Navigation

- [Key Features](#key-features-summary)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Setup](#environment-setup)
- [API Endpoints](#api-endpoints-quick-reference)
- [Troubleshooting](#troubleshooting)

---

## Key Features

| Feature                        | Description                                                                                               |
| ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| **📸 Photo Reports**           | Citizens capture infrastructure issues with GPS location, category, and description                       |
| **🤖 AI Verification**         | Image validation and automatic issue categorization                                                       |
| **📍 Smart Geo-Clustering**    | Automatically groups similar reports within 100m radius into hotspots, eliminating duplicates             |
| **⚡ Priority Scoring**        | Issues ranked by urgency: cluster size, age, upvotes, severity                                            |
| **🗺️ Interactive Map**         | Live map visualization with custom markers for each issue cluster                                         |
| **🔔 Real-Time Notifications** | WebSocket-powered instant updates on issue status changes via Socket.IO                                   |
| **👥 User Profiles**           | Separate profile pages for citizens (track reported issues) and government (view managed issues)          |
| **📊 Government Dashboard**    | Command center to manage, prioritize, reassign, and resolve issues with bulk actions                      |
| **🎯 Status Tracking**         | Transparent issue timeline with full audit trail of all status changes                                    |
| **✅ Issue Resolution**        | Government can mark issues resolved, automatically notify all affected citizens with confetti celebration |
| **🔐 JWT Authentication**      | Stateless auth with role-based access control (citizen/government)                                        |
| **📋 Role-Based Access**       | Citizen and Government portals with separate views and permissions                                        |
| **💾 File Upload**             | Multer-powered image uploads with validation and secure storage                                           |
| **🏠 Responsive Design**       | Mobile-first UI optimized for all devices using Tailwind CSS                                              |

---

## Tech Stack

### Frontend

- React 18 + Vite 7, Tailwind CSS 4, React Router DOM 6, Axios, Socket.IO Client, React-Leaflet, lucide-react icons
  - Cloudinary (images served from Cloudinary via backend)

### Backend

- Node.js 18+, Express 4, MongoDB + Mongoose, JWT authentication, Socket.IO, Multer file uploads, Google Gemini Vision API (optional)

---

## Screenshots

### Citizen Portal

- **Landing Page** — Hero section showcasing platform benefits, features, and call-to-action buttons
- **Report Issue** — Mobile-first form with photo capture, GPS location, category selection
- **Citizen Dashboard** — Grid view of all reported issues with status badges and filters
- **Issue Detail** — Full issue information, map location, status history, upvote functionality
- **Citizen Profile** — User profile showing reported issues, stats, and contact information

### Government Portal

- **Government Dashboard** — Command center with 4 views: All Issues, Clustered Hotspots, By Status, Analytics
- **Issue Management** — Detailed issue view with reassignment, status updates, bulk actions
- **Live Map** — Interactive map showing all issue clusters with real-time updates
- **Government Profile** — Portal stats including total issues, resolved count, resolution rate, issue list

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** — local or [MongoDB Atlas](https://cloud.mongodb.com) free tier
- **npm** ≥ 9

### Installation

```bash
# Clone repository
git clone https://github.com/Rakshi2609/CC_Hackathon.git
cd CC_Hackathon

# Backend setup
cd backend
npm install
cp .env.example .env
npm run dev

# Frontend setup (in another terminal)
cd client
npm install
npm run dev

Note: The frontend reads the backend base URL from `client/.env` using `VITE_BACKEND_URL` (defaults to `http://localhost:5000`). See Environment Setup below.

# Create government account
curl -X POST http://localhost:5000/api/auth/create-gov \
  -H "Content-Type: application/json" \
  -d '{"name":"City Admin","email":"admin@gov.in","password":"admin@123"}'

# Open in browser
# Citizen: http://localhost:5173/register
# Government: http://localhost:5173/login
```

---

## Presentation (PPT)

We prepared a short presentation for demos and judges. View or edit the slide deck in Canva:

- Canva link: https://www.canva.com/design/DAHCtHLTChU/UH_gHSeSxJY1Isyv1e5cKQ/edit?utm_content=DAHCtHLTChU&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton

H


---

## Environment Setup

Create `backend/.env`:

```env
MONGO_URI=mongodb://localhost:27017/civicplus
JWT_SECRET=replace_with_a_long_random_secret_min_64_chars
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=optional_for_ai_features
```

Cloudinary configuration (add these to `backend/.env`):

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Client environment (create `client/.env`):

```env
VITE_BACKEND_URL=http://localhost:5000
```

---

## API Endpoints (Quick Reference)

### Auth

- `POST /api/auth/register` — Create citizen account
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get profile
- `POST /api/auth/create-gov` — Create government account (admin)

### Issues

- `POST /api/issues` — Report new issue
- `GET /api/issues/my` — My reported issues (citizen)
- `GET /api/issues` — All issues (government only)
- `GET /api/issues/:id` — Single issue detail
- `PUT /api/issues/:id/status` — Update status & cascade to cluster
- `POST /api/issues/:id/upvote` — Toggle upvote
- `GET /api/issues/clusters` — All hotspot clusters (gov only)
- `GET /api/issues/stats` — System statistics (gov only)

---

## Troubleshooting

| Issue                    | Fix                                        |
| ------------------------ | ------------------------------------------ |
| MongoDB connection fails | Check `MONGO_URI` in `.env`                |
| CORS errors              | Ensure `CLIENT_URL` matches frontend port  |
| Socket.IO not connecting | Verify backend/frontend use same port      |
| Images not uploading     | Ensure Cloudinary env vars are set in `backend/.env` and restart the backend. For legacy local uploads ensure `uploads/` exists if still used. |
| Map doesn't show tiles   | Import Leaflet CSS in `IssueMap.jsx`       |

---

## Core Architecture

```
Frontend (React 18)
  ├─ AuthContext (user, token)
  ├─ SocketContext (real-time updates)
  └─ pages/components (Landing, Auth, Dashboards, Issues)
        ↓ (REST API + WebSocket)
Backend (Express + Socket.IO)
  ├─ Auth routes (JWT-based)
  ├─ Issue routes (CRUD + clustering)
  └─ Real-time notifications
        ↓ (Mongoose ODM)
MongoDB
  ├─ Users collection
  └─ Issues collection (geo-indexed with 2dsphere)
```

---

## Key Features Summary

✅ **Citizens**: Report issues with photo + GPS, track status, upvote, get real-time notifications  
✅ **Government**: Manage issues, assign clusters, resolve with cascade notifications  
✅ **Smart Clustering**: Auto-groups duplicate reports within 100m radius  
✅ **Priority Scoring**: Ranks issues by cluster size, upvotes, age  
✅ **Real-Time Updates**: Socket.IO push notifications on status changes  
✅ **Transparency**: Full audit trail with SHA-256 hashes  
✅ **User Profiles**: Separate dashboards for citizens and government  
✅ **Responsive Design**: Mobile-first Tailwind CSS  
✅ **Role-Based Access**: JWT authentication with citizen/government roles

---

## License

MIT

---

## Support

For issues or questions, open a GitHub issue or contact the team.
| **IoT as Socket.IO broadcast vs stored records** | IoT ghost reports are broadcast-only signals — not stored in MongoDB — to keep the demonstration clean. In production, sensor readings would create real issue documents via the same `POST /api/issues` flow, requiring no frontend changes beyond swapping the source. |
