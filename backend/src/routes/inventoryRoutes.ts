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

// Get Audit Logs
router.get('/audit-logs', authenticate, async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 500
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Get All Medicines
router.get('/medicines', authenticate, async (req, res) => {
  try {
    const medicines = await prisma.medicine.findMany({
      where: { deletedAt: null },
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
            purchaseDate: med.purchaseDate ? new Date(med.purchaseDate) : new Date(),
            stock: parseInt(med.stock),
            expiryDate: new Date(med.expiryDate),
            supplierId: supplier.id,
            productType: med.productType || 'tablet',
            saleUnit: med.saleUnit || 'piece',
            boxes: med.boxes ? parseInt(med.boxes) : null,
            stripsPerBox: med.stripsPerBox ? parseInt(med.stripsPerBox) : null,
            unitsPerStrip: med.unitsPerStrip ? parseInt(med.unitsPerStrip) : null,
            totalUnits: med.totalUnits ? parseInt(med.totalUnits) : null,
            bottleVolume: med.bottleVolume || null,
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
      name, genericName, company, batchNo, purchasePrice, sellingPrice, purchaseDate, stock, expiryDate, 
      supplierName, supplierPhone, minimumStockAlert,
      productType, saleUnit, boxes, stripsPerBox, unitsPerStrip, totalUnits, bottleVolume
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

    const medicine = await prisma.$transaction(async (tx) => {
      const createdMed = await tx.medicine.create({
        data: {
          name,
          genericName: genericName || null,
          company,
          batchNo,
          purchasePrice: parseFloat(purchasePrice),
          sellingPrice: parseFloat(sellingPrice),
          purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
          stock: parseInt(stock),
          minimumStockAlert: minimumStockAlert ? parseInt(minimumStockAlert) : 10,
          expiryDate: new Date(expiryDate),
          supplierId: supplier.id,
          productType: productType || 'tablet',
          saleUnit: saleUnit || 'piece',
          boxes: boxes ? parseInt(boxes) : null,
          stripsPerBox: stripsPerBox ? parseInt(stripsPerBox) : null,
          unitsPerStrip: unitsPerStrip ? parseInt(unitsPerStrip) : null,
          totalUnits: totalUnits ? parseInt(totalUnits) : null,
          bottleVolume: bottleVolume || null,
        },
        include: { supplier: true }
      });

      // Record initial stock transaction
      if (parseInt(stock) > 0) {
        await tx.stockAdjustment.create({
          data: {
            medicineId: createdMed.id,
            adjustmentType: "Addition",
            quantity: parseInt(stock),
            reason: "Initial Stock Setup",
            adjustedBy: (req as any).user?.id || "System"
          }
        });
      }

      return createdMed;
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
      name, genericName, company, batchNo, purchasePrice, sellingPrice, purchaseDate, expiryDate, 
      supplierName, supplierPhone, minimumStockAlert,
      productType, saleUnit, boxes, stripsPerBox, unitsPerStrip, bottleVolume
    } = req.body;
    // NOTE: 'stock' and 'totalUnits' are intentionally excluded because stock must be modified via transactions.

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
        genericName: genericName || null,
        company,
        batchNo,
        purchasePrice: parseFloat(purchasePrice),
        sellingPrice: parseFloat(sellingPrice),
        purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
        minimumStockAlert: minimumStockAlert ? parseInt(minimumStockAlert) : 10,
        expiryDate: new Date(expiryDate),
        supplierId: supplier.id,
        productType: productType || 'tablet',
        saleUnit: saleUnit || 'piece',
        boxes: boxes ? parseInt(boxes) : null,
        stripsPerBox: stripsPerBox ? parseInt(stripsPerBox) : null,
        unitsPerStrip: unitsPerStrip ? parseInt(unitsPerStrip) : null,
        bottleVolume: bottleVolume || null,
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
    await prisma.medicine.update({
      where: { id },
      data: { 
        deletedAt: new Date(),
        deletedBy: (req as any).user?.id || "System"
      }
    });
    res.json({ message: 'Medicine soft deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete medicine' });
  }
});

export default router;
