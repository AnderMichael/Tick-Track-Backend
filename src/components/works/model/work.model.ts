import { Prisma, work } from '@prisma/client';

const workWithRelations = Prisma.validator<Prisma.workDefaultArgs>()({
  include: {
    administrative: {
      include: {
        user: true,
      }
    },
    semester: true,
  }
})

export type Work = Prisma.workGetPayload<typeof workWithRelations>;
export class WorkModel {
  id: number;
  title: string;
  description: string;
  date_begin: string;
  date_end: string;
  administrative: {
    upbCode: number;
    upb_role: string;
    name: string;
  }
  semester_id: number;

  constructor(work: Work) {
    this.id = work.id;
    this.title = work.title;
    this.description = work.description;
    this.date_begin = work.date_begin;
    this.date_end = work.date_end;
    this.administrative = {
      upbCode: work.administrative.user.upbCode,
      upb_role: work.administrative.upb_role,
      name: `${work.administrative.user.firstName} ${work.administrative.user.fatherLastName}`,
    };
    this.semester_id = work.semester_id;
  }

  static fromMany(works: Work[]): WorkModel[] {
    return works.map((w) => new WorkModel(w));
  }
}
