import { Prisma } from '@prisma/client';

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
        const isReadOp = [
          'findUnique',
          'findFirst',
          'findMany',
          'count',
        ].includes(operation);

        if (isReadOp && 'where' in args) {
          args.where = {
            ...args.where,
            is_deleted: false,
          };
        }

        return query(args);
      },
    },
  },
});
