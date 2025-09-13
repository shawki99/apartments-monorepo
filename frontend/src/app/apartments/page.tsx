import Link from "next/link";

type Apartment = {
  id: string;
  unitName: string;
  unitNumber: string;
  project: string;
  price: string;
  city: string;
  createdAt: string;
};
type ListResponse = { data: Apartment[]; page: number; limit: number; total: number; hasMore: boolean; };

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default async function ApartmentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string | string[]; page?: string | string[]; unitName?: string | string[]; unitNumber?: string | string[]; project?: string | string[]; }>;
}) {
  const sp = (await searchParams) ?? {};
  const sv = (v?: string | string[]) => (Array.isArray(v) ? v[0] ?? "" : v ?? "");

  const q = sv(sp.q);
  const page = sv(sp.page) || "1";
  const unitName = sv(sp.unitName);
  const unitNumber = sv(sp.unitNumber);
  const project = sv(sp.project);

  const qs = new URLSearchParams({ page, q, unitName, unitNumber, project });
  const res = await fetch(`${API}/api/apartments?${qs.toString()}`, { cache: "no-store" });
  if (!res.ok) return <div className="container">Failed to load apartments.</div>;
  const { data, total, hasMore } = (await res.json()) as ListResponse;

  const nextHref = `/apartments?${new URLSearchParams({ q, unitName, unitNumber, project, page: String(Number(page) + 1) }).toString()}`;
  const prevHref = `/apartments?${new URLSearchParams({ q, unitName, unitNumber, project, page: String(Math.max(1, Number(page) - 1)) }).toString()}`;

  return (
    <div className="container">
      <h1 className="title">Apartments</h1>

      <form action="/apartments" className="form">
        <input name="q" defaultValue={q} placeholder="Search (name / number / project)" className="input" />
        <div className="inputs-grid">
          <input name="unitName" defaultValue={unitName} placeholder="Filter by unit name" className="input" />
          <input name="unitNumber" defaultValue={unitNumber} placeholder="Filter by unit number" className="input" />
          <input name="project" defaultValue={project} placeholder="Filter by project" className="input" />
        </div>
        <button type="submit" className="btn">Search</button>
      </form>

      <div className="card-meta" style={{ marginBottom: 8 }}>Total: {total}</div>

      <div className="card-grid">
        {data.map((apt) => (
          <Link key={apt.id} href={`/apartments/${apt.id}`} className="card">
            <div className="card-title">{apt.unitName}</div>
            <div className="card-meta">{apt.project} • {apt.unitNumber} • {apt.city}</div>
            <div className="card-price">
              {Intl.NumberFormat(undefined, { style: "currency", currency: "EGP" }).format(Number(apt.price))}
            </div>
          </Link>
        ))}
        {data.length === 0 && <div className="card-meta">No results.</div>}
      </div>

      <div className="pager">
        <Link aria-disabled={Number(page) <= 1} href={prevHref} className="pager-link" >Prev</Link>
        <Link aria-disabled={!hasMore} href={nextHref} className="pager-link" >Next</Link>
      </div>
    </div>
  );
}
