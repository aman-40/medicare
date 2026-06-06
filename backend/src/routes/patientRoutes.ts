import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Get patient details (Protected)
router.get('/me', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const patient = await prisma.patient.findUnique({
      where: { userId },
      include: { user: true, appointments: true }
    });
    
    if (!patient) return res.status(404).json({ message: 'Patient profile not found' });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patient data' });
  }
});

export default router;
