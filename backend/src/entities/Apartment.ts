import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "apartments" })
export class Apartment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ length: 120 })
  unitName!: string;

  @Column({ length: 60 })
  unitNumber!: string;

  @Column({ length: 120 })
  project!: string;

  @Column("decimal", { precision: 12, scale: 2 })
  price!: string; // keep as string (TypeORM decimal); you can cast on read

  @Column({ length: 80, default: "Cairo" })
  city!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
