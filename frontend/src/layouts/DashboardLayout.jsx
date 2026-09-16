import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Sprout, Menu, X, LogOut, Home } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { imageUrl } from "../services/api";

// Shared sidebar shell for farmer, buyer and admin dashboards
const DashboardLayout = ({ links, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navClass = ({ isActive }) =>
    `sidebar-link ${isActive ? "sidebar-link-active" : ""}`;

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 px-5">
        <span className="rounded-lg bg-primary-600 p-1.5 text-white">
          <Sprout size={18} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-gray-900">FarmConnect</p>
          <p className="text-xs capitalize text-primary-600">{title}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={navClass} onClick={() => setOpen(false)}>
            <Icon size={17} className="shrink-0" />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="shrink-0 border-t border-gray-200 p-3">
        <div className="mb-2 flex items-center gap-2.5 rounded-lg bg-gray-50 px-3 py-2.5">
          {user?.profileImage ? (
            <img
              src={imageUrl(user.profileImage)}
              alt=""
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
              {user?.name?.[0]?.toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user?.name}</p>
            <p className="truncate text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
        <Link to="/" className="sidebar-link" onClick={() => setOpen(false)}>
          <Home size={17} /> Back to Site
        </Link>
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut size={17} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white lg:block">
        <div className="sticky top-0 h-screen">{sidebar}</div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl">{sidebar}</aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center gap-3 border-b border-gray-200 bg-white px-4 lg:hidden">
          <button onClick={() => setOpen(true)} className="p-1.5">
            <Menu size={22} />
          </button>
          <span className="font-bold">
            Farm<span className="text-primary-600">Connect</span>
          </span>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
