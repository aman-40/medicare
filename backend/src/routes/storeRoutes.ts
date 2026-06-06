import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorizeRole } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Get available frames with optional search
router.get('/frames', async (req, res) => {
  try {
    const { search } = req.query;
    
    const frames = await prisma.frame.findMany({
      where: { 
        stock: { gt: 0 },
        ...(search ? {
          OR: [
            { name: { contains: String(search), mode: 'insensitive' } },
            { brand: { contains: String(search), mode: 'insensitive' } }
          ]
        } : {})
      }
    });
    res.json(frames);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch frames' });
  }
});

// Add a new Frame (Admin Only)
router.post('/frames', authenticate, authorizeRole('ADMIN'), async (req, res) => {
  try {
    const { name, brand, purchasePrice, sellingPrice, stock, color, material, imageUrl } = req.body;
    const frame = await prisma.frame.create({
      data: { name, brand, purchasePrice: Number(purchasePrice), sellingPrice: Number(sellingPrice), stock: Number(stock), color, material, imageUrl }
    });
    res.status(201).json(frame);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add frame' });
  }
});

// Get available lenses
router.get('/lenses', async (req, res) => {
  try {
    const lenses = await prisma.lens.findMany();
    res.json(lenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lenses' });
  }
});

// Add a new Lens (Admin Only)
router.post('/lenses', authenticate, authorizeRole('ADMIN'), async (req, res) => {
  try {
    const { name, type, material, purchaseCost, sellingPrice } = req.body;
    const lens = await prisma.lens.create({
      data: { name, type, material, purchaseCost: Number(purchaseCost), sellingPrice: Number(sellingPrice) }
    });
    res.status(201).json(lens);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add lens' });
  }
});

export default router;
