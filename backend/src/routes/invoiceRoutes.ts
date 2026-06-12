import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Get all invoices
router.get('/', authenticate, async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Get a specific invoice
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { items: { include: { medicine: true } } }
    });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// Generate an Invoice
router.post('/', authenticate, async (req, res) => {
  try {
    const { patientName, mobileNumber, doctorName, discount = 0, items, paymentMethod = 'CASH' } = req.body;
    // items: Array of { medicineId, productName, quantitySold, saleType, unitConversionValue, deductedStockUnits, rate, gst, total }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Items are required' });
    }

    // Verify stock availability
    for (const item of items) {
      const med = await prisma.medicine.findUnique({ where: { id: item.medicineId } });
      if (!med) {
        return res.status(400).json({ message: `Medicine not found for ID ${item.medicineId}` });
      }
      if (med.stock < item.deductedStockUnits) {
        return res.status(400).json({ message: `Insufficient stock for ${med.name}. Required: ${item.deductedStockUnits}, Available: ${med.stock}` });
      }
    }

    // Calculate totals based on submitted items
    let subtotal = 0;
    let itemDiscounts = 0;

    for (const item of items) {
      subtotal += item.rate * item.quantitySold;
      itemDiscounts += Number(item.discount) || 0;
    }
    
    const grandTotal = subtotal - itemDiscounts - discount;

    // Perform inside a transaction: reduce stock + create invoice
    const newInvoice = await prisma.$transaction(async (tx) => {
      // 1. Update stock
      for (const item of items) {
        await tx.medicine.update({
          where: { id: item.medicineId },
          data: { stock: { decrement: parseInt(item.deductedStockUnits) } }
        });
      }

      // 2. Create Invoice
      const count = await tx.invoice.count();
      const invoiceNo = `INV-${10000 + count + 1}`;

      const invoice = await tx.invoice.create({
        data: {
          patientName: patientName || null,
          mobileNumber: mobileNumber || null,
          doctorName: doctorName || null,
          invoiceNo,
          subtotal,
          gstAmount: 0, // Kept for backwards compatibility
          discount: Number(discount) + itemDiscounts, // Total discount = global discount + item discounts
          grandTotal,
          totalAmount: grandTotal, // for backwards compatibility with schema
          paymentMethod,
          items: {
            create: items.map((item: any) => ({
              medicineId: item.medicineId,
              productName: item.productName || 'Medicine',
              quantitySold: Number(item.quantitySold),
              saleType: item.saleType,
              unitConversionValue: Number(item.unitConversionValue),
              deductedStockUnits: Number(item.deductedStockUnits),
              rate: Number(item.rate),
              gst: 0, // backwards compatibility
              discount: Number(item.discount) || 0,
              total: Number(item.total),
              amount: Number(item.total) // backwards compatibility
            }))
          }
        },
        include: { items: { include: { medicine: true } } }
      });

      return invoice;
    });

    res.status(201).json(newInvoice);
  } catch (error) {
    console.error("Error creating invoice:", error);
    res.status(500).json({ error: 'Failed to generate invoice' });
  }
});

export default router;
