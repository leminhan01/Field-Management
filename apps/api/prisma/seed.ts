import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create regions
  const region1 = await prisma.region.upsert({
    where: { code: 'HN' },
    update: {},
    create: { name: 'Ha Noi', code: 'HN' },
  });

  const region2 = await prisma.region.upsert({
    where: { code: 'HCM' },
    update: {},
    create: { name: 'Ho Chi Minh', code: 'HCM' },
  });

  // Create branches
  const branch1 = await prisma.branch.upsert({
    where: { code: 'REST-A01' },
    update: {},
    create: {
      name: 'Restaurant A - Ha Noi',
      code: 'REST-A01',
      type: 'RESTAURANT',
      address: '123 Nguyen Trai, Ha Noi',
      regionId: region1.id,
      isActive: true,
    },
  });

  const branch2 = await prisma.branch.upsert({
    where: { code: 'REST-B01' },
    update: {},
    create: {
      name: 'Restaurant B - HCM',
      code: 'REST-B01',
      type: 'RESTAURANT',
      address: '456 Le Loi, Ho Chi Minh',
      regionId: region2.id,
      isActive: true,
    },
  });

  const branch3 = await prisma.branch.upsert({
    where: { code: 'SUP-A01' },
    update: {},
    create: {
      name: 'Supermarket A - Ha Noi',
      code: 'SUP-A01',
      type: 'SUPERMARKET',
      address: '789 Tran Hung Dao, Ha Noi',
      regionId: region1.id,
      isActive: true,
    },
  });

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@fieldapp.com' },
    update: {},
    create: {
      email: 'admin@fieldapp.com',
      password: adminPassword,
      name: 'System Admin',
      role: Role.SUPER_ADMIN,
      isActive: true,
      refreshTokens: [],
    },
  });

  const managerPassword = await bcrypt.hash('manager123', 10);
  await prisma.user.upsert({
    where: { email: 'manager@fieldapp.com' },
    update: {},
    create: {
      email: 'manager@fieldapp.com',
      password: managerPassword,
      name: 'Nguyen Van Manager',
      role: Role.MANAGER,
      branchId: branch1.id,
      isActive: true,
      refreshTokens: [],
    },
  });

  const staffPassword = await bcrypt.hash('staff123', 10);
  await prisma.user.upsert({
    where: { email: 'staff@fieldapp.com' },
    update: {},
    create: {
      email: 'staff@fieldapp.com',
      password: staffPassword,
      name: 'Le Minh Staff',
      phone: '0901234567',
      role: Role.STAFF,
      branchId: branch1.id,
      isActive: true,
      refreshTokens: [],
    },
  });

  const tlPassword = await bcrypt.hash('teamleader123', 10);
  await prisma.user.upsert({
    where: { email: 'teamleader@fieldapp.com' },
    update: {},
    create: {
      email: 'teamleader@fieldapp.com',
      password: tlPassword,
      name: 'Tran Thi Leader',
      role: Role.TEAM_LEADER,
      branchId: branch2.id,
      isActive: true,
      refreshTokens: [],
    },
  });

  console.log('Seed data created successfully!');
  console.log('Accounts:');
  console.log('  admin@fieldapp.com / admin123 (SUPER_ADMIN)');
  console.log('  manager@fieldapp.com / manager123 (MANAGER)');
  console.log('  teamleader@fieldapp.com / teamleader123 (TEAM_LEADER)');
  console.log('  staff@fieldapp.com / staff123 (STAFF)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
