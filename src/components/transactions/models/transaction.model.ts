export class TransactionModel {
  id: number;
  hours: number;
  date: string;
  comment_student: string;
  comment_administrative: string;
  administrative_name: string;
  work_name: string;

  constructor(transaction: any) {
    this.id = transaction.id;
    this.hours = transaction.hours;
    this.date = transaction.date;
    this.comment_student = transaction.comment_student;
    this.comment_administrative = transaction.comment_administrative;
    this.administrative_name = `${transaction.work.administrative.user.firstName} ${transaction.work.administrative.user.fatherLastName}`;
    this.work_name = transaction.work.title;
  }

  static fromMany(data: any[]): TransactionModel[] {
    return data.map((t) => new TransactionModel(t));
  }
}
