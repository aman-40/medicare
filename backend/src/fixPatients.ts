import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { role: 'CUSTOMER', patient: null }
  });

  for (const user of users) {
    await prisma.patient.create({
      data: {
        userId: user.id,
        address: ''
      }
    });
    console.log(`Created Patient profile for User: ${user.email}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
