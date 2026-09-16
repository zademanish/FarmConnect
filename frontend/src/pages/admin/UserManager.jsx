import { useCallback, useEffect, useState } from "react";
import { Search, Eye, Power, Trash2, Users } from "lucide-react";
import { adminApi } from "../../services/endpoints";
import { imageUrl, getErrorMessage } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import {
  Loader, EmptyState, StatusBadge, Modal, ConfirmDialog, formatDate, formatCurrency,
} from "../../components/ui";

/** Shared admin table for farmers and buyers — `role` switches the columns. */
const UserManager = ({ role, title, subtitle }) => {
  const toast = useToast();
  const isFarmer = role === "farmer";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [detail, setDetail] = useState(null);
  const [confirm, setConfirm] = useState(null); // { user, action }
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    adminApi
      .users({ role, search, status })
      .then(({ data }) => setUsers(data.data))
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, search, status]);

  useEffect(() => {
    const t = setTimeout(load, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const viewDetails = async (user) => {
    try {
      const { data } = await adminApi.userDetails(user._id);
      setDetail(data.data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const runAction = async () => {
    setBusy(true);
    const { user, action } = confirm;
    try {
      if (action === "toggle") {
        const { data } = await adminApi.toggleStatus(user._id);
        toast.success(data.message);
      } else {
        await adminApi.removeUser(user._id);
        toast.success("User deleted successfully");
      }
      setConfirm(null);
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
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            className="input pl-9"
            placeholder="Search by name, email, phone or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input sm:w-40" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : users.length === 0 ? (
        <EmptyState icon={Users} title={`No ${role}s found`} message="Try a different search." />
      ) : (
        <div className="table-wrap">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="th">Name</th>
                <th className="th">Contact</th>
                <th className="th">Location</th>
                {isFarmer ? (
                  <>
                    <th className="th">Farm Name</th>
                    <th className="th">Products</th>
                  </>
                ) : (
                  <th className="th">Orders</th>
                )}
                <th className="th">Joined</th>
                <th className="th">Status</th>
                <th className="th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="td">
                    <div className="flex items-center gap-3">
                      {u.profileImage ? (
                        <img
                          src={imageUrl(u.profileImage)}
                          alt=""
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                          {u.name?.[0]?.toUpperCase()}
                        </span>
                      )}
                      <span className="font-medium text-gray-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="td">
                    <p>{u.email}</p>
                    <p className="text-xs text-gray-500">{u.phone}</p>
                  </td>
                  <td className="td">{[u.city, u.state].filter(Boolean).join(", ") || "—"}</td>
                  {isFarmer ? (
                    <>
                      <td className="td">{u.farmName || "—"}</td>
                      <td className="td">{u.totalProducts ?? 0}</td>
                    </>
                  ) : (
                    <td className="td">{u.totalOrders ?? 0}</td>
                  )}
                  <td className="td text-gray-500">{formatDate(u.createdAt)}</td>
                  <td className="td">
                    <StatusBadge status={u.status} />
                  </td>
                  <td className="td">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => viewDetails(u)}
                        className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
                        title="View details"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => setConfirm({ user: u, action: "toggle" })}
                        className={`rounded-lg border p-2 ${
                          u.status === "active"
                            ? "border-amber-200 text-amber-600 hover:bg-amber-50"
                            : "border-primary-200 text-primary-600 hover:bg-primary-50"
                        }`}
                        title={u.status === "active" ? "Deactivate" : "Activate"}
                      >
                        <Power size={15} />
                      </button>
                      <button
                        onClick={() => setConfirm({ user: u, action: "delete" })}
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

      {/* Details modal */}
      <Modal
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={`${isFarmer ? "Farmer" : "Buyer"} Details`}
        size="lg"
      >
        {detail && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              {detail.user.profileImage ? (
                <img
                  src={imageUrl(detail.user.profileImage)}
                  alt=""
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-xl font-bold text-primary-700">
                  {detail.user.name?.[0]?.toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">{detail.user.name}</p>
                <p className="truncate text-sm text-gray-500">{detail.user.email}</p>
                <div className="mt-1">
                  <StatusBadge status={detail.user.status} />
                </div>
              </div>
            </div>

            <dl className="grid gap-3 sm:grid-cols-2">
              {[
                ["Phone", detail.user.phone],
                ["City", detail.user.city],
                ["State", detail.user.state],
                ["Pincode", detail.user.pincode],
                ["Address", detail.user.address],
                ["Joined", formatDate(detail.user.createdAt)],
                ...(isFarmer
                  ? [
                      ["Farm Name", detail.profile?.farmName],
                      ["Farm Location", detail.profile?.farmLocation],
                      ["Total Land", detail.profile?.totalLand],
                    ]
                  : []),
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-gray-500">{label}</dt>
                  <dd className="text-sm font-medium text-gray-900">{value || "—"}</dd>
                </div>
              ))}
            </dl>

            {isFarmer && detail.profile?.about && (
              <div>
                <p className="text-xs text-gray-500">About</p>
                <p className="mt-1 text-sm text-gray-700">{detail.profile.about}</p>
              </div>
            )}

            {isFarmer && detail.products?.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-semibold text-gray-900">
                  Products ({detail.products.length})
                </p>
                <div className="max-h-52 space-y-2 overflow-y-auto">
                  {detail.products.map((p) => (
                    <div
                      key={p._id}
                      className="flex items-center justify-between rounded-lg border border-gray-100 p-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatCurrency(p.price)}/{p.unit} · {p.quantity} in stock
                        </p>
                      </div>
                      <StatusBadge status={p.approvalStatus} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detail.orders?.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-semibold text-gray-900">Recent Orders</p>
                <div className="max-h-52 space-y-2 overflow-y-auto">
                  {detail.orders.map((o) => (
                    <div
                      key={o._id}
                      className="flex items-center justify-between rounded-lg border border-gray-100 p-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{o.productId?.name}</p>
                        <p className="text-xs text-gray-500">
                          #{o.orderNumber} · {formatCurrency(o.totalAmount)}
                        </p>
                      </div>
                      <StatusBadge status={o.orderStatus} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={runAction}
        loading={busy}
        title={confirm?.action === "delete" ? "Delete User" : "Change Account Status"}
        confirmLabel={
          confirm?.action === "delete"
            ? "Delete"
            : confirm?.user?.status === "active"
            ? "Deactivate"
            : "Activate"
        }
        message={
          confirm?.action === "delete"
            ? `Permanently delete ${confirm?.user?.name}? This removes their products, requests and reviews. Users with active orders cannot be deleted.`
            : `${confirm?.user?.status === "active" ? "Deactivate" : "Activate"} ${
                confirm?.user?.name
              }? ${
                confirm?.user?.status === "active"
                  ? "They will not be able to log in."
                  : "They will be able to log in again."
              }`
        }
      />
    </div>
  );
};

export default UserManager;
