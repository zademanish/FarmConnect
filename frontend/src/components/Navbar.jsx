import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Sprout, Menu, X, User, LogOut, LayoutDashboard, ShoppingBag } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { imageUrl } from "../services/api";

const PUBLIC_LINKS = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/categories", label: "Categories" },
  { to: "/about", label: "About" },
];

const Navbar = () => {
  const { user, logout, homeFor } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setMobileOpen(false);
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition ${
      isActive ? "text-primary-700" : "text-gray-600 hover:text-primary-600"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="rounded-lg bg-primary-600 p-1.5 text-white">
            <Sprout size={20} />
          </span>
          <span className="text-lg font-bold text-gray-900">
            Farm<span className="text-primary-600">Connect</span>
          </span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {PUBLIC_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 hover:bg-gray-50"
              >
                {user.profileImage ? (
                  <img
                    src={imageUrl(user.profileImage)}
                    alt=""
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                    {user.name?.[0]?.toUpperCase()}
                  </span>
                )}
                <span className="max-w-[110px] truncate text-sm font-medium">{user.name}</span>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                    <div className="border-b border-gray-100 px-4 py-2.5">
                      <p className="truncate text-sm font-semibold">{user.name}</p>
                      <p className="text-xs capitalize text-primary-600">{user.role}</p>
                    </div>
                    <Link
                      to={homeFor(user.role)}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50"
                    >
                      <LayoutDashboard size={15} /> Dashboard
                    </Link>
                    {user.role === "buyer" && (
                      <Link
                        to="/buyer/orders"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50"
                      >
                        <ShoppingBag size={15} /> My Orders
                      </Link>
                    )}
                    <Link
                      to={user.role === "farmer" ? "/farmer/profile" : "/buyer/profile"}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50"
                    >
                      <User size={15} /> Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 border-t border-gray-100 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-outline">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Register
              </Link>
            </>
          )}
        </div>

        <button className="p-2 md:hidden" onClick={() => setMobileOpen((v) => !v)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {PUBLIC_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-gray-50"
              >
                {l.label}
              </NavLink>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-gray-100 pt-3">
              {user ? (
                <>
                  <Link
                    to={homeFor(user.role)}
                    onClick={() => setMobileOpen(false)}
                    className="btn-outline"
                  >
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="btn-danger">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-outline">
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
