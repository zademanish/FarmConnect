import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { PlusCircle, Pencil, Trash2, Truck, Search, Eye, Loader2 } from "lucide-react";
import { workerApi } from "../../services/endpoints";
import { getErrorMessage } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import {
  Loader, EmptyState, StatusBadge, Modal, ConfirmDialog, formatDate, formatCurrency,
} from "../../components/ui";

const TABS = ["All", "Available", "Busy", "Inactive"];

const AdminWorkers = () => {
  const toast = useToast();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [detail, setDetail] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const load = useCallback(() => {
    setLoading(true);
    workerApi
      .list({ status: tab === "All" ? "" : tab, search })
      .then(({ data }) => setWorkers(data.data))
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, search]);

  useEffect(() => {
    const t = setTimeout(load, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const openForm = (worker = null) => {
    setEditing(worker || {});
    reset({
      name: worker?.name || "",
      email: worker?.email || "",
      phone: worker?.phone || "",
      address: worker?.address || "",
      city: worker?.city || "",
      status: worker?.status || "Available",
    });
  };

  const save = async (values) => {
    try {
      if (editing._id) {
        await workerApi.update(editing._id, values);
        toast.success("Delivery worker updated");
      } else {
        await workerApi.create(values);
        toast.success("Delivery worker added");
      }
      setEditing(null);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const viewDetails = async (worker) => {
    try {
      const { data } = await workerApi.detail(worker._id);
      setDetail(data.data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await workerApi.remove(deleting._id);
      toast.success("Delivery worker deleted");
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Delivery Workers</h1>
          <p className="mt-1 text-sm text-gray-500">
            Only available workers can be assigned to an order
          </p>
        </div>
        <button onClick={() => openForm()} className="btn-primary">
          <PlusCircle size={17} /> Add Worker
        </button>
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
            placeholder="Search workers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : workers.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="No delivery workers"
          message="Add a worker so you can assign them to orders."
          action={
            <button onClick={() => openForm()} className="btn-primary">
              <PlusCircle size={16} /> Add Worker
            </button>
          }
        />
      ) : (
        <div className="table-wrap">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="th">Name</th>
                <th className="th">Contact</th>
                <th className="th">City</th>
                <th className="th">Added</th>
                <th className="th">Status</th>
                <th className="th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {workers.map((w) => (
                <tr key={w._id} className="hover:bg-gray-50">
                  <td className="td">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <Truck size={16} />
                      </span>
                      <span className="font-medium text-gray-900">{w.name}</span>
                    </div>
                  </td>
                  <td className="td">
                    <p>{w.email}</p>
                    <p className="text-xs text-gray-500">{w.phone}</p>
                  </td>
                  <td className="td">{w.city || "—"}</td>
                  <td className="td text-gray-500">{formatDate(w.createdAt)}</td>
                  <td className="td">
                    <StatusBadge status={w.status} />
                  </td>
                  <td className="td">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => viewDetails(w)}
                        className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
                        title="View"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => openForm(w)}
                        className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleting(w)}
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

      {/* Add / edit worker */}
      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?._id ? "Edit Delivery Worker" : "Add Delivery Worker"}
      >
        <form onSubmit={handleSubmit(save)} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Full Name *</label>
              <input
                className="input"
                placeholder="Sandeep Kumar"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && <p className="error-text">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label">Email *</label>
              <input
                type="email"
                className="input"
                placeholder="worker@example.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
                })}
              />
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Phone *</label>
              <input
                className="input"
                maxLength={10}
                placeholder="9876543210"
                {...register("phone", {
                  required: "Phone is required",
                  pattern: { value: /^[0-9]{10}$/, message: "Enter a valid 10-digit number" },
                })}
              />
              {errors.phone && <p className="error-text">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="label">City</label>
              <input className="input" placeholder="Pune" {...register("city")} />
            </div>

            <div>
              <label className="label">Status</label>
              <select className="input" {...register("status")}>
                <option value="Available">Available</option>
                <option value="Busy">Busy</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="label">Address</label>
              <input className="input" placeholder="Depot / residence address" {...register("address")} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn-outline" onClick={() => setEditing(null)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={16} />
              ) : editing?._id ? (
                "Update Worker"
              ) : (
                "Add Worker"
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Worker detail + assigned orders */}
      <Modal open={Boolean(detail)} onClose={() => setDetail(null)} title="Worker Details" size="lg">
        {detail && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Truck size={24} />
              </span>
              <div>
                <p className="font-semibold text-gray-900">{detail.worker.name}</p>
                <p className="text-sm text-gray-500">{detail.worker.email}</p>
                <div className="mt-1">
                  <StatusBadge status={detail.worker.status} />
                </div>
              </div>
            </div>

            <dl className="grid gap-3 sm:grid-cols-2">
              {[
                ["Phone", detail.worker.phone],
                ["City", detail.worker.city],
                ["Address", detail.worker.address],
                ["Added On", formatDate(detail.worker.createdAt)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-gray-500">{label}</dt>
                  <dd className="text-sm font-medium text-gray-900">{value || "—"}</dd>
                </div>
              ))}
            </dl>

            <div>
              <p className="mb-2 text-sm font-semibold text-gray-900">
                Assigned Orders ({detail.orders.length})
              </p>
              {detail.orders.length === 0 ? (
                <p className="rounded-lg bg-gray-50 py-6 text-center text-sm text-gray-500">
                  No orders assigned yet
                </p>
              ) : (
                <div className="max-h-60 space-y-2 overflow-y-auto">
                  {detail.orders.map((o) => (
                    <div
                      key={o._id}
                      className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{o.productId?.name}</p>
                        <p className="text-xs text-gray-500">
                          #{o.orderNumber} · {o.buyerId?.name} · {formatCurrency(o.totalAmount)}
                        </p>
                      </div>
                      <StatusBadge status={o.orderStatus} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        loading={busy}
        title="Delete Delivery Worker"
        message={`Delete ${deleting?.name}? Workers with active orders cannot be deleted.`}
        confirmLabel="Delete"
      />
    </div>
  );
};

export default AdminWorkers;
