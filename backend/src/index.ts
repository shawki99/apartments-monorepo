import "reflect-metadata"; // <-- must be first, before TypeORM uses decorators
import "dotenv/config";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./data-source";
import { Apartment } from "./entities/Apartment";
import apartmentsRouter from "./routes/apartments";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

app.get("/", (_req, res) => {
  res.send("Backend (TS) is up ✅");
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", ts: true });
});

app.use("/api/apartments", apartmentsRouter);

// --- tiny seed helper (DEV) ---
async function seedIfEmpty() {
  const repo = AppDataSource.getRepository(Apartment);
  const count = await repo.count();
  if (count > 0) return;

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

  console.log("🌱 Seeded sample apartments");
}

const start = async () => {
  try {
    await AppDataSource.initialize();
    console.log("✅ DB connected");
    await seedIfEmpty();
  } catch (err: any) {
    console.warn("⚠️ DB not connected yet (continuing):", err?.message || err);
  }

  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
};

start();
