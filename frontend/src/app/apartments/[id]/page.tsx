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

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default async function ApartmentDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const res = await fetch(`${API}/api/apartments/${id}`, { cache: "no-store" });
  if (!res.ok) {
    return (
      <div className="container">
        <div style={{ marginBottom: 12 }}><Link href="/apartments" className="back">← Back</Link></div>
        <div>Apartment not found.</div>
      </div>
    );
  }

  const apt = (await res.json()) as Apartment;

  return (
    <div className="container">
      <div style={{ marginBottom: 12 }}><Link href="/apartments" className="back">← Back</Link></div>

      <div className="details-card">
        <h1 className="title">{apt.unitName}</h1>
        <div className="card-meta">{apt.project} • {apt.unitNumber} • {apt.city}</div>
        <div className="card-price" style={{ fontSize: 20 }}>
          {Intl.NumberFormat(undefined, { style: "currency", currency: "EGP" }).format(Number(apt.price))}
        </div>
        <div className="card-meta" style={{ marginTop: 6 }}>
          Added: {new Date(apt.createdAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
