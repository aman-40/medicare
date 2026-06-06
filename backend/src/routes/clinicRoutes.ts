import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Submit an Eye Report (Optometrist/Doctor)
router.post('/report', authenticate, async (req, res) => {
  try {
    const { 
      patientId, 
      rightSph, rightCyl, rightAxis, 
      leftSph, leftCyl, leftAxis, 
      addPower, notes, reportData 
    } = req.body;

    const report = await prisma.eyeReport.create({
      data: {
        patientId,
        rightSph, rightCyl, rightAxis,
        leftSph, leftCyl, leftAxis,
        addPower, notes, reportData
      }
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit eye report' });
  }
});

// Get all eye reports for a specific patient
router.get('/patient/:patientId', authenticate, async (req, res) => {
  try {
    const { patientId } = req.params;
    const reports = await prisma.eyeReport.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      include: { patient: true }
    });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch medical records' });
  }
});

// Get all reports
router.get('/reports/all', authenticate, async (req, res) => {
  try {
    const reports = await prisma.eyeReport.findMany({
      include: { 
        patient: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch all reports' });
  }
});

export default router;
