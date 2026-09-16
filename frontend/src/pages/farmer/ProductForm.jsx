import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Upload, X, Loader2, ArrowLeft, ImageIcon } from "lucide-react";
import { productApi, categoryApi } from "../../services/endpoints";
import { imageUrl, getErrorMessage } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { Loader } from "../../components/ui";

const UNITS = ["KG", "Quintal", "Ton", "Litre", "Dozen", "Piece"];
const MAX_IMAGES = 5;
const MAX_SIZE = 2 * 1024 * 1024;

const ProductForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const fileRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  // Images already saved on the server (edit mode) vs newly picked files
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { unit: "KG", availabilityStatus: "Available" } });

  useEffect(() => {
    categoryApi.list().then(({ data }) => setCategories(data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    productApi
      .detail(id)
      .then(({ data }) => {
        const p = data.data.product;
        reset({
          name: p.name,
          categoryId: p.categoryId?._id,
          description: p.description,
          quantity: p.quantity,
          unit: p.unit,
          price: p.price,
          location: p.location,
          availabilityStatus: p.availabilityStatus,
          availableFrom: p.availableFrom?.slice(0, 10),
        });
        setExistingImages(p.images || []);
      })
      .catch((error) => {
        toast.error(getErrorMessage(error));
        navigate("/farmer/products");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Validate each picked file before adding it to the preview list
  const handleFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    const room = MAX_IMAGES - existingImages.length - newFiles.length;

    if (room <= 0) {
      toast.error(`You can upload at most ${MAX_IMAGES} images`);
      return;
    }

    const valid = [];
    for (const file of picked.slice(0, room)) {
      if (!/^image\/(jpeg|jpg|png|webp)$/.test(file.type)) {
        toast.error(`${file.name}: only JPG, PNG and WebP are allowed`);
        continue;
      }
      if (file.size > MAX_SIZE) {
        toast.error(`${file.name}: image must be under 2MB`);
        continue;
      }
      // Local preview URL, revoked when the image is removed
      valid.push({ file, preview: URL.createObjectURL(file) });
    }

    if (picked.length > room) toast.info(`Only ${room} more image(s) can be added`);
    setNewFiles((prev) => [...prev, ...valid]);
    e.target.value = "";
  };

  const removeNew = (index) => {
    setNewFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const onSubmit = async (values) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== "") formData.append(key, value);
    });
    newFiles.forEach(({ file }) => formData.append("images", file));
    if (isEdit) formData.append("existingImages", JSON.stringify(existingImages));

    try {
      if (isEdit) {
        await productApi.update(id, formData);
        toast.success("Product updated. It will be re-reviewed by the admin.");
      } else {
        await productApi.create(formData);
        toast.success("Product created and sent for admin approval");
      }
      navigate("/farmer/products");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (loading) return <Loader label="Loading product..." />;

  const totalImages = existingImages.length + newFiles.length;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/farmer/products"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600"
      >
        <ArrowLeft size={16} /> Back to My Products
      </Link>

      <h1 className="text-2xl font-bold text-gray-900">
        {isEdit ? "Edit Product" : "Add New Product"}
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        {isEdit
          ? "Edited products go back to the admin for re-approval."
          : "New products stay pending until an admin approves them."}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="card mt-6 space-y-5 p-6" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Product Name *</label>
            <input
              className="input"
              placeholder="e.g. Fresh Tomato"
              {...register("name", {
                required: "Product name is required",
                minLength: { value: 2, message: "Name is too short" },
              })}
            />
            {errors.name && <p className="error-text">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label">Category *</label>
            <select
              className="input"
              {...register("categoryId", { required: "Please select a category" })}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className="error-text">{errors.categoryId.message}</p>}
          </div>

          <div>
            <label className="label">Location *</label>
            <input
              className="input"
              placeholder="e.g. Pune, Maharashtra"
              {...register("location", { required: "Location is required" })}
            />
            {errors.location && <p className="error-text">{errors.location.message}</p>}
          </div>

          <div>
            <label className="label">Quantity *</label>
            <input
              type="number"
              min="1"
              className="input"
              placeholder="500"
              {...register("quantity", {
                required: "Quantity is required",
                min: { value: 1, message: "Quantity must be greater than 0" },
              })}
            />
            {errors.quantity && <p className="error-text">{errors.quantity.message}</p>}
          </div>

          <div>
            <label className="label">Unit *</label>
            <select className="input" {...register("unit", { required: true })}>
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Price per Unit (₹) *</label>
            <input
              type="number"
              min="1"
              step="0.01"
              className="input"
              placeholder="30"
              {...register("price", {
                required: "Price is required",
                min: { value: 1, message: "Price must be greater than 0" },
              })}
            />
            {errors.price && <p className="error-text">{errors.price.message}</p>}
          </div>

          <div>
            <label className="label">Available From</label>
            <input type="date" className="input" {...register("availableFrom")} />
          </div>

          {isEdit && (
            <div>
              <label className="label">Availability</label>
              <select className="input" {...register("availabilityStatus")}>
                <option value="Available">Available</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </div>
          )}

          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea
              rows={4}
              className="input"
              placeholder="Describe quality, farming method, harvest date..."
              {...register("description")}
            />
          </div>
        </div>

        {/* Image upload */}
        <div>
          <label className="label">
            Product Images{" "}
            <span className="font-normal text-gray-400">
              ({totalImages}/{MAX_IMAGES}) · JPG, PNG, WebP · max 2MB each
            </span>
          </label>

          <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {existingImages.map((img) => (
              <div key={img} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200">
                <img src={imageUrl(img)} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setExistingImages((prev) => prev.filter((i) => i !== img))}
                  className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white opacity-0 transition group-hover:opacity-100"
                >
                  <X size={12} />
                </button>
              </div>
            ))}

            {newFiles.map(({ preview }, i) => (
              <div key={preview} className="group relative aspect-square overflow-hidden rounded-lg border-2 border-primary-300">
                <img src={preview} alt="" className="h-full w-full object-cover" />
                <span className="absolute left-1 top-1 rounded bg-primary-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  NEW
                </span>
                <button
                  type="button"
                  onClick={() => removeNew(i)}
                  className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white opacity-0 transition group-hover:opacity-100"
                >
                  <X size={12} />
                </button>
              </div>
            ))}

            {totalImages < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 transition hover:border-primary-400 hover:text-primary-600"
              >
                <Upload size={20} />
                <span className="text-xs font-medium">Upload</span>
              </button>
            )}
          </div>

          {totalImages === 0 && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
              <ImageIcon size={13} /> Products with images get more buyer interest.
            </p>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            hidden
            onChange={handleFiles}
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
          <Link to="/farmer/products" className="btn-outline">
            Cancel
          </Link>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={16} />
            ) : isEdit ? (
              "Update Product"
            ) : (
              "Create Product"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
