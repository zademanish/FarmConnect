import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Sprout, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../services/api";

const DEMO = [
  ["Admin", "admin@farmconnect.com", "admin123"],
  ["Farmer", "farmer1@farmconnect.com", "farmer123"],
  ["Buyer", "buyer1@farmconnect.com", "buyer123"],
];

const Login = () => {
  const { login, homeFor } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    try {
      const user = await login(values);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(location.state?.from || homeFor(user.role), { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  // One-click fill for the demo accounts, handy during a project demo
  const fillDemo = (email, password) => {
    setValue("email", email);
    setValue("password", password);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-earth-50 px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="rounded-lg bg-primary-600 p-2 text-white">
            <Sprout size={24} />
          </span>
          <span className="text-2xl font-bold text-gray-900">
            Farm<span className="text-primary-600">Connect</span>
          </span>
        </Link>

        <div className="card p-7">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-500">Login to continue to your dashboard</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
            <div>
              <label className="label">Email Address</label>
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
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input pr-10"
                  placeholder="••••••••"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Password must be at least 6 characters" },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>

            <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" size={17} /> : "Login"}
            </button>
          </form>

          <div className="mt-6 rounded-lg bg-gray-50 p-3.5">
            <p className="mb-2 text-xs font-semibold text-gray-600">Demo accounts (click to fill)</p>
            <div className="flex flex-wrap gap-2">
              {DEMO.map(([label, email, password]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => fillDemo(email, password)}
                  className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium hover:border-primary-400 hover:text-primary-700"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-primary-600 hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
