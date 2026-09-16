import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { MessageSquare, PlusCircle, Loader2 } from "lucide-react";
import { complaintApi, orderApi } from "../services/endpoints";
import { getErrorMessage } from "../services/api";
import { useToast } from "../context/ToastContext";
import { Loader, EmptyState, StatusBadge, Modal, formatDate } from "./ui";

const ComplaintsPage = () => {
  const toast = useToast();
  const [complaints, setComplaints] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([complaintApi.list(), orderApi.list()])
      .then(([c, o]) => {
        setComplaints(c.data.data);
        setOrders(o.data.data);
      })
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => load(), [load]);

  const submit = async (values) => {
    try {
      await complaintApi.create(values);
      toast.success("Complaint submitted. Our admin will respond soon.");
      setOpen(false);
      reset();
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Complaints</h1>
          <p className="mt-1 text-sm text-gray-500">Raise an issue and track the admin's response</p>
        </div>
        <button
          onClick={() => {
            reset();
            setOpen(true);
          }}
          className="btn-primary"
        >
          <PlusCircle size={17} /> New Complaint
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : complaints.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No complaints raised"
          message="If something goes wrong with an order, let us know."
          action={
            <button onClick={() => setOpen(true)} className="btn-primary">
              <PlusCircle size={16} /> Raise a Complaint
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div key={c._id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900">{c.subject}</h3>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {c.orderId ? `Order #${c.orderId.orderNumber} · ` : ""}
                    {formatDate(c.createdAt)}
                  </p>
                </div>
                <StatusBadge status={c.status} />
              </div>

              <p className="mt-3 whitespace-pre-line text-sm text-gray-600">{c.description}</p>

              {c.adminResponse && (
                <div className="mt-4 rounded-lg border-l-4 border-primary-500 bg-primary-50 p-3.5">
                  <p className="text-xs font-semibold text-primary-800">Admin Response</p>
                  <p className="mt-1 text-sm text-primary-900">{c.adminResponse}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Raise a Complaint">
        <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
          <div>
            <label className="label">Related Order (optional)</label>
            <select className="input" {...register("orderId")}>
              <option value="">Not related to a specific order</option>
              {orders.map((o) => (
                <option key={o._id} value={o._id}>
                  #{o.orderNumber} — {o.productId?.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Subject *</label>
            <input
              className="input"
              placeholder="Brief summary of the issue"
              {...register("subject", {
                required: "Subject is required",
                minLength: { value: 5, message: "Subject is too short" },
              })}
            />
            {errors.subject && <p className="error-text">{errors.subject.message}</p>}
          </div>

          <div>
            <label className="label">Description *</label>
            <textarea
              rows={5}
              className="input"
              placeholder="Describe what went wrong in detail"
              {...register("description", {
                required: "Description is required",
                minLength: { value: 10, message: "Please provide more detail" },
              })}
            />
            {errors.description && <p className="error-text">{errors.description.message}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn-outline" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : "Submit Complaint"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ComplaintsPage;
