import { Loader2, Inbox, X, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";

export const Loader = ({ label = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
    <Loader2 className="animate-spin text-primary-600" size={32} />
    <p className="text-sm font-medium">{label}</p>
  </div>
);

export const EmptyState = ({ title = "Nothing here yet", message, icon: Icon = Inbox, action }) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
    <Icon className="text-gray-300" size={44} />
    <div>
      <h3 className="font-semibold text-gray-700">{title}</h3>
      {message && <p className="mt-1 text-sm text-gray-500">{message}</p>}
    </div>
    {action}
  </div>
);

// Colour mapping for every status value used across the app
const BADGE_STYLES = {
  Pending: "bg-amber-100 text-amber-700",
  Approved: "bg-primary-100 text-primary-700",
  Rejected: "bg-red-100 text-red-700",
  Accepted: "bg-primary-100 text-primary-700",
  Cancelled: "bg-gray-200 text-gray-600",
  Available: "bg-primary-100 text-primary-700",
  Unavailable: "bg-gray-200 text-gray-600",
  Busy: "bg-amber-100 text-amber-700",
  Inactive: "bg-gray-200 text-gray-600",
  Confirmed: "bg-blue-100 text-blue-700",
  Processing: "bg-indigo-100 text-indigo-700",
  "Ready for Delivery": "bg-purple-100 text-purple-700",
  "Out for Delivery": "bg-orange-100 text-orange-700",
  Delivered: "bg-primary-100 text-primary-700",
  Paid: "bg-primary-100 text-primary-700",
  "Cash on Delivery": "bg-blue-100 text-blue-700",
  Open: "bg-amber-100 text-amber-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Resolved: "bg-primary-100 text-primary-700",
  active: "bg-primary-100 text-primary-700",
  inactive: "bg-gray-200 text-gray-600",
};

export const StatusBadge = ({ status }) => (
  <span
    className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
      BADGE_STYLES[status] || "bg-gray-100 text-gray-600"
    }`}
  >
    {status}
  </span>
);

export const Modal = ({ open, onClose, title, children, size = "md" }) => {
  // Close on Escape, and stop the page behind from scrolling
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  const width = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" }[size];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center">
      <div className={`w-full ${width} rounded-xl bg-white shadow-xl`}>
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
};

export const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  loading,
  // "danger" (default) for destructive actions, "primary" for positive ones like Accept
  tone = "danger",
}) => (
  <Modal open={open} onClose={onClose} title={title} size="sm">
    <div className="flex gap-3">
      <AlertTriangle
        className={`mt-0.5 shrink-0 ${tone === "primary" ? "text-primary-500" : "text-amber-500"}`}
        size={22}
      />
      <p className="text-sm text-gray-600">{message}</p>
    </div>
    <div className="mt-6 flex justify-end gap-2">
      <button className="btn-outline" onClick={onClose} disabled={loading}>
        Cancel
      </button>
      <button
        className={tone === "primary" ? "btn-primary" : "btn-danger"}
        onClick={onConfirm}
        disabled={loading}
      >
        {loading ? <Loader2 className="animate-spin" size={16} /> : confirmLabel}
      </button>
    </div>
  </Modal>
);

export const Pagination = ({ currentPage, totalPages, onChange }) => {
  if (totalPages <= 1) return null;

  // Show a compact window of pages around the current one
  const pages = [];
  const from = Math.max(1, currentPage - 2);
  const to = Math.min(totalPages, from + 4);
  for (let i = from; i <= to; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-1.5 py-6">
      <button
        className="btn-outline px-2.5 py-2"
        disabled={currentPage === 1}
        onClick={() => onChange(currentPage - 1)}
      >
        <ChevronLeft size={16} />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`h-10 w-10 rounded-lg text-sm font-semibold transition ${
            p === currentPage
              ? "bg-primary-600 text-white"
              : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        className="btn-outline px-2.5 py-2"
        disabled={currentPage === totalPages}
        onClick={() => onChange(currentPage + 1)}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export const StatCard = ({ label, value, icon: Icon, tone = "primary" }) => {
  const tones = {
    primary: "bg-primary-50 text-primary-600",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
  };
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className={`rounded-lg p-3 ${tones[tone]}`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

export const Rating = ({ value = 0, count, size = 14 }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <span
        key={n}
        style={{ fontSize: size + 2 }}
        className={n <= Math.round(value) ? "text-amber-400" : "text-gray-300"}
      >
        ★
      </span>
    ))}
    {count !== undefined && <span className="ml-1 text-xs text-gray-500">({count})</span>}
  </div>
);

export const formatCurrency = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
