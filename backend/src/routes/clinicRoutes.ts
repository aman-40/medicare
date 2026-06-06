import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorizeRole } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

import { upload } from '../utils/upload';

// Submit an Eye Report (Doctor Only)
router.post('/report', authenticate, authorizeRole('DOCTOR'), upload.single('prescriptionFile'), async (req, res) => {
  try {
    const { patientId, leftEyePower, rightEyePower, remarks } = req.body;
    const userId = (req as any).user.userId;

    const doctor = await prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) return res.status(404).json({ message: 'Doctor profile required' });

    const prescriptionUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const report = await prisma.eyeReport.create({
      data: {
        patientId,
        doctorId: doctor.id,
        leftEyePower,
        rightEyePower,
        remarks,
        prescriptionUrl
      }
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit eye report' });
  }
});

// Get a patient's own reports (Protected)
router.get('/my-reports', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const patient = await prisma.patient.findUnique({ where: { userId } });
    
    if (!patient) return res.status(404).json({ message: 'Patient profile not found' });

    const reports = await prisma.eyeReport.findMany({
      where: { patientId: patient.id },
      include: { doctor: { include: { user: true } } },
      orderBy: { createdAt: 'desc' }
    });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch medical records' });
  }
});

// Get all reports (Pharmacist / Admin)
router.get('/reports/all', authenticate, authorizeRole('PHARMACIST', 'ADMIN'), async (req, res) => {
  try {
    const reports = await prisma.eyeReport.findMany({
      include: { 
        doctor: { include: { user: true } },
        patient: { include: { user: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch all reports' });
  }
});

// Get all doctors (Public/Authenticated)
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      include: { user: true }
    });
    // Map to a friendlier frontend format
    const mappedDoctors = doctors.map(d => ({
      id: d.id,
      name: `Dr. ${d.user.name}`,
      specialty: d.specialization,
      experience: "10+ years", // Hardcoded mock since schema lacks experience
      rating: 4.8,
      reviews: 150,
      fee: "$50", // Hardcoded mock
    }));
    res.json(mappedDoctors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

export default router;
