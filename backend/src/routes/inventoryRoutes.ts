import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Dashboard Stats
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const [medicines, frames, lenses] = await Promise.all([
      prisma.medicine.count(),
      prisma.frame.count(),
      prisma.lens.count(),
    ]);

    const lowStockMedicines = await prisma.medicine.count({ where: { stock: { lt: 10 } } });
    const lowStockFrames = await prisma.frame.count({ where: { stock: { lt: 10 } } });
    const lowStockItems = lowStockMedicines + lowStockFrames;

    const sixtyDaysFromNow = new Date();
    sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);
    const expiringSoon = await prisma.medicine.count({
      where: { expiryDate: { lte: sixtyDaysFromNow, gte: new Date() } }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysSales = await prisma.invoice.aggregate({
      where: { createdAt: { gte: today } },
      _sum: { totalAmount: true }
    });

    res.json({
      totalMedicines: medicines,
      totalFrames: frames,
      totalLenses: lenses,
      lowStockItems,
      expiringSoon,
      todaysSales: todaysSales._sum.totalAmount || 0,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory dashboard stats' });
  }
});

// Expiry Management
router.get('/expiry', authenticate, async (req, res) => {
  try {
    const now = new Date();
    const sixtyDaysFromNow = new Date();
    sixtyDaysFromNow.setDate(now.getDate() + 60);

    const expiringMedicines = await prisma.medicine.findMany({
      where: { expiryDate: { lte: sixtyDaysFromNow } },
      orderBy: { expiryDate: 'asc' },
      include: { supplier: true }
    });

    res.json(expiringMedicines);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expiry data' });
  }
});

// Get All Medicines
router.get('/medicines', authenticate, async (req, res) => {
  try {
    const medicines = await prisma.medicine.findMany({
      include: { supplier: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch medicines' });
  }
});

// Bulk Add Medicines
router.post('/medicines/bulk', authenticate, async (req, res) => {
  try {
    const { medicines } = req.body;
    if (!Array.isArray(medicines)) {
      return res.status(400).json({ error: 'Payload must contain an array of medicines' });
    }

    let successCount = 0;
    const errors = [];

    for (let i = 0; i < medicines.length; i++) {
      const med = medicines[i];
      try {
        if (!med.name || !med.batchNo || med.stock === undefined || med.purchasePrice === undefined || med.sellingPrice === undefined || !med.expiryDate || !med.supplierName) {
          throw new Error('Missing required fields');
        }

        let supplier = await prisma.supplier.findFirst({
          where: { name: med.supplierName }
        });

        if (!supplier) {
          supplier = await prisma.supplier.create({
            data: {
              name: med.supplierName,
              phone: med.supplierPhone || 'N/A'
            }
          });
        }

        await prisma.medicine.create({
          data: {
            name: med.name,
            company: med.company || '',
            batchNo: med.batchNo,
            purchasePrice: parseFloat(med.purchasePrice),
            sellingPrice: parseFloat(med.sellingPrice),
            stock: parseInt(med.stock),
            expiryDate: new Date(med.expiryDate),
            supplierId: supplier.id
          }
        });
        successCount++;
      } catch (err: any) {
        errors.push(`Row ${i + 1} (${med.name || 'Unknown'}): ${err.message}`);
      }
    }

    res.status(201).json({ 
      message: `Processed bulk upload.`, 
      successCount, 
      errorCount: errors.length,
      errors 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process bulk upload' });
  }
});

// Add New Medicine (with auto-supplier creation)
router.post('/medicines', authenticate, async (req, res) => {
  try {
    const { 
      name, company, batchNo, purchasePrice, sellingPrice, stock, expiryDate, 
      supplierName, supplierPhone 
    } = req.body;

    // Find or Create Supplier
    let supplier = await prisma.supplier.findFirst({
      where: { name: supplierName }
    });

    if (!supplier) {
      supplier = await prisma.supplier.create({
        data: {
          name: supplierName,
          phone: supplierPhone || 'N/A'
        }
      });
    }

    const medicine = await prisma.medicine.create({
      data: {
        name,
        company,
        batchNo,
        purchasePrice: parseFloat(purchasePrice),
        sellingPrice: parseFloat(sellingPrice),
        stock: parseInt(stock),
        expiryDate: new Date(expiryDate),
        supplierId: supplier.id
      },
      include: { supplier: true }
    });

    res.status(201).json(medicine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add medicine' });
  }
});

// Update an existing Medicine
router.put('/medicines/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, company, batchNo, purchasePrice, sellingPrice, stock, expiryDate, 
      supplierName, supplierPhone 
    } = req.body;

    // Find or Create Supplier
    let supplier = await prisma.supplier.findFirst({
      where: { name: supplierName }
    });

    if (!supplier) {
      supplier = await prisma.supplier.create({
        data: {
          name: supplierName,
          phone: supplierPhone || 'N/A'
        }
      });
    }

    const medicine = await prisma.medicine.update({
      where: { id },
      data: {
        name,
        company,
        batchNo,
        purchasePrice: parseFloat(purchasePrice),
        sellingPrice: parseFloat(sellingPrice),
        stock: parseInt(stock),
        expiryDate: new Date(expiryDate),
        supplierId: supplier.id
      },
      include: { supplier: true }
    });

    res.json(medicine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update medicine' });
  }
});

// Delete a Medicine
router.delete('/medicines/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.medicine.delete({
      where: { id }
    });
    res.json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete medicine' });
  }
});

export default router;
