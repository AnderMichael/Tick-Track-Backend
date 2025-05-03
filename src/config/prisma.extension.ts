import { Prisma } from '@prisma/client';

function recursivelyAddIsDeletedFalse(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  const newObj = { ...obj };

  if ('where' in newObj) {
    newObj.where = {
      ...newObj.where,
      is_deleted: false,
    };
  }

  for (const key in newObj) {
    if (typeof newObj[key] === 'object') {
      newObj[key] = recursivelyAddIsDeletedFalse(newObj[key]);
    }
  }

  return newObj;
}

export const softDeleteExtension = Prisma.defineExtension({
  name: 'softDelete',
  model: {
    $allModels: {
      async delete<M, A>(
        this: M,
        where: Prisma.Args<M, 'delete'>['where'],
      ): Promise<Prisma.Result<M, A, 'update'>> {
        const context = Prisma.getExtensionContext(this);
        return (context as any).update({
          where,
          data: { is_deleted: true },
        });
      },

      async deleteMany<M, A>(
        this: M,
        args: Prisma.Args<M, 'deleteMany'>,
      ): Promise<Prisma.Result<M, A, 'updateMany'>> {
        const context = Prisma.getExtensionContext(this);
        return (context as any).updateMany({
          where: args.where,
          data: { is_deleted: true },
        });
      },
    },
  },
  query: {
    $allModels: {
      async $allOperations({ operation, args, query }) {
        const readOps = ['findUnique', 'findFirst', 'findMany', 'count', 'aggregate', 'groupBy'];

        if (readOps.includes(operation)) {
          args = recursivelyAddIsDeletedFalse(args);
        }

        return query(args);
      },
    },
  },
});
