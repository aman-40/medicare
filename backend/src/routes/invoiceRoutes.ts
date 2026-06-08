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
    const { patientName, mobileNumber, discount = 0, items } = req.body;
    // items: Array of { medicineId, quantity, rate, gst, total }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Items are required' });
    }

    // Verify stock availability
    for (const item of items) {
      const med = await prisma.medicine.findUnique({ where: { id: item.medicineId } });
      if (!med) {
        return res.status(400).json({ message: `Medicine not found for ID ${item.medicineId}` });
      }
      if (med.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${med.name}. Available: ${med.stock}` });
      }
    }

    // Calculate totals based on submitted items
    let subtotal = 0;
    let gstAmount = 0;

    for (const item of items) {
      subtotal += item.rate * item.quantity;
      gstAmount += (item.rate * item.quantity) * (item.gst / 100);
    }
    
    const grandTotal = subtotal + gstAmount - discount;

    // Perform inside a transaction: reduce stock + create invoice
    const newInvoice = await prisma.$transaction(async (tx) => {
      // 1. Update stock
      for (const item of items) {
        await tx.medicine.update({
          where: { id: item.medicineId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      // 2. Create Invoice
      const count = await tx.invoice.count();
      const invoiceNo = `INV-${10000 + count + 1}`;

      const invoice = await tx.invoice.create({
        data: {
          patientName: patientName || null,
          mobileNumber: mobileNumber || null,
          invoiceNo,
          subtotal,
          gstAmount,
          discount: Number(discount),
          grandTotal,
          totalAmount: grandTotal, // for backwards compatibility with schema
          items: {
            create: items.map((item: any) => ({
              medicineId: item.medicineId,
              productName: item.productName || 'Medicine',
              quantity: Number(item.quantity),
              rate: Number(item.rate),
              gst: Number(item.gst),
              total: Number(item.total),
              amount: Number(item.total) // backwards compatibility
            }))
          }
        },
        include: { items: true }
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
