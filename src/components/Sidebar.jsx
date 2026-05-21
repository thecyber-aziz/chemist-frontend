import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { Home, Plus, FileText, Building2, LogOut } from 'lucide-react';

const navItems = [
  { name: 'Home', icon: Home, to: '/home' },
  { name: 'Add', icon: Plus, to: '/add-medicine' },
  { name: 'Billing', icon: FileText, to: '/billing' },
];

const Sidebar = () => {
  const { cartItems } = useProducts();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const cartCount = cartItems.length;

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="hidden md:block fixed inset-y-4 left-4 w-64 rounded-2xl bg-white border border-slate-200 shadow-sm z-10">
      <div className="flex h-full flex-col justify-between overflow-y-auto px-6 py-8 custom-sidebar">
        <div>
          <div className="mb-8 rounded-2xl bg-gradient-to-br from-blue-50 via-white to-sky-50 border border-blue-200 p-6 shadow-sm flex items-center justify-center flex-col transition-all hover:shadow-md hover:-translate-y-1 duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-sky-400 to-blue-500"></div>
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white text-3xl shadow-sm border border-blue-200 mb-4">
              <Building2 className="h-8 w-8 text-blue-600" strokeWidth={2} />
            </div>
            <div className="text-center">
              <p className="text-xl font-black text-slate-900 tracking-tight">Medical</p>
              <p className="mt-1 text-xs font-bold tracking-widest uppercase text-blue-600">Owner Portal</p>
            </div>
          </div>
          <div className="mb-5 pl-1">
            <h2 className="text-xs font-bold tracking-widest text-slate-500 uppercase">Dashboard</h2>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => (
            (() => {
              const ItemIcon = item.icon;
              return (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300 ${
                  isActive
                      ? 'bg-gradient-to-r from-blue-100 to-sky-100 text-blue-700 shadow-sm border border-blue-300 translate-x-1'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-transparent hover:border-slate-200'
                }`
              }
            >
              <ItemIcon className="h-5 w-5 text-blue-600" strokeWidth={2} />
              <span>{item.name}</span>
              {item.to === '/billing' && cartCount > 0 ? (
                <span className="ml-auto inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-blue-600 px-2 text-xs font-bold text-white shadow-sm border border-blue-700">
                  {cartCount}
                </span>
              ) : null}
            </NavLink>
              );
            })()
          ))}
        </nav>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-8 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition-all duration-300 hover:border-red-300 hover:bg-red-100 hover:text-red-700 shadow-sm hover:shadow-md"
        >
          <LogOut className="h-5 w-5" strokeWidth={2} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
