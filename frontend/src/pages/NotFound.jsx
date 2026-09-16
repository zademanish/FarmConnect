import { Link } from "react-router-dom";
import { Sprout } from "lucide-react";

const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
    <span className="rounded-2xl bg-primary-50 p-4 text-primary-600">
      <Sprout size={40} />
    </span>
    <h1 className="mt-6 text-5xl font-extrabold text-gray-900">404</h1>
    <p className="mt-2 text-lg font-semibold text-gray-700">Page not found</p>
    <p className="mt-1 text-sm text-gray-500">
      The page you are looking for doesn't exist or has been moved.
    </p>
    <Link to="/" className="btn-primary mt-6">
      Back to Home
    </Link>
  </div>
);

export default NotFound;
