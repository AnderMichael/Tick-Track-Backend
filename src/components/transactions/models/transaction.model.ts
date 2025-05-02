export class TransactionModel {
  id: number;
  date: string;
  hours: number;
  comment_student: string;
  comment_administrative: string;
  student_id: number;

  constructor(t: any) {
    this.id = t.id;
    this.date = t.date;
    this.hours = t.hours;
    this.comment_student = t.comment_student;
    this.comment_administrative = t.comment_administrative;
    this.student_id = t.student_id;
  }

  static fromMany(txns: any[]): TransactionModel[] {
    return txns.map((t) => new TransactionModel(t));
  }
}
