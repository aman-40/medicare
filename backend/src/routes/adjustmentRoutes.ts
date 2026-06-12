import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Get all stock adjustments
router.get('/', authenticate, async (req, res) => {
  try {
    const adjustments = await prisma.stockAdjustment.findMany({
      include: { medicine: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(adjustments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch adjustments' });
  }
});

// Create a Stock Adjustment
router.post('/', authenticate, async (req, res) => {
  try {
    const { medicineId, adjustmentType, quantity, reason } = req.body;
    
    if (!medicineId || !adjustmentType || !quantity || !reason) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const adjustment = await prisma.$transaction(async (tx) => {
      // 1. Create adjustment record
      const newAdj = await tx.stockAdjustment.create({
        data: {
          medicineId,
          adjustmentType, // "Addition" or "Deduction"
          quantity: parseInt(quantity),
          reason,
          adjustedBy: (req as any).user?.id || "System"
        }
      });

      // 2. Modify stock
      const stockChange = adjustmentType === 'Addition' ? parseInt(quantity) : -parseInt(quantity);
      
      await tx.medicine.update({
        where: { id: medicineId },
        data: { stock: { increment: stockChange } }
      });

      return newAdj;
    });

    res.status(201).json(adjustment);
  } catch (error) {
    console.error("Error creating stock adjustment:", error);
    res.status(500).json({ error: 'Failed to process stock adjustment' });
  }
});

export default router;
