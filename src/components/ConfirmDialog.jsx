import React from 'react';
import { AlertCircle, Trash2 } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isDangerous = false,
  confirmLabel = 'Confirm',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/25 p-4 backdrop-blur-sm font-sans text-slate-900">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-400" />
        <div className="p-6 sm:p-7">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${isDangerous ? 'border-rose-100 bg-rose-50 text-rose-600' : 'border-blue-100 bg-blue-50 text-blue-600'}`}>
              <AlertCircle size={22} strokeWidth={1.8} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">{title}</h2>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Please confirm</p>
            </div>
          </div>
          <p className="mb-8 text-sm font-medium leading-6 text-slate-600">
            {message}
          </p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              onClick={onCancel}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-colors ${isDangerous ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isDangerous && <Trash2 size={16} strokeWidth={2} />}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
