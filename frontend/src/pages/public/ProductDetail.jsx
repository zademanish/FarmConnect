import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { MapPin, Package, Calendar, User, ImageIcon, Loader2, ShoppingCart, ArrowLeft } from "lucide-react";
import { productApi, requestApi } from "../../services/endpoints";
import { imageUrl, getErrorMessage } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Loader, StatusBadge, Rating, Modal, formatCurrency, formatDate } from "../../components/ui";

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [showRequest, setShowRequest] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const quantity = Number(watch("quantity") || 0);

  useEffect(() => {
    setLoading(true);
    productApi
      .detail(id)
      .then(({ data }) => setData(data.data))
      .catch((error) => {
        toast.error(getErrorMessage(error));
        navigate("/products");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const openRequest = () => {
    if (!user) {
      toast.info("Please login to submit a purchase request");
      return navigate("/login", { state: { from: `/products/${id}` } });
    }
    if (user.role !== "buyer") {
      return toast.error("Only buyers can submit purchase requests");
    }
    reset({
      quantity: 1,
      deliveryAddress: [user.address, user.city, user.state, user.pincode].filter(Boolean).join(", "),
      phone: user.phone,
      message: "",
    });
    setShowRequest(true);
  };

  const submitRequest = async (values) => {
    try {
      await requestApi.create({ ...values, productId: id, quantity: Number(values.quantity) });
      toast.success("Purchase request sent to the farmer!");
      setShowRequest(false);
      navigate("/buyer/requests");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (loading) return <Loader label="Loading product..." />;
  if (!data) return null;

  const { product, reviews, farmerProfile } = data;
  const farmer = product.farmerId;
  const canBuy = product.availabilityStatus === "Available" && product.quantity > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Link to="/products" className="mb-5 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600">
        <ArrowLeft size={16} /> Back to Products
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Images */}
        <div>
          <div className="card aspect-[4/3] overflow-hidden">
            {product.images?.length ? (
              <img
                src={imageUrl(product.images[activeImage])}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-300">
                <ImageIcon size={64} />
              </div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(i)}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${
                    i === activeImage ? "border-primary-500" : "border-transparent"
                  }`}
                >
                  <img src={imageUrl(img)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
              {product.categoryId?.name}
            </span>
            <StatusBadge status={product.availabilityStatus} />
            {product.approvalStatus !== "Approved" && <StatusBadge status={product.approvalStatus} />}
          </div>

          <h1 className="mt-3 text-3xl font-bold text-gray-900">{product.name}</h1>

          {product.totalReviews > 0 && (
            <div className="mt-2">
              <Rating value={product.avgRating} count={product.totalReviews} size={16} />
            </div>
          )}

          <div className="mt-5 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-primary-700">
              {formatCurrency(product.price)}
            </span>
            <span className="text-gray-500">per {product.unit}</span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {[
              [Package, "Available Quantity", `${product.quantity} ${product.unit}`],
              [MapPin, "Location", product.location],
              [Calendar, "Available From", formatDate(product.availableFrom)],
              [User, "Listed On", formatDate(product.createdAt)],
            ].map(([Icon, label, value]) => (
              <div key={label} className="card p-3.5">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Icon size={13} /> {label}
                </div>
                <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          {product.description && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900">Description</h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                {product.description}
              </p>
            </div>
          )}

          <button
            onClick={openRequest}
            disabled={!canBuy}
            className="btn-primary mt-7 w-full py-3 text-base"
          >
            <ShoppingCart size={18} />
            {canBuy ? "Request to Buy" : "Currently Unavailable"}
          </button>

          {/* Farmer card */}
          {farmer && (
            <div className="card mt-6 p-5">
              <h3 className="mb-3 font-semibold text-gray-900">Sold by</h3>
              <div className="flex items-center gap-3">
                {farmer.profileImage ? (
                  <img
                    src={imageUrl(farmer.profileImage)}
                    alt=""
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 font-bold text-primary-700">
                    {farmer.name?.[0]?.toUpperCase()}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900">{farmer.name}</p>
                  {farmerProfile?.farmName && (
                    <p className="text-sm text-gray-500">{farmerProfile.farmName}</p>
                  )}
                  <p className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin size={11} /> {farmer.city}, {farmer.state}
                  </p>
                </div>
                <Link to={`/farmers/${farmer._id}`} className="btn-outline shrink-0 px-3 py-2 text-xs">
                  View Profile
                </Link>
              </div>
              {farmerProfile?.about && (
                <p className="mt-3 border-t border-gray-100 pt-3 text-sm text-gray-600">
                  {farmerProfile.about}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-gray-900">
          Reviews {reviews.length > 0 && <span className="text-gray-400">({reviews.length})</span>}
        </h2>
        {reviews.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-gray-300 bg-white py-10 text-center text-sm text-gray-500">
            No reviews yet. Be the first to review after your order is delivered.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {reviews.map((r) => (
              <div key={r._id} className="card p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                    {r.buyerId?.name?.[0]?.toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{r.buyerId?.name}</p>
                    <p className="text-xs text-gray-400">{formatDate(r.createdAt)}</p>
                  </div>
                  <Rating value={r.rating} />
                </div>
                {r.comment && <p className="mt-3 text-sm text-gray-600">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Purchase request modal */}
      <Modal open={showRequest} onClose={() => setShowRequest(false)} title="Submit Purchase Request">
        <form onSubmit={handleSubmit(submitRequest)} className="space-y-4" noValidate>
          <div className="rounded-lg bg-gray-50 p-3.5">
            <p className="font-semibold text-gray-900">{product.name}</p>
            <p className="text-sm text-gray-500">
              {formatCurrency(product.price)} per {product.unit} · {product.quantity}{" "}
              {product.unit} in stock
            </p>
          </div>

          <div>
            <label className="label">Quantity Required ({product.unit}) *</label>
            <input
              type="number"
              min="1"
              max={product.quantity}
              className="input"
              {...register("quantity", {
                required: "Quantity is required",
                min: { value: 1, message: "Quantity must be greater than 0" },
                max: {
                  value: product.quantity,
                  message: `Only ${product.quantity} ${product.unit} available`,
                },
              })}
            />
            {errors.quantity && <p className="error-text">{errors.quantity.message}</p>}
          </div>

          {quantity > 0 && quantity <= product.quantity && (
            <div className="flex items-center justify-between rounded-lg bg-primary-50 px-4 py-3">
              <span className="text-sm font-medium text-primary-800">Estimated Total</span>
              <span className="text-lg font-bold text-primary-700">
                {formatCurrency(quantity * product.price)}
              </span>
            </div>
          )}

          <div>
            <label className="label">Delivery Address *</label>
            <textarea
              rows={2}
              className="input"
              placeholder="Full delivery address"
              {...register("deliveryAddress", { required: "Delivery address is required" })}
            />
            {errors.deliveryAddress && <p className="error-text">{errors.deliveryAddress.message}</p>}
          </div>

          <div>
            <label className="label">Phone Number *</label>
            <input
              className="input"
              maxLength={10}
              {...register("phone", {
                required: "Phone number is required",
                pattern: { value: /^[0-9]{10}$/, message: "Enter a valid 10-digit number" },
              })}
            />
            {errors.phone && <p className="error-text">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="label">Message to Farmer</label>
            <textarea
              rows={2}
              className="input"
              placeholder="Any specific requirement or delivery preference"
              {...register("message")}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn-outline" onClick={() => setShowRequest(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : "Send Request"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductDetail;
