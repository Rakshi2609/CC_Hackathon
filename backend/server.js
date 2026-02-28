import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import issueRoutes from './routes/issueRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// ── Socket.IO ──────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`[Socket] User ${userId} joined room`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

const IOT_SENSORS = [
  { name: 'Smart Lamp #A12', category: 'Streetlight', lat: 28.6139, lng: 77.2090 },
  { name: 'Smart Lamp #B07', category: 'Streetlight', lat: 19.0760, lng: 72.8777 },
  { name: 'Drain Sensor #D3', category: 'Drainage', lat: 12.9716, lng: 77.5946 },
  { name: 'Road Monitor #R9', category: 'Pothole', lat: 13.0827, lng: 80.2707 },
  { name: 'Bin Sensor #G2', category: 'Garbage', lat: 22.5726, lng: 88.3639 },
];

const startIoTSimulation = () => {
  setInterval(() => {
    const sensor = IOT_SENSORS[Math.floor(Math.random() * IOT_SENSORS.length)];
    const faultTypes = {
      Streetlight: 'Automated fault detected: lamp not responding',
      Drainage: 'Water level threshold exceeded',
      Pothole: 'Surface anomaly detected by road sensor',
      Garbage: 'Bin capacity at 90%+ — requires immediate collection',
    };
    const ghostReport = {
      id: `iot-${Date.now()}`,
      source: 'IoT Sensor',
      sensor: sensor.name,
      category: sensor.category,
      title: `[IoT] ${sensor.name} — Auto Alert`,
      description: faultTypes[sensor.category] || 'Automated infrastructure alert',
      location: {
        coordinates: [
          sensor.lng + (Math.random() - 0.5) * 0.01,
          sensor.lat + (Math.random() - 0.5) * 0.01,
        ],
      },
      timestamp: new Date().toISOString(),
    };
    io.emit('iot_ghost_report', ghostReport);
  }, 30000);
};

// Attach io instance to every request so controllers can emit events
app.use((req, _res, next) => {
  req.io = io;
  next();
});

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);

app.get('/', (_req, res) => res.json({ message: 'CivicPlus API running 🚀' }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

// ── Database ───────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/civicplus';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('[DB] MongoDB connected');
    httpServer.listen(PORT, () => console.log(`[Server] Running on http://localhost:${PORT}`));
    startIoTSimulation();
  })
  .catch((err) => {
    console.error('[DB] Connection failed:', err.message);
    process.exit(1);
  });