import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-intro" style={{ paddingBottom: "4rem" }}>
      <p className="eyebrow">404</p>
      <h1>Product not found</h1>
      <p className="muted">That item is not in the PHT catalog.</p>
      <Link href="/shop" className="btn btn--primary" style={{ marginTop: "1rem" }}>
        Back to shop
      </Link>
    </div>
  );
}
