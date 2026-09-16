import { useCallback, useEffect, useState } from "react";
import { orderApi } from "../../services/endpoints";
import { getErrorMessage } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import OrderTable from "../../components/OrderTable";
import { Loader } from "../../components/ui";

const TABS = [
  "All", "Confirmed", "Processing", "Ready for Delivery",
  "Out for Delivery", "Delivered", "Cancelled",
];

const FarmerOrders = () => {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("All");

  const load = useCallback(() => {
    setLoading(true);
    orderApi
      .list({ status: tab === "All" ? "" : tab })
      .then(({ data }) => setOrders(data.data))
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => load(), [load]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="mt-1 text-sm text-gray-500">Track and advance your confirmed orders</p>
      </div>

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

      {loading ? <Loader /> : <OrderTable orders={orders} role="farmer" onChanged={load} />}
    </div>
  );
};

export default FarmerOrders;
