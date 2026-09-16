import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { orderApi } from "../../services/endpoints";
import { getErrorMessage } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import OrderTable from "../../components/OrderTable";
import { Loader } from "../../components/ui";

const TABS = [
  "All", "Confirmed", "Processing", "Ready for Delivery",
  "Out for Delivery", "Delivered", "Cancelled",
];

const AdminOrders = () => {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    orderApi
      .list({ status: tab === "All" ? "" : tab, search })
      .then(({ data }) => setOrders(data.data))
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, search]);

  useEffect(() => {
    const t = setTimeout(load, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track orders, update status and assign delivery workers
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                tab === t
                  ? "bg-primary-600 text-white"
                  : "border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="relative lg:ml-auto lg:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            className="input pl-9"
            placeholder="Search order number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? <Loader /> : <OrderTable orders={orders} role="admin" onChanged={load} />}
    </div>
  );
};

export default AdminOrders;
