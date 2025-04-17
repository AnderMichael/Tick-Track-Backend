import { PrismaClient } from '@prisma/client';
import { softDeleteExtension } from './prisma.extension';

const prisma = new PrismaClient().$extends(softDeleteExtension);

export type CustomPrismaClientType = typeof prisma;
export { prisma };