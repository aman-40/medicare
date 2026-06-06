const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({
    include: { patient: true }
  });
  console.log('Total users:', users.length);
  users.forEach(u => {
    console.log(`Email: ${u.email}, Role: ${u.role}, HasPatient: ${!!u.patient}`);
  });
}

check().then(() => prisma.$disconnect());
