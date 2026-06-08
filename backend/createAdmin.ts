import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@visioncare.com';
  const password = 'admin123';
  
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    console.log('Admin user already exists!');
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: 'Admin',
      role: 'ADMIN'
    }
  });
  console.log('Admin user created successfully!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
