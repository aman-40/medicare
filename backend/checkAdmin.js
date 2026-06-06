const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("All users in DB:");
  console.log(users);
}
main().finally(() => prisma.$disconnect());
