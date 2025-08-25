import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 1️⃣ Create roles
  const roles = ['ADMIN', 'USER'];
  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
  }

  // 2️⃣ Create programs
  const programs = ['Program A', 'Program B'];
  for (const programName of programs) {
    await prisma.program.upsert({
      where: { name: programName },
      update: {},
      create: { name: programName },
    });
  }

  // 3️⃣ Create admin user
  const adminUsername = 'admin';
  const adminPassword = 'admin123'; // change this in production!
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { username: adminUsername },
    update: {},
    create: { username: adminUsername, password: hashedPassword },
  });

  // 4️⃣ Assign ADMIN role
  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
  if (adminRole) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
      update: {},
      create: { userId: admin.id, roleId: adminRole.id },
    });
  }

  // 5️⃣ Assign Program A
  const programA = await prisma.program.findUnique({ where: { name: 'Program A' } });
  if (programA) {
    await prisma.userProgram.upsert({
      where: { userId_programId: { userId: admin.id, programId: programA.id } },
      update: {},
      create: { userId: admin.id, programId: programA.id },
    });
  }

  console.log('✅ Admin user seeded: admin / admin123');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
