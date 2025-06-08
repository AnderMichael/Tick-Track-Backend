import { semester } from '@prisma/client';

export class SemesterModel {
  id: number;
  name: string;
  number: number;
  year: number;
  start_date: string;
  end_date: string;

  constructor(sem: semester) {
    this.id = sem.id;
    this.start_date = sem.start_date;
    this.end_date = sem.end_date;
    this.number = sem.number;
    this.year = sem.year;
    this.name = `Semestre ${this.obtainRomanNumber(this.number)} - ${sem.year}`;
  }

  static fromMany(semesters: semester[]): SemesterModel[] {
    return semesters.map((s) => new SemesterModel(s));
  }

  obtainRomanNumber(decimalNumber: number): string {
    const romanNumerals = [
      'I',
      'II',
      'III',
      'IV',
      'V',
      'VI',
      'VII',
      'VIII',
      'IX',
      'X',
    ];
    return romanNumerals[decimalNumber - 1] || decimalNumber.toString();
  }
}
