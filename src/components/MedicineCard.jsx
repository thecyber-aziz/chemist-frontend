import React from 'react';
import { formatPrice, formatDate, getExpiryStatus } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';
import ExpiryBadge from './ExpiryBadge';
import { Pill } from 'lucide-react';

const MedicineCard = ({ medicine }) => {
  const navigate = useNavigate();

  return (
    <div
      className="glass-panel group p-5 cursor-pointer relative overflow-hidden transform hover:-translate-y-3 hover:shadow-xl transition-all duration-500 border border-slate-200"
      onClick={() => navigate(`/medicine/${medicine._id}`)}
    >
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-100 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
      <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-teal-100 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>

      <div className="relative z-10 flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-800 to-emerald-600 drop-shadow-sm group-hover:from-emerald-600 group-hover:to-purple-600 transition-all duration-300">
            {medicine.name}
          </h3>
          {medicine.genericName && (
            <p className="text-xs font-bold text-emerald-400 tracking-wider uppercase mt-1">
              {medicine.genericName}
            </p>
          )}
        </div>
        <div className="flex-shrink-0 ml-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 shadow-sm border border-emerald-100 group-hover:scale-110 transition-transform duration-500">
              <Pill className="h-5 w-5 text-emerald-700" strokeWidth={1.9} />
           </span>
        </div>
      </div>

      {medicine.description && (
        <p className="text-sm font-medium text-emerald-500 mb-5 line-clamp-2 leading-relaxed relative z-10">
          {medicine.description}
        </p>
      )}

      <div className="mb-5 relative z-10 p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
        <span className="text-xs font-extrabold tracking-widest text-emerald-400 uppercase">Price</span>
        <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-purple-600 drop-shadow-sm">
          {formatPrice(medicine.price)}
        </p>
      </div>

      <div className="space-y-3 relative z-10 text-sm mb-5">
        <div className="flex justify-between items-center bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
          <span className="font-bold text-emerald-500 text-xs uppercase tracking-wider">Expiry</span>
          <div className="flex items-center gap-2 text-emerald-700 font-semibold">
            <ExpiryBadge expiryDate={medicine.expiryDate} />
            <span className="bg-white px-2 py-0.5 rounded-md shadow-sm border border-slate-200">{formatDate(medicine.expiryDate)}</span>
          </div>
        </div>

        {medicine.dateArrivedInShop && (
          <div className="flex justify-between items-center bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
            <span className="font-bold text-emerald-500 text-xs uppercase tracking-wider">Arrived</span>
            <span className="text-emerald-700 font-semibold bg-white px-2 py-0.5 rounded-md shadow-sm border border-slate-200">
              {formatDate(medicine.dateArrivedInShop)}
            </span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center text-sm relative z-10 mt-auto pt-4 border-t border-slate-200">
        <div className="flex flex-col">
          <span className="text-[10px] font-extrabold tracking-widest text-emerald-400 uppercase mb-1">
            Current Stock
          </span>
          <span className="text-lg font-black text-emerald-700">
            {medicine.stockQuantity} <span className="text-sm font-semibold text-emerald-400">units</span>
          </span>
        </div>

        {medicine.requiresPrescription ? (
          <span className="bg-gradient-to-r from-orange-400 to-rose-400 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md shadow-orange-500/20 loop-pulse border border-white/20">
            Rx Required
          </span>
        ) : (
           <span className="bg-gradient-to-r from-emerald-400 to-teal-400 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md shadow-emerald-500/20 border border-white/20">
             OTC
           </span>
        )}
      </div>
    </div>
  );
};

export default MedicineCard;
