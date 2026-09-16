import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { requestApi } from "../../services/endpoints";
import { getErrorMessage } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import RequestTable from "../../components/RequestTable";
import { Loader } from "../../components/ui";

const TABS = ["All", "Pending", "Accepted", "Rejected", "Cancelled"];

const BuyerRequests = () => {
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("All");

  const load = useCallback(() => {
    setLoading(true);
    requestApi
      .list({ status: tab === "All" ? "" : tab })
      .then(({ data }) => setRequests(data.data))
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => load(), [load]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Purchase Requests</h1>
          <p className="mt-1 text-sm text-gray-500">
            Once a farmer accepts, an order is created automatically
          </p>
        </div>
        <Link to="/products" className="btn-primary">
          <Search size={17} /> Browse Products
        </Link>
      </div>

      <div className="flex gap-1.5 overflow-x-auto">
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

      {loading ? <Loader /> : <RequestTable requests={requests} role="buyer" onChanged={load} />}
    </div>
  );
};

export default BuyerRequests;
