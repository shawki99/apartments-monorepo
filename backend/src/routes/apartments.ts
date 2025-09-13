import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Apartment } from "../entities/Apartment";
import { Brackets } from "typeorm";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const repo = AppDataSource.getRepository(Apartment);

  const page = Math.max(parseInt(String(req.query.page ?? "1"), 10), 1);
  const defaultLimit = parseInt(process.env.PAGINATION_DEFAULT_LIMIT ?? "12", 10);
  const limit = Math.min(
    Math.max(parseInt(String(req.query.limit ?? defaultLimit), 10), 1),
    100
  );

  const q = (req.query.q ?? "") as string;
  const unitName = (req.query.unitName ?? "") as string;
  const unitNumber = (req.query.unitNumber ?? "") as string;
  const project = (req.query.project ?? "") as string;

  const qb = repo.createQueryBuilder("apt");

  // Free-text search across three fields (case-insensitive)
  if (q.trim()) {
    qb.andWhere(
      new Brackets((w) => {
        w.where(`apt."unitName" ILIKE :q`)
          .orWhere(`apt."unitNumber" ILIKE :q`)
          .orWhere(`apt.project ILIKE :q`);
      })
    ).setParameter("q", `%${q.trim()}%`);
  }

  // Individual filters (combine with AND)
  if (unitName.trim()) {
    qb.andWhere(`apt."unitName" ILIKE :unitName`, { unitName: `%${unitName.trim()}%` });
  }
  if (unitNumber.trim()) {
    qb.andWhere(`apt."unitNumber" ILIKE :unitNumber`, { unitNumber: `%${unitNumber.trim()}%` });
  }
  if (project.trim()) {
    qb.andWhere(`apt.project ILIKE :project`, { project: `%${project.trim()}%` });
  }

  qb.orderBy(`apt."createdAt"`, "DESC")
    .skip((page - 1) * limit)
    .take(limit);

  const [data, total] = await qb.getManyAndCount();

  res.json({
    data,
    page,
    limit,
    total,
    hasMore: page * limit < total,
  });
});

/** GET /api/apartments/:id  — details */
router.get("/:id", async (req: Request, res: Response) => {
  const repo = AppDataSource.getRepository(Apartment);
  const id = String(req.params.id);

  const item = await repo.findOne({ where: { id } });
  if (!item) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Apartment not found" } });

  res.json(item);
});

/** helper: normalize price to decimal string */
function toPriceString(input: unknown): string {
  if (typeof input === "number") return input.toFixed(2);
  if (typeof input === "string") {
    const n = Number(input);
    if (!Number.isFinite(n)) throw new Error("Invalid price");
    return n.toFixed(2);
  }
  throw new Error("Invalid price");
}

/** POST /api/apartments  — create */
router.post("/", async (req: Request, res: Response) => {
  const repo = AppDataSource.getRepository(Apartment);
  const { unitName, unitNumber, project, price, city } = req.body ?? {};

  if (!unitName || !unitNumber || !project || price === undefined) {
    return res.status(400).json({
      error: { code: "BAD_REQUEST", message: "unitName, unitNumber, project, and price are required" },
    });
  }

  let priceStr: string;
  try {
    priceStr = toPriceString(price);
  } catch {
    return res.status(400).json({ error: { code: "BAD_REQUEST", message: "price must be a number" } });
  }

  const entity = repo.create({
    unitName: String(unitName),
    unitNumber: String(unitNumber),
    project: String(project),
    price: priceStr,
    city: city ? String(city) : "Cairo",
  });

  const saved = await repo.save(entity);
  return res.status(201).json(saved);
});

export default router;
