import { semester } from "@prisma/client";

export class SemesterModel {
  id: number;
  name: string;
  start_date: string;
  end_date: string;

  constructor(sem: semester) {
    this.id = sem.id;
    this.name = sem.name;
    this.start_date = sem.start_date;
    this.end_date = sem.end_date;
  }

  static fromMany(semesters: semester[]): SemesterModel[] {
    return semesters.map(s => new SemesterModel(s));
  }
}