import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Sprout, Loader2, Tractor, ShoppingBasket } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../services/api";

const Register = () => {
  const { register: registerUser, homeFor } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { role: "buyer" } });

  const role = watch("role");
  const password = watch("password");

  const onSubmit = async (values) => {
    try {
      const user = await registerUser(values);
      toast.success("Registration successful. Welcome to Farm Connect!");
      navigate(homeFor(user.role), { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const ROLES = [
    { value: "buyer", label: "I want to Buy", hint: "Browse and order produce", icon: ShoppingBasket },
    { value: "farmer", label: "I want to Sell", hint: "List your farm produce", icon: Tractor },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-earth-50 px-4 py-12">
      <div className="w-full max-w-2xl">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="rounded-lg bg-primary-600 p-2 text-white">
            <Sprout size={24} />
          </span>
          <span className="text-2xl font-bold text-gray-900">
            Farm<span className="text-primary-600">Connect</span>
          </span>
        </Link>

        <div className="card p-7">
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="mt-1 text-sm text-gray-500">Join the marketplace in under a minute</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
            {/* Role picker */}
            <div>
              <label className="label">I am registering as</label>
              <div className="grid gap-3 sm:grid-cols-2">
                {ROLES.map(({ value, label, hint, icon: Icon }) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => setValue("role", value)}
                    className={`flex items-center gap-3 rounded-lg border-2 p-3.5 text-left transition ${
                      role === value
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Icon
                      size={22}
                      className={role === value ? "text-primary-600" : "text-gray-400"}
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{label}</p>
                      <p className="text-xs text-gray-500">{hint}</p>
                    </div>
                  </button>
                ))}
              </div>
              <input type="hidden" {...register("role")} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Full Name *</label>
                <input
                  className="input"
                  placeholder="Ramesh Patil"
                  {...register("name", {
                    required: "Full name is required",
                    minLength: { value: 3, message: "Name must be at least 3 characters" },
                  })}
                />
                {errors.name && <p className="error-text">{errors.name.message}</p>}
              </div>

              <div>
                <label className="label">Email *</label>
                <input
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address" },
                  })}
                />
                {errors.email && <p className="error-text">{errors.email.message}</p>}
              </div>

              <div>
                <label className="label">Phone Number *</label>
                <input
                  className="input"
                  placeholder="9876543210"
                  maxLength={10}
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: { value: /^[0-9]{10}$/, message: "Enter a valid 10-digit number" },
                  })}
                />
                {errors.phone && <p className="error-text">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="label">Pincode</label>
                <input
                  className="input"
                  placeholder="411001"
                  maxLength={6}
                  {...register("pincode", {
                    pattern: { value: /^[0-9]{6}$/, message: "Enter a valid 6-digit pincode" },
                  })}
                />
                {errors.pincode && <p className="error-text">{errors.pincode.message}</p>}
              </div>

              <div>
                <label className="label">Password *</label>
                <input
                  type="password"
                  className="input"
                  placeholder="At least 6 characters"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Password must be at least 6 characters" },
                  })}
                />
                {errors.password && <p className="error-text">{errors.password.message}</p>}
              </div>

              <div>
                <label className="label">Confirm Password *</label>
                <input
                  type="password"
                  className="input"
                  placeholder="Re-enter password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (v) => v === password || "Passwords do not match",
                  })}
                />
                {errors.confirmPassword && (
                  <p className="error-text">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="label">Address</label>
                <input className="input" placeholder="House / Street" {...register("address")} />
              </div>

              <div>
                <label className="label">City</label>
                <input className="input" placeholder="Pune" {...register("city")} />
              </div>

              <div>
                <label className="label">State</label>
                <input className="input" placeholder="Maharashtra" {...register("state")} />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" size={17} /> : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary-600 hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
