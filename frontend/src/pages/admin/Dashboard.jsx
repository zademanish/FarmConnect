import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Tractor, Users, Package, Clock, ShoppingBag, CheckCircle2, MessageSquare, IndianRupee,
} from "lucide-react";
import { adminApi } from "../../services/endpoints";
import {
  Loader, StatCard, StatusBadge, EmptyState, formatCurrency, formatDate,
} from "../../components/ui";

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .stats()
      .then(({ data }) => setData(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading dashboard..." />;
  if (!data) return <EmptyState title="Could not load dashboard" />;

  const { stats, ordersByStatus, recentOrders, recentProducts } = data;
  const maxCount = Math.max(...ordersByStatus.map((o) => o.count), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of the entire marketplace</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Farmers" value={stats.totalFarmers} icon={Tractor} />
        <StatCard label="Total Buyers" value={stats.totalBuyers} icon={Users} tone="blue" />
        <StatCard label="Total Products" value={stats.totalProducts} icon={Package} tone="purple" />
        <StatCard label="Pending Approval" value={stats.pendingProducts} icon={Clock} tone="amber" />
        <StatCard label="Total Orders" value={stats.totalOrders} icon={ShoppingBag} tone="blue" />
        <StatCard label="Active Orders" value={stats.pendingOrders} icon={Clock} tone="amber" />
        <StatCard label="Completed Orders" value={stats.completedOrders} icon={CheckCircle2} />
        <StatCard label="Open Complaints" value={stats.openComplaints} icon={MessageSquare} tone="red" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card flex items-center justify-between p-6">
          <div>
            <p className="text-sm text-gray-500">Total Revenue (delivered)</p>
            <p className="mt-1 text-3xl font-bold text-primary-700">
              {formatCurrency(stats.totalRevenue)}
            </p>
          </div>
          <span className="rounded-lg bg-primary-50 p-3.5 text-primary-600">
            <IndianRupee size={26} />
          </span>
        </div>

        {stats.pendingProducts > 0 && (
          <Link
            to="/admin/products?status=Pending"
            className="card flex items-center justify-between p-6 transition hover:border-amber-300 hover:shadow-md"
          >
            <div>
              <p className="text-sm text-gray-500">Products awaiting review</p>
              <p className="mt-1 text-3xl font-bold text-amber-600">{stats.pendingProducts}</p>
              <p className="mt-1 text-xs font-medium text-amber-700">Click to review →</p>
            </div>
            <span className="rounded-lg bg-amber-50 p-3.5 text-amber-600">
              <Clock size={26} />
            </span>
          </Link>
        )}
      </div>

      {/* Orders by status — simple bar chart */}
      {ordersByStatus.length > 0 && (
        <section className="card p-6">
          <h2 className="mb-5 font-semibold text-gray-900">Orders by Status</h2>
          <div className="space-y-3">
            {ordersByStatus.map(({ _id, count }) => (
              <div key={_id} className="flex items-center gap-3">
                <span className="w-36 shrink-0 truncate text-sm text-gray-600">{_id}</span>
                <div className="h-6 flex-1 overflow-hidden rounded-md bg-gray-100">
                  <div
                    className="flex h-full items-center justify-end rounded-md bg-primary-500 px-2 text-xs font-semibold text-white transition-all"
                    style={{ width: `${Math.max((count / maxCount) * 100, 8)}%` }}
                  >
                    {count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm font-medium text-primary-600 hover:underline">
              View all
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((o) => (
                <div key={o._id} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {o.productId?.name}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      #{o.orderNumber} · {o.buyerId?.name} · {formatCurrency(o.totalAmount)}
                    </p>
                  </div>
                  <StatusBadge status={o.orderStatus} />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recently Added Products</h2>
            <Link to="/admin/products" className="text-sm font-medium text-primary-600 hover:underline">
              View all
            </Link>
          </div>
          {recentProducts.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">No products yet</p>
          ) : (
            <div className="space-y-3">
              {recentProducts.map((p) => (
                <div key={p._id} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">{p.name}</p>
                    <p className="truncate text-xs text-gray-500">
                      {p.farmerId?.name} · {p.categoryId?.name} · {formatDate(p.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={p.approvalStatus} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
