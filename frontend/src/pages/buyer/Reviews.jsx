import { useCallback, useEffect, useState } from "react";
import { Star, Trash2 } from "lucide-react";
import { reviewApi } from "../../services/endpoints";
import { imageUrl, getErrorMessage } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { Loader, EmptyState, Rating, ConfirmDialog, formatDate } from "../../components/ui";

const BuyerReviews = () => {
  const toast = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    reviewApi
      .list()
      .then(({ data }) => setReviews(data.data))
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => load(), [load]);

  const remove = async () => {
    setBusy(true);
    try {
      await reviewApi.remove(target._id);
      toast.success("Review deleted");
      setTarget(null);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
        <p className="mt-1 text-sm text-gray-500">Reviews you've given on delivered orders</p>
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No reviews yet"
          message="You can review a product once its order has been delivered."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((r) => (
            <div key={r._id} className="card p-5">
              <div className="flex items-start gap-3">
                {r.productId?.images?.[0] ? (
                  <img
                    src={imageUrl(r.productId.images[0])}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <span className="h-12 w-12 shrink-0 rounded-lg bg-gray-100" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-gray-900">{r.productId?.name}</p>
                  <p className="truncate text-xs text-gray-500">
                    Farmer: {r.farmerId?.name} · {formatDate(r.createdAt)}
                  </p>
                  <div className="mt-1.5">
                    <Rating value={r.rating} />
                  </div>
                </div>
                <button
                  onClick={() => setTarget(r)}
                  className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                  title="Delete review"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              {r.comment && (
                <p className="mt-3 border-t border-gray-100 pt-3 text-sm text-gray-600">
                  {r.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(target)}
        onClose={() => setTarget(null)}
        onConfirm={remove}
        loading={busy}
        title="Delete Review"
        message="Delete this review? You will be able to review this order again."
        confirmLabel="Delete"
      />
    </div>
  );
};

export default BuyerReviews;
