import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorizeRole } from '../middleware/authMiddleware';

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

    // Low stock items (assuming threshold < 10)
    const lowStockMedicines = await prisma.medicine.count({ where: { stock: { lt: 10 } } });
    const lowStockFrames = await prisma.frame.count({ where: { stock: { lt: 10 } } });
    const lowStockLenses = await prisma.lens.count({ where: { stock: { lt: 10 } } });
    const lowStockItems = lowStockMedicines + lowStockFrames + lowStockLenses;

    // Expiring soon (within 60 days)
    const sixtyDaysFromNow = new Date();
    sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);
    const expiringSoon = await prisma.medicine.count({
      where: { expiryDate: { lte: sixtyDaysFromNow, gte: new Date() } }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysPurchases = await prisma.purchase.aggregate({
      where: { createdAt: { gte: today } },
      _sum: { totalAmount: true }
    });

    const todaysSales = await prisma.invoice.aggregate({
      where: { createdAt: { gte: today }, status: 'Paid' },
      _sum: { totalAmount: true }
    });

    res.json({
      totalMedicines: medicines,
      totalFrames: frames,
      totalLenses: lenses,
      lowStockItems,
      expiringSoon,
      todaysPurchases: todaysPurchases._sum.totalAmount || 0,
      todaysSales: todaysSales._sum.totalAmount || 0,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory dashboard stats' });
  }
});

// Record a new purchase and auto-update stock
router.post('/purchases', authenticate, authorizeRole('ADMIN', 'PHARMACIST', 'OWNER'), async (req, res) => {
  try {
    const { invoiceNo, supplierId, totalAmount, items } = req.body;
    // items: Array of { productType, productId, quantity, price, remarks }

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the purchase record
      const purchase = await tx.purchase.create({
        data: { invoiceNo, supplierId, totalAmount }
      });

      // 2. Process each item
      for (const item of items) {
        // Log the inventory action
        await tx.inventoryLog.create({
          data: {
            productType: item.productType, // 'Medicine', 'Frame', 'Lens'
            productId: item.productId,
            action: 'Purchase Entry',
            quantity: item.quantity,
            remarks: item.remarks || `Purchase Inv: ${invoiceNo}`
          }
        });

        // Auto Update Stock
        if (item.productType === 'Medicine') {
          await tx.medicine.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } }
          });
        } else if (item.productType === 'Frame') {
          await tx.frame.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } }
          });
        } else if (item.productType === 'Lens') {
          await tx.lens.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } }
          });
        }
      }
      return purchase;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to record purchase' });
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
      orderBy: { expiryDate: 'asc' }
    });

    res.json(expiringMedicines);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expiry data' });
  }
});

// View Inventory Logs (Audit Trail)
router.get('/logs', authenticate, async (req, res) => {
  try {
    const logs = await prisma.inventoryLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory logs' });
  }
});

export default router;
