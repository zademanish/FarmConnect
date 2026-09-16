import { useCallback, useEffect, useState } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { complaintApi } from "../../services/endpoints";
import { getErrorMessage } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { Loader, EmptyState, StatusBadge, Modal, formatDate } from "../../components/ui";

const TABS = ["All", "Open", "In Progress", "Resolved", "Rejected"];

const AdminComplaints = () => {
  const toast = useToast();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("All");
  const [active, setActive] = useState(null);
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    complaintApi
      .list({ status: tab === "All" ? "" : tab })
      .then(({ data }) => setComplaints(data.data))
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => load(), [load]);

  const open = (complaint) => {
    setActive(complaint);
    setResponse(complaint.adminResponse || "");
    setStatus(complaint.status);
  };

  const save = async () => {
    setBusy(true);
    try {
      await complaintApi.update(active._id, { status, adminResponse: response });
      toast.success("Complaint updated successfully");
      setActive(null);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Complaint Management</h1>
        <p className="mt-1 text-sm text-gray-500">Respond to issues raised by buyers and farmers</p>
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

      {loading ? (
        <Loader />
      ) : complaints.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No complaints" message="Nothing to review here." />
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <button
              key={c._id}
              onClick={() => open(c)}
              className="card block w-full p-5 text-left transition hover:border-primary-300 hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900">{c.subject}</h3>
                  <p className="mt-0.5 text-xs text-gray-500">
                    By {c.userId?.name} ({c.userId?.role})
                    {c.orderId ? ` · Order #${c.orderId.orderNumber}` : ""} ·{" "}
                    {formatDate(c.createdAt)}
                  </p>
                </div>
                <StatusBadge status={c.status} />
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-gray-600">{c.description}</p>
              {c.adminResponse && (
                <p className="mt-2 text-xs font-medium text-primary-600">✓ Response sent</p>
              )}
            </button>
          ))}
        </div>
      )}

      <Modal open={Boolean(active)} onClose={() => setActive(null)} title="Complaint Details" size="lg">
        {active && (
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="font-semibold text-gray-900">{active.subject}</h3>
                <StatusBadge status={active.status} />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                By {active.userId?.name} ({active.userId?.email}) · {formatDate(active.createdAt)}
              </p>
            </div>

            {active.orderId && (
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs text-gray-500">Related Order</p>
                <p className="text-sm font-medium text-gray-900">
                  #{active.orderId.orderNumber} · {active.orderId.orderStatus}
                </p>
              </div>
            )}

            <div>
              <p className="text-xs text-gray-500">Description</p>
              <p className="mt-1 whitespace-pre-line text-sm text-gray-700">{active.description}</p>
            </div>

            <div>
              <label className="label">Update Status</label>
              <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
                {["Open", "In Progress", "Resolved", "Rejected"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Admin Response</label>
              <textarea
                rows={4}
                className="input"
                placeholder="Write a response the user will see..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
              <button className="btn-outline" onClick={() => setActive(null)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={save} disabled={busy}>
                {busy ? <Loader2 className="animate-spin" size={16} /> : "Save Response"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminComplaints;
