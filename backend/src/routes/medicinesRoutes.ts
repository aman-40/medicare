import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorizeRole } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Get all medicines
router.get('/', async (req, res) => {
  try {
    const medicines = await prisma.medicine.findMany({
      include: { supplier: true }
    });
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch medicines' });
  }
});

// Add a new medicine (Admin Only)
router.post('/', authenticate, authorizeRole('ADMIN'), async (req, res) => {
  try {
    const { name, company, category, batchNo, purchasePrice, sellingPrice, stock, expiryDate, supplierId } = req.body;
    const medicine = await prisma.medicine.create({
      data: { 
        name, 
        company, 
        category, 
        batchNo, 
        purchasePrice: Number(purchasePrice), 
        sellingPrice: Number(sellingPrice), 
        stock: Number(stock), 
        expiryDate: new Date(expiryDate), 
        supplierId 
      }
    });
    res.status(201).json(medicine);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create medicine' });
  }
});

export default router;
