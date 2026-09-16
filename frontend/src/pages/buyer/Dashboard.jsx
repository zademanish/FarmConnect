import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Inbox, Clock, ShoppingBag, CheckCircle2, Star, IndianRupee, Search } from "lucide-react";
import { userApi } from "../../services/endpoints";
import { useAuth } from "../../context/AuthContext";
import { imageUrl } from "../../services/api";
import {
  Loader, StatCard, StatusBadge, EmptyState, formatCurrency, formatDate,
} from "../../components/ui";

const BuyerDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userApi
      .buyerDashboard()
      .then(({ data }) => setData(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading dashboard..." />;
  if (!data) return <EmptyState title="Could not load dashboard" />;

  const { stats, recentOrders, recentRequests } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hello, {user?.name}</h1>
          <p className="mt-1 text-sm text-gray-500">Track your requests and orders here</p>
        </div>
        <Link to="/products" className="btn-primary">
          <Search size={17} /> Browse Products
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total Requests" value={stats.totalRequests} icon={Inbox} tone="blue" />
        <StatCard label="Pending Requests" value={stats.pendingRequests} icon={Clock} tone="amber" />
        <StatCard label="Active Orders" value={stats.activeOrders} icon={ShoppingBag} tone="purple" />
        <StatCard label="Completed Orders" value={stats.completedOrders} icon={CheckCircle2} />
        <StatCard label="Reviews Given" value={stats.totalReviews} icon={Star} tone="amber" />
        <StatCard label="Total Spent" value={formatCurrency(stats.totalSpent)} icon={IndianRupee} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/buyer/orders" className="text-sm font-medium text-primary-600 hover:underline">
              View all
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((o) => (
                <div key={o._id} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
                  {o.productId?.images?.[0] ? (
                    <img
                      src={imageUrl(o.productId.images[0])}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="h-10 w-10 shrink-0 rounded-lg bg-gray-100" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {o.productId?.name}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      #{o.orderNumber} · {formatCurrency(o.totalAmount)} · {formatDate(o.createdAt)}
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
            <h2 className="font-semibold text-gray-900">Recent Requests</h2>
            <Link to="/buyer/requests" className="text-sm font-medium text-primary-600 hover:underline">
              View all
            </Link>
          </div>
          {recentRequests.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">No requests yet</p>
          ) : (
            <div className="space-y-3">
              {recentRequests.map((r) => (
                <div key={r._id} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {r.productId?.name}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {r.farmerId?.name} · {r.quantity} {r.productId?.unit} ·{" "}
                      {formatCurrency(r.totalAmount)}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default BuyerDashboard;
