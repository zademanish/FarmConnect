import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { PlusCircle, Pencil, Trash2, FolderTree, Loader2, Upload, X } from "lucide-react";
import { categoryApi } from "../../services/endpoints";
import { imageUrl, getErrorMessage } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { Loader, EmptyState, StatusBadge, Modal, ConfirmDialog, formatDate } from "../../components/ui";

const MAX_SIZE = 2 * 1024 * 1024;

const AdminCategories = () => {
  const toast = useToast();
  const fileRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = closed, {} = new
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const load = useCallback(() => {
    setLoading(true);
    categoryApi
      .list()
      .then(({ data }) => setCategories(data.data))
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => load(), [load]);

  const openForm = (category = null) => {
    setEditing(category || {});
    setPreview(null);
    setImageFile(null);
    reset({
      name: category?.name || "",
      description: category?.description || "",
      status: category?.status || "active",
    });
  };

  const pickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(jpeg|jpg|png|webp)$/.test(file.type)) {
      return toast.error("Only JPG, PNG and WebP images are allowed");
    }
    if (file.size > MAX_SIZE) return toast.error("Image must be under 2MB");
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const save = async (values) => {
    const formData = new FormData();
    Object.entries(values).forEach(([k, v]) => formData.append(k, v));
    if (imageFile) formData.append("image", imageFile);

    try {
      if (editing._id) {
        await categoryApi.update(editing._id, formData);
        toast.success("Category updated successfully");
      } else {
        await categoryApi.create(formData);
        toast.success("Category created successfully");
      }
      setEditing(null);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await categoryApi.remove(deleting._id);
      toast.success("Category deleted successfully");
      setDeleting(null);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const currentImage = preview || (editing?.image && imageUrl(editing.image));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
          <p className="mt-1 text-sm text-gray-500">Organise products into categories</p>
        </div>
        <button onClick={() => openForm()} className="btn-primary">
          <PlusCircle size={17} /> Add Category
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="No categories yet"
          message="Add your first product category."
          action={
            <button onClick={() => openForm()} className="btn-primary">
              <PlusCircle size={16} /> Add Category
            </button>
          }
        />
      ) : (
        <div className="table-wrap">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="th">Category</th>
                <th className="th">Description</th>
                <th className="th">Products</th>
                <th className="th">Created</th>
                <th className="th">Status</th>
                <th className="th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="td">
                    <div className="flex items-center gap-3">
                      {c.image ? (
                        <img
                          src={imageUrl(c.image)}
                          alt=""
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                          <FolderTree size={17} />
                        </span>
                      )}
                      <span className="font-medium text-gray-900">{c.name}</span>
                    </div>
                  </td>
                  <td className="td max-w-xs truncate text-gray-500">{c.description || "—"}</td>
                  <td className="td">{c.productCount}</td>
                  <td className="td text-gray-500">{formatDate(c.createdAt)}</td>
                  <td className="td">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="td">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => openForm(c)}
                        className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleting(c)}
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

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?._id ? "Edit Category" : "Add Category"}
      >
        <form onSubmit={handleSubmit(save)} className="space-y-4" noValidate>
          <div>
            <label className="label">Category Image</label>
            <div className="flex items-center gap-4">
              {currentImage ? (
                <div className="relative">
                  <img src={currentImage} alt="" className="h-20 w-20 rounded-lg object-cover" />
                  {preview && (
                    <button
                      type="button"
                      onClick={() => {
                        setPreview(null);
                        setImageFile(null);
                      }}
                      className="absolute -right-1.5 -top-1.5 rounded-full bg-red-600 p-1 text-white"
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>
              ) : (
                <span className="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-100 text-gray-300">
                  <FolderTree size={26} />
                </span>
              )}
              <button type="button" onClick={() => fileRef.current?.click()} className="btn-outline">
                <Upload size={15} /> Choose Image
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                hidden
                onChange={pickImage}
              />
            </div>
          </div>

          <div>
            <label className="label">Category Name *</label>
            <input
              className="input"
              placeholder="e.g. Vegetables"
              {...register("name", { required: "Category name is required" })}
            />
            {errors.name && <p className="error-text">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              rows={3}
              className="input"
              placeholder="Short description of this category"
              {...register("description")}
            />
          </div>

          <div>
            <label className="label">Status</label>
            <select className="input" {...register("status")}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <p className="mt-1 text-xs text-gray-400">
              Inactive categories are hidden from buyers and farmers.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn-outline" onClick={() => setEditing(null)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={16} />
              ) : editing?._id ? (
                "Update Category"
              ) : (
                "Create Category"
              )}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        loading={busy}
        title="Delete Category"
        message={`Delete "${deleting?.name}"? Categories that still have products cannot be deleted.`}
        confirmLabel="Delete"
      />
    </div>
  );
};

export default AdminCategories;
