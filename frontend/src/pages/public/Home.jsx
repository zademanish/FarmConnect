import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Sprout, ShieldCheck, Truck, Star, ArrowRight } from "lucide-react";
import { productApi, categoryApi } from "../../services/endpoints";
import ProductCard from "../../components/ProductCard";
import { Loader } from "../../components/ui";

const STEPS = [
  { icon: Sprout, title: "Farmers List Produce", text: "Farmers add their harvest with price, quantity and location." },
  { icon: ShieldCheck, title: "Admin Verifies", text: "Every listing is reviewed and approved before it goes live." },
  { icon: Search, title: "Buyers Browse & Request", text: "Buyers search, compare and send a purchase request." },
  { icon: Truck, title: "Delivered To You", text: "The farmer accepts, and an assigned worker delivers the order." },
];

const Home = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ featured: [], recent: [] });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([productApi.home(), categoryApi.list()])
      .then(([products, cats]) => {
        setData(products.data.data);
        setCategories(cats.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    navigate(search.trim() ? `/products?search=${encodeURIComponent(search.trim())}` : "/products");
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 px-4 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium">
            Direct from farm to your doorstep
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">
            Connect Directly.
            <br />
            Buy Fresh. <span className="text-primary-200">Support Farmers.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-primary-100">
            Farm Connect removes the middlemen so farmers earn more and buyers pay less for
            genuinely fresh agricultural produce.
          </p>

          <form onSubmit={onSearch} className="mx-auto mt-8 flex max-w-xl gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tomatoes, rice, farmer name..."
                className="w-full rounded-lg border-0 py-3 pl-11 pr-4 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <button type="submit" className="btn bg-white px-6 font-semibold text-primary-700 hover:bg-primary-50">
              Search
            </button>
          </form>

          <div className="mt-6 flex justify-center gap-3">
            <Link to="/products" className="btn bg-white/15 text-white hover:bg-white/25">
              Browse Products
            </Link>
            <Link to="/register" className="btn bg-white text-primary-700 hover:bg-primary-50">
              Join as Farmer
            </Link>
          </div>
        </div>
      </section>

      {loading ? (
        <Loader />
      ) : (
        <>
          {/* Categories */}
          {categories.length > 0 && (
            <section className="mx-auto max-w-7xl px-4 py-14">
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
                  <p className="mt-1 text-sm text-gray-500">Find exactly what you need</p>
                </div>
                <Link to="/categories" className="text-sm font-semibold text-primary-600 hover:underline">
                  View all
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
                {categories.slice(0, 8).map((cat) => (
                  <Link
                    key={cat._id}
                    to={`/products?category=${cat._id}`}
                    className="card flex flex-col items-center gap-2 p-4 text-center transition hover:border-primary-300 hover:shadow-md"
                  >
                    <span className="rounded-full bg-primary-50 p-3 text-primary-600">
                      <Sprout size={20} />
                    </span>
                    <p className="text-sm font-semibold text-gray-800">{cat.name}</p>
                    <p className="text-xs text-gray-400">{cat.productCount} items</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Featured */}
          {data.featured.length > 0 && (
            <section className="bg-white px-4 py-14">
              <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex items-end justify-between">
                  <div>
                    <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                      <Star className="text-amber-400" size={22} /> Featured Products
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">Top rated by our buyers</p>
                  </div>
                  <Link to="/products" className="text-sm font-semibold text-primary-600 hover:underline">
                    View all
                  </Link>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {data.featured.slice(0, 4).map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Recently added */}
          {data.recent.length > 0 && (
            <section className="mx-auto max-w-7xl px-4 py-14">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Recently Added</h2>
                <p className="mt-1 text-sm text-gray-500">Fresh listings from our farmers</p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {data.recent.slice(0, 8).map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* How it works */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-gray-900">How Farm Connect Works</h2>
            <p className="mt-2 text-sm text-gray-500">Four simple steps from farm to doorstep</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <div key={title} className="card p-6 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                  <Icon size={22} />
                </span>
                <p className="mt-3 text-xs font-bold text-primary-600">STEP {i + 1}</p>
                <h3 className="mt-1 font-semibold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-700 px-4 py-14 text-center text-white">
        <h2 className="text-2xl font-bold sm:text-3xl">Ready to get started?</h2>
        <p className="mx-auto mt-2 max-w-lg text-primary-100">
          Whether you grow it or buy it, Farm Connect gives you a fair, direct marketplace.
        </p>
        <Link to="/register" className="btn mt-6 bg-white px-6 text-primary-700 hover:bg-primary-50">
          Create Free Account <ArrowRight size={17} />
        </Link>
      </section>
    </div>
  );
};

export default Home;
