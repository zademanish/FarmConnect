import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sprout } from "lucide-react";
import { categoryApi } from "../../services/endpoints";
import { Loader, EmptyState } from "../../components/ui";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryApi
      .list()
      .then(({ data }) => setCategories(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Product Categories</h1>
        <p className="mt-2 text-gray-500">Explore fresh produce by category</p>
      </div>

      {loading ? (
        <Loader />
      ) : categories.length === 0 ? (
        <EmptyState title="No categories yet" message="Categories will appear here once added." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/products?category=${cat._id}`}
              className="card p-6 text-center transition hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md"
            >
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                <Sprout size={26} />
              </span>
              <h3 className="mt-4 font-semibold text-gray-900">{cat.name}</h3>
              {cat.description && (
                <p className="mt-1.5 line-clamp-2 text-sm text-gray-500">{cat.description}</p>
              )}
              <p className="mt-3 text-sm font-semibold text-primary-600">
                {cat.productCount} product{cat.productCount === 1 ? "" : "s"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;
