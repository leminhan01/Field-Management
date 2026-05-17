import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const allPermissions = [
  'dashboard.view',
  'employees.read',
  'employees.create',
  'employees.update',
  'employees.delete',
  'branches.read',
  'branches.create',
  'branches.update',
  'branches.delete',
  'outlets.read',
  'outlets.create',
  'outlets.update',
  'outlets.delete',
  'tasks.read',
  'tasks.create',
  'tasks.update',
  'tasks.delete',
  'reports.read',
  'reports.approve',
  'surveys.read',
  'surveys.manage',
  'devices.read',
  'devices.manage',
  'positions.read',
  'positions.manage',
];

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

  // Create positions and permissions
  const superAdminPosition = await prisma.position.upsert({
    where: { code: 'SUPER_ADMIN' },
    update: { permissions: allPermissions, isActive: true },
    create: {
      name: 'Super Admin',
      code: 'SUPER_ADMIN',
      role: Role.SUPER_ADMIN,
      permissions: allPermissions,
      isSystem: true,
      isActive: true,
    },
  });

  const managerPosition = await prisma.position.upsert({
    where: { code: 'BRANCH_MANAGER' },
    update: {
      permissions: [
        'dashboard.view',
        'employees.read',
        'employees.update',
        'branches.read',
        'outlets.read',
        'outlets.create',
        'outlets.update',
        'tasks.read',
        'tasks.create',
        'tasks.update',
        'reports.read',
        'reports.approve',
        'surveys.read',
        'devices.read',
      ],
      isActive: true,
    },
    create: {
      name: 'Branch Manager',
      code: 'BRANCH_MANAGER',
      role: Role.MANAGER,
      permissions: [
        'dashboard.view',
        'employees.read',
        'employees.update',
        'branches.read',
        'outlets.read',
        'outlets.create',
        'outlets.update',
        'tasks.read',
        'tasks.create',
        'tasks.update',
        'reports.read',
        'reports.approve',
        'surveys.read',
        'devices.read',
      ],
      isSystem: true,
      isActive: true,
    },
  });

  const teamLeaderPosition = await prisma.position.upsert({
    where: { code: 'TEAM_LEADER' },
    update: {
      permissions: [
        'dashboard.view',
        'employees.read',
        'outlets.read',
        'tasks.read',
        'tasks.update',
        'reports.read',
        'surveys.read',
        'devices.read',
      ],
      isActive: true,
    },
    create: {
      name: 'Team Leader',
      code: 'TEAM_LEADER',
      role: Role.TEAM_LEADER,
      permissions: [
        'dashboard.view',
        'employees.read',
        'outlets.read',
        'tasks.read',
        'tasks.update',
        'reports.read',
        'surveys.read',
        'devices.read',
      ],
      isSystem: true,
      isActive: true,
    },
  });

  const staffPosition = await prisma.position.upsert({
    where: { code: 'FIELD_STAFF' },
    update: {
      permissions: ['tasks.read', 'tasks.update', 'reports.read', 'surveys.read'],
      isActive: true,
    },
    create: {
      name: 'Field Staff',
      code: 'FIELD_STAFF',
      role: Role.STAFF,
      permissions: ['tasks.read', 'tasks.update', 'reports.read', 'surveys.read'],
      isSystem: true,
      isActive: true,
    },
  });

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@fieldapp.com' },
    update: { positionId: superAdminPosition.id },
    create: {
      email: 'admin@fieldapp.com',
      password: adminPassword,
      name: 'System Admin',
      role: Role.SUPER_ADMIN,
      positionId: superAdminPosition.id,
      isActive: true,
      refreshTokens: [],
    },
  });

  const managerPassword = await bcrypt.hash('manager123', 10);
  await prisma.user.upsert({
    where: { email: 'manager@fieldapp.com' },
    update: { positionId: managerPosition.id },
    create: {
      email: 'manager@fieldapp.com',
      password: managerPassword,
      name: 'Nguyen Van Manager',
      role: Role.MANAGER,
      positionId: managerPosition.id,
      branchId: branch1.id,
      isActive: true,
      refreshTokens: [],
    },
  });

  const staffPassword = await bcrypt.hash('staff123', 10);
  await prisma.user.upsert({
    where: { email: 'staff@fieldapp.com' },
    update: { positionId: staffPosition.id },
    create: {
      email: 'staff@fieldapp.com',
      password: staffPassword,
      name: 'Le Minh Staff',
      phone: '0901234567',
      role: Role.STAFF,
      positionId: staffPosition.id,
      branchId: branch1.id,
      isActive: true,
      refreshTokens: [],
    },
  });

  const tlPassword = await bcrypt.hash('teamleader123', 10);
  await prisma.user.upsert({
    where: { email: 'teamleader@fieldapp.com' },
    update: { positionId: teamLeaderPosition.id },
    create: {
      email: 'teamleader@fieldapp.com',
      password: tlPassword,
      name: 'Tran Thi Leader',
      role: Role.TEAM_LEADER,
      positionId: teamLeaderPosition.id,
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
