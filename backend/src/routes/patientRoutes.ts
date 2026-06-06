import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Get all patients
router.get('/', authenticate, async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// Get patient by id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        queues: true,
        eyeReports: true,
        glassOrders: true,
        invoices: true
      }
    });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

// Create new patient
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, age, gender, phone, address, occupation } = req.body;
    
    // Auto-generate patient code (e.g. PT-1001)
    const count = await prisma.patient.count();
    const patientCode = `PT-${1000 + count + 1}`;

    const patient = await prisma.patient.create({
      data: {
        patientCode,
        name,
        age: age ? parseInt(age) : null,
        gender,
        phone,
        address,
        occupation
      }
    });
    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create patient' });
  }
});

// Update patient
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, age, gender, phone, address, occupation } = req.body;
    
    const patient = await prisma.patient.update({
      where: { id },
      data: {
        name,
        age: age ? parseInt(age) : null,
        gender,
        phone,
        address,
        occupation
      }
    });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update patient' });
  }
});

export default router;
