import { Link } from "react-router-dom";
import { MapPin, ImageIcon } from "lucide-react";
import { imageUrl } from "../services/api";
import { StatusBadge, Rating, formatCurrency } from "./ui";

const ProductCard = ({ product }) => (
  <Link
    to={`/products/${product._id}`}
    className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
  >
    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
      {product.images?.length ? (
        <img
          src={imageUrl(product.images[0])}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-gray-300">
          <ImageIcon size={40} />
        </div>
      )}
      <div className="absolute left-2 top-2">
        <StatusBadge status={product.availabilityStatus} />
      </div>
    </div>

    <div className="flex flex-1 flex-col p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-primary-600">
        {product.categoryId?.name}
      </p>
      <h3 className="mt-1 line-clamp-1 font-semibold text-gray-900">{product.name}</h3>

      <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-500">
        <MapPin size={12} className="shrink-0" />
        <span className="line-clamp-1">{product.location}</span>
      </div>

      {product.totalReviews > 0 && (
        <div className="mt-2">
          <Rating value={product.avgRating} count={product.totalReviews} />
        </div>
      )}

      <div className="mt-auto flex items-end justify-between pt-3">
        <div>
          <p className="text-lg font-bold text-primary-700">{formatCurrency(product.price)}</p>
          <p className="text-xs text-gray-500">per {product.unit}</p>
        </div>
        <p className="text-xs text-gray-500">
          {product.quantity} {product.unit} left
        </p>
      </div>

      {product.farmerId?.name && (
        <p className="mt-2 border-t border-gray-100 pt-2 text-xs text-gray-500">
          by <span className="font-medium text-gray-700">{product.farmerId.name}</span>
        </p>
      )}
    </div>
  </Link>
);

export default ProductCard;
