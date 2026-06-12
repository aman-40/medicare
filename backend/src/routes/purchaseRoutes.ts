import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Get all purchases
router.get('/', authenticate, async (req, res) => {
  try {
    const purchases = await prisma.purchase.findMany({
      include: { supplier: true, items: { include: { medicine: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
});

// Create a Purchase
router.post('/', authenticate, async (req, res) => {
  try {
    const { supplierId, invoiceNo, items } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Purchase items are required' });
    }

    // Fallback supplier if none provided or invalid
    let finalSupplierId = supplierId;
    if (!finalSupplierId || finalSupplierId === 'existing-or-new') {
      let defaultSupplier = await prisma.supplier.findFirst({ where: { name: 'Unknown Supplier' } });
      if (!defaultSupplier) {
        defaultSupplier = await prisma.supplier.create({ data: { name: 'Unknown Supplier', phone: '' } });
      }
      finalSupplierId = defaultSupplier.id;
    }

    let totalAmount = 0;
    
    const purchase = await prisma.$transaction(async (tx) => {
      // Create Purchase record
      const count = await tx.purchase.count();
      const purchaseNo = `PUR-${10000 + count + 1}`;

      const newPurchase = await tx.purchase.create({
        data: {
          purchaseNo,
          supplierId: finalSupplierId,
          invoiceNo: invoiceNo || null,
          totalAmount: 0, // Will update below
          status: "Completed",
          items: {
            create: items.map((item: any) => {
              const amount = item.quantity * item.purchasePrice;
              totalAmount += amount;
              return {
                medicineId: item.medicineId,
                batchNo: item.batchNo,
                expiryDate: new Date(item.expiryDate),
                quantity: parseInt(item.quantity),
                freeQuantity: item.freeQuantity ? parseInt(item.freeQuantity) : 0,
                purchasePrice: parseFloat(item.purchasePrice),
                mrp: parseFloat(item.mrp),
                discount: item.discount ? parseFloat(item.discount) : 0,
                gst: item.gst ? parseFloat(item.gst) : 0,
                amount
              };
            })
          }
        },
        include: { items: true }
      });

      // Update total amount
      await tx.purchase.update({
        where: { id: newPurchase.id },
        data: { totalAmount }
      });

      // Update Medicine Stock
      for (const item of newPurchase.items) {
        const medicine = await tx.medicine.findUnique({ where: { id: item.medicineId } });
        if (!medicine) continue;

        let multiplier = 1;
        if (medicine.productType === 'tablet' || medicine.productType === 'capsule') {
          multiplier = medicine.unitsPerStrip || 1;
        }

        const totalAddedStock = (item.quantity + item.freeQuantity) * multiplier;
        
        await tx.medicine.update({
          where: { id: item.medicineId },
          data: { stock: { increment: totalAddedStock } }
        });
      }

      return newPurchase;
    });

    res.status(201).json(purchase);
  } catch (error) {
    console.error("Error creating purchase:", error);
    res.status(500).json({ error: 'Failed to generate purchase entry' });
  }
});

export default router;
