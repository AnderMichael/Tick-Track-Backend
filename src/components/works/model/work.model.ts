import { work } from "@prisma/client";

export class WorkModel {
  id: number;
  title: string;
  description: string;
  date_begin: string;
  date_end: string;
  administrative_id: number;
  semester_id: number;

  constructor(work: work) {
    this.id = work.id;
    this.title = work.title;
    this.description = work.description;
    this.date_begin = work.date_begin;
    this.date_end = work.date_end;
    this.administrative_id = work.administrative_id;
    this.semester_id = work.semester_id;
  }

  static fromMany(works: work[]): WorkModel[] {
    return works.map(w => new WorkModel(w));
  }
}
