# CivicPlus (CC+Therthex Hackathon 2026)

A next-generation civic issue reporting and resolution platform, built for transparency, speed, and trust between citizens and government. Winner of the CC+Therthex Hackathon 2026.

---

## 🚀 How It Works

### 1. Geo-Clustering Algorithm

When a citizen reports an issue, our backend uses a 2dsphere geospatial query to find similar, unresolved issues within 100 meters. If found, the new report is clustered, boosting its priority and reducing duplicate work for officials. Otherwise, it becomes a new cluster primary. This ensures efficient resource allocation and real-time aggregation of public sentiment.

### 2. AI Vision Shield

Every uploaded issue photo is validated by the Gemini Vision API. The AI checks if the image matches the reported category (e.g., pothole, garbage) and is not a fake or irrelevant photo. Only AI-verified reports are accepted, ensuring data integrity and reducing spam.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS 4, React-Leaflet, lucide-react, canvas-confetti
- **Backend:** Node.js, Express, MongoDB (2dsphere), Mongoose, Socket.IO, Multer
- **AI:** Gemini Vision API (Google)

---

## ✨ 10 Advanced Features

1. **Auto-Clustering:** Issues within 100m are grouped, boosting priority and reducing duplicates.
2. **AI Vision Shield:** Gemini API validates every photo for authenticity and category match.
3. **Real-Time Updates:** Socket.IO powers instant notifications for status changes and new reports.
4. **Status Cascade:** Cluster primaries propagate status changes to all members automatically.
5. **Transparency Loop:** Before/after photo slider for every resolved issue, closing the feedback loop.
6. **War Room Dashboard:** Government sees live heatmaps, clusters, and can resolve issues in bulk.
7. **Gamification:** Citizens earn karma points and badges for reporting and upvoting issues.
8. **AI Badges:** Verified issues display an "AI Verified" badge for citizen trust.
9. **Confetti Celebration:** Citizens see a confetti burst when their issue is resolved, celebrating civic action.
10. **Mobile-First, Glassmorphism UI:** Modern, accessible design with beautiful overlays and effects.

---

## 🏁 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB 6+

### Setup

1. Clone the repo:
   ```sh
   git clone https://github.com/your-org/civicplus.git
   cd civicplus
   ```
2. Install dependencies:
   ```sh
   cd backend && npm install
   cd ../client && npm install
   ```
3. Configure environment variables (see `.env.example` in both backend and client).
4. Start the backend:
   ```sh
   cd backend && npm run dev
   ```
5. Start the frontend:
   ```sh
   cd client && npm run dev
   ```

---

## 📖 Project Structure

- `backend/` — Express API, clustering, AI, real-time engine
- `client/` — React 19 SPA, dashboards, map, confetti, transparency loop

---

## 🤝 Contributing

Pull requests welcome! Please open issues for feature requests or bugs.

---

## 🏆 Team & Credits

Built by Team CivicPlus for the CC+Therthex Hackathon 2026.

- [Your Names Here]
- Special thanks to the open-source community and Google Gemini AI.

---

## 📜 License

MIT
