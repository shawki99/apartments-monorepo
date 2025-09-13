import "dotenv/config";
import { DataSource } from "typeorm";
import { Apartment } from "./entities/Apartment";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  // we’ll add entities and migrations later
  entities: [Apartment],
  migrations: [],
  synchronize: true,
  logging: false,
});
