import { Link } from "react-router-dom";
import { Sprout, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => (
  <footer className="mt-auto border-t border-gray-200 bg-white">
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-primary-600 p-1.5 text-white">
            <Sprout size={18} />
          </span>
          <span className="font-bold text-gray-900">
            Farm<span className="text-primary-600">Connect</span>
          </span>
        </div>
        <p className="mt-3 text-sm text-gray-500">
          An agricultural marketplace connecting farmers directly with buyers — fair prices, fresh
          produce, no middlemen.
        </p>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900">Quick Links</h4>
        <ul className="mt-3 space-y-2 text-sm text-gray-500">
          {[
            ["/", "Home"],
            ["/products", "Browse Products"],
            ["/categories", "Categories"],
            ["/about", "About Us"],
          ].map(([to, label]) => (
            <li key={to}>
              <Link to={to} className="hover:text-primary-600">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900">For Users</h4>
        <ul className="mt-3 space-y-2 text-sm text-gray-500">
          <li>
            <Link to="/register" className="hover:text-primary-600">
              Register as Farmer
            </Link>
          </li>
          <li>
            <Link to="/register" className="hover:text-primary-600">
              Register as Buyer
            </Link>
          </li>
          <li>
            <Link to="/login" className="hover:text-primary-600">
              Login
            </Link>
          </li>
        </ul>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900">Contact</h4>
        <ul className="mt-3 space-y-2 text-sm text-gray-500">
          <li className="flex items-center gap-2">
            <Mail size={14} /> support@farmconnect.com
          </li>
          <li className="flex items-center gap-2">
            <Phone size={14} /> +91 90000 00001
          </li>
          <li className="flex items-center gap-2">
            <MapPin size={14} /> Pune, Maharashtra
          </li>
        </ul>
      </div>
    </div>

    <div className="border-t border-gray-100 py-5 text-center text-sm text-gray-500">
      © {new Date().getFullYear()} Farm Connect. Academic project.
    </div>
  </footer>
);

export default Footer;
