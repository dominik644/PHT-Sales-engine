import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/security";
import { formatMoney } from "@/lib/money";
import { AdminActions } from "@/components/AdminActions";
import { AdminB2BPanel } from "@/components/AdminB2BPanel";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  if (!(await requireAdmin())) redirect("/admin/login");

  const [
    productCount,
    orderCount,
    pendingErp,
    recentOrders,
    syncLogs,
    companyCount,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.count({
      where: {
        AND: [
          { status: { in: ["approved", "confirmed"] } },
          { erpSyncStatus: { not: "synced" } },
        ],
      },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { items: true, invoice: true, company: true },
    }),
    prisma.erpSyncLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.company.count(),
  ]);

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="eyebrow">Operations</p>
          <h1>Admin</h1>
        </div>
        <div className="admin-header__actions">
          <Link href="/shop" className="btn btn--ink">
            Storefront
          </Link>
          <AdminActions />
        </div>
      </header>

      <section className="admin-stats">
        <div className="panel">
          <p className="eyebrow">Products</p>
          <p className="admin-stat">{productCount}</p>
        </div>
        <div className="panel">
          <p className="eyebrow">B2B Firmen</p>
          <p className="admin-stat">{companyCount}</p>
        </div>
        <div className="panel">
          <p className="eyebrow">Orders</p>
          <p className="admin-stat">{orderCount}</p>
        </div>
        <div className="panel">
          <p className="eyebrow">ERP pending</p>
          <p className="admin-stat">{pendingErp}</p>
        </div>
      </section>

      <AdminB2BPanel />

      <section className="admin-grid" style={{ marginTop: "1.25rem" }}>
        <div className="panel">
          <h2>Recent orders</h2>
          <div className="admin-table">
            {recentOrders.map((order) => (
              <div key={order.id} className="admin-row">
                <div>
                  <strong>{order.number}</strong>
                  <p className="muted">
                    {order.company?.name ?? order.name} · {order.status}
                  </p>
                  {order.invoice ? (
                    <p className="muted">RE {order.invoice.number}</p>
                  ) : null}
                </div>
                <div className="admin-row__meta">
                  <span>{formatMoney(order.totalCents)}</span>
                  <span className={`pill pill--${order.erpSyncStatus}`}>
                    ERP {order.erpSyncStatus}
                  </span>
                  {order.erpSyncStatus !== "synced" &&
                  ["approved", "confirmed"].includes(order.status) ? (
                    <RetryErpButton orderId={order.id} />
                  ) : null}
                </div>
              </div>
            ))}
            {recentOrders.length === 0 ? (
              <p className="muted">No orders yet.</p>
            ) : null}
          </div>
        </div>

        <div className="panel">
          <h2>ERP sync log</h2>
          <div className="admin-table">
            {syncLogs.map((log) => (
              <div key={log.id} className="admin-row">
                <div>
                  <strong>
                    {log.direction}/{log.entity}
                  </strong>
                  <p className="muted">{log.detail}</p>
                </div>
                <span className={`pill pill--${log.status}`}>{log.status}</span>
              </div>
            ))}
            {syncLogs.length === 0 ? (
              <p className="muted">No sync events yet.</p>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

function RetryErpButton({ orderId }: { orderId: string }) {
  return <AdminActions retryOrderId={orderId} />;
}
