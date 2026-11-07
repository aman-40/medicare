import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorizeRole } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Search medicines by name, brandName, or genericName (autocomplete)
router.get('/search', authenticate, async (req, res) => {
  try {
    const q = req.query.q as string;
    if (!q) {
      return res.json([]);
    }

    const medicines = await prisma.medicine.findMany({
      where: {
        stock: { gt: 0 },
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { brandName: { contains: q, mode: 'insensitive' } },
          { genericName: { contains: q, mode: 'insensitive' } }
        ]
      },
      take: 20
    });

    res.json(medicines);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to search medicines' });
  }
});

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
    const { name, company, batchNo, purchasePrice, sellingPrice, doctorPrice, stock, expiryDate, supplierId } = req.body;
    
    let resolvedSupplierId = supplierId;
    if (!resolvedSupplierId) {
      let defaultSupplier = await prisma.supplier.findFirst({
        where: { name: 'General / Direct' }
      });
      if (!defaultSupplier) {
        defaultSupplier = await prisma.supplier.create({
          data: { name: 'General / Direct', phone: 'N/A' }
        });
      }
      resolvedSupplierId = defaultSupplier.id;
    }

    const medicine = await prisma.medicine.create({
      data: { 
        name, 
        company: company || '', 
        batchNo: (batchNo && batchNo.trim()) ? batchNo.trim() : '-', 
        purchasePrice: Number(purchasePrice), 
        sellingPrice: Number(sellingPrice), 
        doctorPrice: doctorPrice !== undefined && doctorPrice !== '' ? Number(doctorPrice) : Number(sellingPrice),
        stock: Number(stock), 
        expiryDate: new Date(expiryDate), 
        supplierId: resolvedSupplierId 
      }
    });
    res.status(201).json(medicine);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create medicine' });
  }
});

export default router;
