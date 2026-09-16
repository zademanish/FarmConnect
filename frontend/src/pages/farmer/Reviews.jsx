import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { reviewApi } from "../../services/endpoints";
import { getErrorMessage } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { Loader, EmptyState, Rating, formatDate } from "../../components/ui";

const FarmerReviews = () => {
  const toast = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reviewApi
      .list()
      .then(({ data }) => setReviews(data.data))
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <Loader />;

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ratings & Reviews</h1>
        <p className="mt-1 text-sm text-gray-500">What buyers say about your produce</p>
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No reviews yet"
          message="Buyers can review your products once their orders are delivered."
        />
      ) : (
        <>
          <div className="card flex flex-wrap items-center gap-6 p-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-900">{avg}</p>
              <Rating value={Number(avg)} size={16} />
              <p className="mt-1 text-xs text-gray-500">{reviews.length} review(s)</p>
            </div>
            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter((r) => r.rating === star).length;
                const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-8 text-gray-500">{star}★</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full bg-amber-400" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-6 text-right text-gray-500">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {reviews.map((r) => (
              <div key={r._id} className="card p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                    {r.buyerId?.name?.[0]?.toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{r.buyerId?.name}</p>
                    <p className="truncate text-xs text-gray-400">
                      on {r.productId?.name} · {formatDate(r.createdAt)}
                    </p>
                  </div>
                  <Rating value={r.rating} />
                </div>
                {r.comment && <p className="mt-3 text-sm text-gray-600">{r.comment}</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FarmerReviews;
