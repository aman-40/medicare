import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Generate an Invoice
router.post('/invoice', authenticate, async (req, res) => {
  try {
    const { patientId, patientName, items } = req.body; // items: Array of { productName, quantity, rate }

    if (!patientId && !patientName) return res.status(400).json({ message: 'Patient Name is required' });

    // Calculate totals
    const subtotal = items.reduce((acc: number, item: any) => acc + (item.rate * item.quantity), 0);
    const gstAmount = subtotal * 0.18; // 18% GST example
    const totalAmount = subtotal + gstAmount;

    // Create Invoice
    const count = await prisma.invoice.count();
    const invoiceNo = `INV-${10000 + count + 1}`;

    const invoice = await prisma.invoice.create({
      data: {
        patientId: patientId || null,
        patientName: patientName || null,
        invoiceNo,
        subtotal,
        gstAmount,
        totalAmount,
        items: {
          create: items.map((item: any) => ({
            productName: item.productName,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.rate * item.quantity
          }))
        }
      },
      include: { items: true, patient: true }
    });

    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate invoice' });
  }
});

// Get all invoices
router.get('/', authenticate, async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { patient: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

export default router;
