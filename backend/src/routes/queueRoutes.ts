import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/authMiddleware';
import { io } from '../index'; // Import socket instance

const router = Router();
const prisma = new PrismaClient();

// Get the current queue status
router.get('/', authenticate, async (req, res) => {
  try {
    const queueItems = await prisma.queue.findMany({
      where: { 
        status: { in: ['Waiting', 'Serving'] }
      },
      include: { patient: true },
      orderBy: { tokenNumber: 'asc' },
    });
    
    const currentToken = queueItems.find(q => q.status === 'Serving')?.tokenNumber || 
                         queueItems.find(q => q.status === 'Waiting')?.tokenNumber || null;
                         
    res.json({ currentToken, queueItems });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch queue' });
  }
});

// Generate a new token for a patient
router.post('/generate', authenticate, async (req, res) => {
  try {
    const { patientId } = req.body;
    
    // Auto-increment token logic for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const countToday = await prisma.queue.count({
      where: { createdAt: { gte: today } }
    });
    const nextToken = countToday + 1;

    const queueItem = await prisma.queue.create({
      data: {
        patientId,
        tokenNumber: nextToken,
        status: 'Waiting'
      },
      include: { patient: true }
    });

    // Emit the update via Socket.io
    io.emit('queue-updated', { currentToken: nextToken, message: 'New token generated' });

    res.status(201).json(queueItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

// Update queue status (e.g., mark as Serving or Completed)
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const queueItem = await prisma.queue.update({
      where: { id },
      data: { status },
      include: { patient: true }
    });

    io.emit('queue-updated', { message: `Token ${queueItem.tokenNumber} is now ${status}` });

    res.json(queueItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update queue status' });
  }
});

// Delete queue item
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const queueItem = await prisma.queue.delete({
      where: { id }
    });
    io.emit('queue-updated', { message: `Token ${queueItem.tokenNumber} removed from queue` });
    res.json({ message: 'Queue item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete queue item' });
  }
});

export default router;
