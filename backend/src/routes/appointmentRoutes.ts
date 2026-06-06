import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorizeRole } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Book an appointment (Protected)
router.post('/', authenticate, async (req, res) => {
  try {
    const { doctorId, date } = req.body;
    const userId = (req as any).user.userId;

    const patient = await prisma.patient.findUnique({ where: { userId } });
    if (!patient) return res.status(404).json({ message: 'Patient profile required to book' });

    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId,
        date: new Date(date),
      }
    });
    
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});
// Get today's appointments (Receptionist / Admin)
router.get('/', authenticate, authorizeRole('RECEPTIONIST', 'ADMIN'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appointments = await prisma.appointment.findMany({
      where: { date: { gte: today } },
      include: { 
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
        queue: true
      },
      orderBy: { date: 'asc' }
    });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

export default router;
