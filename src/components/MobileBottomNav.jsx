import React from 'react';
import { NavLink } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { Home, Plus, FileText } from 'lucide-react';

const navItems = [
  { name: 'Home', icon: Home, to: '/home' },
  { name: 'Add', icon: Plus, to: '/add-medicine' },
  { name: 'Billing', icon: FileText, to: '/billing' },
];

const MobileBottomNav = () => {
  const { cartItems } = useProducts();
  const cartCount = cartItems.length;

  return (
    <nav className="fixed bottom-3 left-3 right-3 z-50 md:hidden rounded-3xl bg-white px-4 py-3 pb-safe flex justify-between items-center border border-slate-200 shadow-lg">
      <div className="flex justify-between w-full h-14 items-center">
        {navItems.map((item) => (
          (() => {
            const ItemIcon = item.icon;
            return (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-[4.5rem] h-14 rounded-[1.25rem] relative transition-colors duration-200 ${
                isActive ? 'text-black bg-slate-50 border border-slate-200' : 'text-slate-400 hover:text-black'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative flex items-center justify-center text-xl">
                  <ItemIcon className="transition-colors duration-200" strokeWidth={1.9} />
                  {item.to === '/billing' && cartCount > 0 && (
                    <span className="absolute -top-1 -right-2 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-black text-[9px] font-bold text-white shadow-xl ring-2 ring-white z-10">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="mt-1 text-[10px] uppercase tracking-widest font-extrabold transition-colors duration-200">
                  {item.name}
                </span>
              </>
            )}
          </NavLink>
            );
          })()
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
