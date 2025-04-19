// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
class BcryptUtils {

  async getDefaultPassword(): Promise<string | undefined> {
    const defaultHashedPassword = await this.hashPassword(process.env.USER_DEFAULT_PASSWORD || 'defaultPassword');
    console.log(process.env.USER_DEFAULT_PASSWORD);
    return defaultHashedPassword;

  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(parseInt(process.env.HASH_SALT_ROUNDS || '10'));
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  }
}

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
  const elements = ['transactions', 'works', 'students', 'supervisors', 'scholarship_officers', 'scholarships', 'semesters'];
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
    'create:supervisors',
    'update:supervisors',
    'delete:supervisors',
  ]);

  // Admin: todos los permisos
  await linkPermissionsToRole(
    adminRole.id,
    allPermissions.map((p) => p.name),
  );

  // 6. Crear usuarios con diferentes roles y departamentos

  const bcryptUtils = new BcryptUtils();
  const def_password = await bcryptUtils.getDefaultPassword();
  // Estudiante 1
  const userStudent1 = await prisma.user.create({
    data: {
      firstName: 'Carlos',
      secondName: "Marin",
      phone: "548393900",
      email: "carlosmarin1@upb.edu",
      fatherLastName: 'Pérez',
      motherLastName: 'Gómez',
      isAvailable: true,
      upbCode: 63428,
      role_id: studentRole.id,
      department_id: depLaPaz.id,
      hashed_password: def_password,
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
      secondName: "Carla",
      phone: "548393900",
      email: "luciacarla1@upb.edu",
      fatherLastName: 'Sandoval',
      motherLastName: 'Rojas',
      upbCode: 63003,
      role_id: studentRole.id,
      department_id: depCochabamba.id,
      hashed_password: def_password,
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
      secondName: "Carlos",
      phone: "548393900",
      email: "juancarlos1@upb.edu",
      fatherLastName: 'Supervisor',
      motherLastName: '',
      upbCode: 43267,
      role_id: supervisorRole.id,
      department_id: depSantaCruz.id,
      hashed_password: def_password,
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
      secondName: "Carla",
      phone: "123456789",
      email: "anacarla1@upb.edu",
      fatherLastName: 'Scholar',
      motherLastName: 'Ofc',
      upbCode: 43247,
      role_id: scholarshipOfficerRole.id,
      department_id: depLaPaz.id,
      hashed_password: def_password,
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
      upbCode: 32147,
      secondName: "Carla",
      phone: "123456789",
      email: "silviacarla1@upb.edu",
      role_id: adminRole.id,
      department_id: depCochabamba.id,
      hashed_password: def_password,
    },
  });
  await prisma.administratives.create({
    data: {
      id: userAdmin.id,
      upbRole: 'ADMIN',
    },
  });

  const scholarships = [
    { name: 'Beca de Excelencia Académica', description: 'Otorgada a estudiantes con los mejores promedios de su facultad, cubre el 100% de la colegiatura por semestre.' },
    { name: 'Beca 100 Mejores', description: 'Beca concursable para los mejores bachilleres de Bolivia. Cubre entre 20% y 100% de la colegiatura según el rendimiento.' },
    { name: 'Beca Colegio', description: 'Otorgada mediante convenio con colegios destacados. Cubre hasta el 50% de la colegiatura.' },
    { name: 'Beca de Equidad', description: 'Otorgada a estudiantes con alto rendimiento y limitaciones económicas. Cubre entre 10% y 60% según perfil.' },
    { name: 'Beca Deportiva - Cultura', description: 'Beneficia a estudiantes con talento en disciplinas deportivas o artísticas. Cubre del 15% al 50% según nivel.' },
    { name: 'Beca Empresa', description: 'Convenio con empresas para nuevos estudiantes de carreras específicas. Cubre del 20% al 40% de la colegiatura.' },
    { name: 'Beca por Traspaso', description: 'Para estudiantes que vienen de otras universidades con alto rendimiento. Cubre hasta 40% según asignaturas convalidadas.' },
    { name: 'Beca Convenio', description: 'Beca solidaria o por necesidad especial. Cubre hasta el 100% de la colegiatura para poblaciones vulnerables.' },
    { name: 'Beca Comunidad UPB', description: 'Dirigida a bachilleres destacados del municipio del campus. Cubre el 100% de la colegiatura.' },
    { name: 'Beca Interior y Familiar', description: 'Beca por residencia en otro departamento o por hermanos estudiando en la UPB. Cubre entre 10% y 35%.' }
  ];

  await prisma.scholarship.createMany({
    data: scholarships,
    skipDuplicates: true,
  });

  const scholarshipMap = {
    'Beca Colegio': [
      { percentage: 0.1, hours: 10 },
      { percentage: 0.2, hours: 20 },
      { percentage: 0.3, hours: 30 },
      { percentage: 0.4, hours: 40 },
      { percentage: 0.5, hours: 50 },
      { percentage: 0.6, hours: 60 },
    ],
    'Beca de Equidad': [
      { percentage: 0.1, hours: 40 },
      { percentage: 0.2, hours: 80 },
      { percentage: 0.3, hours: 120 },
      { percentage: 0.4, hours: 160 },
      { percentage: 0.5, hours: 200 },
    ],
    'Beca General': [
      { percentage: 0.2, hours: 20 },
      { percentage: 0.3, hours: 30 },
      { percentage: 0.4, hours: 40 },
      { percentage: 0.5, hours: 50 },
    ],
    'Beca Comunidad UPB': [
      { percentage: 1.0, hours: 60 },
    ],
    'Beca Cultural/Deportiva': [
      { percentage: 1.0, hours: 50 },
    ],
  };

  for (const [name, details] of Object.entries(scholarshipMap)) {
    const scholarship = await prisma.scholarship.findFirst({ where: { name } });
    if (!scholarship) {
      console.warn(`⚠️  Becas no encontrada: ${name}`);
      continue;
    }

    for (const detail of details) {
      await prisma.service_details.create({
        data: {
          scholarship_id: scholarship.id,
          percentage: detail.percentage,
          hoursPerSemester: detail.hours,
          totalHours: detail.hours * 8,
        },
      });
    }
  }

  const students = await prisma.user.findMany({
    where: {
      students: { isNot: null },
      is_deleted: false,
    },
    include: { students: true },
  });

  const scholarship = await prisma.scholarship.findFirst({ where: { name: 'Beca Colegio' } });
  if (!scholarship) {
    throw new Error('Beca de Equidad - Avina no encontrada');
  }

  const details = [
    { percentage: 0.1, hours: 40 },
    { percentage: 0.2, hours: 80 },
    { percentage: 0.3, hours: 120 },
  ];

  for (let i = 0; i < Math.min(students.length, details.length); i++) {
    const student = students[i];
    const { percentage, hours } = details[i];

    const serviceDetail = await prisma.service_details.create({
      data: {
        scholarship_id: scholarship.id,
        percentage,
        hoursPerSemester: hours,
        totalHours: hours * 8,
      },
    });

    await prisma.commitment.create({
      data: {
        service_details_id: serviceDetail.id,
        student_id: student.id,
        is_current: true,
      },
    });
  }

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
