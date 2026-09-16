import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Camera, Loader2, KeyRound } from "lucide-react";
import { userApi, authApi } from "../services/endpoints";
import { imageUrl, getErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const MAX_SIZE = 2 * 1024 * 1024;

/** Shared profile editor. Farmers get the extra farm fields. */
const ProfileForm = ({ withFarmFields = false }) => {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const fileRef = useRef(null);

  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const profileForm = useForm();
  const passwordForm = useForm();

  // Load the current values (farmers also need their farm profile)
  useEffect(() => {
    authApi.me().then(({ data }) => {
      const { user: u, farmerProfile } = data.data;
      profileForm.reset({
        name: u.name,
        phone: u.phone,
        address: u.address,
        city: u.city,
        state: u.state,
        pincode: u.pincode,
        farmName: farmerProfile?.farmName || "",
        farmLocation: farmerProfile?.farmLocation || "",
        about: farmerProfile?.about || "",
        totalLand: farmerProfile?.totalLand || "",
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const saveProfile = async (values) => {
    const formData = new FormData();
    Object.entries(values).forEach(([k, v]) => v !== undefined && formData.append(k, v));
    if (imageFile) formData.append("profileImage", imageFile);

    try {
      const { data } = await userApi.updateProfile(formData);
      updateUser(data.data.user);
      setImageFile(null);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const changePassword = async (values) => {
    try {
      await userApi.changePassword(values);
      toast.success("Password changed successfully");
      passwordForm.reset();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const { register, handleSubmit, formState: { errors, isSubmitting } } = profileForm;
  const pw = passwordForm;
  const avatar = preview || (user?.profileImage && imageUrl(user.profileImage));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account information</p>
      </div>

      <form onSubmit={handleSubmit(saveProfile)} className="card space-y-5 p-6" noValidate>
        {/* Avatar */}
        <div className="flex items-center gap-5 border-b border-gray-100 pb-5">
          <div className="relative">
            {avatar ? (
              <img src={avatar} alt="" className="h-20 w-20 rounded-full object-cover" />
            ) : (
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-2xl font-bold text-primary-700">
                {user?.name?.[0]?.toUpperCase()}
              </span>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 rounded-full bg-primary-600 p-2 text-white shadow hover:bg-primary-700"
              title="Change photo"
            >
              <Camera size={14} />
            </button>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <p className="mt-0.5 text-xs capitalize text-primary-600">{user?.role}</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            hidden
            onChange={pickImage}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Full Name *</label>
            <input
              className="input"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && <p className="error-text">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label">Email</label>
            <input className="input" value={user?.email || ""} disabled />
            <p className="mt-1 text-xs text-gray-400">Email cannot be changed</p>
          </div>

          <div>
            <label className="label">Phone *</label>
            <input
              className="input"
              maxLength={10}
              {...register("phone", {
                required: "Phone is required",
                pattern: { value: /^[0-9]{10}$/, message: "Enter a valid 10-digit number" },
              })}
            />
            {errors.phone && <p className="error-text">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="label">Pincode</label>
            <input
              className="input"
              maxLength={6}
              {...register("pincode", {
                pattern: { value: /^[0-9]{6}$/, message: "Enter a valid 6-digit pincode" },
              })}
            />
            {errors.pincode && <p className="error-text">{errors.pincode.message}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className="label">Address</label>
            <input className="input" {...register("address")} />
          </div>

          <div>
            <label className="label">City</label>
            <input className="input" {...register("city")} />
          </div>

          <div>
            <label className="label">State</label>
            <input className="input" {...register("state")} />
          </div>

          {withFarmFields && (
            <>
              <div className="sm:col-span-2 border-t border-gray-100 pt-4">
                <h3 className="font-semibold text-gray-900">Farm Details</h3>
              </div>
              <div>
                <label className="label">Farm Name</label>
                <input className="input" placeholder="e.g. Patil Organic Farms" {...register("farmName")} />
              </div>
              <div>
                <label className="label">Farm Location</label>
                <input className="input" placeholder="e.g. Baramati, Pune" {...register("farmLocation")} />
              </div>
              <div>
                <label className="label">Total Land</label>
                <input className="input" placeholder="e.g. 12 Acres" {...register("totalLand")} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">About Your Farm</label>
                <textarea
                  rows={4}
                  className="input"
                  placeholder="Tell buyers about your farming practices, experience and specialities"
                  {...register("about")}
                />
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end border-t border-gray-100 pt-5">
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : "Save Changes"}
          </button>
        </div>
      </form>

      {/* Password */}
      <form onSubmit={pw.handleSubmit(changePassword)} className="card space-y-4 p-6" noValidate>
        <h2 className="flex items-center gap-2 font-semibold text-gray-900">
          <KeyRound size={17} /> Change Password
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Current Password *</label>
            <input
              type="password"
              className="input"
              {...pw.register("currentPassword", { required: "Current password is required" })}
            />
            {pw.formState.errors.currentPassword && (
              <p className="error-text">{pw.formState.errors.currentPassword.message}</p>
            )}
          </div>
          <div>
            <label className="label">New Password *</label>
            <input
              type="password"
              className="input"
              {...pw.register("newPassword", {
                required: "New password is required",
                minLength: { value: 6, message: "Password must be at least 6 characters" },
              })}
            />
            {pw.formState.errors.newPassword && (
              <p className="error-text">{pw.formState.errors.newPassword.message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn-outline" disabled={pw.formState.isSubmitting}>
            {pw.formState.isSubmitting ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              "Update Password"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
