import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/authMiddleware';
import { sendInvoiceEmail } from '../utils/mailer';

const router = Router();
const prisma = new PrismaClient();

// Generate an Invoice and Order
router.post('/checkout', authenticate, async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, type, quantity, price }
    const userId = (req as any).user.userId;

    const patient = await prisma.patient.findUnique({ 
      where: { userId },
      include: { user: true }
    });
    if (!patient) return res.status(404).json({ message: 'Patient profile required for checkout' });

    // Calculate totals
    const subtotal = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    const gst = subtotal * 0.18; // 18% GST example
    const totalAmount = subtotal + gst;

    // Create Invoice
    const invoiceNo = `INV-${Date.now()}`;
    const invoice = await prisma.invoice.create({
      data: {
        patientId: patient.id,
        invoiceNo,
        gst,
        totalAmount,
        status: 'Unpaid',
        sales: {
          create: items.map((item: any) => ({
            productId: item.id,
            productType: item.type, // 'Medicine' or 'Optical'
            quantity: item.quantity,
            unitPrice: item.price,
            total: item.price * item.quantity
          }))
        }
      }
    });

    // Send email notification (Fire and forget)
    sendInvoiceEmail(patient.user.email, invoiceNo, totalAmount);

    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process checkout' });
  }
});

export default router;
