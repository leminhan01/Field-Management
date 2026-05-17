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

  // Create company branches
  const branch1 = await prisma.branch.upsert({
    where: { code: 'CN-MB' },
    update: {},
    create: {
      name: 'Công ty A - Chi nhánh miền Bắc',
      code: 'CN-MB',
      type: 'SUPERMARKET',
      address: '123 Nguyen Trai, Ha Noi',
      regionId: region1.id,
      isActive: true,
    },
  });

  const branch2 = await prisma.branch.upsert({
    where: { code: 'CN-MN' },
    update: {},
    create: {
      name: 'Công ty A - Chi nhánh miền Nam',
      code: 'CN-MN',
      type: 'PHARMACY',
      address: '456 Le Loi, Ho Chi Minh',
      regionId: region2.id,
      isActive: true,
    },
  });

  const branch3 = await prisma.branch.upsert({
    where: { code: 'HO-HN' },
    update: {},
    create: {
      name: 'Công ty A - Trụ sở chính',
      code: 'HO-HN',
      type: 'RESTAURANT',
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
