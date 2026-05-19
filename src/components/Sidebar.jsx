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
    <aside className="hidden md:block fixed inset-y-4 left-4 w-64 rounded-3xl bg-white border-r border-slate-200/70 shadow-none z-10 mx-auto">
      <div className="flex h-full flex-col justify-between overflow-y-auto px-5 py-8 custom-sidebar">
        <div>
          <div className="mb-8 rounded-[2rem] bg-white border border-slate-200 p-5 shadow-sm flex items-center justify-center flex-col transition-all hover:scale-105 duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400"></div>
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-slate-50 text-3xl shadow-sm border border-slate-200 mb-3">
              <Building2 className="h-8 w-8 text-slate-700" strokeWidth={1.8} />
            </div>
            <div className="text-center">
              <p className="text-xl font-extrabold text-slate-900 tracking-tight">Medical</p>
              <p className="mt-1 text-xs font-semibold tracking-wider uppercase text-slate-400">Owner Portal</p>
            </div>
          </div>
          <div className="mb-4 pl-2">
            <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase">Dashboard</h2>
          </div>
          <nav className="space-y-3">
            {navItems.map((item) => (
            (() => {
              const ItemIcon = item.icon;
              return (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `flex items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all duration-300 ${
                  isActive
                      ? 'bg-slate-50 text-black shadow-sm border border-black translate-x-1'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'
                }`
              }
            >
              <ItemIcon className="h-5 w-5" strokeWidth={1.9} />
              <span>{item.name}</span>
              {item.to === '/billing' && cartCount > 0 ? (
                <span className="ml-auto inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-black px-2 text-xs font-bold text-white shadow-sm ring-2 ring-white">
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
          className="mt-6 flex items-center gap-4 rounded-2xl border border-slate-200 px-4 py-3.5 text-sm font-semibold text-slate-500 transition-all duration-300 hover:border-black hover:bg-slate-50 hover:text-black"
        >
          <LogOut className="h-5 w-5" strokeWidth={1.9} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
