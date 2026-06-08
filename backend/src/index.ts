import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: '*', // In production, restrict to frontend URL
    methods: ['GET', 'POST']
  }
});

import authRoutes from './routes/authRoutes';
import patientRoutes from './routes/patientRoutes';
import queueRoutes from './routes/queueRoutes';
import clinicRoutes from './routes/clinicRoutes';
import billingRoutes from './routes/billingRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import staffRoutes from './routes/staffRoutes';
import medicinesRoutes from './routes/medicinesRoutes';
import invoiceRoutes from './routes/invoiceRoutes';

app.use(cors());
app.use(express.json());
import path from 'path';
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/clinic', clinicRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/medicines', medicinesRoutes);
app.use('/api/invoices', invoiceRoutes);

// Basic Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'VisionCare API is running' });
});

// Socket.io for Real-time Queue (Phase 8 Setup)
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT as number, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
