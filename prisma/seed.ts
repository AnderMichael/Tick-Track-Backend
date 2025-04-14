// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Crear departamentos
  const [depLaPaz, depCochabamba, depSantaCruz] = await Promise.all([
    prisma.department.create({ data: { name: 'La Paz' } }),
    prisma.department.create({ data: { name: 'Cochabamba' } }),
    prisma.department.create({ data: { name: 'Santa Cruz' } }),
  ]);

  // 2. Crear roles
  const studentRole = await prisma.role.create({ data: { name: 'STUDENT' } });
  const supervisorRole = await prisma.role.create({ data: { name: 'SUPERVISOR' } });
  const scholarshipOfficerRole = await prisma.role.create({ data: { name: 'SCHOLARSHIP_OFFICER' } });
  const adminRole = await prisma.role.create({ data: { name: 'ADMIN' } });

  // 3. Definir permisos
  const elements = ['transactions', 'works', 'students', 'supervisors', 'scholarship_officers'];
  const actions = ['view', 'create', 'update', 'delete'];
  const permissionsToCreate = elements.flatMap((element) =>
    actions.map((action) => ({
      name: `${action}:${element}`,
    })),
  );

  // 4. Crear permisos
  await prisma.permission.createMany({
    data: permissionsToCreate,
    skipDuplicates: true,
  });

  // Obtener todos los permisos
  const allPermissions = await prisma.permission.findMany();
  const permissionMap: Record<string, number> = {};
  for (const p of allPermissions) {
    permissionMap[p.name] = p.id;
  }

  // Helper para asignar permisos a roles
  async function linkPermissionsToRole(roleId: number, permissionNames: string[]) {
    const data = permissionNames.map((name) => ({
      role_id: roleId,
      permission_id: permissionMap[name],
    }));
    await prisma.role_permission.createMany({ data, skipDuplicates: true });
  }

  // 5. Asignar permisos
  // Estudiante: ver works, ver transactions
  await linkPermissionsToRole(studentRole.id, [
    'view:works',
    'view:transactions',
  ]);

  // Supervisor
  await linkPermissionsToRole(supervisorRole.id, [
    'view:works',
    'create:works',
    'update:works',
    'delete:works',
    'view:transactions',
    'create:transactions',
    'update:transactions',
    'delete:transactions',
    'view:students',
  ]);

  // Scholarship Officer
  await linkPermissionsToRole(scholarshipOfficerRole.id, [
    'view:works',
    'create:works',
    'update:works',
    'delete:works',
    'view:transactions',
    'create:transactions',
    'update:transactions',
    'delete:transactions',
    'view:students',
    'create:students',
    'update:students',
    'delete:students',
    'view:supervisors',
    'view:scholarship_officers',
  ]);

  // Admin: todos los permisos
  await linkPermissionsToRole(
    adminRole.id,
    allPermissions.map((p) => p.name),
  );

  // 6. Crear usuarios con diferentes roles y departamentos

  // Estudiante 1
  const userStudent1 = await prisma.user.create({
    data: {
      firstName: 'Carlos',
      fatherLastName: 'Pérez',
      motherLastName: 'Gómez',
      isAvailable: true,
      upbCode: 'STU001',
      role_id: studentRole.id,
      department_id: depLaPaz.id,
    },
  });
  // Relación 1:1 con students
  await prisma.students.create({
    data: {
      id: userStudent1.id,
      semester: 1,
    },
  });

  // Estudiante 2
  const userStudent2 = await prisma.user.create({
    data: {
      firstName: 'Lucía',
      fatherLastName: 'Sandoval',
      motherLastName: 'Rojas',
      upbCode: 'STU002',
      role_id: studentRole.id,
      department_id: depCochabamba.id,
    },
  });
  await prisma.students.create({
    data: {
      id: userStudent2.id,
      semester: 2,
    },
  });

  // Supervisor
  const userSup = await prisma.user.create({
    data: {
      firstName: 'Juan',
      fatherLastName: 'Supervisor',
      motherLastName: '',
      upbCode: 'SUP001',
      role_id: supervisorRole.id,
      department_id: depSantaCruz.id,
    },
  });
  // Relación 1:1 con administratives
  await prisma.administratives.create({
    data: {
      id: userSup.id,
      upbRole: 'SUPERVISOR',
    },
  });

  // Scholarship Officer
  const userOfficer = await prisma.user.create({
    data: {
      firstName: 'Ana',
      fatherLastName: 'Scholar',
      motherLastName: 'Ofc',
      upbCode: 'SCH001',
      role_id: scholarshipOfficerRole.id,
      department_id: depLaPaz.id,
    },
  });
  await prisma.administratives.create({
    data: {
      id: userOfficer.id,
      upbRole: 'SCHOLARSHIP_OFFICER',
    },
  });

  // Admin
  const userAdmin = await prisma.user.create({
    data: {
      firstName: 'Silvia',
      fatherLastName: 'Admin',
      motherLastName: 'Master',
      upbCode: 'ADM001',
      role_id: adminRole.id,
      department_id: depCochabamba.id,
    },
  });
  await prisma.administratives.create({
    data: {
      id: userAdmin.id,
      upbRole: 'ADMIN',
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
