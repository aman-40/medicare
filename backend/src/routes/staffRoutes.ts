import express from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/authUtils';
import { authenticate, authorizeRole } from '../middleware/authMiddleware';

const router = express.Router();
const prisma = new PrismaClient();

// Get all staff members (Admin only)
router.get('/', authenticate, authorizeRole('ADMIN'), async (req, res) => {
  try {
    const staff = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

// Add new staff member (Admin only)
router.post('/', authenticate, authorizeRole('ADMIN'), async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    res.json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create staff' });
  }
});

// Delete staff member (Admin only)
router.delete('/:id', authenticate, authorizeRole('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete staff' });
  }
});

export default router;
