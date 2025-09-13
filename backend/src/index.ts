import "reflect-metadata";
import "dotenv/config";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./data-source";
import apartmentsRouter from "./routes/apartments";
import { httpLogger } from "./middlewares/http-logger";
import { errorHandler } from "./middlewares/error-handler";
import { Apartment } from "./entities/Apartment";
import { apiLimiter } from "./middlewares/rate-limit";

const app = express();
app.disable("x-powered-by");
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json());
app.use(httpLogger);
app.use(apiLimiter);

const PORT = process.env.PORT || 4000;

app.get("/", (_req, res) => res.send("Backend (TS) is up ✅"));
app.get("/health", (_req, res) => res.json({ status: "ok", ts: true }));

app.use("/api/apartments", apartmentsRouter);

app.use(errorHandler);

async function seedIfEmpty() {
  const repo = AppDataSource.getRepository(Apartment);
  const count = await repo.count();
  if (count === 0) {
    await repo.save([
      {
        unitName: "Nile View Deluxe",
        unitNumber: "A-101",
        project: "Palm Heights",
        price: "2500000.00",
        city: "Cairo",
      },
      {
        unitName: "Garden Residence",
        unitNumber: "B-204",
        project: "Green Park",
        price: "1850000.00",
        city: "Giza",
      },
      {
        unitName: "Skyline Loft",
        unitNumber: "C-503",
        project: "New Capital Towers",
        price: "3200000.00",
        city: "New Capital",
      },
    ]);
    (app as any).log?.info?.("seeded apartments");
  }
}

const start = async () => {
  try {
    await AppDataSource.initialize();
    (app as any).log?.info?.("DB connected");
    await seedIfEmpty();
  } catch (err: any) {
    (app as any).log?.warn?.(
      { err: err?.message || err },
      "DB not connected yet (continuing)"
    );
  }

  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
};

start();
