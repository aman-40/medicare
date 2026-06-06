import { PrismaClient } from '@prisma/client';
import { hashPassword } from './src/utils/authUtils';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@visioncare.com';
  const password = await hashPassword('admin123');
  
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Admin already exists.');
    return;
  }

  const user = await prisma.user.create({
    data: {
      email,
      password,
      name: 'Admin User',
      role: 'ADMIN',
    }
  });

  console.log('Created Admin User:', user.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
