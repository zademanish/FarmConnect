import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Truck, ImageIcon } from "lucide-react";
import { orderApi } from "../services/endpoints";
import { imageUrl, getErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  Loader, EmptyState, StatusBadge, ConfirmDialog, formatCurrency, formatDate,
} from "./ui";

// The delivery pipeline, in order
const FLOW = ["Confirmed", "Processing", "Ready for Delivery", "Out for Delivery", "Delivered"];

const NEXT_STATUS = {
  Confirmed: "Processing",
  Processing: "Ready for Delivery",
  "Ready for Delivery": "Out for Delivery",
  "Out for Delivery": "Delivered",
};

/** Full-page order view, shared by /buyer/orders/:id and /farmer/orders/:id */
const OrderDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  const backTo = user?.role === "farmer" ? "/farmer/orders" : "/buyer/orders";

  const load = useCallback(() => {
    setLoading(true);
    orderApi
      .detail(id)
      .then(({ data }) => setOrder(data.data))
      .catch((error) => {
        toast.error(getErrorMessage(error));
        navigate(backTo);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => load(), [load]);

  const changeStatus = async () => {
    setBusy(true);
    try {
      await orderApi.updateStatus(order._id, { orderStatus: confirm });
      toast.success(`Order marked as ${confirm}`);
      setConfirm(null);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loader label="Loading order..." />;
  if (!order) return <EmptyState title="Order not found" />;

  const isFarmer = user?.role === "farmer";
  const isBuyer = user?.role === "buyer";
  const currentIndex = FLOW.indexOf(order.orderStatus);
  const canCancel =
    isBuyer && !["Out for Delivery", "Delivered", "Cancelled"].includes(order.orderStatus);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Link
        to={backTo}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600"
      >
        <ArrowLeft size={16} /> Back to Orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-gray-500">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={order.orderStatus} />
          <StatusBadge status={order.paymentStatus} />
        </div>
      </div>

      {/* Product summary */}
      <div className="card flex flex-wrap items-center gap-4 p-5">
        {order.productId?.images?.[0] ? (
          <img
            src={imageUrl(order.productId.images[0])}
            alt=""
            className="h-20 w-20 rounded-lg object-cover"
          />
        ) : (
          <span className="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-100 text-gray-300">
            <ImageIcon size={26} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900">{order.productId?.name}</p>
          <p className="text-sm text-gray-500">
            {order.quantity} {order.productId?.unit} × {formatCurrency(order.price)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Total Amount</p>
          <p className="text-2xl font-bold text-primary-700">
            {formatCurrency(order.totalAmount)}
          </p>
        </div>
      </div>

      {/* Delivery tracker */}
      {order.orderStatus !== "Cancelled" ? (
        <div className="card p-5">
          <h2 className="mb-4 font-semibold text-gray-900">Delivery Progress</h2>
          {FLOW.map((step, i) => {
            const done = currentIndex >= i;
            const isLast = i === FLOW.length - 1;
            return (
              <div key={step} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      done ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {done ? "✓" : i + 1}
                  </span>
                  {!isLast && (
                    <span className={`h-9 w-0.5 ${done ? "bg-primary-500" : "bg-gray-200"}`} />
                  )}
                </div>
                <p
                  className={`pb-4 text-sm ${done ? "font-medium text-gray-900" : "text-gray-400"}`}
                >
                  {step}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card border-red-200 bg-red-50 p-5">
          <p className="font-semibold text-red-800">This order was cancelled</p>
          <p className="mt-1 text-sm text-red-700">
            The reserved stock has been returned to the product.
          </p>
        </div>
      )}

      {/* Delivery worker */}
      <div className="card p-5">
        <h2 className="mb-3 font-semibold text-gray-900">Delivery</h2>
        {order.deliveryWorkerId ? (
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Truck size={19} />
            </span>
            <div>
              <p className="font-medium text-gray-900">{order.deliveryWorkerId.name}</p>
              <p className="text-sm text-gray-500">{order.deliveryWorkerId.phone}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No delivery worker assigned yet. The admin assigns one once the order is ready.
          </p>
        )}
        <div className="mt-4 border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500">Delivery Address</p>
          <p className="mt-0.5 text-sm text-gray-800">{order.deliveryAddress}</p>
        </div>
      </div>

      {/* Parties */}
      <div className="card p-5">
        <h2 className="mb-3 font-semibold text-gray-900">Order Information</h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          {[
            ["Buyer", order.buyerId?.name],
            ["Farmer", order.farmerId?.name],
            ["Contact Phone", order.phone],
            ["Payment Status", order.paymentStatus],
            ["Last Updated", formatDate(order.updatedAt)],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-gray-500">{label}</dt>
              <dd className="text-sm font-medium text-gray-900">{value || "—"}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Actions */}
      {(isFarmer && NEXT_STATUS[order.orderStatus]) || canCancel ? (
        <div className="flex flex-wrap justify-end gap-2">
          {canCancel && (
            <button className="btn-danger" onClick={() => setConfirm("Cancelled")}>
              Cancel Order
            </button>
          )}
          {isFarmer && NEXT_STATUS[order.orderStatus] && (
            <button className="btn-primary" onClick={() => setConfirm(NEXT_STATUS[order.orderStatus])}>
              Mark as {NEXT_STATUS[order.orderStatus]}
            </button>
          )}
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={changeStatus}
        loading={busy}
        tone={confirm === "Cancelled" ? "danger" : "primary"}
        title={confirm === "Cancelled" ? "Cancel Order" : "Update Order Status"}
        confirmLabel={confirm === "Cancelled" ? "Cancel Order" : "Confirm"}
        message={
          confirm === "Cancelled"
            ? "Cancel this order? The reserved stock will be returned to the product."
            : `Mark this order as "${confirm}"?`
        }
      />
    </div>
  );
};

export default OrderDetailPage;
