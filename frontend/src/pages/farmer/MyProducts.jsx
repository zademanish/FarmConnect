import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Pencil, Trash2, Search, Package, ImageIcon } from "lucide-react";
import { productApi } from "../../services/endpoints";
import { imageUrl, getErrorMessage } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import {
  Loader, EmptyState, StatusBadge, ConfirmDialog, formatCurrency, formatDate,
} from "../../components/ui";

const TABS = ["All", "Pending", "Approved", "Rejected"];

const MyProducts = () => {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [target, setTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    productApi
      .mine({ status: tab === "All" ? "" : tab, search })
      .then(({ data }) => setProducts(data.data))
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(load, search ? 350 : 0); // debounce typing
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, search]);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await productApi.remove(target._id);
      toast.success("Product deleted successfully");
      setTarget(null);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your product listings</p>
        </div>
        <Link to="/farmer/products/add" className="btn-primary">
          <PlusCircle size={17} /> Add Product
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex gap-1.5 overflow-x-auto">
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
        <div className="relative sm:ml-auto sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            className="input pl-9"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products found"
          message={
            tab === "All"
              ? "Start by adding your first product listing."
              : `You have no ${tab.toLowerCase()} products.`
          }
          action={
            <Link to="/farmer/products/add" className="btn-primary">
              <PlusCircle size={16} /> Add Product
            </Link>
          }
        />
      ) : (
        <div className="table-wrap">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="th">Product</th>
                <th className="th">Category</th>
                <th className="th">Price</th>
                <th className="th">Stock</th>
                <th className="th">Status</th>
                <th className="th">Added</th>
                <th className="th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="td">
                    <div className="flex items-center gap-3">
                      {p.images?.length ? (
                        <img
                          src={imageUrl(p.images[0])}
                          alt=""
                          className="h-11 w-11 rounded-lg object-cover"
                        />
                      ) : (
                        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-gray-300">
                          <ImageIcon size={18} />
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-900">{p.name}</p>
                        <p className="truncate text-xs text-gray-500">{p.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="td">{p.categoryId?.name || "—"}</td>
                  <td className="td font-semibold">
                    {formatCurrency(p.price)}
                    <span className="font-normal text-gray-400">/{p.unit}</span>
                  </td>
                  <td className="td">
                    {p.quantity} {p.unit}
                  </td>
                  <td className="td">
                    <div className="flex flex-col gap-1">
                      <StatusBadge status={p.approvalStatus} />
                      {p.approvalStatus === "Rejected" && p.rejectionReason && (
                        <span className="max-w-[180px] whitespace-normal text-xs text-red-500">
                          {p.rejectionReason}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="td text-gray-500">{formatDate(p.createdAt)}</td>
                  <td className="td">
                    <div className="flex justify-end gap-1.5">
                      <Link
                        to={`/farmer/products/edit/${p._id}`}
                        className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </Link>
                      <button
                        onClick={() => setTarget(p)}
                        className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(target)}
        onClose={() => setTarget(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete Product"
        message={`Delete "${target?.name}"? This will also remove its images and cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
};

export default MyProducts;
