import React from 'react';
import { getExpiryStatus, formatDate } from '../utils/helpers';

const ExpiryBadge = ({ expiryDate }) => {
  const { text } = getExpiryStatus(expiryDate);

  return (
    <div className="inline-flex flex-col gap-1 items-center px-3 py-1 border border-black bg-white text-black font-sans">
      <span className="text-[10px] font-bold uppercase tracking-widest leading-none">
        {text}
      </span>
      <span className="text-xs font-light leading-none">
        {formatDate(expiryDate)}
      </span>
    </div>
  );
};

export default ExpiryBadge;
