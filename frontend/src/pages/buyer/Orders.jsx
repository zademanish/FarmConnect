import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { orderApi, reviewApi } from "../../services/endpoints";
import { getErrorMessage } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import OrderTable from "../../components/OrderTable";
import { Loader, Modal } from "../../components/ui";

const TABS = [
  "All", "Confirmed", "Processing", "Ready for Delivery",
  "Out for Delivery", "Delivered", "Cancelled",
];

const BuyerOrders = () => {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("All");
  const [reviewing, setReviewing] = useState(null);
  const [rating, setRating] = useState(5);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

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

  const openReview = (order) => {
    setReviewing(order);
    setRating(5);
    reset({ comment: "" });
  };

  const submitReview = async (values) => {
    try {
      await reviewApi.create({ orderId: reviewing._id, rating, comment: values.comment });
      toast.success("Thank you! Your review has been submitted.");
      setReviewing(null);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="mt-1 text-sm text-gray-500">Track delivery status and review completed orders</p>
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

      {loading ? (
        <Loader />
      ) : (
        <OrderTable orders={orders} role="buyer" onChanged={load} onReview={openReview} />
      )}

      <Modal open={Boolean(reviewing)} onClose={() => setReviewing(null)} title="Rate Your Order">
        <form onSubmit={handleSubmit(submitReview)} className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-3.5">
            <p className="font-semibold text-gray-900">{reviewing?.productId?.name}</p>
            <p className="text-sm text-gray-500">
              Order #{reviewing?.orderNumber} · from {reviewing?.farmerId?.name}
            </p>
          </div>

          <div>
            <label className="label">Your Rating *</label>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={`text-3xl transition ${
                    n <= rating ? "text-amber-400" : "text-gray-300 hover:text-amber-200"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
            </p>
          </div>

          <div>
            <label className="label">Your Review</label>
            <textarea
              rows={4}
              className="input"
              placeholder="Share your experience with the product quality and delivery..."
              {...register("comment")}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn-outline" onClick={() => setReviewing(null)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : "Submit Review"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BuyerOrders;
