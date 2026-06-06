import { PrismaClient } from '@prisma/client';
import { hashPassword } from './utils/authUtils';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@visioncare.com';
  const password = 'admin';
  const hashedPassword = await hashPassword(password);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'ADMIN'
    },
    create: {
      email,
      name: 'Super Admin',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });

  console.log('Admin account created successfully:');
  console.log('Email:', admin.email);
  console.log('Password:', password);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
