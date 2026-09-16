import { useCallback, useEffect, useState } from "react";
import { Star, Trash2, EyeOff, Eye } from "lucide-react";
import { reviewApi } from "../../services/endpoints";
import { imageUrl, getErrorMessage } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { Loader, EmptyState, Rating, ConfirmDialog, StatusBadge, formatDate } from "../../components/ui";

const AdminReviews = () => {
  const toast = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
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

  // Hide an inappropriate review instead of deleting it outright
  const toggleVisibility = async (review) => {
    try {
      const next = review.status === "visible" ? "hidden" : "visible";
      await reviewApi.update(review._id, { status: next });
      toast.success(next === "hidden" ? "Review hidden from buyers" : "Review is visible again");
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await reviewApi.remove(deleting._id);
      toast.success("Review deleted");
      setDeleting(null);
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
        <h1 className="text-2xl font-bold text-gray-900">Review Moderation</h1>
        <p className="mt-1 text-sm text-gray-500">
          Hide or delete reviews that violate marketplace guidelines
        </p>
      </div>

      {reviews.length === 0 ? (
        <EmptyState icon={Star} title="No reviews yet" message="Reviews will appear here." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((r) => (
            <div
              key={r._id}
              className={`card p-5 ${r.status === "hidden" ? "opacity-60" : ""}`}
            >
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
                    {r.buyerId?.name} → {r.farmerId?.name} · {formatDate(r.createdAt)}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Rating value={r.rating} />
                    {r.status === "hidden" && <StatusBadge status="inactive" />}
                  </div>
                </div>
              </div>

              {r.comment && (
                <p className="mt-3 border-t border-gray-100 pt-3 text-sm text-gray-600">
                  {r.comment}
                </p>
              )}

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => toggleVisibility(r)}
                  className="btn-outline px-3 py-2 text-xs"
                >
                  {r.status === "visible" ? (
                    <>
                      <EyeOff size={14} /> Hide
                    </>
                  ) : (
                    <>
                      <Eye size={14} /> Unhide
                    </>
                  )}
                </button>
                <button
                  onClick={() => setDeleting(r)}
                  className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} className="mr-1 inline" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        loading={busy}
        title="Delete Review"
        message="Permanently delete this review? The product rating will be recalculated."
        confirmLabel="Delete"
      />
    </div>
  );
};

export default AdminReviews;
