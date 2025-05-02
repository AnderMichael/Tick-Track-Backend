import { transactions } from '@prisma/client';

export class TransactionModel {
    id: number;
    date: string;
    hours: number;
    comment_student: string;
    comment_administrative: string;

    constructor(t: transactions) {
        this.id = t.id;
        this.date = t.date;
        this.hours = t.hours;
        this.comment_student = t.comment_student;
        this.comment_administrative = t.comment_administrative;
    }

    static fromMany(txns: transactions[]): TransactionModel[] {
        return txns.map(t => new TransactionModel(t));
    }
}
