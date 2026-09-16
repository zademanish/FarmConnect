import { useState } from "react";
import { Eye, Check, X, Inbox } from "lucide-react";
import { requestApi } from "../services/endpoints";
import { getErrorMessage } from "../services/api";
import { useToast } from "../context/ToastContext";
import { EmptyState, StatusBadge, Modal, ConfirmDialog, formatCurrency, formatDate } from "./ui";

/**
 * Shared purchase-request table.
 * `role` decides which actions show: farmer accepts/rejects, buyer cancels,
 * admin can do both.
 */
const RequestTable = ({ requests, role, onChanged }) => {
  const toast = useToast();
  const [detail, setDetail] = useState(null);
  const [action, setAction] = useState(null); // { request, status }
  const [busy, setBusy] = useState(false);

  const isFarmerSide = role === "farmer" || role === "admin";
  const isBuyerSide = role === "buyer" || role === "admin";

  const runAction = async () => {
    setBusy(true);
    try {
      await requestApi.updateStatus(action.request._id, action.status);
      toast.success(
        action.status === "Accepted"
          ? "Request accepted — an order has been created"
          : `Request ${action.status.toLowerCase()} successfully`
      );
      setAction(null);
      setDetail(null);
      onChanged?.();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  if (requests.length === 0) {
    return <EmptyState icon={Inbox} title="No purchase requests" message="Requests will appear here." />;
  }

  return (
    <>
      <div className="table-wrap">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="th">Product</th>
              {isFarmerSide && <th className="th">Buyer</th>}
              {role !== "farmer" && <th className="th">Farmer</th>}
              <th className="th">Quantity</th>
              <th className="th">Total</th>
              <th className="th">Date</th>
              <th className="th">Status</th>
              <th className="th text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {requests.map((r) => (
              <tr key={r._id} className="hover:bg-gray-50">
                <td className="td font-medium text-gray-900">{r.productId?.name || "—"}</td>
                {isFarmerSide && <td className="td">{r.buyerId?.name || "—"}</td>}
                {role !== "farmer" && <td className="td">{r.farmerId?.name || "—"}</td>}
                <td className="td">
                  {r.quantity} {r.productId?.unit}
                </td>
                <td className="td font-semibold">{formatCurrency(r.totalAmount)}</td>
                <td className="td text-gray-500">{formatDate(r.createdAt)}</td>
                <td className="td">
                  <StatusBadge status={r.status} />
                </td>
                <td className="td">
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => setDetail(r)}
                      className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
                      title="View details"
                    >
                      <Eye size={15} />
                    </button>

                    {r.status === "Pending" && isFarmerSide && (
                      <>
                        <button
                          onClick={() => setAction({ request: r, status: "Accepted" })}
                          className="rounded-lg border border-primary-200 p-2 text-primary-600 hover:bg-primary-50"
                          title="Accept"
                        >
                          <Check size={15} />
                        </button>
                        <button
                          onClick={() => setAction({ request: r, status: "Rejected" })}
                          className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                          title="Reject"
                        >
                          <X size={15} />
                        </button>
                      </>
                    )}

                    {r.status === "Pending" && isBuyerSide && role !== "admin" && (
                      <button
                        onClick={() => setAction({ request: r, status: "Cancelled" })}
                        className="rounded-lg border border-gray-300 px-2.5 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail modal */}
      <Modal open={Boolean(detail)} onClose={() => setDetail(null)} title="Purchase Request Details">
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3.5">
              <div>
                <p className="font-semibold text-gray-900">{detail.productId?.name}</p>
                <p className="text-sm text-gray-500">
                  {detail.quantity} {detail.productId?.unit} ×{" "}
                  {formatCurrency(detail.price)}
                </p>
              </div>
              <StatusBadge status={detail.status} />
            </div>

            <dl className="grid gap-3 sm:grid-cols-2">
              {[
                ["Buyer", detail.buyerId?.name],
                ["Farmer", detail.farmerId?.name],
                ["Contact Phone", detail.phone],
                ["Requested On", formatDate(detail.createdAt)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-gray-500">{label}</dt>
                  <dd className="text-sm font-medium text-gray-900">{value || "—"}</dd>
                </div>
              ))}
            </dl>

            <div>
              <p className="text-xs text-gray-500">Delivery Address</p>
              <p className="mt-0.5 text-sm text-gray-800">{detail.deliveryAddress}</p>
            </div>

            {detail.message && (
              <div>
                <p className="text-xs text-gray-500">Message from Buyer</p>
                <p className="mt-0.5 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                  {detail.message}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between rounded-lg bg-primary-50 px-4 py-3">
              <span className="text-sm font-medium text-primary-800">Total Amount</span>
              <span className="text-lg font-bold text-primary-700">
                {formatCurrency(detail.totalAmount)}
              </span>
            </div>

            {detail.status === "Pending" && isFarmerSide && (
              <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                <button
                  className="btn-danger"
                  onClick={() => setAction({ request: detail, status: "Rejected" })}
                >
                  Reject
                </button>
                <button
                  className="btn-primary"
                  onClick={() => setAction({ request: detail, status: "Accepted" })}
                >
                  Accept & Create Order
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(action)}
        onClose={() => setAction(null)}
        onConfirm={runAction}
        loading={busy}
        tone={action?.status === "Accepted" ? "primary" : "danger"}
        title={
          { Accepted: "Accept Request", Rejected: "Reject Request", Cancelled: "Cancel Request" }[
            action?.status
          ] || "Update Request"
        }
        confirmLabel={
          { Accepted: "Accept", Rejected: "Reject", Cancelled: "Cancel Request" }[action?.status] ||
          "Confirm"
        }
        message={
          action?.status === "Accepted"
            ? `Accept this request? An order will be created and ${action?.request?.quantity} ${action?.request?.productId?.unit} will be reserved from your stock.`
            : `Are you sure you want to mark this request as ${action?.status?.toLowerCase()}?`
        }
      />
    </>
  );
};

export default RequestTable;
