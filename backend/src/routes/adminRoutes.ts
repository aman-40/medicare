import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorizeRole } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Get system stats (Admin only)
router.get('/stats', authenticate, authorizeRole('ADMIN'), async (req, res) => {
  try {
    const totalDoctors = await prisma.doctor.count();
    const totalPatients = await prisma.patient.count();
    
    const lowStockItems = await prisma.medicine.count({
      where: { stock: { lte: 10 } }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysInvoices = await prisma.invoice.aggregate({
      where: { createdAt: { gte: today }, status: 'Paid' },
      _sum: { totalAmount: true }
    });

    res.json({
      doctors: totalDoctors,
      patients: totalPatients,
      lowStockAlerts: lowStockItems,
      dailyRevenue: todaysInvoices._sum.totalAmount || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

import { hashPassword } from '../utils/authUtils';

// Add a new Doctor (Admin only)
router.post('/doctors', authenticate, authorizeRole('ADMIN'), async (req, res) => {
  try {
    const { name, email, password, specialization } = req.body;
    
    const hashedPassword = await hashPassword(password);

    // Create the User and Doctor atomically
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'DOCTOR',
        doctor: {
          create: {
            specialization,
            availability: 'Mon-Fri'
          }
        }
      },
      include: { doctor: true }
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create doctor account' });
  }
});

export default router;
