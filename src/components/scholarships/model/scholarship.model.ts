import { scholarship } from "@prisma/client";

export class ScholarshipModel {
  id: number;
  name: string;
  description: string;

  constructor(s: scholarship) {
    this.id = s.id;
    this.name = s.name;
    this.description = s.description;
  }

  static fromMany(scholarships: scholarship[]): ScholarshipModel[] {
    return scholarships.map(s => new ScholarshipModel(s));
  }
}
