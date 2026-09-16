import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, PackageSearch } from "lucide-react";
import { productApi, categoryApi } from "../../services/endpoints";
import ProductCard from "../../components/ProductCard";
import { Loader, EmptyState, Pagination } from "../../components/ui";

const SORTS = [
  ["newest", "Newest First"],
  ["price-asc", "Price: Low to High"],
  ["price-desc", "Price: High to Low"],
  ["rating", "Highest Rated"],
];

const Products = () => {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({ currentPage: 1, totalPages: 1, totalProducts: 0 });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Local input state so typing doesn't fire a request on every keystroke
  const [searchInput, setSearchInput] = useState(params.get("search") || "");

  const filters = {
    search: params.get("search") || "",
    category: params.get("category") || "",
    minPrice: params.get("minPrice") || "",
    maxPrice: params.get("maxPrice") || "",
    location: params.get("location") || "",
    availability: params.get("availability") || "",
    sort: params.get("sort") || "newest",
    page: Number(params.get("page") || 1),
  };

  useEffect(() => {
    categoryApi.list().then(({ data }) => setCategories(data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    productApi
      .list({ ...filters, limit: 12 })
      .then(({ data }) => {
        setProducts(data.products);
        setMeta({
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          totalProducts: data.totalProducts,
        });
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page"); // any filter change resets to page 1
    setParams(next);
  };

  const clearAll = () => {
    setSearchInput("");
    setParams(new URLSearchParams());
  };

  const activeCount = ["category", "minPrice", "maxPrice", "location", "availability", "search"]
    .filter((k) => params.get(k)).length;

  const FilterPanel = () => (
    <div className="space-y-5">
      <div>
        <label className="label">Category</label>
        <select
          className="input"
          value={filters.category}
          onChange={(e) => setFilter("category", e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Price Range (₹)</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min"
            className="input"
            defaultValue={filters.minPrice}
            onBlur={(e) => setFilter("minPrice", e.target.value)}
          />
          <span className="text-gray-400">–</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            className="input"
            defaultValue={filters.maxPrice}
            onBlur={(e) => setFilter("maxPrice", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="label">Location</label>
        <input
          className="input"
          placeholder="e.g. Pune"
          defaultValue={filters.location}
          onBlur={(e) => setFilter("location", e.target.value)}
        />
      </div>

      <div>
        <label className="label">Availability</label>
        <select
          className="input"
          value={filters.availability}
          onChange={(e) => setFilter("availability", e.target.value)}
        >
          <option value="">All</option>
          <option value="Available">Available</option>
          <option value="Unavailable">Unavailable</option>
        </select>
      </div>

      {activeCount > 0 && (
        <button onClick={clearAll} className="btn-outline w-full">
          <X size={15} /> Clear Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Browse Products</h1>
        <p className="mt-1 text-sm text-gray-500">
          {loading ? "Loading..." : `${meta.totalProducts} product(s) available`}
        </p>
      </div>

      {/* Search + sort bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setFilter("search", searchInput.trim());
          }}
          className="relative flex-1"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by product, location or farmer name..."
            className="input pl-10"
          />
        </form>

        <select
          className="input sm:w-52"
          value={filters.sort}
          onChange={(e) => setFilter("sort", e.target.value)}
        >
          {SORTS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>

        <button onClick={() => setShowFilters(true)} className="btn-outline lg:hidden">
          <SlidersHorizontal size={16} /> Filters
          {activeCount > 0 && (
            <span className="rounded-full bg-primary-600 px-1.5 text-xs text-white">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Desktop filter sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="card sticky top-20 p-5">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
              <SlidersHorizontal size={17} /> Filters
            </h3>
            <FilterPanel />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {loading ? (
            <Loader label="Loading products..." />
          ) : products.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="No products found"
              message="Try changing your search or filters."
              action={
                activeCount > 0 && (
                  <button onClick={clearAll} className="btn-primary">
                    Clear Filters
                  </button>
                )
              }
            />
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
              <Pagination
                currentPage={meta.currentPage}
                totalPages={meta.totalPages}
                onChange={(p) => {
                  setFilter("page", p);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto bg-white p-5">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-semibold">Filters</h3>
              <button onClick={() => setShowFilters(false)}>
                <X size={20} />
              </button>
            </div>
            <FilterPanel />
            <button onClick={() => setShowFilters(false)} className="btn-primary mt-5 w-full">
              Show {meta.totalProducts} Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
