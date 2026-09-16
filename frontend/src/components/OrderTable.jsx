import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, ShoppingBag, Truck, Loader2, ExternalLink } from "lucide-react";
import { orderApi, workerApi } from "../services/endpoints";
import { getErrorMessage } from "../services/api";
import { useToast } from "../context/ToastContext";
import { EmptyState, StatusBadge, Modal, ConfirmDialog, formatCurrency, formatDate } from "./ui";

// The delivery pipeline, in order — used to render the tracker
const FLOW = [
  "Confirmed",
  "Processing",
  "Ready for Delivery",
  "Out for Delivery",
  "Delivered",
];

// What each role is allowed to move an order to
const NEXT_STATUS = {
  Confirmed: "Processing",
  Processing: "Ready for Delivery",
  "Ready for Delivery": "Out for Delivery",
  "Out for Delivery": "Delivered",
};

const OrderTable = ({ orders, role, onChanged, onReview }) => {
  const toast = useToast();
  const [detail, setDetail] = useState(null);
  const [confirm, setConfirm] = useState(null); // { order, status }
  const [busy, setBusy] = useState(false);
  const [workers, setWorkers] = useState([]);
  const [assigning, setAssigning] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState("");

  const isAdmin = role === "admin";
  const canAdvance = role === "farmer" || isAdmin;

  useEffect(() => {
    if (!isAdmin) return;
    workerApi
      .list({ status: "Available" })
      .then(({ data }) => setWorkers(data.data))
      .catch(() => {});
  }, [isAdmin, assigning]);

  const changeStatus = async () => {
    setBusy(true);
    try {
      await orderApi.updateStatus(confirm.order._id, { orderStatus: confirm.status });
      toast.success(`Order marked as ${confirm.status}`);
      setConfirm(null);
      setDetail(null);
      onChanged?.();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const assignWorker = async () => {
    if (!selectedWorker) return toast.error("Please select a delivery worker");
    setBusy(true);
    try {
      const { data } = await orderApi.assignWorker(assigning._id, selectedWorker);
      toast.success(data.message);
      setAssigning(null);
      setSelectedWorker("");
      onChanged?.();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  if (orders.length === 0) {
    return <EmptyState icon={ShoppingBag} title="No orders yet" message="Orders will appear here." />;
  }

  return (
    <>
      <div className="table-wrap">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="th">Order</th>
              <th className="th">Product</th>
              {role !== "buyer" && <th className="th">Buyer</th>}
              {role !== "farmer" && <th className="th">Farmer</th>}
              <th className="th">Total</th>
              <th className="th">Delivery</th>
              <th className="th">Status</th>
              <th className="th text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((o) => (
              <tr key={o._id} className="hover:bg-gray-50">
                <td className="td">
                  <p className="font-medium text-gray-900">#{o.orderNumber}</p>
                  <p className="text-xs text-gray-500">{formatDate(o.createdAt)}</p>
                </td>
                <td className="td">
                  {o.productId?.name}
                  <span className="block text-xs text-gray-500">
                    {o.quantity} {o.productId?.unit}
                  </span>
                </td>
                {role !== "buyer" && <td className="td">{o.buyerId?.name || "—"}</td>}
                {role !== "farmer" && <td className="td">{o.farmerId?.name || "—"}</td>}
                <td className="td font-semibold">{formatCurrency(o.totalAmount)}</td>
                <td className="td">
                  {o.deliveryWorkerId ? (
                    <span className="text-xs">
                      {o.deliveryWorkerId.name}
                      <span className="block text-gray-400">{o.deliveryWorkerId.phone}</span>
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Not assigned</span>
                  )}
                </td>
                <td className="td">
                  <div className="flex flex-col gap-1">
                    <StatusBadge status={o.orderStatus} />
                    <StatusBadge status={o.paymentStatus} />
                  </div>
                </td>
                <td className="td">
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => setDetail(o)}
                      className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
                      title="Quick view"
                    >
                      <Eye size={15} />
                    </button>

                    {/* Farmers and buyers get a full order page; admin works from this table */}
                    {role !== "admin" && (
                      <Link
                        to={`/${role}/orders/${o._id}`}
                        className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
                        title="Open full order page"
                      >
                        <ExternalLink size={15} />
                      </Link>
                    )}

                    {isAdmin && !["Delivered", "Cancelled"].includes(o.orderStatus) && (
                      <button
                        onClick={() => setAssigning(o)}
                        className="rounded-lg border border-blue-200 p-2 text-blue-600 hover:bg-blue-50"
                        title="Assign delivery worker"
                      >
                        <Truck size={15} />
                      </button>
                    )}

                    {canAdvance && NEXT_STATUS[o.orderStatus] && (
                      <button
                        onClick={() => setConfirm({ order: o, status: NEXT_STATUS[o.orderStatus] })}
                        className="whitespace-nowrap rounded-lg border border-primary-200 px-2.5 py-2 text-xs font-medium text-primary-700 hover:bg-primary-50"
                      >
                        {NEXT_STATUS[o.orderStatus]}
                      </button>
                    )}

                    {role === "buyer" &&
                      o.orderStatus === "Delivered" &&
                      !o.isReviewed &&
                      onReview && (
                        <button
                          onClick={() => onReview(o)}
                          className="whitespace-nowrap rounded-lg border border-amber-200 px-2.5 py-2 text-xs font-medium text-amber-700 hover:bg-amber-50"
                        >
                          Review
                        </button>
                      )}

                    {role === "buyer" &&
                      !["Out for Delivery", "Delivered", "Cancelled"].includes(o.orderStatus) && (
                        <button
                          onClick={() => setConfirm({ order: o, status: "Cancelled" })}
                          className="rounded-lg border border-red-200 px-2.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
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

      {/* Order detail + delivery tracker */}
      <Modal open={Boolean(detail)} onClose={() => setDetail(null)} title="Order Details" size="lg">
        {detail && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-gray-50 p-3.5">
              <div>
                <p className="font-semibold text-gray-900">#{detail.orderNumber}</p>
                <p className="text-sm text-gray-500">Placed on {formatDate(detail.createdAt)}</p>
              </div>
              <div className="flex gap-2">
                <StatusBadge status={detail.orderStatus} />
                <StatusBadge status={detail.paymentStatus} />
              </div>
            </div>

            {/* Delivery tracker */}
            {detail.orderStatus !== "Cancelled" && (
              <div>
                <p className="mb-3 text-sm font-semibold text-gray-900">Delivery Progress</p>
                <div className="space-y-0">
                  {FLOW.map((step, i) => {
                    const currentIndex = FLOW.indexOf(detail.orderStatus);
                    const done = currentIndex >= i;
                    const isLast = i === FLOW.length - 1;
                    return (
                      <div key={step} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                              done ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-400"
                            }`}
                          >
                            {done ? "✓" : i + 1}
                          </span>
                          {!isLast && (
                            <span
                              className={`h-8 w-0.5 ${done ? "bg-primary-500" : "bg-gray-200"}`}
                            />
                          )}
                        </div>
                        <p
                          className={`pb-3 text-sm ${
                            done ? "font-medium text-gray-900" : "text-gray-400"
                          }`}
                        >
                          {step}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <dl className="grid gap-3 sm:grid-cols-2">
              {[
                ["Product", detail.productId?.name],
                ["Quantity", `${detail.quantity} ${detail.productId?.unit || ""}`],
                ["Unit Price", formatCurrency(detail.price)],
                ["Total Amount", formatCurrency(detail.totalAmount)],
                ["Buyer", detail.buyerId?.name],
                ["Farmer", detail.farmerId?.name],
                ["Contact Phone", detail.phone],
                [
                  "Delivery Worker",
                  detail.deliveryWorkerId
                    ? `${detail.deliveryWorkerId.name} (${detail.deliveryWorkerId.phone})`
                    : "Not assigned yet",
                ],
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
          </div>
        )}
      </Modal>

      {/* Assign worker */}
      <Modal
        open={Boolean(assigning)}
        onClose={() => setAssigning(null)}
        title="Assign Delivery Worker"
        size="sm"
      >
        <p className="text-sm text-gray-600">
          Assign an available worker to order{" "}
          <span className="font-semibold">#{assigning?.orderNumber}</span>.
        </p>

        {workers.length === 0 ? (
          <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
            No available delivery workers right now. Free up a worker or add a new one.
          </p>
        ) : (
          <select
            className="input mt-4"
            value={selectedWorker}
            onChange={(e) => setSelectedWorker(e.target.value)}
          >
            <option value="">Select a worker</option>
            {workers.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name} — {w.city || "No city"} ({w.phone})
              </option>
            ))}
          </select>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-outline" onClick={() => setAssigning(null)}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={assignWorker}
            disabled={busy || workers.length === 0}
          >
            {busy ? <Loader2 className="animate-spin" size={16} /> : "Assign Worker"}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={changeStatus}
        loading={busy}
        tone={confirm?.status === "Cancelled" ? "danger" : "primary"}
        title={confirm?.status === "Cancelled" ? "Cancel Order" : "Update Order Status"}
        confirmLabel={confirm?.status === "Cancelled" ? "Cancel Order" : "Confirm"}
        message={
          confirm?.status === "Cancelled"
            ? "Cancel this order? The reserved stock will be returned to the product."
            : `Mark order #${confirm?.order?.orderNumber} as "${confirm?.status}"?`
        }
      />
    </>
  );
};

export default OrderTable;
