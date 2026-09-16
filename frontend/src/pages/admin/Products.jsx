import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Eye, Check, X, Trash2, Package, ImageIcon, Loader2 } from "lucide-react";
import { adminApi, categoryApi, productApi } from "../../services/endpoints";
import { imageUrl, getErrorMessage } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import {
  Loader, EmptyState, StatusBadge, Modal, ConfirmDialog, formatCurrency, formatDate,
} from "../../components/ui";

const TABS = ["All", "Pending", "Approved", "Rejected"];

const AdminProducts = () => {
  const toast = useToast();
  const [params, setParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [detail, setDetail] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const tab = params.get("status") || "All";

  useEffect(() => {
    categoryApi.list().then(({ data }) => setCategories(data.data)).catch(() => {});
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    adminApi
      .products({ status: tab === "All" ? "" : tab, search, category })
      .then(({ data }) => setProducts(data.data))
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, search, category]);

  useEffect(() => {
    const t = setTimeout(load, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const setTab = (t) => {
    const next = new URLSearchParams(params);
    if (t === "All") next.delete("status");
    else next.set("status", t);
    setParams(next);
  };

  const approve = async (product) => {
    setBusy(true);
    try {
      await adminApi.updateApproval(product._id, { approvalStatus: "Approved" });
      toast.success(`"${product.name}" approved and is now visible to buyers`);
      setDetail(null);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const reject = async () => {
    if (!reason.trim()) return toast.error("Please provide a rejection reason");
    setBusy(true);
    try {
      await adminApi.updateApproval(rejecting._id, {
        approvalStatus: "Rejected",
        rejectionReason: reason.trim(),
      });
      toast.success("Product rejected. The farmer will see your reason.");
      setRejecting(null);
      setReason("");
      setDetail(null);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await productApi.remove(deleting._id);
      toast.success("Product deleted");
      setDeleting(null);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Approve or reject listings before buyers can see them
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
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

        <div className="flex flex-1 flex-col gap-3 sm:flex-row lg:justify-end">
          <select
            className="input sm:w-44"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="relative sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              className="input pl-9"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : products.length === 0 ? (
        <EmptyState icon={Package} title="No products found" message="Try different filters." />
      ) : (
        <div className="table-wrap">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="th">Product</th>
                <th className="th">Farmer</th>
                <th className="th">Category</th>
                <th className="th">Price</th>
                <th className="th">Stock</th>
                <th className="th">Added</th>
                <th className="th">Status</th>
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
                  <td className="td">{p.farmerId?.name || "—"}</td>
                  <td className="td">{p.categoryId?.name || "—"}</td>
                  <td className="td font-semibold">
                    {formatCurrency(p.price)}
                    <span className="font-normal text-gray-400">/{p.unit}</span>
                  </td>
                  <td className="td">
                    {p.quantity} {p.unit}
                  </td>
                  <td className="td text-gray-500">{formatDate(p.createdAt)}</td>
                  <td className="td">
                    <StatusBadge status={p.approvalStatus} />
                  </td>
                  <td className="td">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setDetail(p)}
                        className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
                        title="View"
                      >
                        <Eye size={15} />
                      </button>
                      {p.approvalStatus !== "Approved" && (
                        <button
                          onClick={() => approve(p)}
                          disabled={busy}
                          className="rounded-lg border border-primary-200 p-2 text-primary-600 hover:bg-primary-50"
                          title="Approve"
                        >
                          <Check size={15} />
                        </button>
                      )}
                      {p.approvalStatus !== "Rejected" && (
                        <button
                          onClick={() => {
                            setRejecting(p);
                            setReason("");
                          }}
                          className="rounded-lg border border-amber-200 p-2 text-amber-600 hover:bg-amber-50"
                          title="Reject"
                        >
                          <X size={15} />
                        </button>
                      )}
                      <button
                        onClick={() => setDeleting(p)}
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

      {/* Product detail */}
      <Modal open={Boolean(detail)} onClose={() => setDetail(null)} title="Product Review" size="lg">
        {detail && (
          <div className="space-y-4">
            {detail.images?.length > 0 && (
              <div className="flex gap-2 overflow-x-auto">
                {detail.images.map((img) => (
                  <img
                    key={img}
                    src={imageUrl(img)}
                    alt=""
                    className="h-32 w-32 shrink-0 rounded-lg object-cover"
                  />
                ))}
              </div>
            )}

            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{detail.name}</h3>
                <p className="text-sm text-gray-500">{detail.categoryId?.name}</p>
              </div>
              <StatusBadge status={detail.approvalStatus} />
            </div>

            <dl className="grid gap-3 sm:grid-cols-2">
              {[
                ["Farmer", detail.farmerId?.name],
                ["Farmer Email", detail.farmerId?.email],
                ["Price", `${formatCurrency(detail.price)} per ${detail.unit}`],
                ["Quantity", `${detail.quantity} ${detail.unit}`],
                ["Location", detail.location],
                ["Listed On", formatDate(detail.createdAt)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-gray-500">{label}</dt>
                  <dd className="text-sm font-medium text-gray-900">{value || "—"}</dd>
                </div>
              ))}
            </dl>

            {detail.description && (
              <div>
                <p className="text-xs text-gray-500">Description</p>
                <p className="mt-1 text-sm text-gray-700">{detail.description}</p>
              </div>
            )}

            {detail.rejectionReason && (
              <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-3">
                <p className="text-xs font-semibold text-red-800">Rejection Reason</p>
                <p className="mt-0.5 text-sm text-red-700">{detail.rejectionReason}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
              {detail.approvalStatus !== "Rejected" && (
                <button
                  className="btn-outline"
                  onClick={() => {
                    setRejecting(detail);
                    setReason("");
                  }}
                >
                  Reject
                </button>
              )}
              {detail.approvalStatus !== "Approved" && (
                <button className="btn-primary" onClick={() => approve(detail)} disabled={busy}>
                  {busy ? <Loader2 className="animate-spin" size={16} /> : "Approve Product"}
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Reject with reason */}
      <Modal
        open={Boolean(rejecting)}
        onClose={() => setRejecting(null)}
        title="Reject Product"
        size="sm"
      >
        <p className="text-sm text-gray-600">
          Rejecting <span className="font-semibold">{rejecting?.name}</span>. The farmer will see
          your reason and can edit the listing.
        </p>
        <div className="mt-4">
          <label className="label">Rejection Reason *</label>
          <textarea
            rows={3}
            className="input"
            placeholder="e.g. Images are unclear and quality details are missing"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-outline" onClick={() => setRejecting(null)}>
            Cancel
          </button>
          <button className="btn-danger" onClick={reject} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" size={16} /> : "Reject Product"}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        loading={busy}
        title="Delete Product"
        message={`Permanently delete "${deleting?.name}"? Its images will also be removed.`}
        confirmLabel="Delete"
      />
    </div>
  );
};

export default AdminProducts;
