import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Phone, Mail, Sprout, ArrowLeft } from "lucide-react";
import { userApi } from "../../services/endpoints";
import { imageUrl } from "../../services/api";
import ProductCard from "../../components/ProductCard";
import { Loader, EmptyState, Rating, formatDate } from "../../components/ui";

const FarmerProfile = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    userApi
      .farmerPublic(id)
      .then(({ data }) => setData(data.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader label="Loading farmer profile..." />;
  if (!data) return <EmptyState title="Farmer not found" />;

  const { farmer, profile, products, reviews, avgRating, totalReviews } = data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Link to="/products" className="mb-5 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600">
        <ArrowLeft size={16} /> Back to Products
      </Link>

      <div className="card p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          {farmer.profileImage ? (
            <img
              src={imageUrl(farmer.profileImage)}
              alt=""
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-primary-100 text-3xl font-bold text-primary-700">
              {farmer.name?.[0]?.toUpperCase()}
            </span>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{farmer.name}</h1>
            {profile?.farmName && (
              <p className="mt-0.5 flex items-center gap-1.5 text-primary-600">
                <Sprout size={15} /> {profile.farmName}
              </p>
            )}
            {totalReviews > 0 && (
              <div className="mt-2">
                <Rating value={avgRating} count={totalReviews} size={15} />
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} /> {farmer.city}, {farmer.state}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone size={14} /> {farmer.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail size={14} /> {farmer.email}
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-400">
              Member since {formatDate(farmer.createdAt)}
            </p>
          </div>
        </div>

        {profile?.about && (
          <p className="mt-5 border-t border-gray-100 pt-5 text-sm leading-relaxed text-gray-600">
            {profile.about}
          </p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-gray-100 pt-5 sm:grid-cols-4">
          {[
            ["Products", products.length],
            ["Reviews", totalReviews],
            ["Rating", avgRating || "—"],
            ["Farm Land", profile?.totalLand || "—"],
          ].map(([label, value]) => (
            <div key={label} className="text-center">
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <h2 className="mb-4 mt-10 text-xl font-bold text-gray-900">
        Products by {farmer.name}
      </h2>
      {products.length === 0 ? (
        <EmptyState title="No products listed yet" />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}

      {reviews.length > 0 && (
        <>
          <h2 className="mb-4 mt-10 text-xl font-bold text-gray-900">Customer Reviews</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {reviews.map((r) => (
              <div key={r._id} className="card p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                    {r.buyerId?.name?.[0]?.toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{r.buyerId?.name}</p>
                    <p className="text-xs text-gray-400">
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

export default FarmerProfile;
