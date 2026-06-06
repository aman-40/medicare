import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorizeRole } from '../middleware/authMiddleware';
import { io } from '../index'; // Import socket instance

const router = Router();
const prisma = new PrismaClient();

// Get the current queue status
router.get('/', async (req, res) => {
  try {
    const queueItems = await prisma.queue.findMany({
      where: { status: 'Waiting' },
      orderBy: { tokenNumber: 'asc' },
    });
    
    const currentToken = queueItems.length > 0 ? queueItems[0].tokenNumber : null;
    res.json({ currentToken, queueItems });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch queue' });
  }
});

// Generate a new token for an appointment (Receptionist only)
router.post('/generate', authenticate, authorizeRole('RECEPTIONIST', 'ADMIN'), async (req, res) => {
  try {
    const { appointmentId } = req.body;
    
    // Auto-increment token logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const countToday = await prisma.queue.count({
      where: { createdAt: { gte: today } }
    });
    const nextToken = countToday + 1;

    const queueItem = await prisma.queue.create({
      data: {
        appointmentId,
        tokenNumber: nextToken,
      }
    });

    // Emit the update via Socket.io
    io.emit('queue-updated', { currentToken: nextToken, message: 'New token generated' });

    res.status(201).json(queueItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

// Call next patient (Doctor only)
router.post('/next', authenticate, authorizeRole('DOCTOR', 'ADMIN'), async (req, res) => {
  try {
    const waitingItems = await prisma.queue.findMany({
      where: { status: 'Waiting' },
      orderBy: { tokenNumber: 'asc' },
      take: 1
    });

    if (waitingItems.length === 0) {
      return res.status(404).json({ message: 'No patients waiting' });
    }

    const nextPatient = waitingItems[0];
    await prisma.queue.update({
      where: { id: nextPatient.id },
      data: { status: 'InConsultation' }
    });

    // Determine the *new* current token (the person after them)
    const newWaitingList = await prisma.queue.findMany({
      where: { status: 'Waiting' },
      orderBy: { tokenNumber: 'asc' },
      take: 1
    });
    const currentToken = newWaitingList.length > 0 ? newWaitingList[0].tokenNumber : null;

    // Emit update
    io.emit('queue-updated', { currentToken, message: `Calling token ${nextPatient.tokenNumber}` });

    res.json({ calledToken: nextPatient.tokenNumber, newCurrentToken: currentToken });
  } catch (error) {
    res.status(500).json({ error: 'Failed to call next patient' });
  }
});

export default router;
