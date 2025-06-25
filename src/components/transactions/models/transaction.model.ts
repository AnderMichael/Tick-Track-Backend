import { Prisma } from '@prisma/client';

const transactionWithRelations =
  Prisma.validator<Prisma.transactionDefaultArgs>()({
    include: {
      inscription: {
        include: {
          commitment: {
            include: {
              student: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      },

      work: {
        include: {
          administrative: {
            include: {
              user: true,
            },
          },
        },
      },
      author: {
        include: {
          user: true,
        },
      }
    },
  });

export type Transaction = Prisma.transactionGetPayload<
  typeof transactionWithRelations
>;
export class TransactionModel {
  id: number;
  hours: number;
  date: string;
  comment_student: string;
  comment_administrative: string;
  administrative_name: string;
  work_name: string;
  student_name: string;
  student_upbCode: number;
  commitment_id: number;
  author_name: string;
  work: {
    work_id: number;
    semester_id: number;
  };

  constructor(transaction: Transaction) {
    this.id = transaction.id;
    this.hours = transaction.hours;
    this.date = transaction.date;
    this.comment_student = transaction.comment_student || '';
    this.comment_administrative = transaction.comment_administrative || '';
    this.administrative_name = `${transaction.work.administrative.user.firstName} ${transaction.work.administrative.user.fatherLastName}`;
    this.work_name = transaction.work.title;
    this.student_name = `${transaction.inscription.commitment.student.user.firstName} ${transaction.inscription.commitment.student.user.fatherLastName}`;
    this.student_upbCode = transaction.inscription.commitment.student.user.upbCode;
    this.commitment_id = transaction.inscription.commitment.id;
    this.author_name = `${transaction.author.user.firstName} ${transaction.author.user.fatherLastName}`;
    this.work = {
      work_id: transaction.work.id,
      semester_id: transaction.work.semester_id,
    };
  }

  static fromMany(data: any[]): TransactionModel[] {
    return data.map((t) => new TransactionModel(t));
  }
}
