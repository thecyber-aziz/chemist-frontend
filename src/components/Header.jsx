import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, Sparkles } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-4 z-40 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 mb-8 transition-all duration-300">
      <nav className="flex justify-between items-center py-4 px-6 relative overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-sm">
        {/* Decorative thin top line */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-teal-400 via-blue-500 to-purple-500"></div>
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center bg-slate-50 p-2 rounded-2xl shadow-sm border border-slate-200">
            <Pill className="h-6 w-6 text-slate-800" strokeWidth={1.8} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">MedChemist</h1>
          
          <div className="hidden md:flex gap-8 ml-10">
            <button
              onClick={() => navigate('/home')}
              className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors relative group"
            >
              Home
              <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </button>
            <button
              onClick={() => navigate('/billing')}
              className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors relative group"
            >
              Billing
              <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </button>
            <button
              onClick={() => navigate('/add-medicine')}
              className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors relative group"
            >
              Add Medicine
              <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
           {/* Action button Example */}
           <button 
             onClick={() => navigate('/add-medicine')}
             className="hidden md:flex glass-button px-5 py-2.5 items-center gap-2 text-sm font-bold tracking-wide"
           >
             <Sparkles className="h-4 w-4" strokeWidth={2} /> Manage Stock
           </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
