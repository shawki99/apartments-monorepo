import { Router, Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { Apartment } from "../entities/Apartment";
import { Brackets } from "typeorm";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../errors/ApiError";
import { writeLimiter } from "../middlewares/rate-limit";

const priceSchema = z
  .union([z.string(), z.number()])
  .refine((v) => {
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n);
  }, "price must be a number")
  .transform((v) => {
    const n = typeof v === "number" ? v : Number(v);
    return n.toFixed(2);
  });

const createApartmentSchema = z.object({
  unitName: z.string().min(1).max(120).trim(),
  unitNumber: z.string().min(1).max(60).trim(),
  project: z.string().min(1).max(120).trim(),
  price: priceSchema,
  city: z.string().min(1).max(80).trim().default("Cairo"),
});

const defaultLimit = parseInt(process.env.PAGINATION_DEFAULT_LIMIT ?? "12", 10);
const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(defaultLimit),
  q: z.string().trim().optional().default(""),
  unitName: z.string().trim().optional().default(""),
  unitNumber: z.string().trim().optional().default(""),
  project: z.string().trim().optional().default(""),
});

const router = Router();

/** GET /api/apartments  — paginated list + search/filters */
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const repo = AppDataSource.getRepository(Apartment);

    const { page, limit, q, unitName, unitNumber, project } =
      listQuerySchema.parse(req.query);

    const qb = repo.createQueryBuilder("apt");

    if (q) {
      qb.andWhere(
        new Brackets((w) => {
          w.where(`apt."unitName" ILIKE :q`)
            .orWhere(`apt."unitNumber" ILIKE :q`)
            .orWhere(`apt.project ILIKE :q`);
        })
      ).setParameter("q", `%${q}%`);
    }
    if (unitName)
      qb.andWhere(`apt."unitName" ILIKE :unitName`, {
        unitName: `%${unitName}%`,
      });
    if (unitNumber)
      qb.andWhere(`apt."unitNumber" ILIKE :unitNumber`, {
        unitNumber: `%${unitNumber}%`,
      });
    if (project)
      qb.andWhere(`apt.project ILIKE :project`, { project: `%${project}%` });

    qb.orderBy(`apt."createdAt"`, "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    res.json({ data, page, limit, total, hasMore: page * limit < total });
  })
);

/** GET /api/apartments/:id  — details */
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const repo = AppDataSource.getRepository(Apartment);
    const id = String(req.params.id);
    const item = await repo.findOne({ where: { id } });
    if (!item) throw ApiError.NotFound("Apartment not found");
    res.json(item);
  })
);

/** POST /api/apartments  — create with validation */
router.post(
  "/",
  writeLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    const repo = AppDataSource.getRepository(Apartment);
    const { unitName, unitNumber, project, price, city } =
      createApartmentSchema.parse(req.body);

    const entity = repo.create({
      unitName,
      unitNumber,
      project,
      price,
      city,
    });

    const saved = await repo.save(entity);
    req.log?.info({ id: saved.id }, "apartment.created");
    return res.status(201).json(saved);
  })
);

export default router;
